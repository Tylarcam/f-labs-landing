import { useCallback } from 'react';
import { NetworkNode, NodeStatus, GameMode } from '../types/game.types';
import { useGameLogic } from './useGameLogic';
import { GameBalanceManager } from '../game/GameBalanceManager';
import { ThreatManager } from '../game/ThreatManager';
import { TUTORIAL_STEPS } from '../utils/constants';

export const useNodeInteraction = () => {
  const {
    gameState,
    networkNodes,
    setNetworkNodes,
    setActionState,
    addActionLog,
    setCooldown,
    isActionOnCooldown,
    updateResources,
    updateGameState,
    isTutorialActive,
    tutorialStep,
    updateTutorialProgress,
    completeTutorial,
    objectiveManager,
    scoringManager,
    threatManager,
    balanceManager,
    updateNodeStateTimer,
    clearNodeStateTimer
  } = useGameLogic();

  const executeAction = useCallback(async (action: string, targetNode: NetworkNode) => {
    const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';
    const costs = balanceManager.getResourceCosts(action, mode);

    // Check resources
    if (gameState.resources.energy < costs.energy || 
        gameState.resources.bandwidth < costs.bandwidth || 
        gameState.resources.processing < costs.processing) {
      addActionLog(`Insufficient resources for ${action}`);
      setActionState({
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      });
      return;
    }

    // Check cooldown
    if (isActionOnCooldown(action)) {
      addActionLog(`${action} is on cooldown`);
      setActionState({
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      });
      return;
    }

    // Set action state to executing
    setActionState({
      mode: 'EXECUTING',
      currentAction: action,
      targetNodeId: targetNode.id,
      cooldownEndTime: null
    });

    try {
      // Deduct resources
      updateResources('energy', -costs.energy);
      updateResources('bandwidth', -costs.bandwidth);
      updateResources('processing', -costs.processing);

      // Set cooldown
      const cooldownDuration = balanceManager.getActionCooldown(action, mode);
      setCooldown(action, cooldownDuration);

      // Calculate success probability
      const successProbability = balanceManager.calculateSuccessProbability(
        action,
        mode,
        targetNode.type,
        targetNode.status,
        targetNode.defense
      );

      // Determine if action succeeds
      const isSuccessful = Math.random() < successProbability;

      // Update node status based on action and success
      let newStatus: NodeStatus = targetNode.status;
      
      if (isSuccessful) {
        if (mode === 'WHITE_HAT') {
          switch (action) {
            case 'PATCH_ALL':
              if (targetNode.status === 'vulnerable') {
                newStatus = 'secure';
              } else if (targetNode.status === 'compromised') {
                newStatus = 'quarantined';
              }
              break;
            case 'QUARANTINE':
              if (targetNode.status === 'compromised' || targetNode.status === 'breached') {
                newStatus = 'quarantined';
              }
              break;
            case 'MONITOR':
              if (targetNode.status === 'active' || targetNode.status === 'vulnerable') {
                newStatus = 'monitoring';
              }
              break;
            case 'BACKUP':
              if (targetNode.status === 'active' || targetNode.status === 'secure') {
                newStatus = 'backed_up';
              }
              break;
          }
        } else { // BLACK_HAT
          switch (action) {
            case 'SCAN_TARGETS':
              if (targetNode.status === 'active' || targetNode.status === 'secure') {
                newStatus = 'vulnerable';
              }
              break;
            case 'EXPLOIT':
              if (targetNode.status === 'vulnerable') {
                newStatus = 'compromised';
              } else if (targetNode.status === 'compromised') {
                newStatus = 'breached';
              }
              break;
            case 'BACKDOOR':
              if (targetNode.status === 'compromised') {
                newStatus = 'breached';
              }
              break;
            case 'DENIAL_OF_SERVICE':
              if (targetNode.status === 'active' || targetNode.status === 'secure') {
                newStatus = 'overloaded';
              } else if (targetNode.status === 'overloaded') {
                newStatus = 'degraded';
              }
              break;
          }
        }
      }

      // Update node status if changed
      if (newStatus !== targetNode.status) {
        setNetworkNodes(prev => 
          prev.map(n => 
            n.id === targetNode.id 
              ? { 
                  ...n,
                  status: newStatus,
                  feedbackStatus: isSuccessful ? 'success' : 'failure',
                  feedbackEndTime: Date.now() + 1000
                } 
              : n
          )
        );
      }
      
      // Log the action result
      addActionLog(`${action} executed on ${targetNode.name}: ${isSuccessful ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
      console.error('Error executing action:', error);
      addActionLog('Error executing action');
      
      // Show failure feedback
      setNetworkNodes(prev => 
        prev.map(n => 
          n.id === targetNode.id 
            ? { 
                ...n, 
                feedbackStatus: 'failure',
                feedbackEndTime: Date.now() + 1000
              } 
            : n
        )
      );
    } finally {
      // Reset action state after action attempt (success or failure)
      setActionState({
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      });
    }
  }, [gameState, setActionState, addActionLog, setCooldown, isActionOnCooldown, updateResources, balanceManager, threatManager, setNetworkNodes, isTutorialActive, tutorialStep, updateGameState]);

  const handleNodeClick = useCallback((node: NetworkNode) => {
    if (!gameState.isGameStarted) return;

    // 1. Handle action targeting first if an action is selected
    if (gameState.actionState.mode === 'SELECTING_TARGET') {
      const action = gameState.actionState.currentAction;
      if (!action) {
        console.error('Action state is SELECTING_TARGET but currentAction is null.');
        setActionState({
            mode: 'IDLE',
            currentAction: null,
            targetNodeId: null,
            cooldownEndTime: null
        });
        return;
      }

      const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';

      // Check if node is a valid target for the selected action
      if (threatManager.isValidTarget(node, mode, action)) {
        // Check if in tutorial and this action/target combo is the required next step
        let isTutorialActionStep = false;
        if (isTutorialActive) {
            const currentStepData = TUTORIAL_STEPS.find(step => step.id === tutorialStep);
             if (currentStepData && 
                (currentStepData.action === 'PERFORM_ACTION' || (currentStepData.action === 'SELECT_NODE' && currentStepData.targetAction === action)) &&
                currentStepData.targetNodeId === node.id &&
                (currentStepData.requiredStatus === undefined || node.status === currentStepData.requiredStatus)
               ) 
             {
                isTutorialActionStep = true;
             }
        }

        // Execute the action
        executeAction(action, node);

        // If it was a tutorial action step, advance the tutorial *after* action execution
        if (isTutorialActionStep && tutorialStep < TUTORIAL_STEPS.length) {
             const nextStep = tutorialStep + 1;
            // Use updateTutorialProgress from useGameLogic
             updateTutorialProgress(nextStep, TUTORIAL_STEPS[nextStep - 1]?.text || null);
             addActionLog(`Tutorial Step ${tutorialStep} Complete: ${action} on ${node.name}.`); // Log tutorial progress
        }

        return;
      } else {
        addActionLog(`Invalid target for ${action} on ${node.name}.`);
        setActionState({
            mode: 'IDLE',
            currentAction: null,
            targetNodeId: null,
            cooldownEndTime: null
        });
        return;
      }
    }

    // 2. Handle tutorial-specific node clicks that are NOT action targeting (e.g., simple selection)
    if (isTutorialActive) {
         const currentStepData = TUTORIAL_STEPS.find(step => step.id === tutorialStep);
        // Tutorial Step 1: Select WEB-01
        if (currentStepData?.action === 'SELECT_NODE' && currentStepData.targetNodeId === node.id && tutorialStep === 1) {
            // Use updateTutorialProgress from useGameLogic
             updateTutorialProgress(2, TUTORIAL_STEPS[1]?.text || null);
            addActionLog('Tutorial Step 1 Complete: WEB-01 Selected.');
            return;
        }
         addActionLog('Tutorial: Please select an action first or follow tutorial instructions.');
         return;
    }

    // 3. Handle normal node selection (when not in tutorial or action targeting mode)
     setNetworkNodes(prev => 
        prev.map(n => ({
            ...n,
            isSelected: n.id === node.id ? !n.isSelected : false
        }))
    );
    addActionLog(`Selected node: ${node.name}`);

  }, [gameState, isTutorialActive, tutorialStep, addActionLog, executeAction, threatManager, setNetworkNodes, updateTutorialProgress]);

  const shouldTrackDuration = useCallback((status: NodeStatus, mode: GameMode): boolean => {
    if (mode === 'WHITE_HAT') {
      return status === 'monitoring';
    } else {
      return status === 'compromised' || status === 'breached';
    }
  }, []);

  return {
    handleNodeClick,
    executeAction
  };
}; 
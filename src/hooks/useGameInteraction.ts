import { useState, useCallback } from 'react';
import { NetworkNode, GameMode } from '../types/game';
import { useGameState } from './useGameState';
import { GameBalanceManager } from '../game/GameBalanceManager';
import { ThreatManager } from '../game/ThreatManager';

export const useGameInteraction = () => {
  const {
    gameState,
    updateGameState,
    addActionLog,
    setActionState,
    setCooldown,
    isActionOnCooldown,
    updateNodeStateTimer,
    clearNodeStateTimer,
    updateResources
  } = useGameState();

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [actionTarget, setActionTarget] = useState<NetworkNode | null>(null);

  const balanceManager = GameBalanceManager.getInstance();
  const threatManager = ThreatManager.getInstance();

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

    try {
      // Set action state to executing
      setActionState({
        mode: 'EXECUTING',
        currentAction: action,
        targetNodeId: targetNode.id,
        cooldownEndTime: null
      });

      // Deduct resources
      updateResources('energy', -costs.energy);
      updateResources('bandwidth', -costs.bandwidth);
      updateResources('processing', -costs.processing);

      // Calculate success rate
      const successRate = calculateActionSuccessRate(action, mode);
      const isSuccessful = Math.random() * 100 < successRate;

      // Update node status based on action and success
      let newStatus = targetNode.status;
      let chainEffects: { nodeId: number; newStatus: string }[] = [];

      if (isSuccessful) {
        if (mode === 'WHITE_HAT') {
          switch (action) {
            case 'PATCH_ALL':
              newStatus = 'secure';
              break;
            case 'QUARANTINE':
              newStatus = 'quarantined';
              break;
            case 'BACKUP':
              newStatus = 'backed_up';
              break;
            case 'MONITOR':
              newStatus = 'monitoring';
              break;
          }
        } else {
          switch (action) {
            case 'SCAN_TARGETS':
              newStatus = 'vulnerable';
              break;
            case 'EXPLOIT':
              newStatus = 'compromised';
              break;
            case 'BACKDOOR':
              newStatus = 'breached';
              break;
            case 'DENIAL_OF_SERVICE':
              newStatus = 'overloaded';
              break;
          }
        }
      }

      // Update node status
      if (newStatus !== targetNode.status) {
        updateNodeStateTimer(targetNode.id, newStatus);
        addActionLog(`${action} on ${targetNode.name}: ${isSuccessful ? 'SUCCESS' : 'FAILED'}`);
      }

      // Set cooldown
      const cooldownTime = balanceManager.getActionCooldown(action, mode);
      setCooldown(action, cooldownTime);

    } catch (error) {
      console.error('Error executing action:', error);
      addActionLog('Error executing action');
    } finally {
      setActionState({
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      });
    }
  }, [gameState, setActionState, addActionLog, setCooldown, isActionOnCooldown, updateNodeStateTimer, updateResources, balanceManager]);

  const handleNodeSelection = useCallback((node: NetworkNode) => {
    setSelectedNode(node);
    addActionLog(`Selected node: ${node.name}`);
  }, [addActionLog]);

  const handleActionTargeting = useCallback((node: NetworkNode) => {
    if (!gameState.actionState.currentAction) return;
    
    setActionTarget(node);
    executeAction(gameState.actionState.currentAction, node);
  }, [gameState.actionState.currentAction, executeAction]);

  const calculateActionSuccessRate = (action: string, mode: GameMode): number => {
    const baseRate = 50;
    let modifier = 0;

    // Resource availability modifier
    const costs = balanceManager.getResourceCosts(action, mode);
    const resourceRatio = Math.min(
      gameState.resources.energy / costs.energy,
      gameState.resources.bandwidth / costs.bandwidth,
      gameState.resources.processing / costs.processing
    );
    modifier += Math.floor(resourceRatio * 20);

    // Node status modifier
    if (selectedNode) {
      switch (action) {
        case 'PATCH_ALL':
          modifier += selectedNode.status === 'vulnerable' ? 15 : -10;
          break;
        case 'QUARANTINE':
          modifier += selectedNode.status === 'compromised' ? 20 : -15;
          break;
        case 'EXPLOIT':
          modifier += selectedNode.status === 'vulnerable' ? 25 : -20;
          break;
        case 'BACKDOOR':
          modifier += selectedNode.status === 'compromised' ? 30 : -25;
          break;
      }
    }

    return Math.max(0, Math.min(100, baseRate + modifier));
  };

  return {
    selectedNode,
    actionTarget,
    handleNodeSelection,
    handleActionTargeting,
    executeAction,
    calculateActionSuccessRate
  };
}; 
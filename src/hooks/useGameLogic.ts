import { useState, useCallback, useEffect } from 'react';
import { GameState, NodeStatus, SystemStatus, GameMode } from '../types/game.types';
import { GameBalanceManager } from '../game/GameBalanceManager';
import { ObjectiveManager } from '../game/ObjectiveManager';
import { ScoringManager } from '../game/ScoringManager';
import { ThreatManager } from '../game/ThreatManager';
import { WHITE_HAT_ACTIONS, BLACK_HAT_ACTIONS } from '../components/game/ActionPanel';

const INITIAL_STATE: GameState = {
  mode: 'IDLE',
  playMode: 'GAME',
  isWhiteHat: true,
  isTransitioning: false,
  isGameStarted: false,
  resources: {
    energy: 100,
    bandwidth: 100,
    processing: 100,
  },
  cooldowns: {},
  actionState: {
    mode: 'IDLE',
    currentAction: null,
    targetNodeId: null,
    cooldownEndTime: null,
  },
  systemStatus: 'IDLE',
  targetStatus: {
    firewall: 'ACTIVE',
    encryption: 'MAXIMUM',
    accessControl: 'ENFORCED',
    systemIntegrity: 100,
  },
  selectedNodeId: null,
  nodeStateTimers: {},
  actionLogs: [],
  terminalLines: [],
  progress: 0,
  particleActivityLevel: 'normal',
  missionState: {
    currentMissionId: null,
    timeRemaining: 0,
    objectivesCompleted: 0,
    totalObjectives: 0,
    missionType: 'DEFEND_CRITICAL',
    difficulty: 'MEDIUM',
    rewards: {
      score: 0,
      title: '',
    },
  },
  networkState: {
    totalNodes: 0,
    secureNodes: 0,
    compromisedNodes: 0,
    vulnerableNodes: 0,
    criticalPathNodes: [],
    isolatedNodes: [],
  },
  threatState: {
    activeThreats: 0,
    blockedThreats: 0,
    threatLevel: 'LOW',
    lastThreatTime: 0,
  },
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameBalance] = useState(() => GameBalanceManager.getInstance());
  const [objectiveManager] = useState(() => ObjectiveManager.getInstance());
  const [scoringManager] = useState(() => ScoringManager.getInstance());
  const [threatManager] = useState(() => ThreatManager.getInstance());

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const startGame = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      mode: 'PLAYING',
      isWhiteHat: mode === 'WHITE_HAT',
      isGameStarted: true,
      systemStatus: mode === 'WHITE_HAT' ? 'SECURING' : 'ATTACKING',
    }));

    objectiveManager.initializeObjectives(mode);
    scoringManager.resetScore();
    threatManager.reset();
  }, [objectiveManager, scoringManager, threatManager]);

  const handleAction = useCallback((actionId: string, targetNodeId: number) => {
    const actions = gameState.isWhiteHat ? WHITE_HAT_ACTIONS : BLACK_HAT_ACTIONS;
    const action = actions.find(a => a.id === actionId);
    
    if (!action) return;

    const now = Date.now();
    if (gameState.cooldowns[actionId] && now < gameState.cooldowns[actionId]) {
      // Add log for cooldown
      updateGameState({
        actionLogs: [...gameState.actionLogs, `Action ${action.name} is on cooldown.`]
      });
      return;
    }

    // Check resource costs
    const canAfford = Object.entries(action.cost).every(([resource, amount]) => 
      gameState.resources[resource as keyof typeof gameState.resources] >= amount
    );

    if (!canAfford) {
      updateGameState({
        actionLogs: [...gameState.actionLogs, `Insufficient resources for ${action.name}`],
      });
      return;
    }

    // Deduct resources
    const newResources = { ...gameState.resources };
    Object.entries(action.cost).forEach(([resource, amount]) => {
      newResources[resource as keyof typeof newResources] -= amount;
    });

    let newState = { ...gameState, resources: newResources };
    
    // Set cooldown
    newState.cooldowns = {
      ...gameState.cooldowns,
      [actionId]: now + action.cooldown * 1000,
    };

    // Apply action effects
    action.effects.forEach(effect => {
      switch (effect.target) {
        case 'node':
          if (targetNodeId !== null) {
            // Logic to apply effect to a specific node (e.g., change status, vulnerability)
            // This will depend on how nodes are managed. Assuming a node status update for now.
            if (effect.type === 'status') {
               // Need actual node state management here, not just timers
               // For now, we'll use the timer as an indicator of active state
               newState.nodeStateTimers = {
                 ...newState.nodeStateTimers,
                 [targetNodeId]: { status: effect.value as NodeStatus, startTime: now },
               };
            } else if (effect.type === 'vulnerability') {
                // Logic to update node vulnerability
                // Requires node structure to have vulnerability property
            }
          }
          break;
        case 'system':
          // Logic to apply effect to the overall system (e.g., integrity, firewall status)
          if (effect.type === 'status') {
             if (effect.value === 'COMPROMISED') {
                newState.targetStatus.firewall = 'COMPROMISED';
             }
             // Add other system status effects here
          } else if (effect.type === 'vulnerability') {
              // Logic to update system vulnerability
          } else if (effect.type === 'resource') {
              // Logic to add/subtract resources from system
              // This seems redundant with action cost deduction, re-evaluate purpose
          }
          break;
        case 'global':
          // Logic to apply effect globally (e.g., change threat level, add resources)
           if (effect.type === 'resource') {
              // Logic to add resources
              const resourceKey = effect.value as keyof GameState['resources'];
               // Assuming effect.duration is the amount for global resource effects
              newState.resources = {
                ...newState.resources,
                [resourceKey]: newState.resources[resourceKey] + (effect.duration || 0)
              };
           } else if (effect.type === 'threat') {
               // Logic to adjust global threat level
           }
          break;
      }
    });

    // Update scoring (this should be based on successful action/effects)
    scoringManager.addScore(actionId, gameState.isWhiteHat);

    // Update objectives (this should be based on successful action/effects)
    objectiveManager.updateObjectiveProgress(actionId, targetNodeId);

    // Update threat state (this should be based on successful action/effects)
    if (gameState.isWhiteHat) {
      threatManager.handleDefenseAction(actionId, targetNodeId);
    } else {
      threatManager.handleAttackAction(actionId, targetNodeId);
    }

    // Add action to logs
    newState.actionLogs = [...gameState.actionLogs, `Action ${action.name} performed on Node ${targetNodeId}`];

    updateGameState(newState);

  }, [gameState, updateGameState, scoringManager, objectiveManager, threatManager]);

  const clearNodeStateTimer = useCallback((nodeId: number) => {
    setGameState(prev => {
      const { [nodeId]: removed, ...remainingTimers } = prev.nodeStateTimers;
      return { ...prev, nodeStateTimers: remainingTimers };
    });
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      objectiveManager.resetObjectives();
      scoringManager.resetScore();
      threatManager.destroy();
      
      // Clear any remaining timers
      Object.keys(gameState.nodeStateTimers).forEach(nodeId => {
        clearNodeStateTimer(Number(nodeId));
      });
    };
  }, [objectiveManager, scoringManager, threatManager, gameState.nodeStateTimers, clearNodeStateTimer]);

  return {
    gameState,
    updateGameState,
    startGame,
    handleAction,
    clearNodeStateTimer,
  };
}; 
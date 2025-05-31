import { useState, useCallback } from 'react';
import { GameState, SystemStatus, NodeStatus, ParticleActivityLevel } from '../types/game';

const INITIAL_GAME_STATE: GameState = {
  mode: 'IDLE',
  playMode: 'DISCOVER',
  isWhiteHat: true,
  isTransitioning: false,
  isGameStarted: false,
  isTutorialActive: false,
  tutorialStep: 0,
  tutorialProgress: {
    currentStep: 0,
    completedSteps: [],
    currentObjective: null
  },
  resources: {
    energy: 100,
    bandwidth: 100,
    processing: 100
  },
  cooldowns: {},
  actionState: {
    mode: 'IDLE',
    currentAction: null,
    targetNodeId: null,
    cooldownEndTime: null
  },
  systemStatus: 'IDLE',
  targetStatus: {
    firewall: 'ACTIVE',
    encryption: 'MAXIMUM',
    accessControl: 'ENFORCED',
    systemIntegrity: 100
  },
  selectedNodeId: null,
  nodeStateTimers: {},
  actionLogs: [],
  terminalLines: [],
  progress: 0,
  particleActivityLevel: 'normal',
  discoveryState: {
    exploredNodes: [],
    discoveredActions: [],
    tutorialCompleted: false
  }
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

  const updateResources = useCallback((resourceType: keyof GameState['resources'], amount: number) => {
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resourceType]: Math.max(0, Math.min(100, prev.resources[resourceType] + amount))
      }
    }));
  }, []);

  const addActionLog = useCallback((log: string) => {
    setGameState(prev => ({
      ...prev,
      actionLogs: [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev.actionLogs.slice(0, 49)]
    }));
  }, []);

  const updateNodeStateTimer = useCallback((nodeId: number, status: NodeStatus) => {
    setGameState(prev => ({
      ...prev,
      nodeStateTimers: {
        ...prev.nodeStateTimers,
        [nodeId]: { status, startTime: Date.now() }
      }
    }));
  }, []);

  const clearNodeStateTimer = useCallback((nodeId: number) => {
    setGameState(prev => {
      const { [nodeId]: _, ...remainingTimers } = prev.nodeStateTimers;
      return { ...prev, nodeStateTimers: remainingTimers };
    });
  }, []);

  const setActionState = useCallback((actionState: GameState['actionState']) => {
    setGameState(prev => ({ ...prev, actionState }));
  }, []);

  const setCooldown = useCallback((action: string, duration: number) => {
    setGameState(prev => ({
      ...prev,
      cooldowns: {
        ...prev.cooldowns,
        [action]: Date.now() + duration
      }
    }));
  }, []);

  const isActionOnCooldown = useCallback((action: string): boolean => {
    return Boolean(gameState.cooldowns[action] && gameState.cooldowns[action] > Date.now());
  }, [gameState.cooldowns]);

  const getCooldownRemaining = useCallback((action: string) => {
    if (!gameState.cooldowns[action]) return 0;
    const remaining = gameState.cooldowns[action] - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, [gameState.cooldowns]);

  return {
    gameState,
    updateGameState,
    resetGameState,
    updateResources,
    addActionLog,
    updateNodeStateTimer,
    clearNodeStateTimer,
    setActionState,
    setCooldown,
    isActionOnCooldown,
    getCooldownRemaining
  };
}; 
import { useCallback } from 'react';
import { GamePlayMode } from '../types/game';
import { useGameState } from './useGameState';

export const useGameMode = () => {
  const { gameState, updateGameState } = useGameState();

  const switchToDiscoverMode = useCallback(() => {
    updateGameState({
      playMode: 'DISCOVER',
      isGameStarted: false,
      isTutorialActive: false,
      tutorialStep: 0,
      tutorialProgress: {
        currentStep: 0,
        completedSteps: [],
        currentObjective: null
      },
      actionState: {
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      }
    });
  }, [updateGameState]);

  const switchToTutorialMode = useCallback(() => {
    updateGameState({
      playMode: 'TUTORIAL',
      isGameStarted: true,
      isTutorialActive: true,
      tutorialStep: 1,
      tutorialProgress: {
        currentStep: 1,
        completedSteps: [],
        currentObjective: 'TUTORIAL_START'
      },
      actionState: {
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      }
    });
  }, [updateGameState]);

  const switchToGameMode = useCallback(() => {
    updateGameState({
      playMode: 'GAME',
      isGameStarted: true,
      isTutorialActive: false,
      tutorialStep: 0,
      tutorialProgress: {
        currentStep: 0,
        completedSteps: [],
        currentObjective: null
      },
      actionState: {
        mode: 'IDLE',
        currentAction: null,
        targetNodeId: null,
        cooldownEndTime: null
      }
    });
  }, [updateGameState]);

  const updateTutorialProgress = useCallback((step: number, objective: string | null) => {
    updateGameState(prev => ({
      tutorialProgress: {
        ...prev.tutorialProgress,
        currentStep: step,
        completedSteps: [...prev.tutorialProgress.completedSteps, step - 1],
        currentObjective: objective
      }
    }));
  }, [updateGameState]);

  const completeTutorial = useCallback(() => {
    updateGameState({
      isTutorialActive: false,
      tutorialStep: 0,
      tutorialProgress: {
        currentStep: 0,
        completedSteps: [],
        currentObjective: null
      },
      discoveryState: {
        ...gameState.discoveryState,
        tutorialCompleted: true
      }
    });
    switchToGameMode();
  }, [updateGameState, gameState.discoveryState, switchToGameMode]);

  return {
    currentMode: gameState.playMode,
    isTutorialActive: gameState.isTutorialActive,
    tutorialProgress: gameState.tutorialProgress,
    switchToDiscoverMode,
    switchToTutorialMode,
    switchToGameMode,
    updateTutorialProgress,
    completeTutorial
  };
}; 
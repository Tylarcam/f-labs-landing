import React, { useState, useEffect } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { ActionPanel } from './ActionPanel';
import { NetworkDisplay } from './NetworkDisplay';
import { ObjectiveDisplay } from './ObjectiveDisplay';
import { ResourceDisplay } from './ResourceDisplay';
import { ThreatDetectionPanel } from './ThreatDetectionPanel';
import { Terminal } from './Terminal';
import { GameState } from '../../types/game.types';

export const GameDemoDisplay: React.FC = () => {
  const {
    gameState,
    updateGameState,
    startGame,
    handleAction,
    clearNodeStateTimer,
  } = useGameLogic();

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Handle node selection
  const handleNodeSelect = (nodeId: number) => {
    setSelectedNodeId(nodeId);
    updateGameState({ selectedNodeId: nodeId });
  };

  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    if (!selectedNodeId) return;
    handleAction(actionId, selectedNodeId);
  };

  // Start game with selected mode
  const handleStartGame = (mode: 'WHITE_HAT' | 'BLACK_HAT') => {
    startGame(mode);
  };

  // Cleanup node state timers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(gameState.nodeStateTimers).forEach(([nodeId, { status, startTime }]) => {
        const elapsedTime = now - startTime;
        const duration = status === 'patching' || status === 'scanning' ? 15000 : 30000;
        
        if (elapsedTime >= duration) {
          clearNodeStateTimer(Number(nodeId));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.nodeStateTimers, clearNodeStateTimer]);

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* Game Mode Selection */}
      {gameState.mode === 'IDLE' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">Select Game Mode</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleStartGame('WHITE_HAT')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold transition-colors"
              >
                White Hat Mode
              </button>
              <button
                onClick={() => handleStartGame('BLACK_HAT')}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-semibold transition-colors"
              >
                Black Hat Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.mode === 'WHITE_HAT_WIN' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-green-500">White Hat Victory!</h2>
            <button
              onClick={() => updateGameState({ mode: 'IDLE' })}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameState.mode === 'BLACK_HAT_WIN' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-red-500">Black Hat Victory!</h2>
            <button
              onClick={() => updateGameState({ mode: 'IDLE' })}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {gameState.mode === 'GAME_OVER_LOSS' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-red-500">Game Over</h2>
            <button
              onClick={() => updateGameState({ mode: 'IDLE' })}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-xl font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Game UI */}
      {gameState.mode === 'PLAYING' && (
        <div className="grid grid-cols-12 grid-rows-6 gap-4 p-4 h-full">
          {/* Network Display */}
          <div className="col-span-8 row-span-4 bg-gray-900 rounded-lg overflow-hidden">
            <NetworkDisplay
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
              nodeStates={gameState.nodeStateTimers}
            />
          </div>

          {/* Action Panel */}
          <div className="col-span-4 row-span-4 bg-gray-900 rounded-lg overflow-hidden">
            <ActionPanel
              isWhiteHat={gameState.isWhiteHat}
              selectedNodeId={selectedNodeId}
              onActionSelect={handleActionSelect}
              cooldowns={gameState.cooldowns}
            />
          </div>

          {/* Resource Display */}
          <div className="col-span-4 row-span-1 bg-gray-900 rounded-lg overflow-hidden">
            <ResourceDisplay resources={gameState.resources} />
          </div>

          {/* Objective Display */}
          <div className="col-span-4 row-span-1 bg-gray-900 rounded-lg overflow-hidden">
            <ObjectiveDisplay />
          </div>

          {/* Threat Detection Panel */}
          <div className="col-span-4 row-span-1 bg-gray-900 rounded-lg overflow-hidden">
            <ThreatDetectionPanel />
          </div>

          {/* Terminal */}
          <div className="col-span-8 row-span-2 bg-gray-900 rounded-lg overflow-hidden">
            <Terminal lines={gameState.terminalLines} />
          </div>
        </div>
      )}
    </div>
  );
}; 
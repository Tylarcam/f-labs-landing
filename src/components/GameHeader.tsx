import React from 'react';
import { GameState, GameMode } from '../types/game.types';
import { Shield, Terminal, Activity } from 'lucide-react';
import ResourceDisplay from './ResourceDisplay';

interface GameHeaderProps {
  gameState: GameState;
  currentTheme: { border: string; headerBg: string; text: string; panelBg: string };
  handleModeToggle: () => void;
  statusIndicator: JSX.Element; // Assuming statusIndicator is passed as a JSX element for now
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameState,
  currentTheme,
  handleModeToggle,
  statusIndicator,
}) => {
  return (
    <div className={`relative z-10 border-b backdrop-blur-sm ${currentTheme.border} ${currentTheme.headerBg}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {gameState.isWhiteHat ? <Shield className="w-8 h-8" /> : <Terminal className="w-8 h-8" />}
          <h1 className={`text-2xl font-bold tracking-wider ${currentTheme.text}`}>
            {gameState.isWhiteHat ? 'CYBER_DEFENSE_SYSTEM_v3.2' : 'NEURAL_HACK_v2.7'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Score Display Placeholder */}
          {/* Assuming ScoreDisplay component exists */}
          {/* <ScoreDisplay className="mr-4" /> */}

          {/* Resource Display (Optional - can be in header or panel) */}
          {/* <ResourceDisplay resources={gameState.resources} currentTheme={currentTheme} /> */}

          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
            <span className={`text-sm ${!gameState.isWhiteHat ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
              BLACK HAT
            </span>
            <button
              onClick={handleModeToggle}
              disabled={gameState.isTransitioning}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                gameState.isWhiteHat ? 'bg-blue-600' : 'bg-green-600'
              } ${gameState.isTransitioning ? 'animate-pulse' : ''}`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ${
                gameState.isWhiteHat ? 'left-6' : 'left-0.5'
              } ${gameState.isTransitioning ? 'animate-bounce' : ''}`} />
            </button>
            <span className={`text-sm ${gameState.isWhiteHat ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
              WHITE HAT
            </span>
          </div>

          <div className="flex items-center gap-6">
            {statusIndicator}
            <div className="text-sm">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader; 
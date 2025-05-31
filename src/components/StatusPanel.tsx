import React from 'react';
import { GameState } from '../types/game.types';
import { Brain } from 'lucide-react';

interface StatusPanelProps {
  gameState: GameState;
  currentTheme: { panelBg: string; border: string };
}

const StatusPanel: React.FC<StatusPanelProps> = ({ gameState, currentTheme }) => {
  return (
    <div className={`border rounded-lg p-4 ${currentTheme.border} ${currentTheme.panelBg}`}>
      <h3 className="text-lg font-bold mb-4">System Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Firewall:</span>
          <span className={gameState.targetStatus.firewall === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>
            {gameState.targetStatus.firewall}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Encryption:</span>
          <span className={gameState.targetStatus.encryption === 'MAXIMUM' ? 'text-green-400' : 'text-yellow-400'}>
            {gameState.targetStatus.encryption}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Access Control:</span>
          <span className={gameState.targetStatus.accessControl === 'ENFORCED' ? 'text-green-400' : 'text-red-400'}>
            {gameState.targetStatus.accessControl}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>System Integrity:</span>
          <span className={
            gameState.targetStatus.systemIntegrity > 80 ? 'text-green-400' :
            gameState.targetStatus.systemIntegrity > 40 ? 'text-yellow-400' :
            'text-red-400'
          }>
            {gameState.targetStatus.systemIntegrity}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel; 
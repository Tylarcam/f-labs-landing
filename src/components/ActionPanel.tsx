import React from 'react';
import { GameState, GameMode } from '../types/game.types';
import { Eye, Target, Shield, Server, Wifi, Brain, Code, Zap } from 'lucide-react';
import { GameBalanceManager } from '../game/GameBalanceManager';

interface ActionPanelProps {
  gameState: GameState;
  currentTheme: { panelBg: string; border: string };
  setActionState: (actionState: GameState['actionState']) => void;
  isActionOnCooldown: (action: string) => boolean;
  getCooldownRemaining: (action: string) => number;
  balanceManager: GameBalanceManager; // Pass the manager instance
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  currentTheme,
  setActionState,
  isActionOnCooldown,
  getCooldownRemaining,
  balanceManager,
}) => {

   // calculateActionSuccessRate function (adapted from GameDemoDisplay) - DEPRECATED: Logic should be in GameBalanceManager
     const calculateActionSuccessRate = (action: string, mode: 'WHITE_HAT' | 'BLACK_HAT'): number => {
        // This logic should ideally live in GameBalanceManager and be accessed via the instance
        // For now, keeping a simplified version or calling balanceManager directly
        return balanceManager.calculateSuccessProbability(action, mode, 'server', 'active', 50); // Simplified for now
      };

    // ActionButton component (adapted from GameDemoDisplay)
     const ActionButton = React.memo(({ 
        action, 
        mode, 
        onClick, 
        hasResources, 
        costs, 
        isSelected,
        successRate,
      }: {
        action: string;
        mode: 'WHITE_HAT' | 'BLACK_HAT';
        onClick: () => void;
        hasResources: boolean;
        costs: { energy: number; bandwidth: number; processing: number };
        isSelected: boolean;
        successRate: number;
      }) => {
        // Assuming getActionIcon and getActionDescription are needed, maybe move them or simplify
        const getActionIcon = (action: string) => {
            // Placeholder for icons
            switch (action) {
                case 'SCAN_TARGETS': return <Eye className="w-4 h-4" />; // Example icon
                case 'EXPLOIT': return <Target className="w-4 h-4" />; // Example icon
                case 'PATCH_ALL': return <Shield className="w-4 h-4" />; // Example icon
                case 'QUARANTINE': return <Server className="w-4 h-4" />; // Example icon
                case 'MONITOR': return <Wifi className="w-4 h-4" />; // Example icon
                case 'BACKUP': return <Brain className="w-4 h-4" />; // Example icon
                case 'BACKDOOR': return <Code className="w-4 h-4" />; // Example icon
                case 'DENIAL_OF_SERVICE': return <Zap className="w-4 h-4" />; // Example icon
                default: return null; // No icon
            }
        };

         const getActionDescription = (action: string): string => {
            // Placeholder descriptions
            switch (action) {
                case 'SCAN_TARGETS': return 'Scan selected node for vulnerabilities.';
                case 'EXPLOIT': return 'Attempt to exploit a vulnerability on the target.';
                case 'PATCH_ALL': return 'Patch all vulnerable nodes in the network.';
                case 'QUARANTINE': return 'Isolate a compromised node from the network.';
                case 'MONITOR': return 'Place a node under surveillance.';
                case 'BACKUP': return 'Create a backup of a node\'s data.';
                case 'BACKDOOR': return 'Establish a persistent backdoor on a compromised node.';
                case 'DENIAL_OF_SERVICE': return 'Flood a node with traffic to disrupt service.';
                default: return 'No description available.';
            }
        };

        const cooldownRemaining = getCooldownRemaining(action);
        const isOnCooldown = cooldownRemaining > 0;

        return (
          <button
            onClick={onClick}
            disabled={!hasResources || isOnCooldown || gameState.actionState.mode === 'EXECUTING'}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors duration-200 text-sm text-center
              ${currentTheme.panelBg} border ${currentTheme.border} hover:bg-opacity-90
              ${!hasResources || isOnCooldown || gameState.actionState.mode === 'EXECUTING' ? 'opacity-50 cursor-not-allowed' : ''}
              ${isSelected ? 'ring-2 ring-yellow-400' : ''}
            `}
            title={getActionDescription(action) + (isOnCooldown ? ` (Cooldown: ${cooldownRemaining}s)` : '')}
          >
            {getActionIcon(action)}
            <span className="mt-1">{action.replace('_', ' ')}</span>
            {isOnCooldown && <span className="text-xs text-yellow-400">{cooldownRemaining}s</span>}
             {gameState.actionState.currentAction === action && gameState.actionState.mode === 'SELECTING_TARGET' && (
                 <span className="text-xs text-yellow-400">TARGETING...</span>
             )}
          </button>
        );
    });

      // renderActionButtons function (adapted from GameDemoDisplay)
      const renderActionButtons = (mode: 'WHITE_HAT' | 'BLACK_HAT') => {
        const actions = mode === 'WHITE_HAT' ? ['PATCH_ALL', 'QUARANTINE', 'MONITOR', 'BACKUP'] : ['SCAN_TARGETS', 'EXPLOIT', 'BACKDOOR', 'DENIAL_OF_SERVICE'];
    
        return (
          <div className="grid grid-cols-2 gap-4">
            {actions.map(action => {
              const costs = balanceManager.getResourceCosts(action, mode);
              const hasResources = gameState.resources.energy >= costs.energy && 
                                   gameState.resources.bandwidth >= costs.bandwidth && 
                                   gameState.resources.processing >= costs.processing;
              const successRate = calculateActionSuccessRate(action, mode);
              const isSelected = gameState.actionState.mode === 'SELECTING_TARGET' && gameState.actionState.currentAction === action;
    
              return (
                <ActionButton
                  key={action}
                  action={action}
                  mode={mode}
                  onClick={() => setActionState({ mode: 'SELECTING_TARGET', currentAction: action, targetNodeId: null, cooldownEndTime: null })}
                  hasResources={hasResources}
                  costs={costs}
                  isSelected={isSelected}
                  successRate={successRate}
                />
              );
            })}
          </div>
        );
      };

  return (
    <div className={`border rounded-lg p-4 ${currentTheme.border} ${currentTheme.panelBg}`}>
      <h3 className="text-lg font-bold mb-4">
        {gameState.isWhiteHat ? 'Defense Actions' : 'Attack Actions'}
      </h3>
      {renderActionButtons(gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT')}
    </div>
  );
};

export default ActionPanel; 
import React from 'react';
import { Shield, Lock, Eye, Zap, Search, Bug, Key, Wifi } from 'lucide-react';

export const WHITE_HAT_ACTIONS = [
  {
    id: 'patch',
    name: 'Patch System',
    description: 'Apply security patches to fix vulnerabilities',
    icon: Shield,
    cost: { energy: 20, bandwidth: 10, processing: 15 },
    cooldown: 15,
  },
  {
    id: 'quarantine',
    name: 'Quarantine',
    description: 'Isolate compromised nodes to prevent spread',
    icon: Lock,
    cost: { energy: 15, bandwidth: 20, processing: 10 },
    cooldown: 30,
  },
  {
    id: 'monitor',
    name: 'Monitor',
    description: 'Track node activity for suspicious behavior',
    icon: Eye,
    cost: { energy: 10, bandwidth: 15, processing: 20 },
    cooldown: 20,
  },
  {
    id: 'backup',
    name: 'Backup',
    description: 'Create secure backup of node data',
    icon: Zap,
    cost: { energy: 25, bandwidth: 25, processing: 15 },
    cooldown: 45,
  },
];

export const BLACK_HAT_ACTIONS = [
  {
    id: 'scan',
    name: 'Scan',
    description: 'Search for vulnerabilities in target node',
    icon: Search,
    cost: { energy: 15, bandwidth: 20, processing: 10 },
    cooldown: 15,
  },
  {
    id: 'exploit',
    name: 'Exploit',
    description: 'Take advantage of found vulnerabilities',
    icon: Bug,
    cost: { energy: 25, bandwidth: 15, processing: 20 },
    cooldown: 30,
  },
  {
    id: 'backdoor',
    name: 'Backdoor',
    description: 'Create hidden access point for future use',
    icon: Key,
    cost: { energy: 20, bandwidth: 25, processing: 15 },
    cooldown: 45,
  },
  {
    id: 'dos',
    name: 'DoS',
    description: 'Overwhelm target with traffic',
    icon: Wifi,
    cost: { energy: 30, bandwidth: 30, processing: 20 },
    cooldown: 60,
  },
];

interface ActionPanelProps {
  isWhiteHat: boolean;
  selectedNodeId: number | null;
  onActionSelect: (actionId: string) => void;
  cooldowns: Record<string, number>;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  isWhiteHat,
  selectedNodeId,
  onActionSelect,
  cooldowns,
}) => {
  const actions = isWhiteHat ? WHITE_HAT_ACTIONS : BLACK_HAT_ACTIONS;

  const getCooldownRemaining = (actionId: string) => {
    if (!cooldowns[actionId]) return 0;
    const remaining = cooldowns[actionId] - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">
        {isWhiteHat ? 'Defense Actions' : 'Attack Actions'}
      </h2>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {actions.map((action) => {
          const cooldownRemaining = getCooldownRemaining(action.id);
          const isOnCooldown = cooldownRemaining > 0;
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              disabled={!selectedNodeId || isOnCooldown}
              className={`
                relative p-4 rounded-lg bg-gray-800 hover:bg-gray-700 
                transition-colors flex flex-col items-center justify-center
                ${(!selectedNodeId || isOnCooldown) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="w-8 h-8 mb-2" />
              <span className="font-semibold">{action.name}</span>
              <span className="text-sm text-gray-400 text-center mt-1">
                {action.description}
              </span>
              <div className="absolute top-2 right-2 text-xs text-gray-400">
                {Object.entries(action.cost).map(([resource, amount]) => (
                  <div key={resource} className="flex items-center gap-1">
                    <span>{resource}:</span>
                    <span>{amount}</span>
                  </div>
                ))}
              </div>
              {isOnCooldown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-lg font-bold">{cooldownRemaining}s</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 
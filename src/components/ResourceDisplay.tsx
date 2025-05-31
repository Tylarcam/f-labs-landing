import React from 'react';
import { GameState } from '../types/game.types';
import { Activity } from 'lucide-react';

interface ResourceDisplayProps {
  resources: GameState['resources'];
  currentTheme: { panelBg: string; border: string };
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, currentTheme }) => {
  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Activity className="w-5 h-5" />
        <span className="text-sm font-bold">RESOURCES</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Energy:</span>
          <span>{resources.energy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Bandwidth:</span>
          <span>{resources.bandwidth}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Processing:</span>
          <span>{resources.processing}</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceDisplay; 
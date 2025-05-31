import React from 'react';
import { ObjectiveManager } from '../game/ObjectiveManager';
import { GameMode } from '../types/game.types';
import { Eye } from 'lucide-react';

interface ObjectiveDisplayProps {
  objectiveManager: ObjectiveManager;
  mode: GameMode;
  currentTheme: { panelBg: string; border: string };
}

const ObjectiveDisplay: React.FC<ObjectiveDisplayProps> = ({ objectiveManager, mode, currentTheme }) => {
  const currentObjectives = objectiveManager.getCurrentObjectives();

  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Eye className="w-5 h-5" />
        <span className="text-sm font-bold">OBJECTIVES</span>
      </div>
      <div className="space-y-2">
        {currentObjectives.map(obj => (
          <div key={obj.id} className={`text-sm ${obj.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}`}>
            {obj.title}: {obj.status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectiveDisplay; 
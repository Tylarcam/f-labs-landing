import React from 'react';
import { StrategicHint } from '../types/mission.types'; // Assuming StrategicHint type
import { GameMode } from '../types/game.types';
import { Lightbulb } from 'lucide-react';

interface StrategicGuidanceProps {
  currentHint: StrategicHint | null; // Assuming a currentHint state from a hook
  showHints: boolean; // Assuming a state to control hint visibility
  // Potentially pass game state or mission details for generating/filtering hints
  gameState?: any; // Using 'any' for now, refine as needed
  currentMission?: any; // Using 'any' for now, refine as needed
  currentTheme: { panelBg: string; border: string };
}

// Define a placeholder StrategicHint type if it doesn't exist yet
// This should match the type defined in mission.types.ts
// interface StrategicHint {
//   id: string;
//   priority: number;
//   nodeIds: number[];
//   action: string;
//   reason: string;
//   timeWindow: { min: number; max: number };
//   gameMode: GameMode;
// }

const StrategicGuidance: React.FC<StrategicGuidanceProps> = ({
  currentHint,
  showHints,
  // gameState, // Not directly used in this basic version
  // currentMission, // Not directly used in this basic version
  currentTheme,
}) => {
  if (!showHints || !currentHint) {
    return null; // Don't render if hints are off or no current hint
  }

  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <span className="text-sm font-bold text-yellow-400">STRATEGIC_GUIDANCE</span>
      </div>
      <div className="text-sm space-y-2">
        <p>{currentHint.reason}</p>
        {currentHint.nodeIds && currentHint.nodeIds.length > 0 && (
          <p className="text-xs opacity-80">Target Nodes: {currentHint.nodeIds.join(', ')}</p>
        )}
        {currentHint.action && (
          <p className="text-xs opacity-80">Suggested Action: {currentHint.action}</p>
        )}
      </div>
    </div>
  );
};

export default StrategicGuidance; 
import React from 'react';
import { Mission } from '../types/mission.types';
import { GameState } from '../types/game.types';

interface MissionStatusProps {
  currentMission: Mission | null;
  timeRemaining: number;
  score: number;
  currentTheme: { panelBg: string; border: string };
}

const MissionStatus: React.FC<MissionStatusProps> = ({
  currentMission,
  timeRemaining,
  score,
  currentTheme,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <h3 className="text-lg font-bold mb-4">MISSION_STATUS</h3>
      {currentMission ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Mission:</span>
            <span>{currentMission.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Time Remaining:</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Score:</span>
            <span>{score}</span>
          </div>
           {/* Objectives are displayed in ObjectiveDisplay, but maybe a summary here? */}
        </div>
      ) : (
        <div className="text-sm opacity-80">No active mission.</div>
      )}
    </div>
  );
};

export default MissionStatus; 
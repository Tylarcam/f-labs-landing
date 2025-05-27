import React, { useEffect, useState } from 'react';
import { Objective } from '../../types/game';
import { ObjectiveManager } from '../../game/ObjectiveManager';
import { GameMode } from '../../types/game';

interface ObjectiveDisplayProps {
  mode: GameMode;
  className?: string;
}

export const ObjectiveDisplay: React.FC<ObjectiveDisplayProps> = ({ mode, className = '' }) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const objectiveManager = ObjectiveManager.getInstance();

  useEffect(() => {
    // Update objectives every second
    const interval = setInterval(() => {
      setObjectives(objectiveManager.getCurrentObjectives());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold mb-2">OBJECTIVES</h3>
      <div className="space-y-3">
        {objectives.map((objective) => (
          <div
            key={objective.id}
            className={`p-3 rounded-lg border ${
              objective.status === 'COMPLETED'
                ? 'border-green-400 bg-green-400/5'
                : 'border-blue-400/30 bg-gray-900/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-sm">{objective.title}</h4>
                <p className="text-xs opacity-70">{objective.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">
                  {objective.reward} pts
                </div>
                {objective.timeLimit && (
                  <div className="text-xs opacity-70">
                    {formatTime(objective.timeLimit)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {objective.requirements.map((req, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{req.type.replace(/_/g, ' ')}</span>
                    <span>
                      {req.current}/{req.target}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(
                        req.current,
                        req.target
                      )}`}
                      style={{
                        width: `${Math.min(
                          (req.current / req.target) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {objective.status === 'COMPLETED' && (
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <span>✓</span>
                <span>Objective Complete!</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 
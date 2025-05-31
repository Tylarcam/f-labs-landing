import React, { useEffect, useState } from 'react';
import { Objective } from '../../types/game';
import { ObjectiveManager } from '../../game/ObjectiveManager';
import { GameMode } from '../../types/game';
import { Eye, CheckCircle2, Clock } from 'lucide-react';

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

  const getRequirementProgress = (requirement: Objective['requirements'][0]) => {
    const percentage = (requirement.current / requirement.target) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Eye className="w-5 h-5" />
        <h3 className="text-lg font-bold">OBJECTIVES</h3>
      </div>
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
              <div className="flex items-start gap-2">
                {objective.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h4 className="font-bold text-sm">{objective.title}</h4>
                  <p className="text-xs opacity-70">{objective.description}</p>
                </div>
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
                    <span className="opacity-70">{req.type}</span>
                    <span>{req.current}/{req.target}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(req.current, req.target)} transition-all duration-300`}
                      style={{ width: `${getRequirementProgress(req)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
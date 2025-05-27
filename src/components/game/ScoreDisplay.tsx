import React, { useEffect, useState } from 'react';
import { ScoringManager } from '../../game/ScoringManager';

interface ScoreDisplayProps {
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ className = '' }) => {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showCombo, setShowCombo] = useState(false);

  useEffect(() => {
    const scoringManager = ScoringManager.getInstance();
    
    // Update scores every 100ms
    const interval = setInterval(() => {
      setCurrentScore(scoringManager.getCurrentScore());
      setHighScore(scoringManager.getHighScore());
      const newCombo = scoringManager.getComboMultiplier();
      setComboMultiplier(newCombo);
      
      // Show combo indicator if multiplier is greater than 1
      if (newCombo > 1) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-end space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70">SCORE</span>
        <span className="text-xl font-bold">{currentScore.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70">HIGH SCORE</span>
        <span className="text-sm">{highScore.toLocaleString()}</span>
      </div>

      {showCombo && comboMultiplier > 1 && (
        <div className="flex items-center gap-1 text-green-400 animate-pulse">
          <span className="text-sm">COMBO</span>
          <span className="text-lg font-bold">x{comboMultiplier.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}; 
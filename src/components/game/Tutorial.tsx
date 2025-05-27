import React, { useState, useEffect } from 'react';
import { GameMode } from '../../game/types';

interface TutorialStep {
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  target?: string;
  action?: () => void;
}

interface TutorialProps {
  gameMode: GameMode;
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ gameMode, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const whiteHatSteps: TutorialStep[] = [
    {
      title: 'Welcome to White Hat Mode',
      content: 'As a security defender, your goal is to protect the network from attacks.',
      position: 'top',
    },
    {
      title: 'Game Stats',
      content: 'Monitor your score, time remaining, and defense points here.',
      position: 'left',
      target: '.game-stats',
    },
    {
      title: 'Objectives',
      content: 'Complete objectives to earn points and progress through the game.',
      position: 'right',
      target: '.game-objectives',
    },
    {
      title: 'Actions',
      content: 'Use these actions to defend your network: PATCH to fix vulnerabilities, QUARANTINE to isolate threats, and MONITOR to watch for suspicious activity.',
      position: 'bottom',
      target: '.game-actions',
    },
    {
      title: 'Network View',
      content: 'Click on nodes to select them for actions. Green nodes are secure, red nodes are compromised.',
      position: 'top',
      target: '.network-topology',
    },
  ];

  const blackHatSteps: TutorialStep[] = [
    {
      title: 'Welcome to Black Hat Mode',
      content: 'As an attacker, your goal is to compromise the network and steal data.',
      position: 'top',
    },
    {
      title: 'Game Stats',
      content: 'Monitor your score, time remaining, and attack points here.',
      position: 'left',
      target: '.game-stats',
    },
    {
      title: 'Objectives',
      content: 'Complete objectives to earn points and progress through the game.',
      position: 'right',
      target: '.game-objectives',
    },
    {
      title: 'Actions',
      content: 'Use these actions to attack the network: SCAN to find vulnerabilities and EXPLOIT to compromise nodes.',
      position: 'bottom',
      target: '.game-actions',
    },
    {
      title: 'Network View',
      content: 'Click on nodes to select them for actions. Red nodes are compromised, green nodes are secure.',
      position: 'top',
      target: '.network-topology',
    },
  ];

  const steps = gameMode === 'WHITE_HAT' ? whiteHatSteps : blackHatSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className={`tutorial-tooltip ${currentStepData.position}`}>
        <div className="tutorial-header">
          <h3>{currentStepData.title}</h3>
          <button onClick={handleSkip} className="tutorial-skip">Skip</button>
        </div>
        <p>{currentStepData.content}</p>
        <div className="tutorial-footer">
          <div className="tutorial-progress">
            {currentStep + 1} / {steps.length}
          </div>
          <button onClick={handleNext} className="tutorial-next">
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}; 
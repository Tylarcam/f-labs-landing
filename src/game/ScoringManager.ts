import { GameMode, NodeStatus, GameAction } from '../types/game';

export class ScoringManager {
  private static instance: ScoringManager;
  private currentScore: number = 0;
  private highScore: number = 0;
  private comboMultiplier: number = 1;
  private lastActionTime: number = 0;
  private comboWindow: number = 3000; // 3 seconds for combo window

  private constructor() {
    // Load high score from localStorage if available
    const savedHighScore = localStorage.getItem('cyberSimHighScore');
    if (savedHighScore) {
      this.highScore = parseInt(savedHighScore, 10);
    }
  }

  public static getInstance(): ScoringManager {
    if (!ScoringManager.instance) {
      ScoringManager.instance = new ScoringManager();
    }
    return ScoringManager.instance;
  }

  // Base scoring for different actions
  private readonly baseScores = {
    WHITE_HAT: {
      PATCH_ALL: 100,
      QUARANTINE: 150,
      BACKUP: 200,
      MONITOR: 75,
      SECURE_NODE: 50,
      COMPLETE_OBJECTIVE: 500
    },
    BLACK_HAT: {
      SCAN_TARGETS: 50,
      QUARANTINE: 100,
      EXPLOIT: 200,
      BACKDOOR: 150,
      COMPROMISE_NODE: 75,
      COMPLETE_OBJECTIVE: 500
    }
  };

  // Calculate score for an action
  public calculateActionScore(
    action: string,
    mode: GameMode,
    success: boolean,
    affectedNodes: number = 1
  ): number {
    if (!success) return 0;

    const baseScore = this.baseScores[mode][action as keyof typeof this.baseScores[typeof mode]] || 0;
    const now = Date.now();

    // Check if within combo window
    if (now - this.lastActionTime < this.comboWindow) {
      this.comboMultiplier += 0.1;
    } else {
      this.comboMultiplier = 1;
    }

    this.lastActionTime = now;
    const finalScore = Math.round(baseScore * this.comboMultiplier * affectedNodes);
    this.addScore(finalScore);
    return finalScore;
  }

  // Add points to current score
  private addScore(points: number): void {
    this.currentScore += points;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem('cyberSimHighScore', this.highScore.toString());
    }
  }

  // Get current score
  public getCurrentScore(): number {
    return this.currentScore;
  }

  // Get high score
  public getHighScore(): number {
    return this.highScore;
  }

  // Get current combo multiplier
  public getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  // Reset score for new game
  public resetScore(): void {
    this.currentScore = 0;
    this.comboMultiplier = 1;
    this.lastActionTime = 0;
  }

  // Calculate bonus for completing objectives
  public calculateObjectiveBonus(
    mode: GameMode,
    objectivesCompleted: number,
    timeRemaining: number
  ): number {
    const baseBonus = this.baseScores[mode].COMPLETE_OBJECTIVE;
    const timeBonus = Math.floor(timeRemaining / 1000) * 10; // 10 points per second remaining
    return (baseBonus + timeBonus) * objectivesCompleted;
  }

  // Calculate penalty for failed actions
  public calculatePenalty(
    mode: GameMode,
    action: string,
    failedNodes: number = 1
  ): number {
    const basePenalty = Math.floor(this.baseScores[mode][action as keyof typeof this.baseScores[typeof mode]] * 0.2);
    return basePenalty * failedNodes;
  }
} 
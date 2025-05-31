import { GameMode, GameState, NetworkNode, NodeType, NodeStatus, GameAction } from '../types/game.types';
import { Threat } from '../types';

// Define action configurations with costs, cooldowns, and base success rates
const ACTION_CONFIGS: Record<string, {
  cost: GameState['resources'];
  cooldown: number;
  baseSuccessRate: number;
  // Add other properties as needed, e.g., effects, target types
}> = {
  // White Hat Actions
  PATCH_ALL: {
    cost: { energy: 15, bandwidth: 10, processing: 20 },
    cooldown: 7000, // milliseconds
    baseSuccessRate: 0.8,
  },
  QUARANTINE: {
    cost: { energy: 20, bandwidth: 25, processing: 15 },
    cooldown: 10000,
    baseSuccessRate: 0.7,
  },
  MONITOR: {
    cost: { energy: 5, bandwidth: 5, processing: 5 },
    cooldown: 2000,
    baseSuccessRate: 1.0, // Monitoring always succeeds in applying the status
  },
  BACKUP: {
    cost: { energy: 10, bandwidth: 15, processing: 10 },
    cooldown: 8000,
    baseSuccessRate: 0.9,
  },

  // Black Hat Actions
  SCAN_TARGETS: {
    cost: { energy: 10, bandwidth: 15, processing: 10 },
    cooldown: 5000,
    baseSuccessRate: 0.9, // Scanning usually succeeds
  },
  EXPLOIT: {
    cost: { energy: 25, bandwidth: 20, processing: 30 },
    cooldown: 12000,
    baseSuccessRate: 0.6,
  },
  BACKDOOR: {
    cost: { energy: 30, bandwidth: 25, processing: 25 },
    cooldown: 15000,
    baseSuccessRate: 0.5,
  },
  DENIAL_OF_SERVICE: {
    cost: { energy: 20, bandwidth: 30, processing: 20 },
    cooldown: 10000,
    baseSuccessRate: 0.75,
  },
};

export class GameBalanceManager {
  private static instance: GameBalanceManager;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): GameBalanceManager {
    if (!GameBalanceManager.instance) {
      GameBalanceManager.instance = new GameBalanceManager();
    }
    return GameBalanceManager.instance;
  }

  public getResourceCosts(actionName: string, mode: GameMode): GameState['resources'] {
    // In a more complex game, costs might vary by mode or other factors
    const config = ACTION_CONFIGS[actionName];
    if (!config) {
      console.error(`Action config not found for: ${actionName}`);
      return { energy: 0, bandwidth: 0, processing: 0 };
    }
    return config.cost;
  }

  public getActionCooldown(actionName: string, mode: GameMode): number {
    // Cooldowns might also vary
    const config = ACTION_CONFIGS[actionName];
    if (!config) {
      console.error(`Action config not found for: ${actionName}`);
      return 0;
    }
    return config.cooldown;
  }

  public calculateSuccessProbability(
    actionName: string,
    mode: GameMode,
    targetNodeType: NodeType,
    targetNodeStatus: NodeStatus,
    targetNodeDefense: number // 0-100
  ): number {
    const config = ACTION_CONFIGS[actionName];
    if (!config) {
      console.error(`Action config not found for: ${actionName}`);
      return 0;
    }

    let probability = config.baseSuccessRate;

    // Adjust probability based on factors
    if (mode === 'WHITE_HAT') {
      // White Hat actions against vulnerable/compromised nodes might have higher success
      if (targetNodeStatus === 'vulnerable') probability += 0.2;
      if (targetNodeStatus === 'compromised') probability += 0.1;

      // Node defense reduces White Hat success
      probability -= targetNodeDefense / 200; // Reduce by up to 0.5 for 100 defense

    } else { // BLACK_HAT
      // Black Hat actions against secure nodes might have lower success
      if (targetNodeStatus === 'secure') probability -= 0.3;

      // Node defense reduces Black Hat success more significantly
      probability -= targetNodeDefense / 150; // Reduce by up to ~0.67 for 100 defense

      // Exploits might be more successful against vulnerable nodes
      if (actionName === 'EXPLOIT' && targetNodeStatus === 'vulnerable') probability += 0.3;
    }

    // Ensure probability is between 0 and 1
    return Math.max(0, Math.min(1, probability));
  }

  public isValidTarget(node: NetworkNode, mode: GameMode, actionName: string): boolean {
      // Basic target validation based on action and node status/type
      if (mode === 'WHITE_HAT') {
          switch (actionName) {
              case 'PATCH_ALL': return node.status === 'vulnerable' || node.status === 'compromised';
              case 'QUARANTINE': return node.status === 'compromised' || node.status === 'breached';
              case 'MONITOR': return node.status !== 'monitoring'; // Can monitor any node not already monitored
              case 'BACKUP': return node.status === 'active' || node.status === 'secure';
              default: return false;
          }
      } else { // BLACK_HAT
          switch (actionName) {
              case 'SCAN_TARGETS': return node.status === 'active' || node.status === 'secure';
              case 'EXPLOIT': return node.status === 'vulnerable';
              case 'BACKDOOR': return node.status === 'compromised';
              case 'DENIAL_OF_SERVICE': return node.status === 'active' || node.status === 'secure';
              default: return false;
          }
      }
  }

  // Add more balance-related methods as needed (e.g., calculate resource regeneration, threat spawn rates, scoring)
} 
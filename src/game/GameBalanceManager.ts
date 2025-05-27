import { GameMode, NodeType, NodeStatus } from '../types/game';
import { Threat } from '../types';

export class GameBalanceManager {
  private static instance: GameBalanceManager;

  private constructor() {}

  public static getInstance(): GameBalanceManager {
    if (!GameBalanceManager.instance) {
      GameBalanceManager.instance = new GameBalanceManager();
    }
    return GameBalanceManager.instance;
  }

  // Base success rates for different actions
  private readonly successRates = {
    WHITE_HAT: {
      PATCH_ALL: 0.85,
      QUARANTINE: 0.75,
      BACKUP: 0.90,
      MONITOR: 0.95,
      SECURE_NODE: 0.80
    },
    BLACK_HAT: {
      SCAN_TARGETS: 0.90,
      QUARANTINE: 0.70,
      EXPLOIT: 0.65,
      BACKDOOR: 0.75,
      COMPROMISE_NODE: 0.70
    }
  };

  // Resource costs for actions
  private readonly resourceCosts = {
    WHITE_HAT: {
      PATCH_ALL: { energy: 25, bandwidth: 20, processing: 30 },
      QUARANTINE: { energy: 35, bandwidth: 25, processing: 40 },
      BACKUP: { energy: 25, bandwidth: 40, processing: 30 },
      MONITOR: { energy: 18, bandwidth: 28, processing: 22 }
    },
    BLACK_HAT: {
      SCAN_TARGETS: { energy: 18, bandwidth: 22, processing: 18 },
      QUARANTINE: { energy: 25, bandwidth: 30, processing: 25 },
      EXPLOIT: { energy: 40, bandwidth: 30, processing: 45 },
      BACKDOOR: { energy: 35, bandwidth: 40, processing: 35 },
      DENIAL_OF_SERVICE: { energy: 30, bandwidth: 40, processing: 30 }
    }
  };

  // Cooldown times for actions (in milliseconds)
  private readonly cooldowns = {
    WHITE_HAT: {
      PATCH_ALL: 30000,
      QUARANTINE: 45000,
      BACKUP: 60000,
      MONITOR: 25000
    },
    BLACK_HAT: {
      SCAN_TARGETS: 20000,
      QUARANTINE: 30000,
      EXPLOIT: 40000,
      BACKDOOR: 35000,
      DENIAL_OF_SERVICE: 50000
    }
  };

  // Node vulnerability and defense values
  private readonly nodeAttributes = {
    server: { baseVulnerability: 0.7, baseDefense: 0.6 },
    database: { baseVulnerability: 0.8, baseDefense: 0.7 },
    firewall: { baseVulnerability: 0.5, baseDefense: 0.9 },
    router: { baseVulnerability: 0.6, baseDefense: 0.8 },
    endpoint: { baseVulnerability: 0.9, baseDefense: 0.5 }
  };

  // Calculate success probability for an action
  public calculateSuccessProbability(
    action: string,
    mode: GameMode,
    nodeType: string,
    nodeStatus: NodeStatus,
    nodeDefense: number
  ): number {
    // Base probability
    let probability = 0.7;
    
    // Temporarily increase scan success rate for tutorial/initial phase
    if (action === 'SCAN' || action === 'SCAN_TARGETS') {
        probability = 0.95; // High probability for scan to ensure tutorial progression
    } else {
    // Adjust based on node type
    switch (nodeType) {
      case 'firewall': probability *= 0.8; break;
      case 'database': probability *= 0.9; break;
      case 'server': probability *= 1.0; break;
      case 'router': probability *= 0.7; break;
      case 'endpoint': probability *= 0.6; break;
    }
    
    // Adjust based on current status
    switch (nodeStatus) {
      case 'secure': probability *= 0.5; break;
      case 'patching': probability *= 0.7; break;
      case 'monitoring': probability *= 0.8; break;
      case 'vulnerable': probability *= 1.2; break;
      case 'compromised': probability *= 1.5; break;
    }

    // Adjust based on defense level
    probability *= (1 - (nodeDefense / 100));
    }
    
    return Math.min(0.95, Math.max(0.05, probability));
  }

  // Get resource costs for an action
  public getResourceCosts(action: string, mode: GameMode) {
    return this.resourceCosts[mode][action as keyof typeof this.resourceCosts[typeof mode]] || {
      energy: 0,
      bandwidth: 0,
      processing: 0
    };
  }

  // Get cooldown time for an action
  public getCooldownTime(action: string, mode: GameMode): number {
    return this.cooldowns[mode][action as keyof typeof this.cooldowns[typeof mode]] || 30000;
  }

  // Calculate node vulnerability based on type and status
  public calculateNodeVulnerability(nodeType: NodeType, status: NodeStatus): number {
    const baseVulnerability = this.nodeAttributes[nodeType].baseVulnerability;
    
    switch (status) {
      case 'secure':
        return baseVulnerability * 0.3;
      case 'compromised':
        return baseVulnerability * 1.5;
      case 'breached':
        return baseVulnerability * 2.0;
      case 'patching':
        return baseVulnerability * 0.5;
      case 'monitoring':
        return baseVulnerability * 0.7;
      default:
        return baseVulnerability;
    }
  }

  // Calculate node defense based on type and status
  public calculateNodeDefense(nodeType: NodeType, status: NodeStatus): number {
    const baseDefense = this.nodeAttributes[nodeType].baseDefense;
    
    switch (status) {
      case 'secure':
        return baseDefense * 1.5;
      case 'compromised':
        return baseDefense * 0.5;
      case 'breached':
        return baseDefense * 0.2;
      case 'patching':
        return baseDefense * 1.2;
      case 'monitoring':
        return baseDefense * 1.1;
      default:
        return baseDefense;
    }
  }

  // Calculate success probability for a threat degrading a node's status
  public calculateThreatSuccessProbability(
    threatSeverity: Threat['severity'],
    targetNodeStatus: NodeStatus,
    targetNodeDefense: number // This should be the effective defense of the node
  ): number {
    let baseChance = 0;

    // Base chance based on threat severity
    switch (threatSeverity) {
      case 'LOW':
        baseChance = 0.15;
        break;
      case 'MEDIUM':
        baseChance = 0.35;
        break;
      case 'HIGH':
        baseChance = 0.6;
        break;
      default:
        baseChance = 0.1;
    }

    // Modify chance based on node status
    switch (targetNodeStatus) {
      case 'secure':
        baseChance *= 0.3; // Much harder to compromise a secure node (was 0.5)
        break;
      case 'vulnerable':
        baseChance *= 1.8; // Easier to compromise a vulnerable node (was 1.5)
        break;
      case 'compromised':
        baseChance *= 1.4; // Easier to breach an already compromised node (was 1.2)
        break;
      case 'patching':
        baseChance *= 0.4; // Harder to compromise while patching (was 0.6)
        break;
      case 'monitoring':
        baseChance *= 0.6; // Slightly harder to compromise while monitored (was 0.8)
      default:
        // No change for 'active', 'scanning', 'breached'
        break;
    }

    // Modify chance based on node defense
    // Assuming targetNodeDefense is on a scale of 0-100
    // A simple inverse relationship: higher defense reduces chance
    // Make the impact of defense slightly stronger
    const defenseModifier = 1 - (targetNodeDefense / 150); // Was 100, now defense has a larger potential impact
    let adjustedChance = baseChance * defenseModifier;

    // Ensure chance stays within reasonable bounds
    return Math.max(0.01, Math.min(0.95, adjustedChance)); // Adjust min/max slightly
  }
} 
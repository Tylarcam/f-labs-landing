import { Threat, NetworkNode, NodeStatus, GameMode } from '../types';

export class ThreatManager {
  private static instance: ThreatManager;
  private activeThreats: Map<number, Threat>;
  private nodeThreatMap: Map<number, number[]>;
  private subscribers: Set<(threats: Threat[]) => void>;
  private cleanupInterval: NodeJS.Timeout | null;
  private actionCosts: Record<string, { energy: number; bandwidth: number; processing: number }>;

  private constructor() {
    this.activeThreats = new Map();
    this.nodeThreatMap = new Map();
    this.subscribers = new Set();
    this.cleanupInterval = null;
    this.startCleanupInterval();
    
    // Define action costs
    this.actionCosts = {
      SCAN_TARGETS: { energy: 10, bandwidth: 20, processing: 5 },
      EXPLOIT: { energy: 20, bandwidth: 10, processing: 30 },
      BACKDOOR: { energy: 30, bandwidth: 15, processing: 40 },
      PATCH_ALL: { energy: 15, bandwidth: 5, processing: 25 },
      QUARANTINE: { energy: 25, bandwidth: 30, processing: 15 },
      MONITOR: { energy: 5, bandwidth: 15, processing: 10 }
    };
  }

  public static getInstance(): ThreatManager {
    if (!ThreatManager.instance) {
      ThreatManager.instance = new ThreatManager();
    }
    return ThreatManager.instance;
  }

  private startCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => this.cleanupThreats(), 30000); // Cleanup every 30 seconds
  }

  public subscribeToThreats(callback: (threats: Threat[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    const threats = Array.from(this.activeThreats.values());
    this.subscribers.forEach(callback => callback(threats));
  }

  public isValidTarget(node: NetworkNode, mode: GameMode, actionType: string): boolean {
    // Base validation - node must be interactable
    if (!node.isInteractable) return false;

    // Mode-specific validation
    if (mode === 'WHITE_HAT') {
      switch (actionType) {
        case 'PATCH':
          // Can patch vulnerable or compromised nodes
          return node.status === 'vulnerable' || node.status === 'compromised';
        case 'QUARANTINE':
          // Can quarantine compromised or breached nodes
          return node.status === 'compromised' || node.status === 'breached';
        case 'MONITOR':
          // Can monitor any active node
          return node.status === 'active' || node.status === 'secure';
        case 'SCAN':
          // Can scan any node except those already being monitored
          return node.status !== 'monitoring';
        default:
          return false;
      }
    } else { // BLACK_HAT
      switch (actionType) {
        case 'SCAN_TARGETS':
          // Can scan any node except those already compromised
          return node.status !== 'compromised' && node.status !== 'breached';
        case 'EXPLOIT':
          // Can exploit vulnerable or active nodes
          return node.status === 'vulnerable' || node.status === 'active';
        case 'BACKDOOR':
          // Can backdoor compromised nodes
          return node.status === 'compromised';
        default:
          return false;
      }
    }
  }

  public canInteractWithNode(node: NetworkNode, mode: GameMode, actionType: string): boolean {
    // Base validation
    if (!node.isInteractable) return false;

    // If no specific action is being performed, allow interaction
    if (!actionType) return true;

    // Check if the node is a valid target for the current action
    return this.isValidTarget(node, mode, actionType);
  }

  public calculateSuccessProbability(
    action: string,
    mode: GameMode,
    nodeType: string,
    nodeStatus: NodeStatus,
    nodeDefense: number
  ): number {
    // Base probability
    let probability = 0.7;
    
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
    
    return Math.min(0.95, Math.max(0.05, probability));
  }

  private generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 1000000);
  }

  public generateThreatFromNodeStatus(
    node: NetworkNode,
    previousStatus: NodeStatus,
    currentStatus: NodeStatus,
    mode: GameMode,
    action?: string
  ): Threat | null {
    // Only generate threats for significant status changes
    if (previousStatus === currentStatus) return null;

    const threat: Threat = {
      id: this.generateUniqueId(),
      type: this.determineThreatType(node, previousStatus, currentStatus, mode, action),
      severity: this.calculateThreatSeverity(node, currentStatus, mode),
      source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: new Date().toLocaleTimeString(),
      status: this.determineThreatStatus(currentStatus, mode),
      targetNodeId: node.id,
      progress: 0,
      timeToComplete: this.calculateThreatDuration(currentStatus, mode)
    };

    this.activeThreats.set(threat.id, threat);
    
    // Update node-threat mapping
    const nodeThreats = this.nodeThreatMap.get(node.id) || [];
    nodeThreats.push(threat.id);
    this.nodeThreatMap.set(node.id, nodeThreats);

    this.notifySubscribers();
    return threat;
  }

  private calculateThreatDuration(status: NodeStatus, mode: GameMode): number {
    // Duration in milliseconds
    switch (status) {
      case 'scanning': return 5000;
      case 'vulnerable': return 8000;
      case 'compromised': return 12000;
      case 'breached': return 15000;
      case 'patching': return 10000;
      case 'monitoring': return 7000;
      default: return 5000;
    }
  }

  private determineThreatType(
    node: NetworkNode,
    previousStatus: NodeStatus,
    currentStatus: NodeStatus,
    mode: GameMode,
    action?: string
  ): string {
    if (mode === 'WHITE_HAT') {
      switch (currentStatus) {
        case 'scanning':
          return `Suspicious scanning activity detected on ${node.name}`;
        case 'vulnerable':
          return `Vulnerability detected on ${node.name}`;
        case 'compromised':
          return `Security breach detected on ${node.name}`;
        case 'breached':
          return `Critical system breach on ${node.name}`;
        case 'patching':
          return `Security patch in progress on ${node.name}`;
        case 'monitoring':
          return `Enhanced monitoring activated on ${node.name}`;
        case 'secure':
          return `Security measures implemented on ${node.name}`;
        default:
          return `Status change detected on ${node.name}`;
      }
    } else {
      switch (currentStatus) {
        case 'scanning':
          return `Scanning ${node.name} for vulnerabilities`;
        case 'vulnerable':
          return `Vulnerability exploited on ${node.name}`;
        case 'compromised':
          return `Successfully compromised ${node.name}`;
        case 'breached':
          return `Full system access achieved on ${node.name}`;
        case 'patching':
          return `Security patch intercepted on ${node.name}`;
        case 'monitoring':
          return `Monitoring system disabled on ${node.name}`;
        case 'active':
          return `Initial access gained on ${node.name}`;
        default:
          return `Status change on ${node.name}`;
      }
    }
  }

  private calculateThreatSeverity(
    node: NetworkNode,
    status: NodeStatus,
    mode: GameMode
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const severityMap: Record<NodeStatus, 'HIGH' | 'MEDIUM' | 'LOW'> = {
      'breached': 'HIGH',
      'compromised': 'HIGH',
      'vulnerable': 'MEDIUM',
      'scanning': 'LOW',
      'secure': mode === 'WHITE_HAT' ? 'LOW' : 'HIGH',
      'patching': 'MEDIUM',
      'monitoring': 'LOW',
      'active': 'LOW'
    };

    return severityMap[status];
  }

  private determineThreatStatus(
    status: NodeStatus,
    mode: GameMode
  ): 'NEUTRALIZED' | 'DETECTED' | 'SUCCESS' | 'EXECUTING' {
    if (mode === 'WHITE_HAT') {
      switch (status) {
        case 'secure':
        case 'patching':
        case 'monitoring':
          return 'NEUTRALIZED';
        case 'vulnerable':
        case 'compromised':
        case 'breached':
          return 'DETECTED';
        default:
          return 'EXECUTING';
      }
    } else {
      switch (status) {
        case 'secure':
        case 'patching':
        case 'monitoring':
          return 'DETECTED';
        case 'vulnerable':
        case 'compromised':
        case 'breached':
          return 'SUCCESS';
        default:
          return 'EXECUTING';
      }
    }
  }

  public getActionCosts(action: string): { energy: number; bandwidth: number; processing: number } {
    return this.actionCosts[action] || { energy: 0, bandwidth: 0, processing: 0 };
  }

  public updateThreatProgress(threatId: number, progress: number) {
    const threat = this.activeThreats.get(threatId);
    if (threat) {
      threat.progress = progress;
      this.notifySubscribers();
    }
  }

  public cleanupThreats() {
    const now = Date.now();
    let hasChanges = false;

    this.activeThreats.forEach((threat, id) => {
      // Remove threats that have been neutralized or successful for more than 30 seconds
      if ((threat.status === 'NEUTRALIZED' || threat.status === 'SUCCESS') && 
          now - Date.parse(threat.timestamp) > 30000) {
        this.activeThreats.delete(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.notifySubscribers();
    }
  }

  public reset() {
    this.activeThreats.clear();
    this.nodeThreatMap.clear();
    this.notifySubscribers();
  }

  // New method to handle threat progression and node status changes
  public processThreatProgression(
    threat: Threat,
    targetNode: NetworkNode,
    mode: GameMode
  ): { newThreatStatus: Threat['status'], newNodeStatus?: NodeStatus } {
    if (threat.status !== 'EXECUTING') {
      return { newThreatStatus: threat.status };
    }

    // Determine possible status transitions based on current status
    const possibleTransitions: Record<NodeStatus, NodeStatus[]> = {
      'active': ['vulnerable'],
      'vulnerable': ['compromised'],
      'compromised': ['breached'],
      'breached': ['breached'], // Terminal state
      'secure': ['vulnerable'],
      'patching': ['vulnerable'],
      'monitoring': ['vulnerable'],
      'scanning': ['vulnerable']
    };

    // Get possible next states for current node status
    const possibleNextStates = possibleTransitions[targetNode.status] || [];
    
    if (possibleNextStates.length === 0) {
      return { newThreatStatus: 'NEUTRALIZED' };
    }

    // Calculate success probability based on threat severity and node defense
    const successChance = this.calculateSuccessProbability(
      'EXPLOIT', // Using EXPLOIT as base action for threat progression
      mode,
      targetNode.type,
      targetNode.status,
      targetNode.defense
    );

    if (Math.random() < successChance) {
      // Threat succeeds - move to next state
      const nextState = possibleNextStates[0];
      return {
        newThreatStatus: nextState === 'breached' ? 'SUCCESS' : 'EXECUTING',
        newNodeStatus: nextState
      };
    }

    // Threat fails but continues executing
    return { newThreatStatus: 'EXECUTING' };
  }
} 
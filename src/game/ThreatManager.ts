import { Threat, NetworkNode, NodeStatus, GameMode } from '../types';

export class ThreatManager {
  private static instance: ThreatManager;
  private activeThreats: Map<number, Threat>;
  private nodeThreatMap: Map<number, number[]>;
  private subscribers: Set<(threats: Threat[]) => void>;
  private cleanupInterval: NodeJS.Timeout | null;
  private actionCosts: Record<string, { energy: number; bandwidth: number; processing: number }>;
  private threatCounter: number = 0; // Simple counter for unique threat IDs

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

  public canInteractWithNode(node: NetworkNode, mode: GameMode, action: string): boolean {
    // Always allow interaction if no specific action is being performed
    if (!action) return true;

    // Check if node is interactable
    if (!node.isInteractable) return false;

    // Check if node is in a valid state for the action
    switch (action) {
      case 'SCAN_TARGETS':
        return node.status === 'active' || node.status === 'vulnerable';
      case 'EXPLOIT':
        return node.status === 'vulnerable' || node.status === 'active';
      case 'BACKDOOR':
        return node.status === 'compromised';
      case 'DENIAL_OF_SERVICE':
        return node.status === 'active' || node.status === 'vulnerable';
      case 'PATCH_ALL':
        return node.status === 'vulnerable' || node.status === 'compromised';
      case 'QUARANTINE':
        return node.status === 'compromised' || node.status === 'breached';
      case 'BACKUP':
        return node.status === 'active' || node.status === 'secure';
      case 'MONITOR':
        return node.status === 'active' || node.status === 'secure';
      default:
        return true;
    }
  }

  public isValidTarget(node: NetworkNode, mode: GameMode, action: string): boolean {
    // Check if node is interactable
    if (!node.isInteractable) return false;

    // Check if node is in a valid state for the action
    switch (action) {
      case 'SCAN_TARGETS':
        return node.status === 'active' || node.status === 'vulnerable';
      case 'EXPLOIT':
        return node.status === 'vulnerable' || node.status === 'active';
      case 'BACKDOOR':
        return node.status === 'compromised';
      case 'DENIAL_OF_SERVICE':
        return node.status === 'active' || node.status === 'vulnerable';
      case 'PATCH_ALL':
        return node.status === 'vulnerable' || node.status === 'compromised';
      case 'QUARANTINE':
        return node.status === 'compromised' || node.status === 'breached';
      case 'BACKUP':
        return node.status === 'active' || node.status === 'secure';
      case 'MONITOR':
        return node.status === 'active' || node.status === 'secure';
      default:
        return true;
    }
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
    mode: GameMode
  ): Threat | null {
    // Only generate threats for status changes
    if (previousStatus === currentStatus) return null;

    // Generate threat based on status change
    switch (currentStatus) {
      case 'compromised':
        return {
          id: Date.now(),
          type: 'SYSTEM_BREACH',
          severity: 'HIGH',
          source: node.name,
          status: 'ACTIVE',
          timestamp: new Date().toLocaleTimeString()
        };
      case 'breached':
        return {
          id: Date.now(),
          type: 'CRITICAL_BREACH',
          severity: 'HIGH',
          source: node.name,
          status: 'ACTIVE',
          timestamp: new Date().toLocaleTimeString()
        };
      case 'vulnerable':
        return {
          id: Date.now(),
          type: 'VULNERABILITY_DETECTED',
          severity: 'MEDIUM',
          source: node.name,
          status: 'ACTIVE',
          timestamp: new Date().toLocaleTimeString()
        };
      default:
        return null;
    }
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

      // Update threat progress for executing threats
      if (threat.status === 'EXECUTING') {
        const elapsedTime = now - Date.parse(threat.timestamp);
        const progress = Math.min(100, (elapsedTime / 15000) * 100); // 15 seconds for full progress
        threat.progress = progress;
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
    this.threatCounter = 0;
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

  public generateThreat(gameMode: GameMode, networkNodes: NetworkNode[]): Threat | null {
    // Simple threat generation logic (can be made more complex)
    if (Math.random() < 0.1) { // 10% chance to generate a threat each call (e.g., per game tick)
      this.threatCounter++;
      const id = `threat-${this.threatCounter}`;
      const type = Math.random() < 0.6 ? 'Malware' : Math.random() < 0.8 ? 'Phishing Attempt' : 'Vulnerability Scan';
      const severity = Math.random() < 0.5 ? 'LOW' : Math.random() < 0.85 ? 'MEDIUM' : 'HIGH';
      const timestamp = new Date().toLocaleTimeString();
      const source = gameMode === 'BLACK_HAT' ? 'Internal Network' : 'External'; // Simplified source

      // Select a random active or vulnerable node as a potential target
      const potentialTargets = networkNodes.filter(node => node.status === 'active' || node.status === 'vulnerable');
      const targetNodeId = potentialTargets.length > 0 ? potentialTargets[Math.floor(Math.random() * potentialTargets.length)].id : undefined;

      const newThreat: Threat = {
        id,
        type,
        severity,
        timestamp,
        source,
        targetNodeId,
        status: 'ACTIVE',
      };

      this.activeThreats.set(Date.now(), newThreat);
      console.log('Threat generated:', newThreat);
      return newThreat;
    }

    return null; // No threat generated
  }

  public getThreats(): Threat[] {
    return Array.from(this.activeThreats.values());
  }

  public mitigateThreat(threatId: string): boolean {
    const threat = this.activeThreats.get(Date.parse(threatId));
    if (threat) {
      threat.status = 'MITIGATED';
      console.log(`Threat ${threatId} mitigated.`);
      // Optional: Remove mitigated threats after a delay or under certain conditions
      return true;
    }
    return false;
  }

  public resolveThreat(threatId: string): boolean {
    const threat = this.activeThreats.get(Date.parse(threatId));
    if (threat) {
      threat.status = 'RESOLVED';
      // Optional: Remove resolved threats
      this.activeThreats.delete(Date.parse(threatId));
      console.log(`Threat ${threatId} resolved.`);
      return true;
    }
    return false;
  }

  public destroy() {
    // Clean up resources when the game is destroyed
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.activeThreats.clear();
    this.nodeThreatMap.clear();
    this.subscribers.clear();
  }
} 
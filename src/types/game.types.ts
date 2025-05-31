export type NodeStatus = 
  | 'active'      // Node is operational
  | 'secure'      // Node is protected (White Hat)
  | 'patching'    // Node is being patched
  | 'monitoring'  // Node is under surveillance
  | 'compromised' // Node is breached (Black Hat)
  | 'breached'    // Node is fully compromised
  | 'scanning'    // Node is being scanned
  | 'vulnerable'
  | 'quarantined'
  | 'backed_up'
  | 'detected'
  | 'overloaded'
  | 'degraded';

export type NodeType = 'server' | 'database' | 'firewall' | 'router' | 'endpoint';

export type GameMode = 'WHITE_HAT' | 'BLACK_HAT';
export type GamePlayMode = 'GAME';

export type SystemStatus = 'IDLE' | 'SECURING' | 'ATTACKING' | 'SECURED' | 'BREACHED';

export type ParticleActivityLevel = 'normal' | 'intense';

export type GameState = {
  mode: 'IDLE' | 'PLAYING' | 'WHITE_HAT_WIN' | 'BLACK_HAT_WIN' | 'GAME_OVER_LOSS';
  playMode: GamePlayMode;
  isWhiteHat: boolean;
  isTransitioning: boolean;
  isGameStarted: boolean;
  resources: {
    energy: number;
    bandwidth: number;
    processing: number;
  };
  cooldowns: Record<string, number>;
  actionState: {
    mode: 'IDLE' | 'SELECTING_TARGET' | 'EXECUTING';
    currentAction: string | null;
    targetNodeId: number | null;
    cooldownEndTime: number | null;
  };
  systemStatus: SystemStatus;
  targetStatus: {
    firewall: 'ACTIVE' | 'COMPROMISED';
    encryption: 'MAXIMUM' | 'DEGRADED';
    accessControl: 'ENFORCED' | 'BYPASSED';
    systemIntegrity: number;
  };
  selectedNodeId: number | null;
  nodeStateTimers: Record<number, { status: NodeStatus; startTime: number }>;
  actionLogs: string[];
  terminalLines: string[];
  progress: number;
  particleActivityLevel: ParticleActivityLevel;
  missionState: {
    currentMissionId: string | null;
    timeRemaining: number;
    objectivesCompleted: number;
    totalObjectives: number;
    missionType: 'DEFEND_CRITICAL' | 'SECURE_NETWORK' | 'BREACH_TARGET' | 'STEALTH_INFILTRATION' | 'TIME_ATTACK';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    rewards: {
      score: number;
      title: string;
    };
  };
  networkState: {
    totalNodes: number;
    secureNodes: number;
    compromisedNodes: number;
    vulnerableNodes: number;
    criticalPathNodes: number[];
    isolatedNodes: number[];
  };
  threatState: {
    activeThreats: number;
    blockedThreats: number;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    lastThreatTime: number;
  };
};

export interface ActionEffect {
  type: 'status' | 'vulnerability' | 'defense' | 'resource';
  value: number;
  duration?: number;
  target: 'node' | 'system' | 'global';
}

export interface GameAction {
  name: string;
  cost: number;
  cooldown: number;
  successRate: number;
  effects: ActionEffect[];
  requirements?: {
    resources?: Partial<GameState['resources']>;
    status?: NodeStatus[];
  };
} 
export type NodeStatus = 
  | 'active'      // Node is operational
  | 'secure'      // Node is protected (White Hat)
  | 'patching'    // Node is being patched
  | 'monitoring'  // Node is under surveillance
  | 'compromised' // Node is breached (Black Hat)
  | 'breached'    // Node is fully compromised
  | 'scanning'    // Node is being scanned
  | 'vulnerable';

export type NodeType = 'server' | 'database' | 'firewall' | 'router' | 'endpoint';

export type GameMode = 'WHITE_HAT' | 'BLACK_HAT';

export type SystemStatus = 'IDLE' | 'SECURING' | 'ATTACKING' | 'SECURED' | 'BREACHED';

export type ParticleActivityLevel = 'normal' | 'intense';

export interface NetworkNode {
  id: number;
  x: number;
  y: number;
  z: number;
  status: NodeStatus;
  type: NodeType;
  name: string;
  layer: 'frontend' | 'security' | 'network' | 'backend';
  defense: number;  // 0-100 defense strength
  isInteractable: boolean;  // Whether the node can be interacted with
  isHovered?: boolean;
  isDragging?: boolean;
  vulnerabilities?: number;
  defenses?: number;
  lastAction?: string;
  lastActionTime?: number;
  pulseEffect?: 'none' | 'warning' | 'alert' | 'success';  // Visual feedback
  statusChangeTime?: number;  // When the status last changed
  feedbackStatus?: 'success' | 'failure' | null; // New: Feedback status for actions
  feedbackEndTime?: number; // New: Timestamp when feedback should end
  highlighted?: boolean; // New: To indicate if the node should be highlighted
}

export interface GameState {
  mode: GameMode;
  score: number;
  timeRemaining: number;
  isActive: boolean;
  systemStatus: SystemStatus;
  resources: {
    energy: number;
    bandwidth: number;
    processing: number;
  };
  objectives: Objective[];
  actionCooldowns: Record<string, number>;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  reward: number;
  requirements: {
    type: string;
    target: number;
    current: number;
    targetNodeId?: number;
    lastUpdateTime?: number;
  }[];
  timeLimit?: number;
  isCompleted: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startTime?: number;
}

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

export interface Threat {
  id: number;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  timestamp: string;
  status: 'NEUTRALIZED' | 'DETECTED' | 'SUCCESS' | 'EXECUTING';
  targetNodeId?: number;  // Which node this threat is targeting
  progress?: number;  // 0-100 progress of the threat
  timeToComplete?: number;  // Time in ms until threat completes
} 
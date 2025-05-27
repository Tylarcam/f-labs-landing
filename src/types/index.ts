export interface NetworkNode {
  id: number;
  x: number;
  y: number;
  z: number;
  status: 'active' | 'secure' | 'scanning' | 'vulnerable' | 'compromised' | 'breached' | 'patching' | 'monitoring';
  type: 'server' | 'database' | 'firewall' | 'router' | 'endpoint';
  name: string;
  layer: 'frontend' | 'security' | 'network' | 'backend';
  defense: number;  // 0-100 defense strength
  lastAction?: string;
  lastActionTime?: number;
  isInteractable: boolean;  // Whether the node can be interacted with
  pulseEffect?: 'none' | 'warning' | 'alert' | 'success';  // Visual feedback
  statusChangeTime?: number;  // When the status last changed
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

export interface Transform3D {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export type SystemStatus = 'IDLE' | 'SECURING' | 'ATTACKING' | 'SECURED' | 'BREACHED';
export type ParticleActivityLevel = 'normal' | 'intense';

export * from './game'; 
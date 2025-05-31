export type { NetworkNode } from './game';

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
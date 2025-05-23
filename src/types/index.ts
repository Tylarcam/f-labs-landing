export interface NetworkNode {
  id: number;
  x: number;
  y: number;
  z: number;
  status: 'active' | 'secure' | 'patching' | 'monitoring' | 'compromised' | 'breached' | 'scanning' | 'vulnerable';
  type: 'server' | 'database' | 'firewall' | 'router' | 'endpoint';
  name: string;
  layer: 'frontend' | 'security' | 'network' | 'backend';
}

export interface Threat {
  id: number;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  timestamp: string;
  status: 'NEUTRALIZED' | 'DETECTED' | 'SUCCESS' | 'EXECUTING';
}

export interface Transform3D {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export type SystemStatus = 'IDLE' | 'SECURING' | 'ATTACKING' | 'SECURED' | 'BREACHED';
export type ParticleActivityLevel = 'normal' | 'intense'; 
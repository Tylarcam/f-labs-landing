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
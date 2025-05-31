import { NodeStatus, NodeType } from './game.types';

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
  connections?: number[]; // Array of connected node IDs
  isSelected?: boolean; // New: To indicate if the node is currently selected
} 
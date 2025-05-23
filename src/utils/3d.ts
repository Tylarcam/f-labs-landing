import { NetworkNode, Transform3D } from '../types';

export function transform3DNode(
  node: NetworkNode, 
  rotationX: number, 
  rotationY: number, 
  zoom: number
): Transform3D {
  const centerX = 50;
  const centerY = 50;
  const centerZ = 35;
  
  let x = (node.x - centerX) * zoom;
  let y = (node.y - centerY) * zoom;
  let z = (node.z - centerZ) * zoom;
  
  const radX = (rotationX * Math.PI) / 180;
  const radY = (rotationY * Math.PI) / 180;
  
  const newX = x * Math.cos(radY) - z * Math.sin(radY);
  const newZ = x * Math.sin(radY) + z * Math.cos(radY);
  x = newX;
  z = newZ;
  
  const newY = y * Math.cos(radX) - z * Math.sin(radX);
  z = y * Math.sin(radX) + z * Math.cos(radX);
  y = newY;
  
  const perspective = 400;
  const scale = perspective / (perspective + z);
  
  return {
    x: centerX + x * scale,
    y: centerY + y * scale,
    scale: scale,
    depth: z
  };
}

export function getLayerColor(layer: string): string {
  switch (layer) {
    case 'frontend': return 'rgba(34, 197, 94, 0.3)';
    case 'security': return 'rgba(239, 68, 68, 0.3)';
    case 'network': return 'rgba(59, 130, 246, 0.3)';
    case 'backend': return 'rgba(168, 85, 247, 0.3)';
    default: return 'rgba(156, 163, 175, 0.3)';
  }
} 
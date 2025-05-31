import React, { useRef, useEffect } from 'react';
import { NetworkNode } from '../types/network.types';
import { GameMode } from '../types/game.types';

interface NetworkVisualizationProps {
  nodes: NetworkNode[];
  onNodeClick: (node: NetworkNode) => void;
  mode: GameMode;
  isTransitioning: boolean;
  targetingMode: {
    isActive: boolean;
    actionType: string | null;
  };
  selectedNodeId: number | null;
}

export default function NetworkVisualization({
  nodes,
  onNodeClick,
  mode,
  isTransitioning,
  targetingMode,
  selectedNodeId
}: NetworkVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Node rendering helper
  const getNodeColor = (node: NetworkNode) => {
    if (node.feedbackStatus === 'success') return 'bg-green-500';
    if (node.feedbackStatus === 'failure') return 'bg-red-500';
    if (node.isSelected) return mode === 'WHITE_HAT' ? 'bg-blue-500' : 'bg-green-500';
    if (node.highlighted) return 'bg-yellow-500';
    
    switch (node.status) {
      case 'active': return 'bg-gray-500';
      case 'secure': return 'bg-blue-500';
      case 'compromised': return 'bg-red-500';
      case 'breached': return 'bg-purple-500';
      case 'vulnerable': return 'bg-yellow-500';
      case 'monitoring': return 'bg-cyan-500';
      case 'quarantined': return 'bg-orange-500';
      case 'backed_up': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeSize = (node: NetworkNode) => {
    const baseSize = 8;
    if (node.isSelected) return baseSize * 1.5;
    if (node.highlighted) return baseSize * 1.3;
    return baseSize;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-900/50 rounded-lg overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div 
        className="absolute inset-0"
        style={{
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Render nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => onNodeClick(node)}
            className={`absolute rounded-full transition-all duration-300 cursor-pointer
              ${getNodeColor(node)}
              ${node.isInteractable ? 'hover:scale-110' : 'opacity-50 cursor-not-allowed'}
              ${targetingMode.isActive ? 'animate-pulse' : ''}
            `}
            style={{
              width: `${getNodeSize(node)}px`,
              height: `${getNodeSize(node)}px`,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: `translateZ(${node.z}px)`,
              boxShadow: node.isSelected ? '0 0 10px currentColor' : 'none'
            }}
            title={`${node.name} (${node.status})`}
          />
        ))}

        {/* Render connections */}
        {nodes.map((node) => (
          node.connections?.map((targetId) => {
            const targetNode = nodes.find(n => n.id === targetId);
            if (!targetNode) return null;

            const dx = targetNode.x - node.x;
            const dy = targetNode.y - node.y;
            const dz = targetNode.z - node.z;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            return (
              <div
                key={`${node.id}-${targetId}`}
                className="absolute bg-gray-500/30"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: `${length}%`,
                  height: '1px',
                  transform: `rotate(${angle}deg) translateZ(${(node.z + targetNode.z) / 2}px)`,
                  transformOrigin: '0 0'
                }}
              />
            );
          })
        ))}
      </div>

      {/* Targeting overlay */}
      {targetingMode.isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-dashed border-yellow-400/50 animate-pulse" />
          <div className="absolute top-4 left-4 bg-black/80 text-yellow-400 px-4 py-2 rounded">
            Select target for: {targetingMode.actionType}
          </div>
        </div>
      )}
    </div>
  );
} 
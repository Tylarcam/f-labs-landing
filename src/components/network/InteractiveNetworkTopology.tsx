import React, { useEffect, useRef, useState } from 'react';
import { NetworkNode, NodeStatus, GameMode } from '../../types';
import { ThreatManager } from '../../game/ThreatManager';
import { Server, Database, Shield, Wifi, Monitor } from 'lucide-react';
import { useGameState } from '../../hooks/useGameState';
import { useGameInteraction } from '../../hooks/useGameInteraction';
import { useNodeInteraction } from '../../hooks/useNodeInteraction';
import { useNodeStatus } from '../../hooks/useNodeStatus';
import { useNodeVisibility } from '../../hooks/useNodeVisibility';
import { useNodeAnimation } from '../../hooks/useNodeAnimation';
import { useNodeSelection } from '../../hooks/useNodeSelection';
import { useNodeFeedback } from '../../hooks/useNodeFeedback';
import { useNodeEffects } from '../../hooks/useNodeEffects';
import { useNodeConnections } from '../../hooks/useNodeConnections';
import { useNodeLabels } from '../../hooks/useNodeLabels';
import { useNodeIcons } from '../../hooks/useNodeIcons';
import { useNodeColors } from '../../hooks/useNodeColors';
import { useNodeShapes } from '../../hooks/useNodeShapes';
import { useNodeSizes } from '../../hooks/useNodeSizes';
import { useNodePositions } from '../../hooks/useNodePositions';
import { useNodeInteractions } from '../../hooks/useNodeInteractions';
import { useNodeAnimations } from '../../hooks/useNodeAnimations';
import { useNodeTransitions } from '../../hooks/useNodeTransitions';
import { useNodeGestures } from '../../hooks/useNodeGestures';
import { useNodeAccessibility } from '../../hooks/useNodeAccessibility';
import { useNodePerformance } from '../../hooks/useNodePerformance';
import { useNodeDebug } from '../../hooks/useNodeDebug';
import { useNodeMetrics } from '../../hooks/useNodeMetrics';
import { useNodeAnalytics } from '../../hooks/useNodeAnalytics';
import { useNodeErrorBoundary } from '../../hooks/useNodeErrorBoundary';
import { useNodeContext } from '../../hooks/useNodeContext';
import { useNodeState } from '../../hooks/useNodeState';
import { useNodeRefs } from '../../hooks/useNodeRefs';
import { useNodeCallbacks } from '../../hooks/useNodeCallbacks';

interface Props {
  nodes: NetworkNode[];
  onNodeClick?: (node: NetworkNode) => void;
  mode: GameMode;
  isTransitioning: boolean;
  targetingMode: { isActive: boolean; actionType: string | null };
  selectedNodeId?: number | null;
}

const InteractiveNetworkTopology: React.FC<Props> = ({
  nodes = [],
  onNodeClick,
  mode,
  isTransitioning,
  targetingMode,
  selectedNodeId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const threatManager = ThreatManager.getInstance();
  const { gameState } = useGameState();
  const { 
    selectedNode,
    actionTarget,
    handleNodeSelection,
    handleActionTargeting
  } = useGameInteraction();

  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  useEffect(() => {
    if (containerRef.current) {
      setCanvasWidth(containerRef.current.offsetWidth);
      setCanvasHeight(containerRef.current.offsetHeight);
    }
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="w-full h-full" />;
      case 'database':
        return <Database className="w-full h-full" />;
      case 'firewall':
        return <Shield className="w-full h-full" />;
      case 'router':
        return <Wifi className="w-full h-full" />;
      case 'endpoint':
        return <Monitor className="w-full h-full" />;
      default:
        return null;
    }
  };

  const getNodeColor = (node: NetworkNode): string => {
    switch (node.status) {
      case 'secure':
        return '#4CAF50'; // Green
      case 'scanning':
        return '#FFC107'; // Yellow
      case 'vulnerable':
        return '#FF9800'; // Orange
      case 'compromised':
        return '#F44336'; // Red
      case 'breached':
        return '#D32F2F'; // Dark Red
      case 'patching':
        return '#2196F3'; // Blue
      case 'monitoring':
        return '#9C27B0'; // Purple
      case 'active':
        return '#607D8B'; // Blue Grey
      case 'quarantined':
        return '#795548'; // Brown
      case 'backed_up':
        return '#009688'; // Teal
      case 'detected':
        return '#E91E63'; // Pink
      case 'overloaded':
        return '#FF5722'; // Deep Orange
      case 'degraded':
        return '#9E9E9E'; // Grey
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const getConnectionColor = (node1: NetworkNode, node2: NetworkNode): string => {
    const isSecure = node1.status === 'secure' && node2.status === 'secure';
    const isCompromised = node1.status === 'compromised' || node2.status === 'compromised';
    const isBreached = node1.status === 'breached' || node2.status === 'breached';

    if (isBreached) return '#D32F2F'; // Dark Red
    if (isCompromised) return '#F44336'; // Red
    if (isSecure) return '#4CAF50'; // Green
    return '#666666'; // Grey
  };

  const transform3DNode = (x: number, y: number, z: number) => {
    // Use canvas dimensions dynamically
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const scale = 0.7 + (z / 100) * 0.3; // Adjusted scale based on z-depth

    // Apply rotation
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    // Apply 3D transformation relative to center
    const x3d = (x / 100) * canvasWidth - centerX;
    const y3d = (y / 100) * canvasHeight - centerY;
    const z3d = z - 50; // Center z around 50

    const x2d = x3d * cosY + z3d * sinY;
    const y2d = y3d * cosX - (x3d * sinY - z3d * cosY) * sinX;
    const z2d = -(x3d * sinY - z3d * cosY) * cosX - y3d * sinX;

    // Apply perspective and scale
    const perspective = 800; // Adjusted perspective value
    const scale3d = perspective / (perspective + z2d);
    const x2dFinal = centerX + x2d * scale3d * scale * zoom;
    const y2dFinal = centerY + y2d * scale3d * scale * zoom;

    return { x: x2dFinal, y: y2dFinal, scale: scale3d * scale * zoom };
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    scale: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Only proceed if nodes array exists and has items
    if (nodes && Array.isArray(nodes) && nodes.length > 0) {
      // Transform all nodes to 3D space for connection drawing
      const transformedNodesForConnections = nodes.map(node => ({
        ...node,
        ...transform3DNode(node.x, node.y, node.z)
      }));

      // Draw connections (sort by Z for correct overlap if needed, but for simple lines it's less critical)
      // transformedNodesForConnections.sort((a, b) => a.z - b.z);

      transformedNodesForConnections.forEach((node, i) => {
        if (i < transformedNodesForConnections.length - 1) {
          const nextNode = transformedNodesForConnections[i + 1];
          // Check if nodes are connected based on the hardcoded connections array in GameDemoDisplay
          // This is a temporary workaround until connections are dynamically managed or passed as props
          const connections = [
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 6 },
            { from: 4, to: 5 },
            { from: 4, to: 6 },
          ];

          const isConnected = connections.some(conn => 
            (conn.from === node.id && conn.to === nextNode.id) || 
            (conn.from === nextNode.id && conn.to === node.id)
          );

          if (isConnected) {
             drawConnection(
              ctx,
              node.x,
              node.y,
              nextNode.x,
              nextNode.y,
              getConnectionColor(node, nextNode),
              node.scale
            );
          }
        }
      });
    }

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (nodes && Array.isArray(nodes) && nodes.length > 0) {
      animate();
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, mode, isTransitioning, rotationX, rotationY, zoom, canvasWidth, canvasHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    
    setRotationY(prev => prev + deltaX * 0.01);
    setRotationX(prev => prev + deltaY * 0.01);
    
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
  };

  const handleNodeClick = (node: NetworkNode) => {
    if (targetingMode.isActive) {
      handleActionTargeting(node);
    } else {
      handleNodeSelection(node);
    }
    onNodeClick?.(node);
  };

  const NodeElement: React.FC<{ 
    node: NetworkNode,
    onClick: (node: NetworkNode) => void,
    mode: GameMode,
    threatManager: ThreatManager,
    x: number,
    y: number,
    scale: number,
    isTargeting: boolean,
    targetingAction: string | null;
    isSelected: boolean;
  }> = ({ node, onClick, mode, threatManager, x, y, scale, isTargeting, targetingAction, isSelected }) => {
    const [dragging, setDragging] = useState(false);
    const nodeRef = useRef<HTMLDivElement>(null);

    const isInteractable = node.isInteractable && threatManager.canInteractWithNode(node, mode, targetingAction || '');
    const baseSize = 60; // Base size for the node HTML element
    const size = baseSize * scale;

    // Determine if this node is a valid target for the current action
    const isValidTarget = isTargeting && targetingAction ? threatManager.isValidTarget(node, mode, targetingAction) : true;

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling
      if (isInteractable) {
        onClick(node);
      }
    };

    return (
      <div
        ref={nodeRef}
        className={`absolute group cursor-pointer select-none
          ${isTargeting ? 'border-2 border-dashed border-yellow-400' : ''}
          ${isInteractable ? '' : 'opacity-50 cursor-not-allowed'}
          ${isSelected ? 'border-2 border-solid border-purple-400 ring-2 ring-purple-400' : ''}
        `}
        style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%) scale(${scale})', zIndex: dragging ? 10 : 1 }}
        onClick={handleClick}
      >
        {/* Node Circle */}
        <div 
          className={`w-full h-full rounded-full border-2 flex items-center justify-center bg-gray-900/80 relative
            ${isTargeting ? 'animate-pulse' : ''}
            ${isTargeting && !isValidTarget ? 'opacity-50' : ''}
            ${isTargeting && isValidTarget ? 'ring-4 ring-current' : ''}`}
          style={{ 
            borderColor: isInteractable ? '#FFFFFF' : '#666666',
            backgroundColor: getNodeColor(node),
            boxShadow: isTargeting && isValidTarget ? '0 0 20px currentColor' : 'none'
          }}
        >
          {/* Icon */}
          <div className="w-1/2 h-1/2 text-white">
            {getNodeIcon(node.type)}
          </div>
          
          {/* Targeting Indicator */}
          {isTargeting && isValidTarget && (
            <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
          )}
        </div>

        {/* Node Label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-center">
          <div className="font-bold text-white">{node.name}</div>
          <div className={`text-xs ${mode === 'WHITE_HAT' ? 'text-blue-400' : 'text-green-400'}`}>{node.status.toUpperCase()}</div>
          {isTargeting && !isValidTarget && (
            <div className="text-xs text-red-400 mt-1">Invalid Target</div>
          )}
        </div>

        {/* Action Tooltip */}
        {isTargeting && isValidTarget && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
            {targetingAction}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Canvas for Connections */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          borderRadius: '8px',
        }}
      />

      {/* HTML Elements for Nodes */}
      {nodes.map(node => {
        const transformed = transform3DNode(node.x, node.y, node.z);
        const isValidTarget = targetingMode.isActive && targetingMode.actionType 
          ? threatManager.isValidTarget(node, mode, targetingMode.actionType) 
          : true;

        const isSelected = node.id === selectedNodeId || node === selectedNode;
        const isActionTarget = node === actionTarget;

        return (
          <div
            key={`node-${node.id}`}
            className={`absolute group cursor-pointer select-none transition-all duration-200
              ${targetingMode.isActive ? (isValidTarget ? '' : 'opacity-50') : ''}
              ${isSelected ? 'border-2 border-solid border-purple-400 ring-2 ring-purple-400' : ''}
              ${isActionTarget ? 'border-2 border-solid border-red-400 ring-2 ring-red-400' : ''}
              ${node.feedbackStatus === 'success' ? 'ring-2 ring-green-500' : ''}
              ${node.feedbackStatus === 'failure' ? 'ring-2 ring-red-500' : ''}
            `}
            style={{
              left: `${transformed.x}px`,
              top: `${transformed.y}px`,
              transform: `translate(-50%, -50%) scale(${transformed.scale})`,
              zIndex: Math.round(transformed.scale * 10),
              pointerEvents: isTransitioning ? 'none' : 'auto',
            }}
            onClick={() => handleNodeClick(node)}
          >
            {/* Node Circle */}
            <div 
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-gray-900/80 relative
                ${targetingMode.isActive ? (isValidTarget ? 'animate-pulse' : '') : ''}
                ${isActionTarget ? 'animate-pulse' : ''}
              `}
              style={{ 
                borderColor: isTransitioning ? '#666666' : '#FFFFFF',
                backgroundColor: getNodeColor(node),
                boxShadow: (targetingMode.isActive && isValidTarget) || isActionTarget ? '0 0 20px currentColor' : 'none'
              }}
            >
              {/* Icon */}
              <div className="w-1/2 h-1/2 text-white">
                {getNodeIcon(node.type)}
              </div>
              
              {/* Targeting Indicator */}
              {(targetingMode.isActive && isValidTarget) || isActionTarget ? (
                <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
              ) : null}
            </div>

            {/* Node Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-center">
              <div className="font-bold text-white">{node.name}</div>
              <div className={`text-xs ${mode === 'WHITE_HAT' ? 'text-blue-400' : 'text-green-400'}`}>
                {node.status.toUpperCase()}
              </div>
              {targetingMode.isActive && !isValidTarget && (
                <div className="text-xs text-red-400 mt-1">Invalid Target</div>
              )}
            </div>

            {/* Action Tooltip */}
            {(targetingMode.isActive && isValidTarget && targetingMode.actionType) || isActionTarget ? (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                {targetingMode.actionType || 'Executing Action...'}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default InteractiveNetworkTopology; 
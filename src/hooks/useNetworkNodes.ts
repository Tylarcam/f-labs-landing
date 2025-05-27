import { useState, useEffect } from 'react';
import { NetworkNode, NodeStatus } from '../types/game';

export function useNetworkNodes(isWhiteHat: boolean, isTransitioning: boolean) {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([
    { 
      id: 1, 
      x: 25, 
      y: 20, 
      z: 10, 
      status: 'active' as NodeStatus,
      type: 'server', 
      name: 'WEB-01', 
      layer: 'frontend',
      defense: 50,
      isInteractable: true
    },
    { 
      id: 2, 
      x: 60, 
      y: 15, 
      z: 30, 
      status: 'active' as NodeStatus,
      type: 'firewall', 
      name: 'FW-MAIN', 
      layer: 'security',
      defense: 80,
      isInteractable: true
    },
    { 
      id: 3, 
      x: 80, 
      y: 40, 
      z: 50, 
      status: 'active' as NodeStatus,
      type: 'database', 
      name: 'DB-CORE', 
      layer: 'backend',
      defense: 60,
      isInteractable: true
    },
    { 
      id: 4, 
      x: 40, 
      y: 65, 
      z: 20, 
      status: 'active' as NodeStatus,
      type: 'router', 
      name: 'RTR-01', 
      layer: 'network',
      defense: 70,
      isInteractable: true
    },
    { 
      id: 5, 
      x: 15, 
      y: 70, 
      z: 40, 
      status: 'active' as NodeStatus,
      type: 'endpoint', 
      name: 'WS-05', 
      layer: 'frontend',
      defense: 40,
      isInteractable: true
    },
    { 
      id: 6, 
      x: 75, 
      y: 75, 
      z: 60, 
      status: 'active' as NodeStatus,
      type: 'server', 
      name: 'APP-02', 
      layer: 'backend',
      defense: 55,
      isInteractable: true
    }
  ]);

  useEffect(() => {
    if (!isTransitioning) {
      setNetworkNodes(prev => 
        prev.map(node => ({
          ...node,
          status: (isWhiteHat ? 'secure' : 'active') as NodeStatus,
          isInteractable: true
        }))
      );
    }
  }, [isWhiteHat, isTransitioning]);

  return { networkNodes, setNetworkNodes };
} 
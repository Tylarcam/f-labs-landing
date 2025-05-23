import { useState, useEffect } from 'react';
import { NetworkNode } from '../types';

export function useNetworkNodes(isWhiteHat: boolean, isTransitioning: boolean) {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([
    { id: 1, x: 25, y: 20, z: 10, status: 'active', type: 'server', name: 'WEB-01', layer: 'frontend' },
    { id: 2, x: 60, y: 15, z: 30, status: 'active', type: 'firewall', name: 'FW-MAIN', layer: 'security' },
    { id: 3, x: 80, y: 40, z: 50, status: 'active', type: 'database', name: 'DB-CORE', layer: 'backend' },
    { id: 4, x: 40, y: 65, z: 20, status: 'active', type: 'router', name: 'RTR-01', layer: 'network' },
    { id: 5, x: 15, y: 70, z: 40, status: 'active', type: 'endpoint', name: 'WS-05', layer: 'frontend' },
    { id: 6, x: 75, y: 75, z: 60, status: 'active', type: 'server', name: 'APP-02', layer: 'backend' }
  ]);

  useEffect(() => {
    if (!isTransitioning) {
      setNetworkNodes(prev => 
        prev.map(node => ({
          ...node,
          status: isWhiteHat ? 'secure' : 'active'
        }))
      );
    }
  }, [isWhiteHat, isTransitioning]);

  return { networkNodes, setNetworkNodes };
} 
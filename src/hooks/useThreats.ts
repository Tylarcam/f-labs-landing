import { useState, useEffect } from 'react';
import { Threat, NetworkNode, NodeStatus, GameMode } from '../types/game';
import { ThreatManager } from '../game/ThreatManager';
import { GameBalanceManager } from '../game/GameBalanceManager';

const blackHatThreats = [
  'Target acquired: Banking system',
  'Vulnerability found: SQL injection',
  'Bypassing authentication...',
  'Escalating privileges...',
  'Accessing sensitive data...',
  'Planting backdoor...',
  'Covering digital tracks...',
  'Mission accomplished'
];

const whiteHatThreats = [
  'SQL Injection attempt blocked',
  'Malware signature detected',
  'Unauthorized access attempt',
  'DDoS attack mitigated',
  'Phishing email quarantined',
  'Suspicious network traffic',
  'Privilege escalation blocked',
  'Data exfiltration prevented'
];

export function useThreats(
  isWhiteHat: boolean,
  networkNodes: NetworkNode[],
  onNodeStatusChange: (nodeId: number, previousStatus: NodeStatus, currentStatus: NodeStatus) => void
) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const threatManager = ThreatManager.getInstance();
  const balanceManager = GameBalanceManager.getInstance();

  // Subscribe to threat updates
  useEffect(() => {
    const unsubscribe = threatManager.subscribeToThreats((updatedThreats) => {
      setThreats(updatedThreats);
    });

    return () => unsubscribe();
  }, [threatManager]);

  // Effect for time-based threat progression
  useEffect(() => {
    const threatInterval = setInterval(() => {
      setThreats(currentThreats => {
        const updatedThreats = currentThreats.map(threat => {
          // Only process executing threats that have a target node
          if (threat.status === 'EXECUTING' && threat.targetNodeId !== undefined) {
            const targetNode = networkNodes.find(node => node.id === threat.targetNodeId);
            if (targetNode) {
              // Use the new threat progression logic
              const { newThreatStatus, newNodeStatus } = threatManager.processThreatProgression(
                threat,
                targetNode,
                isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'
              );

              // If the threat caused a node status change, trigger the callback
              if (newNodeStatus && newNodeStatus !== targetNode.status) {
                onNodeStatusChange(targetNode.id, targetNode.status, newNodeStatus);
              }

              // Update threat status
              return { ...threat, status: newThreatStatus };
            }
          }
          return threat;
        }).filter(threat => threat.status !== 'NEUTRALIZED' && threat.status !== 'SUCCESS'); // Remove completed/neutralized threats

        return updatedThreats;
      });
    }, 1000); // Run every 1 second for smoother progression

    return () => clearInterval(threatInterval);
  }, [networkNodes, onNodeStatusChange, threatManager, isWhiteHat]); // Added isWhiteHat to dependencies

  // Function to manually add a threat (can be called from GameDemoDisplay)
  const addThreat = (threat: Threat) => {
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000000);
    const newThreat = { ...threat, id: uniqueId };
    
    // If the threat has a target node, ensure it's valid
    if (threat.targetNodeId !== undefined) {
      const targetNode = networkNodes.find(node => node.id === threat.targetNodeId);
      if (targetNode) {
        // Use the public processThreatProgression method to determine initial status
        const { newThreatStatus } = threatManager.processThreatProgression(
          newThreat,
          targetNode,
          isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'
        );
        newThreat.status = newThreatStatus;
      }
    }
    
    setThreats(prev => [...prev, newThreat]);
  };

  // Expose addThreat and threats state
  return { threats, addThreat };
} 
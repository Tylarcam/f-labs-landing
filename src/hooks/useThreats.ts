import { useState, useEffect } from 'react';
import { Threat } from '../types';

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

export function useThreats(isWhiteHat: boolean) {
  const [threats, setThreats] = useState<Threat[]>([]);

  useEffect(() => {
    const threatInterval = setInterval(() => {
      const threatList = isWhiteHat ? whiteHatThreats : blackHatThreats;
      const newThreat: Threat = {
        id: Date.now(),
        type: threatList[Math.floor(Math.random() * threatList.length)],
        severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] as 'HIGH' | 'MEDIUM' | 'LOW',
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        timestamp: new Date().toLocaleTimeString(),
        status: isWhiteHat 
          ? (Math.random() > 0.5 ? 'NEUTRALIZED' : 'DETECTED')
          : (Math.random() > 0.5 ? 'SUCCESS' : 'EXECUTING')
      };
      setThreats(prev => [newThreat, ...prev.slice(0, 3)]);
    }, 3000);

    return () => clearInterval(threatInterval);
  }, [isWhiteHat]);

  return threats;
} 
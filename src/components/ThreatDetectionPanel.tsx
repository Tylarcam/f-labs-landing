import React from 'react';
import { Threat } from '../types/threat.types'; // Assuming a Threat type exists or will be created
import { Eye } from 'lucide-react';

interface ThreatDetectionPanelProps {
  threats: Threat[]; // Assuming threats is an array of Threat objects
  currentTheme: { panelBg: string; border: string };
}

// Define a placeholder Threat type if it doesn't exist yet
interface Threat {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  source: string;
  status: string;
}

const ThreatDetectionPanel: React.FC<ThreatDetectionPanelProps> = ({ threats, currentTheme }) => {
  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Eye className="w-5 h-5" />
        <span className="text-sm font-bold">THREAT_DETECTION</span>
      </div>
      <div className="space-y-2">
        {threats.map((threat) => (
          <div key={threat.id} className="text-sm">
            <div className="flex items-center justify-between">
              <span className={`${
                threat.severity === 'HIGH' ? 'text-red-400' :
                threat.severity === 'MEDIUM' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {threat.type}
              </span>
              <span className="text-xs opacity-50">{threat.timestamp}</span>
            </div>
            <div className="text-xs opacity-50">
              Source: {threat.source} | Status: {threat.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatDetectionPanel; 
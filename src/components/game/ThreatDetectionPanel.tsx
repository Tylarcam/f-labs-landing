import React from 'react';
import { AlertTriangle, Shield, Bug } from 'lucide-react';
import { ThreatManager } from '../../game/ThreatManager';

export const ThreatDetectionPanel: React.FC = () => {
  const threatManager = ThreatManager.getInstance();
  const activeThreats = threatManager.getActiveThreats();
  const threatLevel = threatManager.getThreatLevel();

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'LOW':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'EXPLOIT':
        return <Bug className="w-4 h-4 text-red-400" />;
      case 'DOS':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'BACKDOOR':
        return <Bug className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Threat Detection</h2>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className={getThreatLevelColor(threatLevel)}>
            {threatLevel} THREAT
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {activeThreats.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No active threats detected
          </div>
        ) : (
          activeThreats.map((threat) => (
            <div
              key={threat.id}
              className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {getThreatIcon(threat.type)}
                <div>
                  <div className="font-medium">{threat.type}</div>
                  <div className="text-sm text-gray-400">
                    Target: Node {threat.targetNodeId}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  {threat.status === 'EXECUTING' ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span>Executing</span>
                    </div>
                  ) : threat.status === 'NEUTRALIZED' ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <Shield className="w-4 h-4" />
                      <span>Neutralized</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Successful</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 
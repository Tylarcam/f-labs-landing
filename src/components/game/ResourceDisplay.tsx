import React from 'react';
import { Zap, Wifi, Cpu } from 'lucide-react';

interface ResourceDisplayProps {
  resources: {
    energy: number;
    bandwidth: number;
    processing: number;
  };
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources }) => {
  const getResourceColor = (value: number) => {
    if (value >= 75) return 'text-green-400';
    if (value >= 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-4 h-full">
      <h2 className="text-xl font-bold mb-4">Resources</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Energy</span>
            </div>
            <span className={getResourceColor(resources.energy)}>
              {resources.energy}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-yellow-400 transition-all duration-300 ${getResourceColor(resources.energy)}`}
              style={{ width: `${resources.energy}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              <span>Bandwidth</span>
            </div>
            <span className={getResourceColor(resources.bandwidth)}>
              {resources.bandwidth}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-400 transition-all duration-300 ${getResourceColor(resources.bandwidth)}`}
              style={{ width: `${resources.bandwidth}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Processing</span>
            </div>
            <span className={getResourceColor(resources.processing)}>
              {resources.processing}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-purple-400 transition-all duration-300 ${getResourceColor(resources.processing)}`}
              style={{ width: `${resources.processing}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 
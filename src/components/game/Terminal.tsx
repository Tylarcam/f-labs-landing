import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  lines: string[];
}

export const Terminal: React.FC<TerminalProps> = ({ lines }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <TerminalIcon className="w-5 h-5" />
        <h2 className="text-xl font-bold">Terminal</h2>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 bg-black rounded-lg p-4 font-mono text-sm overflow-y-auto"
      >
        {lines.length === 0 ? (
          <div className="text-gray-500">System ready...</div>
        ) : (
          lines.map((line, index) => (
            <div
              key={index}
              className={`${
                line.includes('ERROR') || line.includes('FAILED')
                  ? 'text-red-400'
                  : line.includes('SUCCESS') || line.includes('COMPLETE')
                  ? 'text-green-400'
                  : line.includes('WARNING')
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 
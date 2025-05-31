import React from 'react';
import { GameState } from '../types/game.types';
import { Code } from 'lucide-react';

interface ActionLogsDisplayProps {
  actionLogs: GameState['actionLogs'];
  terminalLines: GameState['terminalLines'];
  isActive: boolean;
  currentTheme: { panelBg: string; border: string; text: string };
}

const ActionLogsDisplay: React.FC<ActionLogsDisplayProps> = ({ actionLogs, terminalLines, isActive, currentTheme }) => {
  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Code className="w-5 h-5" />
        <span className="text-sm font-bold">ACTION_LOGS</span>
      </div>

      <div className="space-y-1 text-sm">
        {actionLogs.map((log, index) => (
          <div key={index} className="text-sm opacity-80">
            {log}
          </div>
        ))}
         {terminalLines.map((line, index) => (
          <div key={`terminal-line-${index}`} className={currentTheme.text}>
            {line}
            {index === terminalLines.length - 1 && isActive && (
              <span className="animate-pulse">█</span>
            )}
          </div>
        ))}
         {!(terminalLines.length > 0 && isActive) && (
            <div className={currentTheme.text}>
                 &gt; <span className="animate-pulse">█</span>
            </div>
         )}
      </div>
    </div>
  );
};

export default ActionLogsDisplay; 
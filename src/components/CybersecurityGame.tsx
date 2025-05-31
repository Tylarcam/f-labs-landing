import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useNodeInteraction } from '../hooks/useNodeInteraction';
import { useThreats } from '../hooks/useThreats'; // Assuming useThreats remains separate
import { NetworkNode } from '../types/network.types'; // Use new type file
import { GameMode, NodeStatus, SystemStatus, ParticleActivityLevel } from '../types/game.types'; // Use new type file
// Import icons if using them (assuming they are from lucide-react or similar)
import { Shield, Terminal, Activity, Code, Eye, Zap, Target, Server, Brain, Wifi } from 'lucide-react';
// Import other components as they are created/adapted
import NetworkVisualization from './NetworkVisualization';
import GameHeader from './GameHeader'; // Import the new component
import ResourceDisplay from './ResourceDisplay'; // Import the new component
import ActionLogsDisplay from './ActionLogsDisplay'; // Import the new component
import ObjectiveDisplay from './ObjectiveDisplay'; // Import the new component
import ActionPanel from './ActionPanel'; // Import the new component
import StatusPanel from './StatusPanel'; // Import the new component
import ThreatDetectionPanel from './ThreatDetectionPanel'; // Import the new component
import MissionStatus from './MissionStatus'; // Import the new component
import StrategicGuidance from './StrategicGuidance'; // Import the new component
import { useStrategicGuidance } from '../hooks/useStrategicGuidance'; // Import the hook

export default function CybersecurityGame() {
  const {
    gameState,
    networkNodes,
    setNetworkNodes,
    updateGameState,
    resetGameState,
    updateResources,
    addActionLog,
    updateNodeStateTimer,
    clearNodeStateTimer,
    setActionState,
    setCooldown,
    isActionOnCooldown,
    getCooldownRemaining,
    switchToDiscoverMode,
    switchToTutorialMode,
    switchToGameMode,
    updateTutorialProgress,
    completeTutorial,
    objectiveManager,
    scoringManager,
    threatManager,
    balanceManager,
    currentMission, // Get currentMission from useGameLogic
    timeRemaining, // Get timeRemaining from useGameLogic
    score, // Get score from useGameLogic
  } = useGameLogic();

   // Use the useStrategicGuidance hook
   const { currentHint, showHints } = useStrategicGuidance(
     gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT',
     currentMission,
     timeRemaining
   );

  // Use the refactored useNodeInteraction hook
  const { handleNodeClick, executeAction } = useNodeInteraction();

  // ThreatManager is now consumed via useGameLogic, no need to initialize here
  const threats = threatManager.getThreats(); // Assuming ThreatManager has a getThreats method

  // Local UI state from GameDemoDisplay
  const [scanProgress, setScanProgress] = useState(0); // For mode transition animation
  const [isActive, setIsActive] = useState(false); // For terminal typing animation
  // Deprecated local states: terminalLines, systemStatus, progress, particleActivityLevel
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState<number | undefined>(undefined);

  // Effect to control isActive based on gameState systemStatus
   useEffect(() => {
    setIsActive(gameState.mode === 'PLAYING' && (gameState.systemStatus === 'SECURING' || gameState.systemStatus === 'ATTACKING'));
  }, [gameState.systemStatus, gameState.mode]);

  // Handle Mode Toggle (adapting from GameDemoDisplay)
  const handleModeToggle = useCallback(() => {
    updateGameState({ isTransitioning: true });
    setScanProgress(0);

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          updateGameState({ 
            isWhiteHat: !gameState.isWhiteHat,
            isTransitioning: false,
             // Reset UI state that depends on mode via updateGameState
            systemStatus: 'IDLE',
            terminalLines: [],
            progress: 0,
            particleActivityLevel: 'normal',
            selectedNodeId: null // Deselect node on mode switch
          });
          // Re-initialize objectives and managers on mode switch
          objectiveManager.initializeObjectives(!gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT');
          scoringManager.resetScore();
          threatManager.reset();
           setNetworkNodes(networkNodes.map(node => ({
             ...node,
             isSelected: false,
             feedbackStatus: null,
             feedbackEndTime: undefined,
             highlighted: false
           })));

          setTimeout(() => {
            setScanProgress(0);
          }, 500);
          return 100; // Keep scanProgress at 100 until reset
        }
        return prev + 4;
      });
    }, 30);
  }, [gameState.isWhiteHat, updateGameState, objectiveManager, scoringManager, threatManager, setNetworkNodes, networkNodes]); // Added dependencies

    // Terminal Typing Effect (adapted from GameDemoDisplay)
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        const commands = gameState.isWhiteHat ? ['Initializing security protocols...', 'Analyzing network vulnerabilities...', 'Deploying countermeasures...', 'Patching security vulnerabilities...', 'Strengthening firewall rules...', 'Implementing access controls...', 'Activating monitoring systems...', 'Network secured successfully!'] : ['Initializing neural interface...', 'Scanning network topology...', 'Bypassing firewall layer 1...', 'Injecting payload into mainframe...', 'Decrypting security protocols...', 'Accessing restricted database...', 'Establishing backdoor connection...', 'System breach successful!'];
    
        if (isActive && gameState.terminalLines.length < commands.length) { // Use gameState.terminalLines
           interval = setInterval(() => {
             const nextLine = commands[gameState.terminalLines.length]; // Use gameState.terminalLines
             // Directly update gameState's terminalLines and progress
             updateGameState(prev => ({
                terminalLines: [...prev.terminalLines, `> ${nextLine}`],
                progress: (prev.terminalLines.length + 1) / commands.length * 100
             }));

             if (gameState.terminalLines.length + 1 === commands.length) { // Use gameState.terminalLines
                 // Directly update gameState's systemStatus and mode (if applicable)
                 updateGameState(prev => ({
                    systemStatus: prev.isWhiteHat ? 'SECURED' : 'BREACHED',
                    // You might also transition mode here if the terminal signifies end of a phase
                    // mode: prev.isWhiteHat ? 'WHITE_HAT_WIN' : 'BLACK_HAT_WIN' // Example
                 }));
                 setIsActive(false); // Stop typing locally
             } else {
                // If not the last line, continue typing effect locally
                setIsActive(true);
             }
           }, 800); // Typing speed
        } else if (isActive && gameState.terminalLines.length === commands.length) { // Stop isActive when typing is complete
             setIsActive(false);
        }
    
        return () => { if (interval) clearInterval(interval); };
      }, [isActive, gameState.terminalLines, gameState.isWhiteHat, updateGameState]); // Depend on relevant state and updateGameState

    // Start Operation function (adapted from GameDemoDisplay)
    const startOperation = useCallback(() => {
        if (isActive) return; // Prevent multiple starts
        // Update gameState for system status, particle activity, terminal lines, progress, and mode
        updateGameState({
          systemStatus: gameState.isWhiteHat ? 'SECURING' : 'ATTACKING',
          particleActivityLevel: 'intense',
          terminalLines: [], // Clear previous terminal lines
          progress: 0,
          mode: 'PLAYING' // Assume starting operation means entering PLAYING mode
        });
        // isActive will be set by the useEffect listening to gameState.systemStatus

    }, [isActive, gameState.isWhiteHat, updateGameState]); // Depend on relevant state and updateGameState

  // Mouse interaction and rotation state (keeping local as they are purely UI related)
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotationY(prev => prev + deltaX * 0.5);
    setRotationX(prev => prev + deltaY * 0.5);

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
  };

  // Theme calculation (adapted from GameDemoDisplay)
  const currentTheme = useMemo(() => ({
    bg: gameState.isWhiteHat ? 'bg-gray-900' : 'bg-black',
    text: gameState.isWhiteHat ? 'text-blue-400' : 'text-green-400',
    border: gameState.isWhiteHat ? 'border-blue-400/30' : 'border-green-400/30',
    headerBg: gameState.isWhiteHat ? 'bg-gray-900/90' : 'bg-black/90',
    panelBg: gameState.isWhiteHat ? 'bg-gray-900/70' : 'bg-black/70'
  }), [gameState.isWhiteHat]);

  // Render mode specific UI
  const renderModeSpecificUI = () => {
    // Ensure the header is always rendered, but its content might depend on playMode
     const header = (gameState.playMode === 'GAME' || gameState.playMode === 'TUTORIAL') && (
       <GameHeader
         gameState={gameState}
         currentTheme={currentTheme}
         handleModeToggle={handleModeToggle}
         // Pass the statusIndicator logic or relevant state to GameHeader
         statusIndicator={(
           <div className="flex items-center gap-2">
             <div className={`w-3 h-3 rounded-full ${gameState.systemStatus === 'SECURING' || gameState.systemStatus === 'ATTACKING' ? 'bg-yellow-400 animate-pulse' : gameState.systemStatus === 'SECURED' || gameState.systemStatus === 'BREACHED' ? (gameState.isWhiteHat ? 'bg-green-400' : 'bg-purple-400') : (gameState.isWhiteHat ? 'bg-blue-400 animate-pulse' : 'bg-green-400 animate-pulse')}`} />
             <span className="text-sm">{gameState.systemStatus}</span>
           </div>
         )}
       />
     );


    switch (gameState.playMode) {
      case 'DISCOVER':
        return (
          <div className="p-4">
             {/* Header for Discover Mode? Current design doesn't have one */}
            <h2 className="text-xl font-bold mb-4">Network Discovery Mode</h2>
            <p className="text-sm opacity-80 mb-4">
              Explore the network by clicking on nodes to learn about their functions and relationships.
            </p>
            <div className="h-[600px]">
              <NetworkVisualization
                nodes={networkNodes}
                onNodeClick={handleNodeClick}
                mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                isTransitioning={gameState.isTransitioning}
                targetingMode={{
                  isActive: gameState.actionState.mode === 'SELECTING_TARGET',
                  actionType: gameState.actionState.currentAction
                }}
                selectedNodeId={gameState.selectedNodeId}
              />
            </div>
          </div>
        );

      case 'TUTORIAL':
        return (
          <div className="flex flex-col h-full">
             {header} {/* Render the header */}
             <div className="p-4 grid grid-cols-2 gap-4 flex-grow">
               <div className="h-[600px]">
                 <NetworkVisualization
                   nodes={networkNodes}
                   onNodeClick={handleNodeClick}
                   mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                   isTransitioning={gameState.isTransitioning}
                   targetingMode={{
                     isActive: gameState.actionState.mode === 'SELECTING_TARGET',
                     actionType: gameState.actionState.currentAction
                   }}
                   selectedNodeId={gameState.selectedNodeId}
                 />
               </div>
               <div className="space-y-4">
                 {/* Objective Display (Tutorial) */}
                  <ObjectiveDisplay
                    objectiveManager={objectiveManager}
                    mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                    currentTheme={currentTheme}
                  />
                 {/* Tutorial Progress */}
                 <div className={`border rounded-lg p-4 ${currentTheme.border} ${currentTheme.panelBg}`}>
                   <h3 className="text-lg font-bold mb-2">Tutorial Progress</h3>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span>Current Step:</span>
                       <span>{gameState.tutorialProgress.currentStep}</span> {/* Use gameState.tutorialProgress.currentStep */}
                     </div>
                     <div className="flex items-center justify-between">
                       <span>Completed Steps:</span>
                       <span>{gameState.tutorialProgress.completedSteps.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span>Current Objective:</span>
                       <span>{gameState.tutorialProgress.currentObjective || 'None'}</span>
                     </div>
                   </div>
                 </div>
                 <button
                   onClick={completeTutorial}
                   className="w-full py-2 px-4 rounded border border-yellow-400 text-yellow-400 font-bold text-sm hover:bg-yellow-400/10 transition-all duration-200"
                 >
                   Skip Tutorial
                 </button>
               </div>
             </div>
           </div>
        );

      case 'GAME':
        return (
          <div className="flex flex-col h-full">
             {header} {/* Render the header */}
             <div className="relative z-10 p-4 grid grid-cols-12 gap-4 flex-grow"> {/* Changed to 12-column grid */}
              {/* Left Panels (Objectives, Action Logs, Threats, Mission Status, Strategic Guidance) */}
              <div className="col-span-3 space-y-4" ref={leftColRef}> {/* Adjust col-span as needed */}
                 <ObjectiveDisplay
                    objectiveManager={objectiveManager}
                    mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                    currentTheme={currentTheme}
                  />

                 <ActionLogsDisplay
                   actionLogs={gameState.actionLogs}
                   terminalLines={gameState.terminalLines}
                   isActive={isActive}
                   currentTheme={currentTheme}
                 />

                 <ThreatDetectionPanel
                   threats={threats}
                   currentTheme={currentTheme}
                 />

                 <MissionStatus
                    currentMission={currentMission}
                    timeRemaining={timeRemaining}
                    score={score}
                    currentTheme={currentTheme}
                  />

                 <StrategicGuidance
                   currentHint={currentHint}
                   showHints={showHints}
                   currentTheme={currentTheme}
                 />
              </div>

              {/* Center Panel (Network Visualization) */}
              <div className="col-span-6"> {/* Adjust col-span as needed */}
                <div className={`bg-gray-900/70 border border-blue-400/30 rounded-lg p-4 h-full backdrop-blur-sm`}>
                  <div className="flex items-center gap-2 mb-4 border-b border-blue-400/30 pb-2">
                    <Wifi className="w-5 h-5" />
                    <span className="text-sm font-bold">NETWORK_TOPOLOGY</span>
                  </div>
                   <div className="h-[500px]"> {/* Adjust height as needed */}
                    <NetworkVisualization
                      nodes={networkNodes}
                      onNodeClick={handleNodeClick}
                      mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                      isTransitioning={gameState.isTransitioning}
                      targetingMode={{
                        isActive: gameState.actionState.mode === 'SELECTING_TARGET',
                        actionType: gameState.actionState.currentAction
                      }}
                      selectedNodeId={gameState.selectedNodeId}
                    />
                   </div>
                </div>
              </div>

              {/* Right Panels (Resources, Actions, Status) */}
              <div className="col-span-3 space-y-4"> {/* Adjust col-span as needed */}
                 <ResourceDisplay resources={gameState.resources} currentTheme={currentTheme} />

                 <ActionPanel
                   gameState={gameState}
                   currentTheme={currentTheme}
                   setActionState={setActionState}
                   isActionOnCooldown={isActionOnCooldown}
                   getCooldownRemaining={getCooldownRemaining}
                   balanceManager={balanceManager}
                 />

                 <StatusPanel
                   gameState={gameState}
                   currentTheme={currentTheme}
                 />
              </div>
            </div>
           </div>
        );

      default:\n        return null;
    }
  };

  return (
    <div className={`font-mono overflow-hidden relative transition-all duration-500 ${currentTheme.bg} ${currentTheme.text} w-full h-full`}>
      {/* Render the header outside the switch for consistency */}
      {gameState.playMode !== 'IDLE' && gameState.playMode !== 'DISCOVER' && (
         <GameHeader
           gameState={gameState}
           currentTheme={currentTheme}
           handleModeToggle={handleModeToggle}
           statusIndicator={(
             <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${gameState.systemStatus === 'SECURING' || gameState.systemStatus === 'ATTACKING' ? 'bg-yellow-400 animate-pulse' : gameState.systemStatus === 'SECURED' || gameState.systemStatus === 'BREACHED' ? (gameState.isWhiteHat ? 'bg-green-400' : 'bg-purple-400') : (gameState.isWhiteHat ? 'bg-blue-400 animate-pulse' : 'bg-green-400 animate-pulse')}`} />
               <span className="text-sm">{gameState.systemStatus}</span>
             </div>
           )}
         />
       )}

      {renderModeSpecificUI()} {/* This now only renders the content below the header */}

      {/* Transition Overlay */}
      {gameState.isTransitioning && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"
            style={{
              top: `${scanProgress}%`,
              filter: 'drop-shadow(0 0 10px currentColor)'
            }}
          />
          <div
            className="absolute top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50"
            style={{
              left: `${scanProgress}%`,
              filter: 'drop-shadow(0 0 10px currentColor)'
            }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className="rounded-full border-2 border-cyan-400 animate-ping"
              style={{
                width: `${scanProgress * 8}px`,
                height: `${scanProgress * 8}px`,
                boxShadow: '0 0 20px currentColor'
              }}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold text-cyan-400 animate-pulse">
              SWITCHING PROTOCOLS...
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {Math.round(scanProgress)}% COMPLETE
            </div>
          </div>
        </div>
      )}

       {/* Win/Loss/Game Over Screens (adapting from GameDemoDisplay) */}
        {(gameState.mode === 'WHITE_HAT_WIN' || gameState.mode === 'BLACK_HAT_WIN' || gameState.mode === 'GAME_OVER_LOSS') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="p-8 bg-gray-900/90 rounded-lg shadow-lg border border-blue-400/50 flex flex-col items-center justify-center text-center space-y-8">
              <h2 className={`text-4xl font-bold ${gameState.mode === 'WHITE_HAT_WIN' ? 'text-green-400' : gameState.mode === 'BLACK_HAT_WIN' ? 'text-purple-400' : 'text-red-400'}`}>
                {gameState.mode === 'WHITE_HAT_WIN' ? 'WHITE HAT VICTORY' : gameState.mode === 'BLACK_HAT_WIN' ? 'BLACK HAT VICTORY' : 'SIMULATION FAILED'}
              </h2>
              <p className="text-lg text-gray-300">
                {gameState.mode === 'WHITE_HAT_WIN' ? 'You have successfully defended the network.' : gameState.mode === 'BLACK_HAT_WIN' ? 'You have successfully compromised the network.' : 'The network has been breached.'}
              </p>
              {/* Add score display or other relevant info here */}
              <button
                onClick={resetGameState}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200 text-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

// Assuming DraggableNode is either adapted or replaced by InteractiveNetworkTopology's internal logic
// function DraggableNode({ /* ... */ }) { /* ... */ } 
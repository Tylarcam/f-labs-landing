'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Terminal, Code, Activity, Eye, Zap, Target, CheckCircle, Wifi, Server, Database, Router, Monitor, Brain } from 'lucide-react';
import { useNetworkNodes } from '../../hooks/useNetworkNodes';
import { useThreats } from '../../hooks/useThreats';
import { transform3DNode, getLayerColor } from '../../utils/3d';
import { Threat, SystemStatus, ParticleActivityLevel, NodeStatus, NodeType, GameMode, GameState, Objective, GameAction, ActionEffect, NetworkNode } from '../../types/game';
import InteractiveNetworkTopology from '../network/InteractiveNetworkTopology';
import { ScoringManager } from '../../game/ScoringManager';
import { ScoreDisplay } from '../game/ScoreDisplay';
import { GameBalanceManager } from '../../game/GameBalanceManager';
import { ObjectiveDisplay } from '../game/ObjectiveDisplay';
import { ObjectiveManager } from '../../game/ObjectiveManager';
import { ThreatManager } from '../../game/ThreatManager';
import { Tutorial } from '../game/Tutorial';

export default function GameDemoDisplay() {
  const [isWhiteHat, setIsWhiteHat] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('IDLE');
  const [progress, setProgress] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [particleActivityLevel, setParticleActivityLevel] = useState<ParticleActivityLevel>('normal');
  const [actionLogs, setActionLogs] = useState<string[]>([]);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [targetStatus, setTargetStatus] = useState({
    firewall: isWhiteHat ? 'ACTIVE' : 'COMPROMISED',
    encryption: isWhiteHat ? 'MAXIMUM' : 'DEGRADED',
    accessControl: isWhiteHat ? 'ENFORCED' : 'BYPASSED',
    systemIntegrity: isWhiteHat ? 100 : 65
  });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [resources, setResources] = useState({
    energy: 100,
    bandwidth: 100,
    processing: 100
  });
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [targetingMode, setTargetingMode] = useState<{ isActive: boolean, actionType: string | null, mode: GameMode | null }>({ isActive: false, actionType: null, mode: null });
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WHITE_HAT_WIN' | 'BLACK_HAT_WIN' | 'GAME_OVER_LOSS'>('IDLE');
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const tutorialSteps = [
    { 
      id: 1, 
      text: 'Welcome to the Network Security Tutorial!\nLet\'s start by examining WEB-01.\nClick on WEB-01 to select it.', 
      action: 'SELECT_NODE', 
      targetNodeId: 1,
      typingSpeed: 50,
      lineDelay: 300
    },
    { 
      id: 2, 
      text: 'Good! Now we need to scan for vulnerabilities.\nSelect the SCAN_TARGETS action from the menu.', 
      action: 'SELECT_ACTION', 
      targetAction: 'SCAN_TARGETS',
      typingSpeed: 50,
      lineDelay: 300
    },
    { 
      id: 3, 
      text: 'Perfect! Now let\'s scan WEB-01 for vulnerabilities.\nClick on WEB-01 to initiate the scan.', 
      action: 'PERFORM_ACTION', 
      targetNodeId: 1, 
      requiredStatus: 'active',
      typingSpeed: 50,
      lineDelay: 300
    },
    { 
      id: 4, 
      text: 'VULNERABILITY DETECTED!\nWEB-01 has an exploitable security flaw.\nClick on the vulnerable WEB-01 to proceed.', 
      action: 'SELECT_NODE', 
      requiredStatus: 'vulnerable',
      typingSpeed: 30,
      lineDelay: 200
    },
    { 
      id: 5, 
      text: 'Now we need to patch this vulnerability.\nSelect the PATCH action from the menu.', 
      action: 'SELECT_ACTION', 
      targetAction: 'PATCH',
      typingSpeed: 50,
      lineDelay: 300
    },
    { 
      id: 6, 
      text: 'Excellent! Now let\'s secure WEB-01.\nClick on the vulnerable WEB-01 to apply the patch.', 
      action: 'PERFORM_ACTION', 
      targetNodeId: 1, 
      requiredStatus: 'vulnerable',
      typingSpeed: 50,
      lineDelay: 300
    },
    { 
      id: 7, 
      text: 'SUCCESS! WEB-01 has been secured.\nYou\'ve completed the basic security protocol.\nThe system is now protected against this vulnerability.', 
      action: 'END_TUTORIAL',
      typingSpeed: 40,
      lineDelay: 250
    }
  ];

  // Add typing animation effect
  const [tutorialText, setTutorialText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStateRef = useRef({
    currentLineIndex: 0,
    currentCharIndex: 0,
    currentText: ''
  });

  // State to track nodes in states relevant to duration-based objectives
  const [nodeStateTimers, setNodeStateTimers] = useState<Record<number, { status: NodeStatus, startTime: number }>>({});

  useEffect(() => {
    // Reset typing state when tutorial step changes
    typingStateRef.current = {
      currentLineIndex: 0,
      currentCharIndex: 0,
      currentText: ''
    };
    setTutorialText('');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTutorialActive && tutorialStep > 0 && tutorialStep <= tutorialSteps.length) {
      const currentStep = tutorialSteps[tutorialStep - 1];
      const lines = currentStep.text.split('\n');
      
      setIsTyping(true);

      const typeNextChar = () => {
        const { currentLineIndex, currentCharIndex, currentText } = typingStateRef.current;

        if (currentLineIndex < lines.length) {
          const currentLine = lines[currentLineIndex];
          
          if (currentCharIndex < currentLine.length) {
            const newText = currentText + currentLine[currentCharIndex];
            typingStateRef.current.currentText = newText;
            typingStateRef.current.currentCharIndex++;
            setTutorialText(newText);
            typingTimeoutRef.current = setTimeout(typeNextChar, currentStep.typingSpeed);
          } else {
            const newText = currentText + '\n';
            typingStateRef.current.currentText = newText;
            typingStateRef.current.currentLineIndex++;
            typingStateRef.current.currentCharIndex = 0;
            setTutorialText(newText);
            typingTimeoutRef.current = setTimeout(typeNextChar, currentStep.lineDelay);
          }
        } else {
          setIsTyping(false);
        }
      };

      // Start typing animation
      typeNextChar();
    }

    // Cleanup
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [isTutorialActive, tutorialStep, tutorialSteps]);

  // Add a debug effect to track tutorial state changes
  useEffect(() => {
    console.log('Tutorial State Changed:', {
      isTutorialActive,
      tutorialStep,
      tutorialText,
      isTyping
    });
  }, [isTutorialActive, tutorialStep, tutorialText, isTyping]);

  const threatManager = ThreatManager.getInstance();
  const scoringManager = ScoringManager.getInstance();
  const balanceManager = GameBalanceManager.getInstance();
  const objectiveManager = ObjectiveManager.getInstance();

  const { networkNodes, setNetworkNodes } = useNetworkNodes(isWhiteHat, isTransitioning);

  const handleNodeStatusChange = useCallback((nodeId: number, previousStatus: NodeStatus, currentStatus: NodeStatus) => {
    const node = networkNodes?.find(n => n.id === nodeId);
    if (!node) return;

    // Update node status - This is already handled when setting networkNodes state directly
    // setNetworkNodes(prev =>
    //   prev.map(n =>
    //     n.id === nodeId ? { ...n, status: currentStatus } : n
    //   )
    // );

    // Update nodeStateTimers for duration objectives
    setNodeStateTimers(prevTimers => {
      const newTimers = { ...prevTimers };
      const now = Date.now();

      const isRelevantForDuration = (
         (isWhiteHat && currentStatus === 'monitoring') ||
         (!isWhiteHat && (currentStatus === 'compromised' || currentStatus === 'breached'))
      );

      const wasRelevantForDuration = (
         (isWhiteHat && previousStatus === 'monitoring') ||
         (!isWhiteHat && (previousStatus === 'compromised' || previousStatus === 'breached'))
      );

      if (isRelevantForDuration && !wasRelevantForDuration) {
        // Node entered a relevant state
        newTimers[nodeId] = { status: currentStatus, startTime: now };
      } else if (wasRelevantForDuration && !isRelevantForDuration) {
        // Node exited a relevant state
        delete newTimers[nodeId];
      } else if (isRelevantForDuration && wasRelevantForDuration && newTimers[nodeId]) {
         // Node changed between relevant states (e.g., compromised to breached as Black Hat)
         // Update status but keep the original start time
         newTimers[nodeId] = { ...newTimers[nodeId], status: currentStatus };
      } // If !isRelevantForDuration and !wasRelevantForDuration, do nothing

      return newTimers;
    });

    // Generate threat based on status change
    const threat = threatManager.generateThreatFromNodeStatus(
      node as NetworkNode, // Cast to the correct type for ThreatManager
      previousStatus,
      currentStatus,
      isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'
    );

    if (threat) {
      // Update action logs
      setActionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${threat.type} (${threat.severity})`, 
        ...prev
      ]);
    }

    // Update objectives if needed
    if (isGameStarted) { // Only update objectives if the game has started
      const mode = isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'; // Determine current mode
      if (isWhiteHat) {
        // White Hat Objectives
        if (currentStatus === 'secure') {
          // Objective: Secure nodes (event-based)
          objectiveManager.updateObjectiveProgress('NODES_SECURE', 1, nodeId, mode); // Pass mode
        } else if ((previousStatus === 'compromised' || previousStatus === 'breached') && (currentStatus !== 'compromised' && currentStatus !== 'breached')) {
          // Objective: Blocked threats/Resecured nodes (event-based)
          objectiveManager.updateObjectiveProgress('THREATS_BLOCKED', 1, nodeId, mode); // Pass mode
        }
        // NODE_MONITORED_DURATION objective progress is updated by the timer effect

      } else { // Black Hat Objectives
        if (currentStatus === 'compromised' || currentStatus === 'breached') {
          // Objective: Compromise nodes (event-based)
          objectiveManager.updateObjectiveProgress('NODES_COMPROMISED', 1, nodeId, mode); // Pass mode
        }
        // NODE_ACCESS_MAINTAINED_DURATION objective progress is updated by the timer effect
      }

      // Handle node-specific objectives based on reaching a specific status (e.g., SECURE_NODE, COMPROMISE_NODE)
       if (isWhiteHat && currentStatus === 'secure') {
           objectiveManager.updateObjectiveProgress('NODE_SECURED', 1, nodeId, mode); // Update node-specific secure objective
       } else if (!isWhiteHat && (currentStatus === 'compromised' || currentStatus === 'breached')) {
           objectiveManager.updateObjectiveProgress('NODE_COMPROMISED', 1, nodeId, mode); // Update node-specific compromise objective
       }

       // Handle other event-based node objectives here (e.g., UPGRADE_DEFENSE, ESCALATE_PRIVILEGES)
       // These would be triggered by actions, not just status changes.
    }

    // Tutorial Step 4 & 7: Node Status Change (after action)
    if (isTutorialActive && (tutorialStep === 4 || tutorialStep === 7) && tutorialSteps[tutorialStep - 1].requiredStatus === currentStatus) {
        setTutorialStep(tutorialStep + 1); // Advance to the next step
        if (tutorialStep + 1 > tutorialSteps.length) {
            setIsTutorialActive(false); // End tutorial if it was the last step
        }
    }

  }, [isGameStarted, isWhiteHat, networkNodes, setNetworkNodes, setActionLogs, setNodeStateTimers]); // Add setNodeStateTimers to dependencies

  const { threats, addThreat } = useThreats(isWhiteHat, networkNodes, handleNodeStatusChange);

  const blackHatCommands = [
    'Initializing neural interface...',
    'Scanning network topology...',
    'Bypassing firewall layer 1...',
    'Injecting payload into mainframe...',
    'Decrypting security protocols...',
    'Accessing restricted database...',
    'Establishing backdoor connection...',
    'System breach successful!'
  ];

  const whiteHatCommands = [
    'Initializing security protocols...',
    'Analyzing network vulnerabilities...',
    'Deploying countermeasures...',
    'Patching security vulnerabilities...',
    'Strengthening firewall rules...',
    'Implementing access controls...',
    'Activating monitoring systems...',
    'Network secured successfully!'
  ];

  const handleModeToggle = () => {
    setIsTransitioning(true);
    setScanProgress(0);
    
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsWhiteHat(!isWhiteHat);
          setTimeout(() => {
            setIsTransitioning(false);
            setScanProgress(0);
          }, 500);
          return 100;
        }
        return prev + 4;
      });
    }, 30);
  };

  const startOperation = () => {
    setIsActive(true);
    setSystemStatus(isWhiteHat ? 'SECURING' : 'ATTACKING');
    setParticleActivityLevel('intense');
    setTerminalLines([]);
    setProgress(0);
    
    const nodeInterval = setInterval(() => {
      setNetworkNodes(prev =>
        prev.map(node => {
          if (Math.random() > 0.7) {
            if (isWhiteHat) {
              return { ...node, status: ['secure', 'patching', 'monitoring'][Math.floor(Math.random() * 3)] as any };
            } else {
              return { ...node, status: ['compromised', 'breached', 'scanning'][Math.floor(Math.random() * 3)] as any };
            }
          }
          return node;
        })
      );
    }, 1500);

    setTimeout(() => {
      clearInterval(nodeInterval);
      setParticleActivityLevel('normal');
    }, 7000);
  };

  useEffect(() => {
    if (!isTransitioning) {
      setTerminalLines([]);
      setIsActive(false);
      setSystemStatus('IDLE');
      setProgress(0);
      setParticleActivityLevel('normal');
    }
  }, [isWhiteHat, isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive && terminalLines.length < 8) {
        const commands = isWhiteHat ? whiteHatCommands : blackHatCommands;
        const nextLine = commands[terminalLines.length];
        setTerminalLines(prev => [...prev, `> ${nextLine}`]);
        setProgress((terminalLines.length + 1) / 8 * 100);
        
        if (terminalLines.length === 7) {
          setSystemStatus(isWhiteHat ? 'SECURED' : 'BREACHED');
          setIsActive(false);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isActive, terminalLines, isWhiteHat]);

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

  const currentTheme = {
    bg: isWhiteHat ? 'bg-gray-900' : 'bg-black',
    text: isWhiteHat ? 'text-blue-400' : 'text-green-400',
    border: isWhiteHat ? 'border-blue-400/30' : 'border-green-400/30',
    headerBg: isWhiteHat ? 'bg-gray-900/90' : 'bg-black/90',
    panelBg: isWhiteHat ? 'bg-gray-900/70' : 'bg-black/70'
  };

  // --- Action Execution Logic ---
  const executeGameAction = async (action: string, targetNode: NetworkNode, mode: GameMode) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);

    try {
      // Get action costs
      const costs = threatManager.getActionCosts(action);
      
      // Check if we have enough resources
      if (resources.energy < costs.energy || 
          resources.bandwidth < costs.bandwidth || 
          resources.processing < costs.processing) {
        setActionLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Insufficient resources for ${action}`,
          ...prev
        ]);
        return;
      }

      // Deduct resources
      setResources(prev => ({
        energy: prev.energy - costs.energy,
        bandwidth: prev.bandwidth - costs.bandwidth,
        processing: prev.processing - costs.processing
      }));

      // For tutorial, ensure scan action always succeeds
      let isSuccessful = true;
      if (!isTutorialActive || action !== 'SCAN_TARGETS') {
        // Calculate success probability only for non-tutorial actions
        const successProbability = threatManager.calculateSuccessProbability(
          action,
          mode,
          targetNode.type,
          targetNode.status,
          targetNode.defense
        );
        isSuccessful = Math.random() < successProbability;
      }

      // Update node status based on action and success
      let newStatus: NodeStatus = targetNode.status;
      
      if (isSuccessful) {
        if (mode === 'WHITE_HAT') {
          switch (action) {
            case 'PATCH':
              newStatus = targetNode.status === 'vulnerable' ? 'secure' : targetNode.status;
              break;
            case 'QUARANTINE':
              newStatus = targetNode.status === 'compromised' ? 'vulnerable' : targetNode.status;
              break;
            case 'MONITOR':
              newStatus = 'monitoring';
              break;
            case 'SCAN':
              newStatus = 'scanning';
              break;
          }
        } else {
          switch (action) {
            case 'SCAN_TARGETS':
              // For tutorial step 3, make the scan always successful and set status to vulnerable
              if (isTutorialActive && tutorialStep === 3 && targetNode.name === 'WEB-01') {
                newStatus = 'vulnerable';
                setTutorialStep(4); // Advance to step 4
              } else {
                newStatus = 'scanning';
              }
              break;
            case 'EXPLOIT':
              if (targetNode.status === 'vulnerable' || targetNode.status === 'active') {
                newStatus = 'compromised';
              }
              break;
            case 'BACKDOOR':
              if (targetNode.status === 'compromised') {
                newStatus = 'breached';
              }
              break;
          }
        }
      }

      // Update node status
      if (newStatus !== targetNode.status) {
        handleNodeStatusChange(targetNode.id, targetNode.status, newStatus);
      }

      // Set feedback status on the target node
      setNetworkNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === targetNode.id 
            ? { 
                ...node, 
                feedbackStatus: isSuccessful ? 'success' : 'failure', 
                feedbackEndTime: Date.now() + 1000
              } 
            : node
        )
      );

      // Log the action result
      setActionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${action} on ${targetNode.name}: ${isSuccessful ? 'SUCCESS' : 'FAILED'}`,
        ...prev
      ]);

    } catch (error) {
      console.error('Error executing action:', error);
      setActionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Error executing ${action}`,
        ...prev
      ]);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Action handlers for buttons
  const handleDefenseAction = async (action: string) => {
    const mode = 'WHITE_HAT';
    console.log(`Attempting Defense Action: ${action}`);
    console.log(`Conditions: gameState=${gameState}, isActionInProgress=${isActionInProgress}, targetingMode.isActive=${targetingMode.isActive}, selectedNodeId=${selectedNodeId}`);

    // Tutorial Step 2 & 5: Select Action
    if (isTutorialActive && (tutorialStep === 2 || tutorialStep === 5) && tutorialSteps[tutorialStep - 1].action === 'SELECT_ACTION' && tutorialSteps[tutorialStep - 1].targetAction === action) {
       setTutorialStep(tutorialStep + 1); // Advance to the next step
    }

    // Only proceed if a node is selected and not in targeting mode
    if (gameState !== 'PLAYING' || isActionInProgress || targetingMode.isActive || selectedNodeId === null) {
      if (selectedNodeId === null) {
        setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Please select a node first.`, ...prev]);
      }
      console.log('Defense Action prevented by conditions.');
      return; 
    }

    // Find the selected node
    const targetNode = networkNodes.find(n => n.id === selectedNodeId);
    if (!targetNode) {
       setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Error: Selected node not found.`, ...prev]);
       setSelectedNodeId(null); // Clear selected node if not found
       return;
    }

    // Check cooldown
    if (cooldowns[action] && cooldowns[action] > Date.now()) {
      setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] ${action} is on cooldown`, ...prev]);
      return;
    }

    // Check resources
    const costs = balanceManager.getResourceCosts(action, mode);
    if (resources.energy < costs.energy || 
        resources.bandwidth < costs.bandwidth || 
        resources.processing < costs.processing) {
      setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Insufficient resources for ${action}`, ...prev]);
      return;
    }

    // Deduct resources immediately upon initiating targeting
     setResources(prev => ({
      energy: prev.energy - costs.energy,
      bandwidth: prev.bandwidth - costs.bandwidth,
      processing: prev.processing - costs.processing
    }));

    // Enter targeting mode
    setActionLogs(prev => [
       `[${new Date().toLocaleTimeString()}] ${action} selected. Click on a target node.`,
        ...prev
    ]);
    setTargetingMode({ isActive: true, actionType: action, mode: mode });

    // Execute the action
    await executeGameAction(action, targetNode, mode);
  };

  const handleAttackAction = async (action: string) => {
    const mode = 'BLACK_HAT';
    console.log(`Attempting Attack Action: ${action}`);
    console.log(`Conditions: gameState=${gameState}, isActionInProgress=${isActionInProgress}, targetingMode.isActive=${targetingMode.isActive}, selectedNodeId=${selectedNodeId}`);

    // Tutorial Step (Black Hat equivalent): Select Action (if needed)
    // Add similar logic here if adding a Black Hat tutorial

     // Only proceed if a node is selected and not in targeting mode
    if (gameState !== 'PLAYING' || isActionInProgress || targetingMode.isActive || selectedNodeId === null) {
      if (selectedNodeId === null) {
         setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Please select a node first.`, ...prev]);
       }
       console.log('Attack Action prevented by conditions.');
       return; 
     }

    // Find the selected node
    const targetNode = networkNodes.find(n => n.id === selectedNodeId);
    if (!targetNode) {
       setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Error: Selected node not found.`, ...prev]);
       setSelectedNodeId(null); // Clear selected node if not found
       return;
    }

    // Check cooldown
    if (cooldowns[action] && cooldowns[action] > Date.now()) {
      setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] ${action} is on cooldown`, ...prev]);
      return;
    }

    // Check resources
    const costs = balanceManager.getResourceCosts(action, mode);
    if (resources.energy < costs.energy || 
        resources.bandwidth < costs.bandwidth || 
        resources.processing < costs.processing) {
      setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Insufficient resources for ${action}`, ...prev]);
      return;
    }

    // Deduct resources immediately upon initiating targeting
     setResources(prev => ({
      energy: prev.energy - costs.energy,
      bandwidth: prev.bandwidth - costs.bandwidth,
      processing: prev.processing - costs.processing
    }));

    // Enter targeting mode
     setActionLogs(prev => [
       `[${new Date().toLocaleTimeString()}] ${action} selected. Click on a target node.`,
        ...prev
    ]);
    setTargetingMode({ isActive: true, actionType: action, mode: mode });

    // Execute the action
    await executeGameAction(action, targetNode, mode);
  };

  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (leftColRef.current) {
      setLeftColHeight(leftColRef.current.offsetHeight);
    }
  }, [terminalLines, threats]);

  // Connections and colors as in the reference image
  const connections = [
    { from: 1, to: 2, color: '#22ff88' }, // WEB-01 <-> FW-MAIN (green)
    { from: 2, to: 3, color: '#38bdf8' }, // FW-MAIN <-> DB-CORE (blue)
    { from: 3, to: 6, color: '#a855f7' }, // DB-CORE <-> APP-02 (purple)
    { from: 4, to: 5, color: '#22ff88' }, // RTR-01 <-> WS-05 (green)
    { from: 4, to: 6, color: '#22ff88' }, // RTR-01 <-> APP-02 (green)
  ];

  const handleStartGame = () => {
    console.log('Starting game and tutorial');
    setIsGameStarted(true);
    setGameState('PLAYING');
    objectiveManager.initializeObjectives(isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT');

    setNetworkNodes(prevNodes => prevNodes.map(node => {
        if (node.id === 1) {
            return { ...node, status: isWhiteHat ? 'vulnerable' : 'active', isInteractable: true };
        }
        return { ...node, status: 'active', isInteractable: true };
    }));

    console.log('Setting tutorial active');
    setIsTutorialActive(true);
    setTutorialStep(1);
  };

  // Add resource regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => ({
        energy: Math.min(100, prev.energy + 1),
        bandwidth: Math.min(100, prev.bandwidth + 1),
        processing: Math.min(100, prev.processing + 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Add cooldown display
  const getCooldownRemaining = (action: string) => {
    if (!cooldowns[action]) return 0;
    const remaining = cooldowns[action] - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  };

  // Memoize the action button to prevent unnecessary re-renders
  const ActionButton = React.memo(({ 
    action, 
    mode, 
    onClick, 
    hasResources, 
    costs, 
  }: {
    action: string;
    mode: 'WHITE_HAT' | 'BLACK_HAT';
    onClick: () => void;
    hasResources: boolean;
    costs: { energy: number; bandwidth: number; processing: number };
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const buttonStyle = {
      base: `w-full h-full rounded border-2 font-bold text-xs bg-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center`,
      state: !hasResources 
          ? 'border-red-500 text-red-500' 
          : mode === 'WHITE_HAT' 
            ? 'border-blue-400 text-blue-300 hover:bg-blue-400/10' 
            : 'border-green-400 text-green-300 hover:bg-green-400/10',
      hover: isHovered ? 'shadow-lg' : '',
      press: isPressed ? 'scale-95' : ''
    };

    return (
      <button
        onClick={onClick}
        disabled={!hasResources}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`${buttonStyle.base} ${buttonStyle.state} ${buttonStyle.hover} ${buttonStyle.press}`}
      >
        <div className="flex flex-col items-center">
          <div className="font-bold">{action}</div>
          <div className="text-xs opacity-70 flex items-center gap-1">
            <span className="text-yellow-400">E:{costs.energy}</span>
            <span className="text-blue-400">B:{costs.bandwidth}</span>
            <span className="text-purple-400">P:{costs.processing}</span>
          </div>
          {hasResources && (
            <div className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : ''
            } ${
              mode === 'WHITE_HAT' ? 'bg-blue-400/5' : 'bg-green-400/5'
            }`} />
          )}
        </div>
      </button>
    );
  });

  // Update the action buttons grid to use the memoized component
  const renderActionButtons = (mode: 'WHITE_HAT' | 'BLACK_HAT') => {
    const actions = mode === 'WHITE_HAT' 
      ? ['PATCH_ALL', 'QUARANTINE', 'BACKUP', 'MONITOR']
      : ['SCAN_TARGETS', 'EXPLOIT', 'BACKDOOR', 'DENIAL_OF_SERVICE'];

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {actions.map(action => {
          const costs = balanceManager.getResourceCosts(action, mode);
          const hasResources = resources.energy >= costs.energy && 
                             resources.bandwidth >= costs.bandwidth && 
                             resources.processing >= costs.processing;

          return (
            <div key={`${mode}-${action}`} className="relative">
              <div className="w-full h-16"> {/* Container with fixed height */}
                <ActionButton
                  action={action}
                  mode={mode}
                  onClick={() => {
                    if (mode === 'WHITE_HAT') {
                      handleDefenseAction(action);
                    } else {
                      handleAttackAction(action);
                    }
                  }}
                  hasResources={hasResources}
                  costs={costs}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Add resource display component
  const ResourceDisplay = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <span className="text-sm">E: {resources.energy}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-sm">B: {resources.bandwidth}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-400" />
        <span className="text-sm">P: {resources.processing}</span>
      </div>
    </div>
  );

  const handleNodeClick = (node: NetworkNode) => {
    if (!isGameStarted) return;

    // If we're in targeting mode and have an action selected
    if (targetingMode.isActive && targetingMode.actionType) {
      const action = targetingMode.actionType;
      const mode = isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';
      
      // Check if the node is a valid target for this action
      if (threatManager.canInteractWithNode(node, mode, action)) {
        // Execute the appropriate action based on mode
        if (isWhiteHat) {
          handleDefenseAction(action);
        } else {
          handleAttackAction(action);
        }
        // Reset selected node and targeting mode after successful action
        setSelectedNodeId(null);
        setTargetingMode({ isActive: false, actionType: null, mode: null });
      } else {
        // Add feedback for invalid target
        setActionLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Invalid target for ${action} action`,
          ...prev
        ]);
        // Reset selected node and targeting mode on invalid target
        setSelectedNodeId(null);
        setTargetingMode({ isActive: false, actionType: null, mode: null });
      }
    } else { // If not in targeting mode, just select/deselect the node
      if (selectedNodeId === node.id) {
        // Deselect the node if it's already selected
        setSelectedNodeId(null);
        setActionLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Deselected node: ${node.name}`,
          ...prev
        ]);
      } else {
        // Select the clicked node
        setSelectedNodeId(node.id);
        setActionLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Selected node: ${node.name}`,
          ...prev
        ]);
      }
    }

    // Tutorial Step 1: Select WEB-01
    if (isTutorialActive && tutorialStep === 1 && node.name === 'WEB-01') {
      setTutorialStep(2); // Advance to step 2
    }
    // Tutorial Step 4: Click vulnerable WEB-01
    else if (isTutorialActive && tutorialStep === 4 && node.name === 'WEB-01' && node.status === 'vulnerable') {
      setTutorialStep(5); // Advance to step 5
    }
  };

  // Effect to check win/loss conditions
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const currentObjectives: Objective[] = objectiveManager.getCurrentObjectives();

      // Filter for primary win/loss objectives based on IDs in ObjectiveManager
      const whiteHatPrimaryObjectives = currentObjectives.filter(obj => 
        obj.id === 'secure_network' || obj.id === 'maintain_defense' || obj.id === 'upgrade_security'
      );
      const blackHatPrimaryObjectives = currentObjectives.filter(obj => 
        obj.id === 'breach_network' || obj.id === 'maintain_access' || obj.id === 'escalate_privileges'
      );

      const allWhiteHatPrimaryObjectivesComplete = whiteHatPrimaryObjectives.length > 0 && whiteHatPrimaryObjectives.every(obj => obj.status === 'COMPLETED');
      const allBlackHatPrimaryObjectivesComplete = blackHatPrimaryObjectives.length > 0 && blackHatPrimaryObjectives.every(obj => obj.status === 'COMPLETED');

      // Define Win/Loss Conditions

      // White Hat Win Condition: All primary white hat objectives complete AND system integrity is high
      if (isWhiteHat && allWhiteHatPrimaryObjectivesComplete && targetStatus.systemIntegrity > 80) {
        setGameState('WHITE_HAT_WIN');
        setActionLogs(prev => [
           `[${new Date().toLocaleTimeString()}] SIMULATION COMPLETE: WHITE HAT VICTORY!`,
            ...prev
        ]);
      }
      // Black Hat Win Condition: All primary black hat objectives complete OR system integrity is zero
      else if (!isWhiteHat && (allBlackHatPrimaryObjectivesComplete || targetStatus.systemIntegrity <= 0)) {
         setGameState('BLACK_HAT_WIN');
         setActionLogs(prev => [
            `[${new Date().toLocaleTimeString()}] SIMULATION COMPLETE: BLACK HAT VICTORY!`,
             ...prev
         ]);
      }
      // White Hat Loss Condition: System integrity is zero OR Black Hat wins (checked above)
      else if (isWhiteHat && targetStatus.systemIntegrity <= 0) {
         setGameState('GAME_OVER_LOSS');
         setActionLogs(prev => [
            `[${new Date().toLocaleTimeString()}] SIMULATION FAILED: SYSTEM BREACHED!`,
             ...prev
         ]);
      }
      // Black Hat Loss Condition: White Hat wins (checked above)

    }
  }, [gameState, isWhiteHat, objectiveManager, targetStatus.systemIntegrity]); // Depend on relevant state

  // Effect to update objectives based on System Integrity changes
  useEffect(() => {
    if (isGameStarted && gameState === 'PLAYING') {
      const mode = isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'; // Determine current mode
      objectiveManager.updateObjectiveProgress('SYSTEM_INTEGRITY', targetStatus.systemIntegrity, undefined, mode); // Pass mode, undefined for nodeId
       // Note: The ObjectiveManager already handles checking for objective completion
    }
  }, [isGameStarted, gameState, objectiveManager, targetStatus.systemIntegrity, isWhiteHat]); // Depend on relevant state and game mode

  // Effect to clean up node feedback status
  useEffect(() => {
    const feedbackTimer = setInterval(() => {
      const now = Date.now();
      setNetworkNodes(prevNodes => 
         prevNodes.map(node => {
            if (node.feedbackEndTime && node.feedbackEndTime < now) {
               // Clear feedback status if the end time has passed
               const newNode = { ...node };
               delete newNode.feedbackStatus;
               delete newNode.feedbackEndTime;
               return newNode;
            }
            return node;
         })
      );
    }, 100); // Check frequently for expired feedback

    return () => clearInterval(feedbackTimer);
  }, [setNetworkNodes]); // Depend on setNetworkNodes to ensure the effect has the latest state setter

  // Timer effect for duration-based objectives
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isGameStarted && gameState === 'PLAYING') {
      intervalId = setInterval(() => {
        const now = Date.now();
        const mode = isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';

        Object.entries(nodeStateTimers).forEach(([nodeIdStr, { status, startTime }]) => {
          const nodeId = parseInt(nodeIdStr, 10);
          // Calculate total elapsed time in seconds for this node's current state
          const totalElapsedSeconds = Math.floor((now - startTime) / 1000);

          let objectiveTypeToUpdate: string | null = null;

          if (mode === 'WHITE_HAT' && status === 'monitoring') {
            objectiveTypeToUpdate = 'NODE_MONITORED_DURATION';
          } else if (mode === 'BLACK_HAT' && (status === 'compromised' || status === 'breached')) {
            objectiveTypeToUpdate = 'NODE_ACCESS_MAINTAINED_DURATION';
          }

          if (objectiveTypeToUpdate) {
            // Pass the total elapsed time since the state started
            objectiveManager.updateObjectiveProgress(objectiveTypeToUpdate, totalElapsedSeconds, nodeId, mode);
          }
        });
      }, 1000); // Check every 1 second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isGameStarted, gameState, isWhiteHat, nodeStateTimers, objectiveManager]); // Depend on relevant state and managers

  // Effect to manage node highlighting based on tutorial step
  useEffect(() => {
    if (!isTutorialActive) {
      // Clear all highlights if tutorial is not active
      setNetworkNodes(prevNodes => {
        const nodesToUpdate = prevNodes.filter(node => node.highlighted);
        if (nodesToUpdate.length === 0) return prevNodes; // No changes needed
        return prevNodes.map(node => node.highlighted ? { ...node, highlighted: false } : node);
      });
      return;
    }

    const currentStep = tutorialSteps.find(step => step.id === tutorialStep);

    setNetworkNodes(prevNodes => {
      let nodesChanged = false;
      const nextNodes = prevNodes.map(node => {
        // Determine if this node should be highlighted in the next state
        const shouldBeHighlighted = (
          currentStep?.targetNodeId !== undefined && node.id === currentStep.targetNodeId &&
          (currentStep.requiredStatus === undefined || node.status === currentStep.requiredStatus)
        );
        
        // Check if the highlighted status is different from the current state
        if (shouldBeHighlighted !== node.highlighted) {
          nodesChanged = true;
          return { ...node, highlighted: shouldBeHighlighted };
        }
        return node;
      });

      // Only update state if there were actual changes
      if (nodesChanged) {
        return nextNodes;
      } else {
        return prevNodes; // Return the previous state to avoid unnecessary re-renders
      }
    });

  }, [isTutorialActive, tutorialStep, tutorialSteps, setNetworkNodes]); // Depend on state and setter

  // Effect to handle tutorial step progression based on actions
  useEffect(() => {
    if (!isTutorialActive || tutorialStep >= tutorialSteps.length) return;

    const currentStepData = tutorialSteps[tutorialStep - 1]; // tutorialStep is 1-indexed

    // Logic to advance tutorial based on actions
    // This will be triggered by user interactions like node clicks, action button clicks, etc.
    // For now, we will manually advance based on specific actions.
    // We will need to integrate this more deeply into the action handling logic.

  }, [isTutorialActive, tutorialStep, tutorialSteps]);

  return (
    <div className={`font-mono overflow-hidden relative transition-all duration-500 ${currentTheme.bg} ${currentTheme.text} w-[1200px] max-w-[95vw]`}>
      {/* Header */}
      <div className={`relative z-10 border-b backdrop-blur-sm ${currentTheme.border} ${currentTheme.headerBg}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isWhiteHat ? <Shield className="w-8 h-8" /> : <Terminal className="w-8 h-8" />}
            <h1 className={`text-2xl font-bold tracking-wider ${currentTheme.text}`}>
              {isWhiteHat ? 'CYBER_DEFENSE_SYSTEM_v3.2' : 'NEURAL_HACK_v2.7'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Score Display */}
            <ScoreDisplay className="mr-4" />
            
            {/* Resource Display */}
            <ResourceDisplay />
            
            {/* Start Game Button */}
            {!isGameStarted && (
              <button
                onClick={handleStartGame}
                className={`group relative px-6 py-2 rounded-lg border-2 text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  isWhiteHat 
                    ? 'border-blue-400 text-blue-400 hover:bg-blue-400/10' 
                    : 'border-green-400 text-green-400 hover:bg-green-400/10'
                }`}
              >
                <span className="relative z-10">START SIMULATION</span>
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isWhiteHat ? 'bg-blue-400/5' : 'bg-green-400/5'
                }`} />
                <div className={`absolute -inset-1 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isWhiteHat ? 'bg-blue-400/20' : 'bg-green-400/20'
                }`} />
              </button>
            )}

            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
              <span className={`text-sm ${!isWhiteHat ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                BLACK HAT
              </span>
              <button
                onClick={handleModeToggle}
                disabled={isTransitioning}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  isWhiteHat ? 'bg-blue-600' : 'bg-green-600'
                } ${isTransitioning ? 'animate-pulse' : ''}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ${
                  isWhiteHat ? 'left-6' : 'left-0.5'
                } ${isTransitioning ? 'animate-bounce' : ''}`} />
              </button>
              <span className={`text-sm ${isWhiteHat ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                WHITE HAT
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus === 'SECURING' || systemStatus === 'ATTACKING' ? 'bg-yellow-400 animate-pulse' : 
                  systemStatus === 'SECURED' || systemStatus === 'BREACHED' ? (isWhiteHat ? 'bg-green-400' : 'bg-purple-400') : 
                  (isWhiteHat ? 'bg-blue-400 animate-pulse' : 'bg-green-400 animate-pulse')
                }`} />
                <span className="text-sm">{systemStatus}</span>
              </div>
              <div className="text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
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

      {/* Main Content */}
      <div className="relative z-10 p-4 grid grid-cols-3 gap-4">
        {/* Tutorial Console - Moved above main panels */}
        {isTutorialActive && (
          <div className="col-span-3 mb-4">
            <div className={`p-4 rounded-lg backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border} shadow-lg border-2`}>
              <div className="flex items-center gap-2 mb-3 border-b pb-2 border-blue-400/30">
                <Terminal className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">TUTORIAL_CONSOLE</span>
              </div>
              <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {tutorialText}
                {isTyping && <span className="animate-pulse text-blue-400">█</span>}
              </div>
            </div>
          </div>
        )}

        {/* Left Panel */}
        <div className="col-span-1 space-y-4" ref={leftColRef}>
          {/* Add ObjectiveDisplay at the top of the left panel */}
          {isGameStarted && (
            <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
              <ObjectiveDisplay mode={isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'} />
            </div>
          )}

          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Code className="w-5 h-5" />
              <span className="text-sm font-bold">
                {isWhiteHat ? 'SECURITY_LOG' : 'TERMINAL'}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              {terminalLines.map((line, index) => (
                <div key={`line-${index}`} className={currentTheme.text}>
                  {line}
                  {index === terminalLines.length - 1 && isActive && (
                    <span className="animate-pulse">█</span>
                  )}
                </div>
              ))}
              {!isActive && (
                <div className={currentTheme.text}>
                  &gt; <span className="animate-pulse">█</span>
                </div>
              )}
            </div>
          </div>

          {/* Threats Panel */}
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
        </div>

        {/* Center Panel - 3D Network */}
        <div className="col-span-1">
          <div className={`bg-gray-900/70 border border-blue-400/30 rounded-lg p-4 h-full backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-4 border-b border-blue-400/30 pb-2">
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-bold">NETWORK_TOPOLOGY</span>
            </div>
            {/* Pass correct props to InteractiveNetworkTopology */}
            <InteractiveNetworkTopology
              nodes={networkNodes}
              onNodeClick={handleNodeClick}
              mode={isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
              isTransitioning={isTransitioning}
              targetingMode={targetingMode}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-1 space-y-4">
          {/* Combined System Status + Defense Actions Panel */}
          {isWhiteHat && (
            <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-blue-400">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">DEFENSE_ACTIONS</span>
              </div>
              {/* Progress and Lockdown */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300">Operation Progress</span>
                  <span className="text-sm text-blue-300">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-blue-400/40">
                  <div
                    className="h-2 rounded-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  onClick={startOperation}
                  disabled={isActive}
                  className="w-full py-2 px-4 rounded border border-blue-400 text-blue-400 font-bold text-sm flex items-center justify-center gap-2 mt-2 bg-transparent hover:bg-blue-400/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isActive ? 'SECURING...' : 'INITIATE_LOCKDOWN'}
                </button>
              </div>
              {/* Action Buttons Grid */}
              {renderActionButtons('WHITE_HAT')}
            </div>
          )}
          {/* Offense Actions Panel (Black Hat) */}
          {!isWhiteHat && (
            <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
              <div className="flex items-center gap-2 mb-4 border-b pb-2 border-green-400">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-400">ATTACK_ACTIONS</span>
              </div>
              {/* Progress and Hack */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300">Operation Progress</span>
                  <span className="text-sm text-green-300">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 border border-green-400/40">
                  <div
                    className="h-2 rounded-full bg-green-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  onClick={startOperation}
                  disabled={isActive}
                  className="w-full py-2 px-4 rounded border border-green-400 text-green-400 font-bold text-sm flex items-center justify-center gap-2 mt-2 bg-transparent hover:bg-green-400/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  {isActive ? 'HACKING...' : 'INITIATE_HACK'}
                </button>
              </div>
              {/* Action Buttons Grid */}
              {renderActionButtons('BLACK_HAT')}
            </div>
          )}

          {/* Network Stats */}
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Server className="w-5 h-5" />
              <span className="text-sm font-bold">NETWORK_STATS</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active Nodes</span>
                <span>{networkNodes.filter(n => n.status === 'active').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Secure Nodes</span>
                <span>{networkNodes.filter(n => n.status === 'secure').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Compromised Nodes</span>
                <span>{networkNodes.filter(n => n.status === 'compromised').length}</span>
              </div>
            </div>
          </div>

          {/* Action Logs Panel */}
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Code className="w-5 h-5" />
              <span className="text-sm font-bold">ACTION_LOGS</span>
            </div>
            <div className="space-y-1 text-sm">
              {actionLogs.map((log, index) => (
                <div key={`log-${index}`} className={currentTheme.text}>{log}</div>
              ))}
            </div>
          </div>

          {/* Target Status Panel */}
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Brain className="w-5 h-5" />
              <span className="text-sm font-bold">{isWhiteHat ? 'DEFENSE_STATUS' : 'TARGET_STATUS'}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Firewall Status</span>
                <span className={targetStatus.firewall === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}>{targetStatus.firewall}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Encryption Level</span>
                <span className={targetStatus.encryption === 'MAXIMUM' ? 'text-green-400' : 'text-yellow-400'}>{targetStatus.encryption}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Access Control</span>
                <span className={targetStatus.accessControl === 'ENFORCED' ? 'text-green-400' : 'text-red-400'}>{targetStatus.accessControl}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>System Integrity</span>
                <span className={targetStatus.systemIntegrity > 80 ? 'text-green-400' : targetStatus.systemIntegrity > 40 ? 'text-yellow-400' : 'text-red-400'}>{targetStatus.systemIntegrity}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep the DraggableNode component as it was before the erroneous edit
function DraggableNode({
  node,
  setNetworkNodes,
}: {
  node: NetworkNode;
  setNetworkNodes: React.Dispatch<React.SetStateAction<NetworkNode[]>>;
}) {
  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = React.useState(false);

  // Update node hover/drag state in parent
  React.useEffect(() => {
    setNetworkNodes((prev: NetworkNode[]) =>
      prev.map((n: NetworkNode) =>
        n.id === node.id ? { ...n, isHovered: hovered, isDragging: dragging } : n
      )
    );
    // eslint-disable-next-line
  }, [hovered, dragging]);

  // Drag logic
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = node.x;
    const origY = node.y;
    const onMove = (moveEvent: MouseEvent) => {
      if (!nodeRef.current || !nodeRef.current.parentElement) return;
      const dx = ((moveEvent.clientX - startX) / nodeRef.current.parentElement.offsetWidth) * 100;
      const dy = ((moveEvent.clientY - startY) / nodeRef.current.parentElement.offsetHeight) * 100;
      setNetworkNodes((prev: NetworkNode[]) =>
        prev.map((n: NetworkNode) =>
          n.id === node.id
            ? {
                ...n,
                x: Math.max(5, Math.min(95, origX + dx)),
                y: Math.max(5, Math.min(95, origY + dy)),
              }
            : n
        )
      );
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Click toggles status
  const onClick = () => {
    setNetworkNodes((prev: NetworkNode[]) =>
      prev.map((n: NetworkNode) =>
        n.id === node.id
          ? {
              ...n,
              status: n.status === 'secure' ? 'compromised' : 'secure',
            }
          : n
      )
    );
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute group cursor-pointer select-none`}
      style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', zIndex: hovered || dragging ? 10 : 1 }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => { setHovered(true); setTooltip(true); }}
      onMouseLeave={() => { setHovered(false); setTooltip(false); }}
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-full border-2 bg-gray-900/80 flex items-center justify-center transition-all duration-200">
        {/* Icon handled in InteractiveNetworkTopology */}
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-center">
        <div className="font-bold">{node.name}</div>
        <div className="text-xs">{node.status.toUpperCase()}</div>
      </div>
      {tooltip && (
        <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50">
          <div><b>{node.name}</b></div>
          <div>Type: {node.type}</div>
          <div>Status: {node.status}</div>
        </div>
      )}
    </div>
  );
}
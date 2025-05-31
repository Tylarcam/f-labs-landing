'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Terminal, Code, Activity, Eye, Zap, Target, CheckCircle, Wifi, Server, Database, Router, Monitor, Brain, Lock } from 'lucide-react';
import { useNetworkNodes } from '../../hooks/useNetworkNodes';
import { useThreats } from '../../hooks/useThreats';
import { transform3DNode, getLayerColor } from '../../utils/3d';
import { Threat, SystemStatus, ParticleActivityLevel, NodeStatus, NodeType, GameMode, GameState, Objective, GameAction, ActionEffect, NetworkNode } from '../../types/game';
import InteractiveNetworkTopology from '../network/InteractiveNetworkTopology';
import { ScoringManager } from '../../game/ScoringManager';
import { ScoreDisplay } from '../game/ScoreDisplay';
import { ObjectiveManager } from '../../game/ObjectiveManager';
import { ThreatManager } from '../../game/ThreatManager';
import { Tutorial } from '../game/Tutorial';
import { ObjectiveDisplay } from '../game/ObjectiveDisplay';
import { useGameState } from '../../hooks/useGameState';
import { useNodeInteraction } from '../../hooks/useNodeInteraction';
import { ResourceDisplay } from '../game/ResourceDisplay';
import { useGameMode } from '../../hooks/useGameMode';

// Move GameBalanceManager to a separate file
// Create new file: src/game/GameBalanceManager.ts
export class GameBalanceManager {
  private static instance: GameBalanceManager;
  
  private constructor() {}
  
  static getInstance(): GameBalanceManager {
    if (!GameBalanceManager.instance) {
      GameBalanceManager.instance = new GameBalanceManager();
    }
    return GameBalanceManager.instance;
  }

  getResourceCosts(action: string, mode: GameMode) {
    // Default resource costs
    const costs: Record<string, { energy: number; bandwidth: number; processing: number }> = {
      'PATCH_ALL': { energy: 20, bandwidth: 15, processing: 25 },
      'QUARANTINE': { energy: 15, bandwidth: 20, processing: 15 },
      'BACKUP': { energy: 10, bandwidth: 25, processing: 20 },
      'MONITOR': { energy: 5, bandwidth: 10, processing: 15 },
      'SCAN_TARGETS': { energy: 10, bandwidth: 15, processing: 10 },
      'EXPLOIT': { energy: 20, bandwidth: 15, processing: 25 },
      'BACKDOOR': { energy: 25, bandwidth: 20, processing: 30 },
      'DENIAL_OF_SERVICE': { energy: 30, bandwidth: 35, processing: 25 }
    };
    return costs[action] || { energy: 10, bandwidth: 10, processing: 10 };
  }

  getActionCooldown(action: string, mode: GameMode): number {
    // Default cooldown times in milliseconds
    const cooldowns: Record<string, number> = {
      'PATCH_ALL': 30000,
      'QUARANTINE': 20000,
      'BACKUP': 15000,
      'MONITOR': 10000,
      'SCAN_TARGETS': 15000,
      'EXPLOIT': 25000,
      'BACKDOOR': 30000,
      'DENIAL_OF_SERVICE': 45000
    };
    return cooldowns[action] || 10000; // Default 10s cooldown
  }
}

interface TutorialStep {
  id: number;
  text: string;
  action: 'SELECT_NODE' | 'SELECT_ACTION' | 'PERFORM_ACTION' | 'END_TUTORIAL';
  targetNodeId?: number;
  targetAction?: string;
  requiredStatus?: string;
  typingSpeed: number;
  lineDelay: number;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
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

export default function GameDemoDisplay() {
  const {
    gameState,
    updateGameState,
    resetGameState,
    updateResources,
    addActionLog,
    updateNodeStateTimer,
    clearNodeStateTimer,
    setActionState,
    setCooldown,
    isActionOnCooldown,
    getCooldownRemaining
  } = useGameState();

  const {
    currentMode,
    isTutorialActive,
    tutorialProgress,
    switchToDiscoverMode,
    switchToTutorialMode,
    switchToGameMode,
    updateTutorialProgress,
    completeTutorial
  } = useGameMode();

  // Add back necessary state variables
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('IDLE');
  const [progress, setProgress] = useState(0);
  const [particleActivityLevel, setParticleActivityLevel] = useState<ParticleActivityLevel>('normal');
  
  // Add back mouse interaction and rotation state
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Add back action progress and resources state
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [resources, setResources] = useState({
    energy: 100,
    bandwidth: 100,
    processing: 100
  });
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState({
    firewall: gameState.isWhiteHat ? 'ACTIVE' : 'COMPROMISED',
    encryption: gameState.isWhiteHat ? 'MAXIMUM' : 'DEGRADED',
    accessControl: gameState.isWhiteHat ? 'ENFORCED' : 'BYPASSED',
    systemIntegrity: 100
  });
  const [nodeStateTimers, setNodeStateTimers] = useState<Record<number, { status: NodeStatus, startTime: number }>>({});

  const { networkNodes, setNetworkNodes } = useNetworkNodes(gameState.isWhiteHat, gameState.isTransitioning);

  // Add back tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialText, setTutorialText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStateRef = useRef({
    currentLineIndex: 0,
    currentCharIndex: 0,
    currentText: ''
  });

  // Add back manager instances
  const threatManager = ThreatManager.getInstance();
  const scoringManager = ScoringManager.getInstance();
  const balanceManager = GameBalanceManager.getInstance();
  const objectiveManager = ObjectiveManager.getInstance();

  // Add back command arrays
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

  // Move handleNodeStatusChange before its usage
  const handleNodeStatusChange = useCallback((nodeId: number, previousStatus: NodeStatus, currentStatus: NodeStatus) => {
    const node = networkNodes?.find(n => n.id === nodeId);
    if (!node) return;

    // Update node state timers
    const isRelevantForDuration = (
      (gameState.isWhiteHat && (currentStatus === 'monitoring' || currentStatus === 'backed_up')) ||
      (!gameState.isWhiteHat && (currentStatus === 'compromised' || currentStatus === 'breached' || currentStatus === 'overloaded'))
    );

    const wasRelevantForDuration = (
      (gameState.isWhiteHat && (previousStatus === 'monitoring' || previousStatus === 'backed_up')) ||
      (!gameState.isWhiteHat && (previousStatus === 'compromised' || previousStatus === 'breached' || previousStatus === 'overloaded'))
    );

    if (isRelevantForDuration && !wasRelevantForDuration) {
      updateNodeStateTimer(nodeId, currentStatus);
    } else if (wasRelevantForDuration && !isRelevantForDuration) {
      clearNodeStateTimer(nodeId);
    }

    // Generate threat based on status change
    const threat = threatManager.generateThreatFromNodeStatus(
      node as NetworkNode,
      previousStatus,
      currentStatus,
      gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'
    );

    if (threat) {
      addActionLog(`${threat.type} (${threat.severity})`);
    }

    // Update objectives if game has started
    if (gameState.isGameStarted) {
      const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';
      if (gameState.isWhiteHat) {
        if (currentStatus === 'secure' || currentStatus === 'backed_up') {
          objectiveManager.updateObjectiveProgress('NODES_SECURE', 1, nodeId, mode);
        } else if ((previousStatus === 'compromised' || previousStatus === 'breached') && 
                   (currentStatus !== 'compromised' && currentStatus !== 'breached')) {
          objectiveManager.updateObjectiveProgress('THREATS_BLOCKED', 1, nodeId, mode);
        }
      } else {
        if (currentStatus === 'compromised' || currentStatus === 'breached' || currentStatus === 'overloaded') {
          objectiveManager.updateObjectiveProgress('NODES_COMPROMISED', 1, nodeId, mode);
        }
      }

      if (gameState.isWhiteHat && (currentStatus === 'secure' || currentStatus === 'backed_up')) {
        objectiveManager.updateObjectiveProgress('NODE_SECURED', 1, nodeId, mode);
      } else if (!gameState.isWhiteHat && (currentStatus === 'compromised' || currentStatus === 'breached' || currentStatus === 'overloaded')) {
        objectiveManager.updateObjectiveProgress('NODE_COMPROMISED', 1, nodeId, mode);
      }
    }

    // Handle tutorial progression
    if (gameState.isTutorialActive && (gameState.tutorialStep === 4 || gameState.tutorialStep === 7) && 
        TUTORIAL_STEPS[gameState.tutorialStep - 1].requiredStatus === currentStatus) {
      updateGameState({ tutorialStep: gameState.tutorialStep + 1 });
      if (gameState.tutorialStep + 1 > TUTORIAL_STEPS.length) {
        updateGameState({ isTutorialActive: false });
      }
    }
  }, [
    networkNodes,
    gameState.isWhiteHat,
    gameState.isGameStarted,
    gameState.isTutorialActive,
    gameState.tutorialStep,
    updateNodeStateTimer,
    clearNodeStateTimer,
    addActionLog,
    updateGameState
  ]);

  // Replace node interaction logic with the new hook
  const { handleNodeClick, executeAction } = useNodeInteraction(
    networkNodes,
    setNetworkNodes,
    isTutorialActive,
    tutorialStep,
    setTutorialStep
  );

  // Now use it in useThreats
  const { threats } = useThreats(gameState.isWhiteHat, networkNodes, handleNodeStatusChange);

  // Add back leftColRef
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (leftColRef.current) {
      setLeftColHeight(leftColRef.current.offsetHeight);
    }
  }, [terminalLines, threats]);

  // Update handleModeToggle to use new state management
  const handleModeToggle = useCallback(() => {
    updateGameState({ isTransitioning: true });
    setScanProgress(0);
    
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          updateGameState({ 
            isWhiteHat: !gameState.isWhiteHat,
            isTransitioning: false
          });
          setTimeout(() => {
            setScanProgress(0);
          }, 500);
          return 100;
        }
        return prev + 4;
      });
    }, 30);
  }, [gameState.isWhiteHat, updateGameState]);

  const startOperation = () => {
    setIsActive(true);
    setSystemStatus(gameState.isWhiteHat ? 'SECURING' : 'ATTACKING');
    setParticleActivityLevel('intense');
    setTerminalLines([]);
    setProgress(0);
    
    const nodeInterval = setInterval(() => {
      setNetworkNodes(prev =>
        prev.map(node => {
          if (Math.random() > 0.7) {
            if (gameState.isWhiteHat) {
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
    if (!gameState.isTransitioning) {
      setTerminalLines([]);
      setIsActive(false);
      setSystemStatus('IDLE');
      setProgress(0);
      setParticleActivityLevel('normal');
    }
  }, [gameState.isWhiteHat, gameState.isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActive && terminalLines.length < 8) {
        const commands = gameState.isWhiteHat ? whiteHatCommands : blackHatCommands;
        const nextLine = commands[terminalLines.length];
        setTerminalLines(prev => [...prev, `> ${nextLine}`]);
        setProgress((terminalLines.length + 1) / 8 * 100);
        
        if (terminalLines.length === 7) {
          setSystemStatus(gameState.isWhiteHat ? 'SECURED' : 'BREACHED');
          setIsActive(false);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [gameState.isWhiteHat]);

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
    bg: gameState.isWhiteHat ? 'bg-gray-900' : 'bg-black',
    text: gameState.isWhiteHat ? 'text-blue-400' : 'text-green-400',
    border: gameState.isWhiteHat ? 'border-blue-400/30' : 'border-green-400/30',
    headerBg: gameState.isWhiteHat ? 'bg-gray-900/90' : 'bg-black/90',
    panelBg: gameState.isWhiteHat ? 'bg-gray-900/70' : 'bg-black/70'
  };

  // Update executeGameAction with enhanced mechanics
  const executeGameAction = async (action: string, targetNode: NetworkNode, mode: GameMode) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);

    try {
      // Get action costs and success rate
      const costs = balanceManager.getResourceCosts(action, mode);
      const successRate = calculateActionSuccessRate(action, mode);
      
      // Check if we have enough resources
      if (resources.energy < costs.energy || 
          resources.bandwidth < costs.bandwidth || 
          resources.processing < costs.processing) {
        addActionLog(`Insufficient resources for ${action}`);
        return;
      }

      // Deduct resources
      setResources(prev => ({
        energy: prev.energy - costs.energy,
        bandwidth: prev.bandwidth - costs.bandwidth,
        processing: prev.processing - costs.processing
      }));

      // Calculate success with modifiers
      let isSuccessful = Math.random() * 100 < successRate;

      // For tutorial, ensure scan action always succeeds
      if (isTutorialActive && action === 'SCAN_TARGETS') {
        isSuccessful = true;
      }

      // Update node status based on action and success
      let newStatus: NodeStatus = targetNode.status;
      let chainEffects: { nodeId: number; newStatus: NodeStatus }[] = [];
      
      if (isSuccessful) {
        if (mode === 'WHITE_HAT') {
          switch (action) {
            case 'PATCH_ALL':
              // Patch affects all vulnerable nodes
              chainEffects = networkNodes
                .filter(n => n.status === 'vulnerable')
                .map(n => ({ nodeId: n.id, newStatus: 'secure' }));
              break;
            case 'QUARANTINE':
              // Quarantine affects the target and its neighbors
              newStatus = 'quarantined';
              chainEffects = networkNodes
                .filter(n => n.connections?.includes(targetNode.id))
                .map(n => ({ nodeId: n.id, newStatus: 'monitoring' }));
              break;
            case 'BACKUP':
              // Backup creates a restore point
              newStatus = 'backed_up';
              break;
            case 'MONITOR':
              // Monitoring affects the target and reveals connected compromised nodes
              newStatus = 'monitoring';
              chainEffects = networkNodes
                .filter(n => n.connections?.includes(targetNode.id) && n.status === 'compromised')
                .map(n => ({ nodeId: n.id, newStatus: 'detected' }));
              break;
          }
        } else {
          switch (action) {
            case 'SCAN_TARGETS':
              if (targetNode.status === 'active') {
                newStatus = 'vulnerable';
              }
              break;
            case 'EXPLOIT':
              if (targetNode.status === 'vulnerable') {
                newStatus = 'compromised';
                // Exploit can spread to connected nodes
                chainEffects = networkNodes
                  .filter(n => n.connections?.includes(targetNode.id) && n.status === 'active')
                  .map(n => ({ nodeId: n.id, newStatus: 'vulnerable' }));
              }
              break;
            case 'BACKDOOR':
              if (targetNode.status === 'compromised') {
                newStatus = 'breached';
                // Backdoor can affect connected nodes
                chainEffects = networkNodes
                  .filter(n => n.connections?.includes(targetNode.id) && n.status === 'vulnerable')
                  .map(n => ({ nodeId: n.id, newStatus: 'compromised' }));
              }
              break;
            case 'DENIAL_OF_SERVICE':
              newStatus = 'overloaded';
              // DoS affects connected nodes
              chainEffects = networkNodes
                .filter(n => n.connections?.includes(targetNode.id))
                .map(n => ({ nodeId: n.id, newStatus: 'degraded' }));
              break;
          }
        }
      }

      // Apply status changes with visual feedback
      const updateNodeWithFeedback = (nodeId: number, oldStatus: NodeStatus, newStatus: NodeStatus) => {
        setNetworkNodes(prevNodes => 
          prevNodes.map(node => 
            node.id === nodeId 
              ? { 
                  ...node, 
                  status: newStatus,
                  feedbackStatus: isSuccessful ? 'success' : 'failure',
                  feedbackEndTime: Date.now() + 1000,
                  lastAction: action,
                  lastActionTime: Date.now()
                } 
              : node
          )
        );
      };

      // Update target node
      if (newStatus !== targetNode.status) {
        updateNodeWithFeedback(targetNode.id, targetNode.status, newStatus);
      }

      // Apply chain effects with delay
      for (const effect of chainEffects) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between chain effects
        const affectedNode = networkNodes.find(n => n.id === effect.nodeId);
        if (affectedNode) {
          updateNodeWithFeedback(effect.nodeId, affectedNode.status, effect.newStatus);
        }
      }

      // Update score based on action success and chain effects
      const scoreModifier = isSuccessful ? 1 : -0.5;
      const chainBonus = chainEffects.length * 0.2;
      scoringManager.updateScore(scoreModifier + chainBonus);

      // Log the action result with chain effects
      const chainEffectText = chainEffects.length > 0 
        ? `\nChain effects: ${chainEffects.length} nodes affected`
        : '';
      addActionLog(`${action} on ${targetNode.name}: ${isSuccessful ? 'SUCCESS' : 'FAILED'}${chainEffectText}`);

      // Set cooldown
      const cooldownTime = balanceManager.getActionCooldown(action, mode);
      setCooldown(action, cooldownTime);

    } catch (error) {
      console.error('Error executing action:', error);
      addActionLog('Error executing action');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Add handleActionButton function
  const handleActionButton = (action: string) => {
    if (gameState.actionState.mode !== 'IDLE') return;

    const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';
    const costs = balanceManager.getResourceCosts(action, mode);

    if (gameState.resources.energy < costs.energy || 
        gameState.resources.bandwidth < costs.bandwidth || 
        gameState.resources.processing < costs.processing) {
      addActionLog(`Insufficient resources for ${action}`);
      return;
    }

    // Check cooldown
    if (isActionOnCooldown(action)) {
      addActionLog(`${action} is on cooldown`);
      return;
    }

    // Set action state
    updateGameState({
      actionState: {
        mode: 'SELECTING_TARGET',
        currentAction: action,
        targetNodeId: null,
        cooldownEndTime: null
      }
    });

    addActionLog(`${action} selected. Click on a target node.`);
  };

  // Update the ActionButton component with enhanced visual feedback and strategic elements
  const ActionButton = React.memo(({ 
    action, 
    mode, 
    onClick, 
    hasResources, 
    costs,
    isSelected,
    successRate,
  }: {
    action: string;
    mode: 'WHITE_HAT' | 'BLACK_HAT';
    onClick: () => void;
    hasResources: boolean;
    costs: { energy: number; bandwidth: number; processing: number };
    isSelected: boolean;
    successRate: number;
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const isOnCooldown = isActionOnCooldown(action);
    const cooldownRemaining = getCooldownRemaining(action);

    const getActionIcon = (action: string) => {
      switch (action) {
        case 'PATCH_ALL': return <Shield className="w-4 h-4" />;
        case 'QUARANTINE': return <Lock className="w-4 h-4" />;
        case 'BACKUP': return <Database className="w-4 h-4" />;
        case 'MONITOR': return <Eye className="w-4 h-4" />;
        case 'SCAN_TARGETS': return <Target className="w-4 h-4" />;
        case 'EXPLOIT': return <Terminal className="w-4 h-4" />;
        case 'BACKDOOR': return <Code className="w-4 h-4" />;
        case 'DENIAL_OF_SERVICE': return <Zap className="w-4 h-4" />;
        default: return null;
      }
    };

    const buttonStyle = {
      base: `w-full h-full rounded-lg border-2 font-bold text-xs bg-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center relative overflow-hidden`,
      state: !hasResources || isOnCooldown
        ? 'border-red-500 text-red-500' 
        : isSelected
          ? mode === 'WHITE_HAT' 
            ? 'border-blue-400 bg-blue-400/20 text-blue-300' 
            : 'border-green-400 bg-green-400/20 text-green-300'
          : mode === 'WHITE_HAT' 
            ? 'border-blue-400 text-blue-300 hover:bg-blue-400/10' 
            : 'border-green-400 text-green-300 hover:bg-green-400/10',
      hover: isHovered ? 'shadow-lg scale-105' : '',
      press: isPressed ? 'scale-95' : ''
    };

    return (
      <div className="relative group">
        <button
          onClick={onClick}
          disabled={!hasResources || isOnCooldown || gameState.actionState.mode !== 'IDLE'}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          className={`${buttonStyle.base} ${buttonStyle.state} ${buttonStyle.hover} ${buttonStyle.press}`}
        >
          <div className="flex flex-col items-center p-2">
            <div className="flex items-center gap-2">
              {getActionIcon(action)}
              <span className="font-bold">{action}</span>
            </div>
            <div className="text-xs opacity-70 flex items-center gap-2 mt-1">
              <span className="text-yellow-400">E:{costs.energy}</span>
              <span className="text-blue-400">B:{costs.bandwidth}</span>
              <span className="text-purple-400">P:{costs.processing}</span>
            </div>
            <div className="text-xs mt-1">
              <span className={successRate >= 70 ? 'text-green-400' : successRate >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                {successRate}% Success
              </span>
            </div>
          </div>
        </button>
        
        {/* Cooldown Overlay */}
        {isOnCooldown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="text-sm font-bold">{cooldownRemaining}s</span>
          </div>
        )}

        {/* Resource Warning */}
        {!hasResources && !isOnCooldown && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
            <span className="text-xs font-bold text-red-400">Insufficient Resources</span>
          </div>
        )}

        {/* Hover Tooltip */}
        {isHovered && !isOnCooldown && hasResources && (
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded-lg text-xs whitespace-nowrap ${
            mode === 'WHITE_HAT' ? 'bg-blue-900/90' : 'bg-green-900/90'
          }`}>
            {getActionDescription(action)}
          </div>
        )}
      </div>
    );
  });

  // Add action descriptions
  const getActionDescription = (action: string): string => {
    const descriptions: Record<string, string> = {
      'PATCH_ALL': 'Apply security patches to all vulnerable nodes',
      'QUARANTINE': 'Isolate compromised nodes to prevent spread',
      'BACKUP': 'Create secure backups of critical systems',
      'MONITOR': 'Deploy enhanced monitoring on target node',
      'SCAN_TARGETS': 'Scan network for vulnerabilities',
      'EXPLOIT': 'Attempt to exploit detected vulnerabilities',
      'BACKDOOR': 'Establish persistent access to target',
      'DENIAL_OF_SERVICE': 'Overwhelm target with malicious traffic'
    };
    return descriptions[action] || '';
  };

  // Update renderActionButtons with success rate calculation
  const renderActionButtons = (mode: 'WHITE_HAT' | 'BLACK_HAT') => {
    const actions = mode === 'WHITE_HAT' 
      ? ['PATCH_ALL', 'QUARANTINE', 'BACKUP', 'MONITOR']
      : ['SCAN_TARGETS', 'EXPLOIT', 'BACKDOOR', 'DENIAL_OF_SERVICE'];

    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {actions.map(action => {
          const costs = balanceManager.getResourceCosts(action, mode);
          const hasResources = gameState.resources.energy >= costs.energy && 
                             gameState.resources.bandwidth >= costs.bandwidth && 
                             gameState.resources.processing >= costs.processing;
          
          // Calculate success rate based on resources and node status
          const successRate = calculateActionSuccessRate(action, mode);

          return (
            <div key={`${mode}-${action}`} className="relative">
              <div className="w-full h-20">
                <ActionButton
                  action={action}
                  mode={mode}
                  onClick={() => handleActionButton(action)}
                  hasResources={hasResources}
                  costs={costs}
                  isSelected={gameState.actionState.currentAction === action}
                  successRate={successRate}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Add success rate calculation
  const calculateActionSuccessRate = (action: string, mode: 'WHITE_HAT' | 'BLACK_HAT'): number => {
    const baseRate = 50; // Base success rate
    let modifier = 0;

    // Resource availability modifier
    const costs = balanceManager.getResourceCosts(action, mode);
    const resourceRatio = Math.min(
      gameState.resources.energy / costs.energy,
      gameState.resources.bandwidth / costs.bandwidth,
      gameState.resources.processing / costs.processing
    );
    modifier += Math.floor(resourceRatio * 20); // Up to +20% from resources

    // Node status modifier
    if (selectedNodeId) {
      const targetNode = networkNodes.find(n => n.id === selectedNodeId);
      if (targetNode) {
        switch (action) {
          case 'PATCH_ALL':
            modifier += targetNode.status === 'vulnerable' ? 15 : -10;
            break;
          case 'QUARANTINE':
            modifier += targetNode.status === 'compromised' ? 20 : -15;
            break;
          case 'EXPLOIT':
            modifier += targetNode.status === 'vulnerable' ? 25 : -20;
            break;
          case 'BACKDOOR':
            modifier += targetNode.status === 'compromised' ? 30 : -25;
            break;
        }
      }
    }

    // Ensure success rate stays within bounds
    return Math.max(0, Math.min(100, baseRate + modifier));
  };

  // Update the resource display section
  const renderResourceDisplay = () => (
    <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
      <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
        <Activity className="w-5 h-5" />
        <span className="text-sm font-bold">RESOURCES</span>
      </div>
      <ResourceDisplay
        resources={gameState.resources}
        cooldowns={gameState.cooldowns}
        isActionOnCooldown={isActionOnCooldown}
        getCooldownRemaining={getCooldownRemaining}
      />
    </div>
  );

  // Update handleStartGame to handle different modes
  const handleStartGame = useCallback(() => {
    if (currentMode === 'DISCOVER') {
      switchToTutorialMode();
    } else if (currentMode === 'TUTORIAL') {
      switchToGameMode();
    } else {
      updateGameState({
        isGameStarted: true,
        mode: 'PLAYING'
      });
    }

    setNetworkNodes(prevNodes => prevNodes.map(node => {
      if (node.id === 1) {
        return { 
          ...node, 
          status: gameState.isWhiteHat ? 'vulnerable' : 'active', 
          isInteractable: true 
        };
      }
      return { ...node, status: 'active', isInteractable: true };
    }));

    objectiveManager.initializeObjectives(gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT');
  }, [currentMode, gameState.isWhiteHat, updateGameState, setNetworkNodes, switchToTutorialMode, switchToGameMode]);

  // Add mode-specific rendering
  const renderModeSpecificUI = () => {
    switch (currentMode) {
      case 'DISCOVER':
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-[75vw] h-[75vh] p-8 bg-gray-900/90 rounded-lg shadow-lg border border-blue-400/50 flex flex-col items-center justify-center text-center space-y-8">
              <h2 className="text-4xl font-bold text-white">Interactive Gaming Experience</h2>
              <p className="text-lg text-gray-300">Dive into our innovative gaming platform that combines cutting-edge technology with immersive gameplay</p>
              <div className="flex gap-4">
                <button
                  onClick={switchToTutorialMode}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200 text-lg"
                >
                  Start Tutorial
                </button>
                <button
                  onClick={switchToGameMode}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200 text-lg"
                >
                  Skip to Game
                </button>
              </div>
            </div>
          </div>
        );
      case 'TUTORIAL':
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-[75vw] h-[75vh] p-8 bg-black/90 rounded-lg shadow-lg border border-blue-400/50 flex flex-col items-center justify-center text-center space-y-8">
              <h3 className="text-white font-bold text-3xl mb-4">Tutorial Mode</h3>
              <div className="bg-black/80 p-6 rounded-lg shadow-inner border border-blue-400/30 text-left w-full max-w-md">
                <h4 className="text-blue-400 font-bold mb-2">Tutorial Progress</h4>
                <p className="text-white text-base whitespace-pre-wrap">
                  {tutorialText}
                </p>
              </div>
              <button
                onClick={completeTutorial}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200 text-lg"
              >
                Skip Tutorial
              </button>
            </div>
          </div>
        );
      case 'GAME':
        return (
          <div className="absolute top-4 right-4 flex gap-2 p-4 bg-gray-800/90 rounded-lg shadow-lg border border-red-400/30">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors duration-200"
            >
              Reset Game
            </button>
            <button
              onClick={switchToDiscoverMode}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-colors duration-200"
            >
              Back to Discover
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Add resource regeneration effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Regenerate resources at a consistent rate of +2 per second
      updateResources('energy', 2);
      updateResources('bandwidth', 2);
      updateResources('processing', 2);
    }, 1000);

    return () => clearInterval(interval);
  }, [updateResources]); // Depend only on updateResources as regeneration is now constant

  // Effect to check win/loss conditions
  useEffect(() => {
    if (gameState.mode === 'PLAYING') {
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
      if (gameState.isWhiteHat && allWhiteHatPrimaryObjectivesComplete && targetStatus.systemIntegrity > 80) {
        updateGameState({ mode: 'WHITE_HAT_WIN' });
        addActionLog('SIMULATION COMPLETE: WHITE HAT VICTORY!');
      }
      // Black Hat Win Condition: All primary black hat objectives complete OR system integrity is zero
      else if (!gameState.isWhiteHat && (allBlackHatPrimaryObjectivesComplete || targetStatus.systemIntegrity <= 0)) {
         updateGameState({ mode: 'BLACK_HAT_WIN' });
         addActionLog('SIMULATION COMPLETE: BLACK HAT VICTORY!');
      }
      // White Hat Loss Condition: System integrity is zero OR Black Hat wins (checked above)
      else if (gameState.isWhiteHat && targetStatus.systemIntegrity <= 0) {
         updateGameState({ mode: 'GAME_OVER_LOSS' });
         addActionLog('SIMULATION FAILED: SYSTEM BREACHED!');
      }
      // Black Hat Loss Condition: White Hat wins (checked above)

    }
  }, [gameState.mode, gameState.isWhiteHat, objectiveManager, targetStatus.systemIntegrity]); // Depend on relevant state

  // Effect to update objectives based on System Integrity changes
  useEffect(() => {
    if (gameState.isGameStarted && gameState.mode === 'PLAYING') {
      const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'; // Determine current mode
      objectiveManager.updateObjectiveProgress('SYSTEM_INTEGRITY', targetStatus.systemIntegrity, undefined, mode); // Pass mode, undefined for nodeId
       // Note: The ObjectiveManager already handles checking for objective completion
    }
  }, [gameState.isGameStarted, gameState.mode, objectiveManager, targetStatus.systemIntegrity, gameState.isWhiteHat]); // Depend on relevant state and game mode

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

    if (gameState.isGameStarted && gameState.mode === 'PLAYING') {
      intervalId = setInterval(() => {
        const now = Date.now();
        const mode = gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT';

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
  }, [gameState.isGameStarted, gameState.mode, gameState.isWhiteHat, nodeStateTimers, objectiveManager]); // Depend on relevant state and managers

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

    const currentStep = TUTORIAL_STEPS.find(step => step.id === tutorialStep);

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

  }, [isTutorialActive, tutorialStep, TUTORIAL_STEPS, setNetworkNodes]); // Depend on state and setter

  // Effect to handle tutorial step progression based on actions
  useEffect(() => {
    if (!isTutorialActive || tutorialStep >= TUTORIAL_STEPS.length) return;

    const currentStepData = TUTORIAL_STEPS[tutorialStep - 1]; // tutorialStep is 1-indexed

    // Logic to advance tutorial based on actions
    // This will be triggered by user interactions like node clicks, action button clicks, etc.
    // For now, we will manually advance based on specific actions.
    // We will need to integrate this more deeply into the action handling logic.

  }, [isTutorialActive, tutorialStep, TUTORIAL_STEPS]);

  // Update the status indicator to use systemStatus instead of gameState.mode
  const statusIndicator = (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        systemStatus === 'SECURING' || systemStatus === 'ATTACKING' ? 'bg-yellow-400 animate-pulse' : 
        systemStatus === 'SECURED' || systemStatus === 'BREACHED' ? (gameState.isWhiteHat ? 'bg-green-400' : 'bg-purple-400') : 
        (gameState.isWhiteHat ? 'bg-blue-400 animate-pulse' : 'bg-green-400 animate-pulse')
      }`} />
      <span className="text-sm">{systemStatus}</span>
    </div>
  );

  // Update the action logs display to use addActionLog
  const ActionLogsDisplay = () => {
    const logs = gameState.actionLogs.map((log: string, index: number) => (
      <div key={index} className="text-sm opacity-80">
        {log}
      </div>
    ));

    return (
      <div className="space-y-1">
        {logs}
      </div>
    );
  };

  // Add reset button handler
  const handleReset = useCallback(() => {
    // Reset game state
    resetGameState();
    
    // Reset network nodes to initial state
    setNetworkNodes(prev => 
      prev.map(node => ({
        ...node,
        status: 'active' as NodeStatus,
        isInteractable: true,
        isSelected: false,
        feedbackStatus: undefined,
        feedbackEndTime: undefined,
        vulnerabilities: undefined,
        defenses: undefined,
        lastAction: undefined,
        lastActionTime: undefined,
        pulseEffect: 'none',
        statusChangeTime: undefined,
        highlighted: false,
        connections: undefined
      }))
    );

    // Reset objectives
    objectiveManager.initializeObjectives(gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT');

    // Reset scoring
    scoringManager.resetScore();

    // Reset threats
    threatManager.reset();

    // Add reset log
    addActionLog('Game state reset to initial conditions.');
  }, [resetGameState, setNetworkNodes, addActionLog, gameState.isWhiteHat, objectiveManager, scoringManager, threatManager]);

  // Update tutorial-related functions
  const handleTutorialStep = useCallback((step: TutorialStep) => {
    if (!isTutorialActive) return;

    let currentText = '';
    let currentIndex = 0;
    const text = step.text;
    setIsTyping(true);

    const typeText = () => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        setTutorialText(currentText);
        currentIndex++;
        setTimeout(typeText, step.typingSpeed);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          if (step.action === 'END_TUTORIAL') {
            completeTutorial();
          }
        }, step.lineDelay);
      }
    };

    typeText();
  }, [isTutorialActive, completeTutorial]);

  const startTutorial = useCallback(() => {
    if (TUTORIAL_STEPS.length > 0) {
      handleTutorialStep(TUTORIAL_STEPS[0]);
    }
  }, [handleTutorialStep]);

  const advanceTutorial = useCallback(() => {
    const nextStep = tutorialStep + 1;
    if (nextStep < TUTORIAL_STEPS.length) {
      setTutorialStep(nextStep);
      handleTutorialStep(TUTORIAL_STEPS[nextStep]);
    } else {
      completeTutorial();
    }
  }, [tutorialStep, handleTutorialStep, completeTutorial]);

  // Update the main render to conditionally include game UI
  return (
    <div className="relative w-full h-full">
      {/* Render mode-specific UI (Discover, Tutorial, Game panels) */}
      {renderModeSpecificUI()}

      {/* Render main game UI only when in GAME mode */}
      {currentMode === 'GAME' && (
        <>
          {/* Header */}
          <div className={`relative z-10 border-b backdrop-blur-sm ${currentTheme.border} ${currentTheme.headerBg}`}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {gameState.isWhiteHat ? <Shield className="w-8 h-8" /> : <Terminal className="w-8 h-8" />}
                <h1 className={`text-2xl font-bold tracking-wider ${currentTheme.text}`}>
                  {gameState.isWhiteHat ? 'CYBER_DEFENSE_SYSTEM_v3.2' : 'NEURAL_HACK_v2.7'}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Score Display */}
                <ScoreDisplay className="mr-4" />
                
                {/* Resource Display (if not already rendered elsewhere)*/}
                {renderResourceDisplay()}
                
                {/* Start Game Button - Remove this as we now use mode buttons */}
                {/* {!gameState.isGameStarted && (...) } */}

                <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
                  <span className={`text-sm ${!gameState.isWhiteHat ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                    BLACK HAT
                  </span>
                  <button
                    onClick={handleModeToggle}
                    disabled={gameState.isTransitioning}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      gameState.isWhiteHat ? 'bg-blue-600' : 'bg-green-600'
                    } ${gameState.isTransitioning ? 'animate-pulse' : ''}`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ${
                      gameState.isWhiteHat ? 'left-6' : 'left-0.5'
                    } ${gameState.isTransitioning ? 'animate-bounce' : ''}`} />
                  </button>
                  <span className={`text-sm ${gameState.isWhiteHat ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                    WHITE HAT
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  {statusIndicator}
                  <div className="text-sm">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transition Overlay (if still needed for mode toggle within GAME mode) */}
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
          
          {/* Main Content */}
          <div className="relative z-10 p-4 grid grid-cols-3 gap-4">
            {/* Tutorial Console - Remove or conditionally render if tutorial progress is shown differently in GAME mode */}
            {/* {gameState.isTutorialActive && (...) } */}
            
            {/* Left Panel */}
            <div className="col-span-1 space-y-4" ref={leftColRef}>
              {/* Add ObjectiveDisplay at the top of the left panel */}
              {gameState.isGameStarted && (
                <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
                  <ObjectiveDisplay mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'} />
                </div>
              )}
              
              {/* Add resource display */}
              {/* {renderResourceDisplay()} - Rendered in header now */}

              <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
                <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
                  <Code className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    {gameState.isWhiteHat ? 'SECURITY_LOG' : 'TERMINAL'}
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
                  {threats.map((threat: Threat) => (
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
                  mode={gameState.isWhiteHat ? 'WHITE_HAT' : 'BLACK_HAT'}
                  isTransitioning={gameState.isTransitioning}
                  targetingMode={{
                    isActive: gameState.actionState.mode === 'SELECTING_TARGET',
                    actionType: gameState.actionState.currentAction
                  }}
                  selectedNodeId={selectedNodeId}
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="col-span-1 space-y-4">
              {/* Combined System Status + Defense Actions Panel */}
              {gameState.isWhiteHat && (
                <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
                  <div className="flex items-center gap-2 mb-4 border-b pb-2 border-blue-400">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">DEFENSE_ACTIONS</span>
                  </div>
                  {/* Progress and Lockdown */}
                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between text-sm text-blue-300">
                      <span>Operation Progress</span>
                      <span>{Math.round(progress)}%</span>
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
              {!gameState.isWhiteHat && (
                <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
                  <div className="flex items-center gap-2 mb-4 border-b pb-2 border-green-400">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-bold text-green-400">ATTACK_ACTIONS</span>
                  </div>
                  {/* Progress and Hack */}
                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between text-sm text-green-300">
                      <span>Operation Progress</span>
                      <span>{Math.round(progress)}%</span>
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
                <ActionLogsDisplay />
              </div>

              {/* Target Status Panel */}
              <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
                <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
                  <Brain className="w-5 h-5" />
                  <span className="text-sm font-bold">{gameState.isWhiteHat ? 'DEFENSE_STATUS' : 'TARGET_STATUS'}</span>
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
          {/* Add reset button in the top-right corner - Rendered by renderModeSpecificUI in GAME case */}
          {/* <button>...</button> */}
        </>
      )}
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
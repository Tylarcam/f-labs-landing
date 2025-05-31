import { NetworkNode } from "../types/network.types";
import { TutorialStep } from "../types/game.types";

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

export const INITIAL_NETWORK_NODES: NetworkNode[] = [
  { 
    id: 1, x: 25, y: 20, z: 10, status: 'active', type: 'server', name: 'WEB-01', 
    layer: 'frontend', defense: 50, isInteractable: true,
    dependencies: [2, 4], dependents: [], criticalPath: false, isolationLevel: 30
  },
  { 
    id: 2, x: 45, y: 15, z: 15, status: 'active', type: 'firewall', name: 'FW-01', 
    layer: 'security', defense: 80, isInteractable: true,
    dependencies: [3], dependents: [1], criticalPath: true, isolationLevel: 80
  },
  { 
    id: 3, x: 65, y: 25, z: 20, status: 'active', type: 'database', name: 'DB-01', 
    layer: 'backend', defense: 70, isInteractable: true,
    dependencies: [], dependents: [2], criticalPath: true, isolationLevel: 60
  },
  { 
    id: 4, x: 30, y: 40, z: 5, status: 'active', type: 'endpoint', name: 'USER-PC', 
    layer: 'frontend', defense: 30, isInteractable: true,
    dependencies: [], dependents:[1], criticalPath: false, isolationLevel: 20
  },
    { 
    id: 5, x: 50, y: 50, z: 25, status: 'active', type: 'router', name: 'RTR-01', 
    layer: 'network', defense: 60, isInteractable: true,
    dependencies: [1, 2, 3, 4], dependents: [], criticalPath: true, isolationLevel: 50
  },
     { 
    id: 6, x: 70, y: 60, z: 10, status: 'active', type: 'server', name: 'APP-01', 
    layer: 'backend', defense: 65, isInteractable: true,
    dependencies: [3], dependents: [5], criticalPath: false, isolationLevel: 40
  }
];

export const GAME_CONSTANTS = {
  RESOURCE_REGEN_RATE: 2,
  BASE_SUCCESS_RATE: 0.8,
  NETWORK_EFFECT_DELAY: 1500,
  PULSE_EFFECT_DURATION: 2000
}; 
Cybersecurity Game - TypeScript Architecture Guide

This document outlines the architectural design and key components of the cybersecurity game project, built using React, TypeScript, and Tailwind CSS.

## Project Structure

The project follows a standard React application structure, with a clear separation of concerns:

```
cybersecurity-game/
├── src/
│   ├── components/
│   │   ├── CybersecurityGame.tsx
│   │   ├── GameHeader.tsx
│   │   ├── MissionStatus.tsx
│   │   ├── NetworkVisualization.tsx
│   │   ├── ActionPanel.tsx
│   │   ├── StatusPanel.tsx
│   │   ├── ResourceDisplay.tsx
│   │   ├── ActionLogsDisplay.tsx
│   │   ├── ObjectiveDisplay.tsx
│   │   ├── StrategicGuidance.tsx
│   │   ├── ThreatDetectionPanel.tsx
│   │   └── ... (other UI components)
│   ├── types/
│   │   ├── game.types.ts
│   │   ├── mission.types.ts
│   │   ├── network.types.ts
│   │   ├── threat.types.ts
│   │   └── ... (other type definitions)
│   ├── hooks/
│   │   ├── useGameLogic.ts
│   │   ├── useNetworkEffects.ts
│   │   ├── useNodeInteraction.ts
│   │   ├── useStrategicGuidance.ts
│   │   └── ... (other custom hooks)
│   ├── game/
│   │   ├── GameBalanceManager.ts
│   │   ├── ObjectiveManager.ts
│   │   ├── ScoringManager.ts
│   │   ├── ThreatManager.ts
│   │   └── ... (game logic managers)
│   ├── utils/
│   │   ├── gameActions.ts
│   │   ├── networkCalculations.ts
│   │   ├── constants.ts
│   │   └── ... (utility functions)
│   └── App.tsx
├── public/
├── .next/
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── next.config.ts
├── LICENSE
├── README.md
└── .gitignore
```

## Core Type Definitions (`src/types/`)

This directory contains TypeScript type definitions and interfaces used throughout the application, ensuring type safety and providing a clear data structure.

### `game.types.ts`

Defines core game-related types and the main `GameState` interface, which holds the overall state of the game.

```typescript
export type NodeStatus = 
  | 'active'
  | 'secure'
  | 'patching'
  | 'monitoring'
  | 'compromised'
  | 'breached'
  | 'scanning'
  | 'vulnerable'
  | 'quarantined'
  | 'backed_up'
  | 'detected'
  | 'overloaded'
  | 'degraded';

export type NodeType = 'server' | 'database' | 'firewall' | 'router' | 'endpoint';

export type GameMode = 'WHITE_HAT' | 'BLACK_HAT';
export type GamePlayMode = 'DISCOVER' | 'TUTORIAL' | 'GAME';

export type SystemStatus = 'IDLE' | 'SECURING' | 'ATTACKING' | 'SECURED' | 'BREACHED';

export type ParticleActivityLevel = 'normal' | 'intense';

export type GameState = {
  mode: 'IDLE' | 'PLAYING' | 'WHITE_HAT_WIN' | 'BLACK_HAT_WIN' | 'GAME_OVER_LOSS';
  playMode: GamePlayMode;
  isWhiteHat: boolean;
  isTransitioning: boolean;
  isGameStarted: boolean;
  isTutorialActive: boolean;
  tutorialStep: number;
  tutorialProgress: {
    currentStep: number;
    completedSteps: number[];
    currentObjective: string | null;
  };
  resources: {
    energy: number;
    bandwidth: number;
    processing: number;
  };
  cooldowns: Record<string, number>;
  actionState: {
    mode: 'IDLE' | 'SELECTING_TARGET' | 'EXECUTING';
    currentAction: string | null;
    targetNodeId: number | null;
    cooldownEndTime: number | null;
  };
  systemStatus: SystemStatus;
  targetStatus: {
    firewall: 'ACTIVE' | 'COMPROMISED';
    encryption: 'MAXIMUM' | 'DEGRADED';
    accessControl: 'ENFORCED' | 'BYPASSED';
    systemIntegrity: number;
  };
  selectedNodeId: number | null;
  nodeStateTimers: Record<number, { status: NodeStatus; startTime: number }>;
  actionLogs: string[];
  terminalLines: string[]; // Used for operation progress messages
  progress: number; // Used for operation progress percentage
  particleActivityLevel: ParticleActivityLevel;
  discoveryState: {
    exploredNodes: number[];
    discoveredActions: string[];
    tutorialCompleted: boolean;
  };
};

export interface ActionEffect {
  type: 'status' | 'vulnerability' | 'defense' | 'resource';
  value: number;
  duration?: number;
  target: 'node' | 'system' | 'global';
}

export interface GameAction {
  name: string;
  cost: number; // Simplified cost structure (can be expanded)
  cooldown: number;
  successRate: number; // Base success rate (can be modified)
  effects: ActionEffect[];
  requirements?: {
    resources?: Partial<GameState['resources']>;
    status?: NodeStatus[];
  };
}

export interface TutorialStep {
  id: number;
  text: string;
  action: 'SELECT_NODE' | 'SELECT_ACTION' | 'PERFORM_ACTION' | 'END_TUTORIAL';
  targetNodeId?: number;
  targetAction?: string;
  requiredStatus?: NodeStatus;
  typingSpeed: number;
  lineDelay: number;
}
```

### `network.types.ts`

Defines types related to the network topology and nodes.

```typescript
import { NodeStatus, NodeType } from './game.types';

export interface NetworkNode {
  id: number;
  x: number;
  y: number;
  z: number;
  status: NodeStatus;
  type: NodeType;
  name: string;
  layer: 'frontend' | 'security' | 'network' | 'backend';
  defense: number;  // 0-100 defense strength
  isInteractable: boolean;  // Whether the node can be interacted with
  isHovered?: boolean;
  isDragging?: boolean;
  vulnerabilities?: number;
  defenses?: number;
  lastAction?: string;
  lastActionTime?: number;
  pulseEffect?: 'none' | 'warning' | 'alert' | 'success';  // Visual feedback
  statusChangeTime?: number;  // When the status last changed
  feedbackStatus?: 'success' | 'failure' | null; // Feedback status for actions
  feedbackEndTime?: number; // Timestamp when feedback should end
  highlighted?: boolean; // To indicate if the node should be highlighted
  connections?: number[]; // Array of connected node IDs
  isSelected?: boolean; // To indicate if the node is currently selected
  dependencies: number[]; // Node IDs this node depends on
  dependents: number[]; // Node IDs that depend on this node
  criticalPath: boolean; // Whether this node is on the critical path
  isolationLevel: number; // Level of network isolation (0-100)
}
```

### `mission.types.ts`

Defines types related to missions, objectives, and strategic guidance.

```typescript
import { GameMode } from './game.types';

export type MissionType = 'DEFEND_CRITICAL' | 'SECURE_NETWORK' | 'BREACH_TARGET' | 'STEALTH_INFILTRATION' | 'TIME_ATTACK';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'SECURE_NODES' | 'COMPROMISE_NODES' | 'PROTECT_CRITICAL' | 'TIME_SURVIVAL' | 'EFFICIENCY' | 'SYSTEM_INTEGRITY' | 'NODE_MONITORED_DURATION' | 'NODE_ACCESS_MAINTAINED_DURATION';
  target: number;
  current: number;
  completed: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: 'primary' | 'secondary' | 'bonus';
  nodeId?: number;
}

export interface StrategicHint {
  id: string;
  priority: number;
  nodeIds: number[];
  action: string;
  reason: string;
  timeWindow: { min: number; max: number };
  gameMode: GameMode;
}

export interface WinningSequence {
  gameMode: GameMode;
  missionType: MissionType;
  steps: SequenceStep[];
  description: string;
  estimatedTime: number;
}

export interface SequenceStep {
  step: number;
  nodeId: number;
  action: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}
```

### `threat.types.ts`

Defines types related to in-game threats.

```typescript
export interface Threat {
  id: string;
  type: string; // e.g., 'Malware', 'Phishing Attempt', 'Vulnerability Scan'
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string; // Time the threat was detected or occurred
  source: string; // e.g., 'External', 'Internal Network', 'Email'
  targetNodeId?: number; // Optional: Node ID affected by the threat
  status: 'ACTIVE' | 'MITIGATED' | 'RESOLVED';
}
```

## Custom Hooks (`src/hooks/`)

Custom React hooks encapsulate game logic and state management, making components cleaner and logic reusable.

### `useGameLogic.ts`

Manages the core game state, including game mode, resources, action state, system status, and progress. It also handles resource regeneration, mission timer effects, and win/loss conditions. Provides access to manager instances (ObjectiveManager, ScoringManager, ThreatManager).

### `useNetworkEffects.ts`

Hooks for managing network-wide effects resulting from actions or threats. (Note: This hook might need further integration with the current action/threat system).

### `useNodeInteraction.ts`

Handles user interactions with network nodes, such as selection and initiating actions. This hook utilizes `useGameLogic` and game manager instances.

### `useStrategicGuidance.ts`

Provides strategic hints and tracks progress through potential winning sequences. This hook utilizes `useGameLogic` and potentially manager instances.

## Utility Functions (`src/utils/`)

Contains pure functions for game calculations, data manipulation, and constants.

### `constants.ts`

Stores game constants, initial network configuration (`INITIAL_NETWORK_NODES`), and tutorial steps (`TUTORIAL_STEPS`).

### `gameActions.ts`

Provides definitions and logic for executing game actions. (Note: Action execution logic is currently primarily within `useNodeInteraction` and `GameBalanceManager`).

### `networkCalculations.ts`

Includes functions for calculating network risk and other network-related metrics.

## Game Logic Managers (`src/game/`)

These classes manage specific aspects of the game logic, often acting as singletons. Instances are typically accessed via the `useGameLogic` hook.

### `GameBalanceManager.ts`

Manages game balance, including action costs, cooldowns, and success probabilities.

### `ObjectiveManager.ts`

Manages game objectives, tracking progress and completion.

### `ScoringManager.ts`

Manages the game score.

### `ThreatManager.ts`

Manages the generation and status of in-game threats.

## Component Architecture (`src/components/`)

The UI is composed of modular React components. The main `CybersecurityGame.tsx` component orchestrates these components based on the current game mode.

### `CybersecurityGame.tsx`

The main container component. It uses various hooks to access game state and logic and renders different UI layouts based on the `playMode` (`DISCOVER`, `TUTORIAL`, `GAME`). It also handles mode transitions and the win/loss/game over screens.

-   **`DISCOVER` Mode:** Simple layout with network visualization and introductory text.
-   **`TUTORIAL` Mode:** Split layout with network visualization and a tutorial progress/guidance panel.
-   **`GAME` Mode:** Utilizes a 12-column grid for a comprehensive dashboard layout:
    -   **Left Panel (`col-span-3`):** Contains `ObjectiveDisplay`, `ActionLogsDisplay`, `ThreatDetectionPanel`, `MissionStatus`, and `StrategicGuidance` stacked vertically.
    -   **Center Panel (`col-span-6`):** Displays the interactive 3D `NetworkVisualization`.
    -   **Right Panel (`col-span-3`):** Contains `ResourceDisplay`, `ActionPanel`, and `StatusPanel` stacked vertically.

### `GameHeader.tsx`

Displays the game title, mode toggle switch, and system status indicator. Intended for use in `TUTORIAL` and `GAME` modes.

### `NetworkVisualization.tsx`

Renders the interactive 3D network topology, displaying nodes and connections with visual feedback based on their status and interaction states.

### `ActionPanel.tsx`

Displays available actions (Attack or Defense) based on the current game mode. Allows the player to select an action, initiating the 'SELECTING_TARGET' state in the game logic.

### `StatusPanel.tsx`

Shows the current system status indicators (Firewall, Encryption, Access Control, System Integrity) providing a high-level overview of the network's defense posture.

### `ResourceDisplay.tsx`

Displays the player's current resources (Energy, Bandwidth, Processing), which are consumed by performing actions.

### `ActionLogsDisplay.tsx`

Shows a chronological log of recent actions performed by the player and significant game events, including terminal-style operation messages.

### `ObjectiveDisplay.tsx`

Lists the current mission objectives, their progress, and completion status.

### `StrategicGuidance.tsx`

Provides strategic hints or guidance to the player, potentially suggesting actions or targets based on the game state and mission objectives.

### `ThreatDetectionPanel.tsx`

Displays detected threats, including their type, severity, source, and status, keeping the player informed of active risks.

## Package Dependencies

Key dependencies include:

-   **react, react-dom:** Core React libraries.
-   **typescript:** For type safety.
-   **tailwindcss, postcss, autoprefixer:** For styling.
-   **lucide-react:** For icons.

(See `package.json` for full list and versions)

## Key Architecture Patterns

-   **Separation of Concerns:** Logic (hooks, utils, game/), types (types/), and UI (components/) are distinctly separated.
-   **Custom Hooks Pattern:** Game logic and state management are encapsulated in custom hooks (`useGameLogic`, `useNodeInteraction`, `useStrategicGuidance`, `useNetworkEffects`).
-   **Manager Classes:** Centralized logic for specific game systems (Balance, Objectives, Threats, Scoring) accessed via the `useGameLogic` hook.
-   **Immutable State Updates:** State changes are handled immutably using functional updates and spread operators to ensure predictable state management.
-   **Modular Component Design:** The UI is broken down into small, reusable components, each responsible for a specific part of the interface.
-   **Event-Driven Interactions:** User interactions and game events trigger state updates and logic execution through hook functions and manager methods.

This architecture provides a scalable, maintainable foundation for expanding the cybersecurity game with additional features, missions, and complexity levels.
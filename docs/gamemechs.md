# Cybersecurity Simulation Game - Comprehensive Development Prompt

## Game Concept & Vision

Create an interactive cybersecurity simulation game that serves as both an educational tool and engaging gameplay experience. The game features dual perspectives (White Hat defender vs Black Hat attacker) with a comprehensive tutorial system, real-time resource management, and dynamic network visualization.

**Core Philosophy**: Build a seamless, interconnected system where every user action triggers cascading updates across multiple game systems, creating an immersive cybersecurity training environment.

## Essential Game Architecture

### Multi-State Management System
Implement a hierarchical state structure with these interdependent layers:

```
Primary States (Game Control):
- gameMode: Toggle between 'WHITE_HAT' (defense) and 'BLACK_HAT' (attack)
- gameState: 'IDLE' → 'PLAYING' → 'WIN/LOSE' progression
- isTransitioning: Smooth visual transitions between modes

Interactive States (Player Actions):
- selectedNodeId: Currently targeted network node
- selectedAction: Chosen action from context menu
- Resources: {energy, bandwidth, processing} with regeneration

Tutorial States (Guided Learning):
- isTutorialActive: Step-by-step guidance system
- currentTutorialStep: Progressive disclosure mechanism
- tutorialText: Typewriter effect for instructions

Network States (Game World):
- networkNodes: Array of interactive network components
- actionLogs: Chronological history with timestamps
- score: Performance tracking with multipliers
```

### Dynamic Node System
Design network nodes as interactive entities with:
- **Multi-dimensional positioning** (x, y, z coordinates for 3D feel)
- **Status progression chains**: Active → Vulnerable → Compromised (attack path) or Active → Secure → Monitored (defense path)
- **Role-based interactions**: Different actions available per game mode
- **Visual feedback systems**: Color coding, pulse effects, selection rings
- **Contextual information**: Type, defense rating, layer classification

## Interconnected Systems Design

### Resource Economy
Create a balanced economy with:
- **Automatic regeneration**: +2 points per second across all resources
- **Action costs**: Variable based on complexity and power
- **Strategic decision-making**: Force players to prioritize actions
- **Visual feedback**: Real-time progress bars with color coding

### Tutorial Integration
Build an adaptive tutorial that:
- **Highlights specific elements**: Yellow rings around tutorial targets
- **Validates user actions**: Check correct node/action selection
- **Progresses automatically**: Advance steps based on completion
- **Types instructions**: Character-by-character text reveal
- **Integrates seamlessly**: No separate tutorial mode, embedded in gameplay

### Feedback Loop Architecture
Implement multi-layered feedback:

```
Immediate Feedback:
- Visual: Node color changes, pulse effects, UI highlights
- Textual: Action logs with timestamps
- Audio cues: Success/failure indicators

Progressive Feedback:
- Score accumulation with multipliers
- Resource depletion and regeneration
- Network status evolution
- Tutorial advancement

Meta Feedback:
- Mode switching with transition effects
- Game state progression
- Performance analytics
```

## Core Interaction Patterns

### Selection → Action → Execution Flow
```
1. Node Selection:
   - Click triggers selection state
   - UI updates: highlight node, show details panel
   - Tutorial validation if active
   - Log entry creation

2. Action Selection:
   - Context-sensitive action list based on game mode
   - Resource cost validation
   - Button highlighting and execute button reveal
   - Tutorial step advancement

3. Action Execution:
   - Resource deduction with validation
   - Probability-based success calculation
   - Node status transformation
   - Visual effects (pulse, color change)
   - Score modification
   - Log entry with results
   - UI state reset
```

### Mode Switching Mechanism
Create smooth transitions with:
- **Visual transition state** during mode changes
- **UI theme adaptation** (colors, terminology, available actions)
- **State preservation** where appropriate
- **Context switching** for different gameplay paradigms

## Technical Implementation Guidelines

### State Management Patterns
Use React hooks for:
- **useState**: All game state variables
- **useEffect**: Resource regeneration, tutorial typing, cleanup
- **useCallback**: Performance optimization for handlers
- **Custom hooks**: Reusable game logic (if expanding)

### Component Architecture
Structure as single component with clear sections:
- **State declarations** at top
- **Effect hooks** for automated systems
- **Event handlers** for user interactions
- **Helper functions** for calculations
- **Render logic** with conditional elements

### Data Flow Principles
Ensure unidirectional data flow:
- **Actions modify state** through setter functions
- **State changes trigger** re-renders and effects
- **Effects handle** side effects and cleanup
- **No direct DOM manipulation** - let React handle updates

## Visual Design System

### Theme Management
Implement dual themes:
```
White Hat (Defense): Blue-themed, clean interface
- Primary: Blue (#3b82f6)
- Background: Dark gray (#1f2937)
- Accent: Cyan for success states

Black Hat (Attack): Green-themed, matrix-style
- Primary: Green (#22c55e)  
- Background: Pure black (#000000)
- Accent: Red for warning states
```

### Animation Guidelines
Create smooth interactions with:
- **Transition durations**: 300ms for state changes, 1000ms for mode switches
- **Pulse effects**: 2-second duration for feedback
- **Typing animation**: 30ms per character for tutorial text
- **Loading states**: Prevent interaction during transitions

### Layout Responsiveness
Design flexible grid system:
- **Left panel**: Controls and resources (4/12 columns)
- **Center panel**: Network visualization (4/12 columns)
- **Right panel**: Information and logs (4/12 columns)
- **Responsive breakpoints**: Adapt for different screen sizes

## Game Balance & Progression

### Difficulty Scaling
Balance challenge through:
- **Resource costs**: Higher for powerful actions
- **Success rates**: Based on node defense vs action power
- **Tutorial pacing**: Gradual complexity introduction
- **Score multipliers**: Reward efficient play

### Replayability Features
Encourage multiple sessions:
- **Mode switching**: Completely different gameplay experience
- **Randomized success**: No guaranteed outcomes
- **Score tracking**: Performance comparison
- **Network variety**: Different node configurations

## Extension Points & Scalability

### Modular Design for Growth
Structure for easy expansion:
- **Action system**: Add new actions through configuration arrays
- **Node types**: Extend through type definitions
- **Game modes**: Additional perspectives beyond White/Black Hat
- **Tutorial system**: Additional lesson modules
- **Scoring system**: Complex achievement tracking

### Advanced Features to Consider
- **Multiplayer modes**: Real-time competition
- **Campaign progression**: Linked scenarios
- **Custom networks**: User-created topologies
- **Advanced AI**: Intelligent opponent behaviors
- **Real-world scenarios**: Based on actual security incidents

## Development Implementation Steps

### Phase 1: Core Foundation
1. Set up state management structure
2. Create basic UI layout with panels
3. Implement node selection system
4. Build action execution framework

### Phase 2: Game Mechanics
1. Add resource management system
2. Implement action cost/success calculations
3. Create visual feedback systems
4. Build logging and history tracking

### Phase 3: Tutorial Integration
1. Design tutorial step system
2. Implement typing animation effects
3. Add validation and progression logic
4. Integrate highlighting and guidance

### Phase 4: Polish & Enhancement
1. Add mode switching with transitions
2. Implement scoring and progression
3. Create comprehensive visual themes
4. Add accessibility and responsive design

## Success Metrics & Validation

### Technical Validation
- **No console errors** during gameplay
- **Smooth animations** at 60fps
- **Responsive interactions** under 100ms
- **Memory stability** during extended play

### User Experience Validation
- **Tutorial completion rate** above 90%
- **Mode switching usage** shows engagement
- **Session length** indicates compelling gameplay
- **Return usage** demonstrates replayability

This prompt provides a comprehensive blueprint for recreating and enhancing the cybersecurity simulation game, emphasizing the interconnected nature of all systems and the importance of seamless user experience.
import { GameMode, Objective, ObjectiveStatus } from '../types/game';
import { ObjectiveType } from '../types/mission.types';
import { GameState, NodeStatus } from '../types/game.types';
import { NetworkNode } from '../types/network.types';

// Define objective configurations
const OBJECTIVE_CONFIGS: Record<string, Objective[]> = {
  WHITE_HAT: [
    {
      id: 'secure_network',
      title: 'Secure the Network',
      description: 'Ensure all critical nodes are secured.',
      type: 'SECURE_NODES',
      target: 6, // Example: Secure all 6 initial nodes
      current: 0,
      completed: false,
      status: 'IN_PROGRESS',
      priority: 'primary',
    },
    {
      id: 'maintain_defense',
      title: 'Maintain Defense',
      description: 'Keep System Integrity above 80% for 2 minutes.',
      type: 'TIME_SURVIVAL', // Or a custom type for time-based integrity
      target: 120, // 120 seconds
      current: 0, // Time elapsed above threshold
      completed: false,
      status: 'IN_PROGRESS',
      priority: 'primary',
    },
     {
       id: 'patch_vulnerabilities',
       title: 'Patch Vulnerabilities',
       description: 'Successfully patch 3 vulnerable nodes.',
       type: 'SECURE_NODES', // Using SECURE_NODES to track nodes changing to 'secure' status
       target: 3,
       current: 0, // Number of nodes patched from 'vulnerable'
       completed: false,
       status: 'IN_PROGRESS',
       priority: 'secondary',
       relevantStatuses: ['vulnerable', 'secure'], // Track nodes transitioning between these statuses
     }
    // Add more White Hat objectives
  ],
  BLACK_HAT: [
    {
      id: 'breach_network',
      title: 'Breach the Network',
      description: 'Compromise the critical path nodes.',
      type: 'COMPROMISE_NODES',
      target: 3, // Example: Compromise FW-01, DB-01, RTR-01
      current: 0,
      completed: false,
      status: 'IN_PROGRESS',
      priority: 'primary',
       relevantNodeIds: [2, 3, 5], // FW-01, DB-01, RTR-01
    },
    {
      id: 'maintain_access',
      title: 'Maintain Access',
      description: 'Keep at least one critical path node compromised for 1 minute.',
      type: 'NODE_ACCESS_MAINTAINED_DURATION', // Custom type for duration of compromised critical nodes
      target: 60, // 60 seconds
      current: 0, // Time elapsed with critical node compromised
      completed: false,
      status: 'IN_PROGRESS',
      priority: 'primary',
       relevantNodeIds: [2, 3, 5], // FW-01, DB-01, RTR-01
    },
     {
       id: 'escalate_privileges',
       title: 'Escalate Privileges',
       description: 'Successfully use the Backdoor action on a compromised node.',
       type: 'PERFORM_ACTION', // Custom type for performing a specific action
       target: 1,
       current: 0, // Number of times the action was performed
       completed: false,
       status: 'IN_PROGRESS',
       priority: 'secondary',
       relevantAction: 'BACKDOOR',
     }
    // Add more Black Hat objectives
  ],
};

export class ObjectiveManager {
  private static instance: ObjectiveManager;
  private objectives: Map<string, Objective> = new Map();
  private currentObjectives: Objective[] = [];
  private gameMode: GameMode = 'WHITE_HAT'; // Track the current game mode

  private constructor() {}

  public static getInstance(): ObjectiveManager {
    if (!ObjectiveManager.instance) {
      ObjectiveManager.instance = new ObjectiveManager();
    }
    return ObjectiveManager.instance;
  }

  public initializeObjectives(mode: GameMode): void {
    this.gameMode = mode;
    this.objectives.clear();
    this.currentObjectives = [];

    const baseObjectives = this.getBaseObjectives(mode);
    baseObjectives.forEach(objective => {
      this.objectives.set(objective.id, objective);
      this.currentObjectives.push(objective);
    });
  }

  private getBaseObjectives(mode: GameMode): Objective[] {
    if (mode === 'WHITE_HAT') {
      return [
        {
          id: 'secure_network',
          title: 'Secure Network Infrastructure',
          description: 'Protect all critical network nodes from compromise',
          requirements: [
            { type: 'NODES_SECURE', target: 5, current: 0 },
            { type: 'SYSTEM_INTEGRITY', target: 80, current: 0 }
          ],
          reward: 1000,
          timeLimit: 300, // 5 minutes
          status: 'IN_PROGRESS'
        },
        {
          id: 'maintain_defense',
          title: 'Maintain Defense Systems',
          description: 'Keep defense systems active and monitor for threats',
          requirements: [
            { type: 'DEFENSE_ACTIVE', target: 180, current: 0 }, // 3 minutes
            { type: 'THREATS_BLOCKED', target: 10, current: 0 }
          ],
          reward: 800,
          timeLimit: 300,
          status: 'IN_PROGRESS'
        },
        {
          id: 'upgrade_security',
          title: 'Upgrade Security Protocols',
          description: 'Implement advanced security measures across the network',
          requirements: [
            { type: 'SECURITY_UPGRADES', target: 3, current: 0 },
            { type: 'ENCRYPTION_LEVEL', target: 100, current: 0 }
          ],
          reward: 1200,
          timeLimit: 300,
          status: 'IN_PROGRESS'
        }
      ];
    } else {
      return [
        {
          id: 'breach_network',
          title: 'Breach Network Security',
          description: 'Compromise critical network nodes',
          requirements: [
            { type: 'NODES_COMPROMISED', target: 5, current: 0 },
            { type: 'SYSTEM_INTEGRITY', target: 20, current: 100 },
            { type: 'SERVICES_DISRUPTED', target: 3, current: 0 }
          ],
          reward: 1000,
          timeLimit: 300,
          status: 'IN_PROGRESS'
        },
        {
          id: 'maintain_access',
          title: 'Maintain Network Access',
          description: 'Keep compromised nodes under control',
          requirements: [
            { type: 'ACCESS_MAINTAINED', target: 180, current: 0 },
            { type: 'DEFENSE_BYPASSED', target: 10, current: 0 }
          ],
          reward: 800,
          timeLimit: 300,
          status: 'IN_PROGRESS'
        },
        {
          id: 'escalate_privileges',
          title: 'Escalate Privileges',
          description: 'Gain higher level access to critical systems',
          requirements: [
            { type: 'PRIVILEGE_ESCALATION', target: 3, current: 0 },
            { type: 'ACCESS_LEVEL', target: 100, current: 0 }
          ],
          reward: 1200,
          timeLimit: 300,
          status: 'IN_PROGRESS'
        }
      ];
    }
  }

  public updateObjectiveProgress(
    type: string,
    value: number,
    nodeId?: number,
    mode?: GameMode
  ): void {
    this.currentObjectives.forEach(objective => {
      objective.requirements.forEach(req => {
        if (req.type === type && (req.targetNodeId === undefined || req.targetNodeId === nodeId)) {
          switch (req.type) {
            case 'SYSTEM_INTEGRITY':
            case 'ENCRYPTION_LEVEL':
            case 'ACCESS_LEVEL':
               req.current = value;
               break;
            case 'NODE_SECURED':
               if (value === 1) {
                 req.current = req.target;
               }
               break;
            case 'NODE_COMPROMISED':
                if (value === 1) {
                    req.current = req.target;
                 }
                 break;
             case 'THREATS_BLOCKED':
             case 'NODES_SECURE':
             case 'NODES_COMPROMISED':
             case 'NODE_DEFENSE_UPGRADED':
             case 'NODE_PRIVILEGES_ESCALATED':
                req.current += value;
                break;
            case 'NODE_MONITORED_DURATION':
            case 'NODE_ACCESS_MAINTAINED_DURATION':
                // 'value' from GameDemoDisplay is the total elapsed time since the state started
                const now = value; // Use total elapsed time as the effective 'now' for this calculation
                const lastUpdate = req.lastUpdateTime || 0; // Use 0 if no last update time is recorded
                const increment = now - lastUpdate;

                if (increment > 0) {
                   req.current += increment; // Add the time elapsed since the last update
                   req.lastUpdateTime = now; // Update the last update time
                }
                break;
            case 'SERVICES_DISRUPTED':
                req.current += value;
                break;
            default:
                // Default increment for any other types not explicitly handled
                req.current += value;
          }
        }
      });

      const isComplete = objective.requirements.every(req => req.current >= req.target);
      if (isComplete && objective.status === 'IN_PROGRESS') {
        objective.status = 'COMPLETED';
        if (mode) {
          this.onObjectiveComplete(objective, mode);
        }
      }
    });
  }

  private onObjectiveComplete(objective: Objective, mode: GameMode): void {
    const timeBonus = Math.max(0, objective.timeLimit - (Date.now() - objective.startTime));
    const bonusMultiplier = 1 + (timeBonus / objective.timeLimit);
    const finalReward = Math.round(objective.reward * bonusMultiplier);

    const { ScoringManager } = require('./ScoringManager');
    ScoringManager.getInstance().addPoints(finalReward, 'OBJECTIVE_COMPLETE');

    if (this.currentObjectives.length < 3) {
      const newObjective = this.generateNewObjective(mode);
      if (newObjective) {
        this.currentObjectives.push(newObjective);
        this.objectives.set(newObjective.id, newObjective);
      }
    }
  }

  private generateNewObjective(mode: GameMode): Objective | null {
    const availableTypes = mode === 'WHITE_HAT' 
      ? ['SECURE_NODE', 'UPGRADE_DEFENSE', 'MONITOR_THREATS']
      : ['COMPROMISE_NODE', 'MAINTAIN_ACCESS', 'ESCALATE_PRIVILEGES'];

    // For now, let's focus on node-specific versions of a few types
    const potentialNodeTargetTypes = mode === 'WHITE_HAT' 
      ? ['SECURE_NODE', 'UPGRADE_DEFENSE', 'MONITOR_THREATS']
      : ['COMPROMISE_NODE', 'MAINTAIN_ACCESS', 'ESCALATE_PRIVILEGES']; // All can potentially be node-specific

    const randomType = potentialNodeTargetTypes[Math.floor(Math.random() * potentialNodeTargetTypes.length)];
    const randomNodeId = Math.floor(Math.random() * 6) + 1; // Assuming node IDs are 1-6

    switch (randomType) {
      case 'SECURE_NODE':
        return {
          id: `secure_node_${randomNodeId}_${Date.now()}`,
          title: `Secure Node ${randomNodeId}`,
          description: `Protect network node ${randomNodeId}`,
          requirements: [
            { type: 'NODE_SECURED', target: 1, current: 0, targetNodeId: randomNodeId }
          ],
          reward: 500,
          timeLimit: 180,
          status: 'IN_PROGRESS',
          startTime: Date.now()
        };
      case 'UPGRADE_DEFENSE':
         return {
           id: `upgrade_defense_node_${randomNodeId}_${Date.now()}`,
           title: `Upgrade Defense on Node ${randomNodeId}`,
           description: `Enhance defense systems on network node ${randomNodeId}`,
           requirements: [
             { type: 'NODE_DEFENSE_UPGRADED', target: 1, current: 0, targetNodeId: randomNodeId }
           ],
           reward: 600,
           timeLimit: 180,
           status: 'IN_PROGRESS',
           startTime: Date.now()
         };
      case 'MONITOR_THREATS':
         return {
           id: `monitor_threats_node_${randomNodeId}_${Date.now()}`,
           title: `Monitor Node ${randomNodeId} for Threats`,
           description: `Keep network node ${randomNodeId} under surveillance for a duration`,
           requirements: [
             // Requirement type needs to track duration or number of threats detected
             { type: 'NODE_MONITORED_DURATION', target: 60, current: 0, targetNodeId: randomNodeId } // Example: Monitor for 60 seconds
           ],
           reward: 550,
           timeLimit: 180,
           status: 'IN_PROGRESS',
           startTime: Date.now()
         };
      case 'COMPROMISE_NODE':
         return {
           id: `compromise_node_${randomNodeId}_${Date.now()}`,
           title: `Compromise Node ${randomNodeId}`,
           description: `Gain access to network node ${randomNodeId}`,
           requirements: [
             { type: 'NODE_COMPROMISED', target: 1, current: 0, targetNodeId: randomNodeId }
           ],
           reward: 500,
           timeLimit: 180,
           status: 'IN_PROGRESS',
           startTime: Date.now()
         };
      case 'MAINTAIN_ACCESS':
         return {
           id: `maintain_access_node_${randomNodeId}_${Date.now()}`,
           title: `Maintain Access to Node ${randomNodeId}`,
           description: `Keep network node ${randomNodeId} compromised for a duration`,
           requirements: [
              // Requirement type needs to track duration
             { type: 'NODE_ACCESS_MAINTAINED_DURATION', target: 60, current: 0, targetNodeId: randomNodeId } // Example: Maintain access for 60 seconds
           ],
           reward: 550,
           timeLimit: 180,
           status: 'IN_PROGRESS',
           startTime: Date.now()
         };
      case 'ESCALATE_PRIVILEGES':
         return {
           id: `escalate_privileges_node_${randomNodeId}_${Date.now()}`,
           title: `Escalate Privileges on Node ${randomNodeId}`,
           description: `Gain higher access level on network node ${randomNodeId}`,
           requirements: [
             { type: 'NODE_PRIVILEGES_ESCALATED', target: 1, current: 0, targetNodeId: randomNodeId }
           ],
           reward: 600,
           timeLimit: 180,
           status: 'IN_PROGRESS',
           startTime: Date.now()
         };
      default:
        return null;
    }
  }

  public getCurrentObjectives(): Objective[] {
    return this.currentObjectives;
  }

  public getObjectiveById(id: string): Objective | undefined {
    return this.objectives.get(id);
  }

  public resetObjectives(): void {
    this.objectives.clear();
    this.currentObjectives = [];
  }

  // Method to check if all primary objectives are completed
  public areAllPrimaryObjectivesCompleted(): boolean {
    return this.currentObjectives
      .filter(objective => objective.priority === 'primary')
      .every(objective => objective.status === 'COMPLETED');
  }
} 
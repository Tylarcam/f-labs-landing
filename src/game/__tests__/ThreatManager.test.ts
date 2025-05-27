import { ThreatManager } from '../ThreatManager';
import { NetworkNode, NodeStatus, GameMode } from '../../types';

describe('ThreatManager', () => {
  let threatManager: ThreatManager;
  let mockNode: NetworkNode;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    // Reset the singleton instance
    (ThreatManager as any).instance = undefined;
    threatManager = ThreatManager.getInstance();
    
    // Create a mock node
    mockNode = {
      id: 1,
      name: 'Test Node',
      type: 'SERVER',
      status: 'active',
      x: 50,
      y: 50,
      isHovered: false,
      isDragging: false
    };

    // Create a mock callback
    mockCallback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    threatManager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple getInstance calls', () => {
      const instance1 = ThreatManager.getInstance();
      const instance2 = ThreatManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Threat Generation', () => {
    it('should generate a threat when node status changes', () => {
      const threat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      expect(threat).toBeDefined();
      expect(threat?.type).toContain('Security breach');
      expect(threat?.severity).toBe('HIGH');
      expect(threat?.status).toBe('DETECTED');
    });

    it('should not generate a threat when status remains the same', () => {
      const threat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'active',
        'WHITE_HAT'
      );

      expect(threat).toBeNull();
    });

    it('should generate appropriate threats for different game modes', () => {
      const whiteHatThreat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      const blackHatThreat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'BLACK_HAT'
      );

      expect(whiteHatThreat?.type).toContain('Security breach');
      expect(blackHatThreat?.type).toContain('Successfully compromised');
    });
  });

  describe('Threat Subscription', () => {
    it('should notify subscribers when threats are generated', () => {
      const unsubscribe = threatManager.subscribeToThreats(mockCallback);
      
      threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveLength(1);
      
      unsubscribe();
    });

    it('should allow unsubscribing from threat updates', () => {
      const unsubscribe = threatManager.subscribeToThreats(mockCallback);
      unsubscribe();
      
      threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Threat Cleanup', () => {
    it('should clean up old threats', () => {
      // Mock Date.now() to control time
      const originalDateNow = Date.now;
      const mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);

      // Generate a threat
      threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      // Move time forward 31 seconds
      Date.now = jest.fn(() => mockTime + 31000);

      // Trigger cleanup
      threatManager.cleanupThreats();

      // Subscribe to verify threats are cleaned up
      const unsubscribe = threatManager.subscribeToThreats(mockCallback);
      expect(mockCallback.mock.calls[0][0]).toHaveLength(0);

      // Restore Date.now
      Date.now = originalDateNow;
      unsubscribe();
    });
  });

  describe('Threat Severity', () => {
    it('should assign correct severity levels based on node status', () => {
      const highSeverityThreat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'breached',
        'WHITE_HAT'
      );

      const mediumSeverityThreat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'vulnerable',
        'WHITE_HAT'
      );

      const lowSeverityThreat = threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'scanning',
        'WHITE_HAT'
      );

      expect(highSeverityThreat?.severity).toBe('HIGH');
      expect(mediumSeverityThreat?.severity).toBe('MEDIUM');
      expect(lowSeverityThreat?.severity).toBe('LOW');
    });
  });

  describe('Reset Functionality', () => {
    it('should clear all threats when reset is called', () => {
      // Generate some threats
      threatManager.generateThreatFromNodeStatus(
        mockNode,
        'active',
        'compromised',
        'WHITE_HAT'
      );

      // Subscribe to verify threats exist
      const unsubscribe = threatManager.subscribeToThreats(mockCallback);
      expect(mockCallback.mock.calls[0][0]).toHaveLength(1);

      // Reset threats
      threatManager.reset();

      // Verify threats are cleared
      expect(mockCallback.mock.calls[1][0]).toHaveLength(0);
      unsubscribe();
    });
  });
}); 
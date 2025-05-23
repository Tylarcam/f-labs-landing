'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Terminal, Code, Activity, Eye, Zap, Target, CheckCircle, Wifi, Server, Database, Router, Monitor, Brain } from 'lucide-react';
import { useNetworkNodes } from '../../hooks/useNetworkNodes';
import { useThreats } from '../../hooks/useThreats';
import { transform3DNode, getLayerColor } from '../../utils/3d';
import { NetworkNode, Threat, SystemStatus, ParticleActivityLevel } from '../../types';

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

  const { networkNodes, setNetworkNodes } = useNetworkNodes(isWhiteHat, isTransitioning);
  const threats = useThreats(isWhiteHat);

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

  // Action handlers
  const handleDefenseAction = async (action: string) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Initiating ${action}...`, ...prev]);
    await new Promise(res => setTimeout(res, 1200));
    setNetworkNodes(prev => prev.map(node =>
      Math.random() > 0.5 ? { ...node, status: 'secure' } : node
    ));
    setTargetStatus(prev => ({
      ...prev,
      firewall: 'ACTIVE',
      encryption: 'MAXIMUM',
      accessControl: 'ENFORCED',
      systemIntegrity: Math.min(100, prev.systemIntegrity + 10)
    }));
    setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] ${action} completed.`, ...prev]);
    setIsActionInProgress(false);
  };

  const handleAttackAction = async (action: string) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] Executing ${action}...`, ...prev]);
    await new Promise(res => setTimeout(res, 1200));
    setNetworkNodes(prev => prev.map(node =>
      Math.random() > 0.5 ? { ...node, status: 'compromised' } : node
    ));
    setTargetStatus(prev => ({
      ...prev,
      firewall: 'COMPROMISED',
      encryption: 'DEGRADED',
      accessControl: 'BYPASSED',
      systemIntegrity: Math.max(0, prev.systemIntegrity - 10)
    }));
    setActionLogs(prev => [`[${new Date().toLocaleTimeString()}] ${action} completed.`, ...prev]);
    setIsActionInProgress(false);
  };

  return (
    <div className={`min-h-screen font-mono overflow-hidden relative transition-all duration-500 ${currentTheme.bg} ${currentTheme.text}`}>
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

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: isWhiteHat 
              ? 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)',
            backgroundSize: isWhiteHat ? '25px 25px' : '20px 20px'
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent animate-pulse ${isWhiteHat ? 'via-blue-400' : 'via-green-400'}`} />
          <div className={`absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent animate-ping ${isWhiteHat ? 'via-green-400' : 'via-red-400'}`} />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        </div>
      </div>

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

      {/* Main Content */}
      <div className="relative z-10 p-4 grid grid-cols-3 gap-4 h-[calc(100vh-4rem)]">
        {/* Left Panel */}
        <div className="col-span-1 space-y-4 overflow-y-auto">
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Code className="w-5 h-5" />
              <span className="text-sm font-bold">
                {isWhiteHat ? 'SECURITY_LOG' : 'TERMINAL'}
              </span>
            </div>
            
            <div className="h-64 overflow-y-auto space-y-1 text-sm">
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
          <div 
            className={`border rounded-lg p-4 h-full backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-bold">NETWORK_TOPOLOGY</span>
            </div>
            
            <div className="relative h-[calc(100%-3rem)] bg-gray-900/50 rounded-lg overflow-hidden">
              {networkNodes.map((node) => {
                const transform = transform3DNode(node, rotationX, rotationY, zoom);
                const getNodeIcon = () => {
                  switch (node.type) {
                    case 'server':
                      return <Server className="w-3 h-3" />;
                    case 'database':
                      return <Database className="w-3 h-3" />;
                    case 'firewall':
                      return <Shield className="w-3 h-3" />;
                    case 'router':
                      return <Router className="w-3 h-3" />;
                    case 'endpoint':
                      return <Monitor className="w-3 h-3" />;
                    default:
                      return null;
                  }
                };

                return (
                  <div
                    key={node.id}
                    className={`absolute w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                      node.status === 'secure' ? 'bg-green-500/20 border border-green-500' :
                      node.status === 'patching' ? 'bg-yellow-500/20 border border-yellow-500' :
                      node.status === 'monitoring' ? 'bg-blue-500/20 border border-blue-500' :
                      node.status === 'compromised' ? 'bg-red-500/20 border border-red-500' :
                      node.status === 'breached' ? 'bg-purple-500/20 border border-purple-500' :
                      node.status === 'scanning' ? 'bg-cyan-500/20 border border-cyan-500' :
                      'bg-gray-500/20 border border-gray-500'
                    }`}
                    style={{
                      left: `${transform.x}%`,
                      top: `${transform.y}%`,
                      transform: `scale(${transform.scale})`,
                      zIndex: Math.round(transform.depth)
                    }}
                  >
                    <div className={`${
                      node.status === 'secure' ? 'text-green-500' :
                      node.status === 'patching' ? 'text-yellow-500' :
                      node.status === 'monitoring' ? 'text-blue-500' :
                      node.status === 'compromised' ? 'text-red-500' :
                      node.status === 'breached' ? 'text-purple-500' :
                      node.status === 'scanning' ? 'text-cyan-500' :
                      'text-gray-500'
                    }`}>
                      {getNodeIcon()}
                    </div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs opacity-50">
                      {node.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-1 space-y-4 overflow-y-auto">
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Activity className="w-5 h-5" />
              <span className="text-sm font-bold">SYSTEM_STATUS</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Operation Progress</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isWhiteHat ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <button
                onClick={startOperation}
                disabled={isActive}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isWhiteHat ? 'bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400 text-blue-400' : 'bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400'
                }`}
              >
                {isActive ? (isWhiteHat ? 'SECURING...' : 'HACKING...') : (isWhiteHat ? 'INITIATE_LOCKDOWN' : 'INITIATE_HACK')}
              </button>
            </div>
          </div>

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

          {/* Defense Actions Panel (White Hat) */}
          {isWhiteHat && (
            <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
              <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
                <Shield className="w-5 h-5" />
                <span className="text-sm font-bold">DEFENSE_ACTIONS</span>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleDefenseAction('DEPLOY_FIREWALL')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'DEPLOYING...' : 'DEPLOY_FIREWALL'}</button>
                <button onClick={() => handleDefenseAction('SCAN_VULNERABILITIES')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'SCANNING...' : 'SCAN_VULNERABILITIES'}</button>
                <button onClick={() => handleDefenseAction('PATCH_SYSTEM')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'PATCHING...' : 'PATCH_SYSTEM'}</button>
                <button onClick={() => handleDefenseAction('ACTIVATE_MONITORING')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'ACTIVATING...' : 'ACTIVATE_MONITORING'}</button>
              </div>
            </div>
          )}

          {/* Offense Actions Panel (Black Hat) */}
          {!isWhiteHat && (
            <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
              <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
                <Target className="w-5 h-5" />
                <span className="text-sm font-bold">ATTACK_ACTIONS</span>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleAttackAction('SCAN_TARGETS')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'SCANNING...' : 'SCAN_TARGETS'}</button>
                <button onClick={() => handleAttackAction('EXPLOIT_VULNERABILITY')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'EXPLOITING...' : 'EXPLOIT_VULNERABILITY'}</button>
                <button onClick={() => handleAttackAction('INJECT_PAYLOAD')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'INJECTING...' : 'INJECT_PAYLOAD'}</button>
                <button onClick={() => handleAttackAction('ESTABLISH_BACKDOOR')} disabled={isActionInProgress} className="w-full py-2 px-3 rounded text-sm bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed">{isActionInProgress ? 'ESTABLISHING...' : 'ESTABLISH_BACKDOOR'}</button>
              </div>
            </div>
          )}

          {/* Action Logs Panel */}
          <div className={`border rounded-lg p-4 backdrop-blur-sm ${currentTheme.panelBg} ${currentTheme.border}`}>
            <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${currentTheme.border}`}>
              <Code className="w-5 h-5" />
              <span className="text-sm font-bold">ACTION_LOGS</span>
            </div>
            <div className="relative h-40 overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full pointer-events-none h-8 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="flex flex-col justify-end h-full w-full">
                {actionLogs.slice(0, 6).map((log, index) => (
                  <div
                    key={`log-${index}`}
                    className={`animate-fadeinup mb-1 text-sm ${currentTheme.text}`}
                    style={{
                      animationDelay: `${index * 80}ms`,
                      opacity: 1,
                      transform: 'translateY(0)'
                    }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
            <style jsx>{`
              @keyframes fadeinup {
                from {
                  opacity: 0;
                  transform: translateY(16px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fadeinup {
                animation: fadeinup 0.5s cubic-bezier(0.4,0,0.2,1) both;
              }
            `}</style>
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
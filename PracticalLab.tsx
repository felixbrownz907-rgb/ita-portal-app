import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Beaker, CheckCircle2, ChevronRight, Info, AlertTriangle, Play, RefreshCw, 
  Terminal as TerminalIcon, Cpu, Zap, Settings, ArrowRight, Bot, GripVertical, 
  Sparkles, Search, Plus, Trash2, ChevronLeft, X, SlidersHorizontal,
  Monitor, Network, Radio, Server, Globe, Activity, Wifi,
  BookOpen, ClipboardSignature, Wrench, ClipboardList, Check, ClipboardCheck
} from 'lucide-react';
import { LabTask } from '../context/types';
import { cn } from '../components/utils';
import { motion, Reorder, AnimatePresence } from 'motion/react';

function CircuitSimulator({ onStepComplete }: { onStepComplete: (stepId: string) => void }) {
  const [connections, setConnections] = useState({ power: false, switch: false, lamp: false });
  const [isFlowing, setIsFlowing] = useState(false);

  const togglePart = (part: keyof typeof connections) => {
    const newConns = { ...connections, [part]: !connections[part] };
    setConnections(newConns);
    const flow = newConns.power && newConns.switch && newConns.lamp;
    setIsFlowing(flow);
    
    if (newConns.power) onStepComplete('c1');
    if (newConns.lamp) onStepComplete('c2');
    if (newConns.switch && flow) onStepComplete('c3');
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 shadow-xl">
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 text-center italic">Advanced Circuit Logic V1.0</h4>
      
      <div className="flex justify-around items-center h-48 relative">
        {/* Connection Lines */}
        <div className={cn("absolute h-1 w-full bg-gray-200 top-1/2 -translate-y-1/2 -z-10", isFlowing && "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]")} />
        
        <button onClick={() => togglePart('power')} className="group flex flex-col items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm", connections.power ? "bg-yellow-50 border-yellow-400 text-yellow-600 scale-110" : "bg-white border-gray-200 text-gray-300 hover:border-gray-300")}>
            <Zap className="w-8 h-8" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Power Source</span>
        </button>

        <button onClick={() => togglePart('switch')} className="group flex flex-col items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm", connections.switch ? "bg-blue-50 border-blue-400 text-blue-600 rotate-180" : "bg-white border-gray-200 text-gray-300 hover:border-gray-300")}>
            <Settings className="w-8 h-8" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Control Switch</span>
        </button>

        <button onClick={() => togglePart('lamp')} className="group flex flex-col items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm", connections.lamp ? (isFlowing ? "bg-yellow-400 border-yellow-500 text-white animate-pulse" : "bg-orange-50 border-orange-400 text-orange-600") : "bg-white border-gray-200 text-gray-300 hover:border-gray-300")}>
            <Cpu className="w-8 h-8" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Load Device</span>
        </button>
      </div>

      <div className="mt-10 p-4 bg-white border border-gray-100 rounded-xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          Status: {isFlowing ? (
            <span className="text-green-500 flex items-center justify-center gap-2"><CheckCircle2 className="w-3 h-3" /> System Operational</span>
          ) : (
             <span className="text-gray-300">Awaiting Connection Integrity</span>
          )}
        </p>
      </div>
    </div>
  );
}

function TerminalSimulator({ lab, onStepComplete }: { lab: LabTask, onStepComplete: (stepId: string) => void }) {
  const activeStep = lab.steps.find(s => !s.isCompleted);
  const [history, setHistory] = useState<string[]>([
    'ITA Sandbox Micro-Kernel v2.4 initialized.',
    'Terminal container session spawned successfully.',
    `Target Environment: [${lab.title}]`,
    'Type "help" to list terminal utilities or query step status.',
    ''
  ]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    // Reset terminal history when lab changes
    setHistory([
      'ITA Sandbox Micro-Kernel v2.4 initialized.',
      'Terminal container session spawned successfully.',
      `Target Environment: [${lab.title}]`,
      'Type "help" to list terminal utilities or query step status.',
      ''
    ]);
  }, [lab.id]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const cmd = input.toLowerCase().trim();
    let response = [`$ ${input}`];

    if (cmd === 'help') {
      response.push(
        'Supported utilities: ls, cat, cd, pwd, clear, git, chmod, df, top, nmap, python, help',
        `Active Step Target Hint: "${activeStep ? activeStep.text : 'All steps completed. Simulation cleared.'}"`
      );
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'ls') {
      response.push('src/  package.json  vite.config.ts  README.md  .env.example');
    } else if (cmd === 'pwd') {
      response.push('/workspace/it-academy-portal/labs');
    } else if (cmd.startsWith('cat ')) {
      const file = cmd.split(' ')[1];
      if (file === 'package.json') {
        response.push('{ "name": "it-academy-portal", "version": "1.0.0", "dependencies": {} }');
      } else {
        response.push(`cat: ${file}: No such file or directory`);
      }
    } else {
      // General adaptive matching logic
      let matched = false;
      if (activeStep) {
        const text = activeStep.text.toLowerCase();
        
        if (text.includes('enable') && cmd === 'enable') matched = true;
        else if ((text.includes('conf t') || text.includes('configure')) && (cmd === 'conf t' || cmd === 'configure terminal')) matched = true;
        else if (text.includes('hostname') && cmd.startsWith('hostname ')) matched = true;
        else if (text.includes('ip address') && (cmd.includes('ip address') || cmd.includes('ip addr'))) matched = true;
        else if (text.includes('git init') && cmd === 'git init') matched = true;
        else if (text.includes('git add') && cmd.startsWith('git add')) matched = true;
        else if (text.includes('git commit') && cmd.startsWith('git commit')) matched = true;
        else if (text.includes('git push') && cmd.startsWith('git push')) matched = true;
        else if (text.includes('chmod +x') && cmd.startsWith('chmod +x')) matched = true;
        else if (text.includes('chmod ') && cmd.startsWith('chmod ')) matched = true;
        else if (text.includes('df -h') && cmd === 'df -h') matched = true;
        else if (text.includes('top') && cmd === 'top') matched = true;
        else if (text.includes('cron') && cmd.startsWith('crontab')) matched = true;
        else if (text.includes('nmap') && cmd.startsWith('nmap')) matched = true;
        else if (text.includes('python') && cmd.startsWith('python')) matched = true;
        else if (text.includes('pointer') && (cmd.includes('gcc') || cmd.includes('alloc'))) matched = true;
        else if (text.includes('asynchronous') && (cmd.includes('npm') || cmd.includes('curl') || cmd.includes('node'))) matched = true;
        else if (text.includes('fetch') && cmd.startsWith('curl')) matched = true;
        else if (text.includes('stage') && cmd.startsWith('git add')) matched = true;
        else if (text.includes('commit') && cmd.startsWith('git commit')) matched = true;
        else if (text.includes('push') && cmd.startsWith('git push')) matched = true;
        else if (text.includes('rebound') && (cmd === 'rebound' || cmd === 'reload')) matched = true;
      }

      if (matched && activeStep) {
        response.push(`[SUCCESS] Verified: ${activeStep.text}`);
        response.push('Proceeding to next step...');
        onStepComplete(activeStep.id);
      } else {
        // Fallback or generic sandbox executor responses
        if (cmd.startsWith('git ')) {
          response.push(`git: repository operation executed successfully in container sandbox.`);
        } else if (cmd.startsWith('nmap ')) {
          response.push(`Starting Nmap scan... 4 ports open. Port 80, 443, 22, 3306 response OK.`);
        } else if (cmd.startsWith('python ')) {
          response.push(`Python execution output: Module run completed without return errors.`);
        } else if (cmd.startsWith('chmod ')) {
          response.push(`chmod: safe execution complete.`);
        } else {
          response.push(`sh: command processed inside laboratory sandbox successfully. [Hint: Type "help" to resolve verification steps]`);
        }
      }
    }

    setHistory(prev => [...prev, ...response]);
    setInput('');
  };

  return (
    <div className="bg-gray-950 rounded-2xl border border-white/10 p-6 font-mono text-sm h-[400px] flex flex-col shadow-2xl">
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 text-xs text-white/40">
        <span className="flex items-center gap-2 text-green-400">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          Container: ONLINE
        </span>
        <span>tty/1 (bash)</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 scroll-smooth text-left">
        {history.map((line, i) => (
          <p key={`term-${i}`} className={cn(
            "leading-relaxed whitespace-pre-wrap",
            line.startsWith('$') ? "text-green-400" : 
            line.startsWith('[SUCCESS]') ? "text-emerald-400 font-bold" :
            line.startsWith('[HINT]') ? "text-yellow-400" :
            line.startsWith('sh: ') ? "text-gray-400 italic" :
            "text-gray-300"
          )}>{line}</p>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-3 border-t border-white/5 pt-4 mt-4">
        <span className="text-green-400 font-bold">$</span>
        <input 
          type="text"
          className="bg-transparent border-none outline-none text-white flex-1 focus:ring-0 placeholder-white/20 text-sm"
          placeholder="Type command here..."
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}

interface CiscoIOSTerminalProps {
  lab: LabTask;
  onStepComplete: (stepId: string) => void;
}

function CiscoIOSTerminal({ lab, onStepComplete }: CiscoIOSTerminalProps) {
  const activeStep = lab.steps.find((s) => !s.isCompleted);
  
  // Power & Connectivity states
  const [powerOn, setPowerOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [consoleConnected, setConsoleConnected] = useState(true);
  
  // Simulated Cisco Switch/Router runtime configs
  const [hostname, setHostname] = useState('Router');
  const [mode, setMode] = useState<'user' | 'priv' | 'config' | 'config-if' | 'config-vlan' | 'config-router'>('user');
  const [intIp, setIntIp] = useState<string>('unassigned');
  const [intStatus, setIntStatus] = useState<'administratively down' | 'up'>('administratively down');
  const [vlanDatabase, setVlanDatabase] = useState<{ id: string; name: string; status: string }[]>([
    { id: '1', name: 'default', status: 'active' },
  ]);
  const [ospfNetworks, setOspfNetworks] = useState<{ network: string; wildcard: string; area: string }[]>([]);
  const [currentVlanId, setCurrentVlanId] = useState<string>('');

  // Diagnostic states
  const [isPingRunning, setIsPingRunning] = useState(false);
  const [pingPath, setPingPath] = useState<'pc-to-switch' | 'switch-to-router' | 'router-to-server' | 'all' | null>(null);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);

  // Terminal state
  const [history, setHistory] = useState<string[]>([
    '--- Cisco IOS Software Simulator [v15.2] ---',
    'System Boot Successful. RAM memory: 512MB.',
    'System Configuration Dialog: Awaiting console input.',
    'Type "?" or "help" for a list of valid commands.',
    'Press RETURN to get started.',
    ''
  ]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    // Reset terminal configuration and history for each active lab
    if (powerOn && !isBooting) {
      setHostname('Router');
      setMode('user');
      setIntIp('unassigned');
      setIntStatus('administratively down');
      setVlanDatabase([{ id: '1', name: 'default', status: 'active' }]);
      setOspfNetworks([]);
      setCurrentVlanId('');
      setHistory([
        `--- Cisco IOS Software Simulator [v15.2] ---`,
        `Target Packet Tracer Mission: Cisco ${lab.title}`,
        'Type "?" or "help" for a list of valid commands.',
        `Active Task Milestone: "${activeStep ? activeStep.text : 'All milestones validated.'}"`,
        ''
      ]);
    }
  }, [lab.id]);

  // Handle unit reboot cycle
  const triggerReboot = () => {
    if (isBooting) return;
    setIsBooting(true);
    setPowerOn(false);
    setMode('user');
    setHistory(prev => [
      ...prev,
      '',
      '*** SHUTTING DOWN CISCO SUPERVISOR DEVICELINK INTERFACES ***',
      'System Register state saved to persistent storage...',
      'DEVICE POWER CYCLE INITIATED IN 3... 2... 1...'
    ]);

    setTimeout(() => {
      // Re-boot sequence
      setPowerOn(true);
      setHostname('Router');
      setMode('user');
      setIntIp('unassigned');
      setIntStatus('administratively down');
      setVlanDatabase([{ id: '1', name: 'default', status: 'active' }]);
      setOspfNetworks([]);
      setCurrentVlanId('');
      setIsBooting(false);
      setHistory([
        '--- Cisco IOS Software BIOS Diagnostic Loader [v15.2] ---',
        'POST (Power-On Self Test) checklist:',
        '  CPU Cores: 4x ARM-v7 processor lines... [OK]',
        '  RAM Checksum Validation: 512MB... [OK]',
        '  VLAN Static Module Registry integrity... [OK]',
        '  GigabitEthernet Interface Card 0/0... [DETECTED]',
        'NVRAM Startup-Config: Not Found (entering Setup Prompt Mode)...',
        'Boot sequence complete. Device console linked on line con 0.',
        'Type "?" for help or begin typing configuration commands.',
        ''
      ]);
    }, 2200);
  };

  const getPrompt = () => {
    if (!powerOn) return '';
    switch (mode) {
      case 'user': return `${hostname}>`;
      case 'priv': return `${hostname}#`;
      case 'config': return `${hostname}(config)#`;
      case 'config-if': return `${hostname}(config-if)#`;
      case 'config-vlan': return `${hostname}(config-vlan)#`;
      case 'config-router': return `${hostname}(config-router)#`;
      default: return `${hostname}>`;
    }
  };

  // Run dynamic Packet Tracer Traceroute / Diagnostic Visual Ping
  const triggerVisualPing = (targetAddress: string) => {
    if (isPingRunning) return;
    setIsPingRunning(true);
    setPingPath('pc-to-switch');
    setPingSuccess(null);

    // Sequence through nodes
    setTimeout(() => {
      setPingPath('switch-to-router');
      setTimeout(() => {
        // Can reach router if console interface link is UP
        if (intStatus === 'up') {
          setPingPath('router-to-server');
          setTimeout(() => {
            // Can pass router to internet if router IP is assigned and up
            if (intIp !== 'unassigned' && intIp !== '0.0.0.0') {
              setPingSuccess(true);
            } else {
              setPingSuccess(false);
            }
            setPingPath(null);
            setIsPingRunning(false);
          }, 1000);
        } else {
          setPingSuccess(false);
          setPingPath(null);
          setIsPingRunning(false);
        }
      }, 1000);
    }, 1000);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const origInput = input;
    if (!input) return;

    if (!powerOn) {
      setHistory(prev => [...prev, '% Console terminal is unavailable while device is powered OFF.']);
      setInput('');
      return;
    }

    if (!consoleConnected) {
      setHistory(prev => [
        ...prev, 
        `Router console input: "${origInput}"`,
        '% Connection interrupted: Console RS-232 connection cable is physically unplugged.'
      ]);
      setInput('');
      return;
    }

    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    
    let out: string[] = [`${getPrompt()} ${origInput}`];
    let matchedNextStep = false;

    // Help Console Commands
    if (lower === '?' || lower === 'help') {
      out.push(
        'Interactive Cisco IOS Core Navigation commands:',
        '  enable / en                 - Elevate to privileged EXEC mode level',
        '  disable / dis              - Drop back to standard operator mode',
        '  configure terminal / conf t - Reach global level configuration terminal',
        '  exit                       - Walk back configuration sub-modes',
        '  end                        - Exit configuration levels entirely back to EXEC',
        '  hostname [string]          - Assign name configuration identifying label',
        '  interface [port] / int     - Open GigabitEthernet0/0 active sub-ports',
        '  ip address [ip] [mask]     - Assign static IPv4 network settings to interfaces',
        '  no shutdown / no shut      - Bring interfaces operational (Enable LINK up)',
        '  vlan [vlan_id]             - Provision a layer-2 switch VLAN domain',
        '  name [vlan_label]          - Attach semantic label tags of active VLANs',
        '  router ospf [process]      - Initialize OSPF dynamic routing engine',
        '  network [net] [wc] area 0  - Advertise prefix ranges inside Area 0 zone',
        '  show ip interface brief    - Report real-time interface IP and line states',
        '  show ip route              - Review operational routing database lookup tables',
        '  show vlan brief            - Review layer-2 switch VLAN distribution table',
        '  show running-config / sh run - Check running in-memory active parameters',
        '  write memory / wr          - Commit current configuration variables to NVRAM',
        '  ping [ip_address]          - Dispatch ICMP Echo diagnostics to networks'
      );
    } 
    // ENABLE MODE
    else if (cmd === 'enable' || cmd === 'en') {
      if (mode === 'user') {
        setMode('priv');
        out.push('% Mode transition: Privilege level executive configurations enabled.');
        if (activeStep && activeStep.text.toLowerCase().includes('enable')) {
          matchedNextStep = true;
        }
      } else {
        out.push('% Already in privileged command mode.');
      }
    } 
    // DISABLE MODE
    else if (cmd === 'disable' || cmd === 'dis') {
      if (mode !== 'user') {
        setMode('user');
        out.push('% Down-levels: Returned to standard console user scope.');
      } else {
        out.push('% Already in generic user mode.');
      }
    } 
    // CONFIGURE TERMINAL
    else if (cmd === 'configure' || cmd === 'conf' || lower === 'conf t') {
      if (mode === 'user') {
        out.push('% Access Denied: Privilege Level status required (try typing "enable" first).');
      } else if (mode === 'priv' || lower === 'conf t') {
        setMode('config');
        out.push('Enter global terminal scope configurations. Exit with "exit" or "end".');
        if (activeStep && (activeStep.text.toLowerCase().includes('conf t') || activeStep.text.toLowerCase().includes('configure terminal') || activeStep.text.toLowerCase().includes('global configuration'))) {
          matchedNextStep = true;
        }
      } else {
        out.push('% Unrecognized configuration depth command.');
      }
    } 
    // EXIT SESSIONS
    else if (cmd === 'exit') {
      if (mode === 'config-if' || mode === 'config-vlan' || mode === 'config-router') {
        setMode('config');
        if (activeStep && activeStep.text.toLowerCase().includes('exit') && activeStep.text.toLowerCase().includes('vlan')) {
          matchedNextStep = true;
        }
      } else if (mode === 'config') {
        setMode('priv');
      } else if (mode === 'priv') {
        setMode('user');
      } else {
        out.push('% Live console connection session is already at the outermost level.');
      }
    } 
    // END LEVEL
    else if (cmd === 'end') {
      if (mode !== 'user' && mode !== 'priv') {
        setMode('priv');
        out.push('% Session back: Returned configuration scopes immediately to EXEC #.');
        if (activeStep && activeStep.text.toLowerCase().includes('end')) {
          matchedNextStep = true;
        }
      } else {
        out.push('% Context error: Must be in active config modes before running "end".');
      }
    } 
    // HOSTNAME ACTION
    else if (cmd === 'hostname') {
      const name = parts[1];
      if (mode === 'config') {
        if (!name) {
          out.push('% Syntax Error: missing parameter (e.g., hostname ITA-Dev).');
        } else {
          setHostname(name);
          out.push(`% Hostname label successfully synchronized to: "${name}"`);
          if (activeStep && activeStep.text.toLowerCase().includes('hostname') && (activeStep.text.toLowerCase().includes(name.toLowerCase()) || activeStep.text.toLowerCase().includes('ita-dev') || activeStep.text.toLowerCase().includes('hostname'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Mode mismatch: Device hostname can only be altered from Global (config)#.');
      }
    } 
    // INTERFACE CHANNELS
    else if (cmd === 'interface' || cmd === 'int') {
      const ports = parts[1];
      if (mode === 'config') {
        if (!ports) {
          out.push('% Syntax Error: missing parameter (e.g., interface GigabitEthernet0/0).');
        } else {
          setMode('config-if');
          out.push(`% Configuration scope changed: Interfacing on channel ${ports}.`);
          if (activeStep && (activeStep.text.toLowerCase().includes('interface') || activeStep.text.toLowerCase().includes('gigabitethernet'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Mode mismatch: Access denied. Enter configuration terminal first.');
      }
    } 
    // IP BOUNDS SETTINGS
    else if ((cmd === 'ip' && parts[1]?.toLowerCase() === 'address') || (cmd === 'ip' && parts[1]?.toLowerCase() === 'add')) {
      const targetIp = parts[2];
      const targetSub = parts[3];
      if (mode === 'config-if') {
        if (!targetIp || !targetSub) {
          out.push('% Syntax Error: Missing subnet configuration details (e.g. ip address 192.168.1.1 255.255.255.0).');
        } else {
          setIntIp(targetIp);
          out.push(`% Interface IP designated: Gateway Router locked on address ${targetIp} / ${targetSub}`);
          if (activeStep && activeStep.text.toLowerCase().includes('ip address') && (activeStep.text.toLowerCase().includes(targetIp.toLowerCase()) || activeStep.text.toLowerCase().includes('assign') || activeStep.text.toLowerCase().includes('bind') || activeStep.text.toLowerCase().includes('ip address'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Command mismatch: Port interfaces configuration can only happen inside sub-command mode (config-if)#.');
      }
    } 
    // NO SHUTDOWN
    else if (cmd === 'no' && (parts[1]?.toLowerCase() === 'shutdown' || parts[1]?.toLowerCase() === 'shut')) {
      if (mode === 'config-if') {
        setIntStatus('up');
        out.push(
          '',
          `*May 27 07:11:45.109: %LINK-3-UPDOWN: Interface GigabitEthernet0/0, updated state to UP`,
          `*May 27 07:11:46.109: %LINEPROTO-5-UPDOWN: Line protocol on interface GigabitEthernet0/0, changes to UP`
        );
        if (activeStep && (activeStep.text.toLowerCase().includes('no shutdown') || activeStep.text.toLowerCase().includes('bring up') || activeStep.text.toLowerCase().includes('enable link') || activeStep.text.toLowerCase().includes('active instruction'))) {
          matchedNextStep = true;
        }
      } else {
        out.push('% Instruction error: Switch port activation requires active (config-if)#.');
      }
    } 
    // VLAN INSTANCE CONTEXT
    else if (cmd === 'vlan') {
      const vlanId = parts[1];
      if (mode === 'config') {
        if (!vlanId || isNaN(Number(vlanId))) {
          out.push('% Syntax Error: Please supply numeric VLAN (e.g., vlan 10).');
        } else {
          setMode('config-vlan');
          setCurrentVlanId(vlanId);
          if (!vlanDatabase.some(v => v.id === vlanId)) {
            setVlanDatabase(prev => [...prev, { id: vlanId, name: `VLAN${vlanId.padStart(4, '0')}`, status: 'active' }]);
          }
          out.push(`% VLAN Allocation created. Database index added for VLAN: ${vlanId}`);
          if (activeStep && activeStep.text.toLowerCase().includes('vlan') && (activeStep.text.toLowerCase().includes(vlanId.toLowerCase()) || activeStep.text.toLowerCase().includes('create') || activeStep.text.toLowerCase().includes('vlan'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Command error: VLAN partitions can only be configured from global configure level.');
      }
    } 
    // VLAN DESCRIPTION NAME
    else if (cmd === 'name') {
      const label = parts[1];
      if (mode === 'config-vlan') {
        if (!label) {
          out.push('% Syntax Error: missing parameter (e.g., name Secure_Network).');
        } else {
          setVlanDatabase(prev => prev.map(v => v.id === currentVlanId ? { ...v, name: label } : v));
          out.push(`% VLAN ${currentVlanId} tagged with identifier alias: ${label}`);
          if (activeStep && activeStep.text.toLowerCase().includes('name') && (activeStep.text.toLowerCase().includes(label.toLowerCase()) || activeStep.text.toLowerCase().includes('label') || activeStep.text.toLowerCase().includes('define name') || activeStep.text.toLowerCase().includes('name'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Command rejected: VLAN tagging requires (config-vlan)# sub-mode.');
      }
    } 
    // OSPF INIT
    else if (cmd === 'router' && parts[1]?.toLowerCase() === 'ospf') {
      const processId = parts[2];
      if (mode === 'config') {
        if (!processId) {
          out.push('% Syntax Error: Missing OSPF process area identification ID.');
        } else {
          setMode('config-router');
          out.push(`% Protocol started: OSPF routing daemon active on Process ID ${processId}.`);
          if (activeStep && (activeStep.text.toLowerCase().includes('ospf') || activeStep.text.toLowerCase().includes('router ospf') || activeStep.text.toLowerCase().includes('routing daemon'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Mode mismatch: OSPF routing configuration only available from global configuration mode.');
      }
    } 
    // OSPF INSTANCE PUBLISH
    else if (cmd === 'network') {
      const net = parts[1];
      const wildcard = parts[2];
      const isArea = parts[3]?.toLowerCase();
      const area = parts[4];
      if (mode === 'config-router') {
        if (!net || !wildcard || isArea !== 'area' || !area) {
          out.push('% Syntax Error: incomplete command. Structure pattern: network [net_ip] [wildcard] area [area_id].');
        } else {
          setOspfNetworks(prev => [...prev, { network: net, wildcard, area }]);
          out.push(`% Network published: Advertising prefix boundary range ${net} into dynamic OSPF scope.`);
          if (activeStep && activeStep.text.toLowerCase().includes('network') && (activeStep.text.toLowerCase().includes(net.toLowerCase()) || activeStep.text.toLowerCase().includes('advertise') || activeStep.text.toLowerCase().includes('publish') || activeStep.text.toLowerCase().includes('network'))) {
            matchedNextStep = true;
          }
        }
      } else {
        out.push('% Command rejected: Must be inside specific router configurations context (config-router)#.');
      }
    } 
    // SHOW ACTIONS
    else if (cmd === 'show' || cmd === 'sh') {
      const option = parts[1]?.toLowerCase();
      
      // SHOW IP INTERFACE BRIEF Output
      if (option === 'ip' && (parts[2]?.toLowerCase() === 'interface' || parts[2]?.toLowerCase() === 'int') && (parts[3]?.toLowerCase() === 'brief' || parts[3]?.toLowerCase() === 'br')) {
        const lineState = intStatus === 'up' ? 'up' : 'administratively down';
        const interfaceName = "GigabitEthernet0/0".padEnd(20, ' ');
        const interfaceIp = intIp.padEnd(16, ' ');
        const lineProtocol = intStatus === 'up' ? 'up' : 'down';
        
        out.push(
          'Interface            IP-Address      OK? Method Status                 Protocol',
          `${interfaceName} ${interfaceIp}YES manual ${lineState.padEnd(22, ' ')} ${lineProtocol}`,
          'FastEthernet0/1      unassigned      YES unset  administratively down  down',
          'Vlan1                unassigned      YES unset  administratively down  down'
        );
        if (activeStep && (activeStep.text.toLowerCase().includes('show ip interface brief') || activeStep.text.toLowerCase().includes('brief metrics') || activeStep.text.toLowerCase().includes('show ip interface brief'))) {
          matchedNextStep = true;
        }
      } 
      // SHOW VLAN BRIEF Output
      else if (option === 'vlan' && (parts[2]?.toLowerCase() === 'brief' || parts[2]?.toLowerCase() === 'br' || !parts[2])) {
        out.push(
          'VLAN Name                             Status    Ports',
          '---- -------------------------------- --------- -------------------------------'
        );
        vlanDatabase.forEach(v => {
          const paddedId = v.id.padEnd(4, ' ');
          const paddedName = v.name.padEnd(32, ' ');
          const paddedStatus = v.status.padEnd(9, ' ');
          out.push(`${paddedId} ${paddedName} ${paddedStatus} Gi0/1, Gi0/2`);
        });
        if (activeStep && (activeStep.text.toLowerCase().includes('show vlan') || activeStep.text.toLowerCase().includes('vlan brief') || activeStep.text.toLowerCase().includes('allocation state'))) {
          matchedNextStep = true;
        }
      } 
      // SHOW IP ROUTE Output
      else if (option === 'ip' && parts[2]?.toLowerCase() === 'route') {
        out.push(
          'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP',
          '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area',
          '       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2',
          '',
          'Gateway of last resort is not configured yet',
          ''
        );
        if (intStatus === 'up' && intIp !== 'unassigned') {
          out.push(`C     192.168.1.0/24 is directly connected, GigabitEthernet0/0`);
          out.push(`L     ${intIp}/32 is directly connected, GigabitEthernet0/0`);
        }
        ospfNetworks.forEach(net => {
          out.push(`O     ${net.network}/24 [110/2] via 192.168.10.254, 00:03:42, GigabitEthernet0/0`);
        });
        if (ospfNetworks.length === 0 && (intStatus !== 'up' || intIp === 'unassigned')) {
          out.push('% Network Database message: Routing table is empty (Activate interfaces).');
        }
        if (activeStep && (activeStep.text.toLowerCase().includes('show ip route') || activeStep.text.toLowerCase().includes('verify router path') || activeStep.text.toLowerCase().includes('verification audit') || activeStep.text.toLowerCase().includes('show ip route'))) {
          matchedNextStep = true;
        }
      } 
      // SHOW RUNNING CONFIG
      else if (option === 'run' || option === 'running-config') {
        out.push(
          `Building configuration...`,
          `Current active running config state size: 1856 bytes`,
          `!`,
          `version 15.2`,
          `service timestamps debug datetime msec`,
          `service timestamps log datetime msec`,
          `hostname ${hostname}`,
          `!`,
          `boot-start-marker`,
          `boot-end-marker`,
          `!`,
          `interface GigabitEthernet0/0`,
          ` ip address ${intIp} 255.255.255.0`,
          ` duplex auto`,
          ` speed auto`,
          ` physical status is ${intStatus === 'up' ? 'no shutdown' : 'shutdown'}`,
          `!`
        );
        vlanDatabase.forEach(v => {
          if (v.id !== '1') {
            out.push(`vlan ${v.id}`, ` name ${v.name}`, `!`);
          }
        });
        if (ospfNetworks.length > 0) {
          out.push(`router ospf 10`);
          ospfNetworks.forEach(net => {
            out.push(` network ${net.network} ${net.wildcard} area ${net.area}`);
          });
          out.push(`!`);
        }
        out.push(`end`);
        if (activeStep && (activeStep.text.toLowerCase().includes('show run') || activeStep.text.toLowerCase().includes('running-config'))) {
          matchedNextStep = true;
        }
      } else {
        out.push('% Unknown option specified. Type "sh ?" or command helper catalogs for menu assistance.');
      }
    } 
    // DIAGNOSTIC PING
    else if (cmd === 'ping') {
      const ipTarget = parts[1];
      if (!ipTarget) {
        out.push('% Syntax Error: missing parameter target IP address.');
      } else {
        out.push(
          `Sending 5, 100-byte ICMP Echos to ${ipTarget}, time-to-live is 2s:`,
          `Tracing packet route connectivity path physically...`
        );
        triggerVisualPing(ipTarget);
        
        const isUp = intStatus === 'up' && intIp !== 'unassigned';
        if (isUp) {
          out.push(
            `!!!!!`,
            `Success rate is 100 percent (5/5), round-trip min/avg/max = 2/4/12 ms`
          );
          if (activeStep && activeStep.text.toLowerCase().includes('ping') && (activeStep.text.toLowerCase().includes(ipTarget.toLowerCase()) || activeStep.text.toLowerCase().includes('diagnostics') || activeStep.text.toLowerCase().includes('ping'))) {
            matchedNextStep = true;
          }
        } else {
          out.push(
            `.....`,
            `Success rate is 0 percent (0/5). Destination network physically unreachable.`
          );
        }
      }
    } 
    // SAVE CONFIGURATION: WRITE MEMORY
    else if ((cmd === 'write' && parts[1]?.toLowerCase() === 'memory') || cmd === 'wr' || (cmd === 'copy' && parts[1]?.toLowerCase() === 'run' && parts[2]?.toLowerCase() === 'start')) {
      out.push(
        'Building configuration structure...',
        '[OK]',
        '% NVRAM Commit Complete: configuration variables backup completed successfully.'
      );
      if (activeStep && (activeStep.text.toLowerCase().includes('write memory') || activeStep.text.toLowerCase().includes('copy run start') || activeStep.text.toLowerCase().includes('commit current active') || activeStep.text.toLowerCase().includes('save') || activeStep.text.toLowerCase().includes('write'))) {
        matchedNextStep = true;
      }
    } 
    // DEFAULT ERROR
    else {
      out.push(
        `% Unrecognized core command instruction: "${cmd}"`,
        `% Enter "?" or "help" for a dictionary listing of fully working simulated syntax CLI keys.`
      );
    }

    if (matchedNextStep && activeStep) {
      out.push(
        `[SUCCESS] Milestone Approved: "${activeStep.text}"`,
        `Activating next simulation milestone...`
      );
      onStepComplete(activeStep.id);
    }

    setHistory(prev => [...prev, ...out, '']);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Packet Tracer Virtual Network Topology Canvas Banner */}
      <div className="bg-[#0f172a] rounded-2xl border-2 border-[#1e293b] p-6 text-left relative overflow-hidden shadow-xl select-none">
        
        {/* Neon topology grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        
        <div className="relative flex justify-between items-center pb-3 border-b border-[#334155] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-ping" />
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-[0.2em] font-mono">
              Cisco Packet Tracer 8.2 Live Topology Visualizer
            </h4>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${consoleConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              COM Console: {consoleConnected ? 'CONNECTED' : 'UNPLUGGED'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${intStatus === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              Gig0/0 Port: {intStatus === 'up' ? 'UP' : 'SHUTDOWN'}
            </span>
          </div>
        </div>

        {/* 4-Node Network Topology Grid */}
        <div className="relative grid grid-cols-4 gap-4 h-32 items-center justify-center font-mono my-2 text-center pb-2 z-10">
          
          {/* Animated SVG Cables Connection Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            {/* 1. PC to Switch Ethernet Cable Line (Grey) */}
            <line x1="12.5%" y1="50%" x2="37.5%" y2="50%" stroke="#64748b" strokeWidth="2.5" />
            
            {/* 2. PC to Router Roll-Over Cyan Console Cable (Curves round) */}
            <path 
              d="M 12.5% 50% Q 30% 10% 62.5% 50%" 
              fill="none" 
              stroke={consoleConnected ? "#22d3ee" : "#334155"} 
              strokeWidth="1.5" 
              strokeDasharray="6,4" 
              className={consoleConnected ? "animate-[dash_1s_linear_infinite]" : ""}
              style={{ strokeDasharray: '6, 4' }}
            />

            {/* 3. Switch to Router LAN Trunk Cable Line (Green if up, else Red-warning) */}
            <line 
              x1="37.5%" 
              y1="50%" 
              x2="62.5%" 
              y2="50%" 
              stroke={intStatus === 'up' ? "#10b981" : "#f43f5e"} 
              strokeWidth="3" 
              className={intStatus === 'up' ? "shadow-[0_0_8px_#10b981]" : ""}
            />

            {/* 4. Router to external Server WAN Cloud (Yellow path) */}
            <line 
              x1="62.5%" 
              y1="50%" 
              x2="87.5%" 
              y2="50%" 
              stroke={intStatus === 'up' && intIp !== 'unassigned' ? "#f59e0b" : "#334155"} 
              strokeWidth="2" 
            />

            {/* Animated Packet Node Bullets */}
            {isPingRunning && (
              <>
                {/* Ping bullet pc to switch */}
                {pingPath === 'pc-to-switch' && (
                  <circle r="6" fill="#fbbf24" className="shadow-[0_0_10px_#fbbf24]">
                    <animateMotion dur="1s" repeatCount="indefinite" path="M 12.5% 50% L 37.5% 50%" />
                  </circle>
                )}
                {/* Ping bullet switch to router */}
                {pingPath === 'switch-to-router' && (
                  <circle r="6" fill="#fbbf24" className="shadow-[0_0_10px_#fbbf24]">
                    <animateMotion dur="1s" repeatCount="indefinite" path="M 37.5% 50% L 62.5% 50%" />
                  </circle>
                )}
                {/* Ping bullet router to server */}
                {pingPath === 'router-to-server' && (
                  <circle r="6" fill="#fbbf24" className="shadow-[0_0_10px_#fbbf24]">
                    <animateMotion dur="1s" repeatCount="indefinite" path="M 62.5% 50% L 87.5% 50%" />
                  </circle>
                )}
              </>
            )}
          </svg>

          {/* NODE 1: Local Terminal Workstation PC */}
          <div className="flex flex-col items-center justify-center z-10 select-none">
            <div className="w-14 h-14 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-slate-300 shadow-md group hover:border-sky-500 transition-colors">
              <Monitor className="w-7 h-7 text-sky-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block">COM-PC1</span>
            <span className="text-[9px] text-slate-500 block">IP: 192.168.1.100</span>
          </div>

          {/* NODE 2: Layer-2 Catalyst Switch 2960 */}
          <div className="flex flex-col items-center justify-center z-10 select-none">
            <div className="w-14 h-14 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-slate-300 shadow-md hover:border-emerald-500 transition-colors">
              <Network className="w-7 h-7 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block">ITA-Switch</span>
            <span className="text-[9px] text-slate-500 block uppercase">
              VLANs: {vlanDatabase.map(v => v.id).join(',')}
            </span>
          </div>

          {/* NODE 3: Cisco ISR 4331 Edge Router */}
          <div className="flex flex-col items-center justify-center z-10 select-none">
            <div className="relative">
              <div className={cn(
                "w-14 h-14 bg-slate-800 rounded-xl border flex items-center justify-center text-slate-300 shadow-md hover:border-sky-500 transition-all",
                intStatus === 'up' ? 'border-emerald-500/50 shadow-emerald-500/10 shadow-lg' : 'border-slate-700'
              )}>
                <Radio className={cn("w-7 h-7", intStatus === 'up' ? 'text-emerald-400' : 'text-slate-500')} />
              </div>
              
              {/* LED status indicator light */}
              <div className={cn(
                "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900",
                intStatus === 'up' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              )} />
            </div>
            <span className="text-[10px] font-bold text-slate-200 mt-2 block uppercase truncate max-w-[80px]">
              {hostname}
            </span>
            <span className="text-[9px] text-slate-500 block">
              G0/0: {intIp}
            </span>
          </div>

          {/* NODE 4: ISP Enterprise Target Web Cloud Server */}
          <div className="flex flex-col items-center justify-center z-10 select-none">
            <div className="w-14 h-14 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-slate-300 shadow-md hover:border-amber-500 transition-colors">
              <Server className="w-7 h-7 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block">Cloud-HQ</span>
            <span className="text-[9px] text-slate-500 block">IP: 198.51.100.42</span>
          </div>

        </div>

        {/* Live diagnostic ping output telemetry overlay banner if ping has resolved */}
        {pingSuccess !== null && (
          <div className={cn(
            "p-2 text-center rounded-lg text-xs font-mono font-bold animate-pulse absolute bottom-2 left-6 right-6 border z-20",
            pingSuccess 
              ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/30" 
              : "bg-rose-900/40 text-rose-400 border-rose-500/30"
          )}>
            {pingSuccess 
              ? "✔ PACKETS MATCH ROUTE SUCCESS: Echo requests returned fully diagnostic packets from Web-Cloud-HQ." 
              : "✖ PHYSICAL DESTINATION COLD DOWN: Traceroute failed. Verify Switch ports are 'no shutdown' and ip is designated."}
          </div>
        )}

      </div>

      {/* 2. Interactive Hardware Rack Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-mono">
        <button 
          onClick={() => setConsoleConnected(!consoleConnected)}
          className={cn(
            "flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95",
            consoleConnected 
              ? "bg-cyan-950/35 border-cyan-800/40 text-cyan-400 hover:bg-cyan-900/20" 
              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850"
          )}>
          <Wifi className="w-4 h-4" />
          <div className="flex flex-col leading-tight">
            <span>Console RS-232 Port Link</span>
            <span className="text-[9px] font-normal opacity-70">
              {consoleConnected ? 'Click to UNPLUG line rollover' : 'Click to CONNECT rollover cable'}
            </span>
          </div>
        </button>

        <button 
          onClick={triggerReboot}
          disabled={isBooting}
          className={cn(
            "flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95",
            isBooting 
              ? "bg-amber-950/30 border-amber-800/20 text-amber-400 cursor-not-allowed animate-pulse" 
              : "bg-red-950/35 border-red-850/40 text-red-400 hover:bg-red-900/25"
          )}>
          <RefreshCw className={cn("w-4 h-4", isBooting ? "animate-spin" : "")} />
          <div className="flex flex-col leading-tight">
            <span>Hardware Recold Reboot</span>
            <span className="text-[9px] font-normal opacity-70">
              {isBooting ? 'LOADING CORERUNTIME...' : 'Re-power device & clear NVRAM'}
            </span>
          </div>
        </button>

        <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center gap-3 text-xs leading-none">
          <Activity className="w-4.5 h-4.5 text-slate-400" />
          <div className="flex flex-col gap-1.5 justify-center leading-none">
            <span className="font-extrabold text-[10px] uppercase text-slate-300">Active IOS State Model:</span>
            <span className="text-[9px] font-semibold text-sky-400 bg-sky-950/30 px-2.5 py-1 rounded border border-sky-900/30 tracking-wider">
              {getPrompt().replace('>', '').replace('#', '') || 'STANDBY'} Mode
            </span>
          </div>
        </div>
      </div>

      {/* 3. High Fidelity live Cisco IOS System CLI Terminal Pane */}
      <div className={cn(
        "bg-[#070b13] rounded-2xl border-2 p-5 font-mono text-xs h-[390px] flex flex-col shadow-2xl relative overflow-hidden text-left transition-all",
        !powerOn ? "border-slate-850" : "border-slate-800/40"
      )}>
        {/* Absolute branding layer */}
        <div className="absolute top-2.5 right-4 text-slate-800/30 font-bold uppercase tracking-[0.25em] pointer-events-none text-xl select-none">
          Cisco CLI
        </div>
        
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-900 mb-3 text-[10px] text-slate-400 select-none">
          <span className="flex items-center gap-2 font-semibold">
            <span className={cn(
              "w-2 h-2 rounded-full",
              !powerOn ? "bg-red-500 animate-pulse" : "bg-sky-500 animate-pulse"
            )} />
            {isBooting ? 'CORESYSTEM DIAGNOSTICS DECK' : `TERM Session Node: ${hostname} (console)`}
          </span>
          <span className="text-slate-500 tracking-wider font-extrabold uppercase">Console 0 / tty</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1 scroll-smooth text-left max-h-[280px]">
          {history.map((line, i) => (
            <p key={`cisco-${i}`} className={cn(
              "leading-relaxed whitespace-pre-wrap text-[11px]",
              line.startsWith('Router>') || line.startsWith('Router#') || line.includes('config)#') || line.includes('config-if)#') || line.includes('config-vlan)#') || line.includes('config-router)#') || line.startsWith('ITA-Dev>') || line.startsWith('ITA-Dev#') || line.startsWith('ITA-Gateway>') || line.startsWith('ITA-Gateway#') ? "text-sky-400 font-bold" : 
              line.startsWith('[SUCCESS]') ? "text-emerald-400 font-black" :
              line.startsWith('% ') ? "text-rose-400 bg-rose-950/15 p-1 rounded border border-rose-900/10 block my-1" :
              line.startsWith('***') ? "text-amber-500 font-semibold" :
              "text-slate-300"
            )}>{line}</p>
          ))}
          <div ref={terminalEndRef} />
        </div>
        
        <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-slate-900 pt-3 mt-auto">
          <span className="text-sky-400 font-bold selection:bg-transparent text-xs">{getPrompt()}</span>
          <input 
            type="text"
            className="bg-transparent border-none outline-none text-slate-100 flex-1 focus:ring-0 placeholder-slate-705 text-xs font-mono caret-sky-500 focus:outline-none"
            placeholder={!powerOn ? "Unit is powered down... Choose 'Recold Reboot' to load memory." : "Execute Cisco CLI command... (type '?' or 'help')"}
            autoFocus
            disabled={!powerOn || isBooting}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

function CrimpingSimulator({ onStepComplete }: { onStepComplete: (stepId: string) => void }) {
  const t568b = [
    { id: 'ow', color: 'bg-orange-100 border-orange-500', label: 'OW', name: 'Orange/White' },
    { id: 'o', color: 'bg-orange-500 border-orange-700', label: 'O', name: 'Orange' },
    { id: 'gw', color: 'bg-green-100 border-green-500', label: 'GW', name: 'Green/White' },
    { id: 'b', color: 'bg-blue-500 border-blue-700', label: 'B', name: 'Blue' },
    { id: 'bw', color: 'bg-blue-100 border-blue-500', label: 'BW', name: 'Blue/White' },
    { id: 'g', color: 'bg-green-500 border-green-700', label: 'G', name: 'Green' },
    { id: 'brw', color: 'bg-amber-800 border-amber-950', label: 'BrW', name: 'Brown/White' },
    { id: 'br', color: 'bg-amber-900 border-amber-950', label: 'Br', name: 'Brown' }
  ];

  const [items, setItems] = useState([...t568b].sort(() => Math.random() - 0.5));
  const [isStripped, setIsStripped] = useState(false);

  const checkOrder = (currentItems: typeof t568b) => {
    const isCorrect = currentItems.every((w, i) => w.label === t568b[i].label);
    if (isCorrect) onStepComplete('s2');
  };

  const handleReorder = (newItems: typeof t568b) => {
    setItems(newItems);
    checkOrder(newItems);
  };

  const isSequenceCorrect = items.every((w, i) => w.label === t568b[i].label);

  return (
    <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden h-[500px] flex flex-col border border-white/5">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Cpu className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
            Network Infrastructure Protocol
          </h4>
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
            isSequenceCorrect ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-white/40 border-white/10"
          )}>
            {isSequenceCorrect ? "Sequence Validated ✓" : "Standard: T568B"}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center gap-12 relative">
          {/* Connector Head Visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+40px)] w-72 h-20 bg-primary/5 border border-primary/20 rounded-t-3xl border-b-0 -z-0" />
          
          <div className="flex justify-center relative z-10">
            <Reorder.Group 
              axis="x" 
              values={items} 
              onReorder={handleReorder}
              className="flex gap-2 p-8 bg-gray-800/40 rounded-[32px] border border-white/5 shadow-inner"
            >
              {items.map((wire) => (
                <Reorder.Item 
                  key={wire.id} 
                  value={wire}
                  className="relative group"
                >
                  <div className={cn(
                    "w-7 h-36 rounded-full border-2 flex flex-col items-center justify-end pb-4 cursor-grab active:cursor-grabbing transition-shadow",
                    wire.color,
                    isSequenceCorrect ? "shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "shadow-lg shadow-black/40"
                  )}>
                    <div className="absolute top-2 w-1.5 h-6 bg-white/20 rounded-full" />
                    <span className="text-[7px] font-black mix-blend-difference rotate-90 mb-2 whitespace-nowrap opacity-60">
                      {wire.label}
                    </span>
                    <GripVertical className="w-3 h-3 text-black/20 mb-1" />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {!isStripped && (
             <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-[32px]">
                <button 
                  onClick={() => { setIsStripped(true); onStepComplete('s1'); }}
                  className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <Zap className="w-5 h-5" /> Initialize Cable Strip
                </button>
             </div>
          )}
        </div>

        <div className="mt-auto pt-8 flex gap-6">
           <div className="flex-1 text-left">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Simulation State</p>
              <p className="text-xs font-bold text-gray-300">
                {isSequenceCorrect ? "Alignment complete. Proceed to final termination." : "Drag wires to align with global EIA/TIA-568B standards."}
              </p>
           </div>
           <button 
            onClick={() => { onStepComplete('s3'); onStepComplete('s4'); }} 
            disabled={!isSequenceCorrect}
            className={cn(
              "px-10 py-5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3",
              isSequenceCorrect ? "bg-primary text-secondary hover:bg-primary/90 shadow-xl shadow-primary/20" : "bg-white/5 text-white/10 cursor-not-allowed"
            )}
           >
              Final Termination <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}

export function PracticalLab() {
  const { labs, addLab, updateLab, deleteLab, courses, user, askMentor, updateStudent } = useAuth();
  
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const studentCourseId = user?.studentData?.courseId;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');

  // Pagination State (Showing 10 per page for high performance)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add Lab Modal State
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [newLabTitle, setNewLabTitle] = useState('');
  const [newLabDescription, setNewLabDescription] = useState('');
  const [newLabDifficulty, setNewLabDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newLabType, setNewLabType] = useState<'crimping' | 'terminal' | 'circuit' | 'general'>('terminal');
  const [newLabCourseId, setNewLabCourseId] = useState('101');
  const [stepInputs, setStepInputs] = useState<string[]>(['', '']);
  const [newLabScenario, setNewLabScenario] = useState('');
  const [newLabObjectives, setNewLabObjectives] = useState('');
  const [newLabTools, setNewLabTools] = useState('');
  const [newLabProcedure, setNewLabProcedure] = useState('');
  const [newLabReportTemplate, setNewLabReportTemplate] = useState('');

  const [onlyMyCourse, setOnlyMyCourse] = useState(false);

  // Filter labs if it's a student and onlyMyCourse is set to true
  const baseLabs = (isStudent && onlyMyCourse) 
    ? labs.filter(l => l.courseId === studentCourseId || !l.courseId)
    : labs;

  // Multi-criteria Query Filtering
  const filteredLabs = baseLabs.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lab.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty;
    const matchesCourse = selectedCourseFilter === 'All' || lab.courseId === selectedCourseFilter;
    const matchesType = selectedTypeFilter === 'All' || lab.type === selectedTypeFilter;
    return matchesSearch && matchesDiff && matchesCourse && matchesType;
  });

  // Calculate pages
  const totalItems = filteredLabs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const pagedLabs = filteredLabs.slice(indexOfFirstItem, indexOfLastItem);

  const [selectedLabId, setSelectedLabId] = useState<string | null>(filteredLabs[0]?.id || null);
  const [labAiResponse, setLabAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Auto-adjust selected lab when filters change
  useEffect(() => {
    if (filteredLabs.length > 0) {
      const exists = filteredLabs.find(l => l.id === selectedLabId);
      if (!exists) {
        setSelectedLabId(filteredLabs[0]?.id || null);
      }
    } else {
      setSelectedLabId(null);
    }
  }, [searchQuery, selectedDifficulty, selectedCourseFilter, selectedTypeFilter]);

  // Handle page resets on filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDifficulty, selectedCourseFilter, selectedTypeFilter]);

  const selectedLab = labs.find(l => l.id === selectedLabId);
  const course = courses.find(c => c.id === selectedLab?.courseId);

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'scenario' | 'simulation' | 'report'>('scenario');
  const [editedReportNotes, setEditedReportNotes] = useState('');
  const [editedFindings, setEditedFindings] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (selectedLab) {
      setEditedReportNotes(selectedLab.reportNotes || selectedLab.reportTemplate || '');
      setEditedFindings(selectedLab.findings || '');
      setReportSubmitted(!!selectedLab.findings);
      setActiveWorkspaceTab('scenario');
    }
  }, [selectedLabId]);

  const calculateAndUpdateProgress = (allUpdatedLabs: any[]) => {
    if (isStudent && user?.studentData) {
      const courseLabs = allUpdatedLabs.filter(l => l.courseId === studentCourseId);
      if (courseLabs.length === 0) return;
      const completedCount = courseLabs.filter(l => l.status === 'completed').length;
      const newProgress = Math.round((completedCount / courseLabs.length) * 100);
      
      if (newProgress !== user.studentData.labProgress) {
        updateStudent({ ...user.studentData, labProgress: newProgress });
      }
    }
  };

  const toggleStep = (stepId: string) => {
    if (!selectedLab) return;
    const newSteps = selectedLab.steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const allDone = newSteps.every(s => s.isCompleted);
    const updatedLab: LabTask = { ...selectedLab, steps: newSteps, status: allDone ? 'completed' : 'pending' };
    updateLab(updatedLab);
    
    // Auto-sync progress
    const updatedLabsArray: LabTask[] = labs.map(l => l.id === selectedLab.id ? updatedLab : l);
    calculateAndUpdateProgress(updatedLabsArray);
  };

  const completeStep = (stepId: string) => {
    if (!selectedLab) return;
    const newSteps = selectedLab.steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: true } : s
    );
    const allDone = newSteps.every(s => s.isCompleted);
    const updatedLab: LabTask = { ...selectedLab, steps: newSteps, status: allDone ? 'completed' : 'pending' };
    updateLab(updatedLab);

    // Auto-sync progress
    const updatedLabsArray: LabTask[] = labs.map(l => l.id === selectedLab.id ? updatedLab : l);
    calculateAndUpdateProgress(updatedLabsArray);
  };

  const resetLab = () => {
    if (!selectedLab) return;
    const newSteps = selectedLab.steps.map(s => ({ ...s, isCompleted: false }));
    updateLab({ ...selectedLab, steps: newSteps, status: 'pending' });
  };

  const handleDeleteLab = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the lab "${name}"?\nThis selection cannot be undone.`)) {
      deleteLab(id);
      if (selectedLabId === id) {
        const remaining = filteredLabs.filter(l => l.id !== id);
        setSelectedLabId(remaining[0]?.id || null);
      }
    }
  };

  const handleCreateLabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSteps = stepInputs.filter(inp => inp.trim() !== '');
    if (!newLabTitle.trim()) {
      alert('Lab Title is required.');
      return;
    }
    if (validSteps.length === 0) {
      alert('Please define at least one verification step.');
      return;
    }

    const payload = {
      title: newLabTitle,
      description: newLabDescription,
      courseId: newLabCourseId,
      difficulty: newLabDifficulty,
      type: newLabType,
      status: 'pending' as const,
      scenario: newLabScenario || newLabDescription,
      objectives: newLabObjectives ? newLabObjectives.split('\n').map(o => o.trim()).filter(Boolean) : [
        'Initialize communication with the active cabinet terminal.',
        'Apply step milestones under technical requirements.',
        'Complete evaluation metrics to conclude the simulated lab.'
      ],
      tools: newLabTools ? newLabTools.split(',').map(t => t.trim()).filter(Boolean) : [
        'ITA Virtual Cabinet console',
        'Standard rollover rollover cable'
      ],
      procedure: newLabProcedure ? newLabProcedure.split('\n').map(p => p.trim()).filter(Boolean) : [
        'Launch the simulator panel tab.',
        'Follow instructions step-by-step.',
        'Enter report notes and document Observed Findings in the Report tab.'
      ],
      reportTemplate: newLabReportTemplate || '### GENERAL TECHNICAL SUMMARY LAB REPORT\n\n#### 1. OBJECTIVES MET STATUS\n[Document objectives solved]\n\n#### 2. SYSTEM CHECKS\n[Verify interface output code logs]\n\n#### 3. CRITICAL DISCOVERIES\n[Paste results & findings]',
      steps: validSteps.map((taskStr, index) => ({
        id: `ct-step-${index + 1}-${Date.now()}`,
        text: taskStr,
        isCompleted: false
      }))
    };

    await addLab(payload);
    setIsAddingModal(false);

    // Clear Form Fields
    setNewLabTitle('');
    setNewLabDescription('');
    setNewLabDifficulty('Beginner');
    setNewLabType('terminal');
    setStepInputs(['', '']);
    setNewLabScenario('');
    setNewLabObjectives('');
    setNewLabTools('');
    setNewLabProcedure('');
    setNewLabReportTemplate('');
  };

  const handleAddStepField = () => {
    setStepInputs(prev => [...prev, '']);
  };

  const handleStepValueChange = (index: number, val: string) => {
    const updated = [...stepInputs];
    updated[index] = val;
    setStepInputs(updated);
  };

  const handleRemoveStepField = (index: number) => {
    if (stepInputs.length <= 1) return;
    setStepInputs(stepInputs.filter((_, idx) => idx !== index));
  };

  const getAiHelp = async () => {
    if (!selectedLab) return;
    setIsAiLoading(true);

    const currentStep = selectedLab.steps.find(s => !s.isCompleted);
    const stepContext = currentStep 
      ? `The student is currently working on Step ${selectedLab.steps.indexOf(currentStep) + 1}: "${currentStep.text}".`
      : "The student has successfully completed all protocol steps.";

    try {
      const hint = await askMentor(
        [{ role: 'user', content: `I am a student at IT Academy performing a practical lab: "${selectedLab.title}". 
        
        SIMULATION PARAMETERS:
        Description: ${selectedLab.description}
        System Type: ${selectedLab.type}
        
        ACADEMIC PROGRESS:
        ${selectedLab.steps.map((s, i) => `${i+1}. ${s.text} [${s.isCompleted ? 'COMPLETED' : 'PENDING'}]`).join('\n')}
        
        CURRENT FOCUS:
        ${stepContext}
        
        TASK:
        Please provide a concise, high-fidelity technical hint specifically for the CURRENT FOCUS. 
        Avoid generic encouragement; instead, provide a "logic payload" or diagnostic tip that directs the student's attention to the correct technical maneuver required inside the ${selectedLab.type} simulation. Keep the tone expert, professional, and mentor-like.` }]
      );
      setLabAiResponse(hint);
    } catch (err) {
      setLabAiResponse("Neural connection timeout. Please retry the assistance request.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
            Practical Labs 
            <span className="text-secondary bg-primary/5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
              {labs.length} Loaded
            </span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Hands-on Engineering Simulations</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddingModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all w-full md:w-auto self-start"
          >
            <Plus className="w-4 h-4" /> Add Practical Lab
          </button>
        )}
      </div>

      {/* Responsive Filters and Search Widget bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search 1,000+ interactive labs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:border-primary px-12 py-3.5 rounded-xl text-sm font-bold placeholder-gray-400 outline-none transition-all text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Track filter */}
            <div className="relative">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full bg-gray-50 border border-transparent hover:border-gray-200 p-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer transition-all aspect-auto inline-block"
              >
                <option value="All">All Course Streams</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full bg-gray-50 border border-transparent hover:border-gray-200 p-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer transition-all aspect-auto inline-block"
              >
                <option value="All">All Sim Types</option>
                <option value="terminal">Terminal Shell</option>
                <option value="crimping">UTP Crimping</option>
                <option value="circuit">Logic Circuit</option>
                <option value="general">Audit Document</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full bg-gray-50 border border-transparent hover:border-gray-200 p-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer transition-all aspect-auto inline-block"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-left gap-3 border-t border-gray-50 pt-4 text-[10px] font-black uppercase text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span>Found {totalItems} matches in academic registry</span>
            </div>
            {isStudent && (
              <button
                onClick={() => {
                  setOnlyMyCourse(prev => !prev);
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-black uppercase tracking-widest text-[9px] transition-all duration-200 cursor-pointer select-none",
                  onlyMyCourse 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", onlyMyCourse ? "bg-primary animate-pulse" : "bg-gray-400")} />
                <span>My Enrolled Stream Only</span>
              </button>
            )}
          </div>
          {searchQuery || selectedDifficulty !== 'All' || selectedCourseFilter !== 'All' || selectedTypeFilter !== 'All' ? (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('All');
                setSelectedCourseFilter('All');
                setSelectedTypeFilter('All');
              }}
              className="text-primary hover:text-black hover:underline"
            >
              Clear active query filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lab Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Available Exercises</h2>
            <span className="text-[10px] font-black text-primary">Page {currentPage} of {totalPages}</span>
          </div>

          <div className="space-y-3">
            {pagedLabs.length > 0 ? (
              pagedLabs.map(lab => (
                <div
                  key={lab.id}
                  onClick={() => setSelectedLabId(lab.id)}
                  className={cn(
                    "w-full p-5 rounded-xl border text-left transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-between",
                    selectedLabId === lab.id 
                      ? "bg-white border-primary shadow-lg ring-1 ring-primary/20" 
                      : "bg-white/50 border-gray-100 hover:border-primary/50 hover:bg-white"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        lab.difficulty === 'Beginner' ? "bg-green-100 text-green-600" :
                        lab.difficulty === 'Intermediate' ? "bg-orange-100 text-orange-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {lab.difficulty}
                      </span>
                      <div className="flex items-center gap-1">
                        {lab.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLab(lab.id, lab.title);
                            }}
                            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                            title="Delete custom lab node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className={cn("text-sm font-black mt-2 leading-snug tracking-tight", selectedLabId === lab.id ? "text-primary" : "text-gray-900")}>
                      {lab.title}
                    </h3>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded">
                      {lab.type || 'general'}
                    </span>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                      {courses.find(c => c.id === lab.courseId)?.name || 'General Stream'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 font-mono text-xs">
                No simulated workspaces fit specified query criteria.
              </div>
            )}
          </div>

          {/* Simple, Professional Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Page {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-2 rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Lab Workspace */}
        <div className="lg:col-span-8">
          {selectedLab ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="bg-gray-900 p-8 text-white">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1 text-left">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Beaker className="w-5 h-5 text-primary" />
                      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic leading-none">{selectedLab.title}</h2>
                    </div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-[0.2em] leading-none pt-2">
                      {course?.name || 'GENERIC PROTOCOL'} // SIMULATION MODULE
                    </p>
                    
                    {isStudent && (
                      <div className="mt-6 max-w-sm">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Lab Synchronization</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                             {Math.round((selectedLab.steps.filter(s => s.isCompleted).length / (selectedLab.steps.length || 1)) * 100)}% Complete
                           </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                             style={{ width: `${(selectedLab.steps.filter(s => s.isCompleted).length / (selectedLab.steps.length || 1)) * 100}%` }}
                           />
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={resetLab}
                    className="bg-white/5 hover:bg-white/10 p-3 rounded-lg backdrop-blur-md transition-all text-white/60 flex items-center gap-2 mt-1 shrink-0"
                    title="Reload terminal and clear triggers"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Reset Workspace</span>
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1">
                {/* Tab Navigation header */}
                <div className="flex flex-wrap border-b border-gray-100 mb-8 pb-px gap-2">
                  <button
                    onClick={() => setActiveWorkspaceTab('scenario')}
                    className={cn(
                      "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                      activeWorkspaceTab === 'scenario'
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-400 hover:text-gray-950"
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    1. Scenario & Objectives
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('simulation')}
                    className={cn(
                      "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 relative cursor-pointer",
                      activeWorkspaceTab === 'simulation'
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-400 hover:text-gray-950"
                    )}
                  >
                    <TerminalIcon className="w-4 h-4" />
                    2. Hands-on Simulator
                    {selectedLab.steps.some(s => s.isCompleted) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('report')}
                    className={cn(
                      "px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                      activeWorkspaceTab === 'report'
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-400 hover:text-gray-950"
                    )}
                  >
                    <ClipboardSignature className="w-4 h-4" />
                    3. Report & Findings
                    {reportSubmitted && (
                      <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90">SUBMITTED</span>
                    )}
                  </button>
                </div>

                {/* TAB CONTENT: SCENARIO & OBJECTIVES */}
                {activeWorkspaceTab === 'scenario' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-left">
                      <h4 className="text-xs font-black uppercase tracking-[0.1em] text-blue-950 mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" /> Real Scenario Case Study
                      </h4>
                      <p className="text-slate-800 text-sm leading-relaxed font-semibold">
                        {selectedLab.scenario || selectedLab.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      {/* Objectives checklist */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Learning Objectives
                        </h4>
                        <ul className="space-y-2.5">
                          {(selectedLab.objectives || [
                            'Configure logical system boundaries',
                            'Integrate and verify active operational parameters',
                            'Conclude structural integrity diagnostics'
                          ]).map((obj, i) => (
                            <li key={i} className="text-xs font-bold text-gray-700 flex items-start gap-2.5 bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tools to use */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" /> Required Equipment & Tools
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedLab.tools || [
                            'ITA Virtual Cabinet',
                            selectedLab.type === 'cisco' ? 'Cisco Catalyst Console' : 'Integrated Platform Shell',
                            'Network Packet Probe'
                          ]).map((tool, i) => (
                            <span key={i} className="bg-primary/5 border border-primary/20 text-primary rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2">
                              📡 {tool}
                            </span>
                          ))}
                        </div>

                        <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 mt-6">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-yellow-800 mb-1">💡 Practical Tip</h5>
                          <p className="text-[11px] font-bold text-slate-600 leading-normal">
                             Complete at least one procedure step on the simulator panel, then document your findings in the Lab Report segment to store.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Performing Procedure */}
                    <div className="border border-gray-150 rounded-2xl p-6 sm:p-8 text-left space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-purple-600" /> Performing / Procedure Guide
                      </h4>
                      <div className="space-y-3">
                        {(selectedLab.procedure || [
                          'Launch the interactive terminal simulation space.',
                          'Apply sequence directives step-by-step.',
                          'Validate terminal output markers to complete milestone checkpoints.',
                          'Access the Lab Report tab to submit comprehensive discoveries.'
                        ]).map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs font-semibold text-gray-700 leading-relaxed pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setActiveWorkspaceTab('simulation')}
                        className="bg-primary hover:bg-opacity-90 hover:scale-[1.02] cursor-pointer text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        Proceed to active Simulator ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: ACTIVE SIMULATOR AREA */}
                {activeWorkspaceTab === 'simulation' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-200">
                    <div className="space-y-6 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                            <Play className="w-4 h-4" /> Lab Checklist
                          </h3>
                          <button 
                            onClick={getAiHelp}
                            disabled={isAiLoading}
                            className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50 cursor-pointer"
                          >
                             {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />} 
                             {isAiLoading ? 'Analyzing...' : 'AI Mentor Logic'}
                          </button>
                        </div>

                        <AnimatePresence>
                          {labAiResponse && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-900 rounded-2xl p-6 border-2 border-primary/30 relative overflow-hidden group"
                            >
                               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Sparkles className="w-12 h-12 text-primary" />
                               </div>
                               <div className="relative z-10 space-y-3">
                                 <div className="flex justify-between items-center">
                                   <p className="text-[9px] font-black uppercase tracking-widest text-primary">Intelligence Stream // Expert Guidance</p>
                                   <button onClick={() => setLabAiResponse(null)} className="text-white/20 hover:text-white transition-colors cursor-pointer">
                                     <X className="w-3.5 h-3.5" />
                                   </button>
                                 </div>
                                 <p className="text-lg md:text-xl font-bold text-white leading-relaxed italic">
                                   "{labAiResponse}"
                                 </p>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      
                      <div className="space-y-3">
                        {selectedLab.steps.map((step, index) => (
                          <div 
                            key={step.id || `step-${index}`}
                            onClick={() => toggleStep(step.id)}
                            className={cn(
                              "p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all group",
                              step.isCompleted 
                                ? "bg-green-50/50 border-green-100 text-green-900/50 shadow-sm" 
                                : "bg-white border-gray-100 hover:border-primary/30 text-gray-700 hover:shadow-md"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all",
                              step.isCompleted 
                                ? "bg-green-100 text-green-600 shadow-inner" 
                                : "bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white"
                            )}>
                              {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "text-xs font-bold leading-tight",
                                step.isCompleted ? "line-through opacity-50" : ""
                              )}>
                                {step.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <Settings className="w-4 h-4" /> Interactive Simulation Area
                      </h3>
                      <div className="min-h-[400px]">
                        {selectedLab.type === 'crimping' && <CrimpingSimulator onStepComplete={completeStep} />}
                        {selectedLab.type === 'terminal' && <TerminalSimulator lab={selectedLab} onStepComplete={completeStep} />}
                        {selectedLab.type === 'circuit' && <CircuitSimulator onStepComplete={completeStep} />}
                        {selectedLab.type === 'cisco' && <CiscoIOSTerminal lab={selectedLab} onStepComplete={completeStep} />}
                        {(!selectedLab.type || selectedLab.type === 'general') && (
                          <div className="h-full bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-6 font-semibold">
                                <AlertTriangle className="w-8 h-8" />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Procedural Manual Checklist</h4>
                              <p className="text-gray-400 text-[10px] uppercase max-w-[240px] leading-relaxed font-black tracking-wider">
                                This workflow requires external system validation. Securely execute steps externally, then toggle milestones checklist left.
                              </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: LAB REPORT & FINDINGS */}
                {activeWorkspaceTab === 'report' && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
                    <div className="bg-gradient-to-r from-gray-900 to-[#1e293b] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg border border-slate-850">
                      <div>
                        <h4 className="text-base font-black uppercase tracking-wider text-[#00f2fe] flex items-center gap-2">
                          <ClipboardCheck className="w-5 h-5" /> Lab Technical Report & Findings Form
                        </h4>
                        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-1">
                          SESSION IDENTIFIER STATE: {selectedLab.id.toUpperCase()} // PORTAL VERIFIED
                        </p>
                      </div>
                      <div className="bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-4 py-2 rounded-xl text-center shrink-0">
                        <span className="block text-2xl font-black text-[#00f2fe] leading-none">
                          {Math.round((selectedLab.steps.filter(s => s.isCompleted).length / (selectedLab.steps.length || 1)) * 100)}%
                        </span>
                        <span className="text-[8px] font-black tracking-widest text-[#00f2fe] uppercase">Checklist Progress</span>
                      </div>
                    </div>

                    {reportSubmitted ? (
                      <div className="bg-emerald-50 border-2 border-emerald-400/30 rounded-3xl p-8 space-y-6 text-center shadow-md">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner select-none">
                          <Check className="w-8 h-8 stroke-[3]" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Technical Lab Report Submitted</h3>
                          <p className="text-emerald-700/80 text-xs font-bold uppercase tracking-widest">
                            Verified by IT Academy Instructor Registry on {new Date().toLocaleDateString()}
                          </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-emerald-100 p-6 max-w-xl mx-auto text-left space-y-5 shadow-sm font-semibold">
                          <div>
                            <span className="text-emerald-500 font-black uppercase tracking-widest text-[9px] block">Student Findings / Observations:</span>
                            <p className="text-slate-700 mt-1 whitespace-pre-line leading-relaxed border-l-2 border-emerald-500/20 pl-3 italic text-xs">
                              {editedFindings}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Submitted Log Sheet & Notes:</span>
                            <p className="text-slate-500 mt-1 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto bg-gray-50 border border-gray-100 p-3 rounded-lg font-mono text-xs">
                              {editedReportNotes}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => {
                              setReportSubmitted(false);
                            }}
                            className="bg-white border-2 border-gray-150 text-gray-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
                          >
                            ✏️ Edit Report Data
                          </button>
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-emerald-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all cursor-pointer shadow-md active:scale-95"
                          >
                            🖨️ Export PDF Report
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 text-left">
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex gap-3 text-slate-600">
                          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs font-semibold uppercase tracking-wider leading-relaxed">
                            Perform all simulation steps, note down any CLI commands or outputs, then save your Report & critical Observed Findings in the inputs below.
                          </p>
                        </div>

                        {/* Report Notes editor */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">
                            📋 Standard Log Sheet / System Output Code
                          </label>
                          <textarea
                            value={editedReportNotes}
                            onChange={(e) => setEditedReportNotes(e.target.value)}
                            className="w-full min-h-[160px] p-4 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 font-mono text-xs rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none leading-relaxed"
                            placeholder="Type commands or logs here..."
                          />
                        </div>

                        {/* Student Findings input */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">
                            🔬 Observed Findings / Observations
                          </label>
                          <textarea
                            value={editedFindings}
                            onChange={(e) => setEditedFindings(e.target.value)}
                            className="w-full min-h-[120px] p-4 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 font-sans text-xs font-medium rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none leading-relaxed"
                            placeholder="Record your observations. E.g., 'Completed crimping step EIA T568B lines ordering, checked wire mapping tester, voltage is flowing through control switches in power loop...'"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            onClick={() => {
                              setEditedReportNotes(selectedLab.reportTemplate || '');
                              setEditedFindings('');
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                          >
                            Reset Workspace
                          </button>
                          <button
                            onClick={() => {
                              if (!selectedLab) return;
                              const updatedLab: LabTask = {
                                ...selectedLab,
                                reportNotes: editedReportNotes,
                                findings: editedFindings,
                                status: 'completed'
                              };
                              updateLab(updatedLab);
                              setReportSubmitted(true);
                            }}
                            disabled={!editedFindings.trim()}
                            className="bg-emerald-50 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none text-white px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            Submit Lab Report & Findings ➔
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 mt-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Simulated Session Mastery Score</p>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${(selectedLab.steps.filter(s => s.isCompleted).length / selectedLab.steps.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xl font-black italic text-primary">
                        {Math.round((selectedLab.steps.filter(s => s.isCompleted).length / selectedLab.steps.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  {selectedLab.status === 'completed' && (
                    <div className="flex items-center gap-3 bg-green-100 text-green-700 px-6 py-3 rounded-xl border border-green-200 animate-in fade-in slide-in-from-right-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-black uppercase tracking-widest text-[9px]">Simulation Validated</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
              <Beaker className="w-20 h-20 text-gray-150 mb-6 text-gray-200" />
              <h2 className="text-xl font-black text-gray-300 uppercase italic">Lab Workspace Disconnected</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Filter and select an active workspace to begin simulation</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Add Lab Modal Dialog Popup */}
      <AnimatePresence>
        {isAddingModal && (
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[1500] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
            >
              <button 
                onClick={() => setIsAddingModal(false)}
                className="absolute top-6 right-6 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-primary">Deploy Core Simulated Lab Node</h2>
                <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Academic Lab Creator Terminal</p>
              </div>

              <form onSubmit={handleCreateLabSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lab Interface Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Apache Web Host Setup"
                      value={newLabTitle}
                      onChange={e => setNewLabTitle(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-primary px-4 rounded-xl text-sm font-bold outline-none transition-all placeholder-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Associated Course Stream</label>
                    <select
                      value={newLabCourseId}
                      onChange={e => setNewLabCourseId(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-primary px-4 rounded-xl text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Engineering Directives Outline</label>
                  <textarea 
                    rows={2}
                    placeholder="Provide a clear description of the laboratory assignments..."
                    value={newLabDescription}
                    onChange={e => setNewLabDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-sm font-medium outline-none transition-all placeholder-gray-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Simulation Engine Context</label>
                    <select
                      value={newLabType}
                      onChange={e => setNewLabType(e.target.value as any)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-primary px-4 rounded-xl text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
                    >
                      <option value="terminal">Interactive Terminal Bash Core</option>
                      <option value="crimping">Interactive RJ45 Cable Sequence</option>
                      <option value="circuit">Interactive Load Logic Circuits</option>
                      <option value="general">Independent Audit Submission File</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Difficulty Profile</label>
                    <select
                      value={newLabDifficulty}
                      onChange={e => setNewLabDifficulty(e.target.value as any)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-primary px-4 rounded-xl text-xs font-black uppercase tracking-wider outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced Level</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Real Scenario Case Study</label>
                  <textarea 
                    rows={2}
                    placeholder="Provide a detailed, real-world practical scenario description..."
                    value={newLabScenario}
                    onChange={e => setNewLabScenario(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-sm font-medium outline-none transition-all placeholder-gray-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Learning Objectives (One Per Line)</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g.&#10;Isolate routing parameters&#10;Apply subnet addresses"
                      value={newLabObjectives}
                      onChange={e => setNewLabObjectives(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-xs font-medium outline-none transition-all placeholder-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Required Equipment & Tools (Comma Separated)</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Router Core, DB9 Rollover Cable, Subnet Planner"
                      value={newLabTools}
                      onChange={e => setNewLabTools(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-xs font-medium outline-none transition-all placeholder-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Performing / Procedure Guidelines (One Per Line)</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g.&#10;Initialize terminal console&#10;Execute active setup sequence"
                    value={newLabProcedure}
                    onChange={e => setNewLabProcedure(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-xs font-medium outline-none transition-all placeholder-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Standard Lab Report Template</label>
                  <textarea 
                    rows={4}
                    placeholder="### LAB REPORT CODE OUTCOME...&#10;[Document actions completed here]"
                    value={newLabReportTemplate}
                    onChange={e => setNewLabReportTemplate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary p-4 rounded-xl text-xs font-mono outline-none transition-all placeholder-gray-300"
                  />
                </div>

                {/* Steps configuration input list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Simulation Validation Milestones</label>
                    <button 
                      type="button"
                      onClick={handleAddStepField}
                      className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Milestone
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stepInputs.map((val, index) => (
                      <div key={`step-input-${index}`} className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400 w-6 text-center">{index + 1}</span>
                        <input 
                          type="text"
                          required
                          placeholder={`Milestone instructions (e.g. 'Type "git init" to initialize')`}
                          value={val}
                          onChange={e => handleStepValueChange(index, e.target.value)}
                          className="flex-1 h-11 bg-gray-50 border border-gray-200 focus:border-primary px-4 rounded-xl text-sm font-bold outline-none transition-all placeholder-gray-300"
                        />
                        <button
                          type="button"
                          disabled={stepInputs.length <= 1}
                          onClick={() => handleRemoveStepField(index)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-35"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsAddingModal(false)}
                    className="px-6 py-3 bg-gray-150 hover:bg-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 outline-none active:scale-95 transition-all text-center"
                  >
                    Cancel Drop
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-md active:scale-95 transition-all text-center"
                  >
                    Confirm & Publish Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

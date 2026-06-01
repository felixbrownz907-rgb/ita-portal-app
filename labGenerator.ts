import { LabTask } from '../context/types';

export function generate1000Labs(): LabTask[] {
  const courses = [
    { id: '101', name: 'Software Engineering', topics: [
      { key: 'git', title: 'Git Version Control', type: 'terminal' as const, steps: ['Initialize git repository (git init)', 'Stage system code artifacts (git add)', 'Commit modifications to HEAD (git commit)', 'Establish upstream remote origin (git push)'] },
      { key: 'oop', title: 'Object-Oriented Design', type: 'general' as const, steps: ['Design formal class diagram specs', 'Implement inheritance structure', 'Validate runtime override polymorphism', 'Expose cohesive interface APIs'] },
      { key: 'testing', title: 'JUnit Suite Orchestration', type: 'general' as const, steps: ['Inject mock system behavior rules', 'Assemble unit assert test suites', 'Validate complete path branch parameters', 'Verify total pipeline safety'] },
      { key: 'design-pattern', title: 'Design Patterns Audit', type: 'general' as const, steps: ['Audit system for design code smells', 'Refactor structures into Factory design', 'Configure Observer events handler', 'Inspect overall thread-safe scopes'] }
    ]},
    { id: '102', name: 'Programming', topics: [
      { key: 'variables', title: 'Pointer Allocations', type: 'terminal' as const, steps: ['Declare dynamic integer pointers', 'Initialize heap allocator arrays', 'Conduct direct hex memory prints', 'Perform garbage collection release'] },
      { key: 'structures', title: 'Data Structures Assembly', type: 'general' as const, steps: ['Assemble stack data structure nodes', 'Execute FIFO queue push actions', 'Reconstruct binary search tree branch', 'Review computational O complexity'] },
      { key: 'recursion', title: 'Recursive Call Traces', type: 'terminal' as const, steps: ['Establish recursive base condition', 'Activate system stack trace debug logs', 'Optimize with dynamic caching', 'Compile optimized executable binary'] }
    ]},
    { id: '103', name: 'ICT Essentials', topics: [
      { key: 'hardware', title: 'Logic Breadboarding', type: 'circuit' as const, steps: ['Initialize active DC core power rail', 'Wire resistors in serial loop paths', 'Close trigger circuit control switches'] },
      { key: 'networking', title: 'UTP LAN Termination', type: 'crimping' as const, steps: ['Strip the outer cable insulated sheath', 'Arrange pairs into EIA/TIA-568B lines', 'Trim exposed core conductor lines', 'Crimp the RJ45 modular jack plug'] },
      { key: 'os', title: 'OS File Permission Auditing', type: 'terminal' as const, steps: ['Retrieve disk storage sizes (df -h)', 'Create new operator system accounts', 'Inspect active CPU threads (top)', 'Configure custom mount point paths'] }
    ]},
    { id: '104', name: 'Artificial Intelligence', topics: [
      { key: 'regression', title: 'Linear Regression Modeling', type: 'terminal' as const, steps: ['Ingest floating point training vectors', 'Compute gradient descent cost matrix', 'Trace error delta rate iterations', 'Export prediction baseline model'] },
      { key: 'neural', title: 'Neural Feed-Forward Networks', type: 'general' as const, steps: ['Design neural network stack topology', 'Randomize initial link weight factors', 'Execute feed-forward propagation logic', 'Configure manual learning parameters'] },
      { key: 'cv', title: 'CV Convolution Kernel Matrix', type: 'general' as const, steps: ['Pull camera sensor raw capture feed', 'Convert RGB array to uniform grayscale', 'Execute Sobel pixel gradient filters', 'Register localized focus coordinates'] }
    ]},
    { id: '105', name: 'Python', topics: [
      { key: 'basics', title: 'Ecosystem Workspace Init', type: 'terminal' as const, steps: ['Provision clean virtual env spaces', 'Populate dependencies index file', 'Execute file parsing Python script', 'Audit execution speed diagnostics'] },
      { key: 'pandas', title: 'Pandas CSV Ingestion', type: 'terminal' as const, steps: ['Open regional spreadsheet tables', 'Clean missing datasets rows', 'Execute grouping aggregates logic', 'Draw statistical visual outputs'] },
      { key: 'django', title: 'Django Backend Routes', type: 'general' as const, steps: ['Kickstart Django template directory', 'Generate relational SQLite database tables', 'Build admin panel login schemas', 'Run dev web host routing scripts'] }
    ]},
    { id: '106', name: 'Web Development', topics: [
      { key: 'html', title: 'Responsive Grid Layouts', type: 'general' as const, steps: ['Design layout blueprint schemas', 'Anchor responsive column bounds', 'Verify document structure validators', 'Confirm rendering across breakpoints'] },
      { key: 'js', title: 'Asynchronous API Integrations', type: 'terminal' as const, steps: ['Fetch system configuration files', 'Process callback response promises', 'Store records in browser storage', 'Bind event handles dynamically'] },
      { key: 'react', title: 'React Hooks Implementation', type: 'general' as const, steps: ['Setup primary functional core tree', 'Bind interactive page hooks state', 'Memoize render processing branches', 'Compile optimized release bundles'] }
    ]},
    { id: '108', name: 'Linux 1 & 2', topics: [
      { key: 'bash', title: 'Operator Shell Automations', type: 'terminal' as const, steps: ['Draft system daemon log automation', 'Grant executable permissions (chmod +x)', 'Instruct cron schedule manager logs', 'Assess return output status signals'] },
      { key: 'admin', title: 'System Auditing Protocols', type: 'terminal' as const, steps: ['Assign safe group sudoers profiles', 'Restrict sensitive file permission metrics', 'Consult core login system journals', 'Acknowledge system sandbox parameters'] }
    ]},
    { id: '109', name: 'Cyber Security', topics: [
      { key: 'nmap', title: 'Port Scanning Reconnaissance', type: 'terminal' as const, steps: ['Run network interface scans (nmap)', 'Locate operating OS versions', 'Analyze router traffic packet logs', 'Print active ports audit reports'] },
      { key: 'crypto', title: 'AES Data Ciphering', type: 'general' as const, steps: ['Create secure symmetry seed hashes', 'Encrypt data block streams (openssl)', 'Execute decipher validation check', 'Confirm total hash authentication'] }
    ]},
    { id: '112', name: 'Cisco Routing & Switching (CCNA)', topics: [
      { key: 'cisco-ios', title: 'Cisco IOS CLI Navigation', type: 'cisco' as const, steps: ['Enter privileged EXEC mode (enable)', 'Enter global configuration mode (configure terminal)', 'Set switch or router hostname (hostname ITA-Dev)', 'Commit current active state (write memory)'] },
      { key: 'cisco-ip', title: 'Cisco Interface IP Provisioning', type: 'cisco' as const, steps: ['Enter Global configuration (enable & conf t)', 'Select active interface console (interface GigabitEthernet0/0)', 'Bind core IP subnet details (ip address 192.168.1.1 255.255.255.0)', 'Apply line active instruction (no shutdown)'] },
      { key: 'cisco-vlan', title: 'Cisco Switch VLAN Provisioning', type: 'cisco' as const, steps: ['Create high isolation VLAN (vlan 10)', 'Define name tag identification (name Secure_Network)', 'Return configuration frame control (exit)', 'Audit active port allocation state (show vlan brief)'] },
      { key: 'cisco-ospf', title: 'Cisco OSPF Dynamic Routing', type: 'cisco' as const, steps: ['Activate OSPF routing daemon (router ospf 10)', 'Publish network subnet scope (network 192.168.10.0 0.0.0.255 area 0)', 'Terminate interface session frame (end)', 'Run gateway routing verification audit (show ip route)'] },
      { key: 'cisco-ping', title: 'Packet Tracer ICMP Echo Diagnostics', type: 'cisco' as const, steps: ['Enter privileged EXEC mode (enable)', 'Enter global configuration (conf t)', 'Select active interface (interface GigabitEthernet0/0)', 'Bind IP settings to interface (ip address 192.168.1.1 255.255.255.0)', 'Apply line active instruction (no shutdown)', 'Exit interface context (exit)', 'Dispatch diagnostic ping echo (ping 192.168.1.10)', 'Verify router path tables (show ip route)'] },
      { key: 'cisco-static', title: 'Packet Tracer Static Route Assignment', type: 'cisco' as const, steps: ['Enter Privilege levels (enable)', 'Enter global configuration (configure terminal)', 'Set switch or router hostname (hostname ISR-Core)', 'Assign interface gate (interface GigabitEthernet0/0)', 'Bind core IP subnet details (ip address 10.0.0.1 255.255.255.252)', 'Apply line active instruction (no shutdown)', 'Exit interface setup (exit)', 'Commit current active state (write memory)'] },
      { key: 'cisco-dhcp', title: 'Cisco Edge DHCP Gateway Pool', type: 'cisco' as const, steps: ['Enter privilege configurations (enable)', 'Reach global configuration level (conf t)', 'Activate router interface line (interface GigabitEthernet0/0)', 'Assign Gateway IP settings (ip address 192.168.10.1 255.255.255.0)', 'Apply line active instruction (no shutdown)', 'Exit port configuration (exit)', 'Initialize OSPF daemon (router ospf 10)', 'Publish network subnet scope (network 192.168.10.0 0.0.0.255 area 0)', 'Terminate interface session frame (end)', 'Run gateway routing verification audit (show ip route)'] },
      { key: 'cisco-firewall', title: 'Cisco ASA Security Policy Setup', type: 'cisco' as const, steps: ['Enter privileged EXEC mode (enable)', 'Enter global configuration terminal (conf t)', 'Set router active hostname (hostname Cisco-Firewall)', 'Verify current interfaces brief metrics (show ip interface brief)', 'Commit configuration backup tables (write memory)'] },
      { key: 'cisco-ssh', title: 'Secure Cryptographic VTY Shell', type: 'cisco' as const, steps: ['Enter privileged EXEC command (enable)', 'Enter global configurations (configure terminal)', 'Set active switch gateway hostname (hostname Core-Switch)', 'Provision layer-2 VLAN (vlan 10)', 'Define name tag identification (name Management_VLAN)', 'Exit VLAN configuration context (exit)', 'Audit active port allocation state (show vlan brief)'] },
      { key: 'cisco-sec-enforce', title: 'Cisco Port Security Switched Network Link', type: 'cisco' as const, steps: ['Enter elevated command mode (enable)', 'Enter global terminal configurations (conf t)', 'Set active switch label (hostname SW-Branch)', 'Provision high isolation VLAN (vlan 20)', 'Define name tag identification (name Secure_Trunk)', 'Return configuration frame control (exit)', 'Show running-config state (show running-config)'] }
    ]}
  ];

  function getTopicDetails(key: string, num: number, courseName: string) {
    switch (key) {
      case 'git':
        return {
          scenario: `The development operations division at the company requires a secure, localized Git repository setup to maintain clean branches for code cycle #${num}. You must initialize and configure a master codebase tree locally.`,
          objectives: [
            'Initialize a direct local Git workspace sandbox repository.',
            'Index system application models and prepare staging index.',
            'Commit revision states to local HEAD with metadata.'
          ],
          tools: ['Git CLI Bash Terminal', 'VScode File Manager Proxy v2.0', 'ITA DevOps Dashboard'],
          procedure: [
            'Open your local Workspace CLI terminal.',
            'Issue the repository boot command: "git init".',
            'Add existing files to index storage index: "git add .".',
            'Define the milestone version commit parameters: "git commit -m \'initial commit\'".'
          ],
          reportTemplate: `### GIT DEVOPS PRACTICE REPORT [RUN #${num}]\n\n#### 1. REPOSITORY SHA-1 STATE METRICS\n[Enter Local Commit Hash Here]\n\n#### 2. STAGED PATH ARTIFACTS\n[List Staged Models Here, e.g., index.tsx, package.json]\n\n#### 3. DEPLOYMENT ROADMAP OBSERVATIONS\n[List any anomalies observed during local branch initialization]`
        };
      case 'cisco-ios':
        return {
          scenario: `A bare-metal Cisco 2960 administrative switch has arrived at the local ITA routing cabinet. You must gain command shell access via an interactive rollover console link and configure secure basic global configurations for terminal session #${num}.`,
          objectives: [
            'Initiate interactive remote Cisco secure console lines.',
            'Gain administrative privilege levels (EXEC enable mode).',
            'Apply global system hostname designations.',
            'Save changes permanently from dynamic RAM tables to NVRAM boot sections.'
          ],
          tools: ['Cisco Virtual Terminal Consoles v15.2', 'DB9 rollover diagnostics link', 'Packet Tracer Device Console UI'],
          procedure: [
            'Initialize communication lines inside the Virtual Terminal Console area.',
            'Type "enable" to ascend to command privilege EXEC levels.',
            'Type "configure terminal" to enter global configuration state.',
            'Execute the name binding command: "hostname SWITCH-BRANCH-A".',
            'Lock files safely in system memory by entering "write memory" instruction.'
          ],
          reportTemplate: `### CISCO IOS INITIAL CONFIGURATION SHEET\n\n#### 1. SYSTEM HOSTNAME CONSTRAINTS VALIDITY\n[Record the active Cisco hostname confirmed in CLI prompt]\n\n#### 2. RUNNING STATE MEMORY SUMMARY\n[Confirm if current running configurations are synchronized to NVRAM (YES/NO)]\n\n#### 3. CLI DIAGNOSTICS OBSERVATIONS\n[Record error indicators or successfully triggered console welcome prompts]`
        };
      case 'cisco-ip':
        return {
          scenario: `IT Academy local lab block requires static routing configurations. You must configure active GigabitEthernet edge interfaces and map secure network gateway coordinates to enable cross-subnet communication for student pod #${num}.`,
          objectives: [
            'Access CLI Global configuration terminal framework.',
            'Select the designated GigabitEthernet physical port context.',
            'Bind correct IP address parameters with custom CIDR Subnet masks.',
            'Activate the hardware physical and logical link states (de-assert shutdown).'
          ],
          tools: ['Cisco IOS Software CLI (v15.2)', 'RJ-45 Solid Copper UTP Cross-Over Cable', 'Packet Tracer Interactive Workspace Panel'],
          procedure: [
            'Ascend to enable mode inside the terminal interface.',
            'Invoke target port configuration terminal block with "interface GigabitEthernet0/0".',
            'Issue IP alignment coordinates: "ip address 192.168.1.1 255.255.255.0".',
            'Bring up physical and logical link lines instantly with "no shutdown".'
          ],
          reportTemplate: `### CISCO GIGABIT INTERFACE IP LOG\n\n#### 1. BINDING AND PORT CONFIGURATION LOG\n[Record full IP parameters mapped to GigabitEthernet0/0 interface]\n\n#### 2. VOLTAGE LINK LINE ALIGNMENT STATUS\n[Confirm visual indications in packet tracer panel when 'no shutdown' was executed]\n\n#### 3. ROUTING NEXT-HOP DISCOVERIES\n[Specify what routes have populated the routing table after port initialization]`
        };
      case 'cisco-vlan':
        return {
          scenario: `The campus office requires high-fidelity logical isolation between executive personnel systems and academic workstation subnet channels. Configure isolated VLAN interfaces for office group #${num} on local Layer 2 switches.`,
          objectives: [
            'Assemble isolated Virtual Local Area Network (VLAN) nodes on Cisco Catalyst.',
            'Assign descriptive, clean semantic labels to VLAN headers.',
            'Inspect the resulting table mapping inside operational Switched frames.'
          ],
          tools: ['Cisco Catalyst 2960 Managed Switch Simulator', 'VLAN Database Trunk Console', 'Console rollover cable'],
          procedure: [
            'Initialize terminal prompt levels with privileged access and global config mode.',
            'Declare isolated domain database container with: "vlan 10".',
            'Rename database context: "name Secure_Network".',
            'Verify that database entries have been mapped dynamically to interfaces with "show vlan brief".'
          ],
          reportTemplate: `### LAYER-2 SWITCHED VLAN AUDIT REPORT\n\n#### 1. ASSIGNED ISOLATION VLAN DATABASE ID\n[Record the VLAN identifier number configured]\n\n#### 2. SEMANTIC IDENTIFICATION METRICS\n[State the string label assigned to isolate workspace databases]\n\n#### 3. LOGICAL VLAN CONVERGENCE DIAGNOSTICS\n[Paste the console outputs observed during 'show vlan brief' audit scans]`
        };
      case 'cisco-ospf':
        return {
          scenario: `Dynamic routing must be provisioned across corporate WAN terminals to achieve network path resilience and auto-recovery. Initialize and bind OSPF routing profiles for branch offices during routine upgrade #${num}.`,
          objectives: [
            'Initialize a multi-hop Open Shortest Path First (OSPF) routing daemon.',
            'Publish local physical subnet scopes across network backbone areas with wildcard masks.',
            'Inspect the active IP routing path database to confirm neighbor state convergence.'
          ],
          tools: ['Cisco ISR 4331 Edge Router Cli Core', 'Packet Tracer Live Topology Map Engine', 'ITA OSPF Path Tracker'],
          procedure: [
            'Access privilege modes and enter global parameters.',
            'Boot routing daemon: "router ospf 10".',
            'Announce connected physical interface paths: "network 192.168.10.0 0.0.0.255 area 0".',
            'Conclude and review active path state updates with "show ip route" commands.'
          ],
          reportTemplate: `### CISCO OSPF DYNAMIC ROUTING ANALYSIS\n\n#### 1. RUNNING OSPF DAEMON PROCESS ID\n[Confirm process ID configured in router ospf mode]\n\n#### 2. CONVERGED ROUTE PATH NETWORKS\n[List external route paths detected inside routing logs]\n\n#### 3. WILDCARD MAPPING METRICS\n[Provide the calculated Wildcard Inverse Subnet details applied in CLI]`
        };
      case 'cisco-ping':
        return {
          scenario: `A server at remote Branch Office B is reporting complete connectivity drops. Perform dynamic ICMP diagnostics and routing table validation from the branch gateway router #${num} to identify network failures.`,
          objectives: [
            'Initialize diagnostic ICMP echo packets sequence.',
            'Verify end-to-end logical layer-3 paths to remote branch servers.',
            'Analyze round-trip timing and packet drops to spot routing loop bottlenecks.'
          ],
          tools: ['Cisco IOS Ping Toolkit v2.3', 'Wireshark Packet Probe Filters', 'Packet Tracer Network Emulator Layout'],
          procedure: [
            'Establish basic IP bindings to Gigabit interface Gi0/0 and bring the link up.',
            'Exit interface configuration context cleanly using "exit".',
            'Issue trace command: "ping 192.168.1.10" or target endpoint IP.',
            'Verify interface path status tables using "show ip route" commands.'
          ],
          reportTemplate: `### ICMP ECHO DIAGNOSTICS DATA REPORT\n\n#### 1. DIAGNOSTICS DESTINATION PARAMETERS\n[Provide target IP Address targeted for Ping evaluation]\n\n#### 2. ICMP PACKET SUCCESS AND LOSS RATIOS\n[Record success metrics, e.g., 'Success rate is 100 percent (5/5)']\n\n#### 3. PATH TABLE CONVERGENCE RESULTS\n[Review routing path lists from 'show ip route' CLI audits]`
        };
      case 'cisco-static':
        return {
          scenario: `The WAN backup gateways must route critical traffic to the disaster recovery center without dynamic routing overhead. Map persistent high-priority static gateway path definitions for database block #${num}.`,
          objectives: [
            'Access privileged global CLI terminal environments on Cisco ISR router.',
            'Map physical edge gateway ports with static next-hop route rules.',
            'Write permanent structures to switch NVRAM.'
          ],
          tools: ['Cisco Packet Tracer Router Topology Interface', 'Console rollover cables', 'ITA Subnet Calculator Tool'],
          procedure: [
            'Enter global configuration Mode via terminal command console.',
            'Name core router: "hostname ISR-Core".',
            'Configure Gigabit interface "interface GigabitEthernet0/0" with address "10.0.0.1 255.255.255.252" and enable port.',
            'Set static path mappings via "ip route" commands in global terminal.',
            'Save files firmly to operational boot configurations.'
          ],
          reportTemplate: `### CISCO STATIC ROUTE MANUAL SHEET\n\n#### 1. BACKUP ROUTING GATEWAY COORDINATES\n[Record next-hop routing gateway IPs assigned in ip route]\n\n#### 2. PORT POWER UP CHECKS\n[State confirmation that gigabit port transitioned to UP state successfully]\n\n#### 3. MEMORY EXECUTIONS LOGS\n[Verify state of backup config storage with 'write memory' executions]`
        };
      default:
        return {
          scenario: `An enterprise infrastructure client has ordered immediate deployment validation for module stream #${num} of the ${courseName} engineering roadmap. You must conduct full-scale hands-on procedures to certify security, performance, or system behavior.`,
          objectives: [
            'Initialize baseline localized configurations.',
            'Conduct logical sequences to activate processing routines.',
            'Verify criteria checklist requirements to confirm standard compliance.'
          ],
          tools: [`Academic Workspace SDK Console`, `ITA Live Simulation Tracer`, `Local system audit shell`],
          procedure: [
            'Initialize target system module area.',
            'Implement physical and logical layouts carefully.',
            'Test behavior bounds and confirm parameters.'
          ],
          reportTemplate: `### COMPREHENSIVE LABORATORY EVALUATION MANUAL [ID: #${num}]\n\n#### 1. SYSTEM BASELINE DIAGNOSIS\n[Enter preliminary system indicators and environment configurations here]\n\n#### 2. PROCEDURAL MILESTONE CONFIRMATIONS\n[Detail your execution of procedural steps 1, 2, and 3 here]\n\n#### 3. TECHNICAL FINDINGS & LOGICAL PERFORMANCE ANOMALIES\n[Record any deviations from standard operations encountered during this session]`
        };
    }
  }

  let labs: LabTask[] = [];
  let idCounter = 1;
  const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  for (const c of courses) {
    // Generate exactly 135 unique labs per course to get plenty (> 1000)
    for (let i = 1; i <= 135; i++) {
      const topicIdx = i % c.topics.length;
      const topic = c.topics[topicIdx];
      const diff = difficulties[i % 3];
      
      const labId = `lab-gen-${idCounter.toString().padStart(4, '0')}`;
      const title = `${topic.title} Lab #${i.toString().padStart(3, '0')}`;
      
      const steps = topic.steps.map((origStep, stepIdx) => ({
        id: `${topic.key}-gen-${i}-${stepIdx + 1}`,
        text: `${origStep} (Protocol Module ${i}.${stepIdx + 1})`,
        isCompleted: false
      }));

      const details = getTopicDetails(topic.key, i, c.name);

      labs.push({
        id: labId,
        title,
        description: `Hands-on simulation covering advanced procedures for ${topic.title}. In this session #${i}, you will execute simulated engineering practices in a localized virtual environment for ${c.name} (Course Stream Code: ${c.id}).`,
        steps,
        courseId: c.id,
        difficulty: diff,
        status: 'pending',
        type: topic.type,
        scenario: details.scenario,
        objectives: details.objectives,
        tools: details.tools,
        procedure: details.procedure,
        reportTemplate: details.reportTemplate,
        reportNotes: details.reportTemplate,
        findings: ''
      });

      idCounter++;
    }
  }

  return labs;
}

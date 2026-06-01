import { Course, Module, Lesson } from '../context/types';
import { CYBER_NOTES } from './cyberSecurityNotes';

// Structured database of 20 modules for each course
const COURSE_SYLLABI: Record<string, { name: string; description: string; duration: string; modules: string[] }> = {
  '101': {
    name: 'Mobile App Development',
    description: 'Master Android (Kotlin/Java) and iOS (Swift/HTML) native and hybrid application design, APIs and compilation streams.',
    duration: '6 Months',
    modules: [
      'Introduction to Mobile App Ecosystem',
      'UI/UX Principles for App Interfaces',
      'Native iOS Dev with SwiftUI and Swift',
      'Native Android Dev with Kotlin and Jetpack Compose',
      'Hybrid Development with React Native',
      'Flutter Ecosystem and Dart Basics',
      'Mobile Navigation and Screens Lifecycle',
      'Handling Device Resources & App Manifest',
      'Mobile Permissions and Security Sandboxing',
      'Local Databases: SQLite, CoreData & Room',
      'Network Integration: REST APIs, Axios & Retrofit',
      'Real-time Data Sync and WebSockets',
      'Push Notifications: FCM, APNs, and Background Tasks',
      'Integrating Hardware: Camera, Sensors, and Bluetooth',
      'Device Location & Google Maps Core API',
      'Unit & Integration Testing for Mobile Apps',
      'Build Systems, App Bundlers & Gradle',
      'Performance Profiling, Memory Leaks & Debugging',
      'App Store Optimization and App Store Publishing',
      'iOS & Android Security Hardening & Obfuscation'
    ]
  },
  '102': {
    name: 'Java and HTML',
    description: 'Bilateral full-stack development aligning enterprise Java Object-Oriented software architectures with HTML5 client-side engines.',
    duration: '6 Months',
    modules: [
      'Foundations of Web Client-Server Architecture',
      'HTML5 Structural Elements and Semantic Blueprinting',
      'Advanced HTML5 Forms & Modern Input Attributes',
      'Introduction to Java Syntax and Class Structures',
      'Java Control Flow, Conditions & Program Loops',
      'HTML Media & Canvas Graphics API',
      'Object-Oriented Programming (OOP) in Java',
      'Java Interface Design, Packages & Access Controls',
      'Inheritance, Method Overriding, & Polymorphism',
      'Java Exceptions and Assertions Framework',
      'JSP (JavaServer Pages) & Scriptlet Integration',
      'Java Servlets, REST Controllers, & Request Routing',
      'Database Connectivity (JDBC) & SQL Mechanics',
      'HTML DOM Integration using Java Web Client',
      'Java Collections Framework: Lists, Sets & Maps',
      'Java Generics and Type Erasure',
      'Multithreading, Thread Safety, & Java Concurrency',
      'Developing Web APIs with Tomcat and Spring Boot',
      'CORS, CSRF, and Enterprise Java Web Security',
      'Web App Deployment, Glassfish, and WAR Bundling'
    ]
  },
  '103': {
    name: 'Front-end Developer',
    description: 'Design and engineer client-side applications with responsive layout systems, modular component files and state management engines.',
    duration: '6 Months',
    modules: [
      'The Modern Front-end Web Tech Stack',
      'Advanced HTML5, Web Components, and Custom Tags',
      'Accessibility Standards (WCAG, ARIA Roles, Semantics)',
      'Advanced CSS: Flexbox and Grid Layouts',
      'Tailwind CSS: Utility-First Architecture and Styling',
      'CSS Variables, Custom Properties, and Theme Design',
      'JavaScript Engine, Event Loop, and Scope Chains',
      'DOM Execution, Manipulation, and Event Propagation',
      'Asynchronous JavaScript (Promises, async/await, Fetch)',
      'State Management in Browser Storage',
      'Introduction to React.js and JSX Compilation',
      'React Architecture: Functional Components & Hooks',
      'React State, Props, and Memoization Hooks',
      'Managing Complex State with Context API',
      'SPA Routing: History APIs, Params, and React Router',
      'CSS-in-JS vs Tailwinds in Build Pipeline',
      'Front-End Architecture: Vite, Webpack, and Bundlers',
      'Real-Time Audio/Video with WebRTC in Browser',
      'Form Handlers and Client-Side Input Validations',
      'Production Deployments, CDN Caching, and SSR (Next.js)'
    ]
  },
  '104': {
    name: 'Back-end Developer',
    description: 'Construct server-side runtimes, relational schemas, secure authentication middleware and real-time sockets hubs.',
    duration: '6 Months',
    modules: [
      'Backend Engineering & Client-Server Handshake Protocol',
      'Node.js Runtime Engine, Event Loop, and V8 Specs',
      'Modern JavaScript on Server (ES Module Path Resolution)',
      'Creating HTTP Servers with Node Core and Express',
      'Routing, Query Params, and RESTful Conventions',
      'Middleware Architecture: Custom Parsing and Security',
      'Relational Databases and SQL Schema Design',
      'NoSQL Databases and Document Models',
      'Prisma ORM and DB Migrations Mechanics',
      'Secure Password Hashing: BCrypt and Argon2',
      'JSON Web Token (JWT) Authentication Streams',
      'Sessions, Cookies, and OAuth Authorization Flows',
      'Error Handling Patterns and Centralized Boundary Logic',
      'WebSockets: Real-time Communication with Socket.IO',
      'Background Processing, Schedulers and Task Queues',
      'API Rate Limiting, CORS Policy, and Security Baselines',
      'Load Balancing, Clustering, and Multi-core Node Servers',
      'Unit Testing with Vitest and Supertest Integration',
      'Production Logging, Cloud Logging, and Winston/Morgan',
      'Dockerizing Backends, Environment Vars, and CI/CD Deploy'
    ]
  },
  '109': {
    name: 'Ethical Hacking',
    description: 'Learn system penetration testing, security scanning, packet auditing and vulnerability exploitation methodologies from Cisco standards.',
    duration: '6 Months',
    modules: [
      'Key Ethical Hacking Standards and Methodologies',
      'Footprinting & Passive Reconnaissance (OSINT tools)',
      'Active Scanning: Nmap Flag Combinations & Firewall Evasion',
      'Vulnerability Analysis and Common Vulnerabilities (CVE)',
      'Enumeration: SMB, LDAP, and SNMP Services',
      'System Hacking: Password Cracking & Privilege Escalation',
      'Malware Threats, Trojans, and Kernel Rootkits',
      'Packet Sniffing, ARP Poisoning & Wireshark Deep-Dive',
      'Social Engineering: Phishing & Credential Harvesting',
      'Denial of Service: DDoS Vectors and SYN Flood Attacks',
      'Session Hijacking: Sequence Predictions and CSRF',
      'Web Application Security: OWASP Top 10 Risks',
      'SQL Injection (SQLi): Union-Based and Blind Vectors',
      'Cross-Site Scripting (XSS): Reflected, Stored, and DOM',
      'Wireless Hacking: WEP, WPA2/WPA3 Handshake Crack',
      'Hacking Web Servers, Web APIs, and Apache/IIS Exploits',
      'Mobile Device Penetration Testing & App Sandboxing',
      'IoT & Cloud Penetration Testing: S3 Bucket Misconfigs',
      'Cryptography Algorithms, Hashing & Cryptanalysis',
      'Penetration Testing Reports, Scoring Systems & Remediation'
    ]
  },
  '110': {
    name: 'Cybersecurity Foundation Program (6 Weeks)',
    description: 'Beginner-friendly cybersecurity curriculum covering digital dependency, system flow, network protocols, input validation, web shells, and practical risk assessments.',
    duration: '6 Weeks',
    modules: [
      'Introduction to Cybersecurity (System Basics)',
      'Cybersecurity & Digital Dependency (System Flow)',
      'System Vulnerabilities & Network Fundamentals',
      'Practical System Security & Testing',
      'Continuous Assessment (CA)',
      'Final Examination & Case Studies'
    ]
  },
  '111': {
    name: 'Cisco CCNA Routing & Switching Essentials (3 Months)',
    description: 'Master advanced network configurations, IP routing, subnet masks, VLANs, access control list mechanisms, and switch security protocols.',
    duration: '3 Months',
    modules: [
      'Network Types, Topologies and OSI Reference layers',
      'IPv4 & IPv6 Addressing/Subnetting Mechanics',
      'Introduction to Cisco IOS Command Line Interface (CLI)',
      'Layer 2 Switching Concepts and VLAN Networks',
      'Spanning Tree Protocol (STP) Operations',
      'Inter-VLAN Routing Protocols and Configuration',
      'Static Routing and Dynamic OSPFv2 Configurations',
      'Access Control Lists (ACLs) for Traffic Filtering',
      'Network Address Translation (NAT) and PAT Services',
      'DHCP Server/Relay Agent Configuration on Cisco Router',
      'Introduction to WAN Topologies and Client Handshakes',
      'Cisco Device Security Hardening and SSH Configuration'
    ]
  },
  '112': {
    name: 'CompTIA Security+ Certification Core (6 Weeks)',
    description: 'Aligned with official CompTIA framework: cybersecurity threats, cloud vulnerabilities, cryptographic primitives, and incident response.',
    duration: '6 Weeks',
    modules: [
      'Cybersecurity Threat Ecosystem and Attacker Types',
      'Social Engineering Frameworks and Vector Analysis',
      'Analyzing Malware and Hardware Exploits',
      'Cryptographic Core Primitives, Hashing and Symmetric Encryption',
      'Identity & Access Management, OAuth, MFA, and SSO',
      'Risk Assessments, Security Compliance and Incident Planning'
    ]
  },
  '113': {
    name: 'Python Programming & Scripting (6 Weeks)',
    description: 'Comprehensive software foundations in Python. Build automation utility scripts, process tabular data, and integrate third-party APIs.',
    duration: '6 Weeks',
    modules: [
      'Python Syntax, Basic Types and Compiler Execution Flow',
      'Control Flow, Loops and Conditional Declarations',
      'Data Structures: Lists, Tuples, Dictionaries and Sets',
      'Functional Programming, Scope Chains and Decorators',
      'File Input/Output, Directory Parsing and Exception Boundaries',
      'Analyzing Data with Pandas and Automation Modules'
    ]
  },
  '114': {
    name: 'Linux Operating System & SysAdmin (3 Months)',
    description: 'Learn enterprise Linux administration. Manage kernel resources, permissions, systemd service units, and bash scripting pipelines.',
    duration: '3 Months',
    modules: [
      'Linux Kernel Architecture & Terminal Command Interface',
      'File System Hierarchy and Absolute vs Relative Root Pathing',
      'User Profiles, Enterprise Group Controls & File Permissions',
      'Active Process Control, resource tracking and kernel registers',
      'Introduction to Bash Scripting & Automation Utilities',
      'Networking in Linux: IP assignments, route analysis',
      'Systemd Services, Daemons, Cron Schedulers and Event Loggers',
      'Storage Management: LVM, Partitions and File Systems mounting',
      'Security Hardening: SSH Keys, FirewallD and SELinux',
      'Software Repositories: YUM, DNF, APT, and source compilations',
      'Web Servers Setup: Apache HTTP, Nginx configurations',
      'Troubleshooting OS Failures, Memory Leaking and System Rescue'
    ]
  },
  '115': {
    name: 'Cloud Computing Foundations (AWS) (6 Weeks)',
    description: 'Introduction to public cloud computing infrastructure, server virtualization, IAM access policies, object storage, and global edge CDNs.',
    duration: '6 Weeks',
    modules: [
      'Introduction to Cloud Virtualization & Service Models',
      'IAM Users, Roles & Custom Security Group Architectures',
      'AWS EC2 Compute Instances & Autoscaling Management',
      'S3 Bucket Object Storage & Lifecycle Policies',
      'Virtual Private Cloud (VPC) Subnets and Access Rules',
      'CloudWatch Auditing, Performance Logs & Billing'
    ]
  },
  '116': {
    name: 'SQL Database Administration & Tuning (6 Weeks)',
    description: 'Master structured query language, relational integrity constraints, index tables, transaction logic rollback, and query performance tuning.',
    duration: '6 Weeks',
    modules: [
      'Relational Database Concepts and Standard Schemata',
      'Data Definition Language (DDL) and Table Declarations',
      'Advanced SQL Queries: Joins, Subqueries and CTEs',
      'Database Integrity Constraints, PK/FK & Cascade Rules',
      'Transactions, ACID Properties and Rollback Operations',
      'Query Optimization, Index Tuning and Performance Scanning'
    ]
  },
  '117': {
    name: 'Digital Forensics & Incident Response (6 Months)',
    description: 'Professional-grade cyber investigator curriculum: trace file carving, volatile RAM forensic imaging, secure malware sandboxing.',
    duration: '6 Months',
    modules: [
      'Digital Forensics Lifecycle & Legal Evidence Baselines',
      'Acquisition of Volatile Memory (RAM) Analysis Registry',
      'Imaging Storage Media and Hash Verifications',
      'Analyzing FAT, NTFS and Ext4 File System Carving',
      'Windows Registry Forensic Carving and User Activity Tracking',
      'Browser Forensics: History Databases and Cookie Assets',
      'Email Header Parsing, Phishing Source Auditing',
      'Network Packet Capture analysis and Event log timelines',
      'Linux Volatility & Logs Investigation Frameworks',
      'Malware Behaviour Triage & Sandbox Environment analysis',
      'Incident Response Frameworks: NIST, SANs and ISO standards',
      'Containment Strategies, Traffic Blockings & Isolated Nodes',
      'E-Discovery Tools, File Recovery and Metadata Scrutiny',
      'Log Correlation Engine, SIEM Alert Ingest and Corrobation',
      'Mobile Forensic Acquisition, ADB, and APN analysis',
      'Reverse Engineering Baselines, Disassembler view constraints',
      'Vulnerability Correlation, Exploit Footprinting Analysis',
      'Cloud Architecture Forensics, EC2 and IAM trace logs',
      'Anti-Forensics Techniques and Obfuscation Detection',
      'Drafting Court-Acceptable Forensics Auditing Reports'
    ]
  },
  '118': {
    name: 'Windows Server Infrastructure Services (3 Months)',
    description: 'Install and configure Windows Server, Active Directory Domain Services (AD DS), DNS/DHCP infrastructure, and Group Policies.',
    duration: '3 Months',
    modules: [
      'Windows Server Core Installation & Administration CLI',
      'Active Directory Domain Services (AD DS) Identity trees',
      'Domain Controller Promotions and Trust Settings',
      'Designing Group Policy Objects (GPO) and Security Baselines',
      'DNS Infrastructure: Zone files, Forwarding & Root Hints',
      'DHCP Server Scope, Leases, and High-Availability Failover',
      'File Server Resource Manager (FSRM) and NTFS Permissions',
      'Windows Deployment Services (WDS) and Image Casting',
      'Hyper-V Virtualization Setup and Secure Networking',
      'Update Management: WSUS administration and policies',
      'Server Troubleshooting, Performance Monitor & Event Viewer',
      'Disaster Recovery, IIS server setups & Backup Strategies'
    ]
  },
  '119': {
    name: 'Web Development Fundamentals (6 Weeks)',
    description: 'Get started with responsive web design: standard structural semantic HTML5 grids, vanilla JavaScript events, and CSS stylesheets.',
    duration: '6 Weeks',
    modules: [
      'Web Client-Server Handshake Interface & Browsers',
      'HTML5 Landmarks, Structural Scaffolding and Semantics',
      'CSS Syntax, Selectors, Color Spaces and Text styling',
      'Responsive Web: CSS Flexbox & Standard Grid Systems',
      'Vanilla JavaScript Foundations, Script tags, variables',
      'HTML DOM Interactions, Event Handlers and input tracking'
    ]
  },
  '120': {
    name: 'Network Security & Next-Gen Firewalls (3 Months)',
    description: 'Configure and install Cisco ASAs, Netflow monitors, perimeter packet filtering rules, and site-to-site IPsec VPN tunnels.',
    duration: '3 Months',
    modules: [
      'Core Perimeter Security and Border defense topologies',
      'Firewall Architectures: Stateful vs Stateless Filters',
      'Introduction to Cisco ASA Configuration CLI',
      'Next-Generation Firewalls (NGFW) Deep Packet Inspection',
      'IPsec VPN Fundamentals, Encapsulating Security Payload (ESP)',
      'Site-to-Site VPN Tunnel Configurations and Key exchanges',
      'Intrusion Detection & Prevention Systems (IDS/IPS) rules',
      'AAA Security: TACACS+ and RADIUS service alignment',
      'Public Key Infrastructure (PKI), Certificates and trust circles',
      'Network Auditing with Netflow & SNMP Management Nodes',
      'Wireless Security Standards, WPA3 enterprise setups',
      'Vulnerability Assessments, Nessus Scans, Border Hardening'
    ]
  },
  '121': {
    name: 'Full-Stack Web App Engineering (6 Months)',
    description: 'Master modern full-stack engineering. Combine React, Express APIs, Prisma databases, and AWS deployment automation.',
    duration: '6 Months',
    modules: [
      'Designing robust full-stack Web Application Blueprints',
      'React UI Layout, component encapsulation & hooks state',
      'Global States with Redux Toolkit and React Context',
      'Form Validation Handlers: React Hook Form & ZodSchemas',
      'Constructing RESTful API controllers on Express Run',
      'ES Module Path Resolution and Server Script setups',
      'PostgreSQL Relational Storage, Prisma schemas & migrations',
      'Node Async Flow, Event Loops & CPU Profiling mechanics',
      'Redis Distributed In-Memory Caching and Session Stores',
      'Token Auth Handshaking, JWT Encryption & Access Refresh Hooks',
      'OAuth Integration, Third-Party Logins & Google Sign-In',
      'Real-Time Interactivity: WebSockets & Server Sent Events',
      'Microservice Architectures, Docker Clusters & Compose configs',
      'Continuous Integration / Deployment: GitHub Actions pipelines',
      'Web Security Auditing: CORS, XSS, CSRF, and WAF proxies',
      'Serverless Architecture, Edge computing & Vercel setups',
      'Unit & Integration Testing in JS: Vitest & Playwright tools',
      'Monitoring & Alert Engine, Sentry & Prometheus setups',
      'Database Performance tuning: indexes, explains & connections',
      'Cloud Run Ingress deployments, reverse proxy & Load Balancers'
    ]
  },
  '122': {
    name: 'Artificial Intelligence & Neural Networks (6 Months)',
    description: 'Deep-dive into machine learning pipelines, deep neural networks, computer vision techniques, and large language model tuning.',
    duration: '6 Months',
    modules: [
      'Python Mathematics Framework: Linear Algebra & Matrix math',
      'Data Cleaning, Vector Classifications with Numpy & Scikit',
      'Linear & Logistic Regression Classifiers from scratch',
      'Neural Networks Feedforward and Backprop Mathematics',
      'TensorFlow & PyTorch runtime setups and tensor calculus',
      'Convolutional Neural Networks (CNN) for Computer Vision',
      'Recurrent Neural Networks (RNN) and LSTMs for series data',
      'Transformer Architecture: Self-Attention layers & tokens',
      'Large Language Models (LLM) prompts, engineering & SDKs',
      'Generative AI: GANs, Diffusion models and Image creations',
      'Reinforcement Learning, Q-Tables & Decision Tree policies',
      'MLOps Pipelines: Deploying AI Models on standard server'
    ]
  },
  '123': {
    name: 'CCNP Enterprise Core Infrastructure (6 Months)',
    description: 'Advanced dual-stack enterprise design, OSPF/EIGRP route manipulation, BGP border routing, and software-defined WAN (SD-WAN).',
    duration: '6 Months',
    modules: [
      'Advanced Routing Theory, Enterprise Dual-Stack Networks',
      'EIGRP Router Operations, Metrics, and Equal Cost Load Balancer',
      'OSPFv2 and OSPFv3 Multi-Area Infrastructure and Area Types',
      'BGP System Administration, Path Vectoring, and Neighbors',
      'Route Redistribution, Filter Lists, and Prefix Maps',
      'Multiprotocol Label Switching (MPLS) VPN Architectures',
      'Enterprise Campus LAN Design, High Availability & EtherChannel',
      'Virtual Private LAN Service (VPLS) and DMVPN tunnels',
      'IPv6 Tunneling Mechanisms over IPv4 Networks',
      'Quality of Service (QoS) Queuing, Classification and Shaping',
      'Introduction to Software Defined Networking & Cisco SD-WAN',
      'Network Automation: Python RESTCONF/NETCONF, Ansible scripts'
    ]
  },
  '124': {
    name: 'Agile & Scrum Project Engineering (6 Weeks)',
    description: 'Professional Agile framework: Sprint plans, grooming product backlogs, burndown charts, and standard Jira issue tracking.',
    duration: '6 Weeks',
    modules: [
      'Agile Manifesto Core Tenets and Software values',
      'Scrum Framework Roles: Product Owner, Scrum Master, Developers',
      'Sprint Plannings, Point Estimations & Backlog Groomings',
      'Daily Standups, Retrospectives and Sprint Reviews',
      'Tracking Velocity, Burn Down Diagrams & Kanban pipelines',
      'Jira Software configurations, Issue types and EPIC workflows'
    ]
  },
  '125': {
    name: 'DevOps & CI/CD Release Pipeline (3 Months)',
    description: 'Build enterprise pipelines: Docker images, Kubernetes clusters, Prometheus monitors, Ansible scripts, and GitHub CI/CD automation.',
    duration: '3 Months',
    modules: [
      'DevOps Philosophy: Automated Collaboration & Blueprints',
      'Containerization: Dockerfile setups, container optimizations',
      'Continuous Integration: automated test pipelines with GitHub',
      'Continuous Deployment: Ansible provisioning & SSH nodes',
      'Infrastructure as Code (IaC) with Terraform templates',
      'Kubernetes (K8s) Cluster Architectures, Pods and Deployments',
      'K8s Services, Ingress Controllers and ConfigMaps storage',
      'Helm Charts and Kubernetes Package managers',
      'Prometheus Monitoring & Grafana Alert Visualizations',
      'Centralized Log Analysis: ElasticSearch, Logstash, Kibana',
      'Zero-Downtime Deployments: Blue-Green and Canary flows',
      'DevSecOps: Automated vulnerability scanning in builds'
    ]
  }
};

// Generates Cisco Academy style rich Markdown notes dynamically
function generateLessonContent(courseId: string, moduleIndex: number, moduleName: string, unitIndex: number, unitName: string): string {
  if (courseId === '110') {
    const key = `${moduleIndex}.${unitIndex}`;
    if (CYBER_NOTES[key]) {
      return CYBER_NOTES[key];
    }
  }
  const syllabus = COURSE_SYLLABI[courseId];
  const courseName = syllabus ? syllabus.name : 'IT Academy Course';
  
  return `# Cisco Learning Notes: ${courseName}
## ${moduleName}
### ${unitName}

---

### Phase 1: Core Curricular Objectives
Welcome to **Unit ${unitIndex}** of this course module. This segment is aligned directly with the official curriculum nodes and IT Academy practical industry standards.

#### Key Focus Pillars:
1. **Systematic Topology**: Comprehension of the architectural framework of this technology.
2. **Implementation Blueprints**: Working with active elements, logic pipelines, and system environments.
3. **Configuration & Mitigation**: Hardening structures, inspecting state registers, and writing execution blocks.

---

### Phase 2: Technical Breakdown & Study Notes

#### 1. Theoretical Foundation
This chapter covers the baseline definitions of **${moduleName}**. In high-performance computational environments, modern nodes communicate through layers of physical or virtual abstraction.

- **System Overhead**: Analyzing the performance profiles under heavy workloads.
- **Protocol Bounds**: Understanding why latency, bandwidth efficiency, and type constraints govern correct compilation.
- **Cisco Practical Mapping**: Applying real-world hardware models (such as Catalyst Switches, enterprise cloud instances, or secure VM sandboxes) to simulate this specific domain.

#### 2. Comprehensive Implementation Command & Syntax List
Below is the verified suite of parameters and operational interfaces required:

\`\`\`bash
# 1. Establish secure local credentials and setup parameters
init-system-environment --target-node="academic-vault" --verify=true

# 2. Check localized registers and memory alignment widths
inspect-kernel-registers --verbose --width=64bit

# 3. Compile assets or run target processes with diagnostic pipelines
run-academic-compilation-stream --config="./config/academic.json" --output="./dist"

# 4. Verify system safety credentials and network transport logs
audit-security-envelope --table="${courseName.toLowerCase()}" --status=active
\`\`\`

#### 3. Structured Concept Matrix
| Core Parameter | Execution Register | Diagnostic Range | Direct CISCO Equivalence |
| :--- | :--- | :--- | :--- |
| **System Host** | \`0xFEED101\` | [Localhost:3000 -> Outflow] | Core Gateway Switch |
| **Data Payload** | \`0xABCD201\` | [JSON Structures / Binary Streams] | VLAN Payload Packet |
| **Buffer Cache** | \`0xEEEE301\` | [LRU Registers] | Enterprise Routing Buffer |
| **Auth Crypt** | \`0xFAAA401\` | [TLS Handshakes / Obfuscated Pins] | TACACS+ Access Ledger |

---

### Phase 3: Practical Lab Scenario & Hands-on Checklist

To cement your understanding of **${moduleName}**, complete the following simulation exercises:

1. **Environmental Bootstrap**: Create a dedicated workspace directory and populate your variable profile containing target connection points.
2. **Logic Validation**: Check state outcomes using standard log parsing systems. Filter lines by scanning for warning parameters.
3. **Hardening Audit**: Apply the secure rules matrix so that unauthorized client commands receive a clear rejection block.

> **Cisco Professional Tip**: In real-world enterprise deployments, always isolate testing profiles from operational layers. Verify that credentials do not exist in code configurations, and are instead loaded dynamic-wise during secure boot-stages.

---

### Phase 4: Module Knowledge Check & Assessment Review

#### Self-Test Questions:
- *Question 1*: How does the underlying node handle asynchronous concurrency without leaking address registers?
- *Question 2*: Explain the workflow of validating digital hashes in this security blueprint.
- *Question 3*: Which standard parameters or ports should remain blocked under default routing protocols?

**Answer References available via the Academy Guide and central ICT past paper library.**
`;
}

const CYBER_LESSON_TITLES: Record<string, string> = {
  '1.1': 'Introduction to Cybersecurity & Digital Connectivity',
  '1.2': 'The Cybersecurity Ecosystem & Defensive Layers',
  '1.3': 'Security Objectives (The CIA Triad) & Attacker Mindset',
  '2.1': 'Digital Dependency & Modern Society Vulnerabilities',
  '2.2': 'The Value of Data, Breaches vs. Losses, and Information Security',
  '2.3': 'Threat Vectors: Malware Types & Social Engineering Psychology',
  '3.1': 'Network Communication (TCP/IP, Routing & Handshakes)',
  '3.2': 'The Domain Name System (DNS Resolution & Attack Surface)',
  '3.3': 'Insecure Borders: HTTP vs. HTTPS, Session Sockets & Injection Risks',
  '4.1': 'Real System Flow: Application Layers & Transaction Checks',
  '4.2': 'System Weak Points & Testing Methodologies',
  '4.3': 'Trace Logic, Edge Cases, and Root Cause Failure Analysis',
  '5.1': 'Continuous Assessment Prep & SQL Injection Case Auditing',
  '5.2': 'Session Security (Public Wi-Fi & XSS Search Bar Vulnerabilities)',
  '5.3': 'Insecure File Uploads & Server-Level Mitigations',
  '6.1': 'Final Examination & Case Studies (Structure & Key Instructions)',
  '6.2': 'Case Study 1 to 5: Practical Cyber Scenario Assessments',
  '6.3': 'Hybrid AI + Academic Board Final Certification Review',
};

// Generates the comprehensive Course array with exact module counts, durations, and prices
export function generateAllCourses(): Course[] {
  const result: Course[] = [];

  // Exact mappings for course ids
  const overrideConfig: Record<string, { duration: string; price: string; targetModulesCount: number }> = {
    // 6 Weeks (Self-Paced): ZK 200
    '102': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 5 },
    '110': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '112': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '113': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '115': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '116': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '119': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },
    '124': { duration: '6 Weeks (Self-Paced)', price: 'ZK 200', targetModulesCount: 6 },

    // 3 Months: ZK 550
    '101': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 13 },
    '103': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 13 },
    '104': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 13 },
    '111': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 12 },
    '114': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 12 },
    '118': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 12 },
    '120': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 12 },
    '125': { duration: '3 Months', price: 'ZK 550', targetModulesCount: 12 },

    // 6 Months: ZK 1,000
    '109': { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 },
    '117': { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 },
    '121': { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 },
    '122': { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 },
    '123': { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 },
  };

  for (const [id, syllabus] of Object.entries(COURSE_SYLLABI)) {
    const config = overrideConfig[id] || { duration: '6 Months', price: 'ZK 1,000', targetModulesCount: 20 };
    const modulesArray: Module[] = [];
    
    // Create an array of module titles, dynamic-padding up to the required target count
    const moduleTitles = [...syllabus.modules];
    while (moduleTitles.length < config.targetModulesCount) {
      const currentLen = moduleTitles.length + 1;
      moduleTitles.push(`Advanced Cisco Network Engineering & Systems - Part ${currentLen}`);
    }
    const finalModulesList = moduleTitles.slice(0, config.targetModulesCount);

    finalModulesList.forEach((moduleTitle, mIdx) => {
      const modNum = mIdx + 1;
      const modId = `mod-${id}-${modNum.toString().padStart(3, '0')}`;
      
      let lessonsArray: Lesson[];
      if (id === '110') {
        lessonsArray = [
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-1`,
            title: `Unit ${modNum}.1: ${CYBER_LESSON_TITLES[`${modNum}.1`] || 'Introduction'}`,
            content: generateLessonContent(id, modNum, moduleTitle, 1, CYBER_LESSON_TITLES[`${modNum}.1`] || 'Introduction'),
            order: 1
          },
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-2`,
            title: `Unit ${modNum}.2: ${CYBER_LESSON_TITLES[`${modNum}.2`] || 'Advanced Topic'}`,
            content: generateLessonContent(id, modNum, moduleTitle, 2, CYBER_LESSON_TITLES[`${modNum}.2`] || 'Advanced Topic'),
            order: 2
          },
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-3`,
            title: `Unit ${modNum}.3: ${CYBER_LESSON_TITLES[`${modNum}.3`] || 'Practical Lab Check'}`,
            content: generateLessonContent(id, modNum, moduleTitle, 3, CYBER_LESSON_TITLES[`${modNum}.3`] || 'Practical Lab Check'),
            order: 3
          }
        ];
      } else {
        lessonsArray = [
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-1`,
            title: `Unit ${modNum}.1: Core Theoretical Foundations of ${moduleTitle}`,
            content: generateLessonContent(id, modNum, moduleTitle, 1, `Unit ${modNum}.1: Core Theoretical Foundations`),
            order: 1
          },
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-2`,
            title: `Unit ${modNum}.2: Advanced Configuration & Practical CLI commands`,
            content: generateLessonContent(id, modNum, moduleTitle, 2, `Unit ${modNum}.2: Advanced Configuration & Practical CLI`),
            order: 2
          },
          {
            id: `les-${id}-${modNum.toString().padStart(3, '0')}-3`,
            title: `Unit ${modNum}.3: Lab Simulation & Cisco Knowledge Check`,
            content: generateLessonContent(id, modNum, moduleTitle, 3, `Unit ${modNum}.3: Lab Simulation & Cisco Review Notes`),
            order: 3
          }
        ];
      }

      modulesArray.push({
        id: modId,
        title: `Module ${modNum}: ${moduleTitle}`,
        order: modNum,
        lessons: lessonsArray
      });
    });

    result.push({
      id: id,
      name: syllabus.name,
      description: syllabus.description,
      duration: config.duration,
      price: config.price,
      modules: modulesArray,
      programNotes: config.duration.includes('6 Weeks') ? [
        {
          id: `note-${id}-core`,
          title: `6-Weeks ${syllabus.name} Core Blueprint`,
          url: 'https://en.wikipedia.org/wiki/Computer_network'
        }
      ] : config.duration === '3 Months' ? [
        {
          id: `note-${id}-core`,
          title: `3-Months ${syllabus.name} Academic Roadmap`,
          url: 'https://en.wikipedia.org/wiki/Information_technology'
        }
      ] : [
        {
          id: `note-${id}-core`,
          title: `6-Months ${syllabus.name} Professional Almanac`,
          url: 'https://en.wikipedia.org/wiki/Computer_security'
        }
      ]
    });
  }

  return result;
}

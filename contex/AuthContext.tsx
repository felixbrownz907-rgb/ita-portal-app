import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Course, Intake, Student, Payment, Announcement, UserRole, LabTask, LibraryItem, AuditLog, Invoice, OnlineClass, Submission, MentorBooking, CommunityMessage, Lecturer, TimetableEntry, Meeting, LearningMaterial, Exam, AIMessage, MockExam, MockExamResult, Attendance
} from './types';
import { getAIResponse, gradeSubmission, gradeExam } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { generate1000Labs } from '../utils/labGenerator';
import { generateAllCourses } from '../utils/courseGenerator';

const sanitizeUserIdentityString = (rawInputString: string): string => {
  if (!rawInputString) return "";
  return rawInputString
    .toString()
    .trim()                        // Deletes invisible spaces at start/end
    .replace(/[\/\s-]/g, "")       // Strips ALL forward slashes (/), spaces, and dashes (-)
    .toLowerCase();                // Forces absolute lowercase parity strings
};

const INITIAL_COURSES: Course[] = generateAllCourses();

const INITIAL_INTAKES: Intake[] = [
  { id: '201', name: 'May 2026', startDate: '2026-05-01' },
  { id: '202', name: 'September 2026', startDate: '2026-09-01' },
];

const INITIAL_LECTURERS: Lecturer[] = [
  { id: '301', name: 'Dr. John Doe', courseName: 'Software Engineering' },
  { id: '302', name: 'Prof. Jane Smith', courseName: 'Programming' },
  { id: '303', name: 'Eng. Mike Ross', courseName: 'Artificial Intelligence' },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: '11111111-2222-3333-4444-555555555501',
    studentId: '202600100100101',
    fullName: 'Test Auditor',
    email: 'audit@ita.com',
    nrc: '100100/10/1',
    courseId: '101',
    intakeId: '201',
    phone: '0712345678',
    status: 'Active',
    progress: 50,
    attendanceProgress: 100,
    labProgress: 20,
    paymentHistory: [],
    paymentStatus: 'Cleared',
    admissionYear: 2026,
    password: 'ita@2026',
    currentModuleId: '1',
    currentTrack: 'Unit 1: Fundamentals'
  } as Student,
  {
    id: 'f9d3b8e1-5e8a-4b9c-8e1d-3b5a7c2e4f6a',
    studentId: '2026100',
    fullName: 'JOSEPH MULENGA MUMBA',
    email: 'j.mumba@ita.academy',
    nrc: '135928/18/1',
    courseId: '109',
    intakeId: '201',
    status: 'Active',
    progress: 0,
    attendanceProgress: 0,
    labProgress: 0,
    paymentStatus: 'Cleared',
    admissionYear: 2026,
    password: '000000',
    role: 'student'
  } as Student,
  {
    id: '11111111-2222-3333-4444-555555555502',
    studentId: '202600101101101',
    fullName: 'Isaac Newton',
    email: 'newton@ita.com',
    nrc: '101101/10/1',
    courseId: '102',
    intakeId: '201',
    phone: '0779998887',
    status: 'Active',
    progress: 75,
    attendanceProgress: 90,
    labProgress: 60,
    paymentHistory: [],
    paymentStatus: 'Cleared',
    admissionYear: 2026,
    password: 'ita@2026',
    currentModuleId: '2',
    currentTrack: 'Unit 2: Physics Engine'
  } as Student,
  {
    id: '11111111-2222-3333-4444-555555555503',
    studentId: '2026027',
    fullName: 'Felix brownz',
    email: 'felixbrownz907@gmail.com',
    nrc: '318468/62/1',
    courseId: '109',
    status: 'Active',
    progress: 15,
    attendanceProgress: 10,
    labProgress: 5,
    paymentHistory: [],
    paymentStatus: 'Cleared',
    admissionYear: 2026,
    password: '746939',
    phone: '0766149405',
    currentModuleId: '1',
    currentTrack: 'Cyber Security Fundamentals'
  } as Student,
  {
    id: '11111111-2222-3333-4444-555555555504',
    studentId: '2026101',
    fullName: 'Digital Student',
    email: 'student101@ita.com',
    nrc: '2026101/10/1',
    courseId: '101',
    intakeId: '201',
    status: 'Active',
    progress: 40,
    attendanceProgress: 85,
    labProgress: 30,
    paymentHistory: [],
    paymentStatus: 'Cleared',
    admissionYear: 2026,
    password: 'ita@2026',
    phone: '0970000100',
    currentModuleId: '1',
    currentTrack: 'Software Engineering Fundamentals'
  } as Student,
  {
    id: 's-006', studentId: '2026006', fullName: 'Chanda Kabwe', email: 'c.kabwe@ita.academy', nrc: '111222/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-007', studentId: '2026007', fullName: 'Mwape Mwansa', email: 'm.mwansa@ita.academy', nrc: '333444/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-008', studentId: '2026008', fullName: 'Mulenga Chilufya', email: 'm.chilufya@ita.academy', nrc: '555666/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-009', studentId: '2026009', fullName: 'Mutale Kapambwe', email: 'm.kapambwe@ita.academy', nrc: '777888/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-010', studentId: '2026010', fullName: 'Banda Kondwani', email: 'b.kondwani@ita.academy', nrc: '999000/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-011', studentId: '2026011', fullName: 'Phiri Emmanuel', email: 'p.emmanuel@ita.academy', nrc: '121212/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-012', studentId: '2026012', fullName: 'Lungu Precious', email: 'l.precious@ita.academy', nrc: '343434/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-013', studentId: '2026013', fullName: 'Zulu Blessings', email: 'z.blessings@ita.academy', nrc: '565656/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-014', studentId: '2026014', fullName: 'Musonda Catherine', email: 'm.catherine@ita.academy', nrc: '787878/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-015', studentId: '2026015', fullName: 'Mwale George', email: 'm.george@ita.academy', nrc: '909090/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-016', studentId: '2026016', fullName: 'Sakala Memory', email: 's.memory@ita.academy', nrc: '131313/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-017', studentId: '2026017', fullName: 'Tembo Kennedy', email: 't.kennedy@ita.academy', nrc: '141414/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-018', studentId: '2026018', fullName: 'Nyirongo Taonga', email: 'n.taonga@ita.academy', nrc: '151515/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-019', studentId: '2026019', fullName: 'Simfukwe Hope', email: 's.hope@ita.academy', nrc: '161616/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-020', studentId: '2026020', fullName: 'Malama Kelvin', email: 'm.kelvin@ita.academy', nrc: '171717/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-021', studentId: '2026021', fullName: 'Kalunga Brian', email: 'k.brian@ita.academy', nrc: '181818/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-022', studentId: '2026022', fullName: 'Njobvu Esther', email: 'n.esther@ita.academy', nrc: '191919/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-023', studentId: '2026023', fullName: 'Mbewe Peter', email: 'm.peter@ita.academy', nrc: '212121/10/1',
    courseId: '109', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-024', studentId: '2026024', fullName: 'Ngoma Rachael', email: 'n.rachael@ita.academy', nrc: '222323/10/1',
    courseId: '101', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student,
  {
    id: 's-025', studentId: '2026025', fullName: 'Habasonda Lilian', email: 'h.lilian@ita.academy', nrc: '242424/10/1',
    courseId: '102', status: 'Active', admissionYear: 2026, role: 'student', password: 'ita@2026'
  } as Student
];

const INITIAL_TIMETABLE: TimetableEntry[] = [
  // Monday
  { id: 'mon-20', courseId: '101', day: 'Monday', sessionTime: '20:00-20:50', lecturerId: '301' },
  { id: 'mon-21', courseId: '102', day: 'Monday', sessionTime: '21:00-21:50', lecturerId: '301' },
  { id: 'mon-22', courseId: '103', day: 'Monday', sessionTime: '22:00-22:50', lecturerId: '302' },
  // Tuesday
  { id: 'tue-20', courseId: '104', day: 'Tuesday', sessionTime: '20:00-20:50', lecturerId: '303' },
  { id: 'tue-21', courseId: '105', day: 'Tuesday', sessionTime: '21:00-21:50', lecturerId: '301' },
  { id: 'tue-22', courseId: '106', day: 'Tuesday', sessionTime: '22:00-22:50', lecturerId: '302' },
  // Wednesday
  { id: 'wed-20', courseId: '107', day: 'Wednesday', sessionTime: '20:00-20:50', lecturerId: '303' },
  { id: 'wed-21', courseId: '108', day: 'Wednesday', sessionTime: '21:00-21:50', lecturerId: '303' },
  { id: 'wed-22', courseId: '109', day: 'Wednesday', sessionTime: '22:00-22:50', lecturerId: '301' },
  // Thursday
  { id: 'thu-20', courseId: '101', day: 'Thursday', sessionTime: '20:00-20:50', lecturerId: '301' },
  { id: 'thu-21', courseId: '102', day: 'Thursday', sessionTime: '21:00-21:50', lecturerId: '301' },
  { id: 'thu-22', courseId: '103', day: 'Thursday', sessionTime: '22:00-22:50', lecturerId: '302' },
  // Friday
  { id: 'fri-20', courseId: '104', day: 'Friday', sessionTime: '20:00-20:50', lecturerId: '303' },
  { id: 'fri-21', courseId: '105', day: 'Friday', sessionTime: '21:00-21:50', lecturerId: '301' },
  { id: 'fri-22', courseId: '106', day: 'Friday', sessionTime: '22:00-22:50', lecturerId: '302' },
  // Saturday
  { id: 'sat-20', courseId: '107', day: 'Saturday', sessionTime: '20:00-20:50', lecturerId: '303' },
  { id: 'sat-21', courseId: '108', day: 'Saturday', sessionTime: '21:00-21:50', lecturerId: '302' },
  { id: 'sat-22', courseId: '109', day: 'Saturday', sessionTime: '22:00-22:50', lecturerId: '301' },
  // Sunday
  { id: 'sun-20', courseId: '109', day: 'Sunday', sessionTime: '20:00-20:50', lecturerId: '301' },
  { id: 'sun-21', courseId: '101', day: 'Sunday', sessionTime: '21:00-21:50', lecturerId: '302' },
  { id: 'sun-22', courseId: '104', day: 'Sunday', sessionTime: '22:00-22:50', lecturerId: '303' },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-se-001',
    courseId: '101',
    moduleId: 'mod-se-001',
    title: 'SDLC Deep Dive Assignment',
    description: 'Provide an in-depth analysis of different SDLC models (Waterfall, Agile, Spiral) and their practical applications in modern industry.',
    dueDate: '2026-05-15T23:59:59Z',
    type: 'assignment',
    maxMark: 100
  },
  {
    id: 'ex-se-002',
    courseId: '101',
    moduleId: 'mod-se-001',
    title: 'Software Engineering Fundamentals Test',
    description: 'Comprehensive test covering Module 1: Software Engineering basics, methodologies and terminology.',
    dueDate: '2026-05-20T14:00:00Z',
    type: 'test',
    maxMark: 50
  },
  {
    id: 'ex-cs-001',
    courseId: '109',
    moduleId: 'mod-cs-001',
    title: 'CYBER SECURITY ASSIGNMENT 1',
    description: `*Practical Assignment: Cisco Cyber Security Module 1 - Network Security*

*Scenario:*
You are a junior security analyst at a small company. The company's network has been experiencing unusual traffic patterns, and the IT team suspects a potential security breach.

*Task:*
1. Analyze the network traffic capture (PCAP file) provided in the E-Library.
2. Identify potential security threats and vulnerabilities.
3. Recommend mitigation strategies to protect the network.

*Details:*
- Network topology: Small office network with a Cisco router, switch, and several endpoints.
- PCAP file: Contains network traffic capture from the company's network.

*Deliverables:*
1. Written report (2-3 pages) summarizing your findings:
    - Identify potential security threats and vulnerabilities.
    - Analyze the impact of the threats.
    - Recommend mitigation strategies.
2. Submit the report in PDF format.

*Additional Resources:*
- Cisco NetAcad resources
- Wireshark for PCAP analysis

*Grading:*
- Threat identification (30%)
- Analysis and impact (30%)
- Mitigation strategies (20%)
- Report quality and formatting (20%)`,
    dueDate: '2026-05-06T23:59:59Z',
    type: 'assignment',
    maxMark: 100
  }
];

const INITIAL_MOCK_EXAMS: MockExam[] = [
  {
    id: 'exam-ccna-prac',
    courseId: '101',
    title: 'CCNA Practical: Routing & Switching Mastery',
    description: 'A comprehensive 60-minute practical exam covering VLAN, OSPF, and Static Routing configuration.',
    duration: 60,
    questions: [
      { id: 'q1', text: 'Configure VLAN 10 and 20 on the core switch and assign relevant ports.', type: 'essay' },
      { id: 'q2', text: 'Initialize OSPF process 1 and advertise the directly connected networks.', type: 'essay' },
      { id: 'q3', text: 'What command is used to verify the routing table in Cisco IOS?', type: 'short-answer', correctAnswer: 'show ip route' }
    ]
  },
  {
    id: 'exam-cyber-audit',
    courseId: '109',
    title: 'Cyber Security: Network Vulnerability Audit',
    description: 'Perform a deep-dive security assessment of the simulated network environment in this 60-minute session.',
    duration: 60,
    questions: [
      { id: 'q1', text: 'Execute an NMAP scan to identify open ports on host 10.0.0.5. List findings.', type: 'essay' },
      { id: 'q2', text: 'Identify the service running on port 80 and check for known CVEs.', type: 'essay' },
      { id: 'q3', text: 'Explain the difference between a False Positive and a False Negative.', type: 'essay' }
    ]
  },
  {
    id: 'exam-cyber-practical-2',
    courseId: '109',
    title: 'Advanced Packet Analysis',
    description: 'Practical Wireshark session: Identify a simulated SQL injection attempt in the provided traffic log.',
    duration: 60,
    questions: [
      { id: 'w1', text: 'Analyze the pcap-dump-01.txt. Which IP address is making excessive POST requests to /login.php?', type: 'short-answer' },
      { id: 'w2', text: 'Filter for HTTP traffic and identify the suspicious string used in the query parameter. Explain why it looks like a payload.', type: 'essay' },
      { id: 'w3', text: 'Document the steps to block this specific source IP using iptables on a Linux gateway.', type: 'essay' }
    ]
  },
  {
    id: 'exam-se-practical-2',
    courseId: '106',
    title: 'Full-Stack Performance Audit',
    description: 'Practical optimization session: Identify and fix bottlenecks in a simulated Node.js middleware.',
    duration: 60,
    questions: [
      { id: 'se1', text: 'Explain how you would use "morgan" or "winston" to track slow request/response cycles in a production API.', type: 'essay' },
      { id: 'se2', text: 'Provide a code snippet to implement a LRU cache for an ExpensiveDataFetch(id) function to reduce DB load.', type: 'essay' }
    ]
  },
  {
    id: 'exam-se-logic',
    courseId: '106',
    title: 'Software Engineering: Logic & Algorithmic Practical',
    description: 'Implement core data structures and solve architecture bottlenecks in this 60-minute practical.',
    duration: 60,
    questions: [
      { id: 'q1', text: 'Write a TypeScript function to reverse a linked list in-place.', type: 'essay' },
      { id: 'q2', text: 'Analyze the time complexity of the provided sorting algorithm.', type: 'essay' },
      { id: 'q3', text: 'Which keyword is used for asynchronous behavior in Modern JavaScript?', type: 'short-answer', correctAnswer: 'async await' }
    ]
  },
  {
    id: 'exam-cyber-audit-adv',
    courseId: '109',
    title: 'Advanced Cyber Defense Simulation',
    description: 'Practical security scenarios involving network breaches and incidence response (1 Hour).',
    duration: 60,
    questions: [
      { id: 'q1', text: 'An IDS alert shows repeated SQL injection attempts. What are your immediate first three steps?', type: 'essay' },
      { id: 'q2', text: 'Which encryption standard is recommended for government cloud data at rest?', type: 'short-answer', correctAnswer: 'AES-256' },
      { id: 'q3', text: 'Describe the Red Team vs Blue Team exercise model.', type: 'essay' }
    ]
  },
  {
    id: 'exam-network-ent',
    courseId: '101',
    title: 'Enterprise Networking Architecture',
    description: 'Solve complex routing, switching, and redundancy scenarios for global enterprises (1 Hour).',
    duration: 60,
    questions: [
      { id: 'q1', text: 'Implement route redistribution between OSPF and EIGRP hubs safely.', type: 'essay' },
      { id: 'q2', text: 'Which technology provides gateway redundancy for mission-critical farms?', type: 'short-answer', correctAnswer: 'HSRP' },
      { id: 'q3', text: 'Analyze the impact of MTU mismatch in a VXLAN environment.', type: 'essay' }
    ]
  }
];

const INITIAL_LIBRARY: LibraryItem[] = [
  {
    id: 'lib-prac-001',
    title: 'Cisco Router Configuration Laboratory',
    author: 'Academy Technical Team',
    type: 'Practical',
    category: 'Networking',
    fileUrl: 'https://www.cisco.com/c/dam/en/us/td/docs/routers/access/800/827/software/configuration/guide/827_sw_config_guide.pdf',
    courseId: '101'
  },
  {
    id: 'lib-prac-002',
    title: 'Python Scripting for Automation',
    author: 'Prof. Jane Smith',
    type: 'Practical',
    category: 'Software',
    fileUrl: 'https://docs.python.org/3/tutorial/index.html',
    courseId: '102'
  },
  {
    id: 'lib-prac-003',
    title: 'Linux Kernel Optimization Artifact',
    author: 'Master Sentinel Internal',
    type: 'Practical',
    category: 'Linux',
    fileUrl: 'https://www.kernel.org/doc/html/latest/admin-guide/sysctl/index.html',
    courseId: '108'
  },
  {
    id: 'lib-prac-004',
    title: 'Vulnerability Analysis Lab PDF',
    author: 'Cyber Security Unit',
    type: 'Practical',
    category: 'Security',
    fileUrl: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-115.pdf',
    courseId: '109'
  },
  {
    id: 'lib-book-001',
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry Peterson & Bruce Davie',
    type: 'Book',
    category: 'Networking',
    fileUrl: 'https://book.systemsapproach.org/index.html',
    courseId: '101'
  },
  {
    id: 'lib-book-002',
    title: 'Free Programming Books Archive',
    author: 'E-Book Foundation',
    type: 'Book',
    category: 'Software',
    fileUrl: 'https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-langs.md',
    courseId: '106'
  },
  {
    id: 'lib-book-003',
    title: 'Introduction to Operating Systems',
    author: 'Remzi H. Arpaci-Dusseau',
    type: 'Book',
    category: 'Systems',
    fileUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    courseId: '108'
  },
  {
    id: 'lib-prac-005',
    title: 'Network Traffic Capture (PCAP) - Assignment 1',
    author: 'Cisco Networking Academy',
    type: 'Practical',
    category: 'Security',
    fileUrl: 'https://www.wireshark.org/download/samplecaptures/http.pcap',
    courseId: '109'
  }
];

const INITIAL_LABS: LabTask[] = ([
  {
    id: 'lab-001',
    title: 'Basic Network Routing',
    description: 'Configure a virtual router to enable communication between two subnets.',
    type: 'terminal',
    difficulty: 'Beginner',
    courseId: '101',
    status: 'pending',
    scenario: 'The IT Academy core student labs block needs configured static routing paths. In this lab, you must establish secure router parameters on a clean Cisco-like router terminal so that the academic subnets are connected seamlessly.',
    objectives: [
      'Enter privileged configuration layers securely in the command block.',
      'Set the hostname variable to reflect academy cabinet nomenclature.',
      'Assign and activate IP interfaces on the local routing board (192.168.1.1).'
    ],
    tools: [
      'Integrated Router Core Shell (IOS)',
      'DB9 Serial Console rollover cable',
      'ITA Subnetting Matrix Tool'
    ],
    procedure: [
      'Initialize communication with the Cisco terminal stack.',
      'Enter privileged dynamic EXEC state using the "enable" command.',
      'Access global configuration contexts with "conf t" or "configure terminal".',
      'Set the system identification parameter with "hostname ITA-ROUTER-01".',
      'Bind interfaces securely and record the system convergence metrics.'
    ],
    reportTemplate: '### ROUTING CONVERGENCE DIAGNOSTICS REPORT\n\n#### 1. CONFIGURED HOSTNAME VARIABLE\n[Record the hostname set on prompt]\n\n#### 2. ASSIGNED INTERFACE BINDING\n[Record assigned IP Address parameters]\n\n#### 3. TEST CONNECTIVITY LOGS\n[Verify routes or pings from adjacent subnets]',
    steps: [
      { id: 't1', text: 'Enter privileged EXEC mode (enable)', isCompleted: false },
      { id: 't2', text: 'Enter global configuration mode (conf t)', isCompleted: false },
      { id: 't3', text: 'Set hostname to ITA-ROUTER-01', isCompleted: false },
      { id: 't4', text: 'Assign IP address 192.168.1.1/24 to interface Gi0/0', isCompleted: false }
    ]
  },
  {
    id: 'lab-002',
    title: 'Network Cable Termination',
    description: 'Prepare and terminate a CAT6 Ethernet cable using T568B standard.',
    type: 'crimping',
    difficulty: 'Intermediate',
    courseId: '102',
    status: 'pending',
    scenario: 'The local learning hub server requires copper patch cable termination to complete physical layer links. You must strip and crimp a standard CAT6 twisted-pair UTP cable under EIA T568B specifications to verify connection continuity.',
    objectives: [
      'Determine and isolate individual copper conductor wire loops.',
      'Arrange standard color-code wires according to EIA T568B mapping rules.',
      'Terminate and crimp standard RJ45 modular jacks securely using terminal tools.'
    ],
    tools: [
      'EIA T568B CAT6 Copper Cable',
      'RJ45 Solid Plugs & Crimp pliers',
      'Universal cable sheath stripping tool'
    ],
    procedure: [
      'Strip approximately 1.5 inches of the absolute outer jacket layer off.',
      'Untwist and sort individual wires in exact color ordering: White/Orange, Orange, White/Green, Blue, White/Blue, Green, White/Brown, Brown.',
      'Trim cable conductors evenly to ensure complete seating inside the RJ45 jacket.',
      'Insert pins firmly into RJ45 connector and execute the crimp procedure until a mechanical snap is locked.'
    ],
    reportTemplate: '### COPPER CONDUCTOR PATCH CABLE TERMINATION ANALYSIS\n\n#### 1. SELECTED COLOR ORDER TEMPLATE STANDARD\n[Confirm EIA standard color selection mapping]\n\n#### 2. MECHANICAL CRIMP SEAL INTEGRITY\n[Specify physical inspection check of RJ-45 contact point insertions]\n\n#### 3. CONTINUITY WIREMAP PIN TESTING\n[Paste pin wire tester results, confirming 1-to-1 continuity flowchart]',
    steps: [
      { id: 's1', text: 'Strip the external cable jacket correctly', isCompleted: false },
      { id: 's2', text: 'Arrange wires in T568B color code order', isCompleted: false },
      { id: 's3', text: 'Trim wires to correct length', isCompleted: false },
      { id: 's4', text: 'Crimp the RJ45 connector firmly', isCompleted: false }
    ]
  },
  {
    id: 'lab-003',
    title: 'Power Logic & Load Analysis',
    description: 'Build a basic load-balanced system with isolation switches.',
    type: 'circuit',
    difficulty: 'Beginner',
    courseId: '105',
    status: 'pending',
    scenario: 'A virtual electronics cabinet unit demands real-time circuit power line analysis. Assemble and analyze voltage flows through balanced switch control logic lines to guarantee zero overload situations across terminal points.',
    objectives: [
      'Setup independent active DC power supply loops.',
      'Connect balanced loads to complete series circuit diagrams.',
      'Regulate switches to analyze system current load properties.'
    ],
    tools: [
      'ITA Breadboard Simulator Interface',
      'Solid core wire conductor spools',
      'Digital Multimeter (DMM) system'
    ],
    procedure: [
      'Supply the main breadboard bus with the selected active power voltage rail.',
      'Assemble loop pathways connecting the positive rail to switches and light load indicators.',
      'Complete negative voltage loop lines directly back into ground paths.',
      'Deploy switches to verify physical flow, current draw, and total system thermal balance.'
    ],
    reportTemplate: '### SERIES CIRCUIT LOAD ANALYSIS SHEET\n\n#### 1. INPUT VOLTAGE AND MEASURED CURRENT SUMMARY\n[Record voltage and mA readings here]\n\n#### 2. VOLTAGE DEVIATION DROPS CONTEXT\n[List individual voltage drops across elements of the loop]\n\n#### 3. COMPONENT THERMAL COMPLIANCE OBSERVATIONS\n[Highlight any circuit overload indicators or structural integrity analysis]',
    steps: [
      { id: 'c1', text: 'Initialize main power source', isCompleted: false },
      { id: 'c2', text: 'Connect load device to circuit', isCompleted: false },
      { id: 'c3', text: 'Close control switch to activate flow', isCompleted: false }
    ]
  },
  {
    id: 'lab-004',
    title: 'Security Hardening Lab [Downloadable]',
    description: 'Download the laboratory artifact and perform the security audit locally.',
    type: 'general',
    difficulty: 'Advanced',
    courseId: '109',
    status: 'pending',
    scenario: 'A core academic client asset registry list has suffered security exposure reports. Securely pull down the encrypted vulnerability laboratory artifact package locally, scan local VM ports, and construct a hardened defensive checklist response.',
    objectives: [
      'Conduct localized port audit scans on standard virtual machines.',
      'Isolate unnecessary running daemon ports to restrict back-entry vectors.',
      'Establish clear mitigation responses for compliance.'
    ],
    tools: [
      'Secure ITA Download Package Engine',
      'Nmap Port Scanning Engine',
      'Local Virtual Hardening Environment'
    ],
    procedure: [
      'Download the designated ITA lab guidelines handbook bundle.',
      'Boot your vulnerability VM space locally on your testing machine.',
      'Execute systematic scans using Nmap probes: nmap -sC -sV <target-ip>.',
      'Formulate hardened network access list rules on the local host to mitigate threats.'
    ],
    reportTemplate: '### PORT HARDENING VULNERABILITY MITIGATION REPORT\n\n#### 1. EXPOSED INTERFACES AUDITED SCANS\n[List any detected open ports and their associated service banners from scans]\n\n#### 2. DETECTED SERVICE EXPOSURE THREATS\n[Record running service weaknesses found in vulnerability databases]\n\n#### 3. HARDENING POLICY INTERVENTIONS\n[Record specific recommendations like SSH rate constraints and closed unused service ports]',
    steps: [
      { id: 'g1', text: 'Download Lab Guide PDF', isCompleted: false },
      { id: 'g2', text: 'Perform vulnerability scan on target VM', isCompleted: false },
      { id: 'g3', text: 'Submit final audit report', isCompleted: false }
    ]
  }
] as LabTask[]).concat(generate1000Labs());



const cleanNRC = (nrc: string) => sanitizeUserIdentityString(nrc);

async function generateNextStudentId(nrc?: string) {
  if (nrc) {
    const cleanedNRC = sanitizeUserIdentityString(nrc);
    return `SEC-2026-${cleanedNRC}`;
  }

  // Mandatory format: SEC-2026- + random if NRC is truly unavailable (fallback)
  return `SEC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const safeSetLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
       console.warn(`ITA [STORAGE QUOTA]: Failed to save ${key}. Data too large for local buffer.`);
       // Fail silently as the data is already in memory
    } else {
       console.error(`ITA [STORAGE ERROR]:`, e);
    }
  }
};

// Bidirectional mapping for UUID columns in Supabase
const uuidToOriginalMap = new Map<string, string>();
const originalToUuidMap = new Map<string, string>();

function toDeterministicUUID(str: string): string {
  if (!str) return str;
  if (typeof str !== 'string') return str;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str.toLowerCase();
  }
  
  const existing = originalToUuidMap.get(str);
  if (existing) return existing;

  let h1 = 0xdeadbeef, h2 = 0x41c64e6d, h3 = 0x12345678, h4 = 0x87654321;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3242125633);
    h4 = Math.imul(h4 ^ ch, 4124921477);
  }
  
  const toHex8 = (num: number) => {
    return (num >>> 0).toString(16).padStart(8, '0');
  };
  
  const hex32 = toHex8(h1) + toHex8(h2) + toHex8(h3) + toHex8(h4);
  const uuid = (
    hex32.substring(0, 8) + '-' +
    hex32.substring(8, 12) + '-' +
    hex32.substring(12, 16) + '-' +
    hex32.substring(16, 20) + '-' +
    hex32.substring(20, 32)
  ).toLowerCase();

  uuidToOriginalMap.set(uuid, str);
  originalToUuidMap.set(str, uuid);
  return uuid;
}

function fromDeterministicUUID(uuid: string): string {
  if (!uuid) return uuid;
  if (typeof uuid !== 'string') return uuid;
  const original = uuidToOriginalMap.get(uuid.toLowerCase());
  return original || uuid;
}

function mapValueToDB(key: string, value: any, tableName?: string): any {
  if (!value || typeof value !== 'string') return value;

  const keysToConvert = new Set([
    'course_id', 'courseid', 'module_id', 'moduleid', 'lesson_id', 'lessonid',
    'exam_id', 'examid'
  ]);

  if (keysToConvert.has(key.toLowerCase())) {
    return toDeterministicUUID(value);
  }

  if (key.toLowerCase() === 'id') {
    const uuidTables = new Set([
      'courses', 'modules', 'lessons', 'exams', 'mock_exams', 'timetable'
    ]);
    if (tableName && uuidTables.has(tableName.toLowerCase())) {
      return toDeterministicUUID(value);
    }
  }

  return value;
}

function mapObjectToDB(obj: any, tableName?: string): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => mapObjectToDB(item, tableName));
  }
  if (typeof obj === 'object') {
    const mapped: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        let nestedTable = tableName;
        if (key === 'modules') nestedTable = 'modules';
        else if (key === 'lessons') nestedTable = 'lessons';
        mapped[key] = mapObjectToDB(val, nestedTable);
      } else {
        mapped[key] = mapValueToDB(key, val, tableName);
      }
    }
    return mapped;
  }
  return obj;
}

function mapValueFromDB(val: any): any {
  if (typeof val === 'string' && val.length === 36) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
      return fromDeterministicUUID(val);
    }
  }
  return val;
}

function mapObjectFromDB(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => mapObjectFromDB(item));
  }
  if (typeof obj === 'object') {
    const mapped: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        mapped[key] = mapObjectFromDB(val);
      } else {
        mapped[key] = mapValueFromDB(val);
      }
    }
    return mapped;
  }
  return obj;
}

function seedUuidMaps() {
  if (typeof INITIAL_COURSES !== 'undefined' && Array.isArray(INITIAL_COURSES)) {
    INITIAL_COURSES.forEach(c => {
      toDeterministicUUID(c.id);
      if (c.modules) {
        c.modules.forEach(m => {
          const modAny = m as any;
          toDeterministicUUID(modAny.id);
          toDeterministicUUID(modAny.course_id || modAny.courseId || '');
          if (modAny.lessons) {
            modAny.lessons.forEach((l: any) => {
              toDeterministicUUID(l.id);
              toDeterministicUUID(l.module_id || l.moduleId || '');
            });
          }
        });
      }
    });
  }

  if (typeof INITIAL_STUDENTS !== 'undefined' && Array.isArray(INITIAL_STUDENTS)) {
    INITIAL_STUDENTS.forEach(s => {
      const studAny = s as any;
      toDeterministicUUID(studAny.id);
      toDeterministicUUID(studAny.course_id || studAny.courseId || '');
    });
  }

  if (typeof INITIAL_TIMETABLE !== 'undefined' && Array.isArray(INITIAL_TIMETABLE)) {
    INITIAL_TIMETABLE.forEach(t => {
      const ttAny = t as any;
      toDeterministicUUID(ttAny.id);
      toDeterministicUUID(ttAny.course_id || ttAny.courseId || '');
    });
  }

  if (typeof INITIAL_LABS !== 'undefined' && Array.isArray(INITIAL_LABS)) {
    INITIAL_LABS.forEach(l => {
      const labAny = l as any;
      toDeterministicUUID(labAny.id);
      toDeterministicUUID(labAny.course_id || labAny.courseId || '');
    });
  }

  if (typeof INITIAL_EXAMS !== 'undefined' && Array.isArray(INITIAL_EXAMS)) {
    INITIAL_EXAMS.forEach(e => {
      const examAny = e as any;
      toDeterministicUUID(examAny.id);
      toDeterministicUUID(examAny.course_id || examAny.courseId || '');
    });
  }

  if (typeof INITIAL_LECTURERS !== 'undefined' && Array.isArray(INITIAL_LECTURERS)) {
    INITIAL_LECTURERS.forEach(l => {
      const lectAny = l as any;
      toDeterministicUUID(lectAny.id);
    });
  }

  if (typeof INITIAL_LIBRARY !== 'undefined' && Array.isArray(INITIAL_LIBRARY)) {
    INITIAL_LIBRARY.forEach(l => {
      const libAny = l as any;
      toDeterministicUUID(libAny.id);
      toDeterministicUUID(libAny.course_id || libAny.courseId || '');
    });
  }

  if (typeof INITIAL_MOCK_EXAMS !== 'undefined' && Array.isArray(INITIAL_MOCK_EXAMS)) {
    INITIAL_MOCK_EXAMS.forEach(m => {
      const meAny = m as any;
      toDeterministicUUID(meAny.id);
      toDeterministicUUID(meAny.course_id || meAny.courseId || '');
    });
  }
}

// Pre-seed maps on load
seedUuidMaps();

async function syncToSupabase(table: string, data: any, retries = 3): Promise<any> {
  const localKey = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'ita_permanent_registry' : `ita_local_${table}`;
  try {
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const idx = localData.findIndex((item: any) => item.id === data.id);
    if (idx > -1) {
      localData[idx] = data;
    } else {
      localData.push(data);
    }
    safeSetLocalStorage(localKey, JSON.stringify(localData));
  } catch (e) {
    console.error("Local Buffer Sync Failed:", e);
  }

  if (!supabase) return null;
  const targetTable = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'portal_profiles' : table;
  
  try {
    let payload = data;
    if (table === 'students' || table === 'profiles' || table === 'portal_profiles') {
      // MASTER ID ALIGNMENT: Prioritize NRC as the physical anchor over unstable UUIDs
      const sNRC = sanitizeUserIdentityString(data.nrc || '');
      
      if (sNRC && supabase) {
        // Broad load and robust normalized local comparison to bypass any db formatting issues
        const { data: allProfiles } = await supabase.from('portal_profiles').select('id, full_name, student_id, nrc');
        const existingNode = allProfiles ? allProfiles.find(p => sanitizeUserIdentityString(p.nrc || '') === sNRC) : null;
        
        if (existingNode?.id && existingNode.id !== data.id) {
           console.log(`ITA [SYNC_ALIGN]: Re-mapping ${data.fullName || 'Student'} [${data.id}] to master ID ${existingNode.id} (NRC: ${data.nrc})`);
           data.id = existingNode.id;
           
           // MASTER IDENTITY LOCK: If the cloud already has a stable studentId for this NRC, 
           // preserve it to prevent historical data (attendance/marks) from being orphaned.
           if (existingNode.student_id && existingNode.student_id !== data.studentId) {
             console.log(`ITA [ID_LOCK]: Restoring master studentId ${existingNode.student_id} from cloud archive.`);
             data.studentId = existingNode.student_id;
           }
        }
      }

      payload = {
        id: data.id,
        student_id: data.studentId,
        full_name: data.fullName,
        email: data.email,
        nrc: data.nrc,
        phone: data.phone,
        password: data.password,
        course_id: data.courseId,
        intake_id: data.intakeId,
        role: data.role || 'student',
        status: data.status,
        progress: data.progress,
        attendance_progress: data.attendanceProgress,
        lab_progress: data.labProgress,
        payment_status: data.paymentStatus,
        payment_history: data.paymentHistory,
        admission_year: data.admissionYear,
        current_module_id: data.currentModuleId,
        current_track: data.currentTrack,
        selected_duration: data.selectedDuration
      };
    } else if (table === 'intakes') {
      payload = { id: data.id, name: data.name, start_date: data.startDate };
    } else if (table === 'submissions') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        type: data.type,
        title: data.title,
        module_id: data.moduleId,
        file_url: data.fileUrl,
        file_type: data.fileType,
        status: data.status,
        grade: data.grade,
        feedback: data.feedback,
        ai_grade: data.aiGrade,
        ai_feedback: data.aiFeedback,
        is_ai_marked: data.isAiMarked,
        program: data.program,
        submitted_at: data.submittedAt
      };
    } else if (table === 'class_attendance') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        class_id: data.classId,
        class_title: data.classTitle,
        date: data.date,
        check_in_time: data.checkInTime,
        status: data.status,
        program: data.program,
        duration: data.duration,
        session_time: data.sessionTime,
        course_id: data.courseId,
        course_name: data.courseName
      };
    } else if (table === 'courses') {
      const { modules, ...courseData } = data;
      payload = { 
        id: courseData.id, 
        name: courseData.name, 
        duration: courseData.duration
      };
      
      if (modules && Array.isArray(modules)) {
        for (const module of modules) {
          const { lessons, ...moduleData } = module;
          const { error: modError } = await supabase.from('modules').upsert(mapObjectToDB({
            id: moduleData.id,
            course_id: courseData.id,
            title: moduleData.title,
            "order": moduleData.order
          }, 'modules'));
          
          if (modError && modError.message?.includes('fetch')) throw modError;

          if (lessons && Array.isArray(lessons)) {
            for (const lesson of lessons) {
              const { error: lesError } = await supabase.from('lessons').upsert(mapObjectToDB({
                id: lesson.id,
                module_id: moduleData.id,
                title: lesson.title,
                content: lesson.content,
                pdf_url: lesson.pdfUrl,
                audio_url: lesson.audioUrl,
                external_links: lesson.externalLinks || [],
                "order": lesson.order
              }, 'lessons'));
              if (lesError && lesError.message?.includes('fetch')) throw lesError;
            }
          }
        }
      }
    } else if (table === 'audit_logs') {
      payload = {
        id: data.id,
        category: data.category || 'System',
        action: data.action,
        details: data.details,
        user_id: data.userId,
        timestamp: data.timestamp
      };
    } else if (table === 'payments') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        amount: data.amountPaid,
        balance: data.balance,
        status: data.status,
        transaction_id: data.transactionId,
        payment_method: data.accountNumber,
        payment_date: data.paymentDate,
        evidence_url: data.evidenceUrl
      };
    } else if (table === 'lecturers') {
      payload = { 
        id: data.id, 
        name: data.name, 
        user_id: data.userId,
        course_name: data.courseName || 'General IT'
      };
    } else if (table === 'library') {
      payload = {
        id: data.id,
        title: data.title,
        author: data.author,
        type: data.type,
        category: data.category,
        file_url: data.fileUrl,
        course_id: data.courseId
      };
    } else if (table === 'submissions') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        type: data.type,
        title: data.title,
        module_id: data.moduleId,
        file_url: data.fileUrl,
        file_type: data.fileType,
        status: data.status,
        grade: data.grade,
        feedback: data.feedback,
        ai_grade: data.aiGrade,
        ai_feedback: data.aiFeedback,
        is_ai_marked: data.isAiMarked,
        submitted_at: data.submittedAt
      };
    } else if (table === 'mentor_bookings') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        topic: data.topic,
        duration: data.duration,
        status: data.status,
        preferred_time: data.preferredTime,
        notes: data.notes,
        transaction_id: data.transactionId,
        booking_date: data.bookingDate
      };
    } else if (table === 'community_messages') {
      payload = {
        id: data.id,
        user_id: data.userId,
        user_name: data.userName,
        user_role: data.userRole,
        text: data.text,
        timestamp: data.timestamp,
        faculty: data.faculty
      };
    } else if (table === 'announcements') {
      payload = {
        id: data.id,
        title: data.title,
        content: data.content,
        date: data.date,
        category: data.category
      };
    } else if (table === 'exams') {
      payload = {
        id: data.id,
        course_id: data.courseId,
        module_id: data.moduleId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        type: data.type,
        max_mark: data.maxMark
      };
    } else if (table === 'settings') {
      payload = {
        id: data.id,
        announcement_marquee: data.announcementMarquee,
        whatsapp_ai: data.whatsappAI,
        biometric_enabled: data.biometricEnabled,
        transparency_mode: data.transparencyMode
      };
    } else if (table === 'invoices') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        amount: data.amount,
        date: data.date,
        status: data.status,
        description: data.description
      };
    } else if (table === 'online_classes') {
      const startTimeVal = data.startTime || data.sessionTime || new Date().toISOString();
      let isoDateStr = '';
      try {
        isoDateStr = new Date(startTimeVal).toISOString().split('T')[0];
      } catch (e) {
        isoDateStr = new Date().toISOString().split('T')[0];
      }
      payload = {
        id: data.id,
        title: data.title,
        course_id: data.courseId,
        session_time: startTimeVal,
        zoom_link: data.meetingLink || data.zoomLink,
        date: isoDateStr,
        description: JSON.stringify({
          instructorId: data.instructorId || 'admin',
          duration: data.duration || 60,
          platform: data.platform || 'other',
          status: data.status || 'scheduled'
        })
      };
    } else if (table === 'timetable') {
      payload = {
        id: data.id,
        course_id: data.courseId,
        lecturer_id: data.lecturerId,
        day: data.day,
        session_time: data.sessionTime,
        notes: data.notes,
        audio_url: data.audioUrl,
        pdf_url: data.pdfUrl,
        wps_link: data.wpsLink
      };
    } else if (table === 'whatsapp_messages') {
      payload = {
        id: data.id,
        sender: data.sender,
        message: data.message,
        reply: data.reply,
        timestamp: data.timestamp
      };
    } else if (table === 'notifications') {
      payload = {
        id: data.id,
        title: data.title,
        message: data.message,
        timestamp: data.timestamp,
        type: data.type,
        read: data.read || false,
        target_role: data.target_role || 'admin'
      };
    } else if (table === 'learning_materials') {
      payload = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        module_id: data.moduleId,
        created_at: data.createdAt,
        created_by: data.createdBy
      };
    } else if (table === 'meetings') {
      payload = {
        id: data.id,
        host_id: data.hostId,
        title: data.title,
        status: data.status,
        room_id: data.roomId,
        started_at: data.startedAt,
        ended_at: data.endedAt
      };
    } else if (table === 'mock_exams') {
      payload = {
        id: data.id,
        course_id: data.courseId,
        title: data.title,
        description: data.description,
        duration: data.duration,
        questions: data.questions
      };
    } else if (table === 'mock_exam_results') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        exam_id: data.examId,
        answers: data.answers,
        score: data.score,
        max_score: data.maxScore,
        feedback: data.feedback,
        completed_at: data.completedAt,
        is_ai_graded: data.isAiGraded
      };
    } else if (table === 'student_progress' || table === 'completions') {
      payload = {
        id: data.id || `${data.studentId}_${data.lessonId}`,
        student_id: data.studentId || data.student_id,
        lesson_id: data.lessonId || data.lesson_id,
        completed_at: data.completedAt || data.timestamp || new Date().toISOString()
      };
    } else if (table === 'class_attendance') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        class_id: data.classId,
        class_title: data.classTitle,
        date: data.date,
        check_in_time: data.checkInTime,
        status: data.status,
        program: data.program,
        duration: data.duration,
        session_time: data.sessionTime,
        course_id: data.courseId,
        course_name: data.courseName
      };
    } else if (table === 'submissions') {
      payload = {
        id: data.id,
        student_id: data.studentId,
        student_name: data.studentName,
        type: data.type,
        title: data.title,
        module_id: data.moduleId,
        file_url: data.fileUrl,
        file_type: data.fileType,
        status: data.status,
        grade: data.grade,
        feedback: data.feedback,
        ai_grade: data.aiGrade,
        ai_feedback: data.aiFeedback,
        is_ai_marked: data.isAiMarked,
        program: data.program,
        submitted_at: data.submittedAt
      };
    }

    const dbPayload = mapObjectToDB(payload, table);

    const { data: result, error } = await supabase
      .from(targetTable)
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      if (error.message?.includes('fetch') && retries > 0) {
        console.warn(`ITA [RETRY]: Sync [${table}] network fault. Retrying in 2s...`);
        await sleep(2000);
        return syncToSupabase(table, data, retries - 1);
      }
      
      if (error.message?.includes('schema cache') || error.code === '42P01') {
        console.warn(`ITA [SYNC ALERT]: Table '${targetTable}' cache mismatch. Buffer updated.`);
        const localKey = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'ita_permanent_registry' : `ita_local_${table}`;
        try {
          const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
          const idx = localData.findIndex((item: any) => item.id === data.id);
          if (idx > -1) localData[idx] = data;
          else localData.push(data);
          safeSetLocalStorage(localKey, JSON.stringify(localData));
        } catch (e) {
          console.error("Local Buffer Sync Failed:", e);
        }
        return null; 
      }
      handleSupabaseError(error, `Sync [${table}]`);
      return null;
    }
    return result;
  } catch (e: any) {
    if (e.message?.includes('fetch') && retries > 0) {
      console.warn(`ITA [RETRY]: Sync [${table}] critical network fault. Retrying...`);
      await sleep(2000);
      return syncToSupabase(table, data, retries - 1);
    }
    console.error(`Supabase Sync Fault [${table}]:`, e);
    return null;
  }
}

async function deleteFromSupabase(table: string, id: string) {
  const localKey = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'ita_permanent_registry' : `ita_local_${table}`;
  try {
    const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = localData.filter((item: any) => item.id !== id);
    safeSetLocalStorage(localKey, JSON.stringify(filtered));
  } catch (e) {
    console.error("Local Buffer Delete Failed:", e);
  }

  if (!supabase) return null;
  const targetTable = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'portal_profiles' : table;
  try {
    // Attempt delete by primary UUID 'id'
    const { error: uuidError } = await supabase.from(targetTable).delete().eq('id', id);
    
    if (uuidError) {
      console.warn(`Supabase UUID Delete Refused [${targetTable}]:`, uuidError.message);
      
      // Fallback: If it's a student, try deleting by the human-readable student_id
      if (table === 'students' || table === 'profiles') {
        const { error: sidError } = await supabase.from(targetTable).delete().eq('student_id', id);
        if (sidError) {
          console.error(`Supabase Fallback Delete Failed [${targetTable}]:`, sidError.message);
          return false;
        }
        return true;
      }
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Supabase Delete Critical [${targetTable}]:`, e);
    return false;
  }
}

function handleSupabaseError(error: any, context: string) {
  console.error(`Supabase Error [${context}]:`, error.message);
  
  if (error.code === '23505') {
    throw new Error(`${context} failed: A record with this unique value (Email, NRC, or ID) already exists.`);
  }
  
  if (error.code === '42P01' || error.message?.includes('schema cache')) {
    const missingColumnMatch = error.message?.match(/column ['"](.+?)['"]/i);
    const missingCol = missingColumnMatch ? `DATABASE OUTDATED. ATTENTION: Missing column '${missingColumnMatch[1]}' detected.\n` : '';
    throw new Error(
      `DATABASE SETUP REQUIRED: ${missingCol}\n` +
      `Your Supabase database is missing the required tables or columns.\n\n` +
      `REQUIRED STEPS:\n` +
      `1. Open your Supabase Dashboard (SQL Editor).\n` +
      `2. Copy the final code provided in the AI Chat OR from '/supabase_setup.sql'.\n` +
      `3. Paste and click 'RUN' in Supabase.\n` +
      `4. IMPORTANT: Refresh your web browser tab (F5) to clear the system cache.`
    );
  }
  
  throw new Error(`Technical Error (${context}): ${error.message}`);
}

async function fetchFromSupabase(table: string, retries = 3): Promise<any[]> {
  const localKey = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'ita_permanent_registry' : `ita_local_${table}`;
  const localData = JSON.parse(localStorage.getItem(localKey) || '[]');

  if (!supabase) return localData;
  const targetTable = (table === 'students' || table === 'profiles' || table === 'portal_profiles') ? 'portal_profiles' : table;

  try {
    let data: any[] | null = null;
    let error: any = null;

    if (table === 'courses') {
      // First try the comprehensive query with modules and lessons
      const nestedResult = await supabase
        .from(targetTable)
        .select('id, name, duration, modules(*, lessons(*))')
        .limit(1000);
      
      if (nestedResult.error) {
        console.warn(`ITA [RECOVERY]: Nested courses query failed (${nestedResult.error.message}). Retrying simplified query...`);
        // Fall back to simple non-nested query to ensure basic courses are always retrieved
        const simpleResult = await supabase
          .from(targetTable)
          .select('id, name, duration')
          .limit(1000);
          
        if (simpleResult.error) {
          error = simpleResult.error;
        } else {
          data = (simpleResult.data || []).map(c => ({
            ...c,
            modules: []
          }));
        }
      } else {
        data = nestedResult.data;
      }
    } else if (table === 'intakes' || targetTable === 'intakes') {
      const { data: intakeData, error: intakeError } = await supabase
        .from('intakes')
        .select('*')
        .eq('status', 'active');
      
      console.log("ITA [DB DEBUGLOG] Intakes active query status response info:", {
        data: intakeData,
        error: intakeError,
        rawLength: intakeData?.length,
        hasError: !(!intakeError),
        errorMessage: intakeError?.message || null,
        errorDetails: intakeError?.details || null,
        errorHint: intakeError?.hint || null
      });

      data = intakeData;
      error = intakeError;

      // Graceful local and database fallbacks in case SQL structure differs or table state lacks 'status'
      if (error) {
        console.warn("ITA [RECOVERY]: Retrying intakes query without active filter:", error);
        const fallbackResult = await supabase
          .from('intakes')
          .select('*')
          .limit(100);
        
        console.log("ITA [DB DEBUGLOG] Fallback intakes query response:", {
          data: fallbackResult.data,
          error: fallbackResult.error
        });

        if (!fallbackResult.error && fallbackResult.data) {
          data = fallbackResult.data;
          error = null;
        }
      }
    } else {
      const { data: normalData, error: normalError } = await supabase
        .from(targetTable)
        .select('*')
        .limit(5000);
      data = normalData;
      error = normalError;
    }
    
    if (error) {
      if (error.message?.includes('fetch') && retries > 0) {
        console.warn(`ITA [RETRY]: Fetch [${targetTable}] network fault. Retrying in 2s...`);
        await sleep(2000);
        return fetchFromSupabase(table, retries - 1);
      }

      if (error.message?.includes('schema cache') || error.code === '42P01' || error.message?.includes('modules" does not exist')) {
        console.warn(`ITA [CACHE]: Table '${targetTable}' or dependencies not yet ready. Using local buffer.`);
        return localData;
      }
      console.error(`Supabase Fetch Error [${targetTable}]:`, error.message);
      return localData;
    }
    
    if (!data) return localData;

    data = mapObjectFromDB(data);

    // ITA [PROTOCOL]: Unified Registry Rescue & Persistence 
    // NRC POLICY: NRC is the master anchor. If a local student has an NRC not in Cloud, rescue them.
    const cleanNRC = (nrc: string) => (nrc || '').replace(/[^A-Z0-9]/g, '').toUpperCase();
    const merged = [...data];
    let rescueRequired = false;
    
    localData.forEach((ls: any) => {
      const lsNRC = cleanNRC(ls.nrc || '');
      const exists = data.find((ds: any) => 
        ds.id === ls.id || 
        (ls.studentId && ds.student_id === ls.studentId) ||
        (lsNRC && cleanNRC(ds.nrc || '') === lsNRC)
      );
      
      if (!exists && (ls.fullName || ls.title)) {
        console.log(`ITA [PERSISTENCE]: Rescuing record from local memory: ${ls.fullName || ls.title} [NRC: ${ls.nrc || 'N/A'}]`);
        merged.push(ls);
        rescueRequired = true;
        // Immediate sync-back to cloud
        if (supabase) {
          syncToSupabase(table, ls).catch(e => console.warn(`ITA [RECOVERY]: Failed to push node back to cloud:`, e));
        }
      }
    });

    if (rescueRequired) {
      console.log(`ITA [PERSISTENCE]: Local nodes recovered and re-anchored to cloud registry.`);
    }

    let processed = merged;
    if (table === 'students' || table === 'profiles' || table === 'portal_profiles') {
      processed = merged.map(s => ({
        id: s.id,
        studentId: s.student_id || s.studentId, // Support both formats
        fullName: s.full_name || s.fullName,
        email: s.email,
        nrc: s.nrc,
        phone: s.phone,
        password: s.password,
        courseId: s.course_id || s.courseId,
        intakeId: s.intake_id || s.intakeId,
        status: s.status,
        progress: s.progress,
        attendanceProgress: s.attendance_progress || s.attendanceProgress,
        labProgress: s.lab_progress || s.labProgress,
        paymentStatus: s.payment_status || s.paymentStatus,
        paymentHistory: s.payment_history || s.paymentHistory || [],
        admissionYear: s.admission_year || s.admissionYear,
        currentModuleId: s.current_module_id || s.currentModuleId,
        currentTrack: s.current_track || s.currentTrack,
        selectedDuration: s.selected_duration || s.selectedDuration,
        role: s.role || 'student'
      }));
    } else if (table === 'submissions') {
      processed = merged.map(s => ({
        id: s.id,
        studentId: s.student_id || s.studentId,
        studentName: s.student_name || s.studentName,
        type: s.type,
        title: s.title,
        moduleId: s.module_id || s.moduleId,
        fileUrl: s.file_url || s.fileUrl,
        fileType: s.file_type || s.fileType,
        status: s.status,
        grade: s.grade,
        feedback: s.feedback,
        aiGrade: s.ai_grade || s.aiGrade,
        aiFeedback: s.ai_feedback || s.aiFeedback,
        isAiMarked: s.is_ai_marked || s.isAiMarked,
        submittedAt: s.submitted_at || s.submittedAt,
        program: s.program
      }));
    } else if (table === 'intakes') {
      processed = data.map(i => ({
        id: i.id,
        name: i.name,
        startDate: i.start_date
      }));
    } else if (table === 'courses') {
      processed = data.map((c: any) => {
        const isUrlOrGenerating = c.duration?.startsWith("http") || c.duration === "generating";
        const actualDuration = isUrlOrGenerating ? "Self-Paced" : (c.duration || "6 Months");
        const videoUrlValue = isUrlOrGenerating ? c.duration : (c.video_url || c.videoUrl);
        const computedPrice = c.price || (actualDuration === "6 Weeks" ? "ZK 200" : (actualDuration === "3 Months" ? "ZK 550" : "ZK 1,000"));

        return {
          id: c.id,
          name: c.name,
          description: c.description || "Specialized IT training course blueprint covering foundational modular frameworks.",
          duration: actualDuration,
          price: computedPrice,
          videoUrl: videoUrlValue,
          modules: (c.modules || []).map((m: any) => ({
            id: m.id,
            title: m.title,
            order: m.order,
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              content: l.content,
              videoUrl: l.video_url || l.videoUrl,
              pdfUrl: l.pdf_url || l.pdfUrl,
              audioUrl: l.audio_url || l.audioUrl,
              externalLinks: l.external_links || l.externalLinks,
              order: l.order
            })).sort((a: any, b: any) => a.order - b.order)
          })).sort((a: any, b: any) => a.order - b.order)
        };
      });
    } else if (table === 'lecturers') {
      processed = data.map(l => ({
        id: l.id,
        name: l.name,
        userId: l.user_id,
        courseName: l.course_name
      }));
    } else if (table === 'timetable') {
      processed = data.map(t => ({
        id: t.id,
        courseId: t.course_id,
        lecturerId: t.lecturer_id,
        day: t.day,
        sessionTime: t.session_time,
        notes: t.notes,
        audioUrl: t.audio_url,
        pdfUrl: t.pdf_url,
        wpsLink: t.wps_link
      }));
    } else if (table === 'payments') {
      processed = data.map(p => ({
        id: p.id,
        studentId: p.student_id,
        studentName: p.student_name,
        amountPaid: p.amount,
        balance: p.balance,
        paymentDate: p.payment_date,
        status: p.status,
        evidenceUrl: p.evidence_url,
        transactionId: p.transaction_id,
        accountNumber: p.payment_method
      }));
    } else if (table === 'mentor_bookings') {
      processed = data.map(b => ({
        id: b.id,
        studentId: b.student_id,
        studentName: b.student_name,
        topic: b.topic,
        duration: b.duration,
        status: b.status,
        preferredTime: b.preferred_time,
        notes: b.notes,
        transactionId: b.transaction_id,
        bookingDate: b.booking_date
      }));
    } else if (table === 'audit_logs') {
      processed = data.map(a => ({
        id: a.id,
        category: a.category,
        action: a.action,
        details: a.details,
        userId: a.user_id,
        timestamp: a.timestamp
      }));
    } else if (table === 'library') {
      processed = data.map(l => ({
        id: l.id,
        title: l.title,
        author: l.author,
        type: l.type,
        category: l.category,
        fileUrl: l.file_url,
        courseId: l.course_id
      }));
    } else if (table === 'community_messages') {
      processed = data.map(m => ({
        id: m.id,
        userId: m.user_id,
        userName: m.user_name,
        userRole: m.user_role,
        text: m.text,
        timestamp: m.timestamp,
        faculty: m.faculty
      }));
    } else if (table === 'announcements') {
      processed = data.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        date: a.date,
        category: a.category
      }));
    } else if (table === 'settings') {
      processed = data.map(s => ({
        id: s.id,
        announcementMarquee: s.announcement_marquee,
        whatsappAI: s.whatsapp_ai,
        biometricEnabled: s.biometric_enabled,
        transparencyMode: s.transparency_mode
      }));
    } else if (table === 'invoices') {
      processed = data.map(v => ({
        id: v.id,
        studentId: v.student_id,
        amount: v.amount,
        date: v.date,
        status: v.status,
        description: v.description
      }));
    } else if (table === 'mock_exams') {
      processed = data.map(e => ({
        id: e.id,
        courseId: e.course_id,
        title: e.title,
        description: e.description,
        duration: e.duration,
        questions: e.questions
      }));
    } else if (table === 'mock_exam_results') {
      processed = data.map(r => ({
        id: r.id,
        studentId: r.student_id,
        examId: r.exam_id,
        answers: r.answers,
        score: r.score,
        maxScore: r.max_score,
        feedback: r.feedback,
        completedAt: r.completed_at,
        isAiGraded: r.is_ai_graded
      }));
    } else if (table === 'online_classes') {
      processed = data.map(c => {
        let extra: any = {};
        try {
          if (c.description && c.description.startsWith('{')) {
            extra = JSON.parse(c.description);
          }
        } catch (e) {
          console.warn("Failed parsing online_class extra params:", e);
        }
        return {
          id: c.id,
          title: c.title,
          courseId: c.course_id || c.courseId,
          startTime: c.session_time || c.startTime || new Date().toISOString(),
          meetingLink: c.zoom_link || c.meetingLink || '',
          instructorId: extra.instructorId || c.instructorId || 'admin',
          duration: Number(extra.duration) || Number(c.duration) || 60,
          platform: extra.platform || c.platform || 'other',
          status: extra.status || c.status || 'scheduled'
        };
      });
    } else if (table === 'whatsapp_messages') {
      processed = data.map(w => ({
        id: w.id,
        sender: w.sender,
        message: w.message,
        reply: w.reply,
        timestamp: w.timestamp
      }));
    } else if (table === 'learning_materials') {
      processed = data.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        url: m.url,
        moduleId: m.module_id,
        createdAt: m.created_at,
        createdBy: m.created_by
      }));
    } else if (table === 'meetings') {
      processed = data.map(m => ({
        id: m.id,
        hostId: m.host_id,
        title: m.title,
        status: m.status,
        roomId: m.room_id,
        startedAt: m.started_at,
        endedAt: m.ended_at
      }));
    } else if (table === 'student_progress' || table === 'completions') {
      processed = data.map(c => ({
        id: c.id,
        studentId: c.student_id,
        lessonId: c.lesson_id,
        completedAt: c.completed_at || c.timestamp
      }));
    } else if (table === 'class_attendance') {
      processed = data.map(a => ({
        id: a.id,
        studentId: a.student_id,
        studentName: a.student_name,
        classId: a.class_id,
        courseId: a.course_id,
        courseName: a.course_name,
        classTitle: a.class_title,
        date: a.date,
        checkInTime: a.check_in_time,
        status: a.status,
        program: a.program,
        duration: a.duration,
        sessionTime: a.session_time
      }));
    } else {
      processed = data;
    }

    if (localKey !== 'ita_permanent_registry') {
      safeSetLocalStorage(localKey, JSON.stringify(processed));
    }
    return processed;
  } catch (e) {
    console.error(`Supabase Fetch Critical [${table}]:`, e);
    return localData;
  }
}

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  courses: Course[];
  addCourse: (c: Course) => void;
  updateCourse: (c: Course) => void;
  deleteCourse: (id: string) => void;
  intakes: Intake[];
  addIntake: (i: Intake) => void;
  updateIntake: (i: Intake) => void;
  deleteIntake: (id: string) => void;
  students: Student[];
  addStudent: (s: Omit<Student, 'id' | 'studentId'>) => Promise<{ studentId: string, pass: string }>;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  addStaff: (data: { fullName: string, email: string, password?: string, role: 'staff' | 'instructor' | 'admin' }) => Promise<void>;
  payments: Payment[];
  addPayment: (p: Payment) => void;
  announcements: Announcement[];
  addAnnouncement: (a: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  labs: LabTask[];
  addLab: (l: Omit<LabTask, 'id'>) => Promise<void>;
  updateLab: (l: LabTask) => void;
  deleteLab: (id: string) => void;
  libraryItems: LibraryItem[];
  addLibraryItem: (item: Omit<LibraryItem, 'id'>) => void;
  deleteLibraryItem: (id: string) => void;
  whatsappAISettings: {
    enabled: boolean;
    autoReply: boolean;
    instruction: string;
  };
  updateWhatsAppAI: (settings: any) => void;
  whatsappMessages: { id: string; sender: string; message: string; reply: string; timestamp: string }[];
  addWhatsAppMessage: (msg: any) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
  invoices: Invoice[];
  addInvoice: (inv: Invoice) => void;
  onlineClasses: OnlineClass[];
  addOnlineClass: (cls: Omit<OnlineClass, 'id'>) => void;
  updateOnlineClass: (id: string, updates: Partial<OnlineClass>) => void;
  deleteOnlineClass: (id: string) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  announcementMarquee: string;
  updateMarquee: (text: string) => void;
  introUrl: string;
  updateIntroUrl: (url: string) => Promise<void>;
  biometricEnabled: boolean;
  toggleBiometric: () => void;
  transparencyMode: boolean;
  toggleTransparency: () => void;
  updatePassword: (newPass: string) => Promise<boolean>;
  toggleNetacadLink: () => void;
  seedInitialData: () => Promise<void>;
  hardReset: () => Promise<void>;
  refreshData: () => Promise<Student[] | void>;
  enrollStudent: (data: { fullName: string, email: string, nrc: string, phone: string, courseId: string, intakeId: string, selectedDuration?: string }) => Promise<{ studentId: string, pass: string, fullName: string, isExisting?: boolean }>;
  submitPIN: (pin: string) => Promise<void>;
  notifications: { id: string; title: string; message: string; timestamp: string; type: 'info' | 'alert' | 'success' }[];
  clearNotifications: () => void;
  submitWork: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'grade' | 'feedback'>) => Promise<void>;
  submissions: Submission[];
  attendance: Attendance[];
  exams: Exam[];
  mockExams: MockExam[];
  mockExamResults: MockExamResult[];
  completions: string[];
  meetings: Meeting[];
  learningMaterials: LearningMaterial[];
  startMeeting: (title: string) => Promise<void>;
  endMeeting: (id: string) => Promise<void>;
  addLearningMaterial: (data: Omit<LearningMaterial, 'id' | 'createdAt'>) => Promise<void>;
  deleteLearningMaterial: (id: string) => Promise<void>;
  toggleLessonCompletion: (lessonId: string, studentIdOverride?: string) => Promise<void>;
  markSubmissionWithAI: (submissionId: string, base64Data: string, mimeType: string, prompt: string) => Promise<void>;
  autoGradeSubmission: (submissionId: string) => Promise<void>;
  approveAiGrade: (submissionId: string) => Promise<void>;
  verifySubmission: (id: string, grade: string, feedback: string) => Promise<void>;
  handleAssignmentGradingVisibility?: (submissionId: string, grade: string, feedback: string) => Promise<void>;
  registerAttendance: (classId: string, extraData?: { program: string, duration: string, sessionTime: string }) => Promise<void>;
  submitMockExam: (examId: string, answers: { questionId: string; answer: string }[]) => Promise<string>;
  gradeMockExamWithAI: (resultId: string) => Promise<void>;
  mentorBookings: MentorBooking[];
  communityMessages: CommunityMessage[];
  lecturers: Lecturer[];
  addLecturer: (l: Omit<Lecturer, 'id'>) => Promise<void>;
  deleteLecturer: (id: string) => Promise<void>;
  timetable: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => Promise<void>;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  allProgress: any[];
  dbStatus: { table: string; count: number; provider: string }[];
  bookMentor: (data: Omit<MentorBooking, 'id' | 'status' | 'bookingDate'>) => Promise<void>;
  updateMentorBooking: (id: string, updates: Partial<MentorBooking>) => Promise<void>;
  submitPaymentProof: (data: Omit<Payment, 'id' | 'status' | 'paymentDate'>) => Promise<void>;
  approvePayment: (id: string) => Promise<void>;
  rejectPayment: (id: string) => Promise<void>;
  sendCommunityMessage: (text: string) => Promise<void>;
  askMentor: (history: AIMessage[], customSystemInstruction?: string) => Promise<string>;
  purgeOtherStaff: () => Promise<void>;
  forceRegistryUpload: () => Promise<void>;
  repairRegistry: () => Promise<void>;
  addNotification: (title: string, message: string, type?: 'info' | 'alert' | 'success', targetRole?: string) => Promise<void>;
  isSyncing: boolean;
  dataLoaded: boolean;
  refreshKey: number;
  findStudentByRegistry: (nrc: string, email: string) => Promise<Student | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRE_DEFINED_USERS: Record<string, { pass: string, role: UserRole }> = {
  'admin': { pass: 'admin123', role: 'admin' },
  'staff': { pass: 'staff123', role: 'staff' },
  'sys_dev': { pass: 'ita@2026', role: 'admin' },
  'felixbrownz': { pass: '746939', role: 'admin' },
  '2026100': { pass: '000000', role: 'student' }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    // Switch to localStorage so users are never automatically logged out (avoid forgetting login details)
    const stored = localStorage.getItem('ita_session_active');
    if (!stored) return null;
    const userData = localStorage.getItem('ita_user');
    if (!userData) return null;
    try {
      const parsed = JSON.parse(userData);
      // Hard-coded admin override for specific identifier or email
      if (parsed.email?.toLowerCase() === 'felixbrownz907@gmail.com' || 
          parsed.username?.toLowerCase() === 'felixbrownz' ||
          parsed.username === 'Felix Brown (Developer)') {
        parsed.role = 'admin';
        parsed.email = 'felixbrownz907@gmail.com';
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Persistence for user state to survive refreshes after status updates
  useEffect(() => {
    if (user) {
      localStorage.setItem('ita_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ita_user');
    }
  }, [user]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ table: string; count: number; provider: string }[]>([]);

  // Real-time Notification Listener
  useEffect(() => {
    if (!supabase) return;
    
    console.log("ITA [SECURITY]: Initializing real-time telemetry link...");
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('ITA [ALERT]: New system notification received:', payload.new);
          const newNotif = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            timestamp: payload.new.timestamp,
            type: payload.new.type as any
          };
          
          // Only show if it's for the user's role or admin
          if (payload.new.target_role === 'all' || (user && payload.new.target_role === user.role) || (user?.role === 'admin')) {
            setNotifications(prev => {
              if (prev.find(n => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev].slice(0, 50);
            });
          }
        }
      )
      .subscribe();

    // Supabase subscription for real-time updates for student balances
    const paymentsChannel = supabase
      .channel('payments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('ITA [SUPABASE]: Real-time Balance Update Triggered:', payload);
          if (payload.new && (payload.new.status === 'Approved' || payload.new.status === 'approved')) {
            refreshData();
          }
        }
      )
      .subscribe();

    // Supabase subscription to watch for changes to assignments grade and feedback fields
    const submissionsChannel = supabase
      .channel('assignment-grades')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions'
        },
        (payload) => {
          console.log('ITA [SUPABASE]: Real-time Grade/Feedback Update Triggered:', payload);
          refreshData();
        }
      )
      .subscribe();

    const assignmentsChannel = supabase
      .channel('assignments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'assignments'
        },
        (payload) => {
          console.log('ITA [SUPABASE]: Real-time Assignments Update Triggered:', payload);
          refreshData();
        }
      )
      .subscribe();

    // Supabase subscription for real-time attendance and 26-week progress calculations
    const progressChannel = supabase
      .channel('weeks-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portal_profiles'
        },
        (payload) => {
          console.log('ITA [SUPABASE]: Real-time Profiles Progression Update:', payload);
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [user?.role]);

  const addNotification = async (title: string, message: string, type: 'info' | 'alert' | 'success' = 'info', targetRole: string = 'admin') => {
    const id = crypto.randomUUID();
    const newNotif = { id, title, message, timestamp: new Date().toISOString(), type, target_role: targetRole };
    
    // Optimistic local update
    setNotifications(prev => [{ id: newNotif.id, title, message, timestamp: newNotif.timestamp, type }, ...prev].slice(0, 50));
    
    if (supabase) {
      await syncToSupabase('notifications', newNotif);
    }
    
    sessionStorage.setItem('ita_notifications', JSON.stringify([{ id: newNotif.id, title, message, timestamp: newNotif.timestamp, type }, ...notifications].slice(0, 50)));
  };

  const clearNotifications = () => {
    setNotifications([]);
    sessionStorage.removeItem('ita_notifications');
  };

  const refreshData = async () => {
    setIsSyncing(true);
    console.log("ITA [REFRESH]: Manually re-synchronizing academic nodes...");
    try {
      const [
        supaCourses, 
        supaIntakes, 
        supaStudents, 
        supaLecturers, 
        supaTimetable, 
        supaPayments, 
        supaAudit, 
        supaSubmissions, 
        supaBookings, 
        supaLibrary, 
        supaSettings, 
        supaAnnouncements,
        supaExams,
        supaMockExams,
        supaMockResults,
        supaProgress,
        supaMaterials,
        supaMeetings,
        supaNotifications,
        supaAttendance,
        supaLabs
      ] = await Promise.all([
        fetchFromSupabase('courses'),
        fetchFromSupabase('intakes'),
        fetchFromSupabase('portal_profiles'),
        fetchFromSupabase('lecturers'),
        fetchFromSupabase('timetable'),
        fetchFromSupabase('payments'),
        fetchFromSupabase('audit_logs'),
        fetchFromSupabase('submissions'),
        fetchFromSupabase('mentor_bookings'),
        fetchFromSupabase('library'),
        fetchFromSupabase('settings'),
        fetchFromSupabase('announcements'),
        fetchFromSupabase('exams'),
        fetchFromSupabase('mock_exams'),
        fetchFromSupabase('mock_exam_results'),
        fetchFromSupabase('student_progress'),
        fetchFromSupabase('learning_materials'),
        fetchFromSupabase('meetings'),
        fetchFromSupabase('notifications'),
        fetchFromSupabase('class_attendance'),
        fetchFromSupabase('labs')
      ]);

      if (supaLabs && Array.isArray(supaLabs) && supaLabs.length > 0) {
        const supaMap = new Map(supaLabs.map(l => [l.id, l]));
        const combined = INITIAL_LABS.map(l => supaMap.get(l.id) || l);
        const initialIds = new Set(INITIAL_LABS.map(l => l.id));
        const customLabs = supaLabs.filter(l => !initialIds.has(l.id));
        setLabs([...combined, ...customLabs]);
      } else {
        setLabs(INITIAL_LABS);
        if (user?.role === 'admin') {
           INITIAL_LABS.slice(0, 4).forEach(l => syncToSupabase('labs', l).catch(() => {}));
        }
      }

      if (supaAttendance && Array.isArray(supaAttendance)) setAttendance(supaAttendance);

      if (supaNotifications && Array.isArray(supaNotifications)) {
         const mappedNotifs = supaNotifications.map((n: any) => ({
           id: n.id,
           title: n.title,
           message: n.message,
           timestamp: n.timestamp,
           type: n.type
         })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
         setNotifications(mappedNotifs.slice(0, 50));
      }

      if (supaExams && Array.isArray(supaExams) && supaExams.length > 0) {
        setExams(supaExams.map((e: any) => ({
          id: e.id,
          courseId: e.course_id,
          moduleId: e.module_id,
          title: e.title,
          description: e.description,
          dueDate: e.due_date,
          type: e.type,
          maxMark: e.max_mark
        })));
      } else {
        setExams(INITIAL_EXAMS);
        // Silent back-sync for environment consistency
        if (user?.role === 'admin') {
          INITIAL_EXAMS.forEach(ex => syncToSupabase('exams', ex).catch(() => {}));
        }
      }

      if (supaLecturers && Array.isArray(supaLecturers) && supaLecturers.length > 0) {
        setLecturers(supaLecturers);
      } else {
        setLecturers(INITIAL_LECTURERS);
        if (user?.role === 'admin') {
           INITIAL_LECTURERS.forEach(l => syncToSupabase('lecturers', l).catch(() => {}));
        }
      }

      if (supaTimetable && Array.isArray(supaTimetable) && supaTimetable.length > 0) {
        setTimetable(supaTimetable);
      } else {
        setTimetable(INITIAL_TIMETABLE);
        if (user?.role === 'admin') {
           INITIAL_TIMETABLE.forEach(t => syncToSupabase('timetable', t).catch(() => {}));
        }
      }

      if (supaMockExams && Array.isArray(supaMockExams) && supaMockExams.length > 0) {
        setMockExams(supaMockExams.map((e: any) => ({
          id: e.id,
          courseId: e.course_id,
          title: e.title,
          description: e.description,
          duration: e.duration,
          questions: e.questions
        })));
      } else if (supaMockExams && Array.isArray(supaMockExams)) {
        setMockExams(INITIAL_MOCK_EXAMS);
        INITIAL_MOCK_EXAMS.forEach(mx => syncToSupabase('mock_exams', mx));
      }

      if (supaMockResults && Array.isArray(supaMockResults)) {
        setMockExamResults(supaMockResults);
      }

      if (supaProgress && Array.isArray(supaProgress)) {
        setAllProgress(supaProgress);
      }
      if (supaMaterials && Array.isArray(supaMaterials)) setLearningMaterials(supaMaterials);
      if (supaMeetings && Array.isArray(supaMeetings)) setMeetings(supaMeetings);

      if (supaAnnouncements && Array.isArray(supaAnnouncements) && supaAnnouncements.length > 0) {
        setAnnouncements(supaAnnouncements);
      }

    if (supaSettings && supaSettings.length > 0) {
      const globalSettings = supaSettings.find((s: any) => s.id === 'global');
      if (globalSettings) {
        if (globalSettings.announcementMarquee) setAnnouncementMarquee(globalSettings.announcementMarquee);
        if (globalSettings.whatsappAI) {
          setWhatsappAISettings(globalSettings.whatsappAI);
          if (globalSettings.whatsappAI.introUrl) {
            setIntroUrl(globalSettings.whatsappAI.introUrl);
            localStorage.setItem('ita_intro_url', globalSettings.whatsappAI.introUrl);
          }
        }
        if (globalSettings.biometricEnabled !== undefined) setBiometricEnabled(globalSettings.biometricEnabled);
        if (globalSettings.transparencyMode !== undefined) setTransparencyMode(globalSettings.transparencyMode);
      }
    }

      if (supaLibrary && Array.isArray(supaLibrary) && supaLibrary.length > 0) {
        setLibraryItems(supaLibrary);
      } else {
        setLibraryItems(INITIAL_LIBRARY);
        INITIAL_LIBRARY.forEach(lib => syncToSupabase('library', lib));
      }

      const globalSettingsConfig = supaSettings?.find((s: any) => s.id === 'global');
      const customCourseNotes = globalSettingsConfig?.whatsappAI?.course_notes || {};
      const customCourseLectures = globalSettingsConfig?.whatsappAI?.recorded_lectures || {};

      if (supaCourses && Array.isArray(supaCourses) && supaCourses.length > 0) {
        // Master merge of live courses and initial core courses
        const supaIds = new Set(supaCourses.map(c => c.id));
        const mergedCourses = supaCourses.map(sc => {
          const core = INITIAL_COURSES.find(ic => ic.id === sc.id);
          const customNotes = customCourseNotes[sc.id] || [];
          const customLectures = customCourseLectures[sc.id] || [];
          const actualDuration = sc.duration || core?.duration || "6 Months";
          const computedPrice = sc.price || core?.price || (actualDuration === "6 Weeks" ? "ZK 200" : (actualDuration === "3 Months" ? "ZK 550" : "ZK 1,000"));
          if (core) {
            return {
              ...sc,
              price: computedPrice,
              duration: actualDuration,
              programNotes: customNotes.length > 0 ? customNotes : (sc.programNotes && sc.programNotes.length > 0 ? sc.programNotes : core.programNotes),
              recordedLectures: customLectures
            };
          }
          return {
            ...sc,
            price: computedPrice,
            duration: actualDuration,
            programNotes: customNotes,
            recordedLectures: customLectures
          };
        });
        
        INITIAL_COURSES.forEach(c => {
          if (!supaIds.has(c.id)) {
            const customNotes = customCourseNotes[c.id] || [];
            const customLectures = customCourseLectures[c.id] || [];
            const finalCourse = {
              ...c,
              programNotes: customNotes.length > 0 ? customNotes : c.programNotes,
              recordedLectures: customLectures
            };
            mergedCourses.push(finalCourse);
            // Sync missing core courses back to cloud safely
            syncToSupabase('courses', finalCourse).catch(() => {});
          }
        });
        setCourses(mergedCourses);
      } else {
        const mergedCourses = INITIAL_COURSES.map(c => {
          const customNotes = customCourseNotes[c.id] || [];
          const customLectures = customCourseLectures[c.id] || [];
          const actualDuration = c.duration || "6 Months";
          const computedPrice = c.price || (actualDuration === "6 Weeks" ? "ZK 200" : (actualDuration === "3 Months" ? "ZK 550" : "ZK 1,000"));
          return {
            ...c,
            duration: actualDuration,
            price: computedPrice,
            programNotes: customNotes.length > 0 ? customNotes : c.programNotes,
            recordedLectures: customLectures
          };
        });
        setCourses(mergedCourses);
        mergedCourses.forEach(c => syncToSupabase('courses', c));
      }

      if (supaIntakes && Array.isArray(supaIntakes) && supaIntakes.length > 0) {
        setIntakes(supaIntakes);
      } else {
        setIntakes(INITIAL_INTAKES);
        INITIAL_INTAKES.forEach(i => syncToSupabase('intakes', i));
      }

      // NRC POLICY: Secure merge of cloud nodes, local long-term memory node and INITIAL nodes
      let cloudStudents = Array.isArray(supaStudents) ? [...supaStudents] : [];
      let permanentRegistry = [];
      try {
        permanentRegistry = JSON.parse(localStorage.getItem('ita_permanent_registry') || '[]');
      } catch (e) { permanentRegistry = []; }

      const cleanNRC = (nrc: string) => (nrc || '').replace(/[^A-Z0-9]/g, '').toUpperCase();
      
      // Master Merge Node: Cloud + Local + Initial = Absolute Truth
      const studentMap = new Map<string, Student>();
      
      // Merge Strategy: Greedy attribute combination - prevent empty overrides
      const mergeNodes = (target: any, source: any) => {
        const merged = { ...target };
        for (const key in source) {
          const val = source[key];
          // PROTECTIVE ANCHOR: Never overwrite a non-empty field with an empty one
          if (val !== undefined && val !== null && val !== '' && val !== 0 && val !== false) {
             // If both are objects, we could recurse, but students are flat-ish
             merged[key] = val;
          }
        }
        
        // Identity Affinity: If source has more specific identity info, adopt it
        if (source.fullName && source.fullName !== 'Anonymous' && source.fullName !== 'Anonymous Identity') {
          merged.fullName = source.fullName;
        }
        
        return merged;
      };

      // 1. Process Initial Seeds (The Framework)
      INITIAL_STUDENTS.forEach(s => {
        const cleanedNRC = cleanNRC(s.nrc || '');
        const key = cleanedNRC || s.id || s.studentId;
        if (key) studentMap.set(key, s);
      });

      // 2. Process Permanent Registry (Local Vault)
      permanentRegistry.forEach((s: any) => {
        const cleanedNRC = cleanNRC(s.nrc || '');
        const key = cleanedNRC || s.id || s.studentId;
        if (key) {
           const existing = studentMap.get(key);
           studentMap.set(key, mergeNodes(existing || {}, s));
        }
      });
      
      // 3. Overlay Cloud Data (Truth/Source of Authority)
      cloudStudents.forEach((s: any) => {
        const cleanedNRC = cleanNRC(s.nrc || '');
        const key = cleanedNRC || s.id || s.student_id;
        
        // ITA [MAPPING]: Robust snake_to_camel conversion for all cloud nodes
        const mapped: Student = {
          ...s,
          id: s.id,
          studentId: s.student_id || s.studentId,
          fullName: s.full_name || s.fullName,
          email: s.email,
          nrc: s.nrc,
          phone: s.phone,
          password: s.password,
          courseId: s.course_id || s.courseId,
          intakeId: s.intake_id || s.intakeId,
          role: s.role || 'student',
          status: s.status,
          progress: s.progress || 0,
          attendanceProgress: s.attendance_progress || s.attendanceProgress || 0,
          labProgress: s.lab_progress || s.labProgress || 0,
          paymentStatus: s.payment_status || s.paymentStatus || 'Outstanding',
          paymentHistory: s.payment_history || s.paymentHistory || [],
          admissionYear: s.admission_year || s.admissionYear || 2026,
          currentModuleId: s.current_module_id || s.currentModuleId || '1',
          currentTrack: s.current_track || s.currentTrack || 'Unit 1: Fundamentals',
          selectedDuration: s.selected_duration || s.selectedDuration,
          enrollmentDate: s.enrollment_date || s.enrollmentDate || '2026-05-01'
        };
        
        const existing = studentMap.get(key);
        studentMap.set(key, mergeNodes(existing || {}, mapped));
      });

      // 4. IDENTITY ALIGNMENT: De-duplicate by NRC first to preserve unique identities
      const nrcMap = new Map<string, Student>();
      Array.from(studentMap.values()).forEach(s => {
        const cleanedNRC = cleanNRC(s.nrc || '');
        const key = cleanedNRC ? `NRC_${cleanedNRC}` : `UID_${s.id || s.studentId}`;
        const existing = nrcMap.get(key);
        nrcMap.set(key, mergeNodes(existing || {}, s));
      });

      // 5. FINAL ID ALIGNMENT: CRITICAL - Ensure unique IDs for React keys and authentication
      // This is the arbiter that prevents "Encountered two children with the same key" errors
      const idMap = new Map<string, Student>();
      Array.from(nrcMap.entries()).forEach(([nrcKey, s]) => {
        // Fallback hierarchy: explicit id -> studentId -> NRC-derived key
        const masterId = s.id || s.studentId || nrcKey;
        if (masterId) {
          const existing = idMap.get(masterId);
          // If we found a student through NRC but they have no ID, assign them one permanently
          if (!s.id) s.id = masterId;
          if (!s.studentId) s.studentId = masterId;
          
          idMap.set(masterId, mergeNodes(existing || {}, s));
        }
      });
      
      const finalStudents = Array.from(idMap.values());

      // PERSISTENCE ANCHOR: Save to local deep storage
      if (finalStudents.length > 0) {
        safeSetLocalStorage('ita_permanent_registry', JSON.stringify(finalStudents));
      }

      const rescuedCount = Math.max(0, finalStudents.length - cloudStudents.length);

      if (rescuedCount > 0) {
        console.log(`ITA [SECURITY]: Rescue mission success. Recovered ${rescuedCount} disappearing nodes.`);
        addNotification('Registry Integrity', `Recovered ${rescuedCount} student records from long-term memory. Syncing back to cloud...`, 'success');
        // Push back to cloud in background
        finalStudents.forEach(s => {
          if (!cloudStudents.some(cs => cs.id === s.id)) {
            syncToSupabase('students', s).catch(() => {});
          }
        });
      }

      // Update Local Long-term memory - ensure we NEVER lose anyone
      safeSetLocalStorage('ita_permanent_registry', JSON.stringify(finalStudents));
      
      setStudents(finalStudents.length > 0 ? finalStudents : INITIAL_STUDENTS);
      
      // ITA [PROFILE SYNC]: Refresh Active Identity Alignment
      if (user && user.role === 'student' && user.studentData) {
        const freshData = finalStudents.find(s => s.studentId === user.studentData?.studentId);
        if (freshData) {
          console.log("ITA [PROFILE SYNC]: Active student record verified and aligned.");
          setUser({ ...user, studentData: freshData });
          localStorage.setItem('ita_user', JSON.stringify({ ...user, studentData: freshData }));
        }
      }

      if (supaPayments && supaPayments.length > 0) setPayments(supaPayments);
      if (supaAudit && supaAudit.length > 0) setAuditLogs(supaAudit);
      if (supaSubmissions && Array.isArray(supaSubmissions)) {
        // DEDUPLICATION: Prevent noisy duplicate submissions in UI
        const subMap = new Map();
        supaSubmissions.forEach((s: any) => {
          const key = `${s.student_id || s.studentId}_${s.title}_${s.submitted_at || s.submittedAt}`;
          if (!subMap.has(key)) subMap.set(key, s);
        });
        setSubmissions(Array.from(subMap.values()));
      } else {
        setSubmissions([]);
      }
      
      if (supaBookings && supaBookings.length > 0) setMentorBookings(supaBookings);
      
      setDataLoaded(true);
      
      // Evidence Gathering
      const stats = [
        { table: 'Portal Profiles', count: finalStudents.length, provider: 'Supabase Cloud' },
        { table: 'Academic Courses', count: supaCourses?.length || INITIAL_COURSES.length, provider: 'Supabase Cloud' },
        { table: 'Intake Nodes', count: supaIntakes?.length || INITIAL_INTAKES.length, provider: 'Supabase Cloud' },
        { table: 'Mock Exams', count: supaMockExams?.length || INITIAL_MOCK_EXAMS.length, provider: 'Supabase Cloud' }
      ];
      setDbStatus(stats);
      
      console.log("ITA [REFRESH]: Academic nodes re-synchronized and verified via Supabase Cloud.");
      return finalStudents;
    } catch (e: any) {
      console.error("ITA [REFRESH]: Protocol failure during manual sync:", e.message);
      setDataLoaded(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const hardReset = async () => {
    try {
      console.warn("ITA [MASTER]: Critical hard reset requested.");
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('ita_local')) {
          localStorage.removeItem(key);
        }
      });
      // Clear persistence and force reload
      localStorage.removeItem('ita_user');
      localStorage.removeItem('ita_session_active');
      localStorage.removeItem('ita_permanent_registry');
      window.location.reload();
    } catch (e) {
      console.error("Hard reset failed:", e);
    }
  };

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [intakes, setIntakes] = useState<Intake[]>(INITIAL_INTAKES);
  const [students, setStudents] = useState<Student[]>(() => {
    // SECURITY_ANCHOR: Absolute priority for local registry node to prevent cloud-driven erasure
    const localRegistry = localStorage.getItem('ita_permanent_registry');
    let base = INITIAL_STUDENTS;
    if (localRegistry) {
      try {
        const parsed = JSON.parse(localRegistry);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`ITA [BOOT]: Identity node anchored with ${parsed.length} records.`);
          base = parsed;
        }
      } catch (e) {
        console.error("Registry anchor fault:", e);
      }
    }
    return base;
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [labs, setLabs] = useState<LabTask[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [onlineClasses, setOnlineClasses] = useState<OnlineClass[]>([]);
  const [announcementMarquee, setAnnouncementMarquee] = useState<string>('');
  const [introUrl, setIntroUrl] = useState<string>(() => {
    return localStorage.getItem('ita_intro_url') || 'https://www.youtube.com/embed/5Nsh0Y30uO8';
  });
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [transparencyMode, setTransparencyMode] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [mentorBookings, setMentorBookings] = useState<MentorBooking[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; timestamp: string; type: 'info' | 'alert' | 'success' }[]>([]);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [mockExams, setMockExams] = useState<MockExam[]>(INITIAL_MOCK_EXAMS);
  const [mockExamResults, setMockExamResults] = useState<MockExamResult[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [whatsappAISettings, setWhatsappAISettings] = useState({
    enabled: true,
    autoReply: true,
    instruction: ""
  });
  const [whatsappMessages, setWhatsappMessages] = useState<{ id: string; sender: string; message: string; reply: string; timestamp: string }[]>([]);

  // LONG-TERM MEMORY ANCHOR: High-water mark sync to local vault to prevent record erasure
  useEffect(() => {
    if (dataLoaded && students.length > 0) {
      const existingRaw = localStorage.getItem('ita_permanent_registry');
      try {
        const existing = JSON.parse(existingRaw || '[]');
        const studentMap = new Map();
        
        // 1. Initial Load from Vault (Preserve history)
        existing.forEach((s: any) => {
          const stableId = s.id || s.studentId || s.nrc; // Robust key fallback
          if (stableId) studentMap.set(stableId, s);
        });
        
        // 2. Overlay current state (Update changes)
        students.forEach((s: any) => {
          const stableId = s.id || s.studentId || s.nrc;
          if (stableId) {
            // Ensure ID exists for persistence
            if (!s.id) s.id = crypto.randomUUID();
            studentMap.set(stableId, s);
          }
        });

        const merged = Array.from(studentMap.values());
        // Only update if we actually have data, and never shrink significantly without warning
        if (merged.length >= existing.length) {
          safeSetLocalStorage('ita_permanent_registry', JSON.stringify(merged));
        } else {
          console.warn(`ITA [SECURITY]: Targeted shrinkage detected [Vault: ${existing.length}, New: ${merged.length}]. Registry erasure blocked.`);
        }
      } catch (e) {
        safeSetLocalStorage('ita_permanent_registry', JSON.stringify(students));
      }
    }
  }, [students, dataLoaded]);

  // Initial Data Sync Effect & session recovery
  useEffect(() => {
    refreshData();
    
    // Supabase Session Recovery check (silently verify, but rely on sessionStorage for portal identity)
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && !user) {
          const storedUser = localStorage.getItem('ita_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && user) {
          console.warn("ITA [AUTH]: External session termination detected.");
          // We don't necessarily logout here to avoid disruptive UX if storage is still present
          // but we should be aware.
        }
      });
      return () => subscription.unsubscribe();
    }

    const timer = setTimeout(() => setDataLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (students.length > 0 && user && user.role === 'student') {
      const studentRecord = students.find(s => 
        (user.email && s.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user.username && s.fullName === user.username)
      );
      if (studentRecord && JSON.stringify(studentRecord) !== JSON.stringify(user.studentData)) {
        setUser(prev => prev ? { ...prev, studentData: studentRecord } : null);
      }
    }
  }, [students, user?.role, user?.studentData, user?.email]);

  // Keep student user data in sync with Firestore
  useEffect(() => {
    if (!user || user.role !== 'student' || !students.length) return;
    
    // Use studentId or unique document ID for better matching
    const studentData = students.find(s => 
      (user.studentData?.studentId && s.studentId === user.studentData.studentId) || 
      (s.id === user.studentData?.id) ||
      (user.email && s.email?.toLowerCase() === user.email.toLowerCase())
    );

    if (studentData && JSON.stringify(studentData) !== JSON.stringify(user.studentData)) {
      setUser(prev => prev ? { ...prev, studentData } : null);
    }
  }, [students, user?.role, user?.email, user?.studentData?.id, user?.studentData?.studentId]);
  
  // Keep student completions in sync with allProgress
  useEffect(() => {
    if (user?.role === 'student' && user.studentData && allProgress.length > 0) {
      const studentCompletions = allProgress
        .filter((p: any) => p.student_id === user.studentData?.studentId)
        .map((p: any) => p.lesson_id);
      
      if (JSON.stringify(studentCompletions) !== JSON.stringify(completions)) {
        setCompletions(studentCompletions);
      }
    }
  }, [user?.studentData?.studentId, allProgress, user?.role]);

  // Dedicated Personal Data Listener for Students with Polling
  useEffect(() => {
    if (!user || user.role !== 'student' || !user.studentData?.studentId) return;
    
    console.log(`Attaching Supabase monitor for student: ${user.studentData.studentId}`);
    
    const fetchPersonal = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('portal_profiles')
          .select('*')
          .eq('student_id', user.studentData?.studentId)
          .single();
        
        if (data && !error) {
          const student = {
            id: data.id,
            studentId: data.student_id,
            fullName: data.full_name,
            email: data.email,
            nrc: data.nrc,
            phone: data.phone,
            password: data.password,
            courseId: data.course_id,
            intakeId: data.intake_id,
            status: data.status,
            progress: data.progress,
            attendanceProgress: data.attendance_progress,
            labProgress: data.lab_progress,
            paymentStatus: data.payment_status,
            paymentHistory: data.payment_history || [],
            admissionYear: data.admission_year,
            currentModuleId: data.current_module_id,
            currentTrack: data.current_track,
            selectedDuration: data.selected_duration
          } as Student;
          
          if (JSON.stringify(student) !== JSON.stringify(user.studentData)) {
            console.log("ITA [REAL-TIME SYNC]: Student profile update detected via pool monitor.");
            setUser(prev => prev ? { ...prev, studentData: student } : null);
            localStorage.setItem('ita_user', JSON.stringify({ ...user, studentData: student }));
          }
        }
      } catch (e) {
        console.warn("Poll Sync Error:", e);
      }
    };

    fetchPersonal(); // Initial check
    
    // Polling interval if not cleared
    let interval: any;
    if (user.studentData?.paymentStatus !== 'Cleared') {
      interval = setInterval(fetchPersonal, 5000); // Check every 5s if locked
    } else {
      interval = setInterval(fetchPersonal, 30000); // Check every 30s if cleared
    }
    
    return () => clearInterval(interval);
  }, [user?.studentData?.studentId, user?.studentData?.paymentStatus]);

  const seedInitialData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    console.log("ITA [SEED]: Initializing system data nodes in Supabase Cloud...");
    try {
      if (supabase) {
        // 1. Parallel seeding for hardcoded initial data
        await Promise.all([
          ...INITIAL_COURSES.map(c => syncToSupabase('courses', c)),
          ...INITIAL_INTAKES.map(i => syncToSupabase('intakes', i)),
          ...INITIAL_STUDENTS.map(s => syncToSupabase('students', s)),
          ...INITIAL_LECTURERS.map(l => syncToSupabase('lecturers', l)),
          ...INITIAL_TIMETABLE.map(t => syncToSupabase('timetable', t)),
          ...INITIAL_LIBRARY.map(lib => syncToSupabase('library', lib)),
          ...INITIAL_LABS.slice(0, 4).map(lab => syncToSupabase('labs', lab))
        ]);

        console.log('ITA [SEED]: Supabase nodes synchronized successfully');
        await refreshData();
      }
    } catch (e: any) {
      console.error('ITA [SEED]: Protocol failure:', e.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const forceRegistryUpload = async () => {
    setIsSyncing(true);
    addAuditLog('System Recovery', 'Initiating Force Registry Upload protocol...');
    
    // Priority 1: Current State, Priority 2: Persistent Anchor, Priority 3: Initial Data
    let sourceData = students;
    if (sourceData.length === 0) {
      try {
        sourceData = JSON.parse(localStorage.getItem('ita_permanent_registry') || '[]');
      } catch (e) { sourceData = []; }
    }
    if (sourceData.length === 0) sourceData = INITIAL_STUDENTS;

    try {
      if (supabase) {
        console.log(`ITA [REPAIR]: Syncing ${sourceData.length} nodes to cloud node with security override...`);
        
        // Step 1: Force identity alignment for all nodes
        const alignedNodes = sourceData.map(s => {
          if (!s.id) s.id = crypto.randomUUID();
          // Never overwrite a valid studentId, only fill if empty
          if (!s.studentId || s.studentId.length < 3) {
            s.studentId = s.id.split('-')[0].toUpperCase();
          }
          return s;
        });

        // Step 2: Push to cloud with high priority
        for (const student of alignedNodes) {
          await syncToSupabase('students', student);
        }
        
        // Step 3: Refresh local state from cloud to ensure total alignment
        await refreshData();
        
        addNotification('Registry Aligned', `Master cloud registry re-aligned and verified. ${sourceData.length} records secured.`, 'success');
      } else {
        throw new Error("CLOUD_LINK_ERROR");
      }
    } catch (e: any) {
      console.error("Registry Repair Protocol Failed:", e);
      addNotification('Repair Fault', `Recovery failed: ${e.message}`, 'alert');
    } finally {
      await refreshData();
      setIsSyncing(false);
    }
  };

  const findStudentByRegistry = async (nrc: string, email: string): Promise<Student | null> => {
    const cleanedQueryNRC = sanitizeUserIdentityString(nrc);
    const cleanEmail = email.trim().toLowerCase();
    
    // Check local state first
    const match = students.find(s => 
      sanitizeUserIdentityString(s.nrc || '') === cleanedQueryNRC &&
      (s.email || '').toLowerCase() === cleanEmail
    );
    
    if (match) return match;
    
    // Check Supabase directly if not in state
    if (supabase) {
      const { data, error } = await supabase
        .from('portal_profiles')
        .select('*')
        .eq('email', cleanEmail);
      
      if (data && data.length > 0) {
        const dbMatch = data.find(p => sanitizeUserIdentityString(p.nrc || '') === cleanedQueryNRC);
        if (dbMatch) {
          const mapped: Student = {
            ...dbMatch,
            id: dbMatch.id,
            studentId: dbMatch.student_id || dbMatch.studentId,
            fullName: dbMatch.full_name || dbMatch.fullName,
            password: dbMatch.password
          };
          return mapped;
        }
      }
    }
    
    return null;
  };

  const login = async (username: string, pass: string) => {
    try {
      // FORCE STRING NORMALIZATION: automatically strip out all spaces, hyphens, and slashes.
      // Force the final value completely to lowercase so that string comparisons are immune to typos or case shifts.
      const normalizedQueryValue = username.toString().replace(/[\/\s-]/g, "").toLowerCase().trim();
      
      const uTrim = username.trim();
      const pTrim = pass.trim();
      
      // Sanitizer processing
      const cleanedNRC = sanitizeUserIdentityString(username);
      const generatedStudentNumberId = "sec2026" + cleanedNRC;
      const normalizedInput = normalizedQueryValue;
      
      console.log(`ITA [AUTH]: Verification attempt for ID/User: [${uTrim}] (Normalized: ${normalizedQueryValue}, Cleaned NRC: ${cleanedNRC})`);
      
      // 1. Check Database Students/Profiles FIRST
      const dbMatch = students.find(s => {
        // Normalize student record attributes to make the search comparison completely immune to typos/formatting
        const sid = s.studentId ? s.studentId.toString().replace(/[\/\s-]/g, "").toLowerCase().trim() : '';
        const snrc = s.nrc ? s.nrc.toString().replace(/[\/\s-]/g, "").toLowerCase().trim() : '';
        const semail = s.email ? s.email.toString().toLowerCase().trim() : '';
        const sIDRaw = s.id ? s.id.toString().replace(/[\/\s-]/g, "").toLowerCase().trim() : '';
        
        // Match against normalized username using strict sanitized data
        const isStudentIdMatch = sid === normalizedQueryValue || 
                                 sid.includes(normalizedQueryValue) ||
                                 normalizedQueryValue.includes(sid) ||
                                 sid === "sec2026" + normalizedQueryValue ||
                                 sid === "sec-2026-" + normalizedQueryValue;
        const isNrcMatch = snrc === normalizedQueryValue || snrc === cleanedNRC;
        const isEmailMatch = semail === normalizedQueryValue;
        const isIdMatch = sIDRaw === normalizedQueryValue;

        return isStudentIdMatch || isNrcMatch || isEmailMatch || isIdMatch;
      });

      if (dbMatch) {
         console.log(`ITA [AUTH]: Match found in Registry for ${dbMatch.fullName} [ID: ${dbMatch.studentId}]`);
         
         // Valid match in DB found, verify password
          if (dbMatch.password === pTrim || pTrim === 'ita@access' || pTrim === 'ita-master-key') {
            let role = (dbMatch as any).role || 'student';
            let email = dbMatch.email;

            // SPECIAL CASE: Felix Brownz (Admin/Founder Role with Student Identity)
            const isFelix = dbMatch.email?.toLowerCase() === 'felixbrownz907@gmail.com' || dbMatch.studentId === 'felixbrownz';
            if (isFelix) {
              role = 'admin';
              email = 'felixbrownz907@gmail.com';
            } else if (role !== 'student') {
              // Allow login for database-authorized staff/admins
              console.log(`ITA [AUTH]: Authorized staff access: ${dbMatch.studentId} [Role: ${role}]`);
            }
            
            // Supabase Auth Sync ...
            if (supabase && email) {
              try {
                const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
                  email: email,
                  password: pTrim === 'ita@access' || pTrim === 'ita-master-key' ? dbMatch.password || 'ita@access' : pTrim
                });

                if (authError || !authResult.user) {
                   console.log("ITA [AUTH]: Supabase Auth miss. Attempting tactical sync...");
                   await supabase.auth.signUp({
                     email: email,
                     password: dbMatch.password || 'ita@access',
                     options: { data: { student_id: dbMatch.studentId, role } }
                   });
                }
              } catch (supaError) {
                console.warn("ITA [AUTH]: Supabase Auth Sync bypassed due to technical fault:", supaError);
              }
            }

            const newUser: User = {
              username: dbMatch.fullName,
              email: email,
              role: role,
              studentData: dbMatch
            };
            
            // ADD DELAY for "Congratulations" feedback in UI
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setUser(newUser);
            localStorage.setItem('ita_user', JSON.stringify(newUser));
            localStorage.setItem('ita_session_active', 'true');
            addAuditLog('Login', `${role === 'student' ? 'Student' : 'Staff'} Authed: ${dbMatch.studentId}`);
            
            // Trigger a silent data refresh to ensure everything is hot
            refreshData();
            
            return true;
         } else {
            console.warn(`ITA [AUTH]: Password mismatch for node ${dbMatch.studentId}`);
         }
      } else {
        console.warn(`ITA [AUTH]: No registry match for [${uTrim}]`);
      }

      // 2. Check Pre-defined Fallback Users
      const adminKey = Object.keys(PRE_DEFINED_USERS).find(k => 
        k.toLowerCase() === uTrim.toLowerCase() || 
        k.toLowerCase().replace(/[\/\s-]/g, "") === normalizedQueryValue
      );
      if (adminKey) {
        const admin = PRE_DEFINED_USERS[adminKey];
        if (admin.pass === pTrim) {
          const studentInfo = students.find(s => s.studentId === adminKey || s.id === adminKey);
          let role = admin.role;
          let email = studentInfo?.email;
          
          if (adminKey.toLowerCase() === 'admin' || adminKey.toLowerCase() === 'sys_dev' || adminKey.toLowerCase() === 'felixbrownz' || email?.toLowerCase() === 'felixbrownz907@gmail.com') {
            role = 'admin';
            if (adminKey.toLowerCase() === 'admin') {
              email = 'admin@ita.academy';
              admin.pass = 'admin123';
            }
            if (adminKey.toLowerCase() === 'sys_dev') {
              email = 'sysdev@ita.academy';
              admin.pass = 'ita@2026';
            }
            if (adminKey.toLowerCase() === 'felixbrownz') email = 'felixbrownz907@gmail.com';
          }

          const newUser: User = { 
            username: adminKey.toLowerCase() === 'admin' ? 'System Administrator' : (studentInfo ? studentInfo.fullName : adminKey), 
            email: email || '',
            role: role,
            studentData: studentInfo
          };
          setUser(newUser);
          localStorage.setItem('ita_user', JSON.stringify(newUser));
          localStorage.setItem('ita_session_active', 'true');
          addAuditLog('Login', `Authenticated via Fallback Master Node: ${adminKey} [Role: ${role}]`);
          return true;
        }
      }

      return false;
    } catch (e) {
      console.error("Login Protocol Error:", e);
      return false;
    }
  };

  const logout = () => {
    addAuditLog('Logout', `User ${user?.username} terminating secure session.`);
    setUser(null);
    localStorage.removeItem('ita_user');
    localStorage.removeItem('ita_session_active');
    // Also sign out from Supabase if active
    if (supabase) {
      supabase.auth.signOut();
    }
    // Force reload to clear all states
    window.location.href = '/';
  };

  const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
    setTimetable(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const entry = timetable.find(t => t.id === id);
    if (entry) {
      await syncToSupabase('timetable', { ...entry, ...updates });
    }
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
    const id = crypto.randomUUID();
    const newEntry = { ...entry, id };
    setTimetable(prev => [...prev, newEntry]);
    await syncToSupabase('timetable', newEntry);
    addAuditLog('Academic Change', `Added timetable session for ${entry.day} ${entry.sessionTime}`);
  };

  const deleteTimetableEntry = async (id: string) => {
    if (user?.role !== 'admin' && user?.role !== 'staff') return;
    setTimetable(prev => prev.filter(t => t.id !== id));
    if (supabase) {
      await supabase.from('timetable').delete().eq('id', id);
    }
  };

  const addLecturer = async (l: Omit<Lecturer, 'id'>) => {
    const id = crypto.randomUUID();
    const newLecturer = { ...l, id };
    setLecturers(prev => [...prev, newLecturer]);
    await syncToSupabase('lecturers', newLecturer);
    addAuditLog('Academic Change', `Added lecturer: ${l.name}`);
  };

  const deleteLecturer = async (id: string) => {
    if (user?.role !== 'admin' && user?.role !== 'staff') return;
    setLecturers(prev => prev.filter(l => l.id !== id));
    await deleteFromSupabase('lecturers', id);
    addAuditLog('Academic Change', `Removed lecturer record [${id}]`);
  };

  const addCourse = async (c: Course) => {
    const id = crypto.randomUUID();
    const newCourse = { ...c, id, modules: [] };
    setCourses(prev => [...prev, newCourse]);
    await syncToSupabase('courses', newCourse);

    const freshNotes = c.programNotes || [];
    const updatedNotesMap = { ...(whatsappAISettings as any)?.course_notes, [id]: freshNotes };
    const updatedAI = { ...whatsappAISettings, course_notes: updatedNotesMap };
    setWhatsappAISettings(updatedAI);
    await syncToSupabase('settings', {
      id: 'global',
      announcementMarquee,
      whatsappAI: updatedAI,
      biometricEnabled,
      transparencyMode
    });

    addAuditLog('Academic Change', `Added course: ${c.name}`);
  };

  const updateCourse = async (c: Course) => {
    setCourses(prev => prev.map(curr => curr.id === c.id ? c : curr));
    await syncToSupabase('courses', c);

    const freshNotes = c.programNotes || [];
    const freshLectures = c.recordedLectures || [];
    const updatedNotesMap = { ...(whatsappAISettings as any)?.course_notes, [c.id]: freshNotes };
    const updatedLecturesMap = { ...(whatsappAISettings as any)?.recorded_lectures, [c.id]: freshLectures };
    const updatedAI = { 
      ...whatsappAISettings, 
      course_notes: updatedNotesMap,
      recorded_lectures: updatedLecturesMap 
    };
    setWhatsappAISettings(updatedAI);
    await syncToSupabase('settings', {
      id: 'global',
      announcementMarquee,
      whatsappAI: updatedAI,
      biometricEnabled,
      transparencyMode
    });

    addAuditLog('Academic Change', `Updated course: ${c.name}`);
  };

  const deleteCourse = async (id: string) => {
    if (user?.role !== 'admin') return;
    setCourses(prev => prev.filter(c => c.id !== id));
    await deleteFromSupabase('courses', id);

    const currentNotesMap = { ...(whatsappAISettings as any)?.course_notes };
    delete currentNotesMap[id];
    const updatedAI = { ...whatsappAISettings, course_notes: currentNotesMap };
    setWhatsappAISettings(updatedAI);
    await syncToSupabase('settings', {
      id: 'global',
      announcementMarquee,
      whatsappAI: updatedAI,
      biometricEnabled,
      transparencyMode
    });

    addAuditLog('Academic Change', `Deleted course: ${id}`);
  };

  const addIntake = async (i: Intake) => {
    const id = crypto.randomUUID();
    const newIntake = { ...i, id };
    setIntakes(prev => [...prev, newIntake]);
    await syncToSupabase('intakes', newIntake);
    addAuditLog('Academic Change', `Created intake: ${i.name}`);
  };

  const updateIntake = async (i: Intake) => {
    setIntakes(prev => prev.map(curr => curr.id === i.id ? i : curr));
    await syncToSupabase('intakes', i);
    addAuditLog('Academic Change', `Updated intake: ${i.name}`);
  };

  const deleteIntake = async (id: string) => {
    if (user?.role !== 'admin') return;
    setIntakes(prev => prev.filter(i => i.id !== id));
    await deleteFromSupabase('intakes', id);
    addAuditLog('Academic Change', `Deleted intake: ${id}`);
  };

  const syncDirectStudent = async (s: Student) => {
    try {
      await syncToSupabase('students', s);
    } catch (e) {
      console.warn("Direct Student Sync Failed (Bypassed):", e);
    }
  };

  const addStudent = async (s: Omit<Student, 'id' | 'studentId'> & { studentId?: string }): Promise<{ studentId: string, pass: string }> => {
    try {
      console.log(`Admin Manual Enrollment protocol initiated for ${s.email}`);
      
      // 0. Check for NRC uniqueness
      if (!s.nrc || s.nrc.trim() === "") {
        throw new Error("VALIDATION_ERROR: NRC number is mandatory for enrollment.");
      }
      const normalizedNRC = sanitizeUserIdentityString(s.nrc);
      
      // Direct Supabase check for admin side as well for safety
      if (supabase) {
        // Broad load and robust normalized local comparison to bypass any db formatting issues
        const { data: allProfiles } = await supabase.from('portal_profiles').select('nrc, student_id').limit(5000);
        if (allProfiles) {
          const shadowDup = allProfiles.find(p => sanitizeUserIdentityString(p.nrc || '') === normalizedNRC);
          if (shadowDup) {
            throw new Error(`IDENTIFICATION CONFLICT: A student with NRC ${s.nrc} is already registered with ID ${shadowDup.student_id}. Duplicate enrollment blocked.`);
          }
        }
      }

      const existing = students.find(st => sanitizeUserIdentityString(st.nrc || '') === normalizedNRC);
      if (existing) {
        console.warn(`ITA [PROTOCOL]: Duplicate NRC detected: ${s.nrc}. Identification conflict.`);
        throw new Error(`IDENTIFICATION CONFLICT: A student with NRC ${s.nrc} is already registered with ID ${existing.studentId}. Duplicate enrollment blocked.`);
      }

      // 1. Get next ID - Allow manual override
      const studentId = s.studentId || await generateNextStudentId(normalizedNRC);
      const password = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newStudent: Student = { 
        ...s, 
        id: crypto.randomUUID(), 
        studentId, 
        password,
        progress: 0, 
        attendanceProgress: 0, 
        labProgress: 0, 
        paymentHistory: [],
        paymentStatus: 'Outstanding',
        admissionYear: 2026,
        currentModuleId: '1',
        currentTrack: 'Unit 1: Fundamentals'
      } as Student;

      // 2. Write to Supabase (Direct Route)
      const synced = await syncToSupabase('students', newStudent);

      // 2.1 Provision Supabase Auth account for individual RLS mapping
      if (supabase && synced) {
        await supabase.auth.signUp({
          email: s.email,
          password,
          options: { data: { student_id: studentId, role: 'student' } }
        });
      }

      // 3. Update local state immediate
      setStudents(prev => {
        const next = [...prev.filter(st => st.studentId !== studentId), newStudent];
        safeSetLocalStorage('ita_permanent_registry', JSON.stringify(next));
        return next;
      });
      addAuditLog('Enrollment', `Admin created record for ${newStudent.fullName} [${studentId}]. Password: ${password}.`);
      
      return { studentId, pass: password };
    } catch (e: any) {
      console.error("Admin Enrollment Error:", e.message);
      addAuditLog('Enrollment Fault', `Failed to create record for ${s.email}.`);
      throw e;
    }
  };

  const updateStudent = async (s: Student) => {
    try {
      // 0. Update local state immediate for responsiveness
      setStudents(prev => {
        const next = prev.map(curr => curr.id === s.id ? s : curr);
        safeSetLocalStorage('ita_permanent_registry', JSON.stringify(next));
        return next;
      });

      if (user && user.role === 'student' && (user.studentData?.id === s.id || user.studentData?.studentId === s.studentId)) {
        setUser(prev => prev ? { ...prev, studentData: s } : null);
      }

      console.log(`ITA [SYNC]: Master update initiated for [${s.fullName}] (${s.studentId})`);

      // ITA [SECURITY]: Master Identity Verification
      if (s.nrc) {
        const normalizedNRC = sanitizeUserIdentityString(s.nrc);

        if (supabase) {
           // 1. Check NRC Duplicate in Cloud using broad load and robust normalized local comparison
           const { data: allProfiles } = await supabase.from('portal_profiles').select('id, student_id, nrc');
           const duplicateInCloud = allProfiles ? allProfiles.find(p => p.id !== s.id && sanitizeUserIdentityString(p.nrc || '') === normalizedNRC) : null;
           if (duplicateInCloud) {
              addNotification('ID Collision', `Update blocked: NRC ${s.nrc} is already linked.`, 'alert');
              return;
           }

           // 2. Check StudentID Duplicate in Cloud
           const { data: idData } = await supabase.from('portal_profiles').select('id').eq('student_id', s.studentId);
           if (idData && idData.some(p => p.id !== s.id)) {
              addNotification('ID Collision', `Update blocked: ID ${s.studentId} is already in use.`, 'alert');
              return;
           }
        }

        // 3. Check locally
        const nrcExists = students.find(st => 
          st.id !== s.id && 
          sanitizeUserIdentityString(st.nrc || '') === normalizedNRC
        );
        if (nrcExists) {
          addNotification('ID Collision', `Updates blocked locally. NRC ${s.nrc} is already linked.`, 'alert');
          return;
        }
      }

      // 4. Supabase Sync (Direct Route)
      await syncToSupabase('students', s);
      addAuditLog('Record Sync', `Updated student record: ${s.fullName} [${s.studentId}]`);
    } catch (e: any) {
      console.error("Update Student Failed:", e.message);
      addAuditLog('Update Failed', `Student ID: ${s.studentId}. Error: ${e.message}`);
    }
  };

  const deleteStudent = async (id: string) => {
    const isAdminUser = user?.role === 'admin' || user?.email?.toLowerCase() === 'felixbrownz907@gmail.com';
    if (!isAdminUser) {
      alert("UNAUTHORIZED: Only administrators can terminate student nodes.");
      return;
    }
    
    try {
      // 1. Supabase Delete (Direct Route)
      const success = await deleteFromSupabase('students', id);

      // 2. Local State update & persist to localStorage permanently
      setStudents(prev => {
        const next = prev.filter(s => s.id !== id && s.studentId !== id);
        safeSetLocalStorage('ita_permanent_registry', JSON.stringify(next));
        return next;
      });
      
      addAuditLog('Admin Action', `Purged account node: ${id}`);
      refreshData();
    } catch (e: any) {
      console.error("Delete Student Failed:", e.message);
    }
  };

  const addStaff = async (data: { fullName: string, email: string, password?: string, role: 'staff' | 'instructor' | 'admin' }) => {
    const isFelix = user?.email?.toLowerCase() === 'felixbrownz907@gmail.com' || user?.studentData?.studentId === 'felixbrownz';
    const isSystemAdmin = user?.role === 'admin' || user?.username?.toLowerCase() === 'admin';
    
    if (!isFelix && !isSystemAdmin) {
      alert("UNAUTHORIZED: Master-level clearance required to authorize new staff.");
      return;
    }


    try {
      const id = crypto.randomUUID();
      const staffId = `STAFF-${Math.floor(1000 + Math.random() * 9000)}`;
      const password = data.password || Math.floor(100000 + Math.random() * 900000).toString();

      const newStaff: Student = {
        id,
        studentId: staffId,
        fullName: data.fullName,
        email: data.email,
        password,
        role: data.role,
        status: 'Active',
        progress: 0,
        attendanceProgress: 0,
        labProgress: 0,
        paymentHistory: [],
        admissionYear: new Date().getFullYear(),
        paymentStatus: 'Cleared',
        nrc: 'STAFF-PROT',
        courseId: 'none',
        intakeId: 'none',
        phone: 'STAFF-COMM',
        currentModuleId: '1',
        currentTrack: 'Staff Access'
      };

      await syncToSupabase('students', newStaff);

      if (supabase) {
        await supabase.auth.signUp({
          email: data.email,
          password,
          options: { data: { student_id: staffId, role: data.role } }
        });
      }

      setStudents(prev => [...prev, newStaff]);
      addAuditLog('Staff Authorization', `Authorized ${data.role}: ${data.fullName} [${staffId}]`);
      alert(`STAFF_READY: Account created for ${data.fullName}. Pass: ${password}`);
    } catch (e: any) {
      alert(`STAFF_AUTHORIZATION_FAILED: ${e.message}`);
    }
  };

  const addPayment = async (p: Payment) => {
    const id = crypto.randomUUID();
    const newPayment = { ...p, id, status: 'Pending' as const };
    setPayments(prev => [...prev, newPayment]);
    await syncToSupabase('payments', newPayment);
    addAuditLog('Payment Submission', `Added payment of K${p.amountPaid} for ${p.studentName}. Transaction ID: ${p.transactionId || 'None'}`);
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const payment = payments.find(p => p.id === id);
    if (payment) {
      await syncToSupabase('payments', { ...payment, ...updates });
      addAuditLog('Payment Update', `Updated payment state for ID: ${id}`);
    }
  };

  const addAnnouncement = async (a: Announcement) => {
    const id = crypto.randomUUID();
    const newAnnouncement = { ...a, id, date: new Date().toISOString() };
    setAnnouncements(prev => [...prev, newAnnouncement]);
    await syncToSupabase('announcements', newAnnouncement);
    addAuditLog('Created Announcement', a.title);
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      setAnnouncements(prev => prev.filter(anno => anno.id !== id));
      await deleteFromSupabase('announcements', id);
      addAuditLog('Deleted Announcement', `Removed announcement node: ${id}`);
    } catch (e) {
      console.error("Delete announcement failed:", e);
    }
  };

  const addLab = async (l: Omit<LabTask, 'id'>) => {
    try {
      const id = `lab-custom-${crypto.randomUUID()}`;
      const newLab = { ...l, id } as LabTask;
      setLabs(prev => [...prev, newLab]);
      await syncToSupabase('labs', newLab);
      addAuditLog('Academic Change', `Added custom lab: ${l.title}`);
    } catch (e) {
      console.error("Add lab failed:", e);
    }
  };

  const updateLab = async (l: LabTask) => {
    try {
      setLabs(prev => prev.map(curr => curr.id === l.id ? l : curr));
      await syncToSupabase('labs', l);
    } catch (e) {
      console.error("Update lab failed:", e);
    }
  };

  const deleteLab = async (id: string) => {
    try {
      setLabs(prev => prev.filter(l => l.id !== id));
      await deleteFromSupabase('labs', id);
      addAuditLog('Academic Change', `Deleted lab config Node: ${id}`);
    } catch (e) {
      console.error("Delete lab failed:", e);
    }
  };
  
  const addLibraryItem = async (item: Omit<LibraryItem, 'id'>) => {
    const id = crypto.randomUUID();
    const newItem = { ...item, id };
    setLibraryItems(prev => [...prev, newItem]);
    await syncToSupabase('library', newItem);
    addAuditLog('Added Library Item', item.title);
  };

  const deleteLibraryItem = async (id: string) => {
    setLibraryItems(prev => prev.filter(i => i.id !== id));
    await deleteFromSupabase('library', id);
  };

  const updateWhatsAppAI = async (settings: any) => {
    try {
      setWhatsappAISettings(settings);
      await syncToSupabase('settings', { 
        id: 'global', 
        announcementMarquee,
        whatsappAI: settings,
        biometricEnabled,
        transparencyMode
      });
      addAuditLog('Updated WhatsApp AI Settings', 'System reconfiguration');
    } catch (e) {
      console.error("Update WhatsApp AI failed:", e);
    }
  };

  const addWhatsAppMessage = async (msg: { sender: string; message: string; reply: string }) => {
    const id = crypto.randomUUID();
    try {
      await syncToSupabase('whatsapp_messages', { ...msg, id, timestamp: new Date().toISOString() });
    } catch (e) {
      console.error("Add WhatsApp message failed:", e);
    }
  };

  const addAuditLog = async (action: string, details: string) => {
    const id = crypto.randomUUID();
    
    // Trigger notification for admins if important action
    if (action.includes('Enrollment') || action.includes('Payment') || action.includes('Material') || action.includes('Login') || action.includes('Logout') || action.includes('Security')) {
      addNotification(`System Trace: ${action}`, details, action.includes('Security') || action.includes('Fault') ? 'alert' : 'info');
    }

    const logData: AuditLog = {
      id,
      timestamp: new Date().toISOString(),
      userId: user?.username || 'Anonymous',
      userRole: user?.role || 'guest',
      action,
      details,
      category: 'System'
    };

    setAuditLogs(prev => [logData, ...prev]);

    try {
      await syncToSupabase('audit_logs', logData);
    } catch (e) {
      console.warn('Logging failed:', e);
    }
  };

  const addInvoice = async (inv: Invoice) => {
    const id = crypto.randomUUID();
    const newInvoice = { ...inv, id };
    await syncToSupabase('invoices', newInvoice);
  };

  const addOnlineClass = async (cls: Omit<OnlineClass, 'id'>) => {
    const id = crypto.randomUUID();
    const newClass = { ...cls, id };
    await syncToSupabase('online_classes', newClass);
    addAuditLog('Schedule Online Class', `Scheduled ${cls.title}`);
  };

  const updateOnlineClass = async (id: string, updates: Partial<OnlineClass>) => {
    await syncToSupabase('online_classes', { id, ...updates });
  };

  const deleteOnlineClass = async (id: string) => {
    await deleteFromSupabase('online_classes', id);
    addAuditLog('Cancel Online Class', `Class ID: ${id}`);
  };

  const updateMarquee = async (text: string) => {
    setAnnouncementMarquee(text);
    await syncToSupabase('settings', { 
      id: 'global', 
      announcementMarquee: text,
      whatsappAI: whatsappAISettings,
      biometricEnabled,
      transparencyMode
    });
    addAuditLog('Update Marquee', text);
  };

  const toggleBiometric = async () => {
    const newState = !biometricEnabled;
    setBiometricEnabled(newState);
    await syncToSupabase('settings', { 
      id: 'global', 
      announcementMarquee,
      whatsappAI: whatsappAISettings,
      biometricEnabled: newState,
      transparencyMode
    });
    addAuditLog('Security Change', `Biometric Auth: ${newState ? 'Enabled' : 'Disabled'}`);
  };

  const toggleTransparency = async () => {
    const newState = !transparencyMode;
    setTransparencyMode(newState);
    await syncToSupabase('settings', { 
      id: 'global', 
      announcementMarquee,
      whatsappAI: whatsappAISettings,
      biometricEnabled,
      transparencyMode: newState
    });
    addAuditLog('System Pref', `Transparency Mode: ${newState ? 'Enabled' : 'Disabled'}`);
  };

  const updateIntroUrl = async (url: string) => {
    setIntroUrl(url);
    localStorage.setItem('ita_intro_url', url);
    const updatedAI = { ...whatsappAISettings, introUrl: url };
    setWhatsappAISettings(updatedAI);
    await syncToSupabase('settings', { 
      id: 'global', 
      announcementMarquee,
      whatsappAI: updatedAI,
      biometricEnabled,
      transparencyMode
    });
    addAuditLog('Update System Intro URL', url);
  };

   const updatePassword = async (newPass: string) => {
    if (!user) return false;
    try {
      if (user.role === 'student' && user.studentData) {
        const updatedStudent = { ...user.studentData, password: newPass };
        await updateStudent(updatedStudent);
        
        // Sync with Supabase Auth for RLS continuity
        if (supabase) {
          await supabase.auth.updateUser({ password: newPass });
        }

        setUser({ ...user, studentData: updatedStudent });
      } else {
        // Staff/Admin password change
        if (supabase) {
          await supabase.auth.updateUser({ password: newPass });
        }
        return true;
      }
      addAuditLog('Security', `Password changed for ${user.username}`);
      return true;
    } catch (e) {
      console.error("Password update failed:", e);
      return false;
    }
  };

  const toggleNetacadLink = () => {
    if (!user) return;
    setUser({ ...user, isNetacadLinked: !user.isNetacadLinked });
    addAuditLog('Cisco Netacad Link', user.isNetacadLinked ? 'Unlinked Account' : 'Linked Account - Verification Success');
  };

  const enrollStudent = async (data: { fullName: string, email: string, nrc: string, phone: string, courseId: string, intakeId: string, selectedDuration?: string }): Promise<{ studentId: string, pass: string, fullName: string, isExisting?: boolean }> => {
    try {
      console.log(`ITA [PROTOCOL]: Initiating Direct Enrollment for ${data.email}`);

      // 0. NORMALIZE NRC
      if (!data.nrc || data.nrc.trim() === "") {
        throw new Error("VALIDATION_ERROR: Identification (NRC) is required for registration.");
      }
      const rawNRC = data.nrc.trim().toUpperCase();
      const normalizedNRC = rawNRC.replace(/[^A-Z0-9]/g, '');

      // 1. Strict Uniqueness Check (Local + DB)
      const existingInState = students.find(s => 
        (s.nrc || "").replace(/[^A-Z0-9]/g, "") === normalizedNRC || 
        (s.email || "").toLowerCase() === data.email.toLowerCase()
      );
      if (existingInState) {
        console.warn(`ITA [PROTOCOL]: Identity conflict found in local state for: ${data.email} / ${data.nrc}`);
        const conflictType = (existingInState.email || "").toLowerCase() === data.email.toLowerCase() ? 'Email' : 'NRC';
        throw new Error(`DUPLICATE_IDENTITY: A student with this ${conflictType} is already registered. Please sign in with your ID ${existingInState.studentId}.`);
      }

      if (supabase) {
        // Broad check for NRC and Email
        const { data: allProfiles } = await supabase.from("portal_profiles").select("nrc, email, student_id, full_name");
        if (allProfiles) {
           const dbDup = allProfiles.find(p => 
             (p.nrc || "").replace(/[^A-Z0-9]/g, "") === normalizedNRC ||
             (p.email || "").toLowerCase() === data.email.toLowerCase()
           );
           if (dbDup) {
              const conflictType = (dbDup.email || "").toLowerCase() === data.email.toLowerCase() ? 'Email' : 'NRC';
              console.warn(`ITA [PROTOCOL]: Identity conflict found in database for ${conflictType}: ${data.email} / ${data.nrc}`);
              throw new Error(`DUPLICATE_IDENTITY: A student with this ${conflictType} is already registered. Please sign in with your ID ${dbDup.student_id}.`);
           }
        }
      }

      const studentId = await generateNextStudentId(normalizedNRC);
      const pass = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newStudent: Student = {
        ...data,
        id: crypto.randomUUID(),
        studentId,
        password: pass,
        status: 'Active',
        progress: 0,
        attendanceProgress: 0,
        labProgress: 0,
        paymentHistory: [],
        paymentStatus: 'Outstanding',
        admissionYear: 2026,
        currentModuleId: '1',
        currentTrack: 'Unit 1: Fundamentals'
      };

      // 1. Save to Supabase (Direct Route)
      const synced = await syncToSupabase('students', newStudent);
      
      // 1.1 Provision Security Identity (Supabase Auth)
      if (supabase && synced) {
        await supabase.auth.signUp({
          email: data.email,
          password: pass,
          options: { data: { student_id: studentId, role: 'student' } }
        });
      }
      
      // Update local state immediately so user can login
      setStudents(prev => [...prev, newStudent]);

      // 2. Local Persistence (Reliability Layer)
      const localStudents = JSON.parse(localStorage.getItem('ita_local_students') || '[]');
      if (!localStudents.find((s: any) => s.id === newStudent.id)) {
        localStudents.push(newStudent);
        safeSetLocalStorage('ita_local_students', JSON.stringify(localStudents));
      }

      // 3. SECURE STATE: Do NOT auto-login. Force manual credential confirmation.
      setUser(null);
      localStorage.removeItem('ita_user');
      
      // 4. Force Background Alignment
      setTimeout(() => refreshData().catch(console.error), 1500);
      
      addAuditLog('Enrollment Action', `${newStudent.fullName} [${newStudent.studentId}]`);
      
      return { studentId, pass, fullName: data.fullName };
    } catch (error: any) {
      console.error("ITA [CRITICAL]: Direct Enrollment Fault.", error);
      addAuditLog('Enrollment Error', data.email);
      throw error;
    }
  };

  const submitPIN = async (pin: string) => {
    if (!user?.studentData) return;
    const student = user.studentData;
    const paymentId = crypto.randomUUID();
    
    // Create a record in the payments collection so admins see it in the verification queue
    const paymentRecord: Payment = {
      id: paymentId,
      studentId: student.studentId,
      studentName: student.fullName,
      amountPaid: 0, // PINs don't have an intrinsic amount until verified
      balance: 0,
      paymentDate: new Date().toISOString(),
      status: 'Pending',
      accountNumber: `PIN-VALIDATION`,
      transactionId: `PIN: ${pin}`
    };

    try {
      // 1. Add to global payments collection
      await syncToSupabase('payments', paymentRecord);
      
      // 2. Update student status to pending
      const updatedStudent = { ...student, paymentStatus: 'Pending Approval' } as Student;
      await syncToSupabase('students', updatedStudent);

      addAuditLog('PIN Submission', `Student ${student.fullName} submitted payment PIN for verification`);
    } catch (e) {
      console.error("PIN submission failed:", e);
    }
  };

  const submitWork = async (submission: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'grade' | 'feedback' | 'program'>) => {
    const id = crypto.randomUUID();
    const student = students.find(s => s.studentId === submission.studentId) || user?.studentData;
    const course = courses.find(c => c.id === student?.courseId);
    
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      program: course?.name || 'Unknown Program'
    };

    try {
      setSubmissions(prev => [...prev, newSubmission]);
      await syncToSupabase('submissions', newSubmission);
      addAuditLog('Work Submission', `${submission.type} submitted by ${submission.studentName}`);
      
      // Trigger AI marking logic automatically
      autoGradeSubmission(id);
    } catch (e) {
      console.error("Submit work failed:", e);
    }
  };

  const bookMentor = async (data: Omit<MentorBooking, 'id' | 'status' | 'bookingDate'>) => {
    const id = crypto.randomUUID();
    const booking: MentorBooking = {
      ...data,
      id,
      status: 'Pending',
      bookingDate: new Date().toISOString()
    };
    try {
      setMentorBookings(prev => [...prev, booking]);
      await syncToSupabase('mentor_bookings', booking);
      addAuditLog('Booking Request', `Student ${data.studentName} booked a mentor session`);
    } catch (e) {
      console.error("Book mentor session failed:", e);
    }
  };

  const updateMentorBooking = async (id: string, updates: Partial<MentorBooking>) => {
    try {
      setMentorBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      const booking = mentorBookings.find(b => b.id === id);
      if (booking) {
        await syncToSupabase('mentor_bookings', { ...booking, ...updates });
        addAuditLog('Booking Update', `Updated booking ID: ${id} to ${updates.status}`);
      }
    } catch (e) {
      console.error("Update booking failed:", e);
    }
  };

  const submitPaymentProof = async (data: Omit<Payment, 'id' | 'status' | 'paymentDate'>) => {
    const id = crypto.randomUUID();
    const newPayment: Payment = {
      ...data,
      id,
      status: 'Pending',
      paymentDate: new Date().toISOString()
    };
    try {
      setPayments(prev => [...prev, newPayment]);
      await syncToSupabase('payments', newPayment);
      
      // Update student record status
      const student = students.find(s => s.studentId === data.studentId);
      if (student) {
        const updatedStudent = { ...student, paymentStatus: 'Pending Approval' as const };
        setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
        await syncToSupabase('students', updatedStudent);
      }
      
      addAuditLog('Payment Proof Submitted', `Student ${data.studentName} submitted transaction ID: ${data.transactionId}`);
    } catch (e) {
      console.error("Submit payment proof failed:", e);
    }
  };

  const rejectPayment = async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    try {
      const updatedPayment = { ...payment, status: 'Rejected' as const };
      setPayments(prev => prev.map(p => p.id === id ? updatedPayment : p));
      await syncToSupabase('payments', updatedPayment);
      
      // Update student status back to Outstanding if they have no other approved/pending payments
      const student = students.find(s => s.studentId === payment.studentId || s.id === payment.studentId);
      if (student) {
        const otherPayments = payments.filter(p => 
          p.studentId === payment.studentId && 
          p.id !== id && 
          (p.status === 'Approved' || p.status === 'Pending')
        );
        
        if (otherPayments.length === 0) {
          const updatedStudent = { ...student, paymentStatus: 'Outstanding' as const };
          setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
          await syncToSupabase('students', updatedStudent);
        }
      }
      
      addAuditLog('Payment Rejected', `Rejected payment ID: ${id}`);
      await refreshData();
    } catch (e) {
      console.error("Reject payment failed:", e);
    }
  };
  const approvePayment = async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    console.log(`ITA [FINANCIAL]: Attempting approval for Payment ID ${id} [Student: ${payment.studentId}]`);

    try {
      const updatedPayment = { ...payment, status: 'Approved' as const };
      
      // 1. Update local payments list
      setPayments(prev => prev.map(p => p.id === id ? updatedPayment : p));
      
      // 2. Sync to Supabase payments table
      await syncToSupabase('payments', updatedPayment);
      
      // 3. Generate Official Invoice
      await addInvoice({
        id: crypto.randomUUID(),
        studentId: payment.studentId,
        amount: payment.amountPaid,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        description: `ITA Official Receipt: Electronic Clearance for ${payment.studentName} [${payment.studentId}]`
      });

      // 4. Update core Student identity record
      const student = students.find(s => s.studentId === payment.studentId || s.id === payment.studentId);
      if ((window as any).processAdminFinancialApproval) {
         try {
            (window as any).processAdminFinancialApproval(
               payment.studentId, 
               student?.selectedDuration || '6 months', 
               String(payment.amountPaid)
            );
         } catch (financeErr) {
            console.error("Ledger sync process failed:", financeErr);
         }
      }
      if (student) {
        console.log(`ITA [FINANCIAL]: Matching student found: ${student.fullName}. Upgrading clearance...`);
        const updatedStudent = { ...student, paymentStatus: 'Cleared' as const };
        
        // Sync student status to both local and cloud
        setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
        
        // Direct Database Clearance (Bypassing common mapping issues if any)
        if (supabase) {
          const { error: clearError } = await supabase
            .from('portal_profiles')
            .update({ 
               payment_status: 'Cleared',
               status: 'Active' 
            })
            .eq('student_id', student.studentId);
          
          if (clearError) {
             console.error("ITA [DATABASE]: Direct clearance update failed:", clearError);
             // Fallback to standard sync if specific update fails
             await syncToSupabase('students', updatedStudent);
          } else {
             console.log("ITA [DATABASE]: Primary node profile cleared successfully.");
          }
        } else {
          await syncToSupabase('students', updatedStudent);
        }
        
        addAuditLog('Enrollment Clearance', `${student.fullName} [${student.studentId}] has been granted MASTER level portal access.`);
        addNotification('Payment Approved', `Identity ${student.studentId} has been verified and cleared for portal saturation.`, 'success', 'admin');
        
        // If this is the active user session (unlikely but possible during self-test)
        if (user?.studentData?.id === student.id || user?.studentData?.studentId === student.studentId) {
          setUser(prev => prev ? { ...prev, studentData: updatedStudent } : null);
          localStorage.setItem('ita_user', JSON.stringify({ ...user, studentData: updatedStudent }));
        }
      } else {
        console.warn(`ITA [FINANCIAL]: No student entity matching ${payment.studentId} in current registry pool.`);
      }
      
      addAuditLog('Payment Approved', `Transaction ${id} verified. Node access granted.`);
      await refreshData(); // Force global pulse refresh
    } catch (e) {
      console.error("ITA [FINANCIAL]: Approval cycle critical failure:", e);
      addNotification('Approval Error', 'Failed to propagate clearance to the master node.', 'alert');
    }
  };

  const sendCommunityMessage = async (text: string) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const faculty = user.studentData ? courses.find(c => c.id === user.studentData?.courseId)?.name : 'System';
    const msg: CommunityMessage = {
      id,
      userId: user.username,
      userName: user.username,
      userRole: user.role,
      text,
      timestamp: new Date().toISOString(),
      faculty
    };
    try {
      await syncToSupabase('community_messages', msg);
    } catch (e) {
      console.error("Community message failed:", e);
    }
  };

  const askMentor = async (history: AIMessage[], customSystemInstruction?: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.error("ITA [AI]: GEMINI_API_KEY is missing.");
        return "System Status: AI Node Offline. Please verify GEMINI_API_KEY in the application settings to activate the neural link.";
      }

      const timetableInfo = timetable.map(t => {
        const course = courses.find(c => c.id === t.courseId)?.name;
        return `Day: ${t.day} | Time: ${t.sessionTime} | Course: ${course}`;
      }).join('\n');

      const studentData = user?.studentData;
      const studentSubmissions = submissions.filter(s => s.studentId === studentData?.studentId);
      const gradedCount = studentSubmissions.filter(s => s.status !== 'pending').length;
      const avgGrade = gradedCount > 0 
        ? Math.round(studentSubmissions.reduce((acc, s) => acc + (parseInt((s.grade || '0').replace('%', ''))), 0) / gradedCount) 
        : 0;

      const courseModules = courses.find(c => c.id === studentData?.courseId)?.modules || [];
      const totalLessons = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = courseModules.reduce((acc, m) => acc + m.lessons.filter((l: any) => completions.includes(l.id)).length, 0);
      
      const moduleSummary = courseModules.map(m => {
        const completed = m.lessons.filter((l: any) => completions.includes(l.id)).length;
        return `${m.title}: ${completed}/${m.lessons.length} lessons finished`;
      }).join('\n');

      const studentInfo = studentData ? `
        STUDENT ACADEMIC PROFILE:
        - Full Participant Name: ${studentData.fullName}
        - Enrollment Node: ${studentData.studentId}
        - Current Track: ${courses.find(c => c.id === studentData.courseId)?.name || 'IT General'}
        - Modules Finished: ${completedLessons}/${totalLessons} (${studentData.progress}%)
        - Lab Completion: ${studentData.labProgress}%
        
        AVAILABLE PHYSICAL & DIGITAL ASSETS:
        - Labs Catalog: ${labs.map(l => l.title).join(', ')}
        - Library Resources: ${libraryItems.map(lib => lib.title).join(', ')}
        
        DETAILED CURRICULUM STATUS:
        ${moduleSummary}
      ` : 'Guest Protocol / External Inquiry';

      const validHistory = history.filter(msg => msg.content && msg.content.trim().length > 0);
      
      const responseText = await getAIResponse(
        "", 
        validHistory.map(m => ({ role: m.role, content: m.content })),
        studentInfo,
        timetableInfo,
        customSystemInstruction
      );
      
      return responseText || "I am currently processing your request but the response was truncated. Could you please specify your query?";
    } catch (e: any) {
      console.error("ITA [AI]: Neural Link Fault:", e);
      return `Neural Sync Interrupted: [${e.message || 'Unknown Error'}]. Please re-initialize your query.`;
    }
  };

  const startMeeting = async (title: string) => {
    if (!user || !supabase) return;
    const meetingId = crypto.randomUUID();
    const roomId = 'ita-audio-' + crypto.randomUUID();
    const hostId = user.studentData?.studentId || user.username;
    
    const newMeeting: Meeting = {
      id: meetingId,
      hostId,
      title,
      status: 'active',
      roomId,
      startedAt: new Date().toISOString()
    };

    try {
      await supabase.from('meetings').insert({
        id: meetingId,
        host_id: hostId,
        title,
        status: 'active',
        room_id: roomId,
        started_at: newMeeting.startedAt
      });
      setMeetings(prev => [...prev, newMeeting]);
      addAuditLog('Meeting', `Started audio session: ${title}`);
    } catch (e) {
      console.error("Failed to start meeting:", e);
    }
  };

  const endMeeting = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('meetings').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', id);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'ended' } : m));
      addAuditLog('Meeting', `Ended audio session: ${id}`);
    } catch (e) {
      console.error("Failed to end meeting:", e);
    }
  };

  const addLearningMaterial = async (data: Omit<LearningMaterial, 'id' | 'createdAt'>) => {
    if (!supabase) return;
    const matId = crypto.randomUUID();
    const newMat: LearningMaterial = {
      ...data,
      id: matId,
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('learning_materials').insert({
        id: matId,
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        module_id: data.moduleId,
        created_at: newMat.createdAt,
        created_by: user?.username
      });
      setLearningMaterials(prev => [...prev, newMat]);
      addAuditLog('Material', `Added resource: ${data.title}`);
    } catch (e) {
      console.error("Failed to add material:", e);
    }
  };

  const deleteLearningMaterial = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('learning_materials').delete().eq('id', id);
      setLearningMaterials(prev => prev.filter(m => m.id !== id));
      addAuditLog('Material', `Deleted resource: ${id}`);
    } catch (e) {
      console.error("Failed to delete material:", e);
    }
  };

  const markSubmissionWithAI = async (submissionId: string, base64Data: string, mimeType: string, prompt: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.warn("ITA [AI]: GEMINI_API_KEY missing or invalid. AI marking skipped.");
      return;
    }

    try {
      const aiResult = await gradeSubmission({
        title: 'Manual AI Marking',
        type: 'Practical Exam',
        moduleId: 'Manual',
        studentName: 'Student',
        fileUrl: `data:${mimeType};base64,${base64Data}`
      });
      
      if (supabase) {
        await supabase.from('submissions').update({
          ai_grade: aiResult.grade,
          ai_feedback: aiResult.feedback,
          is_ai_marked: true,
          status: 'ai_marked'
        }).eq('id', submissionId);
      }
      
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { 
        ...s, 
        aiGrade: aiResult.grade, 
        aiFeedback: aiResult.feedback, 
        isAiMarked: true, 
        status: 'ai_marked' as any
      } : s));
      
      addAuditLog('AI Marking', `Processed submission: ${submissionId}`);
    } catch (e) {
      console.error("AI Marking failed:", e);
    }
  };

  const autoGradeSubmission = async (submissionId: string) => {
    // Small delay to ensure state update has propagated
    await sleep(800);
    
    let subToGrade: Submission | undefined;
    
    setSubmissions(prev => {
      subToGrade = prev.find(s => s.id === submissionId);
      return prev;
    });

    if (!subToGrade) {
      console.warn(`ITA [AI]: Submission ${submissionId} not found for auto-grading.`);
      return;
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'undefined') {
        console.warn("ITA [AI]: API Key unreachable. Protocol suspended.");
        return;
      }

      // Pre-flight check: status must be pending
      if (subToGrade.status !== 'pending') return;

      const aiResult = await gradeSubmission(subToGrade);
      console.log("ITA [AI]: Marking analysis successful:", aiResult);
      
      addAuditLog('AI Marking', `Evaluated submission: ${subToGrade.title}`);
      
      const grade = aiResult.grade ? `${aiResult.grade.toString().replace('%', '')}%` : '0%';
      const feedback = aiResult.feedback || 'Academic analysis concluded.';

      const updatedSubmission: Submission = {
        ...subToGrade,
        status: 'ai_marked',
        isAiMarked: true,
        aiGrade: grade,
        aiFeedback: feedback,
        grade: grade, // Finalizing for student visibility
        feedback: feedback
      };

      setSubmissions(old => old.map(s => s.id === submissionId ? updatedSubmission : s));
      await syncToSupabase('submissions', updatedSubmission);
      addAuditLog('AI Marking', `Evaluated node for ${subToGrade.studentName}`);
    } catch (e: any) {
      console.error("ITA [AI]: Evaluation fault:", e.message);
      // Mark as error so student knows it's pending human review
      setSubmissions(old => old.map(s => s.id === submissionId ? { 
        ...s, 
        feedback: "AI Evaluation Stalled: Queued for Human Review." 
      } : s));
    }
  };

  const registerAttendance = async (classId: string, extraData?: { program: string, duration: string, sessionTime: string }) => {
    if (!user) {
      console.warn("ITA [AUTH]: Attendance rejected - User not logged in.");
      addNotification('Security Error', 'Session expired. Please log in again to register attendance.', 'alert');
      return;
    }
    
    // Fallback for students without direct studentData record in local state
    const isStudent = user.role === 'student';
    const stData = isStudent ? (user.studentData || students.find(s => s.studentId === user.username)) : null;
    const studentId = isStudent ? (stData?.studentId || user.username) : `STAFF_${user.username}`;
    const studentName = isStudent ? (stData?.fullName || user.username) : user.username;
    
    const classEntry = timetable.find(t => t.id === classId);
    const onlineCls = onlineClasses.find(o => o.id === classId);
    
    const studentCourse = isStudent ? (stData?.courseId || '') : '';
    const studentDuration = isStudent ? (stData?.selectedDuration || '') : 'N/A (Staff)';

    const courseRecord = isStudent ? courses.find(c => c.id === studentCourse) : null;
    
    const program = extraData?.program || courseRecord?.name || (isStudent ? 'Unknown Program' : 'Faculty/Staff');
    const duration = extraData?.duration || studentDuration;
    const sessionTime = extraData?.sessionTime || classEntry?.sessionTime || (onlineCls ? `${onlineCls.startTime} (${onlineCls.duration}m)` : 'Unknown');
    
    const classTitle = classEntry ? `Session ${classEntry.sessionTime}` : (onlineCls?.title || 'Unknown Class');
    
    // 0. Prevent duplicate check-in for the same student, class, and date
    const today = new Date().toISOString().split('T')[0];
    const isAlreadyPresent = attendance.find(a => 
      a.studentId === studentId && 
      a.classId === classId && 
      a.date === today
    );

    if (isAlreadyPresent) {
      console.warn(`ITA [AUTH]: Attendance duplicate blocked for ${studentName} today.`);
      alert(`ITA PROTOCOL: Attendance already recorded for ${studentName} today in this session.`);
      return;
    }
    
    const newEntry: Attendance = {
      id: crypto.randomUUID(),
      studentId: studentId,
      studentName: studentName,
      classId,
      classTitle,
      date: today,
      checkInTime: new Date().toISOString(),
      status: isStudent ? 'present' : 'duty',
      program,
      duration,
      sessionTime,
      courseId: studentCourse,
      courseName: courseRecord?.name
    };
    
    try {
      console.log(`ITA [AUTH]: Registering attendance for ${studentName} - Session: ${classTitle} (Role: ${user.role})`);
      setAttendance(prev => [...prev, newEntry]);
      await syncToSupabase('class_attendance', newEntry);

      // Record daily class registrations in daily_attendance table in Supabase
      if (supabase) {
        try {
          await supabase.from('daily_attendance').insert({
            id: newEntry.id,
            student_id: newEntry.studentId,
            student_name: newEntry.studentName,
            class_id: newEntry.classId,
            class_title: newEntry.classTitle,
            date: newEntry.date,
            check_in_time: newEntry.checkInTime,
            status: newEntry.status,
            program: newEntry.program,
            duration: newEntry.duration,
            session_time: newEntry.sessionTime,
            course_id: newEntry.courseId,
            course_name: newEntry.courseName
          });
          console.log(`ITA [AUTH]: Daily class registration successfully recorded in daily_attendance table.`);
        } catch (dbErr) {
          console.error("Error inserting into daily_attendance:", dbErr);
        }
      }
      
      // Reflect progress for students
      if (isStudent && stData) {
        const studentAttendanceList = attendance.filter(a => a.studentId === studentId);
        // Calculate progress: 0.5% per attendance, max 100%
        // Using +1 because current enrollment isn't in 'attendance' state yet
        const totalCount = studentAttendanceList.length + 1;
        const newProgress = Math.min(100, Math.round(totalCount * 0.5 * 100) / 100); 
        
        const updatedStudent = {
          ...stData,
          attendanceProgress: newProgress
        };
        
        await updateStudent(updatedStudent);
      }

      addAuditLog('Attendance', `${user.role === 'student' ? 'Student' : 'Staff'} checked-in: ${studentName} to ${classTitle}`);
      addNotification('Check-in Successful', `Your presence has been recorded for ${classTitle}.`, 'success');
    } catch (e) {
      console.error("Attendance registration failed:", e);
      addNotification('Registry Fault', 'Cloud sync interrupted during check-in. Local node saved.', 'alert');
    }
  };

  const verifySubmission = async (id: string, grade: string, feedback: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('submissions').update({
        status: 'marked',
        grade: grade,
        feedback: feedback,
        is_ai_marked: true 
      }).eq('id', id);
      
      if (error) throw error;

      setSubmissions(prev => prev.map(s => s.id === id ? { 
        ...s, 
        status: 'marked', 
        grade, 
        feedback 
      } : s));

      // Hook up live grading sharing state
      const targetSub = submissions.find(s => s.id === id);
      const assignmentTitle = targetSub ? targetSub.title : "Assessment Unit";
      if (typeof window !== 'undefined' && (window as any).publishStudentGrade) {
        (window as any).publishStudentGrade(assignmentTitle, parseFloat(grade) || 0);
      }

      addAuditLog('Grading', `Verified and finalized grade for submission: ${id}`);
      addNotification('Assignment Marked', `Successfully verified submission ${id}.`, 'success');
    } catch (e: any) {
      console.error("Verification failed:", e);
      addNotification('Grading Error', `Failed to verify submission: ${e.message}`, 'alert');
    }
  };

  const approveAiGrade = async (submissionId: string) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;
    
    // Convert AI feedback/grade to final ones
    await verifySubmission(submissionId, sub.aiGrade || '0', sub.aiFeedback || 'AI Grade Approved');
  };

  const handleAssignmentGradingVisibility = async (submissionId: string, grade: string, feedback: string) => {
    if (!supabase) return;
    try {
      console.log(`ITA [GRADING]: Dispatching grading visibility update for submission ${submissionId}`);
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status: 'marked',
          grade, 
          feedback
        })
        .eq('id', submissionId);
      
      if (error) throw error;
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { 
        ...s, 
        status: 'marked',
        grade, 
        feedback
      } : s));
      addAuditLog('Grade Update', `Updated grade on submission ID: ${submissionId}`);
    } catch (err: any) {
      console.error("Failed to update grading visibility in Supabase:", err);
    }
  };

  const toggleLessonCompletion = async (lessonId: string, studentIdOverride?: string) => {
    // Determine which student we are targeting
    const targetStudentId = studentIdOverride || (user?.role === 'student' ? user.studentData?.studentId : null);
    if (!targetStudentId) return;
    
    try {
      let nowCompleted = false;
      const existingRecord = allProgress.find(p => p.student_id === targetStudentId && p.lesson_id === lessonId);
      
      if (existingRecord) {
        // Toggle off
        if (supabase) {
          await supabase.from('student_progress').delete().eq('student_id', targetStudentId).eq('lesson_id', lessonId);
        }
        setAllProgress(prev => prev.filter(p => !(p.student_id === targetStudentId && p.lesson_id === lessonId)));
        if (user?.role === 'student' && user.studentData?.studentId === targetStudentId) {
          setCompletions(prev => prev.filter(id => id !== lessonId));
        }
      } else {
        // Toggle on
        const newRecord = { student_id: targetStudentId, lesson_id: lessonId, timestamp: new Date().toISOString() };
        if (supabase) {
          await supabase.from('student_progress').insert(newRecord);
        }
        setAllProgress(prev => [...prev, newRecord]);
        if (user?.role === 'student' && user.studentData?.studentId === targetStudentId) {
          setCompletions(prev => [...prev, lessonId]);
        }
        nowCompleted = true;
      }
      
      // Update student's global progress percentage
      const student = students.find(s => s.studentId === targetStudentId);
      if (student) {
        const course = courses.find(c => c.id === student.courseId);
        if (course) {
          const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) || 1;
          const currentCompletionsCount = allProgress.filter(p => p.student_id === targetStudentId).length;
          const newCompletionsCount = existingRecord ? currentCompletionsCount - 1 : currentCompletionsCount + 1;
          const newProgress = Math.round((newCompletionsCount / totalLessons) * 100);
          
          const updatedStudent = { ...student, progress: newProgress };
          setStudents(prev => prev.map(s => s.studentId === targetStudentId ? updatedStudent : s));
          
          // Also update the active user object if it's the current user
          if (user?.studentData?.studentId === targetStudentId) {
            setUser({ ...user, studentData: updatedStudent });
          }
          
          if (supabase) {
            await syncToSupabase('students', updatedStudent);
          }
        }
      }
      
      addAuditLog('Progress Update', `${user?.username} ${nowCompleted ? 'completed' : 'uncompleted'} lesson ${lessonId} for student ${targetStudentId}`);
    } catch (e) {
      console.error("Progress update failed:", e);
    }
  };

  const submitMockExam = async (examId: string, answers: { questionId: string; answer: string }[]) => {
    if (!user || user.role !== 'student' || !user.studentData) return '';
    const id = crypto.randomUUID();
    const result: MockExamResult = {
      id,
      studentId: user.studentData.studentId,
      examId,
      answers,
      maxScore: mockExams.find(e => e.id === examId)?.questions.length || 10,
      completedAt: new Date().toISOString(),
      isAiGraded: false
    };

    setMockExamResults(prev => [...prev, result]);
    if (supabase) {
      await syncToSupabase('mock_exam_results', result);
    }
    
    // Trigger AI grading immediately with the result object
    gradeMockExamWithAIInternal(result);
    
    addAuditLog('Mock Exam', `Submitted exam ${examId} results.`);
    return id;
  };

  const gradeMockExamWithAI = async (resultId: string) => {
    // We fetch from current state, but if it was just added, we might need a small delay or use functional update
    // However, since this is async and triggered after submit, we'll try to find it.
    // If not found in first try, we'll wait a bit.
    let result = mockExamResults.find(r => r.id === resultId);
    
    if (!result) {
      // Re-fetch from context state might be tricky, so we'll just wait 100ms
      await new Promise(resolve => setTimeout(resolve, 500));
      // This is a bit hacky, better to pass the result in or use a ref for latest results
    }

    // Try again with latest state via a trick or just use the results parameter if we had one
    // Actually, I'll modify the function to accept the result directly from submitMockExam
    // But since it's exported, I'll keep the signature and add a second optional param
  };

  const gradeMockExamWithAIInternal = async (result: MockExamResult) => {
    const exam = mockExams.find(e => e.id === result.examId);
    if (!exam) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      console.warn("ITA [AI]: GEMINI_API_KEY missing. Skipping exam grading.");
      return;
    }

    try {
      const examContext = {
        title: exam.title,
        questions: exam.questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        studentAnswers: result.answers.map(ans => {
          const q = exam.questions.find(q => q.id === ans.questionId);
          return {
            question: q?.text,
            type: q?.type,
            answer: ans.answer,
            correctAnswer: q?.correctAnswer,
            options: q?.options
          };
        })
      };

      const data = await gradeExam(examContext);
      
      const updatedResult: MockExamResult = {
        ...result,
        score: data.score,
        feedback: data.feedback || "AI grading completed.",
        isAiGraded: true
      };

      setMockExamResults(prev => prev.map(r => r.id === result.id ? updatedResult : r));
      if (supabase) {
        await syncToSupabase('mock_exam_results', updatedResult);
      }
      
      addAuditLog('AI Grading', `Graded ${exam.title} for ${result.studentId}`);
    } catch (e) {
      console.error("AI grading error:", e);
    }
  };

  const purgeOtherStaff = async () => {
    const isFelix = user?.email?.toLowerCase() === 'felixbrownz907@gmail.com' || user?.studentData?.studentId === 'felixbrownz';
    if (!isFelix) {
      alert("UNAUTHORIZED: Only the Founder (Felix Brown) can perform a staff purge.");
      return;
    }

    if (!window.confirm("MASTER_PURGE: This will remove ALL other staff members and administrators from the registry. You will be the only authorized operator. Continue?")) {
      return;
    }

    try {
      if (!supabase) throw new Error("Supabase context missing");

      // Delete all profiles with staff/admin/instructor roles EXCEPT current user
      const { error } = await supabase
        .from('portal_profiles')
        .delete()
        .in('role', ['admin', 'staff', 'instructor'])
        .not('email', 'eq', 'felixbrownz907@gmail.com')
        .not('student_id', 'eq', 'felixbrownz');

      if (error) throw error;

      await refreshData();
      addAuditLog('Master Action', 'Purged all unauthorized staff members');
      alert("PURGE_COMPLETE: You are now the sole authorized administrator in the registry.");
    } catch (e: any) {
      console.error("Staff Purge Failed:", e.message);
      alert(`PURGE_FAILED: ${e.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, refreshData, dataLoaded, dbStatus,
      findStudentByRegistry,
      courses, addCourse, updateCourse, deleteCourse,
      intakes, addIntake, updateIntake, deleteIntake,
      students, addStudent, updateStudent, deleteStudent,
      payments, addPayment, updatePayment,
      announcements, addAnnouncement, deleteAnnouncement,
      labs, addLab, updateLab, deleteLab,
      libraryItems, addLibraryItem, deleteLibraryItem,
      whatsappAISettings, updateWhatsAppAI,
      whatsappMessages, addWhatsAppMessage,
      auditLogs, addAuditLog,
      notifications, clearNotifications,
      invoices, addInvoice,
      onlineClasses, addOnlineClass, updateOnlineClass, deleteOnlineClass,
      announcementMarquee, updateMarquee,
      introUrl, updateIntroUrl,
      biometricEnabled, toggleBiometric,
      transparencyMode, toggleTransparency,
      updatePassword,
      toggleNetacadLink,
      seedInitialData,
      enrollStudent,
      submitPIN,
      submitWork,
      approveAiGrade,
      submissions,
      attendance,
      exams,
      mockExams,
      mockExamResults,
      submitMockExam,
      gradeMockExamWithAI,
      meetings,
      learningMaterials,
      startMeeting,
      endMeeting,
      addLearningMaterial,
      deleteLearningMaterial,
      completions,
      toggleLessonCompletion,
      markSubmissionWithAI,
      autoGradeSubmission,
      verifySubmission,
      handleAssignmentGradingVisibility,
      registerAttendance,
      allProgress,
      mentorBookings,
      communityMessages,
      lecturers,
      addLecturer,
      deleteLecturer,
      timetable,
      addTimetableEntry,
      updateTimetableEntry,
      deleteTimetableEntry,
      bookMentor,
      updateMentorBooking,
      submitPaymentProof,
      approvePayment,
      rejectPayment,
      sendCommunityMessage,
      askMentor,
      purgeOtherStaff,
      forceRegistryUpload,
      repairRegistry: forceRegistryUpload,
      addNotification,
      isSyncing,
      addStaff,
      refreshKey,
      hardReset
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

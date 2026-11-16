// Central Mock Data Store for Prashanth Enterprises HRM

export const currentUser = {
  id: "EMP-2024-001",
  name: "Prashanth Reddy",
  role: "Director of Operations",
  department: "Management",
  email: "prashanth.reddy@prashanthenterprises.in",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  biometricId: "MTX-9821",
  panNumber: "ABCDE1234F",
  pfNumber: "MH/BAN/0012938/000/0048291",
  joiningDate: "12 Jan 2021"
};

export const matrixBiometricStatus = {
  deviceName: "Matrix COSEC DOOR FMX",
  ipAddress: "192.168.1.240",
  status: "ONLINE",
  lastSync: "Just now (Local Intranet)",
  syncFrequency: "Real-time Push (WebSocket/HTTP Listener)",
  todayPunches: [
    { time: "09:12 AM", type: "IN", machine: "Main Entrance Reader 01", status: "Valid" },
    { time: "01:05 PM", type: "OUT", machine: "Cafeteria Reader 02", status: "Valid" },
    { time: "01:50 PM", type: "IN", machine: "Cafeteria Reader 02", status: "Valid" },
    { time: "06:15 PM", type: "OUT", machine: "Main Entrance Reader 01", status: "Pending Sync" }
  ]
};

export const pendingTasks = [
  {
    id: "TSK-101",
    type: "Leave Approval",
    requester: "Kavitha Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    details: "Sick Leave (2 Days: Nov 18 - Nov 19)",
    date: "10 mins ago",
    priority: "High",
    category: "Leave"
  },
  {
    id: "TSK-102",
    type: "Attendance Regularization",
    requester: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    details: "Missed punch (Matrix device power cycle on Nov 14)",
    date: "1 hour ago",
    priority: "Medium",
    category: "Attendance"
  },
  {
    id: "TSK-103",
    type: "Expense Reimbursement",
    requester: "Rohan Patel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    details: "Client site travel - INR 4,850",
    date: "3 hours ago",
    priority: "Low",
    category: "Finance"
  },
  {
    id: "TSK-104",
    type: "IT Policy 2025 Sign-off",
    requester: "System Audit",
    avatar: null,
    details: "Annual cybersecurity & device compliance acknowledgement",
    date: "Today",
    priority: "Urgent",
    category: "Policy"
  }
];

export const newJoinees = [
  {
    id: "NJ-01",
    name: "Ananya Deshmukh",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    joiningDate: "15 Nov 2026",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "NJ-02",
    name: "Siddharth Verma",
    role: "Plant Operations Supervisor",
    department: "Logistics",
    joiningDate: "10 Nov 2026",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "NJ-03",
    name: "Meera Krishnan",
    role: "HR Talent Specialist",
    department: "Human Resources",
    joiningDate: "03 Nov 2026",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
  }
];

export const companyNews = [
  {
    id: "NW-01",
    title: "Prashanth Enterprises Achieves ISO 27001 & TISAX Certification",
    category: "Milestone",
    date: "Nov 14, 2026",
    readTime: "2 min read",
    badge: "Official"
  },
  {
    id: "NW-02",
    title: "New Matrix Biometric Touchless Terminals Active Across All Hubs",
    category: "Infrastructure",
    date: "Nov 12, 2026",
    readTime: "3 min read",
    badge: "IT Notice"
  },
  {
    id: "NW-03",
    title: "Annual Sports & Cultural Fest 'Prashanth Utsav 2026' Announced",
    category: "Culture",
    date: "Nov 08, 2026",
    readTime: "1 min read",
    badge: "Event"
  }
];

export const leaveBalances = [
  { type: "Privilege Leave (PL)", available: 14.5, total: 18, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { type: "Sick Leave (SL)", available: 6.0, total: 8, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { type: "Casual Leave (CL)", available: 4.5, total: 6, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { type: "Compensatory Off", available: 2.0, total: 2, color: "text-purple-600 bg-purple-50 border-purple-200" }
];

export const helpdeskTickets = [
  {
    id: "HD-8902",
    title: "Matrix Biometric Fingerprint Recognition Delay at Gate 3",
    category: "IT Support",
    priority: "High",
    status: "In Progress",
    assignedTo: "Rajesh IT Admin",
    createdDate: "Today, 10:15 AM",
    following: true,
    lastUpdate: "Biometric optical sensor recalibration in progress."
  },
  {
    id: "HD-8901",
    title: "Tax Exemption proof submission query for HRA under New Tax Regime",
    category: "HR & Payroll",
    priority: "Medium",
    status: "Resolved",
    assignedTo: "Sneha Finance",
    createdDate: "Yesterday",
    following: true,
    lastUpdate: "Explained that 115BAC does not allow standard HRA deductions."
  },
  {
    id: "HD-8889",
    title: "Request for Ergonomic Dual-Monitor arm for workstation W-42",
    category: "Facilities",
    priority: "Low",
    status: "Open",
    assignedTo: "Facilities Desk",
    createdDate: "Nov 12, 2026",
    following: false,
    lastUpdate: "Ticket assigned to procurement queue."
  }
];

export const teamMembers = [
  {
    id: "EMP-2024-002",
    name: "Kavitha Sharma",
    role: "Lead QA Automation",
    status: "In Office",
    inTime: "09:05 AM",
    shift: "09:00 AM - 06:00 PM",
    matrixDevice: "Door-1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-2024-003",
    name: "Vikram Malhotra",
    role: "Senior Backend Developer",
    status: "Work From Home",
    inTime: "09:30 AM",
    shift: "09:00 AM - 06:00 PM",
    matrixDevice: "Web Punch",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-2024-004",
    name: "Rohan Patel",
    role: "DevOps & Infrastructure",
    status: "On Leave",
    inTime: "-",
    shift: "Casual Leave",
    matrixDevice: "-",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-2024-005",
    name: "Deepa Nair",
    role: "Product Analyst",
    status: "In Office",
    inTime: "08:55 AM",
    shift: "09:00 AM - 06:00 PM",
    matrixDevice: "Door-2",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  }
];

export const documentsList = [
  {
    id: "DOC-2025-IT",
    title: "IT Policy-2025 (Security, Device Encryption & Acceptable Use)",
    category: "IT Policies",
    version: "v3.2",
    updated: "Jan 2025",
    size: "1.8 MB",
    status: "Mandatory"
  },
  {
    id: "DOC-2026-HR",
    title: "Prashanth Enterprises Employee Handbook & Code of Conduct 2026",
    category: "HR Policies",
    version: "v4.0",
    updated: "Oct 2026",
    size: "3.4 MB",
    status: "Active"
  },
  {
    id: "DOC-2026-ATT",
    title: "Matrix Biometric Attendance & Shift Regularization Guidelines",
    category: "Attendance",
    version: "v2.1",
    updated: "Sep 2026",
    size: "950 KB",
    status: "Active"
  },
  {
    id: "DOC-2026-MED",
    title: "Group Medical & Accident Insurance Policy Coverage 2026-27",
    category: "Benefits",
    version: "v1.0",
    updated: "Apr 2026",
    size: "2.1 MB",
    status: "Active"
  }
];

export const taxFinancesData = {
  monthlyGross: 185000,
  netTakeHome: 148200,
  totalDeductions: 36800,
  taxRegime: "New Tax Regime (Section 115BAC)",
  financialYear: "2026 - 2027",
  pan: "ABCDE1234F",
  declarations: {
    section80C: { declared: 150000, verified: 150000, limit: 150000 },
    section80D_Health: { declared: 25000, verified: 25000, limit: 25000 },
    nps_80CCD: { declared: 50000, verified: 50000, limit: 50000 },
    homeLoanInterest: { declared: 0, verified: 0, limit: 200000 },
    hraExemption: { declared: 0, verified: 0, status: "Not applicable under New Regime" }
  },
  recentPayslips: [
    { month: "October 2026", gross: "₹ 1,85,000", net: "₹ 1,48,200", status: "Paid", downloadUrl: "#" },
    { month: "September 2026", gross: "₹ 1,85,000", net: "₹ 1,48,200", status: "Paid", downloadUrl: "#" },
    { month: "August 2026", gross: "₹ 1,85,000", net: "₹ 1,48,200", status: "Paid", downloadUrl: "#" }
  ]
};

export const engageData = {
  announcements: [
    {
      id: "ANN-01",
      author: "Pooja Hegde (VP People Operations)",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      time: "2 hours ago",
      title: "Diwali Bonus & Holiday Calendar 2026 Released! 🪔✨",
      content: "We are delighted to announce that all eligible team members will receive their Diwali festive ex-gratia along with the November payroll. Please check the HR Documents section for the approved 2027 Public Holiday list.",
      likes: 42,
      comments: 9
    },
    {
      id: "ANN-02",
      author: "IT Infrastructure Desk",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      time: "Yesterday",
      title: "Scheduled Maintenance: Local Intranet & Matrix Server Upgrades",
      content: "This Saturday from 11:00 PM to 01:00 AM, the local intranet server running the biometric push service will undergo database index optimization. Offline punch buffering will remain active on all door readers.",
      likes: 18,
      comments: 2
    }
  ],
  polls: [
    {
      id: "POL-01",
      question: "Which topic would you prefer for the upcoming Q4 Tech Workshop?",
      totalVotes: 87,
      options: [
        { text: "AI Workflows in Enterprise Architecture", votes: 48, percentage: 55 },
        { text: "Microservices & Distributed Systems", votes: 24, percentage: 28 },
        { text: "Cloud Cost Optimization & FinOps", votes: 15, percentage: 17 }
      ]
    }
  ],
  articles: [
    {
      id: "ART-01",
      title: "5 Best Practices for Maintaining Work-Life Harmony in Hybrid Teams",
      author: "Prashanth Enterprises Wellness Circle",
      readTime: "4 min read",
      tags: ["Wellness", "Culture"]
    },
    {
      id: "ART-02",
      title: "Understanding Section 115BAC: Making the Right Choice for Your Tax Planning",
      author: "Finance & Accounts Team",
      readTime: "6 min read",
      tags: ["Tax", "Finance"]
    }
  ]
};

export const employeeCelebrations = [
  {
    id: "CEL-01",
    type: "new_joinee",
    title: "Welcome to Prashanth Enterprises!",
    subtitle: "New Joiner",
    employeeName: "Ananya Deshmukh",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    badge: "Joined Yesterday",
    date: "15 Nov 2026",
    quickWishes: [
      "🎉 Welcome to Prashanth Enterprises!",
      "👋 So glad to have you on the team!",
      "🚀 Wishing you a wonderful journey here!"
    ],
    wishes: [
      {
        id: "w-1",
        from: "Prashanth Reddy",
        role: "Director of Operations",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        message: "Welcome to the team Ananya! We are excited to build amazing products together. 🙌",
        time: "1 hour ago",
        likes: 5
      },
      {
        id: "w-2",
        from: "Kavitha Sharma",
        role: "Lead QA Automation",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        message: "Warm welcome Ananya! Looking forward to collaborating on the new portal. ✨",
        time: "3 hours ago",
        likes: 3
      }
    ]
  },
  {
    id: "CEL-02",
    type: "birthday",
    title: "Happy Birthday!",
    subtitle: "Birthday Today 🎂",
    employeeName: "Kavitha Sharma",
    role: "Lead QA Automation",
    department: "Engineering",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    badge: "Today 🎂",
    date: "Today, 16 Nov",
    quickWishes: [
      "🎂 Wishing you a very Happy Birthday!",
      "🎉 Have a fantastic day and year ahead!",
      "💐 May all your dreams come true!"
    ],
    wishes: [
      {
        id: "w-3",
        from: "Pooja Hegde",
        role: "VP People Operations",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        message: "Happy Birthday Kavitha! Have a wonderful day filled with joy and sweet treats! 🍰🎉",
        time: "2 hours ago",
        likes: 8
      }
    ]
  },
  {
    id: "CEL-03",
    type: "anniversary",
    title: "Celebrating Work Anniversary!",
    subtitle: "4 Years at Prashanth Enterprises 🎖️",
    employeeName: "Rajesh Kannan",
    role: "Head of IT & Infrastructure",
    department: "Information Technology",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    badge: "4 Years Milestone 🎖️",
    date: "Today, 16 Nov",
    quickWishes: [
      "🎖️ Congratulations on 4 years at PE!",
      "🌟 Thank you for your leadership & dedication!",
      "👏 Here's to many more milestones together!"
    ],
    wishes: [
      {
        id: "w-4",
        from: "Prashanth Reddy",
        role: "Director of Operations",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        message: "Hearty congratulations Rajesh on completing 4 years! Your contribution to our infrastructure and local intranet stability is immensely valued! 👏",
        time: "4 hours ago",
        likes: 12
      }
    ]
  },
  {
    id: "CEL-04",
    type: "new_joinee",
    title: "Welcome to Prashanth Enterprises!",
    subtitle: "New Joiner",
    employeeName: "Siddharth Verma",
    role: "Plant Operations Supervisor",
    department: "Logistics",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    badge: "Joined 10 Nov",
    date: "10 Nov 2026",
    quickWishes: [
      "🎉 Welcome aboard Siddharth!",
      "🏭 Wishing you great success in operations!",
      "👋 Hello and warm welcome!"
    ],
    wishes: []
  }
];


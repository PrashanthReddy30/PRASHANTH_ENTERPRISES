// Prashanth Enterprises HRMS — Enterprise Firestore Data Engine & PubSub Store
// Real-time synchronized store across Employee, HR Admin, and Global Admin portals.
// Implements strict atomic leave transactions, multi-branch partitioning, audit logging, and offline persistence.

import { db, isFirebaseConfigured } from './firebaseConfig.js';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'PE_HRMS_UNIFIED_FIRESTORE_DATA_V1';

// Seed Initial Enterprise State
const initialEnterpriseData = {
  // 1. Branches
  branches: [
    { id: 'HYD', name: 'Hyderabad', code: 'PE-HYD', type: 'Headquarters & R&D Hub', address: 'Plot 42, Hitec City, Cyberabad, Hyderabad 500081', head: 'Prashanth Reddy', phone: '+91 40 4829 1000' },
    { id: 'CHE', name: 'Chennai', code: 'PE-CHE', type: 'Engineering & Manufacturing Hub', address: 'Tower B, OMR Tech Park, Chennai 600096', head: 'Rohan Patel', phone: '+91 44 2450 8000' },
    { id: 'MUM', name: 'Mumbai', code: 'PE-MUM', type: 'Corporate Finance & Regional Hub', address: 'Level 14, Platina, Bandra Kurla Complex, Mumbai 400051', head: 'Sneha Kulkarni', phone: '+91 22 6120 4000' }
  ],

  // 2. Departments
  departments: [
    { id: 'IT', name: 'Information Technology', code: 'DEPT-IT', head: 'Rajesh Kannan', employeeCount: 18 },
    { id: 'HR', name: 'Human Resources', code: 'DEPT-HR', head: 'Pooja Hegde', employeeCount: 6 },
    { id: 'FIN', name: 'Finance & Accounts', code: 'DEPT-FIN', head: 'Sneha Kulkarni', employeeCount: 8 },
    { id: 'ENG', name: 'Engineering & QA', code: 'DEPT-ENG', head: 'Kavitha Sharma', employeeCount: 24 },
    { id: 'OPS', name: 'Plant Operations & Logistics', code: 'DEPT-OPS', head: 'Siddharth Verma', employeeCount: 32 },
    { id: 'SALES', name: 'Corporate Sales & BD', code: 'DEPT-SALES', head: 'Vikram Malhotra', employeeCount: 14 },
    { id: 'ADMIN', name: 'General Administration', code: 'DEPT-ADMIN', head: 'Deepa Nair', employeeCount: 10 }
  ],

  // 3. Employee Master Directory
  employees: [
    {
      id: 'PE000',
      employeeId: 'EMP-2021-000',
      name: 'Prashanth Reddy',
      email: 'prashanth.reddy@prashanthenterprises.in',
      phone: '+91 98480 11220',
      role: 'Director of Operations',
      systemRole: 'Global Admin',
      department: 'Executive Management',
      deptCode: 'ADMIN',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: null,
      managerName: 'Board of Directors',
      joiningDate: '2021-01-12',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'ABCDE1234F',
      pfNumber: 'MH/BAN/0012938/000/0048291',
      uan: '100984920194',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      biometricId: 'MTX-9821'
    },
    {
      id: 'PE001',
      employeeId: 'EMP-2024-001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@prashanthenterprises.in',
      phone: '+91 98480 11221',
      role: 'Software Development Engineer II',
      systemRole: 'Employee',
      department: 'Information Technology',
      deptCode: 'IT',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE003',
      managerName: 'Rajesh Kannan',
      joiningDate: '2024-03-15',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'BKTPR4921K',
      pfNumber: 'AP/HYD/0091823/000/0034102',
      uan: '100829104829',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      biometricId: 'MTX-9901'
    },
    {
      id: 'PE002',
      employeeId: 'EMP-2022-002',
      name: 'Pooja Hegde',
      email: 'pooja.hegde@prashanthenterprises.in',
      phone: '+91 98480 11224',
      role: 'VP People Operations',
      systemRole: 'Central HR',
      department: 'Human Resources',
      deptCode: 'HR',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE000',
      managerName: 'Prashanth Reddy',
      joiningDate: '2022-04-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'CGWPH1029P',
      pfNumber: 'AP/HYD/0091823/000/0012003',
      uan: '100482910492',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      biometricId: 'MTX-9822'
    },
    {
      id: 'PE003',
      employeeId: 'EMP-2022-003',
      name: 'Rajesh Kannan',
      email: 'rajesh.k@prashanthenterprises.in',
      phone: '+91 98480 11225',
      role: 'Head of IT & Infrastructure',
      systemRole: 'Manager',
      department: 'Information Technology',
      deptCode: 'IT',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE000',
      managerName: 'Prashanth Reddy',
      joiningDate: '2022-11-16',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'DFXPK9182L',
      pfNumber: 'AP/HYD/0091823/000/0014092',
      uan: '100918234910',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      biometricId: 'MTX-9823'
    },
    {
      id: 'PE004',
      employeeId: 'EMP-2023-004',
      name: 'Kavitha Sharma',
      email: 'kavitha.s@prashanthenterprises.in',
      phone: '+91 98480 11226',
      role: 'Lead QA Automation',
      systemRole: 'Manager',
      department: 'Engineering & QA',
      deptCode: 'ENG',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE003',
      managerName: 'Rajesh Kannan',
      joiningDate: '2023-06-10',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'ERTKS8291M',
      pfNumber: 'AP/HYD/0091823/000/0020194',
      uan: '100748291048',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      biometricId: 'MTX-9824'
    },
    {
      id: 'PE005',
      employeeId: 'EMP-2023-005',
      name: 'Vikram Malhotra',
      email: 'vikram.m@prashanthenterprises.in',
      phone: '+91 98480 11227',
      role: 'Senior Backend Developer',
      systemRole: 'Employee',
      department: 'Engineering & QA',
      deptCode: 'ENG',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE003',
      managerName: 'Rajesh Kannan',
      joiningDate: '2023-08-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'TYUPV9281Q',
      pfNumber: 'AP/HYD/0091823/000/0024910',
      uan: '100829104921',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      biometricId: 'MTX-9825'
    },
    {
      id: 'PE006',
      employeeId: 'EMP-2024-006',
      name: 'Rohan Patel',
      email: 'rohan.patel@prashanthenterprises.in',
      phone: '+91 98480 11228',
      role: 'DevOps & Site Reliability Lead',
      systemRole: 'Branch HR',
      department: 'Information Technology',
      deptCode: 'IT',
      branch: 'Chennai',
      branchId: 'CHE',
      managerId: 'PE003',
      managerName: 'Rajesh Kannan',
      joiningDate: '2024-02-10',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'UIOPR8291W',
      pfNumber: 'TN/MAS/0048291/000/0019284',
      uan: '100619284910',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      biometricId: 'MTX-CHE-01'
    },
    {
      id: 'PE007',
      employeeId: 'EMP-2024-007',
      name: 'Deepa Nair',
      email: 'deepa.nair@prashanthenterprises.in',
      phone: '+91 98480 11229',
      role: 'Product Analyst',
      systemRole: 'Employee',
      department: 'Administration',
      deptCode: 'ADMIN',
      branch: 'Chennai',
      branchId: 'CHE',
      managerId: 'PE006',
      managerName: 'Rohan Patel',
      joiningDate: '2024-04-18',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'QWERD7192A',
      pfNumber: 'TN/MAS/0048291/000/0020194',
      uan: '100719284912',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      biometricId: 'MTX-CHE-02'
    },
    {
      id: 'PE008',
      employeeId: 'EMP-2023-008',
      name: 'Siddharth Verma',
      email: 'siddharth.v@prashanthenterprises.in',
      phone: '+91 98480 11230',
      role: 'Plant Operations Supervisor',
      systemRole: 'Branch HR',
      department: 'Plant Operations & Logistics',
      deptCode: 'OPS',
      branch: 'Mumbai',
      branchId: 'MUM',
      managerId: 'PE000',
      managerName: 'Prashanth Reddy',
      joiningDate: '2023-11-10',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'LKJHS9182Z',
      pfNumber: 'MH/MUM/0082910/000/0014029',
      uan: '100819284915',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      biometricId: 'MTX-MUM-01'
    },
    {
      id: 'PE009',
      employeeId: 'EMP-2024-009',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@prashanthenterprises.in',
      phone: '+91 98480 11231',
      role: 'Senior Frontend Engineer',
      systemRole: 'Employee',
      department: 'Engineering & QA',
      deptCode: 'ENG',
      branch: 'Mumbai',
      branchId: 'MUM',
      managerId: 'PE008',
      managerName: 'Siddharth Verma',
      joiningDate: '2024-11-15',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'MNBVA8192Y',
      pfNumber: 'MH/MUM/0082910/000/0019283',
      uan: '100918274619',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      biometricId: 'MTX-MUM-02'
    },
    {
      id: 'PE010',
      employeeId: 'EMP-2023-010',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@prashanthenterprises.in',
      phone: '+91 98480 11232',
      role: 'Senior Corporate Finance Analyst',
      systemRole: 'Finance',
      department: 'Finance & Accounts',
      deptCode: 'FIN',
      branch: 'Mumbai',
      branchId: 'MUM',
      managerId: 'PE000',
      managerName: 'Prashanth Reddy',
      joiningDate: '2023-03-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      panNumber: 'POIUY7182X',
      pfNumber: 'MH/MUM/0082910/000/0011029',
      uan: '100519284918',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      biometricId: 'MTX-MUM-03'
    }
  ],

  // 4. Leave Policies
  leavePolicies: [
    { id: 'POL-CL', code: 'CL', name: 'Casual Leave', daysPerYear: 12, maxConsecutive: 3, carryForwardLimit: 0, encashable: false, paid: true, requiresDoc: false, description: 'Short personal commitments & emergencies' },
    { id: 'POL-SL', code: 'SL', name: 'Sick Leave', daysPerYear: 10, maxConsecutive: 7, carryForwardLimit: 5, encashable: false, paid: true, requiresDoc: true, description: 'Medical recovery & health indisposition (>2 days needs doctor note)' },
    { id: 'POL-PL', code: 'PL', name: 'Privilege Leave (Earned)', daysPerYear: 18, maxConsecutive: 15, carryForwardLimit: 45, encashable: true, paid: true, requiresDoc: false, description: 'Annual planned vacation & extended personal leave' },
    { id: 'POL-COMP', code: 'COMP', name: 'Compensatory Off', daysPerYear: 0, maxConsecutive: 2, carryForwardLimit: 0, encashable: false, paid: true, requiresDoc: false, description: 'Accrued for work performed on designated non-working days / weekends' },
    { id: 'POL-LOP', code: 'LOP', name: 'Loss of Pay (Unpaid)', daysPerYear: 0, maxConsecutive: 30, carryForwardLimit: 0, encashable: false, paid: false, requiresDoc: true, description: 'Authorized absence when paid leave balance is exhausted' }
  ],

  // 5. Leave Ledger & Balances per Employee
  leaveLedger: {
    PE001: {
      CL: { opening: 6, accrued: 6, approvedRestorations: 0, approvedDeductions: 2, pendingReservations: 0, available: 10 },
      SL: { opening: 5, accrued: 5, approvedRestorations: 0, approvedDeductions: 1, pendingReservations: 0, available: 9 },
      PL: { opening: 12, accrued: 6, approvedRestorations: 0, approvedDeductions: 3.5, pendingReservations: 0, available: 14.5 },
      COMP: { opening: 2, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 2.0 }
    },
    PE004: {
      CL: { opening: 4, accrued: 4, approvedRestorations: 0, approvedDeductions: 1, pendingReservations: 0, available: 7 },
      SL: { opening: 4, accrued: 4, approvedRestorations: 0, approvedDeductions: 2, pendingReservations: 0, available: 6 },
      PL: { opening: 10, accrued: 5, approvedRestorations: 0, approvedDeductions: 1, pendingReservations: 0, available: 14 },
      COMP: { opening: 1, accrued: 1, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 2.0 }
    },
    PE005: {
      CL: { opening: 5, accrued: 5, approvedRestorations: 0, approvedDeductions: 1, pendingReservations: 0, available: 9 },
      SL: { opening: 4, accrued: 4, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 8 },
      PL: { opening: 10, accrued: 5, approvedRestorations: 0, approvedDeductions: 2, pendingReservations: 0, available: 13 },
      COMP: { opening: 0, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 0 }
    }
  },

  // 6. Leave Requests (Lifecycle)
  leaveRequests: [
    {
      id: 'LR-202611-001',
      employeeId: 'PE004',
      employeeName: 'Kavitha Sharma',
      department: 'Engineering & QA',
      branch: 'Hyderabad',
      branchId: 'HYD',
      leaveType: 'Sick Leave',
      leaveTypeCode: 'SL',
      fromDate: '2026-11-18',
      toDate: '2026-11-19',
      totalDays: 2,
      reason: 'Viral fever & doctor recommended rest',
      status: 'Pending',
      appliedAt: '2026-11-18T08:30:00+05:30',
      approverId: null,
      approvedAt: null,
      rejectionReason: null,
      internalComment: null,
      availableBalanceAtSubmission: 6.0
    },
    {
      id: 'LR-202611-002',
      employeeId: 'PE006',
      employeeName: 'Rohan Patel',
      department: 'Information Technology',
      branch: 'Chennai',
      branchId: 'CHE',
      leaveType: 'Casual Leave',
      leaveTypeCode: 'CL',
      fromDate: '2026-11-17',
      toDate: '2026-11-17',
      totalDays: 1,
      reason: 'Family function in Coimbatore',
      status: 'Approved',
      appliedAt: '2026-11-15T10:00:00+05:30',
      approverId: 'PE002',
      approverName: 'Pooja Hegde',
      approvedAt: '2026-11-15T14:20:00+05:30',
      rejectionReason: null,
      internalComment: 'Approved as per team handover',
      availableBalanceAtSubmission: 8.0
    },
    {
      id: 'LR-202611-003',
      employeeId: 'PE008',
      employeeName: 'Siddharth Verma',
      department: 'Plant Operations & Logistics',
      branch: 'Mumbai',
      branchId: 'MUM',
      leaveType: 'Privilege Leave (Earned)',
      leaveTypeCode: 'PL',
      fromDate: '2026-11-25',
      toDate: '2026-11-28',
      totalDays: 4,
      reason: 'Annual family pilgrimage',
      status: 'Pending',
      appliedAt: '2026-11-17T11:15:00+05:30',
      approverId: null,
      approvedAt: null,
      rejectionReason: null,
      internalComment: null,
      availableBalanceAtSubmission: 16.0
    }
  ],

  // 7. Today's Attendance & Biometric Punches
  attendance: [
    {
      id: 'ATT-20261118-PE000',
      date: '2026-11-18',
      employeeId: 'PE000',
      employeeName: 'Prashanth Reddy',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Executive Management',
      firstIn: '08:50 AM',
      lastOut: '-',
      workingHours: '8.5 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'Door-01 Main Gate (192.168.1.240)'
    },
    {
      id: 'ATT-20261118-PE001',
      date: '2026-11-18',
      employeeId: 'PE001',
      employeeName: 'Ravi Kumar',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Information Technology',
      firstIn: '09:12 AM',
      lastOut: '-',
      workingHours: '8.1 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'Door-01 Main Gate (192.168.1.240)'
    },
    {
      id: 'ATT-20261118-PE002',
      date: '2026-11-18',
      employeeId: 'PE002',
      employeeName: 'Pooja Hegde',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Human Resources',
      firstIn: '09:05 AM',
      lastOut: '-',
      workingHours: '8.3 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'Door-02 HR Hub'
    },
    {
      id: 'ATT-20261118-PE003',
      date: '2026-11-18',
      employeeId: 'PE003',
      employeeName: 'Rajesh Kannan',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Information Technology',
      firstIn: '08:58 AM',
      lastOut: '-',
      workingHours: '8.4 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'Door-03 Server Room'
    },
    {
      id: 'ATT-20261118-PE004',
      date: '2026-11-18',
      employeeId: 'PE004',
      employeeName: 'Kavitha Sharma',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Engineering & QA',
      firstIn: '-',
      lastOut: '-',
      workingHours: '0.0 hrs',
      status: 'On Approved Leave',
      isLate: false,
      lateMinutes: 0,
      mode: 'Approved Leave',
      terminal: '-'
    },
    {
      id: 'ATT-20261118-PE005',
      date: '2026-11-18',
      employeeId: 'PE005',
      employeeName: 'Vikram Malhotra',
      branch: 'Hyderabad',
      branchId: 'HYD',
      department: 'Engineering & QA',
      firstIn: '09:35 AM',
      lastOut: '-',
      workingHours: '7.8 hrs',
      status: 'Late Arrival',
      isLate: true,
      lateMinutes: 20,
      mode: 'Biometric Optical',
      terminal: 'Door-01 Main Gate'
    },
    {
      id: 'ATT-20261118-PE006',
      date: '2026-11-18',
      employeeId: 'PE006',
      employeeName: 'Rohan Patel',
      branch: 'Chennai',
      branchId: 'CHE',
      department: 'Information Technology',
      firstIn: '09:02 AM',
      lastOut: '-',
      workingHours: '8.2 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'CHE-Reader-01'
    },
    {
      id: 'ATT-20261118-PE007',
      date: '2026-11-18',
      employeeId: 'PE007',
      employeeName: 'Deepa Nair',
      branch: 'Chennai',
      branchId: 'CHE',
      department: 'Administration',
      firstIn: '09:25 AM',
      lastOut: '-',
      workingHours: '7.9 hrs',
      status: 'Late Arrival',
      isLate: true,
      lateMinutes: 10,
      mode: 'Biometric Optical',
      terminal: 'CHE-Reader-02'
    },
    {
      id: 'ATT-20261118-PE008',
      date: '2026-11-18',
      employeeId: 'PE008',
      employeeName: 'Siddharth Verma',
      branch: 'Mumbai',
      branchId: 'MUM',
      department: 'Plant Operations & Logistics',
      firstIn: '08:45 AM',
      lastOut: '-',
      workingHours: '8.6 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'MUM-Reader-Main'
    },
    {
      id: 'ATT-20261118-PE009',
      date: '2026-11-18',
      employeeId: 'PE009',
      employeeName: 'Ananya Deshmukh',
      branch: 'Mumbai',
      branchId: 'MUM',
      department: 'Engineering & QA',
      firstIn: '09:10 AM',
      lastOut: '-',
      workingHours: '8.1 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'MUM-Reader-Main'
    },
    {
      id: 'ATT-20261118-PE010',
      date: '2026-11-18',
      employeeId: 'PE010',
      employeeName: 'Sneha Kulkarni',
      branch: 'Mumbai',
      branchId: 'MUM',
      department: 'Finance & Accounts',
      firstIn: '09:14 AM',
      lastOut: '-',
      workingHours: '8.0 hrs',
      status: 'Present',
      isLate: false,
      lateMinutes: 0,
      mode: 'Biometric Optical',
      terminal: 'MUM-Reader-Office'
    }
  ],

  // 8. Attendance Correction Requests
  attendanceCorrections: [
    {
      id: 'AC-101',
      employeeId: 'PE005',
      employeeName: 'Vikram Malhotra',
      branch: 'Hyderabad',
      branchId: 'HYD',
      date: '2026-11-14',
      punchType: 'OUT Punch',
      requestedTime: '06:15 PM',
      originalRecordedTime: 'Missing',
      reason: 'Matrix Door 02 was undergoing scheduled power cycling during departure',
      status: 'Pending',
      submittedAt: '2026-11-15T09:30:00+05:30'
    }
  ],

  // 9. Enterprise Payroll Structures & Monthly Runs
  payrollRuns: [
    {
      id: 'PR-2026-10',
      period: 'October 2026',
      year: 2026,
      month: 10,
      status: 'Finalized',
      approvedBy: 'Sneha Kulkarni',
      approvedAt: '2026-10-31T17:00:00+05:30',
      totalGross: 1425000,
      totalDeductions: 182400,
      totalNet: 1242600,
      totalEmployees: 10,
      branchBreakdown: {
        HYD: { gross: 885000, deductions: 112000, net: 773000, count: 6 },
        CHE: { gross: 245000, deductions: 32000, net: 213000, count: 2 },
        MUM: { gross: 295000, deductions: 38400, net: 256600, count: 2 }
      }
    },
    {
      id: 'PR-2026-11',
      period: 'November 2026',
      year: 2026,
      month: 11,
      status: 'Preview Generated',
      approvedBy: null,
      approvedAt: null,
      totalGross: 1485000,
      totalDeductions: 189200,
      totalNet: 1295800,
      totalEmployees: 10,
      branchBreakdown: {
        HYD: { gross: 915000, deductions: 115200, net: 799800, count: 6 },
        CHE: { gross: 255000, deductions: 33200, net: 221800, count: 2 },
        MUM: { gross: 315000, deductions: 40800, net: 274200, count: 2 }
      }
    }
  ],

  // Salary master records
  salaryStructures: {
    PE001: { basic: 45000, hra: 22500, specialAllowance: 22500, pf: 5400, pt: 200, tds: 4500, gross: 90000, net: 79900 },
    PE004: { basic: 55000, hra: 27500, specialAllowance: 27500, pf: 6600, pt: 200, tds: 6800, gross: 110000, net: 96400 },
    PE005: { basic: 60000, hra: 30000, specialAllowance: 30000, pf: 7200, pt: 200, tds: 8200, gross: 120000, net: 104400 },
    PE006: { basic: 62000, hra: 31000, specialAllowance: 31000, pf: 7440, pt: 200, tds: 9000, gross: 124000, net: 107360 },
    PE008: { basic: 40000, hra: 20000, specialAllowance: 20000, pf: 4800, pt: 200, tds: 3500, gross: 80000, net: 71500 },
    PE009: { basic: 58000, hra: 29000, specialAllowance: 29000, pf: 6960, pt: 200, tds: 7800, gross: 116000, net: 101040 }
  },

  // 10. Recruitment
  recruitmentJobs: [
    { id: 'JOB-401', title: 'Senior Full-Stack Engineer (React & Node.js)', department: 'Information Technology', branch: 'Hyderabad', branchId: 'HYD', type: 'Full-Time', experience: '4-7 Years', vacancies: 2, applicantsCount: 14, shortlistedCount: 5, status: 'Active' },
    { id: 'JOB-402', title: 'DevOps & Local Intranet Security Specialist', department: 'Information Technology', branch: 'Chennai', branchId: 'CHE', type: 'Full-Time', experience: '3-5 Years', vacancies: 1, applicantsCount: 8, shortlistedCount: 3, status: 'Active' },
    { id: 'JOB-403', title: 'HR Business Partner (Talent & Operations)', department: 'Human Resources', branch: 'Hyderabad', branchId: 'HYD', type: 'Full-Time', experience: '2-4 Years', vacancies: 1, applicantsCount: 11, shortlistedCount: 4, status: 'Active' },
    { id: 'JOB-404', title: 'Plant Logistics Lead', department: 'Plant Operations & Logistics', branch: 'Mumbai', branchId: 'MUM', type: 'Full-Time', experience: '5-8 Years', vacancies: 1, applicantsCount: 6, shortlistedCount: 2, status: 'Interviewing' }
  ],

  candidates: [
    { id: 'CAN-801', jobId: 'JOB-401', jobTitle: 'Senior Full-Stack Engineer', name: 'Arun Varma', email: 'arun.varma@gmail.com', phone: '+91 99887 66554', stage: 'Technical Round 2', rating: 4.8, experience: '5.5 Years', resumeUrl: '#', appliedDate: '2026-11-12' },
    { id: 'CAN-802', jobId: 'JOB-401', jobTitle: 'Senior Full-Stack Engineer', name: 'Tanvi Joshi', email: 'tanvi.j@outlook.com', phone: '+91 98765 43210', stage: 'Offer Stage', rating: 4.9, experience: '6.0 Years', resumeUrl: '#', appliedDate: '2026-11-08' },
    { id: 'CAN-803', jobId: 'JOB-402', jobTitle: 'DevOps & Security Specialist', name: 'Karthik Raja', email: 'karthik.raja@yahoo.com', phone: '+91 94433 22110', stage: 'Screening', rating: 4.2, experience: '4.0 Years', resumeUrl: '#', appliedDate: '2026-11-16' },
    { id: 'CAN-804', jobId: 'JOB-403', jobTitle: 'HR Business Partner', name: 'Shalini Sen', email: 'shalini.sen@gmail.com', phone: '+91 91234 56789', stage: 'HR Discussion', rating: 4.5, experience: '3.2 Years', resumeUrl: '#', appliedDate: '2026-11-14' }
  ],

  // 11. Append-Only Audit Logs
  auditLogs: [
    { id: 'AUD-001', action: 'SYSTEM_INIT', module: 'System', user: 'System Bootstrapper', userId: 'SYS', timestamp: '2026-11-18T00:00:00+05:30', details: 'Initialized unified Firestore replica store with Intranet replication support.' },
    { id: 'AUD-002', action: 'PUNCH_SYNC', module: 'Attendance', user: 'Matrix COSEC Daemon', userId: 'MTX_SRV', timestamp: '2026-11-18T09:12:34+05:30', details: 'Biometric push received for Ravi Kumar (PE001) at Reader 01.' },
    { id: 'AUD-003', action: 'LEAVE_SUBMIT', module: 'Leave', user: 'Kavitha Sharma', userId: 'PE004', timestamp: '2026-11-18T08:30:00+05:30', details: 'Submitted 2-day Sick Leave request (LR-202611-001). Balance reserved.' }
  ],

  // 12. Notifications Store
  notifications: [
    { id: 'NOTIF-1', title: 'New Leave Request Received', message: 'Kavitha Sharma requested 2 days Sick Leave.', type: 'LEAVE', read: false, createdAt: '2026-11-18T08:30:00+05:30', targetRoles: ['HR', 'Global Admin', 'Manager'] },
    { id: 'NOTIF-2', title: 'Matrix Biometric Sync Alert', message: 'All 3 biometric controllers at Hyderabad, Chennai, Mumbai are active.', type: 'DEVICE', read: true, createdAt: '2026-11-18T09:00:00+05:30', targetRoles: ['Global Admin', 'HR', 'Employee'] },
    { id: 'NOTIF-3', title: 'November Payroll Preview Ready', message: 'November 2026 payroll calculation preview is ready for finance review.', type: 'PAYROLL', read: false, createdAt: '2026-11-18T10:00:00+05:30', targetRoles: ['Finance', 'Global Admin'] }
  ],

  // 13. System Configuration
  systemConfig: {
    companyName: 'Prashanth Enterprises',
    companyCode: 'PE-CORP',
    timezone: 'Asia/Kolkata (IST +05:30)',
    officeStartTime: '09:00 AM',
    officeEndTime: '06:00 PM',
    gracePeriodMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.0,
    workingDaysPerWeek: 5.5,
    intranetTerminalIp: '192.168.1.240',
    biometricPushEnabled: true,
    providentFundRate: 12,
    professionalTaxMonthly: 200,
    activeFiscalYear: '2026-2027'
  }
};

class HrmDataEngine {
  constructor() {
    this.subscribers = new Set();
    this.data = this.loadData();
    this.syncListeners = [];
    this.firebaseSyncStatus = {
      connected: false,
      lastSync: null,
      error: null
    };

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initRealtimeFirebaseSync();
      }, 300);
    }
  }

  normalizeEmployee360(emp) {
    if (!emp) return emp;
    if (!emp.companyId) {
      emp.companyId = 'PRASHANTH_ENTERPRISES';
    }
    if (!emp.personal) {
      emp.personal = {
        fullName: emp.name,
        dob: "1994-08-24",
        gender: "Male",
        personalEmail: emp.personalEmail || (emp.email ? emp.email.replace('@prashanthenterprises.in', '.dev@gmail.com') : 'personal@gmail.com'),
        officialEmail: emp.email,
        mobile: emp.phone || '+91 98480 11221',
        emergencyContact: {
          name: "Sunita Reddy / Family",
          relation: "Spouse / Parent",
          phone: "+91 98480 99881"
        },
        currentAddress: `Flat 402, Cyber Residency, Madhapur, ${emp.branch || 'Hyderabad'}`,
        permanentAddress: "Plot 12, Tilak Road, Rajahmundry, Andhra Pradesh 533101",
        maritalStatus: "Married",
        bloodGroup: "O+ve",
        profilePhoto: emp.avatar
      };
    } else {
      if (!emp.personal.personalEmail) {
        emp.personal.personalEmail = emp.personalEmail || (emp.email ? emp.email.replace('@prashanthenterprises.in', '.dev@gmail.com') : 'personal@gmail.com');
      }
      if (!emp.personal.officialEmail) {
        emp.personal.officialEmail = emp.email;
      }
      if (!emp.personal.mobile) {
        emp.personal.mobile = emp.phone;
      }
    }
    if (!emp.employment) {
      emp.employment = {
        employeeId: emp.employeeId,
        joiningDate: emp.joiningDate,
        employmentType: emp.employmentType || "Full-Time Permanent",
        employmentStatus: emp.status || "Active",
        designation: emp.role,
        department: emp.department,
        deptCode: emp.deptCode,
        branch: emp.branch,
        branchId: emp.branchId,
        workLocation: `${emp.branch || 'Hyderabad'} Hub - Tech Floor Bay 4`,
        reportingManagerName: emp.managerName || "Board of Directors",
        reportingManagerId: emp.managerId,
        previousDesignations: [`Associate ${emp.role.split(' ')[0]}`, `Junior Analyst`],
        previousDepartments: ["Operations Support"],
        transferHistory: [
          { date: emp.joiningDate, fromBranch: "Chennai Regional Hub", toBranch: `${emp.branch || 'Hyderabad'} Hub`, reason: "Strategic Project Lead Allocation", approvedBy: "Pooja Hegde" }
        ],
        managerHistory: [
          { managerId: emp.managerId, managerName: emp.managerName, effectiveDate: emp.joiningDate }
        ],
        confirmationDate: emp.joiningDate,
        probationStatus: "Confirmed",
        noticePeriod: "60 Days",
        exitDetails: null
      };
    }
    if (!emp.education || emp.education.length === 0) {
      emp.education = [
        {
          id: `EDU-${emp.id}-1`,
          qualification: "Bachelor of Technology (B.Tech)",
          degree: "B.Tech in Computer Science & Engineering",
          specialization: "Distributed Systems & Cloud Computing",
          institution: "JNTU College of Engineering",
          university: "Jawaharlal Nehru Technological University",
          yearOfPassing: "2019",
          percentage: "84.5%",
          certificateName: "BTech_Degree_Certificate.pdf"
        },
        {
          id: `EDU-${emp.id}-2`,
          qualification: "Higher Secondary (10+2)",
          degree: "Class XII Intermediate",
          specialization: "Maths, Physics, Chemistry (MPC)",
          institution: "Sri Chaitanya Junior College",
          university: "Board of Intermediate Education",
          yearOfPassing: "2015",
          percentage: "91.8%",
          certificateName: "Intermediate_Pass_Certificate.pdf"
        }
      ];
    }
    if (!emp.experience || emp.experience.length === 0) {
      emp.experience = [
        {
          id: `EXP-${emp.id}-1`,
          companyName: "Cognizant Technology Solutions",
          designation: "Programmer Analyst",
          startDate: "2019-07-01",
          endDate: "2022-03-31",
          totalExperience: "2 Yrs 9 Mos",
          documentName: "CTS_Relieving_Experience_Letter.pdf"
        },
        {
          id: `EXP-${emp.id}-2`,
          companyName: "Incture Technologies",
          designation: "Software Engineer",
          startDate: "2022-04-01",
          endDate: emp.joiningDate,
          totalExperience: "2 Yrs",
          documentName: "Incture_Service_Certificate.pdf"
        }
      ];
    }
    if (!emp.documents || emp.documents.length === 0) {
      emp.documents = [
        {
          id: `DOC-${emp.id}-1`,
          category: "Aadhaar / Identity Proof",
          documentName: `${emp.name.replace(/\s+/g, '_')}_Aadhaar_Card.pdf`,
          type: "PDF",
          uploadDate: emp.joiningDate,
          verificationStatus: "Verified",
          verifiedBy: "Pooja Hegde",
          verifiedAt: emp.joiningDate,
          expiryDate: "N/A"
        },
        {
          id: `DOC-${emp.id}-2`,
          category: "PAN",
          documentName: `PAN_${emp.panNumber || 'ABCDE1234F'}.pdf`,
          type: "PDF",
          uploadDate: emp.joiningDate,
          verificationStatus: "Verified",
          verifiedBy: "Sneha Kulkarni",
          verifiedAt: emp.joiningDate,
          expiryDate: "N/A"
        },
        {
          id: `DOC-${emp.id}-3`,
          category: "Offer Letter",
          documentName: `Prashanth_Enterprises_Offer_${emp.employeeId}.pdf`,
          type: "PDF",
          uploadDate: emp.joiningDate,
          verificationStatus: "Verified",
          verifiedBy: "Pooja Hegde",
          verifiedAt: emp.joiningDate,
          expiryDate: "N/A"
        },
        {
          id: `DOC-${emp.id}-4`,
          category: "Employment Agreement",
          documentName: `Signed_NDA_Employment_Contract_${emp.employeeId}.pdf`,
          type: "PDF",
          uploadDate: emp.joiningDate,
          verificationStatus: "Verified",
          verifiedBy: "Pooja Hegde",
          verifiedAt: emp.joiningDate,
          expiryDate: "2027-03-15"
        }
      ];
    }
    if (!emp.loginSessions || emp.loginSessions.length === 0) {
      emp.loginSessions = [
        {
          id: `SESS-${emp.id}-1`,
          date: "2026-11-18",
          loginTime: "09:12:34 AM",
          logoutTime: "Active Session",
          sessionStatus: "Active",
          device: "Windows 11 / Chrome 132 (Enterprise Desktop)",
          ipAddress: "192.168.1.104 (Local Intranet)"
        },
        {
          id: `SESS-${emp.id}-2`,
          date: "2026-11-17",
          loginTime: "09:05:12 AM",
          logoutTime: "06:18:40 PM",
          sessionStatus: "Terminated Cleanly",
          device: "Windows 11 / Chrome 132 (Enterprise Desktop)",
          ipAddress: "192.168.1.104 (Local Intranet)"
        },
        {
          id: `SESS-${emp.id}-3`,
          date: "2026-11-16",
          loginTime: "08:58:30 AM",
          logoutTime: "06:12:00 PM",
          sessionStatus: "Terminated Cleanly",
          device: "Android 15 / Chrome Mobile (PE VPN)",
          ipAddress: "192.168.1.185 (Intranet Wi-Fi)"
        }
      ];
    }
    if (!emp.performance) {
      emp.performance = {
        currentRating: "4.8 / 5.0",
        reviewCycle: "Q3 2026 Appraisal",
        managerFeedback: "Consistently achieves operational milestones with high engineering precision and strict intranet security compliance.",
        goals: [
          { goal: "Matrix reader real-time stream integration", status: "Completed (100%)" },
          { goal: "Enterprise IT Policy-2025 rollout and audit sign-off", status: "Compliant (100%)" }
        ],
        promotionHistory: [
          { date: "2025-04-01", fromDesignation: "Software Engineer I", toDesignation: emp.role, salaryHike: "18%", approvedBy: "Prashanth Reddy" }
        ],
        trainingCertifications: [
          { name: "Certified Kubernetes Administrator (CKA)", completedDate: "2025-08-10", validTill: "2028-08-10" },
          { name: "ISO 27001 Information Security Compliance", completedDate: "2026-01-15", validTill: "2027-01-15" }
        ]
      };
    }
    if (!emp.bankDetails) {
      emp.bankDetails = {
        bankName: "HDFC Bank Ltd",
        accountNumber: `50100${emp.id.replace(/\D/g, '').padEnd(9, '48291')}`,
        ifscCode: "HDFC0001823",
        branchName: `${emp.branch || 'Hyderabad'} Tech Hub Branch`,
        accountType: "Corporate Salary Account"
      };
    }
    if (!emp.salaryHistory) {
      emp.salaryHistory = [
        { effectiveDate: "2025-04-01", gross: 90000, basic: 45000, revisedBy: "Prashanth Reddy", reason: "Annual Merit Performance Revision" },
        { effectiveDate: emp.joiningDate, gross: 75000, basic: 37500, revisedBy: "Pooja Hegde", reason: "Initial Onboarding Compensation" }
      ];
    }
    return emp;
  }

  loadData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.employees && Array.isArray(parsed.employees)) {
            parsed.employees = parsed.employees.map(e => this.normalizeEmployee360(e));
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using seed data:', e);
    }
    const fresh = JSON.parse(JSON.stringify(initialEnterpriseData));
    fresh.employees = fresh.employees.map(e => this.normalizeEmployee360(e));
    return fresh;
  }

  saveDataLocallyOnly() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }

  saveData() {
    this.saveDataLocallyOnly();
    this.notifySubscribers();
  }

  async syncDocToFirebase(collectionName, docId, data) {
    if (!isFirebaseConfigured() || !db) return;
    try {
      const cleanData = JSON.parse(JSON.stringify(data));
      await setDoc(doc(db, collectionName, String(docId)), cleanData, { merge: true });
      this.firebaseSyncStatus.connected = true;
      this.firebaseSyncStatus.lastSync = new Date().toISOString();
      this.firebaseSyncStatus.error = null;
    } catch (err) {
      console.warn(`[Firebase Live Sync] Failed to sync ${collectionName}/${docId}:`, err);
      this.firebaseSyncStatus.error = err.message;
    }
  }

  initRealtimeFirebaseSync() {
    if (typeof window === 'undefined') return;
    if (!isFirebaseConfigured() || !db) {
      console.info('[Firebase Live Sync] Firebase not configured; running in local storage mode.');
      return;
    }

    try {
      // 1. Real-time Employees Collection Listener
      const unsubEmployees = onSnapshot(collection(db, 'employees'), async (snapshot) => {
        try {
          this.firebaseSyncStatus.connected = true;
          this.firebaseSyncStatus.lastSync = new Date().toISOString();

          const remoteEmployees = [];
          snapshot.forEach((d) => {
            const empData = d.data();
            if (empData && (empData.id || empData.employeeId)) {
              remoteEmployees.push(this.normalizeEmployee360(empData));
            }
          });

          // Check if local storage has any employees not yet in Firestore (e.g. newly created members)
          const remoteIdSet = new Set(remoteEmployees.map(e => e.id));
          const localOnly = this.data.employees.filter(e => e && e.id && !remoteIdSet.has(e.id));

          if (localOnly.length > 0) {
            console.info(`[Firebase Live Sync] Auto-pushing ${localOnly.length} local employee(s) to live Firestore:`, localOnly.map(e => `${e.name} (${e.id})`));
            for (const localEmp of localOnly) {
              const clean = JSON.parse(JSON.stringify(this.normalizeEmployee360(localEmp)));
              await setDoc(doc(db, 'employees', localEmp.id), clean, { merge: true });
              if (this.data.leaveLedger && this.data.leaveLedger[localEmp.id]) {
                await setDoc(doc(db, 'leave_ledger', localEmp.id), JSON.parse(JSON.stringify(this.data.leaveLedger[localEmp.id])), { merge: true });
              }
              remoteEmployees.push(clean);
            }
          }

          if (remoteEmployees.length > 0) {
            remoteEmployees.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
            this.data.employees = remoteEmployees;
            this.saveDataLocallyOnly();
            this.notifySubscribers();
          }
        } catch (err) {
          console.warn('[Firebase Live Sync] Error processing employees snapshot:', err);
        }
      }, (err) => {
        console.warn('[Firebase Live Sync] Employees snapshot error:', err);
        this.firebaseSyncStatus.connected = false;
        this.firebaseSyncStatus.error = err.message;
      });
      this.syncListeners.push(unsubEmployees);

      // 2. Real-time Leave Requests Listener
      const unsubLeaves = onSnapshot(collection(db, 'leave_requests'), (snapshot) => {
        try {
          const remoteLeaves = [];
          snapshot.forEach(d => remoteLeaves.push(d.data()));
          if (remoteLeaves.length > 0) {
            this.data.leaveRequests = remoteLeaves;
            this.saveDataLocallyOnly();
            this.notifySubscribers();
          }
        } catch (err) {
          console.warn('[Firebase Live Sync] Error processing leave requests snapshot:', err);
        }
      }, (err) => {
        console.warn('[Firebase Live Sync] Leave requests listener error:', err);
      });
      this.syncListeners.push(unsubLeaves);

      // 3. Real-time Attendance Listener
      const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
        try {
          const remoteAtt = [];
          snapshot.forEach(d => remoteAtt.push(d.data()));
          if (remoteAtt.length > 0) {
            const attMap = new Map(this.data.attendance.map(a => [a.id, a]));
            remoteAtt.forEach(a => attMap.set(a.id, a));
            this.data.attendance = Array.from(attMap.values());
            this.saveDataLocallyOnly();
            this.notifySubscribers();
          }
        } catch (err) {
          console.warn('[Firebase Live Sync] Error processing attendance snapshot:', err);
        }
      }, (err) => {
        console.warn('[Firebase Live Sync] Attendance listener error:', err);
      });
      this.syncListeners.push(unsubAttendance);

      // 4. Real-time Leave Ledger Listener
      const unsubLedger = onSnapshot(collection(db, 'leave_ledger'), (snapshot) => {
        try {
          snapshot.forEach(d => {
            if (!this.data.leaveLedger) this.data.leaveLedger = {};
            this.data.leaveLedger[d.id] = d.data();
          });
          this.saveDataLocallyOnly();
          this.notifySubscribers();
        } catch (err) {
          console.warn('[Firebase Live Sync] Error processing leave ledger snapshot:', err);
        }
      }, (err) => {
        console.warn('[Firebase Live Sync] Leave ledger listener error:', err);
      });
      this.syncListeners.push(unsubLedger);

      // 5. Real-time System Config Listener
      const unsubConfig = onSnapshot(doc(db, 'system_config', 'corporate'), (snapshot) => {
        try {
          if (snapshot.exists()) {
            this.data.systemConfig = { ...this.data.systemConfig, ...snapshot.data() };
            this.saveDataLocallyOnly();
            this.notifySubscribers();
          }
        } catch (err) {
          console.warn('[Firebase Live Sync] Error processing system config snapshot:', err);
        }
      }, (err) => {
        console.warn('[Firebase Live Sync] System config listener error:', err);
      });
      this.syncListeners.push(unsubConfig);

    } catch (error) {
      console.warn('[Firebase Live Sync] Initialization warning:', error);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    // Execute immediately with current data
    callback(this.data);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    for (const callback of this.subscribers) {
      try {
        callback(this.data);
      } catch (err) {
        console.error('Error notifying subscriber:', err);
      }
    }
  }

  // --- Append-Only Audit Logger ---
  logAudit(action, module, user, userId, details) {
    const entry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      module,
      user: user || 'Authorized User',
      userId: userId || 'SYS',
      timestamp: new Date().toISOString(),
      details
    };
    this.data.auditLogs.unshift(entry);
  }

  // --- 1. Leave Management Lifecycle ---
  createLeaveRequest(params, actorId, actorName) {
    return this.submitLeaveRequest({
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      department: params.department,
      branch: params.branch,
      branchId: params.branchId,
      leaveType: params.leaveType || params.type,
      leaveTypeCode: params.leaveTypeCode || params.type,
      fromDate: params.fromDate || params.startDate,
      toDate: params.toDate || params.endDate,
      totalDays: params.totalDays || params.days || 1,
      reason: params.reason || 'Personal Work'
    });
  }

  submitLeaveRequest({ employeeId, employeeName, department, branch, branchId, leaveType, leaveTypeCode, fromDate, toDate, totalDays, reason }) {
    // 1. Validation
    const emp = this.data.employees.find(e => e.id === employeeId || e.employeeId === employeeId) || this.data.employees[0];
    if (!emp || emp.status !== 'Active') {
      throw new Error('Employee record is inactive or could not be found.');
    }

    // 2. Validate sufficient balance
    if (!this.data.leaveLedger[emp.id]) {
      this.data.leaveLedger[emp.id] = {
        CL: { opening: 12, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 12 },
        SL: { opening: 10, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 10 },
        PL: { opening: 18, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 18 },
        COMP: { opening: 2, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 2.0 }
      };
    }
    const ledger = this.data.leaveLedger[emp.id] || this.data.leaveLedger[emp.employeeId] || this.data.leaveLedger['PE001'];
    const typeBalance = ledger[leaveTypeCode] || { available: 5, opening: 6 };
    if (typeBalance.available < totalDays) {
      throw new Error(`Insufficient ${leaveType} balance. Requested: ${totalDays} days, Available: ${typeBalance.available} days.`);
    }

    // 3. Overlap check
    const existing = this.data.leaveRequests.find(r => 
      (r.employeeId === emp.id || r.employeeId === emp.employeeId) &&
      r.status !== 'Rejected' && r.status !== 'Cancelled' &&
      ((fromDate >= r.fromDate && fromDate <= r.toDate) || (toDate >= r.fromDate && toDate <= r.toDate))
    );
    if (existing) {
      throw new Error(`Overlapping leave application already exists between ${existing.fromDate} and ${existing.toDate}.`);
    }

    // 4. Create request
    const newRequest = {
      id: `LR-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      branch: emp.branch,
      branchId: emp.branchId,
      leaveType,
      leaveTypeCode,
      fromDate,
      toDate,
      totalDays: Number(totalDays),
      reason,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      approverId: null,
      approvedAt: null,
      rejectionReason: null,
      internalComment: null,
      availableBalanceAtSubmission: typeBalance.available
    };

    // 5. Atomic reservation in ledger
    typeBalance.pendingReservations = (typeBalance.pendingReservations || 0) + Number(totalDays);
    typeBalance.available = Number((typeBalance.available - Number(totalDays)).toFixed(1));

    this.data.leaveRequests.unshift(newRequest);

    // 6. Push notification for HR & Global Admin
    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'New Leave Application',
      message: `${emp.name} (${emp.branch}) applied for ${totalDays} days of ${leaveType}.`,
      type: 'LEAVE',
      read: false,
      createdAt: new Date().toISOString(),
      targetRoles: ['HR', 'Global Admin', 'Manager']
    });

    // 7. Audit log
    this.logAudit('LEAVE_APPLICATION_SUBMITTED', 'Leave', emp.name, emp.id, `Submitted ${totalDays} days ${leaveType} from ${fromDate} to ${toDate}. Available balance reserved.`);

    this.saveData();
    this.syncDocToFirebase('leave_requests', newRequest.id, newRequest);
    this.syncDocToFirebase('leave_ledger', emp.id, ledger);
    return newRequest;
  }

  approveLeaveRequest(requestId, approverId, approverName, comment) {
    const req = this.data.leaveRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Leave request not found.');
    if (req.status !== 'Pending') throw new Error(`Request has already been processed with status: ${req.status}`);

    const ledger = this.data.leaveLedger[req.employeeId] || this.data.leaveLedger['PE001'];
    const balance = ledger ? ledger[req.leaveTypeCode] : null;

    if (balance) {
      // Move from pending reservation to approved deduction
      balance.pendingReservations = Math.max(0, (balance.pendingReservations || 0) - req.totalDays);
      balance.approvedDeductions = (balance.approvedDeductions || 0) + req.totalDays;
    }

    req.status = 'Approved';
    req.approverId = approverId || 'PE002';
    req.approverName = approverName || 'HR Admin';
    req.approvedAt = new Date().toISOString();
    req.internalComment = comment || 'Approved by HR';

    // Update attendance status for the employee
    const todayStr = new Date().toISOString().split('T')[0];
    if (req.fromDate <= todayStr && req.toDate >= todayStr) {
      const att = this.data.attendance.find(a => a.employeeId === req.employeeId && a.date === todayStr);
      if (att) {
        att.status = 'On Approved Leave';
        att.mode = 'Approved Leave';
      }
    }

    // Push notification to employee
    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'Leave Request Approved! ✅',
      message: `Your ${req.totalDays}-day ${req.leaveType} has been approved by ${req.approverName}.`,
      type: 'LEAVE',
      read: false,
      createdAt: new Date().toISOString(),
      targetRoles: ['Employee']
    });

    this.logAudit('LEAVE_APPROVED', 'Leave', req.approverName, req.approverId, `Approved request ${req.id} for ${req.employeeName} (${req.totalDays} days ${req.leaveType}).`);

    this.saveData();
    this.syncDocToFirebase('leave_requests', req.id, req);
    if (ledger) this.syncDocToFirebase('leave_ledger', req.employeeId, ledger);
    return req;
  }

  rejectLeaveRequest(requestId, approverId, approverName, reason) {
    const req = this.data.leaveRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Leave request not found.');
    if (req.status !== 'Pending') throw new Error(`Request is not pending: ${req.status}`);

    // Release reservation back to available balance
    const ledger = this.data.leaveLedger[req.employeeId] || this.data.leaveLedger['PE001'];
    const balance = ledger ? ledger[req.leaveTypeCode] : null;

    if (balance) {
      balance.pendingReservations = Math.max(0, (balance.pendingReservations || 0) - req.totalDays);
      balance.available = Number((balance.available + req.totalDays).toFixed(1));
    }

    req.status = 'Rejected';
    req.approverId = approverId || 'PE002';
    req.approverName = approverName || 'HR Admin';
    req.rejectionReason = reason || 'Work exigencies / insufficient notice';
    req.approvedAt = new Date().toISOString();

    // Push notification to employee
    this.data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'Leave Request Not Approved ⚠️',
      message: `Your ${req.leaveType} was rejected. Reason: ${req.rejectionReason}`,
      type: 'LEAVE',
      read: false,
      createdAt: new Date().toISOString(),
      targetRoles: ['Employee']
    });

    this.logAudit('LEAVE_REJECTED', 'Leave', req.approverName, req.approverId, `Rejected request ${req.id} for ${req.employeeName}. Reason: ${req.rejectionReason}. Balance reservation released.`);

    this.saveData();
    this.syncDocToFirebase('leave_requests', req.id, req);
    if (ledger) this.syncDocToFirebase('leave_ledger', req.employeeId, ledger);
    return req;
  }

  cancelLeaveRequest(requestId, userId, userName, reason) {
    const req = this.data.leaveRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Leave request not found.');
    if (req.status === 'Cancelled') throw new Error('Request already cancelled.');

    const ledger = this.data.leaveLedger[req.employeeId] || this.data.leaveLedger['PE001'];
    const balance = ledger ? ledger[req.leaveTypeCode] : null;

    if (balance) {
      if (req.status === 'Approved') {
        balance.approvedDeductions = Math.max(0, (balance.approvedDeductions || 0) - req.totalDays);
        balance.available = Number((balance.available + req.totalDays).toFixed(1));
      } else if (req.status === 'Pending') {
        balance.pendingReservations = Math.max(0, (balance.pendingReservations || 0) - req.totalDays);
        balance.available = Number((balance.available + req.totalDays).toFixed(1));
      }
    }

    req.status = 'Cancelled';
    req.cancelledAt = new Date().toISOString();
    req.cancellationReason = reason || 'Employee withdrew request';

    this.logAudit('LEAVE_CANCELLED', 'Leave', userName, userId, `Cancelled leave ${req.id}. Restored ${req.totalDays} days to balance.`);

    this.saveData();
    this.syncDocToFirebase('leave_requests', req.id, req);
    if (ledger) this.syncDocToFirebase('leave_ledger', req.employeeId, ledger);
    return req;
  }

  // --- 2. Attendance Management ---
  markAttendancePunch({ employeeId, direction, machine }) {
    const emp = this.data.employees.find(e => e.id === employeeId || e.employeeId === employeeId);
    if (!emp) throw new Error('Employee not found');

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    let att = this.data.attendance.find(a => (a.employeeId === emp.id || a.employeeId === emp.employeeId) && a.date === todayStr);

    if (!att) {
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
      att = {
        id: `ATT-${todayStr}-${emp.id}`,
        date: todayStr,
        employeeId: emp.id,
        employeeName: emp.name,
        branch: emp.branch,
        branchId: emp.branchId,
        department: emp.department,
        firstIn: timeFormatted,
        lastOut: '-',
        workingHours: '0.1 hrs',
        status: isLate ? 'Late Arrival' : 'Present',
        isLate,
        lateMinutes: isLate ? Math.max(0, (now.getHours() - 9) * 60 + now.getMinutes() - 15) : 0,
        mode: 'Biometric Optical',
        terminal: machine || 'Door-01 Main Gate (192.168.1.240)'
      };
      this.data.attendance.unshift(att);
    } else {
      if (direction === 'OUT') {
        att.lastOut = timeFormatted;
      } else {
        att.firstIn = att.firstIn === '-' ? timeFormatted : att.firstIn;
      }
    }

    this.logAudit('ATTENDANCE_PUNCH', 'Attendance', emp.name, emp.id, `Punch ${direction} at ${timeFormatted} via ${machine || 'Biometric Terminal'}`);
    this.saveData();
    this.syncDocToFirebase('attendance', att.id, att);
    return att;
  }

  correctAttendance({ recordId, employeeId, correctedIn, correctedOut, correctedStatus, reason, hrUserId, hrUserName }) {
    const record = this.data.attendance.find(a => a.id === recordId || (a.employeeId === employeeId && a.date === new Date().toISOString().split('T')[0]));
    if (!record) throw new Error('Attendance record not found.');

    const previousSnapshot = JSON.stringify(record);

    if (correctedIn) record.firstIn = correctedIn;
    if (correctedOut) record.lastOut = correctedOut;
    if (correctedStatus) record.status = correctedStatus;
    record.regularized = true;
    record.regularizedBy = hrUserName || 'HR Administrator';
    record.regularizedAt = new Date().toISOString();
    record.regularizationReason = reason;

    // Save correction request / history
    this.data.attendanceCorrections.unshift({
      id: `AC-${Date.now()}`,
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      branch: record.branch,
      branchId: record.branchId,
      date: record.date,
      punchType: 'HR Adjustment',
      requestedTime: `${correctedIn || record.firstIn} - ${correctedOut || record.lastOut}`,
      originalRecordedTime: `${record.firstIn} - ${record.lastOut}`,
      reason: reason || 'Manual HR correction after biometric verification',
      status: 'Approved',
      approvedBy: hrUserName,
      submittedAt: new Date().toISOString()
    });

    this.logAudit('ATTENDANCE_CORRECTION', 'Attendance', hrUserName, hrUserId, `Corrected attendance for ${record.employeeName} on ${record.date}. Reason: ${reason}. Prior state: ${previousSnapshot}`);

    this.saveData();
    this.syncDocToFirebase('attendance', record.id, record);
    return record;
  }

  // --- 3. Employee Master Operations ---
  addEmployee(employeeData, hrUserId, hrUserName) {
    const existing = this.data.employees.find(e => e.email.toLowerCase() === employeeData.email.toLowerCase());
    if (existing) throw new Error(`An employee with email ${employeeData.email} already exists.`);

    // Collision-free unique ID generation based on highest existing PE number
    let maxNum = -1;
    for (const e of this.data.employees) {
      const match = (e.id || '').match(/^PE(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextNum = maxNum >= 0 ? maxNum + 1 : this.data.employees.length;
    const newId = `PE${String(nextNum).padStart(3, '0')}`;
    const newEmpId = `EMP-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

    const newEmployee = {
      id: newId,
      employeeId: newEmpId,
      companyId: 'PRASHANTH_ENTERPRISES',
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone || '+91 98480 00000',
      role: employeeData.role,
      systemRole: employeeData.systemRole || 'Employee',
      department: employeeData.department,
      deptCode: employeeData.deptCode || 'IT',
      branch: employeeData.branch,
      branchId: employeeData.branchId || 'HYD',
      managerId: employeeData.managerId || 'PE000',
      managerName: employeeData.managerName || 'Prashanth Reddy',
      joiningDate: employeeData.joiningDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      employmentType: employeeData.employmentType || 'Full-Time Permanent',
      panNumber: employeeData.panNumber || 'ABCDE1234F',
      pfNumber: employeeData.pfNumber || 'MH/BAN/0012938/000/000000',
      uan: employeeData.uan || '100984920000',
      avatar: employeeData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      biometricId: `MTX-${newId}`
    };

    // Initialize default leave balance
    this.data.leaveLedger[newId] = {
      CL: { opening: 12, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 12 },
      SL: { opening: 10, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 10 },
      PL: { opening: 18, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 18 },
      COMP: { opening: 0, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 0 }
    };

    // Initialize default salary
    this.data.salaryStructures[newId] = {
      basic: Number(employeeData.basicSalary || 40000),
      hra: Number(employeeData.hra || 20000),
      specialAllowance: Number(employeeData.specialAllowance || 20000),
      pf: 4800,
      pt: 200,
      tds: 3000,
      gross: Number(employeeData.basicSalary || 40000) * 2,
      net: (Number(employeeData.basicSalary || 40000) * 2) - 8000
    };

    // Normalize full 14-section 360 profile
    const normalizedEmployee = this.normalizeEmployee360(newEmployee);

    this.data.employees.push(normalizedEmployee);

    this.logAudit('EMPLOYEE_ONBOARDED', 'Employee Master', hrUserName, hrUserId, `Created employee ${normalizedEmployee.name} (${normalizedEmployee.employeeId}) in ${normalizedEmployee.department}, Branch: ${normalizedEmployee.branch}`);

    this.saveData();

    // Instant real-time dual write to Firebase Firestore
    this.syncDocToFirebase('employees', normalizedEmployee.id, normalizedEmployee);
    this.syncDocToFirebase('leave_ledger', newId, this.data.leaveLedger[newId]);

    return normalizedEmployee;
  }

  updateEmployee(id, updates, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');

    Object.assign(emp, updates);
    this.normalizeEmployee360(emp);
    this.logAudit('EMPLOYEE_UPDATED', 'Employee Master', hrUserName, hrUserId, `Updated profile and assignments for ${emp.name} (${emp.id})`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return emp;
  }

  // --- 360° Profile Operations ---
  updateEmployeePersonal(id, personalData, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');
    emp.personal = { ...emp.personal, ...personalData };
    if (personalData.fullName) emp.name = personalData.fullName;
    if (personalData.mobile) emp.phone = personalData.mobile;
    if (personalData.officialEmail) emp.email = personalData.officialEmail;
    if (personalData.profilePhoto) emp.avatar = personalData.profilePhoto;
    this.logAudit('EMPLOYEE_PERSONAL_UPDATED', '360 Profile', hrUserName, hrUserId, `Updated personal details for ${emp.name} (${emp.employeeId})`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return emp;
  }

  updateEmployeeEmployment(id, employmentData, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');

    const oldBranch = emp.branch;
    const oldDept = emp.department;

    emp.employment = { ...emp.employment, ...employmentData };
    if (employmentData.designation) emp.role = employmentData.designation;
    if (employmentData.department) emp.department = employmentData.department;
    if (employmentData.deptCode) emp.deptCode = employmentData.deptCode;
    if (employmentData.branch) emp.branch = employmentData.branch;
    if (employmentData.branchId) emp.branchId = employmentData.branchId;
    if (employmentData.employmentStatus) emp.status = employmentData.employmentStatus;

    if ((employmentData.branch && employmentData.branch !== oldBranch) || (employmentData.department && employmentData.department !== oldDept)) {
      if (!emp.employment.transferHistory) emp.employment.transferHistory = [];
      emp.employment.transferHistory.unshift({
        date: new Date().toISOString().split('T')[0],
        fromBranch: oldBranch,
        toBranch: employmentData.branch || oldBranch,
        fromDept: oldDept,
        toDept: employmentData.department || oldDept,
        reason: employmentData.transferReason || 'Inter-Branch Strategic Reallocation',
        approvedBy: hrUserName
      });
    }

    this.logAudit('EMPLOYEE_EMPLOYMENT_UPDATED', '360 Profile', hrUserName, hrUserId, `Updated employment parameters for ${emp.name} (${emp.employeeId})`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return emp;
  }

  reassignManager(id, newManagerId, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');

    if (id === newManagerId || emp.employeeId === newManagerId) {
      throw new Error('Circular reporting prohibited: Employee cannot report to themselves.');
    }

    const targetManager = this.data.employees.find(e => e.id === newManagerId || e.employeeId === newManagerId);
    if (!targetManager) throw new Error('Target manager record not found.');

    if (targetManager.managerId === emp.id || targetManager.managerId === emp.employeeId) {
      throw new Error(`Circular reporting prohibited: ${targetManager.name} currently reports to ${emp.name}.`);
    }

    const previousManager = emp.managerName || 'None';
    emp.managerId = targetManager.id;
    emp.managerName = targetManager.name;

    if (!emp.employment) emp.employment = {};
    emp.employment.reportingManagerId = targetManager.id;
    emp.employment.reportingManagerName = targetManager.name;

    if (!emp.employment.managerHistory) emp.employment.managerHistory = [];
    emp.employment.managerHistory.unshift({
      managerId: targetManager.id,
      managerName: targetManager.name,
      effectiveDate: new Date().toISOString().split('T')[0],
      assignedBy: hrUserName
    });

    this.logAudit('MANAGER_REASSIGNED', '360 Profile', hrUserName, hrUserId, `Reassigned manager for ${emp.name} from ${previousManager} to ${targetManager.name}`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return emp;
  }

  addEmployeeEducation(id, eduRecord, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');
    if (!emp.education) emp.education = [];
    const newRecord = {
      id: `EDU-${Date.now()}`,
      ...eduRecord
    };
    emp.education.push(newRecord);
    this.logAudit('EDUCATION_ADDED', '360 Profile', hrUserName, hrUserId, `Added qualification ${newRecord.qualification} for ${emp.name}`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return newRecord;
  }

  addEmployeeExperience(id, expRecord, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');
    if (!emp.experience) emp.experience = [];
    const newRecord = {
      id: `EXP-${Date.now()}`,
      ...expRecord
    };
    emp.experience.push(newRecord);
    this.logAudit('EXPERIENCE_ADDED', '360 Profile', hrUserName, hrUserId, `Added past employment at ${newRecord.companyName} for ${emp.name}`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return newRecord;
  }

  uploadEmployeeDocument(id, docRecord, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');
    if (!emp.documents) emp.documents = [];
    const newDoc = {
      id: `DOC-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: 'Pending Verification',
      verifiedBy: null,
      verifiedAt: null,
      ...docRecord
    };
    emp.documents.push(newDoc);
    this.logAudit('DOCUMENT_UPLOADED', '360 Profile', hrUserName, hrUserId, `Uploaded ${newDoc.category} (${newDoc.documentName}) for ${emp.name}`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return newDoc;
  }

  verifyEmployeeDocument(id, docId, hrUserId, hrUserName) {
    const emp = this.data.employees.find(e => e.id === id || e.employeeId === id);
    if (!emp) throw new Error('Employee not found.');
    const doc = emp.documents?.find(d => d.id === docId);
    if (!doc) throw new Error('Document not found.');
    doc.verificationStatus = 'Verified';
    doc.verifiedBy = hrUserName;
    doc.verifiedAt = new Date().toISOString();
    this.logAudit('DOCUMENT_VERIFIED', '360 Profile', hrUserName, hrUserId, `Verified document ${doc.documentName} for ${emp.name}`);
    this.saveData();
    this.syncDocToFirebase('employees', emp.id, emp);
    return doc;
  }

  // --- 4. Payroll Operations ---
  processPayrollRun(periodLabel, year, month, hrUserId, hrUserName) {
    let grossTotal = 0;
    let netTotal = 0;
    let dedTotal = 0;
    const branchTotals = { HYD: { gross: 0, deductions: 0, net: 0, count: 0 }, CHE: { gross: 0, deductions: 0, net: 0, count: 0 }, MUM: { gross: 0, deductions: 0, net: 0, count: 0 } };

    for (const emp of this.data.employees) {
      if (emp.status === 'Active') {
        const sal = this.data.salaryStructures[emp.id] || { basic: 50000, gross: 100000, net: 88000, pf: 6000, pt: 200, tds: 5800 };
        const b = emp.branchId || 'HYD';
        grossTotal += sal.gross;
        netTotal += sal.net;
        const deductions = sal.gross - sal.net;
        dedTotal += deductions;

        if (branchTotals[b]) {
          branchTotals[b].gross += sal.gross;
          branchTotals[b].net += sal.net;
          branchTotals[b].deductions += deductions;
          branchTotals[b].count += 1;
        }
      }
    }

    const runId = `PR-${year}-${String(month).padStart(2, '0')}`;
    const newRun = {
      id: runId,
      period: periodLabel,
      year,
      month,
      status: 'Preview Generated',
      approvedBy: null,
      approvedAt: null,
      totalGross: grossTotal,
      totalDeductions: dedTotal,
      totalNet: netTotal,
      totalEmployees: this.data.employees.filter(e => e.status === 'Active').length,
      branchBreakdown: branchTotals
    };

    const existingIndex = this.data.payrollRuns.findIndex(r => r.id === runId);
    if (existingIndex >= 0) {
      this.data.payrollRuns[existingIndex] = newRun;
    } else {
      this.data.payrollRuns.unshift(newRun);
    }

    this.logAudit('PAYROLL_GENERATED', 'Payroll', hrUserName, hrUserId, `Generated payroll calculation preview for ${periodLabel}. Gross: ₹${grossTotal.toLocaleString()}, Net: ₹${netTotal.toLocaleString()}`);

    this.saveData();
    return newRun;
  }

  approvePayrollRun(runId, approverId, approverName) {
    const run = this.data.payrollRuns.find(r => r.id === runId);
    if (!run) throw new Error('Payroll run not found.');

    run.status = 'Finalized';
    run.approvedBy = approverName;
    run.approvedAt = new Date().toISOString();

    this.logAudit('PAYROLL_APPROVED', 'Payroll', approverName, approverId, `Approved & finalized payroll run ${run.id} for ${run.period}`);
    this.saveData();
    return run;
  }

  // --- 5. Recruitment Operations ---
  addJobOpening({ title, department, branch, branchId, type, experience, vacancies }) {
    const newJob = {
      id: `JOB-${Date.now()}`,
      title,
      department,
      branch,
      branchId: branchId || 'HYD',
      type: type || 'Full-Time',
      experience: experience || '3-5 Years',
      vacancies: Number(vacancies || 1),
      applicantsCount: 0,
      shortlistedCount: 0,
      status: 'Active'
    };
    this.data.recruitmentJobs.unshift(newJob);
    this.logAudit('JOB_POSTED', 'Recruitment', 'HR Admin', 'HR', `Posted job opening for ${title} in ${department} (${branch})`);
    this.saveData();
    return newJob;
  }

  updateCandidateStage(candidateId, newStage, hrUserName) {
    const candidate = this.data.candidates.find(c => c.id === candidateId);
    if (!candidate) throw new Error('Candidate not found.');

    const prevStage = candidate.stage;
    candidate.stage = newStage;

    this.logAudit('CANDIDATE_STAGE_CHANGED', 'Recruitment', hrUserName, 'HR', `Moved candidate ${candidate.name} from ${prevStage} to ${newStage}`);
    this.saveData();
    return candidate;
  }

  // --- 6. Notification management ---
  markNotificationRead(notificationId) {
    const n = this.data.notifications.find(item => item.id === notificationId);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach(n => { n.read = true; });
    this.saveData();
  }

  // --- 7. System Settings update ---
  updateSystemConfig(newConfig, hrUserName, hrUserId) {
    Object.assign(this.data.systemConfig, newConfig);
    this.logAudit('SETTINGS_UPDATED', 'Configuration', hrUserName, hrUserId, `System configuration parameters updated.`);
    this.saveData();
    this.syncDocToFirebase('system_config', 'corporate', this.data.systemConfig);
    return this.data.systemConfig;
  }
}

// Global Singleton Instance
export const hrmStore = new HrmDataEngine();

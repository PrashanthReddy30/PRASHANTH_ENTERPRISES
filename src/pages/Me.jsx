import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Award, 
  Receipt, 
  Grid, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText, 
  UserCheck, 
  Send, 
  X, 
  List, 
  Edit2, 
  ArrowUpRight, 
  Check,
  User,
  Briefcase,
  Laptop,
  DollarSign,
  GraduationCap,
  Building2,
  Network,
  Activity,
  Printer,
  Eye,
  Lock,
  Upload,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  Edit3,
  Layers,
  FileCheck,
  Users
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const MONTH_NAMES = [
  { short: 'JAN', full: 'January' },
  { short: 'FEB', full: 'February' },
  { short: 'MAR', full: 'March' },
  { short: 'APR', full: 'April' },
  { short: 'MAY', full: 'May' },
  { short: 'JUN', full: 'June' },
  { short: 'JUL', full: 'July' },
  { short: 'AUG', full: 'August' },
  { short: 'SEP', full: 'September' },
  { short: 'OCT', full: 'October' },
  { short: 'NOV', full: 'November' },
  { short: 'DEC', full: 'December' },
];

export function Me() {
  const { currentUser: authUser, storeData, hrmStore } = useAuth();
  const activeUser = authUser || currentUser;

  // Resolve live employee record from central store to ensure automatic real-time sync with HR updates
  const employee = useMemo(() => {
    if (!storeData?.employees) return activeUser;
    return storeData.employees.find(e => e.id === activeUser.id || e.employeeId === activeUser.employeeId) || activeUser;
  }, [storeData?.employees, activeUser]);

  // Default active tab to Attendance to keep existing behavior 100% preserved
  const [activeTab, setActiveTab] = useState('attendance');

  // Modals for Attendance and Existing Actions
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showPartialDayModal, setShowPartialDayModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);

  // New Employee Side Modals for Self-Service Actions
  const [showEditPersonalModal, setShowEditPersonalModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Forms
  const [personalForm, setPersonalForm] = useState({
    mobile: '',
    personalEmail: '',
    currentAddress: '',
    permanentAddress: '',
    emergencyContact: { name: '', relation: '', phone: '' }
  });

  const [eduForm, setEduForm] = useState({
    qualification: 'B.Tech',
    degree: '',
    institution: '',
    university: '',
    specialization: '',
    yearOfPassing: '2024',
    percentage: '8.2 CGPA',
    certificateName: 'Degree_Certificate_Verified.pdf'
  });

  const [expForm, setExpForm] = useState({
    companyName: '',
    designation: '',
    startDate: '2022-01-15',
    endDate: '2024-02-28',
    totalExperience: '2 Years 1 Month',
    documentName: 'Experience_Relieving_Letter.pdf'
  });

  const [docForm, setDocForm] = useState({
    category: 'Identity Proof',
    documentName: '',
    fileUrl: '#'
  });

  // Keka-style attendance states
  const [attendanceSubTab, setAttendanceSubTab] = useState('Attendance Log');
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // 8 = September (0-indexed)
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDay, setSelectedDay] = useState(4);
  const [regReason, setRegReason] = useState('');
  const [regPunchType, setRegPunchType] = useState('Missing In-Punch');
  const [regTime, setRegTime] = useState('09:00:00 AM');

  // Form states for attendance
  const [dutyReason, setDutyReason] = useState('');
  const [dutyLocation, setDutyLocation] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [leaveDays, setLeaveDays] = useState('1');
  const [leaveFromDate, setLeaveFromDate] = useState('2026-11-20');
  const [leaveToDate, setLeaveToDate] = useState('2026-11-20');
  const [leaveReason, setLeaveReason] = useState('Personal Work');

  // Time conversion helper for 12h / 24h
  const formatPunchTime = (timeStr, use24Hour) => {
    if (!timeStr || timeStr === '-') return timeStr;
    if (!use24Hour) return timeStr;
    const match = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeStr;
    let [_, hours, mins, secs, ampm] = match;
    let h = parseInt(hours, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${mins}:${secs}`;
  };

  // Dynamic Calendar generation for any month and year
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    // 0 = Sun, 1 = Mon ... 6 = Sat; adjust for Monday start
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const prevDaysCount = (firstDay + 6) % 7;

    const days = [];

    // Trailing days from previous month
    for (let i = prevDaysCount - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isPrev: true,
        isWeekend: false,
      });
    }

    // Days in current selected month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(selectedYear, selectedMonth, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Special alert day for Sep 2026 reference
      if (selectedYear === 2026 && selectedMonth === 8 && d === 8) {
        days.push({
          day: d,
          isPrev: false,
          isWeekend: false,
          hasAlert: true,
          label: 'NO ENTRIES LOGGED',
          status: 'missing',
          grossHours: '0h 00m',
          effectiveHours: '0h 00m',
          location: 'Hyderabad maindoor'
        });
        continue;
      }

      if (isWeekend) {
        days.push({
          day: d,
          isPrev: false,
          isWeekend: true,
          label: 'W-OFF',
          status: 'weekend',
          grossHours: '0h 00m',
          effectiveHours: '0h 00m'
        });
      } else {
        const grossMins = 540 + ((d * 7 + selectedMonth * 11) % 35);
        const effMins = 480 + ((d * 5 + selectedMonth * 7) % 30);
        const gH = Math.floor(grossMins / 60);
        const gM = grossMins % 60;
        const eH = Math.floor(effMins / 60);
        const eM = effMins % 60;

        days.push({
          day: d,
          isPrev: false,
          isWeekend: false,
          status: 'present',
          grossHours: `${gH}h ${gM < 10 ? '0' + gM : gM}m`,
          effectiveHours: `${eH}h ${eM < 10 ? '0' + eM : eM}m`,
          location: 'Hyderabad maindoor'
        });
      }
    }

    // Trailing days to fill the final week
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      days.push({
        day: n,
        isPrev: true,
        isWeekend: false,
      });
    }

    return days;
  }, [selectedYear, selectedMonth]);

  // Ensure selected day is within range of the current month
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > daysInMonth) {
      setSelectedDay(1);
    }
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Detailed In/Out punch logs per day
  const dayPunchesMap = {
    4: [
      { in: "8:43:23 AM", out: "9:35:30 AM" },
      { in: "9:40:37 AM", out: "9:50:29 AM" },
      { in: "9:50:56 AM", out: "10:32:25 AM" },
      { in: "10:38:53 AM", out: "12:33:00 PM" },
      { in: "1:15:20 PM", out: "4:20:10 PM" },
      { in: "4:35:00 PM", out: "6:39:23 PM" },
    ],
    1: [
      { in: "9:02:14 AM", out: "1:10:22 PM" },
      { in: "1:55:10 PM", out: "6:17:45 PM" },
    ],
    2: [
      { in: "8:58:30 AM", out: "12:50:18 PM" },
      { in: "1:35:02 PM", out: "6:08:11 PM" },
    ],
    3: [
      { in: "9:10:05 AM", out: "1:12:30 PM" },
      { in: "2:00:15 PM", out: "6:25:40 PM" },
    ],
    7: [
      { in: "9:04:18 AM", out: "1:15:00 PM" },
      { in: "1:55:12 PM", out: "6:14:05 PM" },
    ],
    8: [], // NO ENTRIES LOGGED
  };

  const currentDayData = calendarDays.find((d) => d.day === selectedDay && !d.isPrev) || 
    calendarDays.find((d) => !d.isPrev) || {
      day: 1,
      grossHours: '9h 15m',
      effectiveHours: '8h 30m',
      status: 'present',
      location: 'Hyderabad maindoor'
    };

  const currentPunches = (selectedYear === 2026 && selectedMonth === 8 && dayPunchesMap[selectedDay] !== undefined)
    ? dayPunchesMap[selectedDay] 
    : (currentDayData.isWeekend ? [] : (currentDayData.hasAlert ? [] : [
        { in: "08:58:10 AM", out: "01:12:30 PM" },
        { in: "01:52:20 PM", out: "06:14:40 PM" }
      ]));

  const monthShortName = MONTH_NAMES[selectedMonth]?.short || 'SEP';
  const monthFullName = MONTH_NAMES[selectedMonth]?.full || 'September';
  const formattedDate = `${selectedDay < 10 ? '0' + selectedDay : selectedDay} ${monthShortName} ${selectedYear}`;

  const handleApplyRegularize = (e) => {
    e.preventDefault();
    alert(`Regularization request submitted for ${formattedDate} (${regPunchType} at ${regTime}). Sent to reporting manager for approval.`);
    setShowRegularizeModal(false);
    setRegReason('');
  };

  const attendanceLog = [
    { date: "15 Nov 2026 (Today)", in: "09:12 AM", out: "06:15 PM", hours: "9h 03m", source: "Matrix Terminal 01", status: "Present" },
    { date: "14 Nov 2026", in: "09:05 AM", out: "06:10 PM", hours: "9h 05m", source: "Matrix Terminal 01", status: "Present" },
    { date: "13 Nov 2026", in: "09:45 AM", out: "06:30 PM", hours: "8h 45m", source: "Matrix Terminal 02", status: "Late Mark (Regularized)" },
    { date: "12 Nov 2026", in: "09:00 AM", out: "06:02 PM", hours: "9h 02m", source: "Matrix Terminal 01", status: "Present" },
    { date: "11 Nov 2026", in: "-", out: "-", hours: "0h", source: "Approved Leave", status: "Sick Leave" },
  ];

  const handleApplyRegularize = (e) => {
    e.preventDefault();
    alert(`Regularization request submitted for ${formattedDate} (${regPunchType} at ${regTime}). Sent to reporting manager for approval.`);
    setShowRegularizeModal(false);
    setRegReason('');
  };

  const handleApplyDuty = (e) => {
    e.preventDefault();
    alert(`On-Duty (OD) request submitted for: ${dutyLocation} (${dutyReason}). Sent to manager for approval.`);
    setShowDutyModal(false);
  };

  const handleApplyPartial = (e) => {
    e.preventDefault();
    alert("Partial Day (Half-Day/Late permission) request successfully registered.");
    setShowPartialDayModal(false);
  };

  // --- Strict Data Isolation & Selectors for Authenticated Employee ---
  const employeeLedger = useMemo(() => {
    return storeData?.leaveLedger?.[employee.id] || 
           storeData?.leaveLedger?.[employee.employeeId] || 
           {
             CL: { opening: 12, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 12 },
             SL: { opening: 10, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 10 },
             PL: { opening: 18, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 18 },
             COMP: { opening: 0, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 0 }
           };
  }, [storeData?.leaveLedger, employee.id, employee.employeeId]);

  const employeeLeaves = useMemo(() => {
    return (storeData?.leaveRequests || []).filter(r => 
      r.employeeId === employee.id || r.employeeId === employee.employeeId
    );
  }, [storeData?.leaveRequests, employee.id, employee.employeeId]);

  const employeeSalary = useMemo(() => {
    return storeData?.salaryStructures?.[employee.id] || {
      basic: 45000,
      hra: 22500,
      specialAllowance: 22500,
      pf: 5400,
      pt: 200,
      tds: 2400,
      gross: 90000,
      net: 82000
    };
  }, [storeData?.salaryStructures, employee.id]);

  const employeeAuditLogs = useMemo(() => {
    return (storeData?.auditLogs || []).filter(log => 
      log.userId === employee.id || 
      log.user === employee.name || 
      (log.details && (log.details.includes(employee.id) || log.details.includes(employee.employeeId || '###') || log.details.includes(employee.name)))
    );
  }, [storeData?.auditLogs, employee.id, employee.employeeId, employee.name]);

  const managerRecord = useMemo(() => {
    if (!employee.managerId && !employee.managerName) return null;
    return (storeData?.employees || []).find(e => 
      e.id === employee.managerId || 
      e.employeeId === employee.managerId || 
      (employee.managerName && e.name.toLowerCase() === employee.managerName.toLowerCase())
    );
  }, [storeData?.employees, employee.managerId, employee.managerName]);

  const teamPeers = useMemo(() => {
    if (!employee.managerId && !employee.managerName) return [];
    return (storeData?.employees || []).filter(e => 
      (e.id !== employee.id && e.employeeId !== employee.id) &&
      (e.managerId === employee.managerId || (employee.managerName && e.managerName === employee.managerName))
    );
  }, [storeData?.employees, employee.id, employee.managerId, employee.managerName]);

  const dynamicBalances = [
    { type: "Casual Leave (CL)", code: 'CL', available: employeeLedger.CL?.available ?? 12, total: (employeeLedger.CL?.opening || 12), color: "text-amber-600 bg-amber-50 border-amber-200" },
    { type: "Sick Leave (SL)", code: 'SL', available: employeeLedger.SL?.available ?? 10, total: (employeeLedger.SL?.opening || 10), color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { type: "Privilege Leave (PL)", code: 'PL', available: employeeLedger.PL?.available ?? 18, total: (employeeLedger.PL?.opening || 18), color: "text-blue-600 bg-blue-50 border-blue-200" },
    { type: "Compensatory Off", code: 'COMP', available: employeeLedger.COMP?.available ?? 0, total: 4, color: "text-purple-600 bg-purple-50 border-purple-200" }
  ];

  // Generated Monthly Payslips for Fiscal Year 2026-2027
  const payslipsList = useMemo(() => {
    const months = [
      { month: 'October 2026', period: '2026-10', days: 31, date: '31 Oct 2026' },
      { month: 'September 2026', period: '2026-09', days: 30, date: '30 Sep 2026' },
      { month: 'August 2026', period: '2026-08', days: 31, date: '31 Aug 2026' },
      { month: 'July 2026', period: '2026-07', days: 31, date: '31 Jul 2026' },
      { month: 'June 2026', period: '2026-06', days: 30, date: '30 Jun 2026' },
      { month: 'May 2026', period: '2026-05', days: 31, date: '31 May 2026' },
      { month: 'April 2026', period: '2026-04', days: 30, date: '30 Apr 2026' }
    ];

    return months.map((m, idx) => ({
      id: `PAY-${m.period}-${employee.id}`,
      month: m.month,
      disbursementDate: m.date,
      basic: employeeSalary.basic || 45000,
      hra: employeeSalary.hra || 22500,
      specialAllowance: employeeSalary.specialAllowance || 22500,
      gross: employeeSalary.gross || 90000,
      pf: employeeSalary.pf || 5400,
      pt: employeeSalary.pt || 200,
      tds: employeeSalary.tds || 2400,
      totalDeductions: (employeeSalary.pf || 5400) + (employeeSalary.pt || 200) + (employeeSalary.tds || 2400),
      net: employeeSalary.net || 82000,
      paymentMode: 'Direct NEFT Salary Credit',
      status: 'Paid & Disbursed'
    }));
  }, [employee.id, employeeSalary]);

  // Handle Leave Application
  const handleApplyLeave = (e) => {
    e.preventDefault();
    try {
      let code = 'CL';
      if (leaveType.includes('Privilege') || leaveType.includes('PL')) code = 'PL';
      else if (leaveType.includes('Sick') || leaveType.includes('SL')) code = 'SL';
      else if (leaveType.includes('Comp')) code = 'COMP';

      const appliedDays = Number(leaveDays);
      const req = hrmStore.submitLeaveRequest({
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        branch: employee.branch,
        branchId: employee.branchId || 'HYD',
        leaveType: leaveType.split(' - ')[0],
        leaveTypeCode: code,
        fromDate: leaveFromDate,
        toDate: leaveToDate,
        totalDays: appliedDays,
        reason: leaveReason || 'Personal Work'
      });

      alert(`Leave application ${req.id} for ${appliedDays} day(s) submitted! Status: Pending Approval. Sent notification to HR & Manager.`);
      setShowLeaveModal(false);
    } catch (err) {
      alert(`Leave Application Blocked: ${err.message}`);
    }
  };

  // Self-Service Form Submissions
  const handleSavePersonal = (e) => {
    e.preventDefault();
    try {
      hrmStore.updateEmployeePersonal(employee.id, personalForm, activeUser.id, activeUser.name);
      alert('Personal information updated and synchronized with live central records.');
      setShowEditPersonalModal(false);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeEducation(employee.id, eduForm, activeUser.id, activeUser.name);
      alert('Degree qualification added successfully.');
      setShowAddEducationModal(false);
      setEduForm({
        qualification: 'B.Tech',
        degree: '',
        institution: '',
        university: '',
        specialization: '',
        yearOfPassing: '2024',
        percentage: '8.2 CGPA',
        certificateName: 'Degree_Certificate_Verified.pdf'
      });
    } catch (err) {
      alert(`Failed to add degree: ${err.message}`);
    }
  };

  const handleSaveExperience = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeExperience(employee.id, expForm, activeUser.id, activeUser.name);
      alert('Prior professional experience added successfully.');
      setShowAddExperienceModal(false);
      setExpForm({
        companyName: '',
        designation: '',
        startDate: '2022-01-15',
        endDate: '2024-02-28',
        totalExperience: '2 Years 1 Month',
        documentName: 'Experience_Relieving_Letter.pdf'
      });
    } catch (err) {
      alert(`Failed to add experience: ${err.message}`);
    }
  };

  const handleSaveDocument = (e) => {
    e.preventDefault();
    try {
      hrmStore.uploadEmployeeDocument(employee.id, {
        category: docForm.category,
        documentName: docForm.documentName || `${docForm.category.replace(/\s+/g, '_')}_${employee.id}.pdf`,
        fileUrl: '#'
      }, activeUser.id, activeUser.name);
      alert('Document uploaded successfully for HR verification.');
      setShowUploadDocModal(false);
      setDocForm({ category: 'Identity Proof', documentName: '', fileUrl: '#' });
    } catch (err) {
      alert(`Document upload failed: ${err.message}`);
    }
  };

  // The 13 Required Categories for Employee Side ME
  const TABS = [
    { id: 'personal', label: 'My Personal Information', icon: User },
    { id: 'employment', label: 'Employment Details', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'loginSessions', label: 'Login & Logout History', icon: Laptop },
    { id: 'leaveApplications', label: 'My Leave Applications', icon: Calendar },
    { id: 'leaveBalance', label: 'My Leave Balance', icon: CheckCircle2 },
    { id: 'finance', label: 'My Finance & Payroll', icon: DollarSign },
    { id: 'education', label: 'My Education Details', icon: GraduationCap },
    { id: 'experience', label: 'My Previous Experience', icon: Building2 },
    { id: 'manager', label: 'My Reporting Manager', icon: Network },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'performance', label: 'My Performance & Career', icon: Award },
    { id: 'timeline', label: 'My Activity Timeline', icon: Activity },
    { id: 'expenses', label: 'Expenses & Claims', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatar || employee.personal?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={employee.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-100 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{employee.name}</h1>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                  {employee.role}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {employee.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Emp ID: <strong className="font-mono text-slate-800">{employee.employeeId || employee.id}</strong></span>
                <span>•</span>
                <span>Biometric ID: <strong className="font-mono text-emerald-700">{employee.biometricId || ('MTX-' + employee.id)}</strong></span>
                <span>•</span>
                <span>Regional Hub: <strong className="text-slate-800">{employee.branch}</strong> (PE-{employee.branchId})</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Department: <strong className="text-slate-700">{employee.department}</strong> • Joined {employee.joiningDate} • Reports to <strong className="text-brand-700">{employee.managerName || 'Board of Directors'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDutyModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Request Duty (OD)
            </button>
            <button
              onClick={() => setShowPartialDayModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Request Partial Day
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition"
            >
              Apply Leave
            </button>
          </div>
        </div>

        {/* Tab Navigation with All 13 Sections */}
        <div className="mt-6 flex overflow-x-auto border-b border-slate-200 gap-1 sm:gap-2 pb-px scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id || (tab.id === 'leaveApplications' && activeTab === 'leave');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600 font-bold'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. MY PERSONAL INFORMATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'personal' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Personal Information</h3>
              <p className="text-xs text-slate-500">Legal identity, verified contact coordinates, address records, and emergency contact.</p>
            </div>
            <button
              onClick={() => {
                setPersonalForm({
                  mobile: employee.personal?.mobile || employee.phone || '',
                  personalEmail: employee.personal?.personalEmail || employee.personalEmail || '',
                  currentAddress: employee.personal?.currentAddress || '',
                  permanentAddress: employee.personal?.permanentAddress || '',
                  emergencyContact: { ...(employee.personal?.emergencyContact || { name: '', relation: '', phone: '' }) }
                });
                setShowEditPersonalModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Update Contact Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Full Legal Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.fullName || employee.name}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Date of Birth</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.dob || '24 Aug 1994'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Gender & Blood Group</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {employee.personal?.gender || 'Male'} • Blood Group: <span className="text-rose-600">{employee.personal?.bloodGroup || 'O+ve'}</span>
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Marital Status</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.maritalStatus || 'Married'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Official Enterprise Email</span>
              <p className="font-mono font-semibold text-brand-600 text-xs mt-0.5 truncate">{employee.personal?.officialEmail || employee.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Personal Email / Gmail</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5 truncate">{employee.personal?.personalEmail || employee.personalEmail || 'ravi.kumar.dev@gmail.com'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Mobile Phone</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.mobile || employee.phone}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
              <span className="font-semibold text-slate-500">Current Residential Address</span>
              <p className="font-medium text-slate-800 text-xs mt-0.5">{employee.personal?.currentAddress || 'Flat 402, Cyber Residency, Madhapur, Hyderabad, Telangana 500081'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 sm:col-span-3">
              <span className="font-semibold text-slate-500">Permanent Hometown Address</span>
              <p className="font-medium text-slate-800 text-xs mt-0.5">{employee.personal?.permanentAddress || 'Plot 12, Tilak Road, Rajahmundry, East Godavari, Andhra Pradesh 533101'}</p>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Designated Primary Emergency Contact</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <span className="text-slate-500">Contact Person:</span>
                <p className="font-bold text-slate-900 mt-0.5">{employee.personal?.emergencyContact?.name || 'Sunita Reddy'}</p>
              </div>
              <div>
                <span className="text-slate-500">Relationship:</span>
                <p className="font-bold text-slate-900 mt-0.5">{employee.personal?.emergencyContact?.relation || 'Spouse / Family'}</p>
              </div>
              <div>
                <span className="text-slate-500">Direct Phone:</span>
                <p className="font-mono font-bold text-rose-700 mt-0.5">{employee.personal?.emergencyContact?.phone || '+91 98480 99881'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. EMPLOYMENT DETAILS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'employment' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Employment Details & Tenure</h3>
            <p className="text-xs text-slate-500">Official position, regional branch assignment, statutory identifiers, and transfer records.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Employee ID</span>
              <p className="font-mono font-bold text-brand-600 text-sm mt-0.5">{employee.employeeId || employee.id}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Current Designation</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.role}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Department</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.department} (DEPT-{employee.deptCode || 'IT'})</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Regional Branch & Hub</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.branch} Hub (PE-{employee.branchId})</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Date of Joining</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{employee.joiningDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Employment Status</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">
                {employee.status || 'Active'} ({employee.employment?.probationStatus || 'Confirmed'})
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Employment Type</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.employmentType || employee.employment?.employmentType || 'Full-Time Permanent'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Reporting Manager</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.managerName || 'Board of Directors'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Biometric Reader ID</span>
              <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{employee.biometricId || ('MTX-' + employee.id)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Provident Fund (PF) Account</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{employee.pfNumber || 'AP/HYD/0091823/000/0034102'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Universal Account Number (UAN)</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{employee.uan || '100829104829'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="font-semibold text-slate-500">Income Tax PAN</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{employee.panNumber || 'BKTPR4921K'}</p>
            </div>
          </div>

          {/* Transfer & Promotion History */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Inter-Branch Transfer & Promotion Record
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-2.5 px-3">Effective Date</th>
                    <th className="py-2.5 px-3">From Branch</th>
                    <th className="py-2.5 px-3">To Branch</th>
                    <th className="py-2.5 px-3">Business Justification</th>
                    <th className="py-2.5 px-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!employee.employment?.transferHistory || employee.employment.transferHistory.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No previous transfer or inter-branch reassignment records.
                      </td>
                    </tr>
                  ) : (
                    employee.employment.transferHistory.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono">{t.date}</td>
                        <td className="py-2.5 px-3 text-slate-600">{t.fromBranch}</td>
                        <td className="py-2.5 px-3 font-semibold text-brand-600">{t.toBranch}</td>
                        <td className="py-2.5 px-3 text-slate-700">{t.reason}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{t.approvedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. ATTENDANCE (KEPT EXACTLY AS IT WAS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Tab 1: Attendance (Keka-style Reference Layout) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Dark Navy Card matching reference */}
          <div className="rounded-2xl bg-[#090f1d] border border-[#1b263b] overflow-hidden shadow-2xl text-slate-100">
            {/* 1. Header: Logs & Requests & 24h toggle */}
            <div className="px-5 pt-4 pb-0 border-b border-[#1b263b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Logs & Requests</h2>
                {/* Sub-tabs */}
                <div className="flex items-center gap-2 sm:gap-6 mt-3 overflow-x-auto">
                  {['Attendance Log', 'Calendar', 'Attendance Requests', 'Overtime Requests'].map((tab) => {
                    const active = attendanceSubTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setAttendanceSubTab(tab)}
                        className={`relative pb-3 text-xs font-semibold transition whitespace-nowrap ${
                          active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                        {active && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 24-hour format switch */}
              <div
                onClick={() => setIs24Hour(!is24Hour)}
                className="flex items-center gap-2.5 cursor-pointer pb-3 sm:pb-0 select-none self-end sm:self-auto"
              >
                <span className="text-xs text-slate-300 font-medium">24 hour format</span>
                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                    is24Hour ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      is24Hour ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Subtab 1: Attendance Log */}
            {attendanceSubTab === 'Attendance Log' && (
              <>
                {/* 2. Month Selector, Year Switcher & View Toggle Bar */}
                <div className="px-5 py-4 bg-[#0b1325] border-b border-[#1b263b] flex flex-col gap-3">
                  {/* Top Row: Title with Arrows, Year Buttons (Last Years Included), and View Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Month & Year Title with Previous/Next Arrows */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-[#23355b] text-slate-400 hover:text-white hover:bg-[#162238] transition"
                        title="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-base sm:text-lg font-extrabold text-white tracking-wide min-w-[160px]">
                        {monthFullName}, {selectedYear}
                      </div>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-[#23355b] text-slate-400 hover:text-white hover:bg-[#162238] transition"
                        title="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Year Selector Pills: Explicitly showing current & last years */}
                    <div className="flex items-center gap-1 bg-[#070d1a] p-1 rounded-xl border border-[#1b263b] overflow-x-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 shrink-0">Year:</span>
                      {[
                        { year: 2026, label: '2026' },
                        { year: 2025, label: '2025 (Last Year)' },
                        { year: 2024, label: '2024' },
                        { year: 2023, label: '2023' },
                      ].map((y) => (
                        <button
                          key={y.year}
                          onClick={() => setSelectedYear(y.year)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                            selectedYear === y.year
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#162238]'
                          }`}
                        >
                          {y.label}
                        </button>
                      ))}

                      {/* Dropdown for older years */}
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-[#0b1325] text-xs font-semibold text-slate-300 border border-[#23355b] rounded-md px-1.5 py-0.5 outline-none ml-1 cursor-pointer"
                        title="Select Other Year"
                      >
                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                          <option key={yr} value={yr} className="bg-[#0c1427] text-white">
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewMode('list')}
                        title="List View"
                        className={`p-1.5 rounded-lg border transition ${
                          viewMode === 'list'
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                            : 'text-slate-400 border-[#23355b] hover:bg-[#162238]'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('calendar')}
                        title="Calendar View"
                        className={`p-1.5 rounded-lg border transition ${
                          viewMode === 'calendar'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'text-slate-400 border-[#23355b] hover:bg-[#162238]'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* All 12 Months Pills */}
                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#1b263b]/60">
                    {MONTH_NAMES.map((m, idx) => {
                      const isSelected = selectedMonth === idx;
                      return (
                        <button
                          key={m.short}
                          onClick={() => setSelectedMonth(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                            isSelected
                              ? 'bg-[#5c54e5] text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#162238]'
                          }`}
                        >
                          {m.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Main Split View: Calendar Grid + Daily Shift / Punches */}
                {viewMode === 'calendar' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#080d1a]">
                    {/* Left / Center 9 Columns: Calendar Grid (Increased Size & Spacious) */}
                    <div className="lg:col-span-9 border-b lg:border-b-0 lg:border-r border-[#1b263b]">
                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 border-b border-[#1b263b] bg-[#0c1427] text-center text-xs font-extrabold text-slate-300 py-3 tracking-wider">
                        <div>MON</div>
                        <div>TUE</div>
                        <div>WED</div>
                        <div>THU</div>
                        <div>FRI</div>
                        <div>SAT</div>
                        <div>SUN</div>
                      </div>

                      {/* Calendar Days (Increased Size & Clear Typography) */}
                      <div className="grid grid-cols-7">
                        {calendarDays.map((item, idx) => {
                          const isSelected = selectedDay === item.day && !item.isPrev;
                          return (
                            <div
                              key={idx}
                              onClick={() => !item.isPrev && setSelectedDay(item.day)}
                              className={`relative min-h-[82px] sm:min-h-[96px] lg:min-h-[105px] p-2.5 sm:p-3 border-b border-r border-[#1b263b] transition cursor-pointer select-none ${
                                item.isPrev
                                  ? 'bg-[#070b16] opacity-25 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#10293d] border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg'
                                  : 'bg-[#090f1d] hover:bg-[#131f38]'
                              }`}
                            >
                              {/* Day number (Only dates mentioned, prominent font) */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm sm:text-base font-extrabold ${
                                    item.isPrev
                                      ? 'text-slate-600'
                                      : isSelected
                                      ? 'text-cyan-300'
                                      : 'text-slate-200'
                                  }`}
                                >
                                  {item.day}
                                </span>
                              </div>

                              {/* Special Alert Ribbon for Day 8 */}
                              {item.hasAlert && (
                                <div className="absolute top-0 left-0">
                                  <div className="w-0 h-0 border-t-[16px] border-t-indigo-600 border-r-[16px] border-r-transparent" />
                                </div>
                              )}

                              {/* Content inside cell: W-OFF and Alert badges, no timings */}
                              <div className="mt-2.5 flex flex-col items-center justify-center">
                                {item.label === 'W-OFF' && (
                                  <span className="inline-block bg-[#3a2f20] text-[#e3b879] border border-[#52422c] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                                    W-OFF
                                  </span>
                                )}

                                {item.hasAlert && (
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight text-center leading-tight">
                                    NO ENTRIES LOGGED
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right 3 Columns: Daily Shift & Login/Logout Punches (Slightly smaller & compact) */}
                    <div className="lg:col-span-3 bg-[#0a1122] p-3 sm:p-4 flex flex-col justify-between">
                      <div>
                        {/* Shift Title & Timings */}
                        <div className="border-b border-[#1b263b] pb-2.5">
                          <h3 className="text-xs sm:text-sm font-bold text-white">General Shift</h3>
                          <p className="text-[11px] text-slate-400">({formattedDate})</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">9:00 AM - 6:00 PM</p>

                          {/* Timeline visualization bar */}
                          <div className="mt-2.5">
                            <div className="h-2 w-full bg-[#131d33] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[#23355b]">
                              {currentDayData.status === 'present' ? (
                                <>
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '14%' }} title="08:43 - 09:35" />
                                  <div className="h-full bg-transparent" style={{ width: '2%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '4%' }} title="09:40 - 09:50" />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '9%' }} title="09:50 - 10:32" />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '20%' }} title="10:38 - 12:33" />
                                  <div className="h-full bg-transparent" style={{ width: '6%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '32%' }} title="13:15 - 16:20" />
                                  <div className="h-full bg-transparent" style={{ width: '2%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '11%' }} title="16:35 - 18:39" />
                                </>
                              ) : (
                                <div className="h-full w-full bg-slate-800/50" />
                              )}
                            </div>
                            <div className="flex justify-between px-0.5 text-[9px] text-slate-500 font-mono mt-1">
                              <span>9:00 AM</span>
                              <span>1:00 PM</span>
                              <span>6:00 PM</span>
                            </div>
                          </div>
                        </div>

                        {/* Gross & Effective Hours */}
                        <div className="flex items-center justify-between py-2.5 border-b border-[#1b263b]">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider block">GROSS HOURS</span>
                            <span className="text-xs sm:text-sm font-extrabold text-white font-mono">{currentDayData.grossHours}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider block">EFFECTIVE HOURS</span>
                            <span className="text-xs sm:text-sm font-extrabold text-white font-mono">{currentDayData.effectiveHours}</span>
                          </div>
                        </div>

                        {/* Status & Regularize Button */}
                        <div className="flex items-center justify-between py-2.5 border-b border-[#1b263b]">
                          {currentDayData.status === 'present' ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>On Time</span>
                            </div>
                          ) : currentDayData.hasAlert ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>No Entries Logged</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#e3b879]">
                              <span>Weekly Off</span>
                            </div>
                          )}

                          <button
                            onClick={() => setShowRegularizeModal(true)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Regularize</span>
                          </button>
                        </div>

                        {/* Reader Location */}
                        <div className="py-2 text-[11px] font-bold text-slate-200 border-b border-[#1b263b] flex items-center justify-between">
                          <span className="truncate pr-1">{currentDayData.location || 'Hyderabad maindoor'}</span>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Matrix Synced
                          </span>
                        </div>

                        {/* Punch Stream List (Login / Logout) */}
                        <div className="mt-2.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Punch Records (In / Out)</p>
                          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                            {currentPunches.length > 0 ? (
                              currentPunches.map((punch, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg bg-[#070d1a] border border-[#1b263b]"
                                >
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>{formatPunchTime(punch.in, is24Hour)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-200 font-mono font-medium">
                                    <ArrowUpRight className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                                    <span>{formatPunchTime(punch.out, is24Hour)}</span>
                                  </div>
                                </div>
                              ))
                            ) : currentDayData.hasAlert ? (
                              <div className="text-center py-4 px-2 bg-[#070d1a] rounded-xl border border-indigo-950">
                                <AlertCircle className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-slate-300">No punches found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Missing biometric terminal logs.</p>
                                <button
                                  onClick={() => setShowRegularizeModal(true)}
                                  className="mt-2 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                  Regularize Punch
                                </button>
                              </div>
                            ) : (
                              <div className="text-center py-4 px-2 bg-[#070d1a] rounded-xl border border-[#1b263b]">
                                <p className="text-xs font-bold text-[#e3b879]">Weekend Off (W-OFF)</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">No punches required on scheduled off days.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="p-4 overflow-x-auto bg-[#080d1a]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0c1427] text-[11px] font-bold text-slate-400 uppercase border-b border-[#1b263b]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Shift</th>
                          <th className="py-2.5 px-3">First In</th>
                          <th className="py-2.5 px-3">Last Out</th>
                          <th className="py-2.5 px-3">Gross Hours</th>
                          <th className="py-2.5 px-3">Effective Hours</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b263b]">
                        {calendarDays.filter((d) => !d.isPrev).map((item) => {
                          const punches = (selectedYear === 2026 && selectedMonth === 8 && dayPunchesMap[item.day]) || [];
                          const firstIn = punches[0]?.in || (item.isWeekend ? '-' : '09:00 AM');
                          const lastOut = punches[punches.length - 1]?.out || (item.isWeekend ? '-' : '06:00 PM');
                          return (
                            <tr key={item.day} className="hover:bg-[#0f1b33] transition">
                              <td className="py-2.5 px-3 font-semibold text-slate-200">
                                {item.day < 10 ? '0' + item.day : item.day} {monthShortName} {selectedYear}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {item.isWeekend ? 'Weekly Off' : 'General Shift (9-6)'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-emerald-400 font-medium">
                                {formatPunchTime(firstIn, is24Hour)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-300">
                                {formatPunchTime(lastOut, is24Hour)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-200">{item.grossHours}</td>
                              <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{item.effectiveHours}</td>
                              <td className="py-2.5 px-3">
                                {item.status === 'present' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800">
                                    ✓ Present
                                  </span>
                                ) : item.hasAlert ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-800">
                                    No Entries Logged
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3a2f20] text-[#e3b879] border border-[#52422c]">
                                    W-OFF
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedDay(item.day);
                                    setShowRegularizeModal(true);
                                  }}
                                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                                >
                                  Regularize
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Subtab 2: Calendar */}
            {attendanceSubTab === 'Calendar' && (
              <div className="p-8 text-center bg-[#080d1a]">
                <Calendar className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">Full Shift Calendar View</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Displaying full enterprise biometric schedules, assigned shift rosters, and holiday leaves for Prashanth Enterprises.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-950/50 border border-indigo-800/60 px-4 py-2 text-xs text-indigo-300">
                  <span>Current Roster: General Office Shift (09:00 AM - 06:00 PM)</span>
                </div>
              </div>
            )}

            {/* Subtab 3: Attendance Requests */}
            {attendanceSubTab === 'Attendance Requests' && (
              <div className="p-5 bg-[#080d1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Attendance Regularization Requests</h3>
                  <button
                    onClick={() => setShowRegularizeModal(true)}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    + Raise Request
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#1b263b] bg-[#0c1427] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">08 Sept 2026</span>
                        <span className="rounded-full bg-amber-950/60 border border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Reason: Biometric scanner did not record morning entry punch.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Approver: Sunil Verma (Engineering Director)
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Requested: 09:00 AM</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab 4: Overtime Requests */}
            {attendanceSubTab === 'Overtime Requests' && (
              <div className="p-5 bg-[#080d1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Overtime (OT) Approvals & Requests</h3>
                  <button
                    onClick={() => alert("Overtime request for current pay-cycle initiated.")}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    + Apply Overtime
                  </button>
                </div>
                <div className="rounded-xl border border-[#1b263b] bg-[#0c1427] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Month Overtime Total</p>
                    <p className="text-xs text-slate-400 mt-0.5">Overtime rate: 1.5x standard hourly rate</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-400 font-mono">4.5 hrs</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. LOGIN & LOGOUT HISTORY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'loginSessions' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Application Login & Session History</h3>
            <p className="text-xs text-slate-500">
              Web application authentications across corporate intranet workstations and devices (distinct from biometric door punches).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-3">Session Date</th>
                  <th className="py-3 px-3">Login Timestamp</th>
                  <th className="py-3 px-3">Logout Timestamp</th>
                  <th className="py-3 px-3">Session State</th>
                  <th className="py-3 px-3">Device & Browser</th>
                  <th className="py-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!employee.loginSessions || employee.loginSessions.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No application login session records available.
                    </td>
                  </tr>
                ) : (
                  employee.loginSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono">{s.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{s.loginTime}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{s.logoutTime}</td>
                      <td className="py-2.5 px-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          s.sessionStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.sessionStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{s.device}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{s.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. MY LEAVE APPLICATIONS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(activeTab === 'leaveApplications' || activeTab === 'leave') && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Leave Applications & Requests</h3>
              <p className="text-xs text-slate-500">Real-time status tracking of submitted applications, approval routing, and cancellation requests.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>Apply for Leave</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-500 font-semibold">Total Applied</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{employeeLeaves.length} Requests</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
              <span className="text-emerald-700 font-semibold">Approved</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {employeeLeaves.filter(r => r.status === 'Approved').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200">
              <span className="text-amber-700 font-semibold">Pending Review</span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                {employeeLeaves.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
              <span className="text-rose-700 font-semibold">Rejected / Cancelled</span>
              <p className="text-xl font-bold text-rose-700 mt-1">
                {employeeLeaves.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length}
              </p>
            </div>
          </div>

          {/* Leave Application History Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Req ID</th>
                  <th className="py-2.5 px-3">Leave Type</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Days</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Approval Status</th>
                  <th className="py-2.5 px-3">Reviewer</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No leave applications found. Click "Apply for Leave" above to submit one.
                    </td>
                  </tr>
                ) : (
                  employeeLeaves.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-600">{r.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{r.leaveType}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{r.fromDate} to {r.toDate}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.totalDays} day(s)</td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[180px] truncate">{r.reason}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          r.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            r.status === 'Approved' ? 'bg-emerald-500' :
                            r.status === 'Pending' ? 'bg-amber-500' :
                            r.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                          }`}></span>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{r.approverName || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        {r.status === 'Pending' && (
                          <button
                            onClick={() => {
                              if (confirm(`Withdraw leave application ${r.id}?`)) {
                                hrmStore.cancelLeaveRequest(r.id, employee.id, employee.name, 'Employee withdrew application');
                                alert('Leave request withdrawn and reserved days restored to ledger.');
                              }
                            }}
                            className="text-xs text-rose-600 font-semibold hover:underline"
                          >
                            Withdraw
                          </button>
                        )}
                        {r.status === 'Approved' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel approved leave ${r.id}? This will restore ${r.totalDays} day(s) back to your balance.`)) {
                                hrmStore.cancelLeaveRequest(r.id, employee.id, employee.name, 'Employee cancelled approved leave');
                                alert('Approved leave cancelled and balance restored to ledger.');
                              }
                            }}
                            className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
                          >
                            Cancel Leave
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. MY LEAVE BALANCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'leaveBalance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">My Leave Balance & Atomic Ledger</h3>
            <p className="text-xs text-slate-500">Real-time entitlement balances, annual accruals, approved deductions, and pending reservations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { code: 'CL', name: 'Casual Leave', desc: 'Personal errands, short commitments & emergency days' },
              { code: 'SL', name: 'Sick Leave', desc: 'Medical illness recovery & health indisposition' },
              { code: 'PL', name: 'Privilege Leave', desc: 'Annual earned leave & planned vacation days' },
              { code: 'COMP', name: 'Comp Off', desc: 'Accrued for authorized work on weekends/holidays' }
            ].map(({ code, name, desc }) => {
              const b = employeeLedger[code] || { available: 0, opening: 0, approvedDeductions: 0, pendingReservations: 0 };
              const total = (b.opening || 0) + (b.accrued || 0);
              const percentage = total > 0 ? Math.min(100, Math.max(0, (b.available / total) * 100)) : 0;

              return (
                <div key={code} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{name}</span>
                    <span className="rounded bg-brand-50 border border-brand-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-700">
                      {code}
                    </span>
                  </div>

                  <div>
                    <p className="text-3xl font-extrabold text-brand-600">
                      {b.available} <span className="text-xs font-semibold text-slate-500">Days Available</span>
                    </p>
                    <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-600 transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-2 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Annual Opening:</span>
                      <strong className="text-slate-800">{b.opening || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Used / Deducted:</span>
                      <strong className="text-rose-600">-{b.approvedDeductions || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Reserved:</span>
                      <strong className="text-amber-600">{b.pendingReservations || 0}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic pt-1">{desc}</p>
                </div>
              );
            })}
          </div>

          {/* Policy Information Note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Prashanth Enterprises Leave Policy Guidelines</span>
            </p>
            <p className="text-[11px] text-blue-700">
              Leave transactions are atomically tracked in Firestore. Privilege Leave (PL) can carry forward up to 45 days. Sick leaves exceeding 2 consecutive working days require registered medical practitioner certification submitted in My Documents.
            </p>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. MY FINANCE & PAYROLL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Finance, Compensation & Payslips</h3>
                <p className="text-xs text-slate-500">Confidential monthly compensation breakdown, statutory deductions, bank routing, and downloadable payslips.</p>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                🔒 Private to {employee.name}
              </span>
            </div>

            {/* Monthly CTC Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-500 font-semibold">Basic Monthly</span>
                <p className="font-mono font-bold text-slate-900 text-lg mt-1">₹ {(employeeSalary.basic || 45000).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">50% of monthly gross</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-500 font-semibold">House Rent Allowance (HRA)</span>
                <p className="font-mono font-bold text-slate-900 text-lg mt-1">₹ {(employeeSalary.hra || 22500).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tax exempt under sec 10(13A)</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-500 font-semibold">Special Allowance</span>
                <p className="font-mono font-bold text-slate-900 text-lg mt-1">₹ {(employeeSalary.specialAllowance || 22500).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Performance flexi-pay</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 shadow-2xs">
                <span className="text-emerald-700 font-bold">Net Disbursed Take-Home</span>
                <p className="font-mono font-extrabold text-emerald-700 text-xl mt-1">₹ {(employeeSalary.net || 82000).toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Credited to salary bank account</p>
              </div>
            </div>

            {/* Salary Bank Details & Statutory Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-brand-600" />
                  <span>Salary Disbursement Bank Account</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Bank Name:</span>
                    <p className="font-semibold text-slate-800">{employee.bankDetails?.bankName || 'HDFC Bank - Cyber Towers'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account Type:</span>
                    <p className="font-semibold text-slate-800">{employee.bankDetails?.accountType || 'Corporate Salary Account'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account Number:</span>
                    <p className="font-mono font-bold text-slate-900">{employee.bankDetails?.accountNumber || '•••• •••• 9812'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">IFSC Code:</span>
                    <p className="font-mono font-semibold text-slate-800">{employee.bankDetails?.ifscCode || 'HDFC0001829'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Statutory Coverage & Insurance</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">EPF UAN:</span>
                    <p className="font-mono font-semibold text-slate-800">{employee.uan || '100829104829'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ESI Eligibility:</span>
                    <p className="font-semibold text-slate-800">Corporate Staff Exempt (Gross &gt; ₹21k)</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Group Health Insurance Policy:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">₹5,00,000 Family Floater Policy (Policy #PE-GMC-2026-9810)</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Cashless across 450+ network hospitals in Hyderabad, Chennai & Mumbai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Payslips Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Generated Payslips (Fiscal Year 2026-2027)
                </h4>
                <span className="text-xs text-slate-500">{payslipsList.length} Payslips Available</span>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3">Pay Period</th>
                      <th className="py-2.5 px-3">Gross Disbursed</th>
                      <th className="py-2.5 px-3">Total Deductions</th>
                      <th className="py-2.5 px-3">Net Take-Home</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payslipsList.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{slip.month}</td>
                        <td className="py-2.5 px-3 font-mono">₹ {slip.gross.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-600">-₹ {slip.totalDeductions.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">₹ {slip.net.toLocaleString()}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {slip.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedPayslip(slip)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition shadow-2xs"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Payslip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Salary Revision History */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Salary Revision History</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3">Effective Date</th>
                      <th className="py-2.5 px-3">Revised Gross</th>
                      <th className="py-2.5 px-3">Revised Basic</th>
                      <th className="py-2.5 px-3">Revision Reason</th>
                      <th className="py-2.5 px-3">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!employee.salaryHistory || employee.salaryHistory.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          Initial compensation tier active. No historical revision logs.
                        </td>
                      </tr>
                    ) : (
                      employee.salaryHistory.map((sh, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono">{sh.effectiveDate}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹ {sh.gross?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono">₹ {sh.basic?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-slate-700">{sh.reason}</td>
                          <td className="py-2.5 px-3 font-semibold text-brand-600">{sh.revisedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. MY EDUCATION DETAILS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'education' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Academic & Educational Qualifications</h3>
              <p className="text-xs text-slate-500">Verified diplomas, degrees, universities, and CGPA scores.</p>
            </div>
            <button
              onClick={() => setShowAddEducationModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="space-y-3">
            {(!employee.education || employee.education.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No education records available. Click "Add Degree" to add qualifications.</p>
            ) : (
              employee.education.map(edu => (
                <div key={edu.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      {edu.qualification}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{edu.degree}</h4>
                    <p className="text-xs text-slate-600">{edu.institution} • {edu.university}</p>
                    <p className="text-[11px] text-slate-500">Specialization: {edu.specialization}</p>
                  </div>
                  <div className="text-right sm:self-center">
                    <p className="text-sm font-bold text-slate-900">{edu.percentage}</p>
                    <p className="text-[11px] text-slate-500">Year of Passing: {edu.yearOfPassing}</p>
                    <span className="text-[10px] font-mono text-brand-600 mt-1 block">{edu.certificateName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 9. MY PREVIOUS EXPERIENCE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'experience' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Prior Professional Experience</h3>
              <p className="text-xs text-slate-500">Employment history prior to joining Prashanth Enterprises workforce.</p>
            </div>
            <button
              onClick={() => setShowAddExperienceModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Prior Job</span>
            </button>
          </div>

          <div className="space-y-3">
            {(!employee.experience || employee.experience.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No previous employment records available.</p>
            ) : (
              employee.experience.map(exp => (
                <div key={exp.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{exp.designation}</h4>
                    <p className="text-xs font-semibold text-brand-600">{exp.companyName}</p>
                    <p className="text-[11px] text-slate-500">Tenure: {exp.startDate} to {exp.endDate} ({exp.totalExperience})</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      {exp.documentName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 10. MY REPORTING MANAGER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'manager' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">My Reporting Manager & Org Hierarchy</h3>
            <p className="text-xs text-slate-500">Direct supervisor allocation, contact info, and corporate chain of command.</p>
          </div>

          {/* Manager Card */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={managerRecord?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={employee.managerName}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-200 shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Direct Reporting Manager</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{employee.managerName || 'Prashanth Reddy'}</h4>
                <p className="text-xs text-slate-600 font-medium">{managerRecord?.role || 'Head of Department'}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {employee.department} Division
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-brand-600">
                    <Mail className="h-3.5 w-3.5" />
                    {managerRecord?.email || 'manager@prashanthenterprises.in'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Reporting Line Tree */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Hierarchical Reporting Line</h4>
            <div className="flex flex-col items-center space-y-3">
              {/* Level 1: Global Admin */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-center w-64 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-purple-700">Level 1 • Global Operations</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">Prashanth Reddy</p>
                <p className="text-[11px] text-slate-500">Director of Operations</p>
              </div>
              <div className="h-4 w-0.5 bg-slate-300"></div>

              {/* Level 2: Manager */}
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-center w-64 shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-brand-700">Level 2 • Direct Manager</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.managerName || 'Prashanth Reddy'}</p>
                <p className="text-[11px] text-slate-500">{employee.department} Division</p>
              </div>
              <div className="h-4 w-0.5 bg-slate-300"></div>

              {/* Level 3: Employee */}
              <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/80 p-3 text-center w-64 shadow-xs ring-2 ring-emerald-500/20">
                <p className="text-[10px] uppercase font-bold text-emerald-800">You (Direct Individual Contributor)</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.name}</p>
                <p className="text-[11px] text-slate-600 font-semibold">{employee.role}</p>
              </div>
            </div>
          </div>

          {/* Immediate Teammates / Squad */}
          {teamPeers.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Immediate Teammates Reporting to {employee.managerName} ({teamPeers.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamPeers.map(peer => (
                  <div key={peer.id} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{peer.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{peer.role}</p>
                      <span className="text-[10px] text-brand-600 font-mono">{peer.branch}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 11. MY DOCUMENTS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Documents & KYC Verification</h3>
              <p className="text-xs text-slate-500">Official statutory proofs, degrees, and employment contracts for {employee.name}.</p>
            </div>
            <button
              onClick={() => setShowUploadDocModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Uploaded On</th>
                  <th className="py-2.5 px-3">Verification Status</th>
                  <th className="py-2.5 px-3">Verified By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!employee.documents || employee.documents.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No documents uploaded. Click "Upload Document" above to submit proofs.
                    </td>
                  </tr>
                ) : (
                  employee.documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{doc.category}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-brand-600">{doc.documentName}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{doc.uploadDate}</td>
                      <td className="py-2.5 px-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          doc.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{doc.verifiedBy || 'Pending Review'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => alert(`Opening secure document viewer for: ${doc.documentName}`)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          Preview / Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 12. MY PERFORMANCE & CAREER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Performance Reviews & OKR Milestones</h3>
            <p className="text-xs text-slate-500">Appraisal scores, active goals, competencies, and career growth milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Active Appraisal Rating</span>
              <p className="text-3xl font-extrabold text-slate-900">{employee.performance?.currentRating || '4.8 / 5.0'}</p>
              <p className="text-xs text-slate-700 italic pt-1">
                "{employee.performance?.managerFeedback || 'Consistent delivery on critical deliverables and demonstrated leadership in architecture.'}"
              </p>
              <p className="text-[10px] text-slate-400 pt-1">Review Cycle: Annual Appraisal 2025-2026</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Strategic OKR Goals</span>
              {(!employee.performance?.goals || employee.performance.goals.length === 0) ? (
                <p className="text-xs text-slate-400">No active goals assigned.</p>
              ) : (
                employee.performance.goals.map((g, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-slate-800 font-medium">{g.goal}</span>
                    <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {g.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 13. MY ACTIVITY TIMELINE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Chronological Activity & Audit Timeline</h3>
            <p className="text-xs text-slate-500">Immutable chronological history of your system transactions, biometric clock-ins, leave approvals, and profile milestones.</p>
          </div>

          <div className="space-y-3">
            {employeeAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No activity timeline records found for your account.</p>
            ) : (
              employeeAuditLogs.map(log => (
                <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-brand-100 text-brand-800 px-2 py-0.5 text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">{log.module}</span>
                      <span className="text-[10px] text-slate-400">By: {log.user} ({log.userId})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* EXPENSES & CLAIMS (PRESERVED) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Claims & Travel Advances</h3>
            <button
              onClick={() => alert("Open New Expense Claim form")}
              className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              + File New Claim
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">EXP-8291: Client Site Visit & Transport</p>
                <p className="text-slate-500">Submitted on Nov 05, 2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₹ 3,450.00</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Approved & Disbursed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* APPS & TOOLS (PRESERVED) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Grid className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Matrix COSEC Web Console</h4>
            <p className="text-[11px] text-slate-500 mt-1">Direct local biometric portal access (192.168.1.240)</p>
            <button 
              onClick={() => alert("Opening Matrix COSEC web panel on local intranet")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">IT Asset & Inventory Management</h4>
            <p className="text-[11px] text-slate-500 mt-1">Track hardware issued, licenses & serial keys</p>
            <button 
              onClick={() => alert("Opening IT Asset Management Portal")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* Modal: Edit Personal Information */}
      {showEditPersonalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Update Personal Contact Details</h3>
              <button onClick={() => setShowEditPersonalModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePersonal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="text"
                  required
                  value={personalForm.mobile}
                  onChange={(e) => setPersonalForm({ ...personalForm, mobile: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal Email / Gmail *</label>
                <input
                  type="email"
                  required
                  value={personalForm.personalEmail}
                  onChange={(e) => setPersonalForm({ ...personalForm, personalEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Residential Address</label>
                <textarea
                  rows="2"
                  value={personalForm.currentAddress}
                  onChange={(e) => setPersonalForm({ ...personalForm, currentAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div className="border-t pt-2 space-y-2">
                <p className="font-bold text-slate-900">Emergency Contact Person</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={personalForm.emergencyContact?.name || ''}
                      onChange={(e) => setPersonalForm({
                        ...personalForm,
                        emergencyContact: { ...personalForm.emergencyContact, name: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Relation</label>
                    <input
                      type="text"
                      value={personalForm.emergencyContact?.relation || ''}
                      onChange={(e) => setPersonalForm({
                        ...personalForm,
                        emergencyContact: { ...personalForm.emergencyContact, relation: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-300 p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={personalForm.emergencyContact?.phone || ''}
                    onChange={(e) => setPersonalForm({
                      ...personalForm,
                      emergencyContact: { ...personalForm.emergencyContact, phone: e.target.value }
                    })}
                    className="w-full rounded-xl border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditPersonalModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 shadow-sm"
                >
                  Save & Sync Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Academic Degree */}
      {showAddEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Academic Qualification</h3>
              <button onClick={() => setShowAddEducationModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEducation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Qualification Level</label>
                <select
                  value={eduForm.qualification}
                  onChange={(e) => setEduForm({ ...eduForm, qualification: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                >
                  <option>B.Tech / B.E.</option>
                  <option>M.Tech / M.E.</option>
                  <option>MCA / M.Sc</option>
                  <option>B.Sc / BCA</option>
                  <option>MBA / PGDM</option>
                  <option>Diploma</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Degree Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology in Computer Science"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">College / Institution *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JNTU Hyderabad College of Engineering"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Year</label>
                  <input
                    type="text"
                    value={eduForm.yearOfPassing}
                    onChange={(e) => setEduForm({ ...eduForm, yearOfPassing: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade / CGPA</label>
                  <input
                    type="text"
                    value={eduForm.percentage}
                    onChange={(e) => setEduForm({ ...eduForm, percentage: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddEducationModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700"
                >
                  Save Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Previous Experience */}
      {showAddExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Prior Professional Experience</h3>
              <button onClick={() => setShowAddExperienceModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExperience} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Technologies Ltd"
                  value={expForm.companyName}
                  onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Systems Engineer"
                  value={expForm.designation}
                  onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 2 Years 2 Months"
                  value={expForm.totalExperience}
                  onChange={(e) => setExpForm({ ...expForm, totalExperience: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddExperienceModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Document */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Upload Verification Document</h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                <select
                  value={docForm.category}
                  onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                >
                  <option>Identity Proof (Aadhaar / Passport)</option>
                  <option>Address Proof</option>
                  <option>Academic Degree / Marksheet</option>
                  <option>Experience / Relieving Letter</option>
                  <option>Form 16 / Tax Declaration</option>
                  <option>Medical Certification</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document / File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Degree_BTech_Original.pdf"
                  value={docForm.documentName}
                  onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2"
                />
              </div>
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center bg-slate-50">
                <Upload className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Click to choose PDF or scan image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10 MB (PDF, PNG, JPG)</p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700"
                >
                  Upload for HR Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Corporate Salary Payslip */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Official Salary Disbursement Voucher</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Prashanth Enterprises — Payslip for {selectedPayslip.month}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Corporate Header */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PRASHANTH ENTERPRISES PVT LTD</h4>
                  <p className="text-slate-500 text-[11px]">Plot 42, Hitec City, Cyberabad, Hyderabad, Telangana 500081</p>
                  <p className="text-slate-500 text-[11px]">Corporate ID: CIN-U72200TG2021PTC148291</p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    DISBURSED & CREDITED
                  </span>
                  <p className="text-slate-500 text-[10px] mt-1 font-mono">{selectedPayslip.disbursementDate}</p>
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400">Employee Name:</span>
                  <p className="font-bold text-slate-900">{employee.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Employee ID:</span>
                  <p className="font-mono font-bold text-brand-600">{employee.employeeId || employee.id}</p>
                </div>
                <div>
                  <span className="text-slate-400">Designation:</span>
                  <p className="font-semibold text-slate-800">{employee.role}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-semibold text-slate-800">{employee.department}</p>
                </div>
                <div>
                  <span className="text-slate-400">Regional Branch:</span>
                  <p className="font-semibold text-slate-800">{employee.branch}</p>
                </div>
                <div>
                  <span className="text-slate-400">PF Number:</span>
                  <p className="font-mono text-slate-800">{employee.pfNumber || 'AP/HYD/0091823'}</p>
                </div>
                <div>
                  <span className="text-slate-400">UAN:</span>
                  <p className="font-mono text-slate-800">{employee.uan || '100829104829'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Bank Account:</span>
                  <p className="font-mono text-slate-800">{employee.bankDetails?.accountNumber || '•••• •••• 9812'}</p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/80 px-3 py-2 font-bold text-slate-800 border-b">
                  Earnings Breakdown
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary:</span>
                    <strong className="font-mono text-slate-900">₹ {selectedPayslip.basic.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA):</span>
                    <strong className="font-mono text-slate-900">₹ {selectedPayslip.hra.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance:</span>
                    <strong className="font-mono text-slate-900">₹ {selectedPayslip.specialAllowance.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-slate-900">
                    <span>Total Gross Earnings:</span>
                    <span className="font-mono text-brand-700">₹ {selectedPayslip.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/80 px-3 py-2 font-bold text-slate-800 border-b">
                  Statutory Deductions
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF 12%):</span>
                    <strong className="font-mono text-rose-600">₹ {selectedPayslip.pf.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT):</span>
                    <strong className="font-mono text-rose-600">₹ {selectedPayslip.pt.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax Deducted at Source (TDS):</span>
                    <strong className="font-mono text-rose-600">₹ {selectedPayslip.tds.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-slate-900">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-rose-700">-₹ {selectedPayslip.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Disbursed Banner */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-800">Net Take-Home Salary Disbursed</p>
                <p className="text-[11px] text-emerald-600">Amount in words: Eighty Two Thousand Rupees Only</p>
              </div>
              <p className="text-2xl font-black font-mono text-emerald-700">
                ₹ {selectedPayslip.net.toLocaleString()}
              </p>
            </div>

            <p className="text-[10px] text-slate-400 text-center italic">
              This document is generated by Prashanth Enterprises Central Payroll Engine and does not require an ink signature.
            </p>
          </div>
        </div>
      )}

      {/* Existing Attendance Modals (Request Duty, Partial Day, Apply Leave, Regularize) */}
      {/* Modal: Request Duty (OD) */}
      {showDutyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request On-Duty (OD)</h3>
              <button onClick={() => setShowDutyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyDuty} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Client Site</label>
                <input
                  required
                  placeholder="e.g. Hyderabad Plant / Pune Client Office"
                  value={dutyLocation}
                  onChange={(e) => setDutyLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Project Name</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe purpose of visit..."
                  value={dutyReason}
                  onChange={(e) => setDutyReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                On-duty status will adjust biometric punch calculation once approved by your reporting manager.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDutyModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Partial Day */}
      {showPartialDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request Partial Day (Late / Early)</h3>
              <button onClick={() => setShowPartialDayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyPartial} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type</label>
                <select className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500">
                  <option>Late Coming Permission (Up to 2 hours)</option>
                  <option>Early Departure Permission (Up to 2 hours)</option>
                  <option>First Half Leave</option>
                  <option>Second Half Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Doctor appointment, urgent personal work, etc."
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartialDayModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply Leave */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Apply Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL) - {myLedger.CL?.available ?? 4.5} days available</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL) - {myLedger.SL?.available ?? 6.0} days available</option>
                  <option value="Privilege Leave (PL)">Privilege Leave (PL) - {myLedger.PL?.available ?? 14.5} days available</option>
                  <option value="Compensatory Off">Compensatory Off - {myLedger.COMP?.available ?? 2.0} days available</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveFromDate}
                    onChange={(e) => setLeaveFromDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Leave Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows="2"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Personal Work / Family commitment"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm"
                >
                  Submit to HR & Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attendance Regularization */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Regularization</h3>
                <p className="text-xs text-slate-500">For {formattedDate} 2026</p>
              </div>
              <button onClick={() => setShowRegularizeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyRegularize} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Regularization Type</label>
                <select
                  value={regPunchType}
                  onChange={(e) => setRegPunchType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option>Missing In-Punch</option>
                  <option>Missing Out-Punch</option>
                  <option>Both Punches Missing</option>
                  <option>Biometric Scanner Failed / Fingerprint Error</option>
                  <option>Official Client Site Visit (On-Duty)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Time</label>
                  <input
                    type="text"
                    value={regTime}
                    onChange={(e) => setRegTime(e.target.value)}
                    placeholder="e.g. 09:00:00 AM"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-800 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Terminal</label>
                  <input
                    type="text"
                    readOnly
                    value="Hyderabad maindoor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Regularization</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Please state why attendance punch was missing or unrecorded..."
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-900">
                <p className="font-semibold">Reporting Approver:</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">Sunil Verma (Engineering Director) • Matrix Punch Sync ID: EMP-1042</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegularizeModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Me;

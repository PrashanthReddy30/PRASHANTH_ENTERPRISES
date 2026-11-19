import fs from 'fs';

const oldMe = fs.readFileSync('src/pages/Me.jsx', 'utf8');

// 1. Extract Attendance tab exactly
const attStartMarker = "{/* Tab 1: Attendance (Keka-style Reference Layout) */}";
const attEndMarker = "{/* Tab 2: Leave (Apply & Balance) */}";
const attStartIndex = oldMe.indexOf(attStartMarker);
const attEndIndex = oldMe.indexOf(attEndMarker);
const attendanceBlock = oldMe.substring(attStartIndex, attEndIndex).trim();

// 2. Extract Attendance state and calendar logic
const helperStartMarker = "// Dynamic Calendar generation for any month and year";
const helperEndMarker = "const attendanceLog = [";
const helperStartIndex = oldMe.indexOf(helperStartMarker);
const helperEndIndex = oldMe.indexOf(helperEndMarker);
const calendarLogic = oldMe.substring(helperStartIndex, helperEndIndex).trim();

// 3. Extract existing modals
const dutyModalMarker = "{/* Modal: Request Duty (OD) */}";
const dutyModalIndex = oldMe.indexOf(dutyModalMarker);
const lastBraceIndex = oldMe.lastIndexOf("export default Me;");
let existingModals = oldMe.substring(dutyModalIndex, lastBraceIndex).trim();
const lastDivIdx = existingModals.lastIndexOf("</div>\n  );");
if (lastDivIdx !== -1) {
  existingModals = existingModals.substring(0, lastDivIdx).trim();
}

const meEnhancedSource = `import React, { useState, useMemo, useEffect } from 'react';
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
    const match = timeStr.match(/^(\\d{1,2}):(\\d{2}):(\\d{2})\\s*(AM|PM)$/i);
    if (!match) return timeStr;
    let [_, hours, mins, secs, ampm] = match;
    let h = parseInt(hours, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return \`\${h.toString().padStart(2, '0')}:\${mins}:\${secs}\`;
  };

  ${calendarLogic}

  const attendanceLog = [
    { date: "15 Nov 2026 (Today)", in: "09:12 AM", out: "06:15 PM", hours: "9h 03m", source: "Matrix Terminal 01", status: "Present" },
    { date: "14 Nov 2026", in: "09:05 AM", out: "06:10 PM", hours: "9h 05m", source: "Matrix Terminal 01", status: "Present" },
    { date: "13 Nov 2026", in: "09:45 AM", out: "06:30 PM", hours: "8h 45m", source: "Matrix Terminal 02", status: "Late Mark (Regularized)" },
    { date: "12 Nov 2026", in: "09:00 AM", out: "06:02 PM", hours: "9h 02m", source: "Matrix Terminal 01", status: "Present" },
    { date: "11 Nov 2026", in: "-", out: "-", hours: "0h", source: "Approved Leave", status: "Sick Leave" },
  ];

  const handleApplyRegularize = (e) => {
    e.preventDefault();
    alert(\`Regularization request submitted for \${formattedDate} (\${regPunchType} at \${regTime}). Sent to reporting manager for approval.\`);
    setShowRegularizeModal(false);
    setRegReason('');
  };

  const handleApplyDuty = (e) => {
    e.preventDefault();
    alert(\`On-Duty (OD) request submitted for: \${dutyLocation} (\${dutyReason}). Sent to manager for approval.\`);
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
      id: \`PAY-\${m.period}-\${employee.id}\`,
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

      alert(\`Leave application \${req.id} for \${appliedDays} day(s) submitted! Status: Pending Approval. Sent notification to HR & Manager.\`);
      setShowLeaveModal(false);
    } catch (err) {
      alert(\`Leave Application Blocked: \${err.message}\`);
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
      alert(\`Update failed: \${err.message}\`);
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
      alert(\`Failed to add degree: \${err.message}\`);
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
      alert(\`Failed to add experience: \${err.message}\`);
    }
  };

  const handleSaveDocument = (e) => {
    e.preventDefault();
    try {
      hrmStore.uploadEmployeeDocument(employee.id, {
        category: docForm.category,
        documentName: docForm.documentName || \`\${docForm.category.replace(/\\s+/g, '_')}_\${employee.id}.pdf\`,
        fileUrl: '#'
      }, activeUser.id, activeUser.name);
      alert('Document uploaded successfully for HR verification.');
      setShowUploadDocModal(false);
      setDocForm({ category: 'Identity Proof', documentName: '', fileUrl: '#' });
    } catch (err) {
      alert(\`Document upload failed: \${err.message}\`);
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
                className={\`flex shrink-0 items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold transition \${
                  active
                    ? 'border-brand-600 text-brand-600 font-bold'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }\`}
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
      ${attendanceBlock}

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
                        <span className={\`rounded px-2 py-0.5 text-[10px] font-bold \${
                          s.sessionStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }\`}>
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
                        <span className={\`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold \${
                          r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          r.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          r.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }\`}>
                          <span className={\`h-1.5 w-1.5 rounded-full \${
                            r.status === 'Approved' ? 'bg-emerald-500' :
                            r.status === 'Pending' ? 'bg-amber-500' :
                            r.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                          }\`}></span>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{r.approverName || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        {r.status === 'Pending' && (
                          <button
                            onClick={() => {
                              if (confirm(\`Withdraw leave application \${r.id}?\`)) {
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
                              if (confirm(\`Cancel approved leave \${r.id}? This will restore \${r.totalDays} day(s) back to your balance.\`)) {
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
                        style={{ width: \`\${percentage}%\` }}
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
                        <span className={\`rounded-full px-2 py-0.5 text-[10px] font-bold \${
                          doc.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }\`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{doc.verifiedBy || 'Pending Review'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => alert(\`Opening secure document viewer for: \${doc.documentName}\`)}
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
      ${existingModals}
    </div>
  );
}

export default Me;
`;

fs.writeFileSync('src/pages/Me.jsx', meEnhancedSource, 'utf8');
console.log("Successfully generated enhanced src/pages/Me.jsx!");

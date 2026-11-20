// Prashanth Enterprises HRMS
// Employee Side - Reorganized ME Section (Keka-style Enterprise Structure)
// 7 Clear Self-Service Categories:
// 1. My Profile (Basic Personal & Employment Details, Reporting Manager, Documents)
// 2. Attendance (100% Preserved - Live Punch Console, Calendar, Regularization, Duty OD & Partial Day)
// 3. Leave (Leave Balance Ledger & Leave Applications with Apply Modal)
// 4. Performance (Appraisals, Goals & Career Progress)
// 5. Experience (Previous Employment, Education & Certifications)
// 6. Travel (Corporate Travel Requests, Approvals & Travel Desk)
// 7. Apps (Employee Utilities, IT Helpdesk, Policies & Tools)
// NOTE: Finance & Payroll are strictly separated into the dedicated Employee Side -> Finance menu.

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  GraduationCap,
  Building2,
  Network,
  Activity,
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
  Users,
  Plane,
  Wallet,
  ArrowRight
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

  const location = useLocation();

  // 7 Organized Categories under ME (Defaulting to 'attendance' to preserve user's workflow)
  const [activeTab, setActiveTab] = useState('attendance');

  // Interactive self-service modals
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showPartialDayModal, setShowPartialDayModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showEditPersonalModal, setShowEditPersonalModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);

  // Sync tab & modal from query params or navigation state (e.g. ?tab=leave&apply=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab') || location.state?.tab;
      const applyParam = params.get('apply') || location.state?.apply;

      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (applyParam === 'true' || applyParam === true) {
        setShowLeaveModal(true);
      }
    } catch (e) {
      console.warn('Error reading URL navigation parameters:', e);
    }
  }, [location.search, location.state]);

  // Form states for self-service edits
  const [editPersonalForm, setEditPersonalForm] = useState({
    mobile: activeUser.phone || activeUser.personal?.mobile || '+91 98480 11221',
    email: activeUser.email || activeUser.personal?.email || 'ravi.kumar@prashanthenterprises.com',
    personalEmail: activeUser.personal?.personalEmail || 'ravi.kumar.dev@gmail.com',
    currentAddress: activeUser.personal?.currentAddress || 'Flat 402, Sai Teja Residency, Madhapur, Hyderabad, TS - 500081',
    permanentAddress: activeUser.personal?.permanentAddress || 'Plot 12, Sri Krishna Nagar, Warangal, TS - 506001',
    emergencyContact: activeUser.personal?.emergencyContact || '+91 94401 22334 (Suresh Kumar - Brother)'
  });

  const [eduForm, setEduForm] = useState({
    degree: 'B.Tech in Computer Science',
    institution: 'JNTU Hyderabad',
    yearOfPassing: '2024',
    grade: '8.4 CGPA'
  });

  const [expForm, setExpForm] = useState({
    company: '',
    designation: '',
    duration: '',
    location: '',
    totalExperience: '2 Years 1 Month',
    roles: ''
  });

  const [docForm, setDocForm] = useState({
    category: 'Identity Proof',
    documentName: '',
    fileUrl: '#'
  });

  const [travelForm, setTravelForm] = useState({
    destination: 'Mumbai Branch Hub (BKC Client Office)',
    travelType: 'Client Project Meeting & Hub Setup',
    startDate: '2026-12-05',
    endDate: '2026-12-08',
    budget: '₹ 25,000',
    purpose: 'On-site technical integration with Enterprise Banking Client.'
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
  const employee = useMemo(() => {
    return (storeData?.employees || []).find(e => 
      e.id === activeUser.id || e.employeeId === activeUser.employeeId || e.name === activeUser.name
    ) || activeUser;
  }, [storeData?.employees, activeUser]);

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

  const employeeAuditLogs = useMemo(() => {
    return (storeData?.auditLogs || []).filter(log => 
      log.userId === employee.id || 
      log.user === employee.name || 
      (log.details && (log.details.includes(employee.id) || log.details.includes(employee.employeeId || '###') || log.details.includes(employee.name)))
    );
  }, [storeData?.auditLogs, employee.id, employee.employeeId, employee.name]);

  // Travel Requests State
  const [travelRequests, setTravelRequests] = useState([
    {
      id: 'TRV-2026-081',
      destination: 'Mumbai Branch Hub (BKC Client Office)',
      purpose: 'On-site technical integration with Enterprise Banking Client',
      dates: '05 Dec 2026 - 08 Dec 2026 (4 Days)',
      budget: '₹ 25,000',
      status: 'Approved & Ticket Issued',
      approver: 'Sunil Verma (Director)',
      hotel: 'The Grand Residency BKC (Tier-1 Corporate Tie-up)'
    },
    {
      id: 'TRV-2026-042',
      destination: 'Chennai Branch (OMR Tech Park)',
      purpose: 'Biometric Matrix Terminal Hardware Synchronization',
      dates: '12 Aug 2026 - 14 Aug 2026 (3 Days)',
      budget: '₹ 18,500',
      status: 'Completed & Settled',
      approver: 'Sunil Verma (Director)',
      hotel: 'Taj Gateway OMR Chennai'
    }
  ]);

  // Leave Balances Cards
  const leaveCards = [
    { type: "Casual Leave (CL)", code: 'CL', available: employeeLedger.CL?.available ?? 12, total: (employeeLedger.CL?.opening || 12), color: "text-amber-600 bg-amber-50 border-amber-200" },
    { type: "Sick Leave (SL)", code: 'SL', available: employeeLedger.SL?.available ?? 10, total: (employeeLedger.SL?.opening || 10), color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { type: "Privilege Leave (PL)", code: 'PL', available: employeeLedger.PL?.available ?? 18, total: (employeeLedger.PL?.opening || 18), color: "text-blue-600 bg-blue-50 border-blue-200" },
    { type: "Compensatory Off", code: 'COMP', available: employeeLedger.COMP?.available ?? 0, total: 4, color: "text-purple-600 bg-purple-50 border-purple-200" }
  ];

  // Handle Leave Application
  const handleApplyLeave = (e) => {
    e.preventDefault();
    try {
      let code = 'CL';
      if (leaveType.includes('Sick')) code = 'SL';
      if (leaveType.includes('Privilege')) code = 'PL';
      if (leaveType.includes('Compensatory')) code = 'COMP';

      hrmStore.createLeaveRequest({
        employeeId: employee.id,
        employeeName: employee.name,
        branchId: employee.branchId || 'HYD',
        type: code,
        startDate: leaveFromDate,
        endDate: leaveToDate,
        days: parseFloat(leaveDays) || 1,
        reason: leaveReason || 'Personal Work'
      }, activeUser.id, activeUser.name);

      alert(`Leave application successfully submitted for ${leaveDays} day(s) of ${leaveType}. Sent to reporting manager for approval.`);
      setShowLeaveModal(false);
    } catch (err) {
      alert(`Leave Application Failed: ${err.message}`);
    }
  };

  // Handle Contact Update
  const handleEditContact = (e) => {
    e.preventDefault();
    try {
      hrmStore.updateEmployee(employee.id, {
        phone: editPersonalForm.mobile,
        email: editPersonalForm.email,
        personal: {
          ...(employee.personal || {}),
          mobile: editPersonalForm.mobile,
          personalEmail: editPersonalForm.personalEmail,
          currentAddress: editPersonalForm.currentAddress,
          permanentAddress: editPersonalForm.permanentAddress,
          emergencyContact: editPersonalForm.emergencyContact
        }
      }, activeUser.id, activeUser.name);

      alert('Contact and address information updated successfully.');
      setShowEditPersonalModal(false);
    } catch (err) {
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  // Handle Add Education
  const handleAddEducation = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeEducation(employee.id, {
        degree: eduForm.degree,
        institution: eduForm.institution,
        yearOfPassing: eduForm.yearOfPassing,
        grade: eduForm.grade
      }, activeUser.id, activeUser.name);
      alert('Academic qualification added successfully.');
      setShowAddEducationModal(false);
      setEduForm({ degree: '', institution: '', yearOfPassing: '', grade: '' });
    } catch (err) {
      alert(`Failed to add qualification: ${err.message}`);
    }
  };

  // Handle Add Experience
  const handleAddExperience = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeExperience(employee.id, {
        company: expForm.company,
        designation: expForm.designation,
        duration: expForm.duration,
        location: expForm.location || 'Hyderabad',
        roles: expForm.roles || 'Software Development & Architecture'
      }, activeUser.id, activeUser.name);
      alert('Previous employment experience added successfully.');
      setShowAddExperienceModal(false);
      setExpForm({ company: '', designation: '', duration: '', location: '', totalExperience: '2 Years', roles: '' });
    } catch (err) {
      alert(`Failed to add experience: ${err.message}`);
    }
  };

  // Handle Upload Document
  const handleUploadDocument = (e) => {
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

  // Handle Travel Request
  const handleAddTravel = (e) => {
    e.preventDefault();
    const newTrv = {
      id: `TRV-2026-${Math.floor(100 + Math.random() * 900)}`,
      destination: travelForm.destination,
      purpose: travelForm.purpose,
      dates: `${travelForm.startDate} to ${travelForm.endDate}`,
      budget: travelForm.budget,
      status: 'Pending Manager Approval',
      approver: 'Sunil Verma (Director)',
      hotel: 'Standard Corporate Tie-up Hotel'
    };
    setTravelRequests([newTrv, ...travelRequests]);
    alert(`Corporate travel request for ${travelForm.destination} submitted. Sent to manager & travel desk for approval.`);
    setShowTravelModal(false);
  };

  // THE 6 ORGANIZED CATEGORIES UNDER ME
  const TABS = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'experience', label: 'Experience', icon: Building2 },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'apps', label: 'Apps', icon: Grid },
  ];

  // Resolve active tab aliases (e.g. legacy links)
  const resolvedTab = 
    (activeTab === 'leaveApplications' || activeTab === 'leaveBalance') ? 'leave' :
    (activeTab === 'expenses') ? 'travel' :
    (activeTab === 'profile' || activeTab === 'personal' || activeTab === 'employment' || activeTab === 'manager' || activeTab === 'documents') ? 'attendance' :
    activeTab;

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
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-600" />
              <span>Apply Leave</span>
            </button>
            <button
              onClick={() => setShowRegularizeModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Regularize Punch</span>
            </button>
          </div>
        </div>

        {/* 7 Clean Top-Level Tabs for ME */}
        <div className="mt-6 flex border-b border-slate-200 gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = resolvedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition ${
                  active
                    ? 'border-brand-600 text-brand-600 bg-brand-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legacy Redirect Notice if someone requests Finance via ME */}
      {activeTab === 'finance' && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center space-y-3">
          <Wallet className="h-10 w-10 text-brand-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Finance & Payroll is now a Dedicated Menu</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            All salary structures, monthly payslips, Form 16, income tax calculations, and tax declarations are now accessible exclusively through the top-level <strong>Finance</strong> module.
          </p>
          <div className="pt-2">
            <Link
              to="/finance"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs"
            >
              <span>Go to Employee Side → Finance</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ATTENDANCE (100% PRESERVED KEKA ATTENDANCE LAYOUT)             */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* TAB 3: LEAVE (Applications & Entitlement Ledger)               */}
      {/* ============================================================== */}
      {resolvedTab === 'leave' && (
        <div className="space-y-6 animate-fade-in">
          {/* Leave Entitlement Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveCards.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{item.type}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${item.color}`}>
                    {item.code}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{item.available}</span>
                  <span className="text-xs text-slate-400">/ {item.total} available</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div 
                    className="h-full rounded-full bg-brand-500" 
                    style={{ width: `${Math.min(100, (item.available / item.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Leave Applications Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">My Leave Applications History</h3>
                <p className="text-xs text-slate-500">Track pending and approved requests under your reporting manager</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>Apply New Leave</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Manager Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeLeaves.length > 0 ? (
                    employeeLeaves.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{req.type || 'CL'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{req.startDate} to {req.endDate}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{req.days} Day(s)</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3.5 px-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                        No leave applications submitted yet for this cycle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PERFORMANCE (Reviews, Goals, Appraisals, Progression)   */}
      {/* ============================================================== */}
      {resolvedTab === 'performance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-brand-600" />
                <span>Performance & Appraisal Records</span>
              </h3>
              <p className="text-xs text-slate-500">Annual appraisal score, manager feedback, and strategic goals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Current Performance Rating</span>
                <p className="text-3xl font-black text-emerald-700">4.7 <span className="text-sm font-normal text-emerald-600">/ 5.0</span></p>
                <p className="text-xs text-emerald-900 font-semibold mt-1">Exceeds Expectations (Band A+)</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Review Cycle</span>
                <p className="text-xl font-bold text-slate-900">FY 2026 - H1</p>
                <p className="text-xs text-slate-500">Reviewed by: Sunil Verma (Director)</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Key Strength</span>
                <p className="text-sm font-bold text-slate-900">Architecture & Technical Leadership</p>
                <p className="text-xs text-slate-500">Consistently delivers multi-hub reliability</p>
              </div>
            </div>

            {/* Active Goals */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Key Performance Indicators (KPIs) & Goals
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { goal: 'Maintain 99.9% High Availability across Multi-Branch Biometrics', progress: 95, status: 'On Track' },
                  { goal: 'Achieve 100% On-time Payroll & Attendance Audit Reconciliation', progress: 100, status: 'Completed' },
                  { goal: 'Deliver Mobile ESS Responsive Experience for Regional Hubs', progress: 90, status: 'On Track' },
                ].map((g, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{g.goal}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{g.status}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: EXPERIENCE (Prior Work, Education & Certifications)     */}
      {/* ============================================================== */}
      {resolvedTab === 'experience' && (
        <div className="space-y-6 animate-fade-in">
          {/* Prior Work Experience */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  <span>Prior Work Experience</span>
                </h3>
                <p className="text-xs text-slate-500">Employment history prior to joining Prashanth Enterprises</p>
              </div>
              <button
                onClick={() => setShowAddExperienceModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {(employee.previousExperience || [
                {
                  company: 'Tata Consultancy Services (TCS)',
                  designation: 'Software Engineer',
                  duration: 'Jan 2022 - Dec 2023 (2 Years)',
                  location: 'Hyderabad, India',
                  roles: 'Enterprise cloud services development, REST APIs, and microservices architecture.'
                }
              ]).map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{exp.designation}</h4>
                      <p className="font-semibold text-brand-600">{exp.company}</p>
                    </div>
                    <span className="text-slate-500 font-medium">{exp.duration}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{exp.roles}</p>
                  <p className="text-[11px] text-slate-400">Location: {exp.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand-600" />
                  <span>Academic Qualifications & Degrees</span>
                </h3>
                <p className="text-xs text-slate-500">Educational background and degrees</p>
              </div>
              <button
                onClick={() => setShowAddEducationModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 text-brand-600" />
                <span>Add Qualification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(employee.educationDetails || [
                { degree: 'B.Tech in Computer Science & Engineering', institution: 'Jawaharlal Nehru Technological University (JNTU) Hyderabad', yearOfPassing: '2021', grade: '8.4 CGPA (First Class with Distinction)' },
                { degree: 'Intermediate (MPC - Mathematics, Physics, Chemistry)', institution: 'Narayana Junior College, Hyderabad', yearOfPassing: '2017', grade: '96.2%' }
              ]).map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-slate-600">{edu.institution}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">Year: {edu.yearOfPassing}</span>
                    <span className="font-semibold text-emerald-700">{edu.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: TRAVEL (Corporate Travel Desk & Requests)               */}
      {/* ============================================================== */}
      {resolvedTab === 'travel' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plane className="h-4 w-4 text-brand-600" />
                  <span>Corporate Travel & Client Site Bookings</span>
                </h3>
                <p className="text-xs text-slate-500">Travel desk requests, per-diem allowances, and accommodation</p>
              </div>
              <button
                onClick={() => setShowTravelModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
              >
                <Plus className="h-4 w-4" />
                <span>Submit Travel Request</span>
              </button>
            </div>

            {/* Travel Policy Guidelines Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1">
              <p className="font-bold">Prashanth Enterprises Travel Policy Tiers</p>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Hyderabad, Chennai, and Mumbai are classified as <strong>Tier-1 Metropolitan Hubs</strong>. Domestic air travel is permitted for inter-branch journeys over 500 km. Hotel allowance: up to ₹ 4,500/night with corporate partner hotels. Daily per-diem: ₹ 1,000/day.
              </p>
            </div>

            {/* Travel History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">My Travel Requests</h4>
              <div className="space-y-3 text-xs">
                {travelRequests.map((trv) => (
                  <div key={trv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-700">{trv.id}</span>
                          <span className="font-bold text-slate-900">{trv.destination}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{trv.purpose}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        trv.status.includes('Approved') || trv.status.includes('Completed')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {trv.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex-wrap">
                      <span>Travel Dates: <strong className="text-slate-700">{trv.dates}</strong></span>
                      <span>Budget: <strong className="text-slate-900 font-mono">{trv.budget}</strong></span>
                      <span>Approver: <strong className="text-slate-700">{trv.approver}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: APPS (Employee Utilities & Shortcuts)                   */}
      {/* ============================================================== */}
      {resolvedTab === 'apps' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid className="h-4 w-4 text-brand-600" />
                <span>Enterprise Applications & Employee Tools</span>
              </h3>
              <p className="text-xs text-slate-500">Corporate intranet services, helpdesk, and asset management</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {[
                { title: 'IT Service Helpdesk', desc: 'Hardware, software licenses, and VPN support tickets', link: '/helpdesk', icon: Laptop },
                { title: 'Learning Management (LMS)', desc: 'Mandatory information security and compliance training', action: () => alert('Launching LMS portal...'), icon: GraduationCap },
                { title: 'Digital ID Card & Pass', desc: 'Matrix biometric digital gate badge with QR code', action: () => alert(`Digital ID Card:\n${employee.name}\n${employee.employeeId || employee.id} - ${employee.role}\nPrashanth Enterprises`), icon: UserCheck },
                { title: 'Company Policies Handbook', desc: 'IT Policy-2025, Code of Conduct, and Leave Manual', action: () => alert('Downloading Company Policies PDF...'), icon: FileText },
                { title: 'Org Directory & Tree', desc: 'Team chart and corporate branch locations', link: '/org', icon: Users },
                { title: 'Intranet Wi-Fi & VPN Config', desc: 'Setup corporate 802.1X certificates for personal devices', action: () => alert('Intranet Wi-Fi Certificate: Downloaded.'), icon: ShieldCheck }
              ].map((app, idx) => {
                const Icon = app.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 border border-slate-200 shadow-xs mb-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-slate-900">{app.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{app.desc}</p>
                    </div>

                    <div className="pt-2">
                      {app.link ? (
                        <Link
                          to={app.link}
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 text-[11px]"
                        >
                          <span>Open Service</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <button
                          onClick={app.action}
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 text-[11px]"
                        >
                          <span>Launch Tool</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ALL MODALS (Personal Edit, Education, Experience, Docs, Travel) */}
      {/* ============================================================== */}
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

      {/* Modal: Travel Request */}
      {showTravelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Submit Corporate Travel Request</h3>
              <button onClick={() => setShowTravelModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddTravel} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination & Branch</label>
                <select
                  value={travelForm.destination}
                  onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                >
                  <option value="Mumbai Branch Hub (BKC Client Office)">Mumbai Branch Hub (BKC Client Office)</option>
                  <option value="Chennai Branch (OMR Tech Park)">Chennai Branch (OMR Tech Park)</option>
                  <option value="Hyderabad Corporate Headquarters">Hyderabad Corporate Headquarters</option>
                  <option value="Delhi Client Headquarters">Delhi Client Headquarters</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  value={travelForm.purpose}
                  onChange={(e) => setTravelForm({ ...travelForm, purpose: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={travelForm.startDate}
                    onChange={(e) => setTravelForm({ ...travelForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    value={travelForm.endDate}
                    onChange={(e) => setTravelForm({ ...travelForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (₹)</label>
                <input
                  type="text"
                  value={travelForm.budget}
                  onChange={(e) => setTravelForm({ ...travelForm, budget: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTravelModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-1.5 font-bold text-white hover:bg-brand-700"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4 ATTENDANCE MODALS (Request Duty, Partial Day, Leave, Regular) */}
      {/* ============================================================== */}
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

import fs from 'fs';

const oldFile = fs.readFileSync('src/pages/Me.jsx', 'utf8');

// 1. Extract attendance block: from '{activeTab === \'attendance\' && (' to '{activeTab === \'loginSessions\' && ('
const attStart = oldFile.indexOf("{activeTab === 'attendance' && (");
const attEnd = oldFile.indexOf("{activeTab === 'loginSessions' && (");
const attendanceBlock = oldFile.slice(attStart, attEnd).trim();

// 2. Extract calendar logic: from lines before attendance
const calLogicStart = oldFile.indexOf('// Keka-style attendance states');
const calLogicEnd = oldFile.indexOf('// --- Strict Data Isolation & Selectors for Authenticated Employee ---');
const calendarLogic = oldFile.slice(calLogicStart, calLogicEnd).trim();

// 3. Extract the 4 attendance modals: from '{/* Modal: Request Duty (OD) */}' to the end of last modal
const modalStart = oldFile.indexOf('{/* Modal: Request Duty (OD) */}');
const modalEnd = oldFile.indexOf('    </div>\n  );\n}\n\nexport default Me;');
const attendanceModals = oldFile.slice(modalStart, modalEnd).trim();

// 4. Extract personal edit modal, education modal, experience modal, upload doc modal
const editPersonalStart = oldFile.indexOf('{/* Modal: Edit Personal Information */}');
const editPersonalEnd = oldFile.indexOf('{/* Modal: View Corporate Salary Payslip */}');
const customModals = oldFile.slice(editPersonalStart, editPersonalEnd).trim();

console.log('Attendance Block Length:', attendanceBlock.length);
console.log('Calendar Logic Length:', calendarLogic.length);
console.log('Attendance Modals Length:', attendanceModals.length);
console.log('Custom Modals Length:', customModals.length);

const newMeContent = `// Prashanth Enterprises HRMS
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
import { Link } from 'react-router-dom';
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

  ${calendarLogic}

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

      alert(\`Leave application successfully submitted for \${leaveDays} day(s) of \${leaveType}. Sent to reporting manager for approval.\`);
      setShowLeaveModal(false);
    } catch (err) {
      alert(\`Leave Application Failed: \${err.message}\`);
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
      alert(\`Failed to update profile: \${err.message}\`);
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
      alert(\`Failed to add qualification: \${err.message}\`);
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
      alert(\`Failed to add experience: \${err.message}\`);
    }
  };

  // Handle Upload Document
  const handleUploadDocument = (e) => {
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

  // Handle Travel Request
  const handleAddTravel = (e) => {
    e.preventDefault();
    const newTrv = {
      id: \`TRV-2026-\${Math.floor(100 + Math.random() * 900)}\`,
      destination: travelForm.destination,
      purpose: travelForm.purpose,
      dates: \`\${travelForm.startDate} to \${travelForm.endDate}\`,
      budget: travelForm.budget,
      status: 'Pending Manager Approval',
      approver: 'Sunil Verma (Director)',
      hotel: 'Standard Corporate Tie-up Hotel'
    };
    setTravelRequests([newTrv, ...travelRequests]);
    alert(\`Corporate travel request for \${travelForm.destination} submitted. Sent to manager & travel desk for approval.\`);
    setShowTravelModal(false);
  };

  // THE 7 ORGANIZED CATEGORIES UNDER ME
  const TABS = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'experience', label: 'Experience', icon: Building2 },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'apps', label: 'Apps', icon: Grid },
  ];

  // Resolve active tab aliases (e.g. legacy links)
  const resolvedTab = 
    (activeTab === 'personal' || activeTab === 'employment' || activeTab === 'manager' || activeTab === 'documents') ? 'profile' :
    (activeTab === 'leaveApplications' || activeTab === 'leaveBalance') ? 'leave' :
    (activeTab === 'expenses') ? 'travel' :
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
                className={\`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition \${
                  active
                    ? 'border-brand-600 text-brand-600 bg-brand-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }\`}
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
      {/* TAB 1: MY PROFILE (Basic Personal, Employment, Manager, Docs)   */}
      {/* ============================================================== */}
      {resolvedTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1A: Personal Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  <span>Personal Information</span>
                </h3>
                <p className="text-xs text-slate-500">Official employee identity details</p>
              </div>
              <button
                onClick={() => setShowEditPersonalModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Edit3 className="h-3.5 w-3.5 text-brand-600" />
                <span>Edit Contact Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Full Legal Name</span>
                <p className="text-slate-800 font-bold mt-0.5">{employee.name}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Date of Birth</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.personal?.dob || '14 August 1994'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Gender & Blood Group</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.personal?.gender || 'Male'} • Blood: <strong className="text-rose-600">{employee.personal?.bloodGroup || 'O+'}</strong></p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Mobile Number</span>
                <p className="text-slate-800 font-mono font-semibold mt-0.5">{employee.phone || employee.personal?.mobile || '+91 98480 11221'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Official Email</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.email}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Personal Gmail</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.personal?.personalEmail || 'ravi.kumar.dev@gmail.com'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2">
                <span className="text-[11px] text-slate-400 font-medium">Current Residential Address</span>
                <p className="text-slate-800 mt-0.5">{employee.personal?.currentAddress || 'Flat 402, Sai Teja Residency, Madhapur, Hyderabad, TS - 500081'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Emergency Contact</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.personal?.emergencyContact || '+91 94401 22334 (Suresh Kumar - Brother)'}</p>
              </div>
            </div>
          </div>

          {/* Section 1B: Employment Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand-600" />
                <span>Employment & Organization Details</span>
              </h3>
              <p className="text-xs text-slate-500">Corporate designation, branch, and joining records</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Corporate Designation</span>
                <p className="text-slate-800 font-bold mt-0.5">{employee.role}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Department</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.department || 'Engineering'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Branch Location</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.branch || 'Hyderabad'} Regional Hub</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Date of Joining</span>
                <p className="text-slate-800 font-semibold mt-0.5">{employee.joiningDate || '12 Jan 2024'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Employment Status</span>
                <p className="text-emerald-700 font-bold mt-0.5">{employee.status || 'Active'} • Confirmed Permanent</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">Work Shift & Timings</span>
                <p className="text-slate-800 font-semibold mt-0.5">General Day Shift (09:00 AM – 06:00 PM)</p>
              </div>
            </div>
          </div>

          {/* Section 1C: Reporting Manager */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Network className="h-4 w-4 text-brand-600" />
                <span>Reporting Manager Hierarchy</span>
              </h3>
              <p className="text-xs text-slate-500">Official organizational reporting chain</p>
            </div>

            <div className="p-4 rounded-xl border border-brand-100 bg-brand-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-base shadow-xs">
                  {employee.managerName ? employee.managerName.split(' ').map(n=>n[0]).join('') : 'SV'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{employee.managerName || 'Sunil Verma'}</h4>
                  <p className="text-xs text-brand-700 font-semibold">Engineering Director & Approver</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Department: Engineering • Branch: {employee.branch || 'Hyderabad'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={\`mailto:\${(employee.managerName || 'sunil.verma').toLowerCase().replace(/\\s+/g, '.')}@prashanthenterprises.com\`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>Email Manager</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 1D: Documents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-600" />
                  <span>My Verified Documents</span>
                </h3>
                <p className="text-xs text-slate-500">Official KYC proofs, NDA, and offer letters</p>
              </div>
              <button
                onClick={() => setShowUploadDocModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {(employee.documents || [
                { category: 'Identity Proof', documentName: 'Aadhaar_Card_Verified.pdf', fileUrl: '#' },
                { category: 'Tax ID Proof', documentName: 'PAN_Card_Verified.pdf', fileUrl: '#' },
                { category: 'Employment Agreement', documentName: 'Prashanth_Offer_Appointment_Letter.pdf', fileUrl: '#' },
                { category: 'Compliance', documentName: 'NDA_Confidentiality_Agreement_2024.pdf', fileUrl: '#' },
              ]).map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 shadow-xs">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{doc.category}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.documentName}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ATTENDANCE (100% PRESERVED KEKA ATTENDANCE LAYOUT)      */}
      {/* ============================================================== */}
      ${attendanceBlock}

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
                  <span className={\`rounded-md px-2 py-0.5 text-[10px] font-bold border \${item.color}\`}>
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
                    style={{ width: \`\${Math.min(100, (item.available / item.total) * 100)}%\` }}
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
                          <span className={\`rounded-full px-2.5 py-0.5 text-[10px] font-bold border \${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }\`}>
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
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: \`\${g.progress}%\` }} />
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
                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold border \${
                        trv.status.includes('Approved') || trv.status.includes('Completed')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }\`}>
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
                { title: 'Digital ID Card & Pass', desc: 'Matrix biometric digital gate badge with QR code', action: () => alert(\`Digital ID Card:\\n\${employee.name}\\n\${employee.employeeId || employee.id} - \${employee.role}\\nPrashanth Enterprises\`), icon: UserCheck },
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
      ${customModals}

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
      ${attendanceModals}
    </div>
  );
}

export default Me;
`;

fs.writeFileSync('src/pages/Me.jsx', newMeContent, 'utf8');
console.log('Successfully generated reorganized src/pages/Me.jsx!');

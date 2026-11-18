import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ArrowLeft, 
  Edit3, 
  Download, 
  Printer, 
  Eye, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  GraduationCap, 
  Briefcase, 
  Network, 
  Award, 
  Activity, 
  Plus, 
  X, 
  Check, 
  Lock, 
  Upload, 
  Laptop, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Employee360Profile({ employeeId, onBack }) {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  // Find employee
  const employee = storeData.employees.find(e => e.id === employeeId || e.employeeId === employeeId);

  // Active Tab (13 tabs)
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [showEditPersonalModal, setShowEditPersonalModal] = useState(false);
  const [showEditEmploymentModal, setShowEditEmploymentModal] = useState(false);
  const [showReassignManagerModal, setShowReassignManagerModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState(employee?.personal || {});
  const [employmentForm, setEmploymentForm] = useState(employee?.employment || {});
  const [selectedNewManagerId, setSelectedNewManagerId] = useState('');
  const [newEduForm, setNewEduForm] = useState({
    qualification: '',
    degree: '',
    specialization: '',
    institution: '',
    university: '',
    yearOfPassing: '2020',
    percentage: '',
    certificateName: 'Degree_Certificate.pdf'
  });
  const [newExpForm, setNewExpForm] = useState({
    companyName: '',
    designation: '',
    startDate: '2021-01-01',
    endDate: '2023-12-31',
    totalExperience: '3 Years',
    documentName: 'Relieving_Experience_Letter.pdf'
  });
  const [newDocForm, setNewDocForm] = useState({
    category: 'Aadhaar / Identity Proof',
    documentName: 'Govt_ID_Document.pdf',
    type: 'PDF',
    expiryDate: 'N/A'
  });

  // Attendance Filter
  const [attendancePeriodFilter, setAttendancePeriodFilter] = useState('ALL');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!employee) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <Users className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Employee Profile Not Found</h3>
        <p className="text-xs text-slate-500">The requested employee ID does not exist or has been archived.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>
      </div>
    );
  }

  // Related Records from central store
  const employeeAttendance = storeData.attendance.filter(a => a.employeeId === employee.id || a.employeeId === employee.employeeId);
  const employeeLeaves = storeData.leaveRequests.filter(r => r.employeeId === employee.id || r.employeeId === employee.employeeId);
  const employeeLedger = storeData.leaveLedger[employee.id] || storeData.leaveLedger['PE001'] || {};
  const employeeSalary = storeData.salaryStructures[employee.id] || { basic: 45000, hra: 22500, specialAllowance: 22500, pf: 5400, pt: 200, tds: 4500, gross: 90000, net: 79900 };
  
  // Specific Audit Logs for this employee
  const employeeAuditLogs = storeData.auditLogs.filter(log => 
    log.userId === employee.id || 
    log.userId === employee.employeeId ||
    log.details.includes(employee.name) ||
    log.details.includes(employee.employeeId) ||
    log.details.includes(employee.id)
  );

  // Tabs Definition
  const tabs = [
    { id: 'overview', label: '1. Overview', icon: Eye },
    { id: 'personal', label: '2. Personal Info', icon: Users },
    { id: 'employment', label: '3. Employment', icon: Building2 },
    { id: 'attendance', label: '4. Attendance', icon: Clock },
    { id: 'loginSessions', label: '5. Login Sessions', icon: Laptop },
    { id: 'leave', label: '6. Leave & Ledger', icon: Calendar },
    { id: 'finance', label: '7. Finance & Payroll', icon: DollarSign, protected: true },
    { id: 'education', label: '8. Education', icon: GraduationCap },
    { id: 'experience', label: '9. Experience', icon: Briefcase },
    { id: 'manager', label: '10. Hierarchy & Manager', icon: Network },
    { id: 'documents', label: '11. Documents', icon: FileText },
    { id: 'performance', label: '12. Career & OKRs', icon: Award },
    { id: 'timeline', label: '13. Activity Timeline', icon: Activity }
  ];

  // Actions
  const handleSavePersonal = (e) => {
    e.preventDefault();
    try {
      hrmStore.updateEmployeePersonal(employee.id, personalForm, currentUser.id, currentUser.name);
      showToast('Personal information updated and recorded in audit ledger.');
      setShowEditPersonalModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEmployment = (e) => {
    e.preventDefault();
    try {
      hrmStore.updateEmployeeEmployment(employee.id, employmentForm, currentUser.id, currentUser.name);
      showToast('Employment details updated and audited.');
      setShowEditEmploymentModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReassignManager = (e) => {
    e.preventDefault();
    if (!selectedNewManagerId) {
      alert('Please select a manager from the corporate roster.');
      return;
    }
    try {
      hrmStore.reassignManager(employee.id, selectedNewManagerId, currentUser.id, currentUser.name);
      showToast(`Reporting manager successfully reassigned.`);
      setShowReassignManagerModal(false);
    } catch (err) {
      alert(`Assignment prohibited: ${err.message}`);
    }
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeEducation(employee.id, newEduForm, currentUser.id, currentUser.name);
      showToast('Education credential added successfully.');
      setShowAddEducationModal(false);
      setNewEduForm({ qualification: '', degree: '', specialization: '', institution: '', university: '', yearOfPassing: '2020', percentage: '', certificateName: 'Degree_Certificate.pdf' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    try {
      hrmStore.addEmployeeExperience(employee.id, newExpForm, currentUser.id, currentUser.name);
      showToast('Prior employment record added successfully.');
      setShowAddExperienceModal(false);
      setNewExpForm({ companyName: '', designation: '', startDate: '2021-01-01', endDate: '2023-12-31', totalExperience: '3 Years', documentName: 'Relieving_Experience_Letter.pdf' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();
    try {
      hrmStore.uploadEmployeeDocument(employee.id, newDocForm, currentUser.id, currentUser.name);
      showToast(`Document uploaded under ${newDocForm.category}.`);
      setShowUploadDocModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyDocument = (docId) => {
    try {
      hrmStore.verifyEmployeeDocument(employee.id, docId, currentUser.id, currentUser.name);
      showToast('Document marked as legally verified by HR.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Return to Directory */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>Back to Employee Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            title="Print or Save Official 360 Dossier as PDF"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print 360° Profile</span>
          </button>
          <button
            onClick={() => {
              setPersonalForm({ ...(employee.personal || {}) });
              setShowEditPersonalModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. EMPLOYEE PROFILE HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Cover Strip */}
        <div className="h-24 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900"></div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-white"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{employee.name}</h1>
                  <span className="rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-mono font-bold text-brand-700">
                    {employee.employeeId}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600">{employee.role} • {employee.department}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {employee.branch} Hub
                  </span>
                  <span>•</span>
                  <span>Joined {employee.joiningDate}</span>
                  <span>•</span>
                  <span>Manager: <strong className="text-slate-700">{employee.managerName || 'Board of Directors'}</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {employee.phone}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Biometric: {employee.biometricId}
              </span>
            </div>
          </div>

          {/* 13-Tab Navigation Bar */}
          <div className="mt-6 flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'border-brand-600 text-brand-700 font-bold bg-brand-50/50 rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.protected && <Lock className="h-3 w-3 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Employment Status</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{employee.status} (Permanent)</p>
              <p className="text-[11px] text-slate-400 mt-1">Confirmed on {employee.employment?.confirmationDate || employee.joiningDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Available Paid Leaves</p>
              <p className="text-lg font-bold text-brand-600 mt-1">
                {((employeeLedger.CL?.available || 0) + (employeeLedger.PL?.available || 0) + (employeeLedger.SL?.available || 0)).toFixed(1)} Days
              </p>
              <p className="text-[11px] text-slate-400 mt-1">CL: {employeeLedger.CL?.available || 0} • SL: {employeeLedger.SL?.available || 0} • PL: {employeeLedger.PL?.available || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Biometric Attendance</p>
              <p className="text-lg font-bold text-slate-900 mt-1">100% Punctual</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Reader: {employee.biometricId}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Reporting Line</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{employee.managerName || 'Board of Directors'}</p>
              <p className="text-[11px] text-slate-400 mt-1">{employee.department} Division</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Profile Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Personnel & Corporate Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Designation:</span>
                  <p className="font-semibold text-slate-800">{employee.role}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-semibold text-slate-800">{employee.department}</p>
                </div>
                <div>
                  <span className="text-slate-400">Regional Hub:</span>
                  <p className="font-semibold text-slate-800">{employee.branch} (PE-{employee.branchId})</p>
                </div>
                <div>
                  <span className="text-slate-400">Date of Joining:</span>
                  <p className="font-semibold text-slate-800">{employee.joiningDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Emergency Contact:</span>
                  <p className="font-semibold text-slate-800">{employee.personal?.emergencyContact?.name} ({employee.personal?.emergencyContact?.phone})</p>
                </div>
                <div>
                  <span className="text-slate-400">Salary Account:</span>
                  <p className="font-semibold text-slate-800">{employee.bankDetails?.bankName} (Verified)</p>
                </div>
              </div>
            </div>

            {/* Recent Audit Timeline Highlights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Recent Employee Milestones & Audits</h3>
                <span className="text-[11px] text-slate-400">{employeeAuditLogs.length} Events</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {employeeAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No recent logged events.</p>
                ) : (
                  employeeAuditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="text-xs border-l-2 border-brand-500 pl-3 py-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{log.action}</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL DETAILS */}
      {activeTab === 'personal' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Identity details, addresses, and family emergency contacts.</p>
            </div>
            <button
              onClick={() => {
                setPersonalForm({ ...(employee.personal || {}) });
                setShowEditPersonalModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Modify Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Full Legal Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.fullName || employee.name}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Date of Birth</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.dob || '24 Aug 1994'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Gender</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.gender || 'Male'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Marital Status</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.maritalStatus || 'Married'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Blood Group</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.bloodGroup || 'O+ve'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Personal Contact Number</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{employee.personal?.mobile || employee.phone}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Official Corporate Email</span>
              <p className="font-mono font-bold text-brand-600 mt-0.5">{employee.personal?.officialEmail || employee.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Personal Email Address</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{employee.personal?.personalEmail || 'ravi.kumar.dev@gmail.com'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Emergency Contact Person</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {employee.personal?.emergencyContact?.name || 'Sunita Reddy'} ({employee.personal?.emergencyContact?.relation || 'Spouse'})
              </p>
              <p className="font-mono text-slate-600 mt-0.5">{employee.personal?.emergencyContact?.phone || '+91 98480 99881'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-4">
              <span className="font-bold text-slate-800">Current Residential Address</span>
              <p className="text-slate-600 mt-1">{employee.personal?.currentAddress || 'Flat 402, Cyber Heights, Madhapur, Hyderabad 500081'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <span className="font-bold text-slate-800">Permanent Native Address</span>
              <p className="text-slate-600 mt-1">{employee.personal?.permanentAddress || 'House No 12-4, Tilak Road, Rajahmundry, Andhra Pradesh 533101'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMPLOYMENT DETAILS */}
      {activeTab === 'employment' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Employment Details & Tenure</h3>
              <p className="text-xs text-slate-500">Job position, branch location, probation parameters, and transfer history.</p>
            </div>
            <button
              onClick={() => {
                setEmploymentForm({ ...(employee.employment || {}) });
                setShowEditEmploymentModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Update Employment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Employee Identification (ID)</span>
              <p className="font-mono font-bold text-brand-600 text-sm mt-0.5">{employee.employeeId}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Joining Date</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{employee.joiningDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Employment Type</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.employment?.employmentType || 'Full-Time Permanent'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Current Designation</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.role}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Department</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.department}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Branch & Work Location</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.branch} Hub ({employee.employment?.workLocation || 'Bay 4'})</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Probation & Confirmation</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">
                {employee.employment?.probationStatus || 'Confirmed'} (On {employee.employment?.confirmationDate || employee.joiningDate})
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Notice Period</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.employment?.noticePeriod || '60 Days'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="font-semibold text-slate-500">Separation / Exit Status</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.employment?.exitDetails || 'Active In Good Standing'}</p>
            </div>
          </div>

          {/* Transfer & Designations History */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
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
                  {(employee.employment?.transferHistory || []).map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono">{t.date}</td>
                      <td className="py-2 px-3 text-slate-600">{t.fromBranch}</td>
                      <td className="py-2 px-3 font-semibold text-brand-600">{t.toBranch}</td>
                      <td className="py-2 px-3">{t.reason}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{t.approvedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE & PUNCHES */}
      {activeTab === 'attendance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Biometric Attendance Log</h3>
              <p className="text-xs text-slate-500">Live Matrix Intranet controller timestamps, check-in, check-out, and lateness.</p>
            </div>
            <div className="flex items-center gap-2">
              {['Today', 'This Month', 'ALL'].map(pf => (
                <button
                  key={pf}
                  onClick={() => setAttendancePeriodFilter(pf)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    attendancePeriodFilter === pf ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pf}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Check-In Time</th>
                  <th className="py-3 px-3">Check-Out Time</th>
                  <th className="py-3 px-3">Working Hours</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Biometric Reader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No attendance records found for this period.
                    </td>
                  </tr>
                ) : (
                  employeeAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium">{a.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{a.firstIn}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{a.lastOut}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{a.workingHours}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          a.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          a.status === 'Late Arrival' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{a.terminal || a.mode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LOGIN & SESSION HISTORY */}
      {activeTab === 'loginSessions' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
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
                {(employee.loginSessions || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      Historical application login session data is not collected for this user.
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

      {/* TAB 6: LEAVE MANAGEMENT & LEDGER */}
      {activeTab === 'leave' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Leave Entitlements & Atomic Ledger</h3>
            <p className="text-xs text-slate-500">Opening balance, accrued days, approved leaves, and pending reservations.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['CL', 'SL', 'PL', 'COMP'].map(code => {
              const b = employeeLedger[code] || { available: 0, opening: 0 };
              const typeName = code === 'CL' ? 'Casual Leave' : code === 'SL' ? 'Sick Leave' : code === 'PL' ? 'Privilege Leave' : 'Comp Off';
              return (
                <div key={code} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500">{typeName} ({code})</span>
                  <p className="text-2xl font-bold text-brand-600 mt-1">{b.available} Days</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Opening: {b.opening} • Approved: {b.approvedDeductions || 0}</p>
                </div>
              );
            })}
          </div>

          {/* Leave Application History */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave Applications History</h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-2.5 px-3">Req ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">From</th>
                    <th className="py-2.5 px-3">To</th>
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400">No leave requests found for this employee.</td>
                    </tr>
                  ) : (
                    employeeLeaves.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-brand-600">{r.id}</td>
                        <td className="py-2 px-3 font-semibold">{r.leaveType}</td>
                        <td className="py-2 px-3 text-slate-600">{r.fromDate}</td>
                        <td className="py-2 px-3 text-slate-600">{r.toDate}</td>
                        <td className="py-2 px-3 font-bold">{r.totalDays}</td>
                        <td className="py-2 px-3 text-slate-500 max-w-[150px] truncate">{r.reason}</td>
                        <td className="py-2 px-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{r.approverName || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FINANCE & PAYROLL */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {!permissions.canProcessPayroll && !permissions.isGlobalAdmin ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-2">
              <Lock className="h-8 w-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-900">Restricted Financial Confidentiality</p>
              <p className="text-[11px] text-rose-700">Salary structures and bank details are restricted to Finance and Global Admin.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Salary Structure & Payroll History</h3>
                  <p className="text-xs text-slate-500">Monthly compensation components, EPF deductions, and statutory bank details.</p>
                </div>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Finance Authorized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <span className="text-slate-500">Basic Monthly</span>
                  <p className="font-mono font-bold text-slate-900 text-base mt-1">₹ {employeeSalary.basic?.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <span className="text-slate-500">House Rent Allowance (HRA)</span>
                  <p className="font-mono font-bold text-slate-900 text-base mt-1">₹ {employeeSalary.hra?.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5">
                  <span className="text-slate-500">Special Allowances</span>
                  <p className="font-mono font-bold text-slate-900 text-base mt-1">₹ {employeeSalary.specialAllowance?.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200">
                  <span className="text-emerald-700 font-semibold">Net Take-Home Disbursed</span>
                  <p className="font-mono font-bold text-emerald-700 text-lg mt-1">₹ {employeeSalary.net?.toLocaleString()}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Salary Bank Account</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Bank Name:</span>
                    <p className="font-semibold text-slate-800">{employee.bankDetails?.bankName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account Number:</span>
                    <p className="font-mono font-semibold text-slate-800">{employee.bankDetails?.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">IFSC Code:</span>
                    <p className="font-mono font-semibold text-slate-800">{employee.bankDetails?.ifscCode}</p>
                  </div>
                </div>
              </div>

              {/* Salary Revision History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Salary Revision History</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                        <th className="py-2.5 px-3">Effective Date</th>
                        <th className="py-2.5 px-3">Revised Gross</th>
                        <th className="py-2.5 px-3">Revised Basic</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(employee.salaryHistory || []).map((sh, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono">{sh.effectiveDate}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">₹ {sh.gross?.toLocaleString()}</td>
                          <td className="py-2 px-3 font-mono">₹ {sh.basic?.toLocaleString()}</td>
                          <td className="py-2 px-3">{sh.reason}</td>
                          <td className="py-2 px-3 font-semibold text-brand-600">{sh.revisedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: EDUCATION */}
      {activeTab === 'education' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic & Educational Qualifications</h3>
              <p className="text-xs text-slate-500">Verified diplomas, degrees, institutions, and CGPA scores.</p>
            </div>
            <button
              onClick={() => setShowAddEducationModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="space-y-3">
            {(employee.education || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No education records available.</p>
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

      {/* TAB 9: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Prior Professional Experience</h3>
              <p className="text-xs text-slate-500">Employment history prior to joining Prashanth Enterprises.</p>
            </div>
            <button
              onClick={() => setShowAddExperienceModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Prior Job</span>
            </button>
          </div>

          <div className="space-y-3">
            {(employee.experience || []).length === 0 ? (
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

      {/* TAB 10: REPORTING STRUCTURE & MANAGER */}
      {activeTab === 'manager' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Reporting Manager & Org Hierarchy</h3>
              <p className="text-xs text-slate-500">Direct supervisor allocation and corporate chain of command.</p>
            </div>
            <button
              onClick={() => setShowReassignManagerModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 shadow-2xs"
            >
              <Network className="h-3.5 w-3.5" />
              <span>Reassign Supervisor</span>
            </button>
          </div>

          {/* Visual Reporting Tree */}
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
                <p className="text-[10px] uppercase font-bold text-emerald-800">Direct Individual Contributor</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{employee.name}</p>
                <p className="text-[11px] text-slate-600 font-semibold">{employee.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: DOCUMENTS MANAGEMENT */}
      {activeTab === 'documents' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personnel Dossier & Document Verification</h3>
              <p className="text-xs text-slate-500">Official statutory proofs, contracts, and employment letters.</p>
            </div>
            <button
              onClick={() => setShowUploadDocModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
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
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verified By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(employee.documents || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">No documents uploaded.</td>
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
                      <td className="py-2.5 px-3 text-slate-600">{doc.verifiedBy || 'Pending'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => showToast(`Previewing verified document: ${doc.documentName}`)}
                            className="text-xs font-semibold text-brand-600 hover:underline"
                          >
                            Preview
                          </button>
                          {doc.verificationStatus !== 'Verified' && (
                            <button
                              onClick={() => handleVerifyDocument(doc.id)}
                              className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 12: CAREER & OKRs */}
      {activeTab === 'performance' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Performance Reviews & OKR Milestones</h3>
            <p className="text-xs text-slate-500">Appraisal scores, goals, and training compliance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-600">Active Appraisal Rating</span>
              <p className="text-2xl font-bold text-slate-900">{employee.performance?.currentRating || '4.8 / 5.0'}</p>
              <p className="text-xs text-slate-600 italic">"{employee.performance?.managerFeedback || 'Consistent delivery on critical deliverables.'}"</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-600">Strategic OKR Goals</span>
              {(employee.performance?.goals || []).map((g, idx) => (
                <div key={idx} className="text-xs flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="text-slate-800 font-medium">{g.goal}</span>
                  <span className="font-bold text-emerald-600 text-[11px]">{g.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 13: ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Chronological Employee Activity Audit</h3>
            <p className="text-xs text-slate-500">Immutable trace of personnel status changes, leave submissions, and supervisory actions.</p>
          </div>

          <div className="space-y-3">
            {employeeAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No audit trail records found for this employee.</p>
            ) : (
              employeeAuditLogs.map(log => (
                <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
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

      {/* MODAL: EDIT PERSONAL DETAILS */}
      {showEditPersonalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Modify Personal Details</h3>
              <button onClick={() => setShowEditPersonalModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePersonal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={personalForm.fullName || employee.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Mobile</label>
                  <input
                    type="text"
                    value={personalForm.mobile || employee.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, mobile: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={personalForm.bloodGroup || 'O+ve'}
                    onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Residential Address</label>
                <input
                  type="text"
                  value={personalForm.currentAddress || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, currentAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Permanent Address</label>
                <input
                  type="text"
                  value={personalForm.permanentAddress || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, permanentAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
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
                  className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Save & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN MANAGER */}
      {showReassignManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Reassign Reporting Supervisor</h3>
              <button onClick={() => setShowReassignManagerModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Select an authorized manager from the corporate leadership hierarchy. Circular relationships are strictly validated and rejected.
            </p>
            <form onSubmit={handleReassignManager} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select New Manager</label>
                <select
                  value={selectedNewManagerId}
                  onChange={(e) => setSelectedNewManagerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Corporate Manager --</option>
                  {storeData.employees
                    .filter(emp => emp.id !== employee.id && emp.systemRole !== 'Employee')
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.role} ({m.branch})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReassignManagerModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EDUCATION */}
      {showAddEducationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Academic Credential</h3>
              <button onClick={() => setShowAddEducationModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddEducation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree / Qualification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Business Administration (MBA)"
                  value={newEduForm.degree}
                  onChange={(e) => setNewEduForm({ ...newEduForm, degree: e.target.value, qualification: e.target.value.split(' ')[0] })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution & University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indian Institute of Management"
                  value={newEduForm.institution}
                  onChange={(e) => setNewEduForm({ ...newEduForm, institution: e.target.value, university: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year of Passing</label>
                  <input
                    type="text"
                    value={newEduForm.yearOfPassing}
                    onChange={(e) => setNewEduForm({ ...newEduForm, yearOfPassing: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentage / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.6 CGPA"
                    value={newEduForm.percentage}
                    onChange={(e) => setNewEduForm({ ...newEduForm, percentage: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddEducationModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DOCUMENT */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Upload Personnel Document</h3>
              <button onClick={() => setShowUploadDocModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={newDocForm.category}
                  onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-semibold outline-none focus:border-brand-500"
                >
                  <option>Aadhaar / Identity Proof</option>
                  <option>PAN</option>
                  <option>Passport</option>
                  <option>Education Certificates</option>
                  <option>Previous Experience Letters</option>
                  <option>Offer Letter</option>
                  <option>Appointment Letter</option>
                  <option>Employment Agreement</option>
                  <option>Address Proof</option>
                  <option>Bank Documents</option>
                  <option>Other Documents</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document File Name *</label>
                <input
                  type="text"
                  required
                  value={newDocForm.documentName}
                  onChange={(e) => setNewDocForm({ ...newDocForm, documentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employee360Profile;

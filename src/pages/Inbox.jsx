import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  FileCheck, 
  AlertCircle, 
  Check, 
  X, 
  Search, 
  ShieldCheck, 
  Calendar, 
  User, 
  Users, 
  Shield, 
  FileText, 
  DollarSign, 
  Award, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

// 1. Personal Tasks for normal employees (Only visible when userRole === 'Employee')
const initialPersonalTasks = [
  {
    id: "TSK-EMP-01",
    type: "IT Policy 2025 Sign-off",
    title: "Acknowledge IT Policy-2025 (Information Security & Intranet Guidelines)",
    details: "Mandatory annual compliance review regarding workstation encryption, local biometric terminal protocols, and acceptable intranet usage.",
    deadline: "Due by Nov 20, 2026",
    priority: "Urgent",
    category: "Policy",
    status: "Pending Action",
    actionLabel: "Sign Policy"
  },
  {
    id: "TSK-EMP-02",
    type: "Missing Punch Regularization",
    title: "Regularize Nov 14 Missing Punch (Door Terminal 01)",
    details: "System audit detected a single punch at 09:12 AM without an evening punch due to local reader maintenance. Confirm exit time.",
    deadline: "Due Today",
    priority: "High",
    category: "Attendance",
    status: "Pending Action",
    actionLabel: "Submit Details"
  },
  {
    id: "TSK-EMP-03",
    type: "Tax Savings Proof Submission",
    title: "Upload Investment Proofs for Q3 / FY 2026-27",
    details: "Upload eligible 80C, 80D Mediclaim, or NPS receipts to finalize TDS deductions before December payroll processing.",
    deadline: "Due Dec 10, 2026",
    priority: "Medium",
    category: "Tax & Finance",
    status: "Pending Action",
    actionLabel: "Declare Proofs"
  },
  {
    id: "TSK-EMP-04",
    type: "Self Performance Review",
    title: "Complete Q3 Self-Appraisal & OKR Assessment",
    details: "Review your key quarterly milestones and submit self-ratings before the upcoming manager evaluation window.",
    deadline: "Due Nov 30, 2026",
    priority: "Medium",
    category: "Performance",
    status: "Pending Action",
    actionLabel: "Start Review"
  }
];

// 2. Team Approval Queue for Managers/HR/Admin (Only visible when userRole === 'HR' || userRole === 'Admin')
const initialTeamApprovals = [
  {
    id: "APPR-101",
    type: "Leave Approval",
    requester: "Kavitha Sharma",
    role: "Lead QA Automation",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    details: "Sick Leave (2 Days: Nov 18 - Nov 19) • Balance remaining: 6.0 days",
    date: "10 mins ago",
    priority: "High",
    category: "Leave"
  },
  {
    id: "APPR-102",
    type: "Biometric Attendance Regularization",
    requester: "Vikram Malhotra",
    role: "Senior Backend Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    details: "Missed evening punch due to Matrix Door Controller 02 power cycling on Nov 14 (Claimed Out: 06:15 PM)",
    date: "1 hour ago",
    priority: "Medium",
    category: "Attendance"
  },
  {
    id: "APPR-103",
    type: "Overtime (OT) Approval",
    requester: "Siddharth Verma",
    role: "Plant Operations Supervisor",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    details: "Weekend Plant Equipment Maintenance Shift • 4.5 OT Hours at Hyderabad Hub",
    date: "2 hours ago",
    priority: "High",
    category: "Attendance"
  },
  {
    id: "APPR-104",
    type: "Expense Reimbursement",
    requester: "Rohan Patel",
    role: "DevOps & Infrastructure",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    details: "On-site Client Visit Transport & Meals • Total Claim: ₹ 4,850.00",
    date: "3 hours ago",
    priority: "Low",
    category: "Finance"
  }
];

export function Inbox() {
  const { currentUser: authUser, storeData, hrmStore, currentPortal } = useAuth();

  // Strictly follow top-header portal mode (EMPLOYEE, HR ADMIN, GLOBAL ADMIN)
  const isEmployee = currentPortal === 'EMPLOYEE';
  const isManagerOrAdmin = currentPortal === 'HR' || currentPortal === 'GLOBAL_ADMIN';

  const [personalTasks, setPersonalTasks] = useState(initialPersonalTasks);

  // Status updates of the employee's own submitted requests (Leave & Attendance Regularization)
  const mySubmittedRequests = useMemo(() => {
    const leaves = (storeData?.leaveRequests || [])
      .filter(r => r.employeeId === authUser?.id || r.employeeId === authUser?.employeeId || r.employeeName === authUser?.name)
      .map(r => ({
        id: r.id,
        type: `Leave Request (${r.type || r.leaveType || 'Leave'})`,
        title: `${r.type || r.leaveType || 'Leave'} Application (${r.days || r.totalDays || 1} Days)`,
        details: `Dates: ${r.startDate || r.fromDate} to ${r.endDate || r.toDate} • Reason: "${r.reason}" • Status: ${r.status}`,
        deadline: r.appliedOn || 'Submitted Recently',
        priority: r.status === 'Pending' ? 'High' : 'Normal',
        category: 'My Requests',
        status: r.status,
        isMyRequest: true,
        actionLabel: r.status === 'Pending' ? 'Pending Approval' : 'View Details'
      }));

    const corrections = (storeData?.attendanceCorrections || [])
      .filter(c => c.employeeId === authUser?.id || c.employeeId === authUser?.employeeId)
      .map(c => ({
        id: c.id,
        type: 'Attendance Regularization',
        title: `Regularization Request (${c.type || 'Missing Punch'})`,
        details: `Date: ${c.date} • Claimed: ${c.time || c.punchTime || '09:00 AM'} • Status: ${c.status}`,
        deadline: c.date,
        priority: c.status === 'Pending' ? 'High' : 'Normal',
        category: 'My Requests',
        status: c.status,
        isMyRequest: true,
        actionLabel: c.status === 'Pending' ? 'Pending Approval' : 'View Details'
      }));

    return [...leaves, ...corrections];
  }, [storeData?.leaveRequests, storeData?.attendanceCorrections, authUser]);

  // Combined personal items for employee
  const allEmployeeInboxItems = useMemo(() => {
    return [...personalTasks, ...mySubmittedRequests];
  }, [personalTasks, mySubmittedRequests]);
  
  // Real dynamic pending approvals from store
  const storePendingApprovals = (storeData?.leaveRequests || [])
    .filter(r => r.status === 'Pending')
    .map(r => ({
      id: r.id,
      type: 'Leave Approval',
      requester: r.employeeName,
      role: r.department,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      details: `${r.totalDays} Days ${r.leaveType} (${r.fromDate} - ${r.toDate}) • Reason: "${r.reason}"`,
      date: 'Just now',
      priority: 'High',
      category: 'Leave',
      isStoreItem: true,
      raw: r
    }));

  const [teamApprovals, setTeamApprovals] = useState(initialTeamApprovals);
  const combinedTeamApprovals = [...storePendingApprovals, ...teamApprovals.filter(a => !storePendingApprovals.some(s => s.id === a.id))];
  
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [hrFilter, setHrFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Actions for Normal Employee Personal Tasks
  const handleCompletePersonalTask = (taskId, taskTitle) => {
    setPersonalTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedItem?.id === taskId) setSelectedItem(null);
    showToast(`Completed: "${taskTitle}". Your compliance record has been updated.`);
  };

  // Actions for HR/Admin Team Approvals
  const handleApproveTeamRequest = (apprId, requester) => {
    const isStore = storePendingApprovals.some(s => s.id === apprId);
    if (isStore) {
      try {
        hrmStore.approveLeaveRequest(apprId, authUser?.id || 'PE002', authUser?.name || 'HR Admin', 'Approved from Inbox approval queue');
        showToast(`Approved leave request for ${requester}. Synchronized across HR & Admin dashboards.`);
      } catch (e) {
        alert(e.message);
      }
    } else {
      setTeamApprovals(prev => prev.filter(a => a.id !== apprId));
      showToast(`Approved request from ${requester}. Synchronized with Biometric/Payroll engine.`);
    }
    if (selectedItem?.id === apprId) setSelectedItem(null);
  };

  const handleRejectTeamRequest = (apprId, requester) => {
    const isStore = storePendingApprovals.some(s => s.id === apprId);
    if (isStore) {
      const reason = prompt(`Enter rejection reason for ${requester}'s leave:`, 'Work constraints');
      if (reason) {
        try {
          hrmStore.rejectLeaveRequest(apprId, authUser?.id || 'PE002', authUser?.name || 'HR Admin', reason);
          showToast(`Rejected request from ${requester}. Requester notified.`);
        } catch (e) {
          alert(e.message);
        }
      }
    } else {
      setTeamApprovals(prev => prev.filter(a => a.id !== apprId));
      showToast(`Rejected request from ${requester}. Requester has been notified.`);
    }
    if (selectedItem?.id === apprId) setSelectedItem(null);
  };

  // Filtered Lists
  const filteredPersonalTasks = employeeFilter === 'All'
    ? allEmployeeInboxItems
    : allEmployeeInboxItems.filter(t => t.category.toLowerCase() === employeeFilter.toLowerCase());

  const filteredTeamApprovals = hrFilter === 'All'
    ? combinedTeamApprovals
    : combinedTeamApprovals.filter(a => a.category.toLowerCase() === hrFilter.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl animate-fade-in border border-slate-700">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card with Context */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEmployee ? "My Action Items & Personal Tasks" : "Management Approval Queue"}
              </h1>
              
              {/* Active Role Indicator Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isEmployee 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : currentPortal === 'GLOBAL_ADMIN'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {isEmployee ? 'Employee Mode' : currentPortal === 'GLOBAL_ADMIN' ? 'Global Admin Mode' : 'HR Admin Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {isEmployee 
                ? "Personal action items, compliance sign-offs, and status updates on your submitted requests."
                : `Review and decide on pending requests (Leave, OT, and Attendance) submitted by team members.`
              }
            </p>
          </div>

          {/* Active Portal Indicator (Strictly driven by main top-header portal) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>Active Portal: <strong className="text-slate-800">{isEmployee ? 'Employee' : currentPortal === 'GLOBAL_ADMIN' ? 'Global Admin' : 'HR Admin'}</strong></span>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {isEmployee ? (
              // Employee Filter Chips
              ['All', 'Policy', 'Attendance', 'Tax & Finance', 'Performance', 'My Requests'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEmployeeFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    employeeFilter === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))
            ) : (
                <button
                  key={cat}
                  onClick={() => setEmployeeFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    employeeFilter === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))
            ) : (
              // HR / Admin Filter Chips
              ['All', 'Leave', 'Attendance', 'Finance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHrFilter(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    hrFilter === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {isEmployee 
              ? `${filteredPersonalTasks.length} personal task(s) remaining`
              : `${filteredTeamApprovals.length} team request(s) awaiting approval`
            }
          </span>
        </div>
      </div>

      {/* Main Grid: List on Left (2 Cols) + Context/Action Preview on Right (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================== */}
        {/* VIEW 1: NORMAL EMPLOYEE INBOX (ONLY PERSONAL TASKS)        */}
        {/* ========================================================== */}
        {isEmployee && (
          <div className="lg:col-span-2 space-y-3">
            {filteredPersonalTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-3 text-sm font-bold text-slate-900">All Personal Tasks Done!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You have no pending policy sign-offs, missing punches, or personal action items.
                </p>
              </div>
            ) : (
              filteredPersonalTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedItem(task)}
                  className={`group cursor-pointer rounded-2xl border p-4 transition ${
                    selectedItem?.id === task.id
                      ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
                        {task.category === 'Policy' ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : task.category === 'Attendance' ? (
                          <Clock className="h-5 w-5" />
                        ) : task.category === 'Tax & Finance' ? (
                          <DollarSign className="h-5 w-5" />
                        ) : task.category === 'My Requests' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <Award className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-500">{task.id}</span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {task.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {task.details}
                        </p>

                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.deadline}</span>
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 font-semibold text-[10px]">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Employee Action Button or Request Status Badge */}
                    <div className="self-end sm:self-center shrink-0">
                      {task.isMyRequest ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          task.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : task.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {task.status === 'Approved' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : task.status === 'Pending' ? (
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          )}
                          <span>{task.status}</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompletePersonalTask(task.id, task.title);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          <span>{task.actionLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 2: HR / ADMIN MANAGEMENT APPROVAL QUEUE               */}
        {/* ========================================================== */}
        {isManagerOrAdmin && (
          <div className="lg:col-span-2 space-y-3">
            {filteredTeamApprovals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-3 text-sm font-bold text-slate-900">Approval Queue Empty!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All employee leave requests, biometric regularizations, and OT claims have been decided.
                </p>
              </div>
            ) : (
              filteredTeamApprovals.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedItem(req)}
                  className={`group cursor-pointer rounded-2xl border p-4 transition ${
                    selectedItem?.id === req.id
                      ? 'border-purple-500 bg-purple-50/30 ring-1 ring-purple-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={req.avatar}
                        alt={req.requester}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0 mt-0.5"
                      />

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {req.type}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.priority} Priority
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {req.date}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          Applicant: <span className="text-brand-700">{req.requester}</span> ({req.role})
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {req.details}
                        </p>
                      </div>
                    </div>

                    {/* HR/Admin Decision Actions (Approve / Reject) */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectTeamRequest(req.id, req.requester);
                        }}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                        title="Reject Request"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveTeamRequest(req.id, req.requester);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
                        title="Approve Request"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Right Preview Drawer / Policy Compliance Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-fit sticky top-20 space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEmployee ? "Task Summary & Guidelines" : "Audit Context & Approval Rules"}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {selectedItem ? selectedItem.id : "No selection"}
            </span>
          </div>

          {selectedItem ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Title / Type:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {isEmployee ? selectedItem.title : selectedItem.type}
                </p>
              </div>

              {!isEmployee && (
                <div>
                  <span className="text-slate-400">Applicant:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedItem.requester} ({selectedItem.role})
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-400">Description & Details:</span>
                <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedItem.details}
                </p>
              </div>

              {/* Action Buttons inside Drawer */}
              <div className="pt-2">
                {isEmployee ? (
                  <button
                    onClick={() => handleCompletePersonalTask(selectedItem.id, selectedItem.title)}
                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 py-2.5 text-xs font-bold text-white shadow-xs transition"
                  >
                    {selectedItem.actionLabel || "Complete Task"}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectTeamRequest(selectedItem.id, selectedItem.requester)}
                      className="flex-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 py-2 text-xs font-bold text-rose-700 transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveTeamRequest(selectedItem.id, selectedItem.requester)}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-xs transition"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {isEmployee 
                ? "Select any personal task on the left to review instructions, deadline, and policy notes."
                : "Select an employee request to preview leave balances, punch records, or travel receipts."
              }
            </div>
          )}

          <div className="border-t border-slate-100 pt-3">
            <p className="text-[11px] font-bold text-slate-700">
              {isEmployee ? "Policy Compliance Notice" : "SLA Guarantee Notice"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {isEmployee
                ? "Personal tasks are governed by Prashanth Enterprises IT Policy-2025. Mandatory tasks must be acknowledged before quarterly audits."
                : "All managerial approvals automatically update employee records in the Matrix biometric server within 60 seconds."
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Inbox;

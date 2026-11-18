import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Plus, 
  FileText, 
  Filter, 
  Building2, 
  Activity,
  Check,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function HrDashboard({ navigateToTab }) {
  const { storeData, currentUser, hrmStore, permissions } = useAuth();
  const [actionToast, setActionToast] = useState(null);

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Aggregated Metrics
  const activeEmployees = storeData.employees.filter(e => e.status === 'Active');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = storeData.attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late Arrival').length;
  const lateCount = todayAttendance.filter(a => a.isLate).length;
  const onLeaveCount = todayAttendance.filter(a => a.status === 'On Approved Leave').length;
  const pendingLeaves = storeData.leaveRequests.filter(r => r.status === 'Pending');
  const pendingCorrections = storeData.attendanceCorrections.filter(c => c.status === 'Pending');
  const activeJobs = storeData.recruitmentJobs.filter(j => j.status === 'Active');

  const handleQuickApproveLeave = (leaveId, empName, days, type) => {
    try {
      hrmStore.approveLeaveRequest(leaveId, currentUser.id, currentUser.name, 'Quick approved from HR Dashboard');
      showToast(`Approved ${days} days ${type} for ${empName}. Balance deducted atomically.`);
    } catch (err) {
      alert(`Error approving leave: ${err.message}`);
    }
  };

  const handleQuickRejectLeave = (leaveId, empName) => {
    const reason = prompt(`Enter rejection reason for ${empName}'s leave application:`, 'Work requirements / coverage unavailable');
    if (reason) {
      try {
        hrmStore.rejectLeaveRequest(leaveId, currentUser.id, currentUser.name, reason);
        showToast(`Rejected leave for ${empName}. Pending reservation released.`);
      } catch (err) {
        alert(`Error rejecting leave: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Feedback */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                HR Admin Portal
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Matrix Intranet Synced
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Human Resources Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce oversight, live attendance sync, leave approval workflows, payroll processing, and multi-branch operations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/hr/employees"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </Link>
            <Link
              to="/hr/leaves"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Leave Requests ({pendingLeaves.length})</span>
            </Link>
            <Link
              to="/hr/attendance"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Attendance ({lateCount} Late)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Active Workforce</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900">{activeEmployees.length}</p>
            <span className="text-[11px] font-medium text-slate-500">across 3 hubs</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>HYD: {storeData.employees.filter(e => e.branchId === 'HYD').length}</span>
            <span>•</span>
            <span>CHE: {storeData.employees.filter(e => e.branchId === 'CHE').length}</span>
            <span>•</span>
            <span>MUM: {storeData.employees.filter(e => e.branchId === 'MUM').length}</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Present Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
            <span className="text-[11px] font-medium text-slate-500">
              ({Math.round((presentCount / Math.max(1, activeEmployees.length)) * 100)}% attendance)
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-amber-600 border-t border-slate-100 pt-2">
            ⚠️ {lateCount} Late arrivals ({lateCount > 0 ? '> 09:15 AM' : 'None'})
          </p>
        </div>

        {/* Leaves Pending */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Pending Leave Approvals</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-amber-600">{pendingLeaves.length}</p>
            <span className="text-[11px] font-medium text-slate-500">applications</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>On leave today: <strong>{onLeaveCount}</strong></span>
            <Link to="/hr/leaves" className="text-brand-600 font-semibold hover:underline">Review &rarr;</Link>
          </p>
        </div>

        {/* Recruitment Vacancies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Active Openings</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-purple-600">{activeJobs.length}</p>
            <span className="text-[11px] font-medium text-slate-500">positions open</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Candidates in pipeline: <strong>{storeData.candidates.length}</strong></span>
            <Link to="/hr/recruitment" className="text-brand-600 font-semibold hover:underline">Hiring &rarr;</Link>
          </p>
        </div>
      </div>

      {/* Main Two-Column Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Actionable Pending Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Leave Approval Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Pending Leave Approval Queue
                </h2>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  {pendingLeaves.length} Action Needed
                </span>
              </div>
              <Link to="/hr/leaves" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View All &rarr;
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All leave applications have been reviewed. Zero pending requests.
                </div>
              ) : (
                pendingLeaves.map((req) => (
                  <div 
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{req.employeeName}</span>
                        <span className="text-[10px] font-semibold text-slate-500">({req.employeeId})</span>
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {req.leaveType}
                        </span>
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                          {req.branch}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>{req.totalDays} day(s)</strong>: {req.fromDate} to {req.toDate}
                      </p>
                      <p className="text-[11px] text-slate-500 italic">
                        Reason: "{req.reason}" • Balance at submission: {req.availableBalanceAtSubmission} days
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleQuickApproveLeave(req.id, req.employeeName, req.totalDays, req.leaveType)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition"
                        title="Approve and deduct balance atomically"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleQuickRejectLeave(req.id, req.employeeName)}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        title="Reject and release pending reservation"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Attendance Corrections */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Biometric Attendance Corrections
                </h2>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                  {pendingCorrections.length} Pending
                </span>
              </div>
              <Link to="/hr/attendance" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Attendance Console &rarr;
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {pendingCorrections.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No pending biometric correction requests.
                </div>
              ) : (
                pendingCorrections.map((corr) => (
                  <div key={corr.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {corr.employeeName} ({corr.branch}) — {corr.date}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Claimed {corr.punchType}: <strong className="text-brand-600">{corr.requestedTime}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{corr.reason}"</p>
                    </div>
                    <Link
                      to="/hr/attendance"
                      className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Resolve &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Branch Summary & System Audit */}
        <div className="space-y-6">
          {/* Multi-Branch Status Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-brand-600" />
              <span>Branch Presence Overview</span>
            </h2>
            <div className="space-y-3">
              {storeData.branches.map((b) => {
                const branchEmps = storeData.employees.filter(e => e.branchId === b.id);
                const branchAtt = storeData.attendance.filter(a => a.branchId === b.id && a.date === todayStr);
                const branchPresent = branchAtt.filter(a => a.status === 'Present' || a.status === 'Late Arrival').length;
                return (
                  <div key={b.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{b.name} Hub</p>
                      <span className="text-[10px] font-mono font-semibold text-slate-500">{b.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{b.type}</p>
                    <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
                      <span className="text-slate-600">Headcount: <strong>{branchEmps.length}</strong></span>
                      <span className="text-emerald-600 font-semibold">Present: {branchPresent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Audit Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-brand-600" />
              <span>Recent HR Audit Trail</span>
            </h2>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {storeData.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-brand-500 pl-3 py-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By: {log.user}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center">
              <Link to="/hr/settings" className="text-xs font-semibold text-brand-600 hover:underline">
                View Immutable Audit Ledger &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HrDashboard;

import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  User, 
  MapPin, 
  ShieldCheck, 
  Check, 
  X, 
  ChevronRight, 
  Plus, 
  FileText, 
  TrendingUp, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getVerifiedEmployeeLedger } from '../../services/leaveCalculationService.js';

export function LeaveManagement() {
  const { storeData, hrmStore, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'ledger' | 'policies'
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Modal State for Reject with Reason
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunGlobalReconciliation = () => {
    try {
      const report = hrmStore.reconcileAllEmployeeLeaves(currentUser?.id || 'HR', currentUser?.name || 'HR Admin');
      showToast(`Global audit reconciled! ${report.totalEmployees} employees across Hyderabad, Chennai, and Mumbai verified.`);
    } catch (err) {
      alert('Error running global reconciliation: ' + err.message);
    }
  };

  // Filter Leave Applications
  const filteredRequests = storeData.leaveRequests.filter((req) => {
    const matchesSearch = 
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesBranch = selectedBranch === 'ALL' || req.branchId === selectedBranch;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // KPI Calculations
  const pendingCount = storeData.leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = storeData.leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = storeData.leaveRequests.filter(r => r.status === 'Rejected').length;
  const onLeaveToday = storeData.attendance.filter(a => a.status === 'On Approved Leave').length;

  // Actions
  const handleApprove = (req) => {
    try {
      hrmStore.approveLeaveRequest(req.id, currentUser.id, currentUser.name, 'Approved by HR Administrator');
      showToast(`Approved ${req.totalDays} day(s) ${req.leaveType} for ${req.employeeName}. Balance deducted atomically.`);
    } catch (err) {
      alert(`Approval Failed: ${err.message}`);
    }
  };

  const handleOpenReject = (req) => {
    setRejectModalReq(req);
    setRejectionReason('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    try {
      hrmStore.rejectLeaveRequest(rejectModalReq.id, currentUser.id, currentUser.name, rejectionReason);
      showToast(`Rejected leave request for ${rejectModalReq.employeeName}. Reserved balance released.`);
      setRejectModalReq(null);
    } catch (err) {
      alert(`Rejection Failed: ${err.message}`);
    }
  };

  const handleCancel = (req) => {
    const reason = prompt(`Reason for cancelling leave for ${req.employeeName}:`, 'Employee cancelled leave plan');
    if (reason) {
      try {
        hrmStore.cancelLeaveRequest(req.id, currentUser.id, currentUser.name, reason);
        showToast(`Cancelled leave for ${req.employeeName}. Balance restored to ledger.`);
      } catch (err) {
        alert(`Cancellation Failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 uppercase">
                Leave Master
              </span>
              <span className="text-xs text-slate-500">• Atomic Ledger Enabled</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Leave Management & Approvals</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review employee applications, manage statutory entitlements, inspect atomic balance ledgers, and maintain audit records.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('applications')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'applications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applications ({storeData.leaveRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Balance Ledger
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'policies' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Policies & Rules
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Action required by HR/Manager</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Approved Applications</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Deducted from leave ledger</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Currently On Leave Today</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{onLeaveToday}</p>
          <p className="text-[11px] text-slate-400 mt-1">Synced to daily attendance</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Rejected Applications</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{rejectedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Reservations released to balance</p>
        </div>
      </div>

      {/* Tab 1: Leave Applications & Approvals */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['Pending', 'Approved', 'Rejected', 'ALL'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Applications' : st}
                  {st === 'Pending' && pendingCount > 0 && ` (${pendingCount})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All Hubs</option>
                <option value="HYD">Hyderabad</option>
                <option value="CHE">Chennai</option>
                <option value="MUM">Mumbai</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Branch & Dept</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Leave Duration</th>
                    <th className="py-3 px-4">Total Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        No leave applications match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition">
                        {/* Employee */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{req.employeeName}</p>
                          <p className="text-[11px] font-mono text-slate-500">{req.employeeId}</p>
                        </td>

                        {/* Branch */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{req.department}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {req.branch}
                          </span>
                        </td>

                        {/* Leave Type */}
                        <td className="py-3 px-4">
                          <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {req.leaveType}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {req.fromDate} to {req.toDate}
                        </td>

                        {/* Days */}
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {req.totalDays} day(s)
                        </td>

                        {/* Reason */}
                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={req.reason}>
                          {req.reason}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              req.status === 'Approved' ? 'bg-emerald-500' :
                              req.status === 'Pending' ? 'bg-amber-500' :
                              req.status === 'Rejected' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}></span>
                            {req.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprove(req)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs transition"
                                title="Approve Leave and Deduct Balance"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenReject(req)}
                                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                                title="Reject Leave and Release Reservation"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : req.status === 'Approved' ? (
                            <button
                              onClick={() => handleCancel(req)}
                              className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
                              title="Cancel Approved Leave & Restore Balance"
                            >
                              Cancel Leave
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Atomic Leave Balances & Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Atomic Leave Balance Ledger (Opening + Accrued - Approved = Available)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Real-time calculation ledger guaranteed by transactional deductions and pending reservations.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Opening</th>
                    <th className="py-3 px-4">Accrued</th>
                    <th className="py-3 px-4">Approved Deductions</th>
                    <th className="py-3 px-4">Pending Reservations</th>
                    <th className="py-3 px-4">Available Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeData.employees.map((emp) => {
                    const ledger = storeData.leaveLedger[emp.id] || storeData.leaveLedger['PE001'];
                    if (!ledger) return null;
                    return Object.entries(ledger).map(([code, bal]) => (
                      <tr key={`${emp.id}-${code}`} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {emp.name} ({emp.employeeId})
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                            {code}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono">{bal.opening}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-600">+{bal.accrued}</td>
                        <td className="py-2.5 px-4 font-mono text-rose-600">-{bal.approvedDeductions}</td>
                        <td className="py-2.5 px-4 font-mono text-amber-600">
                          {bal.pendingReservations > 0 ? `(${bal.pendingReservations} Reserved)` : '0'}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-brand-600 text-sm">
                          {bal.available} days
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Company Leave Policies */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeData.leavePolicies.map((pol) => (
            <div key={pol.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-bold text-brand-700">
                  {pol.code}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {pol.daysPerYear > 0 ? `${pol.daysPerYear} Days / Yr` : 'Event Based'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{pol.name}</h3>
              <p className="text-xs text-slate-600">{pol.description}</p>
              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
                <p>Max Consecutive: <strong>{pol.maxConsecutive} days</strong></p>
                <p>Carry Forward Cap: <strong>{pol.carryForwardLimit} days</strong></p>
                <p>Paid Status: <strong>{pol.paid ? 'Paid Full Salary' : 'Loss of Pay'}</strong></p>
                <p>Medical Proof Required: <strong>{pol.requiresDoc ? 'Yes (>2 days)' : 'No'}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Reject Leave Application</h3>
              <button onClick={() => setRejectModalReq(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rejecting <strong>{rejectModalReq.employeeName}'s</strong> application for{' '}
              <strong>{rejectModalReq.totalDays} day(s)</strong> of {rejectModalReq.leaveType}. This will release the{' '}
              <strong>{rejectModalReq.totalDays} reserved day(s)</strong> back to their available balance.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandatory Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Critical project milestone scheduled during this period; please coordinate with team lead."
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Calendar, 
  Receipt, 
  FileCheck, 
  User, 
  ShieldCheck, 
  Check, 
  X, 
  Search,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function HrApprovals() {
  const { storeData, hrmStore, currentUser } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Pending Leaves
  const pendingLeaves = storeData.leaveRequests.filter(r => r.status === 'Pending').map(r => ({
    id: r.id,
    type: 'Leave Approval',
    category: 'LEAVE',
    requester: r.employeeName,
    employeeId: r.employeeId,
    branch: r.branch,
    title: `${r.totalDays} Days ${r.leaveType}`,
    details: `${r.fromDate} to ${r.toDate} • Reason: "${r.reason}"`,
    date: r.appliedAt,
    raw: r
  }));

  // 2. Pending Attendance Corrections
  const pendingCorrections = storeData.attendanceCorrections.filter(c => c.status === 'Pending').map(c => ({
    id: c.id,
    type: 'Attendance Regularization',
    category: 'ATTENDANCE',
    requester: c.employeeName,
    employeeId: c.employeeId,
    branch: c.branch,
    title: `Missed Punch Adjustment (${c.date})`,
    details: `Claimed ${c.punchType} at ${c.requestedTime} • Reason: "${c.reason}"`,
    date: c.submittedAt,
    raw: c
  }));

  const allItems = [...pendingLeaves, ...pendingCorrections].filter(item => 
    categoryFilter === 'ALL' || item.category === categoryFilter
  );

  const handleApprove = (item) => {
    try {
      if (item.category === 'LEAVE') {
        hrmStore.approveLeaveRequest(item.id, currentUser.id, currentUser.name, 'Approved from HR Approvals Queue');
        showToast(`Approved leave application for ${item.requester}. Balance updated atomically.`);
      } else if (item.category === 'ATTENDANCE') {
        hrmStore.correctAttendance({
          recordId: item.raw.id,
          employeeId: item.raw.employeeId,
          correctedOut: '06:15 PM',
          correctedStatus: 'Present',
          reason: item.raw.reason,
          hrUserId: currentUser.id,
          hrUserName: currentUser.name
        });
        showToast(`Regularized punch for ${item.requester}. Audit entry appended.`);
      }
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = (item) => {
    const reason = prompt(`Rejection reason for ${item.requester}:`, 'Documentation insufficient or schedule conflict');
    if (reason) {
      try {
        if (item.category === 'LEAVE') {
          hrmStore.rejectLeaveRequest(item.id, currentUser.id, currentUser.name, reason);
          showToast(`Rejected leave for ${item.requester}. Reserved balance restored.`);
        }
      } catch (err) {
        alert(`Rejection error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
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
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 uppercase">
                Approvals Engine
              </span>
              <span className="text-xs text-slate-500">• {allItems.length} Pending Actions</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Multi-Category Approvals Queue</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified inbox for managing leave requests, biometric punch regularizations, overtime authorizations, and claims.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'LEAVE', 'ATTENDANCE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Approvals' : cat === 'LEAVE' ? 'Leaves Only' : 'Attendance Only'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
        {allItems.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-bold text-slate-800 text-sm">Approvals Queue is Clear!</p>
            <p className="text-slate-400 mt-0.5">All pending tasks across departments and branches have been processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => (
              <div 
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.requester}</span>
                    <span className="text-[11px] font-mono text-slate-500">({item.employeeId})</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      item.category === 'LEAVE' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.type}
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                      {item.branch}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500 italic">{item.details}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApprove(item)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HrApprovals;

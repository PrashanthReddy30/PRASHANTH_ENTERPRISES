import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  MapPin, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Lock, 
  Eye,
  FileCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export function GlobalAdminDashboard() {
  const { storeData, currentUser, permissions, selectedBranchFilter, setSelectedBranchFilter } = useAuth();

  // Selected Branch Filter: 'ALL' | 'HYD' | 'CHE' | 'MUM'
  const currentBranch = selectedBranchFilter;

  // Filter entities according to currentBranch
  const filteredEmployees = storeData.employees.filter(e => currentBranch === 'ALL' || e.branchId === currentBranch);
  const activeEmployees = filteredEmployees.filter(e => e.status === 'Active');
  const inactiveEmployees = filteredEmployees.filter(e => e.status !== 'Active');

  const todayStr = new Date().toISOString().split('T')[0];
  const branchAttendance = storeData.attendance.filter(a => (currentBranch === 'ALL' || a.branchId === currentBranch) && a.date === todayStr);
  const presentCount = branchAttendance.filter(a => a.status === 'Present' || a.status === 'Late Arrival').length;
  const lateCount = branchAttendance.filter(a => a.isLate).length;
  const onLeaveCount = branchAttendance.filter(a => a.status === 'On Approved Leave').length;
  const absentCount = Math.max(0, activeEmployees.length - presentCount - onLeaveCount);

  const branchLeaves = storeData.leaveRequests.filter(r => currentBranch === 'ALL' || r.branchId === currentBranch);
  const pendingLeaves = branchLeaves.filter(r => r.status === 'Pending');
  const approvedLeaves = branchLeaves.filter(r => r.status === 'Approved');
  const rejectedLeaves = branchLeaves.filter(r => r.status === 'Rejected');

  // Payroll aggregation for the branch
  const activePayroll = storeData.payrollRuns[0] || {};
  let branchGross = 0;
  let branchNet = 0;
  let branchDeductions = 0;

  if (currentBranch === 'ALL') {
    branchGross = activePayroll.totalGross || 0;
    branchNet = activePayroll.totalNet || 0;
    branchDeductions = activePayroll.totalDeductions || 0;
  } else if (activePayroll.branchBreakdown && activePayroll.branchBreakdown[currentBranch]) {
    const b = activePayroll.branchBreakdown[currentBranch];
    branchGross = b.gross;
    branchNet = b.net;
    branchDeductions = b.deductions;
  }

  // Verification of Global Admin role
  if (!permissions.isGlobalAdmin) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-8 text-center space-y-3">
        <Lock className="h-10 w-10 text-purple-600 mx-auto" />
        <h2 className="text-base font-bold text-purple-900">Global Admin Authorization Required</h2>
        <p className="text-xs text-purple-700 max-w-md mx-auto">
          The Global Admin Control Center is restricted to corporate executive officers. Please switch your persona to Prashanth Reddy (Global Admin) from the top bar to inspect this portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top HUD Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                Corporate Governance Center
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Matrix Intranet Network: 100% Operational
              </span>
            </div>
            <h1 className="text-2xl font-extrabold mt-1 tracking-tight">
              Global Admin Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time enterprise overview across Hyderabad, Chennai, and Mumbai hubs. Unified synchronized Firestore operations with strict multi-branch authorization.
            </p>
          </div>

          {/* Branch Filter Switcher Buttons (HYD | CHE | MUM | ALL) */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white/10 p-1.5 backdrop-blur-md border border-white/10">
            {[
              { id: 'ALL', label: 'All Branches' },
              { id: 'HYD', label: 'Hyderabad' },
              { id: 'CHE', label: 'Chennai' },
              { id: 'MUM', label: 'Mumbai' }
            ].map((br) => (
              <button
                key={br.id}
                onClick={() => setSelectedBranchFilter(br.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  currentBranch === br.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {br.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Filter Indicator */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-400" />
            <span>Active Geographic Scope: <strong className="text-white">{currentBranch === 'ALL' ? 'Company-Wide (All Hubs)' : `${currentBranch} Regional Hub`}</strong></span>
          </div>
          <span>Refreshed: Real-time Listener Active</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Total Workforce</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{filteredEmployees.length}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span className="text-emerald-600 font-semibold">{activeEmployees.length} Active</span>
            <span>•</span>
            <span className="text-slate-400">{inactiveEmployees.length} Inactive</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Present Today</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{presentCount}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] border-t border-slate-100 pt-2">
            <span className="text-amber-600 font-medium">⚠️ {lateCount} Late Arrivals</span>
            <span className="text-slate-500">{activeEmployees.length > 0 ? Math.round((presentCount / activeEmployees.length) * 100) : 0}%</span>
          </div>
        </div>

        {/* On Approved Leave Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">On Approved Leave</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{onLeaveCount}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Pending Approvals: <strong className="text-amber-600">{pendingLeaves.length}</strong></span>
          </div>
        </div>

        {/* Disbursed Payroll Net */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Monthly Net Payroll</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">₹ {branchNet.toLocaleString()}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Gross: ₹{branchGross.toLocaleString()}</span>
            <span className="text-emerald-600 font-semibold">{activePayroll.status || 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Branch Breakdown Comparative Matrix */}
      {currentBranch === 'ALL' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-600" />
            <span>Regional Hub Performance Comparison (Hyderabad vs. Chennai vs. Mumbai)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storeData.branches.map((b) => {
              const bEmps = storeData.employees.filter(e => e.branchId === b.id);
              const bAtt = storeData.attendance.filter(a => a.branchId === b.id && a.date === todayStr);
              const bPresent = bAtt.filter(a => a.status === 'Present' || a.status === 'Late Arrival').length;
              const bLeaves = storeData.leaveRequests.filter(r => r.branchId === b.id && r.status === 'Pending').length;
              const bPayroll = (activePayroll.branchBreakdown && activePayroll.branchBreakdown[b.id]) || { net: 0, gross: 0 };

              return (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{b.name} Hub</h3>
                      <p className="text-[11px] text-slate-500">{b.type}</p>
                    </div>
                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">
                      {b.code}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Headcount:</span>
                      <strong className="text-slate-900">{bEmps.length} personnel</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Present Today:</span>
                      <strong className="text-emerald-600">{bPresent} ({bEmps.length > 0 ? Math.round((bPresent / bEmps.length) * 100) : 0}%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pending Leave Approvals:</span>
                      <strong className={bLeaves > 0 ? "text-amber-600" : "text-slate-700"}>{bLeaves}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Net Payroll:</span>
                      <strong className="text-slate-900">₹ {bPayroll.net.toLocaleString()}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBranchFilter(b.id)}
                    className="w-full text-center py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition"
                  >
                    Filter into {b.name} &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time System Audit Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Company-Wide Immutable Audit Stream
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Real-time Firestore Event Sourcing
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {storeData.auditLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-800">{log.module}</span>
                  <span className="text-[10px] text-slate-400 font-mono">By: {log.user} ({log.userId})</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GlobalAdminDashboard;

import React, { useState } from 'react';
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
  FileText,
  UserCheck,
  Send,
  X
} from 'lucide-react';
import { currentUser, matrixBiometricStatus, leaveBalances } from '../data/mockData';

export function Me() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showPartialDayModal, setShowPartialDayModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Form states
  const [dutyReason, setDutyReason] = useState('');
  const [dutyLocation, setDutyLocation] = useState('');
  const [leaveType, setLeaveType] = useState('Privilege Leave (PL)');
  const [leaveDays, setLeaveDays] = useState('1');

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

  const handleApplyLeave = (e) => {
    e.preventDefault();
    alert(`Leave application for ${leaveDays} day(s) under ${leaveType} submitted.`);
    setShowLeaveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Emp ID: <span className="font-mono text-slate-700 font-semibold">{currentUser.id}</span> • 
                Biometric ID: <span className="font-mono text-emerald-600 font-semibold">{currentUser.biometricId}</span>
              </p>
              <p className="text-xs text-slate-500">
                Department: <span className="font-medium text-slate-700">{currentUser.department}</span> • Joined {currentUser.joiningDate}
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

        {/* Tab Navigation */}
        <div className="mt-6 flex overflow-x-auto border-b border-slate-200 gap-1 sm:gap-2">
          {[
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'leave', label: 'Leave (Apply & Balance)', icon: Calendar },
            { id: 'performance', label: 'Performance', icon: Award },
            { id: 'expenses', label: 'Expenses & Travel', icon: Receipt },
            { id: 'apps', label: 'Apps & Tools', icon: Grid },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600'
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

      {/* Tab 1: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Biometric Push Status Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                  Matrix Biometric Push Service Connected
                </h3>
                <p className="text-xs text-emerald-800">
                  Connected device: <span className="font-semibold">{matrixBiometricStatus.deviceName}</span> ({matrixBiometricStatus.ipAddress}). Punches are pushed in real-time to the intranet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
                PUNCH SYNC: LIVE
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-medium text-slate-500">Today's First Punch</p>
              <p className="mt-1 text-lg font-bold text-slate-900">09:12 AM</p>
              <p className="text-[10px] text-emerald-600 font-medium">On-time (Grace: 15m)</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-medium text-slate-500">Effective Hours Today</p>
              <p className="mt-1 text-lg font-bold text-brand-600">9h 03m</p>
              <p className="text-[10px] text-slate-500 font-medium">Shift Target: 9h 00m</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-medium text-slate-500">Monthly Avg Hours</p>
              <p className="mt-1 text-lg font-bold text-slate-900">8h 54m</p>
              <p className="text-[10px] text-emerald-600 font-medium">98.4% Compliance</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-medium text-slate-500">Shift Window</p>
              <p className="mt-1 text-sm font-bold text-slate-900">09:00 - 18:00</p>
              <p className="text-[10px] text-slate-500 font-medium">General Office Shift</p>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Attendance Logs (Matrix Synced)</h3>
              <button 
                onClick={() => alert("Exporting monthly attendance sheet in Excel format...")}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Log</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">In Time</th>
                    <th className="py-3 px-4">Out Time</th>
                    <th className="py-3 px-4">Effective Hours</th>
                    <th className="py-3 px-4">Punch Terminal</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLog.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.date}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-medium">{log.in}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{log.out}</td>
                      <td className="py-3 px-4 font-medium">{log.hours}</td>
                      <td className="py-3 px-4 text-slate-500">{log.source}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status.includes('Present') 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : log.status.includes('Late') 
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Policy Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Prashanth Enterprises Attendance Policy Overview</span>
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">15-Minute Grace Period</p>
                <p className="mt-1 text-slate-500">Allowed up to 09:15 AM up to 3 times per calendar month without penalty.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">Regularization Window</p>
                <p className="mt-1 text-slate-500">Missing biometric punches must be regularized within 3 working days.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">Minimum Hours</p>
                <p className="mt-1 text-slate-500">Half day requires minimum 4.5 hours; Full day requires 9.0 hours on site.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Leave (Apply & Balance) */}
      {activeTab === 'leave' && (
        <div className="space-y-6 animate-fade-in">
          {/* Balance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {leaveBalances.map((leave, idx) => (
              <div key={idx} className={`rounded-2xl border p-4 ${leave.color} bg-white shadow-xs`}>
                <p className="text-xs font-bold text-slate-700">{leave.type}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">{leave.available}</span>
                  <span className="text-xs text-slate-500">/ {leave.total} days</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600"
                    style={{ width: `${(leave.available / leave.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Apply Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Apply for Leave</h3>
              <span className="text-xs text-slate-500">Leave Period: Jan 2026 - Dec 2026</span>
            </div>
            <form onSubmit={handleApplyLeave} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option>Privilege Leave (PL)</option>
                  <option>Sick Leave (SL)</option>
                  <option>Casual Leave (CL)</option>
                  <option>Compensatory Off</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action</label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 py-2 px-4 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Q3 Performance & OKRs (2026)</h3>
            <p className="text-xs text-slate-500 mt-1">Review cycle: Jul 2026 - Sep 2026</p>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Objective 1: Zero-Downtime Local Intranet & Matrix Biometric Migration</span>
                  <span className="font-bold text-emerald-600">100% Achieved</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Migrated 4 door controllers and 250+ employee fingerprints with automatic failover.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Objective 2: Enterprise IT Policy-2025 Audit Compliance</span>
                  <span className="font-bold text-brand-600">85% In Progress</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Ensuring all workstations have disk encryption and password rotation active.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expenses & Travel */}
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

      {/* Tab 5: Apps */}
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">ERP & Vendor Invoicing</h4>
            <p className="text-[11px] text-slate-500 mt-1">Enterprise ERP module for Prashanth Enterprises</p>
            <button 
              onClick={() => alert("Opening Enterprise ERP")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

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
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none"
                >
                  <option>Privilege Leave (PL) - 14.5 days available</option>
                  <option>Sick Leave (SL) - 6.0 days available</option>
                  <option>Casual Leave (CL) - 4.5 days available</option>
                  <option>Compensatory Off - 2.0 days available</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                  <input type="date" defaultValue="2026-11-20" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                  <input type="date" defaultValue="2026-11-20" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea rows="2" placeholder="Brief reason for your manager..." className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Confirm & Apply
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

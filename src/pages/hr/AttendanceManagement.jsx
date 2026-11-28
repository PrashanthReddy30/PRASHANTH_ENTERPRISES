import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Download, 
  UserCheck, 
  UserX, 
  X, 
  Check, 
  ShieldAlert,
  ArrowRight,
  Wifi
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AttendanceManagement() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctedIn, setCorrectedIn] = useState('09:00 AM');
  const [correctedOut, setCorrectedOut] = useState('06:00 PM');
  const [correctedStatus, setCorrectedStatus] = useState('Present');
  const [correctionReason, setCorrectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scoped Attendance Records (Branch Scope Single Source of Truth)
  const scopedAttendance = React.useMemo(() => {
    return permissions.filterByScope(storeData.attendance, {
      branchKey: 'branch',
      empIdKey: 'employeeId',
      deptKey: 'department'
    });
  }, [storeData.attendance, permissions]);

  // Filter Attendance Records
  const attendanceList = scopedAttendance.filter((rec) => {
    const matchesSearch = 
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = branchFilter === 'ALL' || rec.branchId === branchFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    const matchesDate = !selectedDate || rec.date === selectedDate;

    return matchesSearch && matchesBranch && matchesStatus && matchesDate;
  });

  // KPI Calculations
  const totalRecords = attendanceList.length;
  const presentCount = attendanceList.filter(a => a.status === 'Present' || a.status === 'Late Arrival').length;
  const lateCount = attendanceList.filter(a => a.isLate).length;
  const onLeaveCount = attendanceList.filter(a => a.status === 'On Approved Leave').length;
  const pendingCorrections = storeData.attendanceCorrections.filter(c => c.status === 'Pending');

  const handleOpenCorrection = (rec) => {
    setSelectedRecord(rec);
    setCorrectedIn(rec.firstIn === '-' ? '09:00 AM' : rec.firstIn);
    setCorrectedOut(rec.lastOut === '-' ? '06:00 PM' : rec.lastOut);
    setCorrectedStatus(rec.status === 'Late Arrival' ? 'Present' : rec.status);
    setCorrectionReason('');
    setShowCorrectionModal(true);
  };

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!correctionReason.trim()) {
      alert('Mandatory Requirement: Please provide an audit justification reason for modifying attendance records.');
      return;
    }

    try {
      hrmStore.correctAttendance({
        recordId: selectedRecord.id,
        employeeId: selectedRecord.employeeId,
        correctedIn,
        correctedOut,
        correctedStatus,
        reason: correctionReason,
        hrUserId: currentUser.id,
        hrUserName: currentUser.name
      });

      showToast(`Attendance record updated and audited for ${selectedRecord.employeeName}.`);
      setShowCorrectionModal(false);
    } catch (err) {
      alert(`Correction failed: ${err.message}`);
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
                Attendance Master
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Wifi className="h-3 w-3 text-emerald-600" />
                Live Matrix Biometric Push (192.168.1.240)
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Attendance & Biometric Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live biometric logs, grace period monitoring, punch regularizations, and auditable manual corrections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="ALL">All Branches</option>
              <option value="HYD">Hyderabad Hub</option>
              <option value="CHE">Chennai Hub</option>
              <option value="MUM">Mumbai Hub</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present (On Time)</option>
              <option value="Late Arrival">Late Arrival (&gt; 09:15 AM)</option>
              <option value="On Approved Leave">On Approved Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Scheduled Today</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalRecords}</p>
          <p className="text-[11px] text-slate-400 mt-1">Tracked across biometric readers</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Present (Punched IN)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0}% Attendance Rate
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Late Arrivals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Grace limit: 15 mins (09:15 AM)</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">On Approved Leave</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{onLeaveCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Deducted from approved balance</p>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daily Attendance Log ({attendanceList.length})
            </h2>
          </div>
          <p className="text-[11px] text-slate-500">
            Shift: <strong>09:00 AM - 06:00 PM</strong>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Branch & Dept</th>
                <th className="py-3 px-4">First IN</th>
                <th className="py-3 px-4">Last OUT</th>
                <th className="py-3 px-4">Working Hours</th>
                <th className="py-3 px-4">Status & Lateness</th>
                <th className="py-3 px-4">Terminal / Mode</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {attendanceList.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                  {/* Employee */}
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{rec.employeeName}</p>
                    <p className="text-[11px] font-mono text-slate-500">{rec.employeeId}</p>
                  </td>

                  {/* Branch & Dept */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{rec.department}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {rec.branch}
                    </span>
                  </td>

                  {/* First IN */}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                    {rec.firstIn}
                  </td>

                  {/* Last OUT */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {rec.lastOut}
                  </td>

                  {/* Working Hours */}
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {rec.workingHours}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.status === 'Late Arrival' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        rec.status === 'On Approved Leave' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          rec.status === 'Present' ? 'bg-emerald-500' :
                          rec.status === 'Late Arrival' ? 'bg-amber-500' :
                          rec.status === 'On Approved Leave' ? 'bg-blue-500' : 'bg-slate-400'
                        }`}></span>
                        {rec.status}
                      </span>
                      {rec.isLate && (
                        <p className="text-[10px] text-amber-600 font-medium">Late by {rec.lateMinutes} mins</p>
                      )}
                      {rec.regularized && (
                        <p className="text-[10px] text-indigo-600 font-semibold">✓ Regularized by HR</p>
                      )}
                    </div>
                  </td>

                  {/* Terminal */}
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    <p className="font-medium text-slate-700">{rec.mode}</p>
                    <p className="truncate max-w-[150px]">{rec.terminal}</p>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenCorrection(rec)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                      title="HR Manual Punch Adjustment (Audited)"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction Modal */}
      {showCorrectionModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Record Adjustment</h3>
                <p className="text-xs text-slate-500">Every adjustment requires an audit trail reason.</p>
              </div>
              <button onClick={() => setShowCorrectionModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="p-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <p className="font-bold text-slate-900">{selectedRecord.employeeName} ({selectedRecord.employeeId})</p>
                <p className="text-slate-500 mt-0.5">Date: {selectedRecord.date} • Recorded: {selectedRecord.firstIn} to {selectedRecord.lastOut}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corrected First IN</label>
                  <input
                    type="text"
                    value={correctedIn}
                    onChange={(e) => setCorrectedIn(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corrected Last OUT</label>
                  <input
                    type="text"
                    value={correctedOut}
                    onChange={(e) => setCorrectedOut(e.target.value)}
                    placeholder="e.g. 06:15 PM"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Attendance Status</label>
                <select
                  value={correctedStatus}
                  onChange={(e) => setCorrectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-brand-500 outline-none"
                >
                  <option value="Present">Present (Regularized)</option>
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="On Approved Leave">On Approved Leave</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Work From Home">Work From Home (WFH)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Justification Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Matrix optical reader power cycle verified with Gate security log."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium focus:border-brand-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Note: This reason is permanently recorded in the append-only Audit Ledger with your HR credentials.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Save & Log Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceManagement;

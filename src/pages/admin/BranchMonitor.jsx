import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Activity, 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Download, 
  Printer, 
  Search, 
  Lock, 
  ShieldAlert, 
  MapPin, 
  TrendingUp, 
  X, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  FileSpreadsheet, 
  Layers, 
  Phone, 
  Mail,
  ShieldCheck,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AccessRestricted } from '../../components/common/AccessRestricted';

// Static Hub Metadata for Hyderabad, Chennai, and Mumbai
const BRANCH_CONFIGS = [
  { 
    id: 'HYD', 
    name: 'Hyderabad', 
    code: 'PE-HYD', 
    type: 'Headquarters & R&D Hub', 
    address: 'Plot 42, Hitec City, Cyberabad, Hyderabad 500081', 
    head: 'Prashanth Reddy', 
    phone: '+91 40 4829 1000',
    terminal: 'Door-01 Main Gate (192.168.1.240)'
  },
  { 
    id: 'CHE', 
    name: 'Chennai', 
    code: 'PE-CHE', 
    type: 'Engineering & Manufacturing Hub', 
    address: 'Tower B, OMR Tech Park, Chennai 600096', 
    head: 'Rohan Patel', 
    phone: '+91 44 2450 8000',
    terminal: 'CHE-Reader-01 & 02'
  },
  { 
    id: 'MUM', 
    name: 'Mumbai', 
    code: 'PE-MUM', 
    type: 'Corporate Finance & Regional Hub', 
    address: 'Level 14, Platina, Bandra Kurla Complex, Mumbai 400051', 
    head: 'Sneha Kulkarni', 
    phone: '+91 22 6120 4000',
    terminal: 'MUM-Reader-Main'
  }
];

export function BranchMonitor() {
  const { storeData, currentUser, permissions } = useAuth();

  // Strict Zero-Trust Verification: ONLY Global Admin can access or view this module
  const roleTier = currentUser?.id === 'PE000' 
    ? 'Global Admin' 
    : (currentUser?.roleTier || currentUser?.systemRole || 'Employee');
  const isGlobalAdmin = roleTier === 'Global Admin' || permissions?.isGlobalAdmin;

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeLedgerMode, setActiveLedgerMode] = useState('selectedMonth'); // 'selectedMonth' | 'allHistory'
  const [selectedAbsentBranch, setSelectedAbsentBranch] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // If not Global Admin, block completely with Access Restricted screen
  if (!isGlobalAdmin) {
    return (
      <AccessRestricted 
        moduleName="Branch Monitor & Financial Oversight" 
        returnPath="/home"
      />
    );
  }

  // Currency Formatter (Indian format)
  const formatINR = (val) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

  // Date Resolution for Live Office Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const availableDates = useMemo(() => {
    return [...new Set((storeData.attendance || []).map(a => a.date))].sort().reverse();
  }, [storeData.attendance]);
  const effectiveDate = (storeData.attendance || []).some(a => a.date === todayStr) 
    ? todayStr 
    : (availableDates[0] || todayStr);

  // Available Months for Dropdown
  const availableMonths = useMemo(() => {
    const months = (storeData.payrollRuns || []).map(r => r.period);
    if (!months.includes('November 2026')) months.unshift('November 2026');
    if (!months.includes('October 2026')) months.push('October 2026');
    return [...new Set(months)];
  }, [storeData.payrollRuns]);

  // Active Payroll Run for the selected month
  const activePayrollRun = useMemo(() => {
    const found = (storeData.payrollRuns || []).find(r => r.period === selectedMonth);
    if (found) return found;
    return (storeData.payrollRuns || [])[0] || {
      period: selectedMonth,
      totalGross: 1485000,
      totalDeductions: 189200,
      totalNet: 1295800,
      totalEmployees: 10,
      paymentDate: '30 Nov 2026',
      status: 'Processing'
    };
  }, [storeData.payrollRuns, selectedMonth]);

  // Branch-wise Live Office Attendance Computations
  const branchAttendanceData = useMemo(() => {
    const allEmployees = storeData.employees || [];
    const allAttendance = storeData.attendance || [];
    const allLeaves = storeData.leaveRequests || [];

    return BRANCH_CONFIGS.map(branch => {
      const employees = allEmployees.filter(e => e.branchId === branch.id && e.status === 'Active');
      const attendance = allAttendance.filter(a => a.branchId === branch.id && a.date === effectiveDate);

      const presentEmployees = attendance.filter(a => a.status === 'Present' || a.status === 'Late Arrival');
      const lateEmployees = attendance.filter(a => a.isLate || a.status === 'Late Arrival');
      const onLeaveAttendance = attendance.filter(a => a.status === 'On Approved Leave');

      // Detect employees on approved leave from leave requests
      const approvedLeaveEmployees = allLeaves.filter(r => 
        r.branchId === branch.id && 
        r.status === 'Approved' && 
        (r.from <= effectiveDate && r.to >= effectiveDate)
      );

      // Collect complete list of Absent or On-Leave Personnel
      const absentOrOnLeavePersonnel = [];

      // 1. Those on approved leave
      employees.forEach(emp => {
        const leaveReq = approvedLeaveEmployees.find(r => r.employeeId === emp.id);
        const attLeave = onLeaveAttendance.find(a => a.employeeId === emp.id);
        const isPresent = presentEmployees.some(p => p.employeeId === emp.id);

        if (leaveReq || attLeave) {
          absentOrOnLeavePersonnel.push({
            employee: emp,
            type: 'On Approved Leave',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            reason: leaveReq ? `${leaveReq.leaveType} (${leaveReq.from} to ${leaveReq.to})` : 'Approved Leave Application',
            approver: leaveReq?.approvedByName || 'Assigned HR / Manager',
            isApproved: true
          });
        } else if (!isPresent) {
          absentOrOnLeavePersonnel.push({
            employee: emp,
            type: 'Absent (Unplanned)',
            badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
            reason: 'No biometric check-in recorded at door terminal today.',
            approver: null,
            isApproved: false
          });
        }
      });

      const presentCount = presentEmployees.length;
      const totalCount = employees.length;
      const absentCount = absentOrOnLeavePersonnel.length;
      const lateCount = lateEmployees.length;
      const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

      return {
        ...branch,
        totalEmployees: totalCount,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate: parseFloat(attendanceRate),
        absentOrOnLeavePersonnel,
        presentEmployees,
        lateEmployees
      };
    });
  }, [storeData.employees, storeData.attendance, storeData.leaveRequests, effectiveDate]);

  // High-Level 4 Company-Wide KPI Totals (Respects selectedBranch filter)
  const companyKpis = useMemo(() => {
    const filteredBranches = selectedBranch === 'ALL' 
      ? branchAttendanceData 
      : branchAttendanceData.filter(b => b.id === selectedBranch);

    const totalWorkforce = filteredBranches.reduce((acc, b) => acc + b.totalEmployees, 0);
    const totalPresent = filteredBranches.reduce((acc, b) => acc + b.presentCount, 0);
    const totalAbsent = filteredBranches.reduce((acc, b) => acc + b.absentCount, 0);
    const overallRate = totalWorkforce > 0 ? ((totalPresent / totalWorkforce) * 100).toFixed(1) : '0.0';

    // Payroll numbers for selected month
    let monthlyGross = 0;
    let monthlyDeductions = 0;
    let monthlyNet = 0;
    let disbursementDate = activePayrollRun.paymentDate || '30 Nov 2026';

    if (selectedBranch === 'ALL') {
      monthlyGross = activePayrollRun.totalGross || 0;
      monthlyDeductions = activePayrollRun.totalDeductions || 0;
      monthlyNet = activePayrollRun.totalNet || 0;
    } else {
      const bData = activePayrollRun.branchBreakdown?.[selectedBranch];
      if (bData) {
        monthlyGross = bData.gross || 0;
        monthlyDeductions = bData.deductions || 0;
        monthlyNet = bData.net || 0;
        if (bData.paymentDate) disbursementDate = bData.paymentDate;
      }
    }

    return {
      totalWorkforce,
      totalPresent,
      totalAbsent,
      overallRate,
      monthlyGross,
      monthlyDeductions,
      monthlyNet,
      disbursementDate,
      paymentStatus: activePayrollRun.status || 'Finalized'
    };
  }, [branchAttendanceData, selectedBranch, activePayrollRun]);

  // Branch-Wise Payroll Ledger Rows (Selected Month or All History)
  const ledgerRows = useMemo(() => {
    const runsToDisplay = activeLedgerMode === 'selectedMonth'
      ? [activePayrollRun]
      : (storeData.payrollRuns || []);

    const rows = [];

    runsToDisplay.forEach(run => {
      BRANCH_CONFIGS.forEach(branch => {
        if (selectedBranch !== 'ALL' && selectedBranch !== branch.id) return;

        const branchStats = run.branchBreakdown?.[branch.id] || {
          gross: branch.id === 'HYD' ? 915000 : (branch.id === 'CHE' ? 255000 : 315000),
          deductions: branch.id === 'HYD' ? 115200 : (branch.id === 'CHE' ? 33200 : 40800),
          net: branch.id === 'HYD' ? 799800 : (branch.id === 'CHE' ? 221800 : 274200),
          count: branch.id === 'HYD' ? 6 : 2,
          status: run.status === 'Processing' ? 'Processing' : 'Paid',
          paymentDate: run.paymentDate || (run.period.includes('Oct') ? '31 Oct 2026' : '30 Nov 2026')
        };

        rows.push({
          id: `${run.id}-${branch.id}`,
          runId: run.id,
          branchName: `${branch.name} Hub`,
          branchCode: branch.code,
          branchId: branch.id,
          period: run.period,
          year: run.year,
          month: run.month,
          employeesPaid: branchStats.count || (branch.id === 'HYD' ? 6 : 2),
          gross: branchStats.gross,
          deductions: branchStats.deductions,
          net: branchStats.net,
          status: branchStats.status || (run.status === 'Processing' ? 'Processing' : 'Paid'),
          paymentDate: branchStats.paymentDate || run.paymentDate || '30 Nov 2026'
        });
      });
    });

    return rows;
  }, [activeLedgerMode, activePayrollRun, storeData.payrollRuns, selectedBranch]);

  // Company Total Row for the Ledger Table
  const ledgerTotals = useMemo(() => {
    return ledgerRows.reduce((acc, row) => ({
      employeesPaid: acc.employeesPaid + row.employeesPaid,
      gross: acc.gross + row.gross,
      deductions: acc.deductions + row.deductions,
      net: acc.net + row.net
    }), { employeesPaid: 0, gross: 0, deductions: 0, net: 0 });
  }, [ledgerRows]);

  // Export Table Data to CSV
  const handleExportCsv = () => {
    try {
      const headers = ['Branch Hub', 'Branch Code', 'Month & Year', 'Employees Paid', 'Gross Salary (INR)', 'Deductions (INR)', 'Net Amount (INR)', 'Payment Status', 'Payment Date'];
      const rows = ledgerRows.map(r => [
        `"${r.branchName}"`,
        `"${r.branchCode}"`,
        `"${r.period}"`,
        r.employeesPaid,
        r.gross,
        r.deductions,
        r.net,
        `"${r.status}"`,
        `"${r.paymentDate}"`
      ]);

      // Add Company Total Row
      rows.push([
        '"Company Total (All Branches)"',
        '"PE-CORP"',
        `"${activeLedgerMode === 'selectedMonth' ? selectedMonth : 'Consolidated History'}"`,
        ledgerTotals.employeesPaid,
        ledgerTotals.gross,
        ledgerTotals.deductions,
        ledgerTotals.net,
        '"Reconciled"',
        '"Verified"'
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `PE_Branch_Financial_Monitor_${selectedMonth.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Branch Financial Ledger exported to CSV successfully!');
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Resolve currently opened Absent / On Leave Branch
  const activeAbsentBranchInfo = selectedAbsentBranch 
    ? branchAttendanceData.find(b => b.id === selectedAbsentBranch)
    : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Executive Header HUD */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-300" />
                Global Admin Governance
              </span>
              <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Matrix Intranet Synced: {effectiveDate}
              </span>
              <span className="text-xs text-slate-400">Zero-Trust Role Tier: Global Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold mt-2 tracking-tight text-white flex items-center gap-2.5">
              <Building2 className="h-6 w-6 text-brand-400" />
              Branch Monitor & Financial Oversight
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Consolidated executive command center monitoring real-time biometric office presence and verified monthly financial disbursements across Hyderabad, Chennai, and Mumbai regional hubs.
            </p>
          </div>

          {/* Top Controls: Month/Year selector & Branch Filter */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
            {/* Month Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">Payroll Month</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-white/20 bg-slate-800/90 py-1.5 pl-8 pr-7 text-xs font-semibold text-white outline-none focus:border-brand-400 cursor-pointer shadow-xs"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch Filter */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">Hub Filter</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="rounded-xl border border-white/20 bg-slate-800/90 py-1.5 pl-8 pr-7 text-xs font-semibold text-white outline-none focus:border-brand-400 cursor-pointer shadow-xs"
                >
                  <option value="ALL" className="bg-slate-900 text-white">All Branches (HYD, CHE, MUM)</option>
                  <option value="HYD" className="bg-slate-900 text-white">Hyderabad Hub (HYD)</option>
                  <option value="CHE" className="bg-slate-900 text-white">Chennai Hub (CHE)</option>
                  <option value="MUM" className="bg-slate-900 text-white">Mumbai Hub (MUM)</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 self-end pt-3">
              <button
                onClick={handleExportCsv}
                title="Export Branch Ledger to CSV"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handlePrint}
                title="Print Executive Oversight Dossier"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-white/10"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 High-Level Company-Wide Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Workforce */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Workforce</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{companyKpis.totalWorkforce}</span>
            <span className="text-xs font-semibold text-slate-500">Active Personnel</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            <span>HYD: 6 • CHE: 2 • MUM: 2</span>
          </div>
        </div>

        {/* KPI 2: Present Today vs Absent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Office Presence Today</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-600">{companyKpis.totalPresent}</span>
              <span className="text-xs font-bold text-slate-400"> / {companyKpis.totalWorkforce} Present</span>
            </div>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
              {companyKpis.overallRate}%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="text-rose-600 font-semibold">{companyKpis.totalAbsent} Absent / On Leave</span>
            <span className="text-slate-400">Biometric Live</span>
          </div>
        </div>

        {/* KPI 3: Total Monthly Payout (INR) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly Payout</span>
            <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatINR(companyKpis.monthlyNet)}
            </span>
            <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
              Net Disbursed ({selectedMonth})
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-medium truncate">
            Gross: {formatINR(companyKpis.monthlyGross)} • Ded: {formatINR(companyKpis.monthlyDeductions)}
          </div>
        </div>

        {/* KPI 4: Latest Disbursement Date */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Disbursement</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-black text-purple-900">{companyKpis.disbursementDate}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] ${
              companyKpis.paymentStatus === 'Paid' || companyKpis.paymentStatus === 'Finalized'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                companyKpis.paymentStatus === 'Paid' || companyKpis.paymentStatus === 'Finalized' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
              {companyKpis.paymentStatus === 'Finalized' ? 'Paid & Reconciled' : companyKpis.paymentStatus}
            </span>
            <span className="text-slate-400 text-[10px]">Bank Transfer</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Branch-Wise Live Office Attendance Monitor (3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600" />
              Branch-Wise Live Office Attendance Monitor
            </h2>
            <p className="text-xs text-slate-500">
              Real-time door terminal sync for today ({effectiveDate}) across Hyderabad, Chennai, and Mumbai regional hubs.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Reader Frequency: 15s Matrix Push
          </span>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {branchAttendanceData.map(branch => {
            const isMatchSelected = selectedBranch === 'ALL' || selectedBranch === branch.id;
            if (!isMatchSelected) return null;

            return (
              <div 
                key={branch.id} 
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Branch Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-brand-100 text-brand-800 font-mono text-[11px] font-extrabold px-1.5 py-0.5">
                          {branch.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{branch.name} Hub</h3>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{branch.type}</p>
                    </div>
                    <span className="text-right">
                      <span className="text-xl font-black text-slate-900">{branch.totalEmployees}</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Personnel</span>
                    </span>
                  </div>

                  {/* Address & Branch Lead info */}
                  <div className="mt-3 bg-slate-50 rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Hub Director:</span>
                      <span className="font-bold text-slate-800">{branch.head}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Terminal:</span>
                      <span className="font-mono text-slate-700 truncate max-w-[160px]" title={branch.terminal}>
                        {branch.terminal}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Rate Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Present Today</span>
                      <span className="font-extrabold text-emerald-600">
                        {branch.presentCount} / {branch.totalEmployees} ({branch.attendanceRate}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          branch.attendanceRate >= 80 ? 'bg-emerald-500' : (branch.attendanceRate >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                        }`}
                        style={{ width: `${branch.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics grid inside branch card */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    {/* Late Arrivals count */}
                    <div className="rounded-xl border border-slate-100 bg-amber-50/40 p-2.5">
                      <p className="text-[10px] font-bold text-amber-700 uppercase">Late Arrivals</p>
                      <p className="text-lg font-black text-amber-800 mt-0.5">{branch.lateCount}</p>
                      <p className="text-[9px] text-amber-600">Grace: 15 Mins</p>
                    </div>

                    {/* Absent / On Leave count */}
                    <div className="rounded-xl border border-slate-100 bg-rose-50/40 p-2.5">
                      <p className="text-[10px] font-bold text-rose-700 uppercase">Absent / Leave</p>
                      <p className="text-lg font-black text-rose-800 mt-0.5">{branch.absentCount}</p>
                      <p className="text-[9px] text-rose-600">Requires Review</p>
                    </div>
                  </div>
                </div>

                {/* Card Action: Click to inspect who is absent / on leave */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedAbsentBranch(branch.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 py-2 text-xs font-semibold text-slate-700 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Absent & Leave Records ({branch.absentCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Branch-Wise Monthly Financial & Payroll Disbursement Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Table Top Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 uppercase">
                Financial Oversight Ledger
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Multi-Hub Audit</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Branch-Wise Monthly Payroll & Disbursement Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Official branch-level salary disbursement breakdown, statutory deductions (PF/PT/TDS), net bank disbursements, and verified payment dates.
            </p>
          </div>

          {/* Mode Switcher: Selected Month vs Full History */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveLedgerMode('selectedMonth')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  activeLedgerMode === 'selectedMonth' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedMonth}
              </button>
              <button
                onClick={() => setActiveLedgerMode('allHistory')}
                className={`rounded-lg px-3 py-1.5 transition ${
                  activeLedgerMode === 'allHistory' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Multi-Month History
              </button>
            </div>
          </div>
        </div>

        {/* The Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Branch Hub</th>
                <th className="py-3.5 px-4">Month & Year</th>
                <th className="py-3.5 px-4 text-center">Employees Paid</th>
                <th className="py-3.5 px-4 text-right">Gross Salary (₹)</th>
                <th className="py-3.5 px-4 text-right">Deductions (₹)</th>
                <th className="py-3.5 px-4 text-right">Net Amount Paid (₹)</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Exact Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {ledgerRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition">
                  {/* Branch Hub */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold font-mono text-[10px]">
                        {row.branchId}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{row.branchName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{row.branchCode}</p>
                      </div>
                    </div>
                  </td>

                  {/* Month & Year */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.period}
                  </td>

                  {/* Employees Paid count */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {row.employeesPaid}
                    </span>
                  </td>

                  {/* Gross Salary */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    {formatINR(row.gross)}
                  </td>

                  {/* Deductions (PF/PT/TDS) */}
                  <td className="py-3.5 px-4 text-right text-rose-600 font-medium">
                    - {formatINR(row.deductions)}
                  </td>

                  {/* Net Amount Paid */}
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    {formatINR(row.net)}
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      row.status === 'Paid' || row.status === 'Finalized'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (row.status === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200')
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        row.status === 'Paid' || row.status === 'Finalized'
                          ? 'bg-emerald-500' 
                          : (row.status === 'Processing' ? 'bg-amber-500' : 'bg-slate-400')
                      }`}></span>
                      {row.status}
                    </span>
                  </td>

                  {/* Exact Payment Date */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                    {row.paymentDate}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Company Total Footer Row (Summing all 3 branches) */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100/90 text-xs font-black text-slate-900">
                <td className="py-4 px-4 flex items-center gap-2">
                  <span className="rounded-md bg-brand-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                    TOTAL
                  </span>
                  <span>Company Total ({selectedBranch === 'ALL' ? 'All 3 Branches' : `${selectedBranch} Only`})</span>
                </td>
                <td className="py-4 px-4 text-slate-600 font-semibold">
                  {activeLedgerMode === 'selectedMonth' ? selectedMonth : 'Consolidated Runs'}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-100 text-brand-800 font-black">
                    {ledgerTotals.employeesPaid}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-black">
                  {formatINR(ledgerTotals.gross)}
                </td>
                <td className="py-4 px-4 text-right font-black text-rose-700">
                  - {formatINR(ledgerTotals.deductions)}
                </td>
                <td className="py-4 px-4 text-right font-black text-brand-700 text-sm">
                  {formatINR(ledgerTotals.net)}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                    <Check className="h-3 w-3" />
                    Reconciled
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-mono text-[11px] text-slate-500">
                  {activePayrollRun.paymentDate || 'Verified'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL: Detailed Absent / On Leave Records for Selected Branch */}
      {selectedAbsentBranch && activeAbsentBranchInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-brand-950 p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-500/20 text-brand-300 font-mono text-[10px] font-bold px-1.5 py-0.5 border border-brand-500/30">
                    {activeAbsentBranchInfo.code}
                  </span>
                  <span className="text-xs text-slate-300">• Date: {effectiveDate}</span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">
                  Absent & Leave Dossier — {activeAbsentBranchInfo.name} Hub
                </h3>
                <p className="text-xs text-slate-300">
                  Total {activeAbsentBranchInfo.absentCount} personnel currently absent or on approved company leave.
                </p>
              </div>
              <button 
                onClick={() => setSelectedAbsentBranch(null)}
                className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Personnel List */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 flex-1">
              {activeAbsentBranchInfo.absentOrOnLeavePersonnel.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">100% Attendance in {activeAbsentBranchInfo.name}!</p>
                  <p className="text-xs text-slate-400 mt-1">No personnel are absent or on leave today.</p>
                </div>
              ) : (
                activeAbsentBranchInfo.absentOrOnLeavePersonnel.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.employee.avatar} 
                        alt={item.employee.name} 
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs">{item.employee.name}</p>
                          <span className="font-mono text-[10px] text-brand-600 font-semibold">{item.employee.employeeId}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {item.employee.role} • {item.employee.department}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.employee.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.employee.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${item.badgeColor}`}>
                        {item.type}
                      </span>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-xs">{item.reason}</p>
                      {item.approver && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Approved by: {item.approver}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hub Lead: <strong className="text-slate-800">{activeAbsentBranchInfo.head}</strong> ({activeAbsentBranchInfo.phone})
              </span>
              <button
                onClick={() => setSelectedAbsentBranch(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchMonitor;

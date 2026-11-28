import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Eye, 
  Building2, 
  MapPin, 
  Users, 
  FileCheck, 
  TrendingUp, 
  Play, 
  ShieldCheck, 
  FileText,
  Lock,
  ChevronRight,
  Sparkles,
  Receipt,
  PiggyBank,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PayrollManagement() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('runs'); 
  const [selectedRun, setSelectedRun] = useState(storeData.payrollRuns[0] || null);
  const [toastMessage, setToastMessage] = useState(null);

  // Branch Scoping Setup (Single Source of Truth via Role Matrix)
  const isGlobalAdmin = permissions.isGlobalAdmin;
  const userBranch = currentUser?.branchScope || currentUser?.branch || 'Hyderabad';
  const userBranchId = currentUser?.branchId || (userBranch === 'Hyderabad' ? 'HYD' : userBranch === 'Chennai' ? 'CHE' : 'MUM');
  const canExecuteProcess = permissions.isGlobalAdmin || permissions.hasPayrollAccess(null, 'process');

  // Filter state (Global Admin can toggle; Hub-restricted roles are locked)
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const activeBranch = isGlobalAdmin || permissions.getBranchScope() === 'Company-Wide' || permissions.getBranchScope() === 'All Hubs'
    ? selectedBranchFilter 
    : userBranch;
  const isBranchLocked = !isGlobalAdmin && permissions.getBranchScope() === 'Assigned Hub';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Branch-scoped employee list
  const scopedEmployees = useMemo(() => {
    return permissions.filterByScope(storeData.employees, {
      branchKey: 'branch',
      empIdKey: 'id'
    });
  }, [storeData.employees, permissions]);

  // Branch-scoped financial totals
  const branchMetrics = useMemo(() => {
    let gross = 0;
    let net = 0;
    let deductions = 0;
    let pf = 0;
    let pt = 0;
    let tds = 0;
    let count = 0;

    scopedEmployees.forEach(emp => {
      if (emp.status === 'Active') {
        const sal = storeData.salaryStructures[emp.id] || { 
          basic: 45000, 
          hra: 22500, 
          specialAllowance: 22500, 
          pf: 5400, 
          pt: 200, 
          tds: 4500, 
          gross: 90000, 
          net: 79900 
        };
        gross += (sal.gross || 0);
        net += (sal.net || 0);
        deductions += ((sal.gross || 0) - (sal.net || 0));
        pf += (sal.pf || 0);
        pt += (sal.pt || 200);
        tds += (sal.tds || 0);
        count += 1;
      }
    });

    return { gross, net, deductions, pf, pt, tds, count };
  }, [scopedEmployees, storeData.salaryStructures]);

  // Process New Payroll Period
  const handleGeneratePreview = (periodLabel, year, month) => {
    try {
      const run = hrmStore.processPayrollRun(periodLabel, year, month, currentUser.id, currentUser.name);
      setSelectedRun(run);
      showToast(`Payroll calculation generated for ${periodLabel}. Gross: ₹${(isBranchLocked ? branchMetrics.gross : run.totalGross).toLocaleString()}`);
    } catch (err) {
      alert(`Payroll calculation failed: ${err.message}`);
    }
  };

  // Finalize & Approve Payroll
  const handleApprovePayroll = (runId) => {
    try {
      const approved = hrmStore.approvePayrollRun(runId, currentUser.id, currentUser.name);
      setSelectedRun({ ...approved });
      showToast(`Payroll finalized and payslips published for ${approved.period}!`);
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  // Verify permission: Only users with payroll authorization or HR/Global Admin access
  const canAccessPayroll = permissions.isGlobalAdmin || permissions.isFinance || permissions.isHR || permissions.canProcessPayroll;

  if (!canAccessPayroll) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
        <Lock className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-900">Confidential Finance Module Restricted</h2>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Salary structures, payroll calculations, and statutory deductions are strictly restricted to Finance, HR Administration, and Global Admin users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 uppercase">
                Payroll Engine
              </span>
              <span className="text-xs text-slate-500">• Section 115BAC & Statutory Compliant</span>
              
              {/* Branch Scope Indicator */}
              {isBranchLocked ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  <MapPin className="h-3 w-3 text-brand-600" />
                  <span>Branch Scope: {userBranch} (PE-{userBranchId})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                  <ShieldCheck className="h-3 w-3 text-purple-600" />
                  <span>Global Admin (Multi-Hub Unrestricted)</span>
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Enterprise Payroll & Compensation Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Salary structures, EPF (12%), Professional Tax (₹200), TDS, branch-scoped approval workflow, and automated payslip distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Branch Filter Switcher for Global Admin */}
            {!isBranchLocked ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Hub:</span>
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Hubs (Consolidated)</option>
                  <option value="Hyderabad">Hyderabad Hub (PE-HYD)</option>
                  <option value="Chennai">Chennai Hub (PE-CHE)</option>
                  <option value="Mumbai">Mumbai Hub (PE-MUM)</option>
                </select>
              </div>
            ) : null}

            {canExecuteProcess ? (
              <button
                onClick={() => handleGeneratePreview('November 2026', 2026, 11)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Play className="h-4 w-4" />
                <span>Run Nov 2026 Payroll {isBranchLocked ? `(${userBranch})` : ''}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Verify Mode (Audit Only)</span>
              </div>
            )}
          </div>
        </div>

        {/* 6-Tab Navigation Bar */}
        <div className="mt-5 flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'runs', label: '1. Payroll Dashboard & Runs', icon: DollarSign },
            { id: 'structures', label: '2. Salary Master & CTC Breakdown', icon: Building2 },
            { id: 'payslips', label: '3. Published Payslips Archive', icon: FileText },
            { id: 'statutory', label: '4. Statutory PF / ESI / TDS', icon: PiggyBank },
            { id: 'reimbursements', label: '5. Reimbursements & Claims', icon: Receipt },
            { id: 'reports', label: '6. Branch Payroll Reports', icon: FileSpreadsheet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? 'border-brand-600 text-brand-700 font-bold bg-brand-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PAYROLL RUNS */}
      {activeTab === 'runs' && selectedRun && (
        <div className="space-y-6">
          {/* Selected Run Overview Hero */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  selectedRun.status === 'Finalized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedRun.status}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Payroll Period: {selectedRun.period}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBranchLocked || activeBranch !== 'ALL' ? (
                    <span><strong>{branchMetrics.count}</strong> Active Personnel in <strong>{activeBranch} Hub</strong> (PE-{userBranchId})</span>
                  ) : (
                    <span><strong>{selectedRun.totalEmployees}</strong> Active Personnel Included Across All 3 Hubs</span>
                  )}
                </p>
              </div>

              {selectedRun.status !== 'Finalized' ? (
                canExecuteProcess ? (
                  <button
                    onClick={() => handleApprovePayroll(selectedRun.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Authorize & Finalize Payroll {isBranchLocked ? `(${userBranch})` : ''}</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>Read/Verify Mode (Processing Blocked)</span>
                  </span>
                )
              ) : (
                <div className="text-right">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Finalized by {selectedRun.approvedBy}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedRun.approvedAt}</p>
                </div>
              )}
            </div>

            {/* Financial Aggregate Cards (Branch-Scoped) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Total Gross Earnings {isBranchLocked ? `(${userBranch})` : ''}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹ {(isBranchLocked || activeBranch !== 'ALL' ? branchMetrics.gross : selectedRun.totalGross).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Basic + HRA + Special Allowances</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Statutory Deductions {isBranchLocked ? `(${userBranch})` : ''}
                </p>
                <p className="text-2xl font-bold text-rose-600 mt-1">
                  ₹ {(isBranchLocked || activeBranch !== 'ALL' ? branchMetrics.deductions : selectedRun.totalDeductions).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">EPF (12%) + PT (₹200) + TDS</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Total Net Disbursed {isBranchLocked ? `(${userBranch})` : ''}
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  ₹ {(isBranchLocked || activeBranch !== 'ALL' ? branchMetrics.net : selectedRun.totalNet).toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">Direct Bank Payout Pushed</p>
              </div>
            </div>

            {/* Branch-wise breakdown */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                {isBranchLocked ? `${userBranch} Hub Disbursal Allocation` : 'Branch-Wise Disbursal Distribution'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(selectedRun.branchBreakdown || {}).map(([bKey, bData]) => {
                  const bName = bKey === 'HYD' ? 'Hyderabad' : bKey === 'CHE' ? 'Chennai' : 'Mumbai';
                  // If locked to branch, only show the user's branch!
                  if (isBranchLocked && bName.toLowerCase() !== userBranch.toLowerCase()) {
                    return null;
                  }
                  if (!isBranchLocked && activeBranch !== 'ALL' && bName.toLowerCase() !== activeBranch.toLowerCase()) {
                    return null;
                  }
                  const isUserHub = bName.toLowerCase() === userBranch.toLowerCase();
                  return (
                    <div key={bKey} className={`rounded-xl border p-3.5 bg-white ${isUserHub ? 'border-brand-300 ring-2 ring-brand-500/20 shadow-xs' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900">{bName} Hub</p>
                          {isUserHub && (
                            <span className="rounded bg-brand-50 text-brand-700 font-mono text-[9px] font-bold px-1.5 py-0.2 border border-brand-200">
                              Your Hub
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{bKey}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Headcount: <strong>{bData.count}</strong> personnel
                      </p>
                      <div className="mt-2 text-xs border-t border-slate-100 pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gross:</span>
                          <span className="font-semibold text-slate-800">₹ {bData.gross.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Deductions:</span>
                          <span className="font-semibold text-rose-600">₹ {bData.deductions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                          <span className="text-slate-700">Net Take-Home:</span>
                          <span className="text-emerald-600">₹ {bData.net.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historical Runs Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                All Configured Payroll Periods
              </h3>
              <span className="text-[11px] text-slate-500">
                {isBranchLocked ? `Filtered to ${userBranch} Hub` : 'Consolidated Enterprise Ledger'}
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Gross Payout</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeData.payrollRuns.map(run => {
                  const bCode = (userBranch === 'Hyderabad' ? 'HYD' : userBranch === 'Chennai' ? 'CHE' : 'MUM');
                  const branchSlice = isBranchLocked ? run.branchBreakdown?.[bCode] : null;
                  const displayEmployees = branchSlice ? branchSlice.count : run.totalEmployees;
                  const displayGross = branchSlice ? branchSlice.gross : run.totalGross;
                  const displayDeductions = branchSlice ? branchSlice.deductions : run.totalDeductions;
                  const displayNet = branchSlice ? branchSlice.net : run.totalNet;

                  return (
                    <tr key={run.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{run.period}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{displayEmployees}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">₹ {displayGross.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-rose-600">₹ {displayDeductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">₹ {displayNet.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          run.status === 'Finalized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRun(run)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          Inspect Details &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY MASTER & CTC BREAKDOWN */}
      {activeTab === 'structures' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Employee Salary Master & Statutory CTC Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Displaying {scopedEmployees.length} personnel in {isBranchLocked ? `${userBranch} Hub (PE-${userBranchId})` : activeBranch === 'ALL' ? 'All Hubs' : `${activeBranch} Hub`}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">EPF: 12% on Basic | PT: ₹200 Standard | TDS Sec 115BAC</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch & Dept</th>
                  <th className="py-3 px-4">Monthly Basic</th>
                  <th className="py-3 px-4">HRA</th>
                  <th className="py-3 px-4">Special Allowance</th>
                  <th className="py-3 px-4">EPF (12%)</th>
                  <th className="py-3 px-4">Prof. Tax</th>
                  <th className="py-3 px-4">Gross CTC</th>
                  <th className="py-3 px-4 font-bold text-emerald-700">Net Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No personnel records found for {activeBranch} Hub.
                    </td>
                  </tr>
                ) : (
                  scopedEmployees.map(emp => {
                    const sal = storeData.salaryStructures[emp.id] || { 
                      basic: 45000, 
                      hra: 22500, 
                      specialAllowance: 22500, 
                      pf: 5400, 
                      pt: 200, 
                      gross: 90000, 
                      net: 79900 
                    };
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{emp.employeeId}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-800 font-medium">{emp.department}</p>
                          <span className="inline-block rounded bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 mt-0.5">
                            {emp.branch} Hub
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">₹ {sal.basic?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">₹ {sal.hra?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">₹ {sal.specialAllowance?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-rose-600">₹ {sal.pf?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">₹ {sal.pt || 200}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">₹ {sal.gross?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">₹ {sal.net?.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHED PAYSLIPS ARCHIVE */}
      {activeTab === 'payslips' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Published Monthly Payslips Archive</h3>
              <p className="text-xs text-slate-500">
                Showing generated payslips for {scopedEmployees.length} personnel in {isBranchLocked ? `${userBranch} Hub` : activeBranch === 'ALL' ? 'All Hubs' : `${activeBranch} Hub`}
              </p>
            </div>
            <button
              onClick={() => showToast(`Bulk exported ${scopedEmployees.length} payslips as ZIP archive.`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Bulk Export (ZIP)</span>
            </button>
          </div>

          <div className="space-y-3">
            {scopedEmployees.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-xs">No personnel payslips for this branch scope.</p>
            ) : (
              scopedEmployees.map(emp => {
                const sal = storeData.salaryStructures[emp.id] || { gross: 90000, net: 79900 };
                return (
                  <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-brand-50 p-2.5 border border-brand-200">
                        <FileText className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{emp.name} — Payslip October 2026</p>
                          <span className="rounded bg-slate-200 text-slate-700 text-[10px] font-mono px-1.5 py-0.2">
                            {emp.employeeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {emp.branch} Hub • {emp.department} • Gross: <strong className="text-slate-700">₹{sal.gross?.toLocaleString()}</strong> • Net Disbursed: <strong className="text-emerald-700">₹{sal.net?.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => showToast(`Previewing verified payslip for ${emp.name}`)}
                        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => showToast(`Downloaded simulated payslip for ${emp.name}`)}
                        className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5 text-white" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STATUTORY PF / ESI / TDS */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Employee Provident Fund (EPF)</span>
                <span className="rounded bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700 px-1.5 py-0.2">12% Basic</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹ {branchMetrics.pf.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Monthly branch contribution pool for EPFO return filing</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Professional Tax (PT)</span>
                <span className="rounded bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 px-1.5 py-0.2">State Slab</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹ {branchMetrics.pt.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Monthly state commercial tax remittance ({userBranch} State)</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">TDS Tax Deducted</span>
                <span className="rounded bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 px-1.5 py-0.2">Sec 115BAC</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹ {branchMetrics.tds.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Income Tax Department TRACES Form 24Q deposit</p>
            </div>
          </div>

          {/* Statutory Schedule Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Statutory Remittance Schedule — {isBranchLocked ? `${userBranch} Hub` : activeBranch}
              </h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">PAN / UAN</th>
                  <th className="py-3 px-4">Monthly Basic</th>
                  <th className="py-3 px-4">EPF (Employee 12%)</th>
                  <th className="py-3 px-4">EPF (Employer 12%)</th>
                  <th className="py-3 px-4">PT (State)</th>
                  <th className="py-3 px-4">TDS (Tax)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedEmployees.map(emp => {
                  const sal = storeData.salaryStructures[emp.id] || { basic: 45000, pf: 5400, pt: 200, tds: 4500 };
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">{emp.panNumber || 'ABCDE1234F'} • {emp.uan || '100984920000'}</td>
                      <td className="py-2.5 px-4 font-mono font-medium">₹ {sal.basic?.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono text-rose-600 font-semibold">₹ {sal.pf?.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">₹ {sal.pf?.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">₹ {sal.pt || 200}</td>
                      <td className="py-2.5 px-4 font-mono text-amber-700 font-semibold">₹ {sal.tds?.toLocaleString() || '4,500'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REIMBURSEMENTS & CLAIMS */}
      {activeTab === 'reimbursements' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Employee Reimbursements & Travel Claims</h3>
              <p className="text-xs text-slate-500">
                Expense vouchers and tax-free allowances for {isBranchLocked ? `${userBranch} Hub` : activeBranch} personnel
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
              Tax Exempt under IT Rules
            </span>
          </div>

          <div className="space-y-3">
            {scopedEmployees.slice(0, 5).map((emp, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-50 p-2.5 border border-purple-200">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">{emp.employeeId}</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">Approved</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {idx % 2 === 0 ? 'Inter-City Client Travel & Accommodation' : 'Broadband & Tech Certification Allowance'} • Applied: 15 Nov 2026
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <p className="font-mono font-bold text-slate-900 text-sm">₹ {(idx % 2 === 0 ? 8500 : 3200).toLocaleString()}</p>
                  <button 
                    onClick={() => showToast(`Claim approved and queued for payout to ${emp.name}`)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BRANCH PAYROLL REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Branch Regulatory Payroll Reports & Audit Artifacts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant generation and export for {isBranchLocked ? `${userBranch} Hub (PE-${userBranchId})` : activeBranch === 'ALL' ? 'All Hubs' : `${activeBranch} Hub`}.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  title: 'Monthly Salary Register (Excel / CSV)', 
                  desc: 'Comprehensive employee-by-employee basic, HRA, allowance, and deductions matrix for reconciliation.',
                  action: 'Download CSV',
                  icon: FileSpreadsheet
                },
                { 
                  title: 'Direct Bank Transfer File (NEFT / RTGS)', 
                  desc: 'Formatted corporate banking disbursement text file for direct account batch processing.',
                  action: 'Generate NEFT File',
                  icon: Download
                },
                { 
                  title: 'EPF Monthly Electronic Challan (ECR)', 
                  desc: 'EPFO compliant text format dataset for upload to the Unified EPFO Employer Portal.',
                  action: 'Download ECR Format',
                  icon: PiggyBank
                },
                { 
                  title: 'State Professional Tax (Form 5A Statement)', 
                  desc: 'Commercial tax assessment form itemizing employee count and gross bracket slab rates.',
                  action: 'Generate Statement',
                  icon: FileText
                }
              ].map((rep, idx) => {
                const Icon = rep.icon;
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-brand-50 p-2.5 border border-brand-200 shrink-0">
                        <Icon className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{rep.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => showToast(`Generated report for ${userBranch} Hub: ${rep.title}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{rep.action}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollManagement;

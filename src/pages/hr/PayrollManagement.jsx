import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function PayrollManagement() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'structures' | 'payslips'
  const [selectedRun, setSelectedRun] = useState(storeData.payrollRuns[0] || null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Process New Payroll Period
  const handleGeneratePreview = (periodLabel, year, month) => {
    try {
      const run = hrmStore.processPayrollRun(periodLabel, year, month, currentUser.id, currentUser.name);
      setSelectedRun(run);
      showToast(`Payroll calculation generated for ${periodLabel}. Gross: ₹${run.totalGross.toLocaleString()}`);
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

  // Verify permission
  if (!permissions.canProcessPayroll) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
        <Lock className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-900">Confidential Finance Module Resticted</h2>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Salary structures, payroll calculations, and statutory deductions are strictly restricted to Finance, Central HR, and Global Admin users.
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

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 uppercase">
                Payroll Engine
              </span>
              <span className="text-xs text-slate-500">• Section 115BAC & Statutory Compliant</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Enterprise Payroll Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Salary structures, EPF (12%), Professional Tax (₹200), TDS deductions, approval workflow, and automated payslip distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGeneratePreview('November 2026', 2026, 11)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Play className="h-4 w-4" />
              <span>Run Nov 2026 Payroll</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 flex border-b border-slate-200 gap-2">
          {[
            { id: 'runs', label: 'Payroll Runs & Payouts' },
            { id: 'structures', label: 'Salary Master & CTC Breakdown' },
            { id: 'payslips', label: 'Published Payslips Archive' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Payroll Runs */}
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
                  {selectedRun.totalEmployees} Active Personnel Included Across All 3 Hubs
                </p>
              </div>

              {selectedRun.status !== 'Finalized' ? (
                <button
                  onClick={() => handleApprovePayroll(selectedRun.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Authorize & Finalize Payroll</span>
                </button>
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

            {/* Financial Aggregate Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">Total Gross Earnings</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹ {selectedRun.totalGross.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Basic + HRA + Special Allowances</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">Statutory Deductions</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">₹ {selectedRun.totalDeductions.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">EPF (12%) + PT (₹200) + TDS</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold text-slate-500">Total Net Disbursed</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₹ {selectedRun.totalNet.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">Direct Bank Payout Pushed</p>
              </div>
            </div>

            {/* Branch-wise breakdown */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Branch-Wise Disbursal Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(selectedRun.branchBreakdown || {}).map(([bKey, bData]) => {
                  const bName = bKey === 'HYD' ? 'Hyderabad' : bKey === 'CHE' ? 'Chennai' : 'Mumbai';
                  return (
                    <div key={bKey} className="rounded-xl border border-slate-200 p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">{bName} Hub</p>
                        <span className="text-[10px] font-mono font-bold text-slate-500">{bKey}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Headcount: <strong>{bData.count}</strong> employees
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
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                All Configured Payroll Periods
              </h3>
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
                {storeData.payrollRuns.map(run => (
                  <tr key={run.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{run.period}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{run.totalEmployees}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">₹ {run.totalGross.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">₹ {run.totalDeductions.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">₹ {run.totalNet.toLocaleString()}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Salary Structures */}
      {activeTab === 'structures' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Employee Salary Structures & Statutory Formulas
            </h3>
            <span className="text-xs text-slate-500">EPF: 12% on Basic | PT: ₹200 Standard</span>
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
                {storeData.employees.map(emp => {
                  const sal = storeData.salaryStructures[emp.id] || { basic: 45000, hra: 22500, specialAllowance: 22500, pf: 5400, pt: 200, gross: 90000, net: 79900 };
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{emp.employeeId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-800 font-medium">{emp.department}</p>
                        <p className="text-[11px] text-slate-500">{emp.branch}</p>
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payslips Archive */}
      {activeTab === 'payslips' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Published Monthly Payslips</h3>
          <p className="text-xs text-slate-500 mb-4">
            These documents are generated from approved payroll runs and rendered directly in each employee's My Finances portal.
          </p>

          <div className="space-y-3">
            {storeData.employees.map(emp => {
              const sal = storeData.salaryStructures[emp.id] || { gross: 90000, net: 79900 };
              return (
                <div key={emp.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{emp.name} — Payslip October 2026</p>
                      <p className="text-[11px] text-slate-500">Gross: ₹{sal.gross?.toLocaleString()} • Net Disbursed: ₹{sal.net?.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Downloaded simulated payslip for ${emp.name}`)}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Download Slip</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollManagement;

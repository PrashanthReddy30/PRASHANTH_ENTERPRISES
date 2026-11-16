import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  PieChart, 
  Percent, 
  Building, 
  Plus,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { taxFinancesData, currentUser } from '../data/mockData';

export function MyFinances() {
  const [activeTab, setActiveTab] = useState('summary');
  const [activeTaxSubTab, setActiveTaxSubTab] = useState('declaration');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">My Finances & Payroll</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                FY 2026 - 2027
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Salary structure, payslip generation, tax declarations, Form 16, and compliance under Prashanth Enterprises.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] text-slate-400 font-medium">PAN: {currentUser.panNumber}</p>
            <p className="text-xs font-bold text-slate-800">Tax Regime: <span className="text-brand-600">New Regime (115BAC)</span></p>
          </div>
        </div>

        {/* 3 Main Tabs: Summary, My Pay, Manage Taxes */}
        <div className="mt-6 flex border-b border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'summary', label: 'Summary', icon: Wallet },
            { id: 'mypay', label: 'My Pay (Salary & Payslips)', icon: CreditCard },
            { id: 'taxes', label: 'Manage Taxes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Monthly Gross Salary</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">₹ 1,85,000</p>
              <p className="text-[11px] text-slate-400 mt-1">Annual CTC: ₹ 22,20,000</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <p className="text-xs font-semibold text-emerald-800">Monthly Net Take-Home</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700">₹ 1,48,200</p>
              <p className="text-[11px] text-emerald-700/80 mt-1">Disbursed on last working day</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Total Monthly Deductions</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-600">₹ 36,800</p>
              <p className="text-[11px] text-slate-400 mt-1">PF (₹ 12k) + TDS (₹ 24.6k) + PT (₹ 200)</p>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Annual Compensation Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Basic Salary (40% of CTC)</span>
                <span className="font-semibold text-slate-900">₹ 8,88,000 / yr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA - 20% of CTC)</span>
                <span className="font-semibold text-slate-900">₹ 4,44,000 / yr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Special & Flexible Allowance</span>
                <span className="font-semibold text-slate-900">₹ 6,66,000 / yr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Employer Provident Fund (PF)</span>
                <span className="font-semibold text-slate-900">₹ 1,44,000 / yr</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-slate-900">
                <span>Total Cost to Company (CTC)</span>
                <span className="text-brand-600">₹ 22,20,000 / yr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Pay (My Salary, Payslips Download, Income Tax) */}
      {activeTab === 'mypay' && (
        <div className="space-y-6 animate-fade-in">
          {/* Salary Breakdown & Download */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Salary Breakdown</h3>
                <p className="text-xs text-slate-500">Based on October 2026 payroll run</p>
              </div>
              <button
                onClick={() => alert("Downloading latest Payslip (PDF format)...")}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition"
              >
                <Download className="h-4 w-4" />
                <span>Download Latest Slip</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-200/50 pb-2">
                  Earnings (₹ 1,85,000)
                </h4>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Pay</span>
                    <span className="font-semibold text-slate-800">₹ 74,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance</span>
                    <span className="font-semibold text-slate-800">₹ 37,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-semibold text-slate-800">₹ 66,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Statutory Bonus</span>
                    <span className="font-semibold text-slate-800">₹ 8,000.00</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 border-b border-rose-200/50 pb-2">
                  Deductions (₹ 36,800)
                </h4>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (Employee)</span>
                    <span className="font-semibold text-slate-800">₹ 12,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-semibold text-slate-800">₹ 24,600.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-semibold text-slate-800">₹ 200.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payslips Download Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Payslip Archive & Downloads</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Net Disbursed</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxFinancesData.recentPayslips.map((ps, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{ps.month}</td>
                    <td className="py-3 px-4 text-slate-700">{ps.gross}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{ps.net}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ps.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading payslip for ${ps.month}...`)}
                        className="inline-flex items-center gap-1 text-brand-600 font-bold hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Taxes (Declaration, Previous Income, Forms, Tax Filing, Tax Saving) */}
      {activeTab === 'taxes' && (
        <div className="space-y-4 animate-fade-in">
          {/* Subtabs for Tax */}
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto bg-slate-50 p-1 rounded-xl">
            {[
              { id: 'declaration', label: 'Declaration (80C/80D)' },
              { id: 'previous_income', label: 'Previous Income' },
              { id: 'forms', label: 'Forms (Form 16 & 12BB)' },
              { id: 'tax_filing', label: 'Tax Filing' },
              { id: 'tax_saving', label: 'Tax Saving' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveTaxSubTab(sub.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition ${
                  activeTaxSubTab === sub.id
                    ? 'bg-white shadow-xs text-brand-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Subtab Content 1: Declaration */}
          {activeTaxSubTab === 'declaration' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">IT Declaration & Investment Proofs</h3>
                  <p className="text-xs text-slate-500">Submit declaration under Chapter VI-A for TDS optimization.</p>
                </div>
                <button
                  onClick={() => alert("Declaration saved and verified for current financial year.")}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Save Declaration
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Section 80C (PPF, ELSS, Life Insurance, EPF)</h4>
                    <p className="text-[11px] text-slate-500">Maximum eligible limit: ₹ 1,50,000</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-800">Declared: ₹ 1,50,000</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Section 80D (Health Insurance / Mediclaim)</h4>
                    <p className="text-[11px] text-slate-500">Maximum self limit: ₹ 25,000 (Parents: ₹ 50,000)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-800">Declared: ₹ 25,000</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Section 80CCD (1B) - National Pension System (NPS)</h4>
                    <p className="text-[11px] text-slate-500">Additional deduction limit: ₹ 50,000</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-800">Declared: ₹ 50,000</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab Content 2: Previous Income */}
          {activeTaxSubTab === 'previous_income' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Previous Employer Income (Form 12B)</h3>
              <p className="text-xs text-slate-500 mt-1">If you joined Prashanth Enterprises during FY 2026-27, declare your previous earnings.</p>
              
              <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">No Previous Employer Record Required</p>
                <p className="mt-1 text-slate-500">Your tenure with Prashanth Enterprises started on 12 Jan 2021.</p>
              </div>
            </div>
          )}

          {/* Subtab Content 3: Forms (Form 16 & Form 12BB) */}
          {activeTaxSubTab === 'forms' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Statutory Tax Forms & Certificates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Form 16 (Part A & B) - Assessment Year 2026-27</h4>
                    <p className="text-[11px] text-slate-500">Certificate of tax deducted at source under Section 203</p>
                  </div>
                  <button 
                    onClick={() => alert("Downloading Form 16 PDF...")}
                    className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                    title="Download Form 16"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Form 12BB (Investment Declaration)</h4>
                    <p className="text-[11px] text-slate-500">Signed investment statement for tax auditor</p>
                  </div>
                  <button 
                    onClick={() => alert("Downloading Form 12BB PDF...")}
                    className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                    title="Download Form 12BB"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtab Content 4: Tax Filing */}
          {activeTaxSubTab === 'tax_filing' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">E-Filing & Annual Information Statement (AIS)</h3>
              <p className="text-xs text-slate-500 mt-1">E-file your Income Tax Return (ITR-1 / ITR-2) directly on the Income Tax Portal.</p>
              <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900">
                <p className="font-bold">Direct Income Tax Department E-Filing Integration</p>
                <p className="mt-1">Link your Aadhaar, download 26AS & AIS pre-filled JSON from the company intranet portal.</p>
                <button 
                  onClick={() => alert("Redirecting to Income Tax Portal (e-filing)...")}
                  className="mt-3 px-3 py-1.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700"
                >
                  Proceed to E-Filing Portal
                </button>
              </div>
            </div>
          )}

          {/* Subtab Content 5: Tax Saving */}
          {activeTaxSubTab === 'tax_saving' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Tax Saving Options & Regime Comparison</h3>
              <p className="text-xs text-slate-500 mt-1">Compare tax liability between the Old Tax Regime and New Tax Regime (Section 115BAC).</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40">
                  <span className="font-bold text-emerald-800">Active Choice: New Regime (Section 115BAC)</span>
                  <p className="mt-2 text-slate-600">Lower tax slab rates, standard deduction of ₹ 75,000, no need to lock funds in mandatory savings.</p>
                  <p className="mt-2 font-bold text-emerald-700">Estimated Annual Tax: ₹ 2,95,200</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-700">Old Tax Regime</span>
                  <p className="mt-2 text-slate-600">Allows HRA exemption, 80C up to ₹ 1.5L, 80D up to ₹ 25k, and Home Loan interest deduction.</p>
                  <p className="mt-2 font-bold text-slate-700">Estimated Annual Tax: ₹ 3,12,400</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyFinances;

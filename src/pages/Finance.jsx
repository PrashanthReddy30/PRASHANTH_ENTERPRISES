// Prashanth Enterprises HRMS
// Employee Side - Dedicated Finance & Payroll Module
// 3-Level Enterprise Navigation Architecture:
// Level 1: SUMMARY | PAYSLIP | MANAGE TAX
// Level 2 (under PAYSLIP): MY SALARY | PAYSLIPS | INCOME TAX
// Level 2 (under MANAGE TAX): TAX DECLARATION | PREVIOUS INCOME | TAX FORMS | TAX FILING | TAX SAVING
// Level 3: Dedicated working detail pages for each submenu with breadcrumbs and back navigation.

import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  CreditCard, 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft,
  PieChart, 
  Percent, 
  Building2, 
  Plus, 
  HelpCircle, 
  AlertCircle, 
  FileCheck, 
  Sparkles, 
  TrendingUp, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Lock, 
  Clock, 
  Eye, 
  Info, 
  Check, 
  X, 
  UploadCloud, 
  Filter,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taxFinancesData } from '../data/mockData';

export function Finance() {
  const { currentUser, storeData, hrmStore } = useAuth();

  // Navigation states: Level 1 (Main Section), Level 2 (Submenu)
  const [mainSection, setMainSection] = useState('summary'); // 'summary' | 'payslip' | 'manageTax'
  const [payslipSubSection, setPayslipSubSection] = useState('mySalary'); // 'mySalary' | 'payslips' | 'incomeTax'
  const [taxSubSection, setTaxSubSection] = useState('declaration'); // 'declaration' | 'previousIncome' | 'forms' | 'filing' | 'saving'

  // Filter states
  const [selectedFY, setSelectedFY] = useState('2026-2027');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Modals state
  const [selectedPayslipModal, setSelectedPayslipModal] = useState(null);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showPrevIncomeModal, setShowPrevIncomeModal] = useState(false);

  // Form states
  const [declarationForm, setDeclarationForm] = useState({
    category: 'Section 80C',
    amount: '',
    documentName: ''
  });

  const [prevIncomeForm, setPrevIncomeForm] = useState({
    employerName: '',
    duration: '',
    grossSalary: '',
    taxableSalary: '',
    tdsDeducted: '',
    pfUan: ''
  });

  // Dynamic Resolution of Authenticated Employee (Strict Data Privacy)
  const employee = useMemo(() => {
    return (storeData?.employees || []).find(e => 
      e.id === currentUser?.id || e.employeeId === currentUser?.employeeId
    ) || currentUser || {};
  }, [storeData?.employees, currentUser]);

  // Dynamic Salary Structure from Master Store
  const salary = useMemo(() => {
    const raw = storeData?.salaryStructures?.[employee.id] || {
      basic: 45000,
      hra: 22500,
      specialAllowance: 22500,
      pf: 5400,
      pt: 200,
      tds: 4500,
      gross: 90000,
      net: 79900
    };

    const basic = Number(raw.basic || 45000);
    const hra = Number(raw.hra || 22500);
    const specialAllowance = Number(raw.specialAllowance || 22500);
    const gross = Number(raw.gross || (basic + hra + specialAllowance));
    const pf = Number(raw.pf || 5400);
    const pt = Number(raw.pt || 200);
    const tds = Number(raw.tds || 4500);
    const totalDeductions = pf + pt + tds;
    const net = Number(raw.net || (gross - totalDeductions));

    // Employer Contributions (Computed separately as required)
    const employerPf = pf; // 12% employer matching contribution
    const employerEps = Math.round(basic * 0.0833);
    const gratuityMonthly = Math.round((basic * 15) / (26 * 12));
    const employerTotal = employerPf + gratuityMonthly;
    const monthlyCtc = gross + employerTotal;
    const annualCtc = monthlyCtc * 12;

    return {
      basic,
      hra,
      specialAllowance,
      otherEarnings: 0,
      gross,
      pf,
      pt,
      tds,
      esi: 0, // ESI applicable only for gross <= 21000
      medicalInsurance: 0, // Fully company-sponsored ₹5L floater
      totalDeductions,
      net,
      employerPf,
      employerEps,
      gratuityMonthly,
      employerTotal,
      monthlyCtc,
      annualCtc
    };
  }, [storeData?.salaryStructures, employee.id]);

  // Year to Date (YTD) Estimates for current FY (7 months: Apr-Oct 2026)
  const ytd = useMemo(() => {
    const monthsElapsed = 7;
    return {
      months: monthsElapsed,
      gross: salary.gross * monthsElapsed,
      net: salary.net * monthsElapsed,
      tds: salary.tds * monthsElapsed,
      pf: salary.pf * monthsElapsed,
      pt: salary.pt * monthsElapsed
    };
  }, [salary]);

  // Income Tax Projection (FY 2026-27 - Assessment Year 2027-28)
  const incomeTaxCalc = useMemo(() => {
    const annualGross = salary.gross * 12;
    const standardDeduction = 75000; // FY 2026-27 revised standard deduction for salaried
    const taxableIncome = Math.max(0, annualGross - standardDeduction);

    // New Tax Regime (Section 115BAC) Slabs for FY 2026-27:
    // 0 - 3L: Nil
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // > 15L: 30%
    let tax = 0;
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      tax += 300000 * 0.20; // 12-15L
      tax += 200000 * 0.15; // 10-12L
      tax += 300000 * 0.10; // 7-10L
      tax += 400000 * 0.05; // 3-7L
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      tax += 200000 * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 700000) {
      tax += (taxableIncome - 700000) * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    // Section 87A rebate: Nil tax if taxable income <= 7,00,000
    if (taxableIncome <= 700000) {
      tax = 0;
    }

    const cess = Math.round(tax * 0.04);
    const totalAnnualTax = Math.round(tax + cess);
    const taxDeductedYtd = salary.tds * 7;
    const remainingEstimatedTax = Math.max(0, totalAnnualTax - taxDeductedYtd);
    const monthlyTds = Math.round(remainingEstimatedTax / 5); // 5 months remaining (Nov, Dec, Jan, Feb, Mar)

    // Old Regime Comparison
    const oldStdDeduction = 50000;
    const old80C = 150000;
    const old80D = 25000;
    const oldTaxable = Math.max(0, annualGross - oldStdDeduction - old80C - old80D);
    let oldTax = 0;
    if (oldTaxable > 1000000) {
      oldTax += (oldTaxable - 1000000) * 0.30 + 112500;
    } else if (oldTaxable > 500000) {
      oldTax += (oldTaxable - 500000) * 0.20 + 12500;
    } else if (oldTaxable > 250000) {
      oldTax += (oldTaxable - 250000) * 0.05;
    }
    const oldTotalAnnual = Math.round(oldTax * 1.04);

    return {
      annualGross,
      standardDeduction,
      taxableIncome,
      totalAnnualTax,
      taxDeductedYtd,
      remainingEstimatedTax,
      monthlyTds: salary.tds,
      oldRegimeTax: oldTotalAnnual,
      taxSavingsWithNewRegime: Math.max(0, oldTotalAnnual - totalAnnualTax)
    };
  }, [salary]);

  // Month-wise Payslips for FY 2026-27
  const payslipsList = useMemo(() => {
    const months = [
      { month: 'October 2026', period: '2026-10', date: '31 Oct 2026', status: 'Paid & Disbursed' },
      { month: 'September 2026', period: '2026-09', date: '30 Sep 2026', status: 'Paid & Disbursed' },
      { month: 'August 2026', period: '2026-08', date: '31 Aug 2026', status: 'Paid & Disbursed' },
      { month: 'July 2026', period: '2026-07', date: '31 Jul 2026', status: 'Paid & Disbursed' },
      { month: 'June 2026', period: '2026-06', date: '30 Jun 2026', status: 'Paid & Disbursed' },
      { month: 'May 2026', period: '2026-05', date: '31 May 2026', status: 'Paid & Disbursed' },
      { month: 'April 2026', period: '2026-04', date: '30 Apr 2026', status: 'Paid & Disbursed' }
    ];

    return months.map(m => ({
      id: `PAY-${m.period}-${employee.id || 'PE001'}`,
      month: m.month,
      disbursementDate: m.date,
      basic: salary.basic,
      hra: salary.hra,
      specialAllowance: salary.specialAllowance,
      gross: salary.gross,
      pf: salary.pf,
      pt: salary.pt,
      tds: salary.tds,
      totalDeductions: salary.totalDeductions,
      net: salary.net,
      paymentMode: 'Direct NEFT Salary Credit',
      status: m.status
    }));
  }, [employee.id, salary]);

  // Tax Declarations List (Interactive state)
  const [declarations, setDeclarations] = useState([
    {
      id: 'DEC-80C',
      section: 'Section 80C',
      description: 'PPF, EPF, ELSS, Life Insurance, Home Loan Principal',
      maxLimit: '₹ 1,50,000',
      declared: 150000,
      verified: 150000,
      status: 'Approved & Verified',
      documents: ['PPF_Receipt_2026.pdf', 'LIC_Premium_Oct2026.pdf'],
      updatedDate: '14 Oct 2026'
    },
    {
      id: 'DEC-80D',
      section: 'Section 80D',
      description: 'Mediclaim & Health Insurance (Self: ₹25k, Parents: ₹50k)',
      maxLimit: '₹ 75,000',
      declared: 25000,
      verified: 25000,
      status: 'Approved & Verified',
      documents: ['StarHealth_Receipt_2026.pdf'],
      updatedDate: '14 Oct 2026'
    },
    {
      id: 'DEC-80CCD',
      section: 'Section 80CCD (1B)',
      description: 'National Pension System (NPS) Additional Contribution',
      maxLimit: '₹ 50,000',
      declared: 50000,
      verified: 50000,
      status: 'Approved & Verified',
      documents: ['NPS_Tier1_PRAN_Statement.pdf'],
      updatedDate: '15 Oct 2026'
    },
    {
      id: 'DEC-HRA',
      section: 'House Rent Allowance (HRA)',
      description: 'Rental payment receipts & Landlord PAN declaration',
      maxLimit: 'As per HRA Rules',
      declared: 0,
      verified: 0,
      status: 'Not Applicable (New Tax Regime)',
      documents: [],
      updatedDate: '01 Apr 2026'
    },
    {
      id: 'DEC-24B',
      section: 'Section 24(b)',
      description: 'Interest on Housing Loan for Self-Occupied Property',
      maxLimit: '₹ 2,00,000',
      declared: 0,
      verified: 0,
      status: 'Not Declared',
      documents: [],
      updatedDate: '01 Apr 2026'
    }
  ]);

  // Salary Revision History
  const salaryRevisions = useMemo(() => {
    return employee.salaryHistory || [
      { effectiveDate: '01 Apr 2026', gross: salary.gross, basic: salary.basic, hike: '15%', reason: 'Annual Merit & Performance Increment', approvedBy: 'Prashanth Reddy (Director)' },
      { effectiveDate: employee.joiningDate || '12 Jan 2024', gross: Math.round(salary.gross * 0.85), basic: Math.round(salary.basic * 0.85), hike: 'Baseline', reason: 'Initial Corporate Onboarding Package', approvedBy: 'Pooja Hegde (VP HR)' }
    ];
  }, [employee.salaryHistory, employee.joiningDate, salary]);

  // Bank Account Masked
  const bankDetails = useMemo(() => {
    return employee.bankDetails || {
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '•••• •••• •••• 4821',
      ifscCode: 'HDFC0001823',
      branchName: `${employee.branch || 'Hyderabad'} Tech Hub Branch`,
      accountType: 'Corporate Salary Account'
    };
  }, [employee.bankDetails, employee.branch]);

  // Currency Formatter
  const formatINR = (val) => {
    return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
  };

  // Handle Declaration Submission
  const handleSaveDeclaration = (e) => {
    e.preventDefault();
    if (!declarationForm.amount) {
      alert('Please enter a valid declaration amount.');
      return;
    }
    setDeclarations(prev => prev.map(d => {
      if (d.section.toLowerCase().includes(declarationForm.category.toLowerCase())) {
        return {
          ...d,
          declared: Number(declarationForm.amount),
          status: 'Pending HR Verification',
          documents: declarationForm.documentName ? [...d.documents, declarationForm.documentName] : d.documents,
          updatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      }
      return d;
    }));
    alert(`Declaration of ${formatINR(declarationForm.amount)} for ${declarationForm.category} submitted successfully. Sent to Corporate HR for audit verification.`);
    setShowDeclarationModal(false);
    setDeclarationForm({ category: 'Section 80C', amount: '', documentName: '' });
  };

  // Breadcrumb Generator
  const getBreadcrumbs = () => {
    const crumbs = [
      { label: 'Finance', onClick: () => { setMainSection('summary'); } }
    ];

    if (mainSection === 'summary') {
      crumbs.push({ label: 'Summary', active: true });
    } else if (mainSection === 'payslip') {
      crumbs.push({ label: 'Payslip', onClick: () => setPayslipSubSection('mySalary') });
      if (payslipSubSection === 'mySalary') crumbs.push({ label: 'My Salary', active: true });
      if (payslipSubSection === 'payslips') crumbs.push({ label: 'Payslips', active: true });
      if (payslipSubSection === 'incomeTax') crumbs.push({ label: 'Income Tax', active: true });
    } else if (mainSection === 'manageTax') {
      crumbs.push({ label: 'Manage Tax', onClick: () => setTaxSubSection('declaration') });
      if (taxSubSection === 'declaration') crumbs.push({ label: 'Tax Declaration', active: true });
      if (taxSubSection === 'previousIncome') crumbs.push({ label: 'Previous Income', active: true });
      if (taxSubSection === 'forms') crumbs.push({ label: 'Tax Forms', active: true });
      if (taxSubSection === 'filing') crumbs.push({ label: 'Tax Filing', active: true });
      if (taxSubSection === 'saving') crumbs.push({ label: 'Tax Saving', active: true });
    }

    return crumbs;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & THREE MAIN SECTIONS (LEVEL 1 NAVIGATION)      */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">Finance & Payroll Portal</h1>
                <p className="text-xs text-slate-500">
                  Prashanth Enterprises · Employee Financial Management
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                FY {selectedFY}
              </span>
            </div>
          </div>

          {/* Employee & Tax Summary Card */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
            <div>
              <p className="text-[11px] text-slate-500">Employee: <strong className="text-slate-800">{employee.name}</strong> ({employee.employeeId || employee.id})</p>
              <p className="text-[11px] text-slate-500">PAN: <strong className="font-mono text-slate-800">{employee.panNumber || 'ABCDE1234F'}</strong> · Regime: <strong className="text-brand-600">New (115BAC)</strong></p>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation Trail */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          {getBreadcrumbs().map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              {crumb.active ? (
                <span className="font-bold text-slate-900">{crumb.label}</span>
              ) : (
                <button
                  onClick={crumb.onClick}
                  className="font-medium text-brand-600 hover:text-brand-800 hover:underline transition"
                >
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* LEVEL 1: MAIN NAVIGATION TABS */}
        <div className="mt-4 flex border-b border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'summary', label: 'Summary', icon: PieChart, desc: 'Financial Overview' },
            { id: 'payslip', label: 'Payslip', icon: CreditCard, desc: 'Salary, Slips & TDS' },
            { id: 'manageTax', label: 'Manage Tax', icon: FileCheck, desc: 'Declarations & Forms' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mainSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMainSection(tab.id);
                  if (tab.id === 'payslip' && !payslipSubSection) setPayslipSubSection('mySalary');
                  if (tab.id === 'manageTax' && !taxSubSection) setTaxSubSection('declaration');
                }}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                  active
                    ? 'border-brand-600 text-brand-600 bg-brand-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECTION 1: FINANCE → SUMMARY                               */}
      {/* ============================================================== */}
      {mainSection === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters Bar: FY and Month */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Financial Filters:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="2026-2027">Financial Year: 2026 - 2027</option>
                <option value="2025-2026">Financial Year: 2025 - 2026</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="October 2026">Payroll Month: October 2026</option>
                <option value="September 2026">Payroll Month: September 2026</option>
                <option value="August 2026">Payroll Month: August 2026</option>
              </select>
            </div>
          </div>

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Current Monthly Gross</span>
                <DollarSign className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{formatINR(salary.gross)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Annual CTC: {formatINR(salary.annualCtc)}</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-semibold">Net Salary (Take-Home)</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-700">{formatINR(salary.net)}</p>
              <p className="text-[11px] text-emerald-700/80 mt-1">Disbursed via Direct NEFT</p>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-rose-700">
                <span className="text-xs font-semibold">Total Monthly Deductions</span>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-rose-600">{formatINR(salary.totalDeductions)}</p>
              <p className="text-[11px] text-rose-600/80 mt-1">PF ({formatINR(salary.pf)}) + TDS ({formatINR(salary.tds)}) + PT</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-xs font-semibold">Latest Salary Payment</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-2 text-lg font-bold text-blue-900">31 Oct 2026</p>
              <p className="text-[11px] text-blue-700 mt-1 font-medium">Status: <span className="font-bold text-emerald-600">Paid & Disbursed</span></p>
            </div>
          </div>

          {/* Salary Breakdown & YTD Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Earnings & Deductions Breakdown */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Monthly Compensation Structure</h3>
                  <p className="text-xs text-slate-500">Components for {selectedMonth}</p>
                </div>
                <button
                  onClick={() => {
                    setMainSection('payslip');
                    setPayslipSubSection('mySalary');
                  }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <span>Detailed Structure</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Earnings List */}
                <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 text-emerald-700">
                    Earnings
                  </p>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.basic)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.hra)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Special & Other Allowances</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.specialAllowance)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200 font-bold text-slate-900">
                    <span>Gross Monthly Salary</span>
                    <span className="text-emerald-700">{formatINR(salary.gross)}</span>
                  </div>
                </div>

                {/* Deductions List */}
                <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 text-rose-700">
                    Authorized Deductions
                  </p>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Employee PF (12%)</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.pf)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Income Tax (Monthly TDS)</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.tds)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-semibold text-slate-900">{formatINR(salary.pt)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">Employee ESI</span>
                    <span className="font-semibold text-slate-500">₹ 0 (Exempt)</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200 font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span className="text-rose-600">{formatINR(salary.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Latest Payment Alert Banner */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900">Latest Salary Successfully Disbursed</p>
                    <p className="text-emerald-700 text-[11px]">
                      {selectedMonth} salary of <strong className="font-semibold">{formatINR(salary.net)}</strong> was credited to {bankDetails.bankName} (A/C: {bankDetails.accountNumber}).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayslipModal(payslipsList[0])}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shrink-0 transition"
                >
                  View Payslip
                </button>
              </div>
            </div>

            {/* Year-to-Date (YTD) & Tax Status Widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Year-to-Date (YTD) Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-[11px]">YTD Cumulative Gross (7 Months)</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatINR(ytd.gross)}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-[11px]">YTD Tax Deducted at Source (TDS)</p>
                  <p className="text-lg font-bold text-rose-600 mt-0.5">{formatINR(ytd.tds)}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-[11px]">YTD Provident Fund (PF Accumulation)</p>
                  <p className="text-lg font-bold text-blue-600 mt-0.5">{formatINR(ytd.pf * 2)}</p>
                  <p className="text-[10px] text-slate-400">Employee ({formatINR(ytd.pf)}) + Employer Matching ({formatINR(ytd.pf)})</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-[11px]">Tax Declaration Status</p>
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">Approved & Verified</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      New Regime
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMainSection('payslip');
                      setPayslipSubSection('payslips');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
                  >
                    <Download className="h-3.5 w-3.5 text-brand-600" />
                    <span>Access All 7 Available Payslips</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 2: FINANCE → PAYSLIP (3-LEVEL NAVIGATION)          */}
      {/* ============================================================== */}
      {mainSection === 'payslip' && (
        <div className="space-y-6 animate-fade-in">
          {/* Submenu Level 2 Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'mySalary', label: 'My Salary', icon: CreditCard },
                { id: 'payslips', label: 'Payslips', icon: FileText },
                { id: 'incomeTax', label: 'Income Tax', icon: Percent },
              ].map((sub) => {
                const Icon = sub.icon;
                const active = payslipSubSection === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setPayslipSubSection(sub.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                      active
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMainSection('summary')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Summary</span>
            </button>
          </div>

          {/* SUB-SECTION 2A: MY SALARY */}
          {payslipSubSection === 'mySalary' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Official Salary Structure (CTC Master)</h2>
                    <p className="text-xs text-slate-500">
                      Effective Date: <strong className="text-slate-800">01 April 2026</strong> · Approved under Prashanth Enterprises Corporate Compensation Policy
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Total Annual CTC</span>
                    <p className="text-xl font-black text-brand-600">{formatINR(salary.annualCtc)}</p>
                  </div>
                </div>

                {/* Complete Salary Master Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Salary Component</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4 text-right">Monthly Amount (₹)</th>
                        <th className="py-3 px-4 text-right">Annual Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Section 1: Earnings */}
                      <tr className="bg-emerald-50/40">
                        <td colSpan={4} className="py-2 px-4 font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
                          Part A: Direct Earnings (Gross Salary)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Basic Salary</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.basic)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.basic * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">House Rent Allowance (HRA)</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.hra)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.hra * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Special & Flexible Allowance</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.specialAllowance)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.specialAllowance * 12)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="py-2.5 px-4">Gross Earnings (A)</td>
                        <td className="py-2.5 px-4">-</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">{formatINR(salary.gross)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">{formatINR(salary.gross * 12)}</td>
                      </tr>

                      {/* Section 2: Employee Deductions */}
                      <tr className="bg-rose-50/40">
                        <td colSpan={4} className="py-2 px-4 font-bold text-rose-800 text-[11px] uppercase tracking-wider">
                          Part B: Authorized Employee Deductions
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Employee Provident Fund (EPF - 12%)</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.pf)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.pf * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Income Tax (Monthly TDS)</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.tds)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.tds * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Professional Tax (PT - State Govt)</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.pt)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.pt * 12)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="py-2.5 px-4">Total Employee Deductions (B)</td>
                        <td className="py-2.5 px-4">-</td>
                        <td className="py-2.5 px-4 text-right font-mono text-rose-600">{formatINR(salary.totalDeductions)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-rose-600">{formatINR(salary.totalDeductions * 12)}</td>
                      </tr>

                      {/* Section 3: Employer Contributions (Separately shown as requested!) */}
                      <tr className="bg-blue-50/40">
                        <td colSpan={4} className="py-2 px-4 font-bold text-blue-800 text-[11px] uppercase tracking-wider">
                          Part C: Employer Contributions & Benefits (Separate from Take-Home)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Employer Provident Fund (PF Matching 12%)</td>
                        <td className="py-2.5 px-4 text-slate-500">Monthly Benefit</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.employerPf)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.employerPf * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Gratuity Accrual (4.81% of Basic)</td>
                        <td className="py-2.5 px-4 text-slate-500">Annual Accrual</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.gratuityMonthly)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-800">{formatINR(salary.gratuityMonthly * 12)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Group Medical & Accident Insurance (₹ 5,00,000 Floater)</td>
                        <td className="py-2.5 px-4 text-slate-500">Company Sponsored</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">Covered (100%)</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">Covered (100%)</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="py-2.5 px-4">Total Employer Benefits (C)</td>
                        <td className="py-2.5 px-4">-</td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-700">{formatINR(salary.employerTotal)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-blue-700">{formatINR(salary.employerTotal * 12)}</td>
                      </tr>

                      {/* Net Payable Row */}
                      <tr className="bg-brand-50/60 font-extrabold text-slate-900 text-sm">
                        <td className="py-3 px-4 text-brand-900">Net Take-Home Salary Payable (A - B)</td>
                        <td className="py-3 px-4 text-slate-500 text-xs font-normal">Monthly Net Transfer</td>
                        <td className="py-3 px-4 text-right font-mono text-brand-700">{formatINR(salary.net)}</td>
                        <td className="py-3 px-4 text-right font-mono text-brand-700">{formatINR(salary.net * 12)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bank Details & Salary History Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Bank Account */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200 pb-2">
                      <Building2 className="h-4 w-4 text-brand-600" />
                      <span>Corporate Salary Bank Account</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Bank Name</span>
                      <span className="font-semibold text-slate-800">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Account Number</span>
                      <span className="font-mono font-bold text-slate-900">{bankDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">IFSC Code</span>
                      <span className="font-mono font-semibold text-slate-800">{bankDetails.ifscCode}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Disbursement Mode</span>
                      <span className="font-semibold text-emerald-700">Direct Electronic NEFT / RTGS</span>
                    </div>
                  </div>

                  {/* Salary Revision History */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200 pb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Salary Revision & Increment History</span>
                    </div>
                    {salaryRevisions.map((rev, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-0">
                        <div>
                          <p className="font-bold text-slate-800">{rev.effectiveDate}</p>
                          <p className="text-[11px] text-slate-500">{rev.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-700">{formatINR(rev.gross)}/mo</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {rev.hike || 'Revised'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 2B: PAYSLIPS */}
          {payslipSubSection === 'payslips' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Month-wise Payslips Archive</h2>
                    <p className="text-xs text-slate-500">
                      Digitally signed monthly payslips for Prashanth Enterprises employees
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Filter Year:</span>
                    <select
                      value={selectedFY}
                      onChange={(e) => setSelectedFY(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <option value="2026-2027">FY 2026-2027 (Current)</option>
                      <option value="2025-2026">FY 2025-2026 (Past Year)</option>
                    </select>
                  </div>
                </div>

                {/* Payslips Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Salary Month</th>
                        <th className="py-3 px-4">Payment Date</th>
                        <th className="py-3 px-4">Gross Earnings</th>
                        <th className="py-3 px-4">Total Deductions</th>
                        <th className="py-3 px-4">Net Salary Disbursed</th>
                        <th className="py-3 px-4">Payment Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payslipsList.map((ps) => (
                        <tr key={ps.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-brand-600" />
                            <span>{ps.month}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{ps.disbursementDate}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{formatINR(ps.gross)}</td>
                          <td className="py-3.5 px-4 font-mono text-rose-600">{formatINR(ps.totalDeductions)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{formatINR(ps.net)}</td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              {ps.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedPayslipModal(ps)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                                title="View Corporate Payslip"
                              >
                                <Eye className="h-3.5 w-3.5 text-brand-600" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayslipModal(ps);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                                title="Print Payslip"
                              >
                                <Printer className="h-3.5 w-3.5 text-slate-500" />
                                <span>Print</span>
                              </button>
                              <button
                                onClick={() => alert(`Downloading signed PDF for ${ps.month} (${ps.id}.pdf)...`)}
                                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-700 shadow-xs"
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 2C: INCOME TAX */}
          {payslipSubSection === 'incomeTax' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Income Tax Computation & Projected TDS</h2>
                    <p className="text-xs text-slate-500">
                      Assessment Year 2027-28 · Financial Year 2026-27 under Section 115BAC (New Tax Regime)
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                    Active Choice: New Regime
                  </span>
                </div>

                {/* CRITICAL PROMPT REQUIREMENT: Clear Distinction Banner */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Info className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Important: Estimated Tax Projection vs Finalized Payroll TDS</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    The tax figures shown below represent your <strong>projected annual tax liability</strong> computed on your annual CTC. <strong>Finalized payroll TDS</strong> is deducted monthly based on actual submitted and verified investment declarations by 15 January 2027. If any extra tax is deducted, it will be refunded during your annual ITR return filing.
                  </p>
                </div>

                {/* Tax Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Computation Table */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                      Annual Income Tax Computation Sheet
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-600">Annual Gross Salary (CTC Component)</span>
                        <span className="font-mono font-bold text-slate-900">{formatINR(incomeTaxCalc.annualGross)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-emerald-700">
                        <span>Less: Standard Deduction (Section 16(ia))</span>
                        <span className="font-mono font-semibold">- {formatINR(incomeTaxCalc.standardDeduction)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-emerald-700">
                        <span>Less: Eligible Chapter VI-A Deductions</span>
                        <span className="font-mono font-semibold">₹ 0 (Exempt in New Regime)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-slate-200 font-bold text-slate-900">
                        <span>Net Taxable Income</span>
                        <span className="font-mono text-brand-700">{formatINR(incomeTaxCalc.taxableIncome)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projected TDS Table */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                      Projected Annual Tax & Monthly TDS
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-600">Estimated Total Annual Tax</span>
                        <span className="font-mono font-bold text-slate-900">{formatINR(incomeTaxCalc.totalAnnualTax)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-blue-700">
                        <span>Tax Already Deducted at Source (YTD)</span>
                        <span className="font-mono font-semibold">{formatINR(incomeTaxCalc.taxDeductedYtd)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-rose-700">
                        <span>Remaining Estimated Tax (Nov 2026 - Mar 2027)</span>
                        <span className="font-mono font-bold">{formatINR(incomeTaxCalc.remainingEstimatedTax)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-slate-200 font-bold text-slate-900">
                        <span>Projected Monthly TDS Deduction</span>
                        <span className="font-mono text-emerald-700">{formatINR(salary.tds)} / mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SECTION 3: FINANCE → MANAGE TAX (5 SUBMENUS)               */}
      {/* ============================================================== */}
      {mainSection === 'manageTax' && (
        <div className="space-y-6 animate-fade-in">
          {/* Submenu Level 2 Bar: 5 Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'declaration', label: 'Tax Declaration', icon: FileCheck },
                { id: 'previousIncome', label: 'Previous Income', icon: Building2 },
                { id: 'forms', label: 'Tax Forms', icon: FileText },
                { id: 'filing', label: 'Tax Filing', icon: ShieldCheck },
                { id: 'saving', label: 'Tax Saving', icon: Sparkles },
              ].map((sub) => {
                const Icon = sub.icon;
                const active = taxSubSection === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setTaxSubSection(sub.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 ${
                      active
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMainSection('summary')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Summary</span>
            </button>
          </div>

          {/* SUB-SECTION 3A: TAX DECLARATION */}
          {taxSubSection === 'declaration' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Annual Tax Declaration (Chapter VI-A)</h2>
                    <p className="text-xs text-slate-500">
                      Submit investment declarations and proof documents for TDS optimization under Prashanth Enterprises
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeclarationModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Submit / Update Declaration</span>
                  </button>
                </div>

                {/* Declarations Cards */}
                <div className="space-y-3">
                  {declarations.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">{item.section}</h3>
                            <span className="text-[10px] text-slate-400">Max Limit: {item.maxLimit}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[11px] text-slate-400">Declared Amount</p>
                            <p className="font-mono text-xs font-bold text-slate-900">{formatINR(item.declared)}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            item.status.includes('Approved') || item.status.includes('Verified')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status.includes('Pending')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Supporting Documents if any */}
                      {item.documents && item.documents.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex-wrap">
                          <span className="font-semibold text-slate-500">Verified Proofs:</span>
                          {item.documents.map((doc, dIdx) => (
                            <span key={dIdx} className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-slate-200 font-mono text-[10px] text-brand-600">
                              <FileCheck className="h-3 w-3" />
                              <span>{doc}</span>
                            </span>
                          ))}
                          <span className="text-slate-400 text-[10px] ml-auto">Last updated: {item.updatedDate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 3B: PREVIOUS INCOME */}
          {taxSubSection === 'previousIncome' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Previous Employer Income (Form 12B)</h2>
                    <p className="text-xs text-slate-500">
                      If you joined Prashanth Enterprises during FY 2026-27, declare your previous earnings and TDS for consolidated taxation
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPrevIncomeModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Previous Employer Income</span>
                  </button>
                </div>

                {/* Status Notice */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Current Tenure Status</span>
                  </div>
                  <p>
                    Your tenure with Prashanth Enterprises started on <strong className="text-slate-800">{employee.joiningDate || '12 Jan 2024'}</strong>.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Since your employment pre-dates the current financial year (FY 2026-27), Form 12B is not mandatory unless you held concurrent employment. All salary earnings and TDS for FY 2026-27 are tracked directly through Prashanth Enterprises payroll.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 3C: TAX FORMS */}
          {taxSubSection === 'forms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">Official Tax Forms & Certificates</h2>
                  <p className="text-xs text-slate-500">
                    Download official government and corporate tax certificates
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Form 16 (Part A & B)',
                      ay: 'Assessment Year 2026 - 2027',
                      desc: 'Certificate of tax deducted at source under Section 203 of the Income Tax Act (TRACES verified)',
                      file: `Form16_${employee.id || 'PE001'}_AY2026-27.pdf`
                    },
                    {
                      title: 'Form 12BB (Investment Claims)',
                      ay: 'Financial Year 2026 - 2027',
                      desc: 'Statement of claims by employee for deduction of tax under Section 192',
                      file: `Form12BB_${employee.id || 'PE001'}_FY2026-27.pdf`
                    },
                    {
                      title: 'Investment Proofs Acknowledgement',
                      ay: 'Financial Year 2026 - 2027',
                      desc: 'HR audit signed receipt for 80C, 80D, and NPS documents submitted',
                      file: `InvestmentReceipt_${employee.id || 'PE001'}.pdf`
                    },
                    {
                      title: 'Annual Tax Declaration Document',
                      ay: 'Financial Year 2026 - 2027',
                      desc: 'Consolidated declaration under New Tax Regime Section 115BAC',
                      file: `TaxDeclaration_${employee.id || 'PE001'}.pdf`
                    }
                  ].map((form, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{form.title}</h3>
                          <span className="text-[10px] font-semibold text-brand-600">{form.ay}</span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Signed & Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{form.desc}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="font-mono text-[10px] text-slate-400">{form.file}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => alert(`Opening preview of ${form.title}...`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
                          >
                            <Eye className="h-3 w-3 text-brand-600" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => alert(`Downloading official PDF for ${form.title}...`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-xs font-bold text-white hover:bg-brand-700 shadow-xs"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 3D: TAX FILING */}
          {taxSubSection === 'filing' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">E-Filing Information & Return Preparation</h2>
                  <p className="text-xs text-slate-500">
                    Annual Information Statement (AIS) and ITR-1 Sahaj filing guidance for salaried employees
                  </p>
                </div>

                {/* CRITICAL PROMPT REQUIREMENT: Clear Non-Claim Employer Disclaimer */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    <span>Official Employer Filing Disclaimer & Responsibility Notice</span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    Prashanth Enterprises provides all statutory certificates, Form 16 (Part A & B), and reconciles monthly TDS with the Income Tax Department's TRACES portal. <strong>Prashanth Enterprises does not file personal income tax returns on behalf of employees.</strong> Individual return filing (ITR-1 / ITR-2) must be filed and e-verified directly by each employee on the government Income Tax e-filing portal (<strong>incometax.gov.in</strong>) by the statutory deadline (31 July 2027).
                  </p>
                </div>

                {/* Step-by-Step Filing Instructions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Step-by-Step ITR Filing Procedure
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                        1
                      </div>
                      <p className="font-bold text-slate-900">Download Form 16</p>
                      <p className="text-[11px] text-slate-500">From the Tax Forms section, download your digitally signed Form 16 (Part A & B).</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                        2
                      </div>
                      <p className="font-bold text-slate-900">Verify AIS & 26AS</p>
                      <p className="text-[11px] text-slate-500">Log in to incometax.gov.in and check that Prashanth Enterprises TDS matches your 26AS.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                        3
                      </div>
                      <p className="font-bold text-slate-900">Submit ITR-1 Sahaj</p>
                      <p className="text-[11px] text-slate-500">Choose New Tax Regime (115BAC), confirm pre-filled salary figures, and submit.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                        4
                      </div>
                      <p className="font-bold text-slate-900">E-Verify via Aadhaar</p>
                      <p className="text-[11px] text-slate-500">Complete Aadhaar OTP e-verification within 30 days to finalize your return processing.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <a
                    href="https://www.incometax.gov.in/iec/fportal/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
                  >
                    <span>Proceed to Government Income Tax E-Filing Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 3E: TAX SAVING */}
          {taxSubSection === 'saving' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900">Tax Saving Options & Regime Comparison</h2>
                  <p className="text-xs text-slate-500">
                    Live comparative evaluation between New Regime (Section 115BAC) and Old Tax Regime based on your actual salary
                  </p>
                </div>

                {/* Comparative Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* New Regime Card */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 space-y-3 relative shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 text-sm">New Tax Regime (Section 115BAC)</span>
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                        Recommended & Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Standard deduction of ₹ 75,000, concessional tax slabs, and zero mandatory investment lock-in.
                    </p>
                    <div className="pt-2 space-y-1.5 text-xs border-t border-emerald-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Standard Deduction:</span>
                        <span className="font-bold text-slate-800">₹ 75,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Taxable Income:</span>
                        <span className="font-bold text-slate-800">{formatINR(incomeTaxCalc.taxableIncome)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-extrabold text-sm pt-2 border-t border-emerald-200">
                        <span>Estimated Annual Tax:</span>
                        <span>{formatINR(incomeTaxCalc.totalAnnualTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Old Regime Card */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">Old Tax Regime</span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        Higher Slabs
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Allows 80C (₹ 1.5L), 80D (₹ 25k), and HRA deductions, but has higher tax rates above ₹ 5 Lakhs.
                    </p>
                    <div className="pt-2 space-y-1.5 text-xs border-t border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Standard Deduction:</span>
                        <span className="font-bold text-slate-800">₹ 50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Deductions (80C + 80D):</span>
                        <span className="font-bold text-slate-800">₹ 1,75,000</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-2 border-t border-slate-200">
                        <span>Estimated Annual Tax:</span>
                        <span>{formatINR(incomeTaxCalc.oldRegimeTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Savings Recommendation Banner */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Recommendation Analysis for Your Salary</p>
                      <p className="text-emerald-700 text-[11px]">
                        The <strong>New Tax Regime saves you {formatINR(incomeTaxCalc.taxSavingsWithNewRegime)}</strong> annually in tax without needing to lock funds in 5-year tax-saving instruments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advisory Notice Requirement */}
                <p className="text-[11px] text-slate-400 italic">
                  Note: Tax-saving suggestions are advisory based on current Indian Income Tax rules. They do not constitute financial advice or guaranteed tax deductions.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CORPORATE PAYSLIP MODAL (VIEW & PRINT VOUCHER)              */}
      {/* ============================================================== */}
      {selectedPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-6 my-8">
            {/* Payslip Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white font-extrabold text-lg shadow-sm">
                  PE
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">PRASHANTH ENTERPRISES</h2>
                  <p className="text-[11px] text-slate-500">Corporate Office: Plot 42, Hitec City, Hyderabad - 500081</p>
                  <p className="text-[11px] font-bold text-brand-600">SALARY SLIP FOR THE MONTH OF {selectedPayslipModal.month.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslipModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Employee Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Employee Name</p>
                <p className="font-bold text-slate-900">{employee.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Employee ID</p>
                <p className="font-mono font-bold text-slate-900">{employee.employeeId || employee.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Designation</p>
                <p className="font-semibold text-slate-800">{employee.role}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Branch Hub</p>
                <p className="font-semibold text-slate-800">{employee.branch || 'Hyderabad'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Bank Account</p>
                <p className="font-mono font-semibold text-slate-800">{bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">PAN Number</p>
                <p className="font-mono font-semibold text-slate-800">{employee.panNumber || 'ABCDE1234F'}</p>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 px-3 py-2 font-bold text-emerald-800 border-b border-emerald-100 uppercase text-[11px]">
                  Earnings
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.specialAllowance)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono text-emerald-700">{formatINR(selectedPayslipModal.gross)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-rose-50 px-3 py-2 font-bold text-rose-800 border-b border-rose-100 uppercase text-[11px]">
                  Deductions
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF)</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.pf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.tds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT)</span>
                    <span className="font-mono font-semibold">{formatINR(selectedPayslipModal.pt)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span className="font-mono text-rose-600">{formatINR(selectedPayslipModal.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Summary Callout */}
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-brand-700 uppercase">Net Disbursed Amount</p>
                <p className="text-2xl font-black text-brand-900 font-mono mt-0.5">{formatINR(selectedPayslipModal.net)}</p>
                <p className="text-[11px] text-brand-700 mt-1">Transferred via NEFT to HDFC Bank ({bankDetails.accountNumber})</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  {selectedPayslipModal.status}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Payment Date: {selectedPayslipModal.disbursementDate}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedPayslipModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Printer className="h-4 w-4 text-slate-500" />
                <span>Print Payslip</span>
              </button>
              <button
                onClick={() => alert(`Downloading signed PDF (${selectedPayslipModal.id}.pdf)...`)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: SUBMIT TAX DECLARATION                              */}
      {/* ============================================================== */}
      {showDeclarationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Submit IT Declaration & Proofs</h3>
              <button onClick={() => setShowDeclarationModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeclaration} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Category</label>
                <select
                  value={declarationForm.category}
                  onChange={(e) => setDeclarationForm({ ...declarationForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Section 80C">Section 80C (PPF, EPF, ELSS, Insurance - Max ₹1.5L)</option>
                  <option value="Section 80D">Section 80D (Health Insurance / Mediclaim - Max ₹75k)</option>
                  <option value="Section 80CCD">Section 80CCD(1B) (National Pension System NPS - Max ₹50k)</option>
                  <option value="Section 24(b)">Section 24(b) (Home Loan Interest - Max ₹2L)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Declared Annual Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={declarationForm.amount}
                  onChange={(e) => setDeclarationForm({ ...declarationForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proof Document Attachment</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <UploadCloud className="h-6 w-6 text-brand-600 mx-auto mb-1" />
                  <p className="text-[11px] text-slate-600 font-semibold">Click to upload premium receipt or bank statement</p>
                  <p className="text-[10px] text-slate-400">PDF, JPG up to 5MB</p>
                  <input
                    type="file"
                    className="hidden"
                    id="declProofUpload"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDeclarationForm({ ...declarationForm, documentName: e.target.files[0].name });
                      }
                    }}
                  />
                  <label htmlFor="declProofUpload" className="mt-1.5 inline-block text-[11px] font-bold text-brand-600 hover:underline cursor-pointer">
                    {declarationForm.documentName || 'Browse File'}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeclarationModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-1.5 font-bold text-white hover:bg-brand-700"
                >
                  Submit Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: ADD PREVIOUS EMPLOYER INCOME                        */}
      {/* ============================================================== */}
      {showPrevIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Previous Employer Income (Form 12B)</h3>
              <button onClick={() => setShowPrevIncomeModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Previous employer details for ${prevIncomeForm.employerName} saved. Sent to payroll admin for TDS calculation.`);
                setShowPrevIncomeModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previous Employer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Infosys Ltd."
                  value={prevIncomeForm.employerName}
                  onChange={(e) => setPrevIncomeForm({ ...prevIncomeForm, employerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gross Salary (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 350000"
                    value={prevIncomeForm.grossSalary}
                    onChange={(e) => setPrevIncomeForm({ ...prevIncomeForm, grossSalary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">TDS Deducted (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24000"
                    value={prevIncomeForm.tdsDeducted}
                    onChange={(e) => setPrevIncomeForm({ ...prevIncomeForm, tdsDeducted: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upload Form 16 / Relieving Payslip</label>
                <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-center">
                  <input type="file" className="text-xs text-slate-500" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrevIncomeModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-1.5 font-bold text-white hover:bg-brand-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;

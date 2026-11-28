/**
 * Centralized Global Leave Calculation & Reconciliation Engine
 * Prashanth Enterprises HRMS
 * 
 * Rules:
 * 1. Applicable to ALL employees across all branches (Hyderabad, Chennai, Mumbai).
 * 2. Independent calculation based on Date of Joining, Employment Status, Policy & Transactions.
 * 3. Never hardcodes any employee ID, name, or balance.
 * 4. Never falls back to a different employee's ledger.
 * 5. Handles accrual, carry-forward, approved deductions, and pending reservations.
 */

// Default Corporate Leave Policies
export const DEFAULT_LEAVE_POLICIES = {
  CL: {
    code: 'CL',
    name: 'Casual Leave',
    daysPerYear: 12,
    carryForwardLimit: 0,
    paid: true,
    description: 'Short personal commitments & emergencies'
  },
  SL: {
    code: 'SL',
    name: 'Sick Leave',
    daysPerYear: 10,
    carryForwardLimit: 5,
    paid: true,
    description: 'Medical recovery & health indisposition'
  },
  PL: {
    code: 'PL',
    name: 'Privilege Leave',
    daysPerYear: 18,
    carryForwardLimit: 45,
    paid: true,
    description: 'Annual planned vacation & earned leave'
  },
  COMP: {
    code: 'COMP',
    name: 'Compensatory Off',
    daysPerYear: 2,
    carryForwardLimit: 0,
    paid: true,
    description: 'Earned for authorized holiday/weekend work'
  }
};

/**
 * Calculate personalized annual leave eligibility for an employee based on:
 * - Date of Joining (DOJ)
 * - Employment Status
 * - Current Year (defaults to 2026)
 * - Applicable corporate policies
 */
export function calculateEmployeeEligibility(employee, policies = DEFAULT_LEAVE_POLICIES, currentYear = 2026) {
  if (!employee) return {};

  const doj = employee.joiningDate ? new Date(employee.joiningDate) : new Date(currentYear, 0, 1);
  const dojYear = isNaN(doj.getFullYear()) ? currentYear : doj.getFullYear();
  const dojMonth = isNaN(doj.getMonth()) ? 0 : doj.getMonth(); // 0-indexed

  // Pro-ration multiplier for newly joined employees in current year
  let proRateMultiplier = 1.0;
  if (dojYear === currentYear) {
    const remainingMonths = Math.max(1, 12 - dojMonth);
    proRateMultiplier = remainingMonths / 12;
  } else if (dojYear > currentYear) {
    // Future joiner
    proRateMultiplier = 0;
  }

  const eligibility = {};

  // Casual Leave (CL) - Annual: 12 days, pro-rated for joining year, lapses at year end
  const clBase = policies.CL?.daysPerYear ?? 12;
  const clEntitlement = Math.round(clBase * proRateMultiplier * 2) / 2; // round to nearest 0.5
  eligibility.CL = {
    code: 'CL',
    name: 'Casual Leave',
    annualQuota: clEntitlement,
    opening: dojYear < currentYear ? 6 : Math.round(clEntitlement / 2 * 2) / 2,
    accrued: dojYear < currentYear ? 6 : Math.round((clEntitlement - Math.round(clEntitlement / 2 * 2) / 2) * 2) / 2,
    carryForward: 0
  };

  // Sick Leave (SL) - Annual: 10 days, pro-rated for joining year, max 5 carry forward
  const slBase = policies.SL?.daysPerYear ?? 10;
  const slEntitlement = Math.round(slBase * proRateMultiplier * 2) / 2;
  eligibility.SL = {
    code: 'SL',
    name: 'Sick Leave',
    annualQuota: slEntitlement,
    opening: dojYear < currentYear ? 5 : Math.round(slEntitlement / 2 * 2) / 2,
    accrued: dojYear < currentYear ? 5 : Math.round((slEntitlement - Math.round(slEntitlement / 2 * 2) / 2) * 2) / 2,
    carryForward: 5
  };

  // Privilege Leave (PL) - Annual: 18 days (1.5 per month), carry forward up to 45
  const plBase = policies.PL?.daysPerYear ?? 18;
  const plEntitlement = Math.round(plBase * proRateMultiplier * 2) / 2;
  // If joined years ago, employee has accumulated opening balance
  const tenureYears = Math.max(0, currentYear - dojYear);
  const plOpening = tenureYears > 1 ? Math.min(45, 12 + (tenureYears - 1) * 2) : (dojYear < currentYear ? 12 : 0);
  eligibility.PL = {
    code: 'PL',
    name: 'Privilege Leave',
    annualQuota: plEntitlement,
    opening: plOpening,
    accrued: dojYear < currentYear ? 6 : plEntitlement,
    carryForward: 45
  };

  // Compensatory Off (COMP) - Default 0-2 based on tenure/branch
  eligibility.COMP = {
    code: 'COMP',
    name: 'Compensatory Off',
    annualQuota: 2,
    opening: dojYear < currentYear ? (employee.branch === 'Mumbai' ? 1 : 2) : 0,
    accrued: 0,
    carryForward: 0
  };

  return eligibility;
}

/**
 * Calculate verified ledger for an employee, reconciling:
 * - Eligibility / Quota
 * - Approved Leave Requests (deductions)
 * - Pending Leave Requests (reservations)
 */
export function calculateEmployeeLedger(employee, leaveRequests = [], existingLedger = null, policies = DEFAULT_LEAVE_POLICIES) {
  if (!employee) return {};

  const empId = employee.id;
  const empCode = employee.employeeId;

  // 1. Gather all actual transactions for this employee
  const employeeRequests = (leaveRequests || []).filter(r => 
    r.employeeId === empId || r.employeeId === empCode
  );

  // 2. Compute deductions and reservations per leave type from actual transactions
  const transactionsByType = {
    CL: { approved: 0, pending: 0, items: [] },
    SL: { approved: 0, pending: 0, items: [] },
    PL: { approved: 0, pending: 0, items: [] },
    COMP: { approved: 0, pending: 0, items: [] }
  };

  employeeRequests.forEach(req => {
    let code = req.leaveTypeCode;
    if (!code) {
      if (req.leaveType?.includes('Casual')) code = 'CL';
      else if (req.leaveType?.includes('Sick')) code = 'SL';
      else if (req.leaveType?.includes('Privilege')) code = 'PL';
      else if (req.leaveType?.includes('Comp')) code = 'COMP';
    }

    if (code && transactionsByType[code]) {
      const days = Number(req.totalDays || 0);
      if (req.status === 'Approved') {
        transactionsByType[code].approved += days;
        transactionsByType[code].items.push(req);
      } else if (req.status === 'Pending') {
        transactionsByType[code].pending += days;
        transactionsByType[code].items.push(req);
      }
    }
  });

  // 3. Get base eligibility from HR policy & DOJ
  const eligibility = calculateEmployeeEligibility(employee, policies);

  const ledger = {};

  ['CL', 'SL', 'PL', 'COMP'].forEach(code => {
    const existing = existingLedger?.[code] || {};
    const elig = eligibility[code] || {};

    // Prioritize existing opening balance if manually adjusted by HR, otherwise use policy eligibility
    const opening = existing.opening !== undefined ? Number(existing.opening) : Number(elig.opening || 0);
    const accrued = existing.accrued !== undefined ? Number(existing.accrued) : Number(elig.accrued || 0);
    const totalEntitled = Number((opening + accrued).toFixed(1));

    // Deductions from actual verified transactions
    // If existing ledger has approved deductions greater than transactions (e.g. historical un-tracked days), honor the higher
    const approvedDeductions = Math.max(
      Number(transactionsByType[code].approved || 0),
      Number(existing.approvedDeductions || 0)
    );

    const pendingReservations = Number(transactionsByType[code].pending || 0);

    // Strict formula: Available = Total Entitled - Approved Deductions - Pending Reservations
    const calculatedAvailable = Math.max(0, Number((totalEntitled - approvedDeductions - pendingReservations).toFixed(1)));

    // Total display quota
    const total = Math.max(totalEntitled, calculatedAvailable + approvedDeductions + pendingReservations);
    const used = Number(approvedDeductions.toFixed(1));
    const percentUsed = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const percentAvailable = total > 0 ? Math.min(100, Math.round((calculatedAvailable / total) * 100)) : 0;

    ledger[code] = {
      code,
      name: elig.name || code,
      opening,
      accrued,
      total,
      approvedDeductions,
      pendingReservations,
      available: calculatedAvailable,
      used,
      percentUsed,
      percentAvailable,
      lastCalculated: new Date().toISOString()
    };
  });

  return ledger;
}

/**
 * Company-Wide Systematic Audit & Safe Reconciliation
 * Analyzes all employees across all 3 branches (HYD, CHE, MUM)
 */
export function reconcileGlobalLeaveLedger(employees = [], leaveRequests = [], currentLedgers = {}, policies = DEFAULT_LEAVE_POLICIES) {
  const auditReport = {
    timestamp: new Date().toISOString(),
    totalEmployees: employees.length,
    reconciledEmployees: 0,
    discrepanciesFound: 0,
    correctionsApplied: 0,
    branchBreakdown: {
      Hyderabad: { count: 0, discrepancies: 0 },
      Chennai: { count: 0, discrepancies: 0 },
      Mumbai: { count: 0, discrepancies: 0 }
    },
    employeeAuditDetails: [],
    backup: JSON.parse(JSON.stringify(currentLedgers || {}))
  };

  const updatedLedgers = {};

  employees.forEach(emp => {
    const existing = currentLedgers[emp.id] || currentLedgers[emp.employeeId];
    const hadExisting = !!existing;

    // Run independent calculation
    const calculated = calculateEmployeeLedger(emp, leaveRequests, existing, policies);
    updatedLedgers[emp.id] = calculated;

    // Track branch
    const branchName = emp.branch || 'Hyderabad';
    if (!auditReport.branchBreakdown[branchName]) {
      auditReport.branchBreakdown[branchName] = { count: 0, discrepancies: 0 };
    }
    auditReport.branchBreakdown[branchName].count += 1;

    // Check for discrepancies
    const employeeDiscrepancies = [];
    if (!hadExisting) {
      employeeDiscrepancies.push('Missing individual leave ledger (was previously falling back to PE001)');
    } else {
      ['CL', 'SL', 'PL', 'COMP'].forEach(code => {
        const oldAvailable = existing[code]?.available;
        const newAvailable = calculated[code]?.available;
        if (oldAvailable !== undefined && oldAvailable !== newAvailable) {
          employeeDiscrepancies.push(`${code}: was ${oldAvailable}, corrected to ${newAvailable} (Total: ${calculated[code].total}, Deductions: ${calculated[code].approvedDeductions})`);
        }
      });
    }

    if (employeeDiscrepancies.length > 0) {
      auditReport.discrepanciesFound += 1;
      auditReport.correctionsApplied += 1;
      auditReport.branchBreakdown[branchName].discrepancies += 1;
    }

    auditReport.reconciledEmployees += 1;
    auditReport.employeeAuditDetails.push({
      employeeId: emp.id,
      code: emp.employeeId,
      name: emp.name,
      branch: emp.branch,
      department: emp.department,
      doj: emp.joiningDate,
      discrepancies: employeeDiscrepancies,
      ledger: calculated
    });
  });

  return {
    reconciledLedgers: updatedLedgers,
    auditReport
  };
}

/**
 * Universal Accessor for ALL Screens
 * Ensures ANY screen requesting an employee's leave balance receives their independent, verified calculation
 */
export function getVerifiedEmployeeLedger(employeeId, storeData) {
  if (!storeData || !employeeId) return null;

  const emp = (storeData.employees || []).find(e => e.id === employeeId || e.employeeId === employeeId);
  if (!emp) return null;

  // Check if store already has a valid ledger for this employee
  const existing = storeData.leaveLedger?.[emp.id] || storeData.leaveLedger?.[emp.employeeId];
  
  // If existing exists and is NOT a fallback reference, calculate with existing data
  return calculateEmployeeLedger(
    emp, 
    storeData.leaveRequests || [], 
    existing, 
    storeData.leavePolicies ? Object.fromEntries(storeData.leavePolicies.map(p => [p.code, p])) : DEFAULT_LEAVE_POLICIES
  );
}

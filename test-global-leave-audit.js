// Node test verification script for Global Leave Calculation & Balance Reconciliation
import { 
  DEFAULT_LEAVE_POLICIES, 
  calculateEmployeeEligibility, 
  calculateEmployeeLedger, 
  reconcileGlobalLeaveLedger, 
  getVerifiedEmployeeLedger 
} from './src/services/leaveCalculationService.js';
import { HrmDataEngine } from './src/services/hrmDataStore.js';

console.log('=== TEST 1: Initializing HrmDataEngine & Verifying Boot Reconciliation ===');
const engine = new HrmDataEngine();

const employees = engine.data.employees;
console.log(`Total employees in master directory: ${employees.length}`);

let passed = true;

// Verify every employee has an individual ledger in engine.data.leaveLedger
const branches = {};
employees.forEach(emp => {
  const branch = emp.branch || 'Unknown';
  branches[branch] = (branches[branch] || 0) + 1;

  const ledger = engine.data.leaveLedger[emp.id];
  if (!ledger) {
    console.error(`❌ FAILED: Employee ${emp.name} (${emp.id}, ${branch}) has no ledger!`);
    passed = false;
  } else {
    // Check all 4 leave types
    ['CL', 'SL', 'PL', 'COMP'].forEach(code => {
      const type = ledger[code];
      if (!type || type.available === undefined || type.total === undefined) {
        console.error(`❌ FAILED: Employee ${emp.name} (${emp.id}) missing ${code} structure!`);
        passed = false;
      }
    });
  }
});

console.log('Branch Distribution of Employees:', branches);

// Verify specific employees across all 3 hubs
console.log('\n=== TEST 2: Inspecting Specific Branch Employees ===');
const hydEmp = engine.data.employees.find(e => e.id === 'PE000'); // Hyderabad Director
const cheEmp = engine.data.employees.find(e => e.id === 'PE006'); // Chennai Rohan Patel (Approved CL)
const mumEmp = engine.data.employees.find(e => e.id === 'PE008'); // Mumbai Siddharth Verma (Pending PL)
const newJoiner = engine.data.employees.find(e => e.id === 'PE016'); // Niharika (Joined Nov 2026)

console.log('Hyderabad PE000:', {
  name: hydEmp.name,
  branch: hydEmp.branch,
  CL: engine.data.leaveLedger['PE000'].CL,
  SL: engine.data.leaveLedger['PE000'].SL,
  PL: engine.data.leaveLedger['PE000'].PL,
  COMP: engine.data.leaveLedger['PE000'].COMP
});

console.log('Chennai PE006 (Approved CL check):', {
  name: cheEmp.name,
  branch: cheEmp.branch,
  CL: engine.data.leaveLedger['PE006'].CL
});
if (engine.data.leaveLedger['PE006'].CL.approvedDeductions !== 1) {
  console.error(`❌ FAILED: PE006 CL approvedDeductions should be 1, got ${engine.data.leaveLedger['PE006'].CL.approvedDeductions}`);
  passed = false;
} else {
  console.log('✅ PASSED: PE006 CL approved deduction accurately reconciled.');
}

console.log('Mumbai PE008 (Pending PL check):', {
  name: mumEmp.name,
  branch: mumEmp.branch,
  PL: engine.data.leaveLedger['PE008'].PL
});
if (engine.data.leaveLedger['PE008'].PL.pendingReservations !== 4) {
  console.error(`❌ FAILED: PE008 PL pendingReservations should be 4, got ${engine.data.leaveLedger['PE008'].PL.pendingReservations}`);
  passed = false;
} else {
  console.log('✅ PASSED: PE008 PL pending reservation accurately reserved.');
}

console.log('Nov 2026 Joiner PE016 (Pro-rated check):', {
  name: newJoiner.name,
  joiningDate: newJoiner.joiningDate,
  CL: engine.data.leaveLedger['PE016'].CL,
  PL: engine.data.leaveLedger['PE016'].PL
});

console.log('\n=== TEST 3: Onboarding New Employee & Dynamic Pro-ration ===');
const onboarded = engine.addEmployee({
  name: 'Test Onboardee Bangalore',
  email: 'test.bangalore@prashanthenterprises.in',
  role: 'Cloud Architect',
  department: 'Information Technology',
  branch: 'Hyderabad',
  joiningDate: '2026-07-01'
}, 'HR', 'HR Admin');

console.log(`Created employee: ${onboarded.name} (${onboarded.id})`);
const onboardedLedger = engine.data.leaveLedger[onboarded.id];
console.log('New Onboardee Ledger:', onboardedLedger);
if (!onboardedLedger || !onboardedLedger.CL || onboardedLedger.CL.available === undefined) {
  console.error('❌ FAILED: Newly onboarded employee did not receive calculated ledger!');
  passed = false;
} else {
  console.log('✅ PASSED: Newly onboarded employee received instant calculated ledger.');
}

console.log('\n=== TEST 4: Universal Accessor getVerifiedEmployeeLedger ===');
const verified = getVerifiedEmployeeLedger(onboarded.id, engine.data);
if (!verified || verified.CL.available === undefined) {
  console.error('❌ FAILED: getVerifiedEmployeeLedger failed for onboarded employee!');
  passed = false;
} else {
  console.log('✅ PASSED: getVerifiedEmployeeLedger universal accessor returns valid ledger.');
}

console.log('\n=== TEST 5: Manual Reconcile Audit Call ===');
const auditReport = engine.reconcileAllEmployeeLeaves('HR', 'HR Admin');
console.log('Audit Report Summary:', {
  totalEmployees: auditReport.totalEmployees,
  reconciledEmployees: auditReport.reconciledEmployees,
  discrepanciesFound: auditReport.discrepanciesFound,
  branchBreakdown: auditReport.branchBreakdown
});

if (passed) {
  console.log('\n🌟 ALL GLOBAL LEAVE ENGINE & RECONCILIATION AUDIT TESTS PASSED!');
  process.exit(0);
} else {
  console.error('\n❌ SOME TESTS FAILED.');
  process.exit(1);
}

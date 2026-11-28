// Verification test suite for Strict Confidential Zero-Trust RBAC (Default-Deny) & Tamper-Proof Audit Logging
import { hrmStore } from './src/services/hrmDataStore.js';

console.log('=== PRASHANTH ENTERPRISES HRMS ZERO-TRUST RBAC SECURITY VERIFICATION ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

try {
  // Test 1: Global Admin is completely unrestricted
  console.log('--- Test 1: Global Admin Unrestricted Access ---');
  const initialAuditCount = hrmStore.data.auditLogs.length;
  
  // Find a pending leave request or create one for testing
  let testReq = hrmStore.data.leaveRequests.find(r => r.status === 'Pending');
  if (!testReq) {
    testReq = hrmStore.createLeaveRequest({
      employeeId: 'PE001',
      employeeName: 'Ravi Kumar',
      department: 'Information Technology',
      branch: 'Hyderabad',
      branchId: 'HYD',
      leaveType: 'Casual Leave (CL)',
      leaveTypeCode: 'CL',
      fromDate: '2026-12-01',
      toDate: '2026-12-02',
      totalDays: 2,
      reason: 'Personal'
    });
  }

  // Global Admin PE000 should approve without error
  const approvedByAdmin = hrmStore.approveLeaveRequest(testReq.id, 'PE000', 'Prashanth Reddy', 'Approved by Global Admin');
  assert(approvedByAdmin.status === 'Approved', 'Global Admin (PE000) can approve leaves unrestricted.');

  // Test 2: Standard Employee attempting to approve leave must be blocked & logged
  console.log('\n--- Test 2: Standard Employee Approval Blocked (Default-Deny) ---');
  let empTestReq = hrmStore.createLeaveRequest({
    employeeId: 'PE006',
    employeeName: 'Rohan Patel',
    department: 'Engineering & QA',
    branch: 'Chennai',
    branchId: 'CHE',
    leaveType: 'Sick Leave (SL)',
    leaveTypeCode: 'SL',
    fromDate: '2026-12-10',
    toDate: '2026-12-11',
    totalDays: 2,
    reason: 'Fever'
  });

  let blockedEmployee = false;
  try {
    // PE001 is standard employee (al: None)
    hrmStore.approveLeaveRequest(empTestReq.id, 'PE001', 'Ravi Kumar', 'Unauthorized attempt');
  } catch (err) {
    blockedEmployee = true;
    assert(err.message.includes('Access Denied'), `Employee leave approval blocked: ${err.message}`);
  }
  assert(blockedEmployee, 'Standard employee approval was strictly blocked by Zero-Trust policy.');

  // Verify audit log received security entry
  const latestAudit = hrmStore.data.auditLogs[0];
  assert(latestAudit && latestAudit.id.startsWith('AUD-SEC-'), `Security audit log generated with ID: ${latestAudit?.id}`);
  assert(latestAudit && latestAudit.action === 'SECURITY_ACCESS_DENIED', 'Audit log action is SECURITY_ACCESS_DENIED');
  assert(latestAudit && latestAudit.severity === 'HIGH_ALERT', 'Audit log severity is HIGH_ALERT');

  // Test 3: Branch HR Cross-Branch Action Blocked
  console.log('\n--- Test 3: Branch HR Cross-Branch Action Blocked ---');
  // PE006 is Branch HR for Chennai. PE001 is in Hyderabad.
  let crossBranchBlocked = false;
  try {
    hrmStore.updateEmployeePersonal('PE001', { mobile: '+91 99999 88888' }, 'PE006', 'Rohan Patel');
  } catch (err) {
    crossBranchBlocked = true;
    assert(err.message.includes('Access Denied'), `Cross-branch employee update blocked: ${err.message}`);
  }
  assert(crossBranchBlocked, 'Chennai Branch HR cannot edit Hyderabad employee.');

  const branchAudit = hrmStore.data.auditLogs[0];
  assert(branchAudit && branchAudit.id.startsWith('AUD-SEC-'), `Cross-branch security violation logged: ${branchAudit?.details}`);

  // Test 4: Payroll Processing by Non-Authorized Role Blocked
  console.log('\n--- Test 4: Payroll Processing Authorization Check ---');
  let payrollBlocked = false;
  try {
    // PE002 (Central HR) has pay: 'Verify' which cannot execute payroll runs
    hrmStore.processPayrollRun('December 2026', 2026, 12, 'PE002', 'Pooja Hegde');
  } catch (err) {
    payrollBlocked = true;
    assert(err.message.includes('Access Denied'), `Payroll processing by Verify-only role blocked: ${err.message}`);
  }
  assert(payrollBlocked, 'Verify-only role cannot execute payroll calculations.');

  const payrollAudit = hrmStore.data.auditLogs[0];
  assert(payrollAudit && payrollAudit.id.startsWith('AUD-SEC-'), `Unauthorized payroll execution logged: ${payrollAudit?.details}`);

  // Test 5: Authorized Finance & Global Admin can process payroll
  console.log('\n--- Test 5: Authorized Finance Payroll Processing ---');
  // PE010 is Finance (pay: Full Process)
  const payrollRun = hrmStore.processPayrollRun('December 2026', 2026, 12, 'PE010', 'Sneha Kulkarni');
  assert(payrollRun && payrollRun.id === 'PR-2026-12', `Finance role (PE010) successfully processed payroll: ${payrollRun?.id}`);

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passedTests} / ${totalTests} assertions passed!`);
  console.log(`========================================\n`);

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (e) {
  console.error('Fatal test error:', e);
  process.exit(1);
}

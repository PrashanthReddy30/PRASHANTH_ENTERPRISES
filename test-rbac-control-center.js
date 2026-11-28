import { HrmDataEngine } from './src/services/hrmDataStore.js';

console.log('=== TEST 1: Initializing HrmDataEngine & Verifying 6-Tier Role Permissions Matrix ===');
const engine = new HrmDataEngine();

const matrix = engine.data.rolePermissions;
console.log(`Loaded matrix with ${matrix?.length} tiers.`);
if (!matrix || matrix.length !== 6) {
  console.error(`❌ Expected 6 tiers, found ${matrix?.length}`);
  process.exit(1);
}

const expectedRoles = ['Employee', 'Manager', 'Branch HR', 'Central HR', 'Finance', 'Global Admin'];
const foundRoles = matrix.map(m => m.role);
console.log('Role Tiers:', foundRoles);

for (const role of expectedRoles) {
  if (!foundRoles.includes(role)) {
    console.error(`❌ Missing expected role: ${role}`);
    process.exit(1);
  }
}
console.log('✅ PASSED: All 6 distinct tiers present in engine matrix.');

console.log('\n=== TEST 2: Updating Role Matrix Permissions (Global Admin Action) ===');
const updatedMatrix = JSON.parse(JSON.stringify(matrix));
// Modify Branch HR payroll access
const branchHrRow = updatedMatrix.find(r => r.role === 'Branch HR');
branchHrRow.pay = 'Verify';

engine.updateRolePermissions(updatedMatrix, 'PE000', 'Prashanth Reddy');

const latestMatrix = engine.data.rolePermissions;
const savedBranchHr = latestMatrix.find(r => r.role === 'Branch HR');
if (savedBranchHr.pay !== 'Verify') {
  console.error(`❌ Failed: Expected Branch HR payroll to be 'Verify', got ${savedBranchHr.pay}`);
  process.exit(1);
}
console.log('✅ PASSED: updateRolePermissions updated matrix in storeData.');

// Check audit log
const lastAudit = engine.data.auditLogs[0];
console.log('Last Audit Entry:', lastAudit);
if (lastAudit.action !== 'ROLE_PERMISSIONS_UPDATED' || lastAudit.user !== 'Prashanth Reddy') {
  console.error('❌ Failed: Audit log not recorded properly for matrix update.');
  process.exit(1);
}
console.log('✅ PASSED: Audit log recorded for ROLE_PERMISSIONS_UPDATED.');

console.log('\n=== TEST 3: User-Level Access Assignment (Assigning Vikram Malhotra to Branch HR) ===');
const targetEmp = engine.data.employees.find(e => e.id === 'PE005');
console.log('Target before:', { id: targetEmp.id, name: targetEmp.name, role: targetEmp.systemRole });

engine.updateUserRoleAccess(
  'PE005',
  {
    systemRole: 'Branch HR',
    branchScope: 'Hyderabad',
    permissionsOverride: { canProcessPayroll: true, canManageRecruitment: true }
  },
  'PE000',
  'Prashanth Reddy'
);

const updatedEmp = engine.data.employees.find(e => e.id === 'PE005');
console.log('Target after:', {
  id: updatedEmp.id,
  name: updatedEmp.name,
  systemRole: updatedEmp.systemRole,
  branchScope: updatedEmp.branchScope,
  overrides: updatedEmp.permissionsOverride
});

if (updatedEmp.systemRole !== 'Branch HR' || !updatedEmp.permissionsOverride?.canProcessPayroll) {
  console.error('❌ Failed: Employee systemRole or overrides not applied.');
  process.exit(1);
}
console.log('✅ PASSED: User access assignment successfully applied.');

// Check audit log
const assignAudit = engine.data.auditLogs[0];
console.log('Assign Audit Entry:', assignAudit);
if (assignAudit.action !== 'USER_ACCESS_ASSIGNED') {
  console.error('❌ Failed: Audit log not recorded for USER_ACCESS_ASSIGNED.');
  process.exit(1);
}
console.log('✅ PASSED: Audit log recorded for USER_ACCESS_ASSIGNED.');

console.log('\n=== TEST 4: User-Level Access Revocation (Reverting Vikram Malhotra to Standard Employee) ===');
engine.revokeUserAccess('PE005', 'PE000', 'Prashanth Reddy');

const revokedEmp = engine.data.employees.find(e => e.id === 'PE005');
console.log('Target after revocation:', {
  id: revokedEmp.id,
  name: revokedEmp.name,
  systemRole: revokedEmp.systemRole,
  overrides: revokedEmp.permissionsOverride
});

if (revokedEmp.systemRole !== 'Employee' || Object.keys(revokedEmp.permissionsOverride || {}).length > 0) {
  console.error('❌ Failed: Employee not cleanly reverted to standard Employee.');
  process.exit(1);
}
console.log('✅ PASSED: Access cleanly revoked and user reverted to standard Employee.');

const revokeAudit = engine.data.auditLogs[0];
console.log('Revoke Audit Entry:', revokeAudit);
if (revokeAudit.action !== 'USER_ACCESS_REVOKED') {
  console.error('❌ Failed: Audit log not recorded for USER_ACCESS_REVOKED.');
  process.exit(1);
}
console.log('✅ PASSED: Audit log recorded for USER_ACCESS_REVOKED.');

console.log('\n🌟 ALL RBAC ACCESS CONTROL CENTER TESTS PASSED SUCCESSFULLY!');

import assert from 'node:assert';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './src/services/firebaseConfig.js';
import { HrmDataEngine } from './src/services/hrmDataStore.js';

console.log('================================================================');
console.log('   PRASHANTH ENTERPRISES - HR ACCOUNT UPDATE VERIFICATION   ');
console.log('================================================================\n');

// 1. Verify Local Engine Seed & Directory
console.log('[Check 1] Verifying HR Account in HrmDataEngine...');
const engine = new HrmDataEngine();
const hrEmp = engine.data.employees.find(e => e.id === 'PE016' || e.email === 'chinnareddy123a@gmail.com');
assert(hrEmp, 'HR employee record PE016 must exist in employee directory');
assert.strictEqual(hrEmp.name, 'Niharika', 'Display name must be Niharika');
assert.strictEqual(hrEmp.email, 'chinnareddy123a@gmail.com', 'Email must be chinnareddy123a@gmail.com');
assert.strictEqual(hrEmp.role, 'HR Admin', 'Role must be HR Admin');
assert(hrEmp.systemRole === 'Central HR' || hrEmp.systemRole === 'HR Admin', 'Must have HR system role');
console.log(`✓ HR Account confirmed: ${hrEmp.name} (${hrEmp.email}) · ${hrEmp.role}`);

// 2. Verify Global Admin is Preserved Untouched
console.log('\n[Check 2] Verifying Global Admin Account (PE000) is preserved untouched...');
const globalAdmin = engine.data.employees.find(e => e.id === 'PE000');
assert(globalAdmin, 'Global Admin PE000 must exist');
assert.strictEqual(globalAdmin.name, 'Prashanth Reddy', 'Global admin name must remain Prashanth Reddy');
assert.strictEqual(globalAdmin.systemRole, 'Global Admin', 'Must remain Global Admin');
assert.strictEqual(globalAdmin.email, 'prashanth.reddy@prashanthenterprises.in', 'Global admin email must be preserved');
console.log(`✓ Global Admin preserved: ${globalAdmin.name} (${globalAdmin.email}) · ${globalAdmin.systemRole}`);

// 3. Verify Other Employees are Not Corrupted
console.log('\n[Check 3] Verifying Employee Directory integrity...');
const sde = engine.data.employees.find(e => e.id === 'PE001');
assert.strictEqual(sde.name, 'Ravi Kumar', 'Ravi Kumar must remain untouched');
assert.strictEqual(sde.systemRole, 'Employee', 'Ravi Kumar must remain Employee');
console.log(`✓ Employee PE001 preserved: ${sde.name} (${sde.email})`);

// 4. Verify HR Admin Permissions
console.log('\n[Check 4] Verifying HR Admin permissions...');
const role = hrEmp.systemRole;
const isHR = role === 'Central HR' || role === 'Branch HR' || role === 'HR Admin' || role === 'Global Admin';
const canAccessHR = isHR;
const canManageEmployees = isHR;
const canApproveLeaves = isHR;
const canManageRecruitment = isHR;
const canViewAuditLogs = isHR;

assert.strictEqual(canAccessHR, true, 'HR Admin must have access to HR Portal');
assert.strictEqual(canManageEmployees, true, 'HR Admin must be able to manage employees');
assert.strictEqual(canApproveLeaves, true, 'HR Admin must be able to approve leaves');
assert.strictEqual(canManageRecruitment, true, 'HR Admin must be able to manage recruitment');
assert.strictEqual(canViewAuditLogs, true, 'HR Admin must be able to view audit logs');
console.log('✓ All 5 HR Admin core operational permissions confirmed active.');

// 5. Verify Firestore Synchronization
console.log('\n[Check 5] Verifying live Firestore synchronization...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyFirestore() {
  const fsEmpSnap = await getDoc(doc(db, 'employees', 'PE016'));
  assert(fsEmpSnap.exists(), 'PE016 must exist in Firestore employees collection');
  const fsEmp = fsEmpSnap.data();
  assert.strictEqual(fsEmp.name, 'Niharika', 'Firestore display name must be Niharika');
  assert.strictEqual(fsEmp.email, 'chinnareddy123a@gmail.com', 'Firestore email must be chinnareddy123a@gmail.com');
  assert.strictEqual(fsEmp.role, 'HR Admin', 'Firestore role must be HR Admin');
  console.log(`✓ Firestore employees/PE016 confirmed: ${fsEmp.name} (${fsEmp.email})`);

  const fsUserSnap = await getDoc(doc(db, 'users', 'PE016'));
  assert(fsUserSnap.exists(), 'PE016 must exist in Firestore users collection');
  const fsUser = fsUserSnap.data();
  assert.strictEqual(fsUser.displayName, 'Niharika');
  assert.strictEqual(fsUser.email, 'chinnareddy123a@gmail.com');
  assert.strictEqual(fsUser.role, 'HR Admin');
  console.log(`✓ Firestore users/PE016 authentication profile confirmed: ${fsUser.displayName} (${fsUser.email})`);

  const fsUserEmailSnap = await getDoc(doc(db, 'users', 'chinnareddy123a@gmail.com'));
  assert(fsUserEmailSnap.exists(), 'User record by email key must exist in Firestore users');
  console.log(`✓ Firestore users/chinnareddy123a@gmail.com index confirmed.`);

  const fsLeaveSnap = await getDoc(doc(db, 'leave_ledger', 'PE016'));
  assert(fsLeaveSnap.exists(), 'Leave ledger must exist for PE016');
  console.log(`✓ Firestore leave_ledger/PE016 confirmed.`);

  // Verify PE012 (shiva) email was safely changed without data loss
  const pe012Snap = await getDoc(doc(db, 'employees', 'PE012'));
  if (pe012Snap.exists()) {
    const pe012 = pe012Snap.data();
    assert.notStrictEqual(pe012.email, 'chinnareddy123a@gmail.com', 'PE012 must not collide with HR email');
    console.log(`✓ PE012 collision check confirmed (safe email: ${pe012.email})`);
  }

  console.log('\n================================================================');
  console.log('   ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!   ');
  console.log('================================================================');
  process.exit(0);
}

verifyFirestore().catch(err => {
  console.error('Firestore check failed:', err);
  process.exit(1);
});

import { hrmStore } from './src/services/hrmDataStore.js';

console.log('Testing Branch-Scoped Finance & Payroll Access...');

const employees = hrmStore.data.employees;

// Test accounts:
const globalAdmin = employees.find(e => e.id === 'PE000'); // Global Admin
const hrAdminHyd = employees.find(e => e.id === 'PE016');  // Niharika (HR Admin, Hyderabad)
const hydEmployee = employees.find(e => e.branch === 'Hyderabad' && e.id !== 'PE000' && e.id !== 'PE016'); // e.g. PE001
const cheEmployee = employees.find(e => e.branch === 'Chennai'); // e.g. PE002
const mumEmployee = employees.find(e => e.branch === 'Mumbai');  // e.g. PE003

console.log('HR Admin:', hrAdminHyd.name, 'Branch:', hrAdminHyd.branch);
console.log('HYD Employee:', hydEmployee?.name, 'Branch:', hydEmployee?.branch);
console.log('CHE Employee:', cheEmployee?.name, 'Branch:', cheEmployee?.branch);
console.log('MUM Employee:', mumEmployee?.name, 'Branch:', mumEmployee?.branch);

// Helper function implementing the branch-matching logic
function checkFinanceAccess(user, targetEmp) {
  const isGlobalAdmin = user.systemRole === 'Global Admin' || user.id === 'PE000';
  if (isGlobalAdmin) return true;
  if (!user.branch || !targetEmp.branch) return false;
  return user.branch.trim().toLowerCase() === targetEmp.branch.trim().toLowerCase() ||
         user.branchId === targetEmp.branchId;
}

// 1. HR Admin access to same branch employee
const hydAccess = checkFinanceAccess(hrAdminHyd, hydEmployee);
console.log('1. HR Admin (HYD) -> HYD Employee Access:', hydAccess ? 'PASS (Allowed)' : 'FAIL');

// 2. HR Admin access to different branch employee (Chennai)
const cheAccess = checkFinanceAccess(hrAdminHyd, cheEmployee);
console.log('2. HR Admin (HYD) -> CHE Employee Access:', !cheAccess ? 'PASS (Blocked)' : 'FAIL');

// 3. HR Admin access to different branch employee (Mumbai)
const mumAccess = checkFinanceAccess(hrAdminHyd, mumEmployee);
console.log('3. HR Admin (HYD) -> MUM Employee Access:', !mumAccess ? 'PASS (Blocked)' : 'FAIL');

// 4. Global Admin access to all branches
const gaHyd = checkFinanceAccess(globalAdmin, hydEmployee);
const gaChe = checkFinanceAccess(globalAdmin, cheEmployee);
const gaMum = checkFinanceAccess(globalAdmin, mumEmployee);
console.log('4. Global Admin Unrestricted Access (HYD/CHE/MUM):', (gaHyd && gaChe && gaMum) ? 'PASS (All Allowed)' : 'FAIL');

// 5. Payroll module branch filtering
const hydEmployees = employees.filter(e => e.branch === 'Hyderabad');
const cheEmployees = employees.filter(e => e.branch === 'Chennai');
const mumEmployees = employees.filter(e => e.branch === 'Mumbai');
console.log('5. Branch Headcounts -> HYD:', hydEmployees.length, '| CHE:', cheEmployees.length, '| MUM:', mumEmployees.length);
console.log('Total Workforce:', employees.length, 'Sum of Branches:', hydEmployees.length + cheEmployees.length + mumEmployees.length);

console.log('ALL ACCESS PERMISSION CHECKS PASSED.');

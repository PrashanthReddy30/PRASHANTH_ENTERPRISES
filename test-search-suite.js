// Test Suite for HR Global Employee Search & Data Isolation
import { searchEmployees, getEmployeeById, normalizePhoneNumber, normalizeEmail } from './src/services/employeeSearchService.js';
import { hrmStore } from './src/services/hrmDataStore.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('   PRASHANTH ENTERPRISES - HR GLOBAL SEARCH VERIFICATION SUITE   ');
  console.log('================================================================\n');

  const adminUser = hrmStore.data.employees.find(e => e.id === 'PE000'); // Global Admin (HYD)
  const centralHrUser = hrmStore.data.employees.find(e => e.id === 'PE002'); // Central HR (HYD)
  const chennaiHrUser = hrmStore.data.employees.find(e => e.id === 'PE006'); // Branch HR (CHE)
  const mumbaiHrUser = hrmStore.data.employees.find(e => e.id === 'PE008'); // Branch HR (MUM)

  assert(adminUser && centralHrUser && chennaiHrUser && mumbaiHrUser, 'All persona test users resolved from master store');

  // Test 1: Search by Full Name
  console.log('\n--- 1. Search by Full Name ---');
  const resFullName = await searchEmployees('Ravi Kumar', adminUser);
  assert(resFullName.length > 0 && resFullName[0].name === 'Ravi Kumar', 'Search for "Ravi Kumar" returns Ravi Kumar');

  // Test 2: Search by Partial Name
  console.log('\n--- 2. Search by Partial Name ---');
  const resPartial1 = await searchEmployees('Ravi', adminUser);
  assert(resPartial1.some(e => e.name.includes('Ravi')), 'Search for "Ravi" returns Ravi Kumar');

  const resPartial2 = await searchEmployees('Pooja', adminUser);
  assert(resPartial2.some(e => e.name.includes('Pooja')), 'Search for "Pooja" returns Pooja Hegde');

  const resPartial3 = await searchEmployees('Hegde', adminUser);
  assert(resPartial3.some(e => e.name.includes('Pooja Hegde')), 'Search for last name "Hegde" returns Pooja Hegde');

  // Test 3: Search by Mobile Number
  console.log('\n--- 3. Search by Mobile Number ---');
  const resMobileExact = await searchEmployees('9848011221', adminUser);
  assert(resMobileExact.some(e => e.name === 'Ravi Kumar'), 'Search by digits "9848011221" matches Ravi Kumar');

  const resMobileFormatted = await searchEmployees('+91 98480 11221', adminUser);
  assert(resMobileFormatted.some(e => e.name === 'Ravi Kumar'), 'Search by formatted "+91 98480 11221" matches Ravi Kumar');

  const resMobilePartial = await searchEmployees('11221', adminUser);
  assert(resMobilePartial.some(e => e.name === 'Ravi Kumar'), 'Search by partial mobile "11221" matches Ravi Kumar');

  // Test 4: Search by Employee ID
  console.log('\n--- 4. Search by Employee ID ---');
  const resIdShort = await searchEmployees('PE001', adminUser);
  assert(resIdShort.some(e => e.id === 'PE001'), 'Search by ID "PE001" returns Ravi Kumar');

  const resIdFull = await searchEmployees('EMP-2024-001', adminUser);
  assert(resIdFull.some(e => e.employeeId === 'EMP-2024-001'), 'Search by Employee ID "EMP-2024-001" returns Ravi Kumar');

  // Test 5: Search by Gmail / Official Email
  console.log('\n--- 5. Search by Gmail / Official Email ---');
  const resGmail = await searchEmployees('gmail', adminUser);
  assert(resGmail.length > 0, 'Search by keyword "gmail" returns employees with Gmail addresses');

  const resOfficialEmail = await searchEmployees('ravi.kumar@prashanthenterprises.in', adminUser);
  assert(resOfficialEmail.some(e => e.id === 'PE001'), 'Search by official email returns Ravi Kumar');

  const resPersonalEmail = await searchEmployees('ravi.kumar.dev@gmail.com', adminUser);
  assert(resPersonalEmail.some(e => e.id === 'PE001'), 'Search by personal Gmail returns Ravi Kumar');

  // Test 6: Multiple Matching Employees
  console.log('\n--- 6. Multiple Matching Employees ---');
  const resMultiple = await searchEmployees('98480', adminUser, { maxResults: 10 });
  assert(resMultiple.length > 1, `Search "98480" returns multiple matching employees (${resMultiple.length} found)`);

  // Test 7: No Results
  console.log('\n--- 7. No Results Handling ---');
  const resEmpty = await searchEmployees('NonExistentEmployee99999', adminUser);
  assert(resEmpty.length === 0, 'Search for invalid term correctly returns 0 results without errors');

  // Test 8: Branch Data Isolation & Security Restrictions
  console.log('\n--- 8. Branch Data Isolation (Central HR vs Branch HR) ---');
  
  // Chennai Branch HR searches for Hyderabad employee (Ravi Kumar) -> MUST BE BLOCKED / 0 RESULTS
  const resChennaiRavi = await searchEmployees('Ravi', chennaiHrUser);
  assert(!resChennaiRavi.some(e => e.name === 'Ravi Kumar'), 'Chennai Branch HR CANNOT see Hyderabad employee (Ravi Kumar)');

  // Chennai Branch HR searches for Chennai employee (Deepa Nair) -> MUST BE VISIBLE
  const resChennaiDeepa = await searchEmployees('Deepa', chennaiHrUser);
  assert(resChennaiDeepa.some(e => e.name === 'Deepa Nair'), 'Chennai Branch HR CAN see Chennai employee (Deepa Nair)');

  // Mumbai Branch HR searches for Chennai employee (Deepa Nair) -> MUST BE BLOCKED
  const resMumbaiDeepa = await searchEmployees('Deepa', mumbaiHrUser);
  assert(!resMumbaiDeepa.some(e => e.name === 'Deepa Nair'), 'Mumbai Branch HR CANNOT see Chennai employee (Deepa Nair)');

  // Mumbai Branch HR searches for Mumbai employee (Ananya Deshmukh) -> MUST BE VISIBLE
  const resMumbaiAnanya = await searchEmployees('Ananya', mumbaiHrUser);
  assert(resMumbaiAnanya.some(e => e.name === 'Ananya Deshmukh'), 'Mumbai Branch HR CAN see Mumbai employee (Ananya Deshmukh)');

  // Central HR searches for both -> MUST BE VISIBLE ACROSS ALL BRANCHES
  const resCentralHyd = await searchEmployees('Ravi', centralHrUser);
  const resCentralChe = await searchEmployees('Deepa', centralHrUser);
  const resCentralMum = await searchEmployees('Ananya', centralHrUser);
  assert(
    resCentralHyd.some(e => e.name === 'Ravi Kumar') &&
    resCentralChe.some(e => e.name === 'Deepa Nair') &&
    resCentralMum.some(e => e.name === 'Ananya Deshmukh'),
    'Central HR has authorization across all corporate branches (HYD, CHE, MUM)'
  );

  // Test 9: getEmployeeById Direct Lookup & Branch Security Check
  console.log('\n--- 9. Direct Employee Record Lookup & Route Security ---');
  const empByIdDirect = getEmployeeById('PE001', adminUser);
  assert(empByIdDirect && empByIdDirect.name === 'Ravi Kumar', 'getEmployeeById("PE001") accurately resolves Ravi Kumar');

  const empByEmpIdDirect = getEmployeeById('EMP-2024-001', adminUser);
  assert(empByEmpIdDirect && empByEmpIdDirect.name === 'Ravi Kumar', 'getEmployeeById("EMP-2024-001") resolves exact record');

  const unauthorizedAccessCheck = getEmployeeById('PE001', chennaiHrUser);
  assert(unauthorizedAccessCheck && unauthorizedAccessCheck.isUnauthorized, 'Direct getEmployeeById blocks cross-branch unauthorized access');

  // Test 10: Suggestion Fields Verification
  console.log('\n--- 10. Suggestion Model Fields Verification ---');
  const sample = resFullName[0];
  const requiredFields = ['id', 'employeeId', 'name', 'avatar', 'designation', 'department', 'branch', 'phone', 'email', 'status', 'managerName'];
  const hasAllFields = requiredFields.every(f => sample[f] !== undefined);
  assert(hasAllFields, `Search suggestion contains all mandatory UI fields: ${requiredFields.join(', ')}`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

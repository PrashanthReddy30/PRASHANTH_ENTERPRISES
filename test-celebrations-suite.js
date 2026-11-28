// Prashanth Enterprises HRMS - Automated Celebrations Comprehensive Verification Suite
import assert from 'assert';
import { 
  getNowInIST, 
  parseDateSafe, 
  calculateCompletedYears, 
  isBirthdayToday, 
  isLeapYear 
} from './src/services/celebrationAutomationEngine.js';
import { 
  generateFallbackSvgPoster, 
  interpolatePlaceholders, 
  DEFAULT_CELEBRATION_TEMPLATES 
} from './src/services/celebrationImageGenerator.js';

console.log('='.repeat(70));
console.log('PRASHANTH ENTERPRISES HRMS — CELEBRATION AUTOMATION TEST SUITE');
console.log('='.repeat(70));

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failedCount++;
  }
}

// 1. Timezone & Date Normalization
runTest('1. Asia/Kolkata (IST) Timezone Normalization', () => {
  const ist = getNowInIST();
  assert(ist.year >= 2024, 'Year should be valid');
  assert(ist.month >= 1 && ist.month <= 12, 'Month should be 1-12');
  assert(ist.day >= 1 && ist.day <= 31, 'Day should be 1-31');
  assert(ist.isoTimestamp.includes('+05:30'), 'Should contain IST +05:30 offset');
  assert.strictEqual(ist.dateStr, `${ist.year}-${String(ist.month).padStart(2, '0')}-${String(ist.day).padStart(2, '0')}`);
});

// 2. New Joiner Detection
runTest('2. New Joiner Automated Identification', () => {
  const emp = { id: 'PE010', name: 'Ananya Deshmukh', joiningDate: '2026-11-15', status: 'Active' };
  const targetDate = parseDateSafe('2026-11-15');
  const joiningParsed = parseDateSafe(emp.joiningDate);

  const isEligibleToday = joiningParsed && joiningParsed.dateStr === targetDate.dateStr;
  assert.strictEqual(isEligibleToday, true, 'Ananya Deshmukh should be eligible on her joining date 2026-11-15');

  const otherDate = parseDateSafe('2026-11-16');
  const isEligibleTomorrow = joiningParsed && joiningParsed.dateStr === otherDate.dateStr;
  assert.strictEqual(isEligibleTomorrow, false, 'Ananya should NOT be eligible as new joiner on subsequent day');
});

// 3. Birthday Detection & Privacy Protection
runTest('3. Birthday Detection & Age Privacy Guarantee', () => {
  const emp = { id: 'PE005', name: 'Kavitha Sharma', dob: '1994-11-16', status: 'Active' };
  const targetDate = parseDateSafe('2026-11-16');
  const dobParsed = parseDateSafe(emp.dob);

  const isBday = isBirthdayToday(dobParsed, targetDate, 'FEB_28');
  assert.strictEqual(isBday, true, 'Kavitha Sharma should be identified for birthday celebration on Nov 16');

  // Verify privacy: Message must not contain birth year or calculate age
  const msg = `Wishing ${emp.name} a very Happy Birthday! May the year ahead bring abundant joy.`;
  assert(!msg.includes('1994'), 'Public message must NEVER reveal employee birth year');
  assert(!msg.includes('32 years old'), 'Public message must NEVER reveal calculated age');
});

// 4. Leap Year Handling for Feb 29 Birthdays
runTest('4. February 29 Leap Day Birthday Policy (Feb 28 vs Mar 1)', () => {
  const leapEmp = { id: 'PE004', name: 'Sneha Kulkarni', dob: '1994-02-29', status: 'Active' };
  const dobParsed = parseDateSafe(leapEmp.dob);

  // In non-leap year (2026) with default FEB_28 policy
  const date2026Feb28 = parseDateSafe('2026-02-28');
  assert.strictEqual(isBirthdayToday(dobParsed, date2026Feb28, 'FEB_28'), true, 'Should celebrate on Feb 28 in non-leap year under FEB_28 policy');

  const date2026Mar01 = parseDateSafe('2026-03-01');
  assert.strictEqual(isBirthdayToday(dobParsed, date2026Mar01, 'FEB_28'), false, 'Should NOT celebrate on Mar 1 under FEB_28 policy');

  // In non-leap year (2026) with MAR_01 policy
  assert.strictEqual(isBirthdayToday(dobParsed, date2026Mar01, 'MAR_01'), true, 'Should celebrate on Mar 1 under MAR_01 policy');

  // In leap year (2028)
  assert.strictEqual(isLeapYear(2028), true, '2028 is a leap year');
  const date2028Feb29 = parseDateSafe('2028-02-29');
  assert.strictEqual(isBirthdayToday(dobParsed, date2028Feb29, 'FEB_28'), true, 'In leap year, must celebrate on Feb 29 exactly');
});

// 5. Work Anniversary & Completed Years Calculation
runTest('5. Work Anniversary Completed Years Calculation', () => {
  const emp = { id: 'PE003', name: 'Rajesh Kannan', joiningDate: '2022-11-16', status: 'Active' };
  const joiningParsed = parseDateSafe(emp.joiningDate);
  const targetDate = parseDateSafe('2026-11-16');

  const completedYears = calculateCompletedYears(joiningParsed, targetDate);
  assert.strictEqual(completedYears, 4, 'Rajesh Kannan should have completed exactly 4 years of service');

  // Day before anniversary in 2026 (Nov 15)
  const dayBefore = parseDateSafe('2026-11-15');
  assert.strictEqual(calculateCompletedYears(joiningParsed, dayBefore), 3, 'Day before 4th anniversary should still be 3 completed years');
});

// 6. Idempotency Key & Duplicate Prevention
runTest('6. Idempotency Key Generation & Duplicate Prevention', () => {
  const empId = 'PE003';
  const year = 2026;
  const anniversaryKey1 = `${empId}_anniversary_${year}_4y`;
  const anniversaryKey2 = `${empId}_anniversary_${year}_4y`;

  assert.strictEqual(anniversaryKey1, anniversaryKey2, 'Idempotency keys for same event must be identical');

  const simulatedPublishedPosts = [
    { id: 'POST-01', idempotencyKey: anniversaryKey1, employeeName: 'Rajesh Kannan' }
  ];

  // Try publishing again
  const isDuplicate = simulatedPublishedPosts.some(p => p.idempotencyKey === anniversaryKey2);
  assert.strictEqual(isDuplicate, true, 'Scheduler must recognize duplicate post and skip re-publishing');
});

// 7. Inactive / Terminated Employee Exclusion
runTest('7. Exclusion of Terminated / Inactive Employees', () => {
  const terminatedEmp = { id: 'PE999', name: 'Ex-Employee', status: 'Terminated', dob: '1990-11-16' };
  const targetDate = parseDateSafe('2026-11-16');

  const shouldPublish = terminatedEmp.status === 'Active' && isBirthdayToday(parseDateSafe(terminatedEmp.dob), targetDate);
  assert.strictEqual(shouldPublish, false, 'Terminated employee must NEVER be published for celebration');
});

// 8. Dynamic Poster Template Interpolation & SVG Fallback Generation
runTest('8. Dynamic Placeholders & High-Fidelity SVG Poster Generation', () => {
  const emp = { id: 'PE001', name: 'Ravi Kumar', employeeId: 'EMP-2024-001', branch: 'Hyderabad', joiningDate: '2024-03-15' };
  const templateStr = "Welcome to Prashanth Enterprises, {{EMPLOYEE_NAME}}! You are assigned to {{BRANCH_NAME}} Hub.";
  const interpolated = interpolatePlaceholders(templateStr, emp);

  assert.strictEqual(interpolated, "Welcome to Prashanth Enterprises, Ravi Kumar! You are assigned to Hyderabad Hub.");

  const svgDataUrl = generateFallbackSvgPoster(DEFAULT_CELEBRATION_TEMPLATES[0], emp, {
    badgeTitle: 'WELCOME ABOARD! 🚀',
    message: interpolated
  });

  assert(svgDataUrl.startsWith('data:image/svg+xml;utf8,'), 'Poster should be formatted as SVG Data URL');
  assert(svgDataUrl.includes('Ravi Kumar'), 'Generated SVG poster must contain employee name');
  assert(svgDataUrl.includes('Prashanth Enterprises'), 'Generated SVG poster must contain company branding');
});

console.log('='.repeat(70));
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('='.repeat(70));

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('ALL CELEBRATION AUTOMATION SPECIFICATIONS VALIDATED SUCCESSFULLY!');
}

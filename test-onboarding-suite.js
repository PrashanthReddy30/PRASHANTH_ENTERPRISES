import assert from 'node:assert';
import { 
  calculateSalaryBreakup, 
  DEFAULT_ONBOARDING_TEMPLATES, 
  populateDocumentText, 
  generateOnboardingEmailHtml 
} from './src/services/onboardingService.js';
import { HrmDataEngine } from './src/services/hrmDataStore.js';

console.log('--- STARTING ONBOARDING MODULE TEST SUITE ---');

// Test 1: Salary Calculation
console.log('[Test 1] Testing calculateSalaryBreakup...');
const salaryBreakup = calculateSalaryBreakup(600000); // 6 LPA
assert.strictEqual(salaryBreakup.annualCtc, 600000);
assert.strictEqual(salaryBreakup.monthlyGross, 50000);
assert.strictEqual(salaryBreakup.basicSalary, 20000); // 40% of 50000
assert.strictEqual(salaryBreakup.hra, 10000); // 20% of 50000
assert.strictEqual(salaryBreakup.employeePf, 1800); // PF capped at 1800
assert.strictEqual(salaryBreakup.esiApplicable, false); // Gross > 21,000
assert(salaryBreakup.netSalary > 0, 'Net take home must be positive');
console.log('✓ Salary calculation passed: Basic=' + salaryBreakup.basicSalary + ', NetSalary=' + salaryBreakup.netSalary);

// Test 2: Low salary ESIC eligibility test
const lowSalaryBreakup = calculateSalaryBreakup(240000); // 20,000 monthly gross
assert.strictEqual(lowSalaryBreakup.esiApplicable, true);
assert(lowSalaryBreakup.esiEmployee > 0, 'ESIC deduction must exist for gross <= 21000');
console.log('✓ ESIC threshold check passed (gross <= 21,000 correctly flagged)');

// Test 3: Document templates integrity
console.log('[Test 3] Verifying 11 standard document templates...');
assert.strictEqual(DEFAULT_ONBOARDING_TEMPLATES.length, 11);
const expectedKeys = [
  'TPL-APPOINTMENT', 'TPL-NDA', 'TPL-CODE-OF-CONDUCT', 
  'TPL-ASSET-ALLOCATION', 'TPL-JOINING-REPORT', 'TPL-SERVICE-BOND', 
  'TPL-IP-ASSIGNMENT', 'TPL-PF-FORM-11', 'TPL-PF-FORM-2', 'TPL-ESIC-FORM', 'TPL-BGV-CONSENT'
];
for (const key of expectedKeys) {
  const tmpl = DEFAULT_ONBOARDING_TEMPLATES.find(t => t.id === key);
  assert(tmpl, `Missing template for ${key}`);
  assert(tmpl.templateText && tmpl.templateText.length > 50, `Template body too short for ${key}`);
}
console.log('✓ All 11 templates present and valid.');

// Test 4: Placeholder replacement
console.log('[Test 4] Testing populateDocumentText...');
const sampleCase = {
  personal: {
    fullName: 'Rahul Sharma',
    personalEmail: 'rahul.s@example.com',
    mobile: '+91 98765 43210'
  },
  employment: {
    designation: 'Senior Cloud Engineer',
    department: 'Engineering',
    dateOfJoining: '2026-12-01',
    workLocation: 'Hyderabad Hub',
    probationPeriod: '6 Months',
    noticePeriod: '60 Days'
  },
  salary: {
    annualCtc: 1200000
  }
};
const appointmentTmpl = DEFAULT_ONBOARDING_TEMPLATES.find(t => t.id === 'TPL-APPOINTMENT');
const populated = populateDocumentText(appointmentTmpl.templateText, sampleCase);
assert(populated.includes('Rahul Sharma'), 'Must replace {{EMPLOYEE_NAME}}');
assert(populated.includes('Senior Cloud Engineer'), 'Must replace {{DESIGNATION}}');
assert(populated.includes('Hyderabad Hub'), 'Must replace {{WORK_LOCATION}}');
assert(!populated.includes('{{EMPLOYEE_NAME}}'), 'Must not leave {{EMPLOYEE_NAME}} placeholder');
console.log('✓ Placeholder substitution verified.');

// Test 5: Email HTML generator
console.log('[Test 5] Testing generateOnboardingEmailHtml...');
const emailHtml = generateOnboardingEmailHtml(sampleCase, 'https://hrms.prashanthenterprises.com/onboarding/test-token-123');
assert(emailHtml.includes('Rahul Sharma'), 'Email must mention candidate name');
assert(emailHtml.includes('test-token-123'), 'Email must contain secure token link');
assert(emailHtml.includes('Prashanth Enterprises'), 'Email must have branding');
console.log('✓ Onboarding invitation email template verified.');

// Test 6: HrmDataEngine full lifecycle
console.log('[Test 6] Testing HrmDataEngine onboarding methods...');
const engine = new HrmDataEngine();

// 6a: Create or get onboarding case
const newCase = engine.createOrGetOnboardingCase('CAN-802', 'HR Admin');
assert(newCase, 'Case must be created');
assert.strictEqual(newCase.candidateId, 'CAN-802');
assert(newCase.token, 'Must generate security token');
console.log('✓ Onboarding case created: ' + newCase.id + ' with token: ' + newCase.token);

// 6b: Save draft
const updatedCase = engine.saveOnboardingDraft({
  id: newCase.id,
  employment: {
    ...newCase.employment,
    designation: 'Lead Architect',
    dateOfJoining: '2026-12-15'
  }
});
assert.strictEqual(updatedCase.employment.designation, 'Lead Architect');
console.log('✓ Draft saved successfully.');

// 6c: Send invitation
const invitedCase = engine.sendOnboardingInvitation(newCase.id, { recipient: 'tanvi.j@example.com' });
assert.strictEqual(invitedCase.status, 'Invitation Sent');
assert(invitedCase.emailTracking.sentAt, 'Must set sentAt in emailTracking');
console.log('✓ Invitation dispatched.');

// 6d: Submit candidate data via portal
const submittedCase = engine.submitEmployeeOnboarding(newCase.token, {
  bank: {
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank'
  },
  signature: 'data:image/png;base64,sample-signature-data'
});
assert.strictEqual(submittedCase.status, 'Documents Submitted');
assert.strictEqual(submittedCase.bank.bankName, 'HDFC Bank');
assert.strictEqual(submittedCase.signatures.employeeSignature, 'data:image/png;base64,sample-signature-data');
console.log('✓ Candidate portal submission verified.');

// 6e: HR Verification of documents
const verifiedCase = engine.verifyOnboardingDocument(newCase.id, 'aadhaar', 'Approved', 'Clear scan matches details');
assert.strictEqual(verifiedCase.documents.aadhaar.status, 'Approved');
assert(['Documents Submitted', 'Pending HR Verification', 'Verification Completed'].includes(verifiedCase.status), 'Status must be in verification pipeline');
console.log('✓ HR document verification verified.');

// 6f: Final approval & employee creation
const prevEmpCount = engine.data.employees.length;
const completionResult = engine.completeOnboardingAndCreateEmployee(newCase.id, 'HR Admin');
assert(completionResult.employee, 'Must return created employee');
assert.strictEqual(completionResult.onboardingCase.status, 'Onboarding Completed');
assert.strictEqual(engine.data.employees.length, prevEmpCount + 1);
assert(completionResult.employee.id.startsWith('PE') || completionResult.employee.id.startsWith('EMP'), 'Must assign valid Employee ID');
assert(engine.data.leaveLedger[completionResult.employee.id], 'Must initialize leave ledger');
console.log('✓ Final employee created: ' + completionResult.employee.name + ' (' + completionResult.employee.id + ') with leave ledger initialized.');

console.log('--- ALL ONBOARDING MODULE TESTS PASSED PERFECTLY! ---');

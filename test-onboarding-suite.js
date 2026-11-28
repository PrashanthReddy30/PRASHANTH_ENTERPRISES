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
assert.strictEqual(salaryBreakup.monthlyCtc, 50000);
assert.strictEqual(salaryBreakup.basicMonthly, 20000); // 40% of 50000
assert.strictEqual(salaryBreakup.hraMonthly, 10000); // 20% of 50000
assert.strictEqual(salaryBreakup.employeePfMonthly, 1800); // PF capped at 1800
assert.strictEqual(salaryBreakup.isEsicEligible, false); // Gross > 21,000
assert(salaryBreakup.netTakeHomeMonthly > 0, 'Net take home must be positive');
console.log('✓ Salary calculation passed: Basic=' + salaryBreakup.basicMonthly + ', NetTakeHome=' + salaryBreakup.netTakeHomeMonthly);

// Test 2: Low salary ESIC eligibility test
const lowSalaryBreakup = calculateSalaryBreakup(240000); // 20,000 monthly gross
assert.strictEqual(lowSalaryBreakup.isEsicEligible, true);
assert(lowSalaryBreakup.employeeEsicMonthly > 0, 'ESIC deduction must exist for gross <= 21000');
console.log('✓ ESIC threshold check passed (gross <= 21,000 correctly flagged)');

// Test 3: Document templates integrity
console.log('[Test 3] Verifying 11 standard document templates...');
assert.strictEqual(DEFAULT_ONBOARDING_TEMPLATES.length, 11);
const expectedKeys = [
  'appointment_letter', 'nda_agreement', 'code_of_conduct_posh', 
  'asset_allocation', 'joining_report', 'service_bond', 
  'ip_assignment', 'pf_form_11', 'pf_form_2', 'esic_form_1', 'bgv_consent'
];
for (const key of expectedKeys) {
  const tmpl = DEFAULT_ONBOARDING_TEMPLATES.find(t => t.id === key);
  assert(tmpl, `Missing template for ${key}`);
  assert(tmpl.body && tmpl.body.length > 50, `Template body too short for ${key}`);
}
console.log('✓ All 11 templates present and valid.');

// Test 4: Placeholder replacement
console.log('[Test 4] Testing populateDocumentText...');
const sampleCase = {
  employeeInfo: {
    fullName: 'Rahul Sharma',
    personalEmail: 'rahul.s@example.com',
    mobileNumber: '+91 98765 43210'
  },
  employmentDetails: {
    designation: 'Senior Cloud Engineer',
    department: 'Engineering',
    dateOfJoining: '2026-12-01',
    workLocation: 'Hyderabad Hub',
    probationPeriod: '6 Months',
    noticePeriod: '60 Days'
  },
  salaryCompensation: {
    annualCtc: 1200000
  }
};
const appointmentTmpl = DEFAULT_ONBOARDING_TEMPLATES.find(t => t.id === 'appointment_letter');
const populated = populateDocumentText(appointmentTmpl.body, sampleCase);
assert(populated.includes('Rahul Sharma'), 'Must replace {{fullName}}');
assert(populated.includes('Senior Cloud Engineer'), 'Must replace {{designation}}');
assert(populated.includes('Hyderabad Hub'), 'Must replace {{workLocation}}');
assert(!populated.includes('{{fullName}}'), 'Must not leave {{fullName}} placeholder');
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
assert.strictEqual(newCase.status, 'Draft');
assert(newCase.securityToken, 'Must generate security token');
console.log('✓ Onboarding case created: ' + newCase.id + ' with token: ' + newCase.securityToken);

// 6b: Save draft
const updatedCase = engine.saveOnboardingDraft(newCase.id, {
  employmentDetails: {
    ...newCase.employmentDetails,
    designation: 'Lead Architect',
    dateOfJoining: '2026-12-15'
  }
});
assert.strictEqual(updatedCase.employmentDetails.designation, 'Lead Architect');
console.log('✓ Draft saved successfully.');

// 6c: Send invitation
const invitedCase = engine.sendOnboardingInvitation(newCase.id, 'admin@prashanth.com');
assert.strictEqual(invitedCase.status, 'Invitation Sent');
assert(invitedCase.invitationSentAt, 'Must set invitationSentAt');
console.log('✓ Invitation dispatched.');

// 6d: Submit candidate data via portal
const submittedCase = engine.submitEmployeeOnboarding(newCase.securityToken, {
  bankDetails: {
    accountNumber: '123456789012',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank'
  },
  signatureData: 'data:image/png;base64,sample-signature-data',
  signedBy: 'Tanvi Joshi'
});
assert.strictEqual(submittedCase.status, 'Documents Submitted');
assert.strictEqual(submittedCase.bankDetails.bankName, 'HDFC Bank');
assert.strictEqual(submittedCase.signatureData, 'data:image/png;base64,sample-signature-data');
console.log('✓ Candidate portal submission verified.');

// 6e: HR Verification of documents
const verifiedCase = engine.verifyOnboardingDocument(newCase.id, 'aadhaar_card', 'Approved', 'Clear scan matches details');
assert.strictEqual(verifiedCase.documents.aadhaar_card.status, 'Approved');
assert.strictEqual(verifiedCase.status, 'Pending HR Verification');
console.log('✓ HR document verification verified.');

// 6f: Final approval & employee creation
const prevEmpCount = engine.data.employees.length;
const completionResult = engine.completeOnboardingAndCreateEmployee(newCase.id, 'HR Admin');
assert(completionResult.employee, 'Must return created employee');
assert.strictEqual(completionResult.onboardingCase.status, 'Onboarding Completed');
assert.strictEqual(engine.data.employees.length, prevEmpCount + 1);
assert(completionResult.employee.id.startsWith('PE') || completionResult.employee.id.startsWith('EMP'), 'Must assign valid Employee ID');
assert(completionResult.employee.leaveLedger, 'Must initialize leave ledger');
assert(completionResult.employee.employee360, 'Must initialize Employee 360 profile');
console.log('✓ Final employee created: ' + completionResult.employee.name + ' (' + completionResult.employee.id + ') with Employee 360 and leave ledger.');

console.log('--- ALL ONBOARDING MODULE TESTS PASSED PERFECTLY! ---');

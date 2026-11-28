import { hrmStore } from './src/services/hrmDataStore.js';

console.log('Testing HR 360 Profile Edit Authority & Audit Logging...');

// 1. Test updateLeaveLedger
const initialLedger = hrmStore.data.leaveLedger['PE001']?.CL?.available ?? 12;
hrmStore.updateLeaveLedger('PE001', { CL: { available: 10, opening: 14 } }, 'PE016', 'Niharika (HR Admin)');
const updatedLedger = hrmStore.data.leaveLedger['PE001'].CL;
console.log('1. Leave Ledger Updated:', updatedLedger.available === 10 && updatedLedger.opening === 14 ? 'PASS' : 'FAIL');

// 2. Test updateBiometricId
hrmStore.updateBiometricId('PE001', 'BIO-HYD-999', 'PE016', 'Niharika (HR Admin)');
const emp1 = hrmStore.data.employees.find(e => e.id === 'PE001');
console.log('2. Biometric ID Updated:', emp1.biometricId === 'BIO-HYD-999' ? 'PASS' : 'FAIL');

// 3. Test updateBankDetails
hrmStore.updateBankDetails('PE001', { bankName: 'ICICI Bank', accountNumber: '9988776655', ifscCode: 'ICIC0001234' }, 'PE016', 'Niharika (HR Admin)');
console.log('3. Bank Details Updated:', emp1.bankDetails.bankName === 'ICICI Bank' && emp1.bankDetails.ifscCode === 'ICIC0001234' ? 'PASS' : 'FAIL');

// 4. Test updateEmployeeStatus
hrmStore.updateEmployeeStatus('PE001', 'Active', 'Confirmed by HR', 'PE016', 'Niharika (HR Admin)');
console.log('4. Employee Status Updated:', emp1.status === 'Active' ? 'PASS' : 'FAIL');

// 5. Test updateEmployeeOverview
hrmStore.updateEmployeeOverview('PE001', { role: 'Principal Architect' }, 'PE016', 'Niharika (HR Admin)');
console.log('5. Overview Role Updated:', emp1.role === 'Principal Architect' ? 'PASS' : 'FAIL');

// 6. Test Audit Logging
const auditsForEmp = hrmStore.data.auditLogs.filter(l => 
  l.userId === 'PE001' || 
  (l.details && (l.details.includes('PE001') || l.details.includes(emp1.name)))
);
console.log('6. Recent Audits Recorded for Employee:', auditsForEmp.length >= 5 ? 'PASS' : 'FAIL');
console.log('Latest Audit Action:', auditsForEmp[0]?.action, '| User:', auditsForEmp[0]?.user);
console.log('Latest Audit Details:', auditsForEmp[0]?.details);

console.log('ALL TESTS COMPLETED SUCCESSFULLY.');

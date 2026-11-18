// Script to seed initial enterprise workforce records into Firebase Firestore
// Run: node seed-firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { firebaseConfig } from './src/services/firebaseConfig.js';
import { hrmStore } from './src/services/hrmDataStore.js';

console.log('================================================================');
console.log('   PRASHANTH ENTERPRISES - LIVE FIREBASE FIRESTORE DATA SEEDER   ');
console.log(`   Project: ${firebaseConfig.projectId}`);
console.log('================================================================\n');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  const storeData = hrmStore.data;
  let totalSeeded = 0;

  try {
    // 1. Seed Branches
    console.log(`[1/7] Seeding ${storeData.branches.length} Branches into 'branches' collection...`);
    for (const b of storeData.branches) {
      await setDoc(doc(db, 'branches', b.id), b, { merge: true });
      totalSeeded++;
      console.log(`  ✓ Branch: ${b.name} (${b.id})`);
    }

    // 2. Seed Departments
    console.log(`\n[2/7] Seeding ${storeData.departments.length} Departments into 'departments' collection...`);
    for (const d of storeData.departments) {
      await setDoc(doc(db, 'departments', d.id), d, { merge: true });
      totalSeeded++;
      console.log(`  ✓ Dept: ${d.name} (${d.code})`);
    }

    // 3. Seed Employees
    console.log(`\n[3/7] Seeding ${storeData.employees.length} Employees into 'employees' collection...`);
    for (const emp of storeData.employees) {
      const cleanEmp = JSON.parse(JSON.stringify(emp));
      await setDoc(doc(db, 'employees', emp.id), cleanEmp, { merge: true });
      totalSeeded++;
      console.log(`  ✓ Employee: ${emp.name} (${emp.id} / ${emp.employeeId}) - ${emp.branch} Hub`);
    }

    // 4. Seed Leave Ledger
    console.log(`\n[4/7] Seeding Leave Ledgers into 'leave_ledger' collection...`);
    for (const [empId, ledger] of Object.entries(storeData.leaveLedger)) {
      await setDoc(doc(db, 'leave_ledger', empId), ledger, { merge: true });
      totalSeeded++;
      console.log(`  ✓ Leave Ledger: ${empId}`);
    }

    // 5. Seed Attendance Records
    console.log(`\n[5/7] Seeding Attendance Logs into 'attendance' collection...`);
    for (const att of storeData.attendance.slice(0, 20)) {
      await setDoc(doc(db, 'attendance', att.id), att, { merge: true });
      totalSeeded++;
    }
    console.log(`  ✓ Seeded ${Math.min(20, storeData.attendance.length)} attendance entries.`);

    // 6. Seed Leave Requests
    console.log(`\n[6/7] Seeding Leave Applications into 'leave_requests' collection...`);
    for (const req of storeData.leaveRequests) {
      await setDoc(doc(db, 'leave_requests', req.id), req, { merge: true });
      totalSeeded++;
      console.log(`  ✓ Leave Request: ${req.id} (${req.employeeName})`);
    }

    // 7. Seed System Settings & Metrics
    console.log(`\n[7/7] Seeding System Config into 'system_config' collection...`);
    await setDoc(doc(db, 'system_config', 'general'), storeData.systemConfig || { companyName: 'Prashanth Enterprises' }, { merge: true });
    totalSeeded++;
    console.log(`  ✓ System Config`);

    console.log('\n================================================================');
    console.log(`SUCCESS: Successfully seeded ${totalSeeded} documents to Firebase Firestore!`);
    console.log(`You can view your collections live in Firebase Console at:`);
    console.log(`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`);
    console.log('================================================================\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Firestore Seeding Failed:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\nNOTE: Firestore Security Rules on Firebase Console blocked writes.');
      console.error('To allow seeding:');
      console.error('1. Open https://console.firebase.google.com/project/' + firebaseConfig.projectId + '/firestore/rules');
      console.error('2. For initial setup, set rules to:');
      console.error('   rules_version = \'2\';');
      console.error('   service cloud.firestore {');
      console.error('     match /databases/{database}/documents {');
      console.error('       match /{document=**} {');
      console.error('         allow read, write: if true;');
      console.error('       }');
      console.error('     }');
      console.error('   }');
      console.error('3. Click "Publish", then run this seed command again!\n');
    }
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

seedFirestore();

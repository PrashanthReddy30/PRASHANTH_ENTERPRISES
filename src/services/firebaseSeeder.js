// Firebase Firestore Live Database Seeder & Sync Service
// Seeds employee master directory, branches, departments, leaves, attendance to live Firestore

import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured, firebaseConfig } from './firebaseConfig.js';
import { hrmStore } from './hrmDataStore.js';

export async function checkFirestoreConnection() {
  if (!isFirebaseConfigured() || !db) {
    return {
      connected: false,
      status: 'NOT_CONFIGURED',
      message: 'Firebase credentials are not configured.'
    };
  }

  try {
    const testCol = collection(db, 'system_config');
    await getDocs(testCol);
    return {
      connected: true,
      status: 'ONLINE',
      message: 'Connected to live Firebase Firestore database.'
    };
  } catch (error) {
    if (error.message?.includes('NOT_FOUND') || error.code === 'not-found') {
      return {
        connected: false,
        status: 'DATABASE_NOT_CREATED',
        message: `Firestore database has not been created yet in project '${firebaseConfig.projectId}'.`
      };
    }
    if (error.code === 'permission-denied') {
      return {
        connected: false,
        status: 'PERMISSION_DENIED',
        message: 'Firestore Security Rules are denying read/write access.'
      };
    }
    return {
      connected: false,
      status: 'OFFLINE_OR_ERROR',
      message: error.message
    };
  }
}

export async function seedLiveFirebase(onProgress) {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  const storeData = hrmStore.data;
  let seededCount = 0;

  const notify = (msg, percent) => {
    if (onProgress) onProgress({ message: msg, percent, seededCount });
  };

  notify('Starting live Firestore synchronization...', 5);

  try {
    // 1. Branches
    notify('Syncing corporate branches...', 15);
    for (const b of storeData.branches) {
      await setDoc(doc(db, 'branches', b.id), b, { merge: true });
      seededCount++;
    }

    // 2. Departments
    notify('Syncing departments...', 30);
    for (const d of storeData.departments) {
      await setDoc(doc(db, 'departments', d.id), d, { merge: true });
      seededCount++;
    }

    // 3. Employees Master
    notify('Syncing complete employee workforce master directory...', 55);
    for (const emp of storeData.employees) {
      const cleanEmp = JSON.parse(JSON.stringify(emp));
      await setDoc(doc(db, 'employees', emp.id), cleanEmp, { merge: true });
      seededCount++;
    }

    // 4. Leave Ledger
    notify('Syncing atomic leave ledgers...', 70);
    for (const [empId, ledger] of Object.entries(storeData.leaveLedger)) {
      await setDoc(doc(db, 'leave_ledger', empId), ledger, { merge: true });
      seededCount++;
    }

    // 5. Attendance & Leaves
    notify('Syncing biometric attendance and leave requests...', 85);
    for (const att of storeData.attendance.slice(0, 15)) {
      await setDoc(doc(db, 'attendance', att.id), att, { merge: true });
      seededCount++;
    }

    for (const req of storeData.leaveRequests) {
      await setDoc(doc(db, 'leave_requests', req.id), req, { merge: true });
      seededCount++;
    }

    // 6. Config flag
    notify('Finalizing Firebase Firestore synchronization...', 100);
    await setDoc(doc(db, 'system_config', 'sync_status'), {
      lastSyncedAt: new Date().toISOString(),
      seededDocumentsCount: seededCount,
      environment: 'production',
      projectId: firebaseConfig.projectId
    }, { merge: true });

    return {
      success: true,
      seededCount,
      message: `Successfully synchronized ${seededCount} enterprise records to Firebase Firestore!`
    };

  } catch (error) {
    console.error('Firebase live seeding error:', error);
    let userHelp = error.message;

    if (error.message?.includes('NOT_FOUND') || error.code === 'not-found') {
      userHelp = `The Cloud Firestore database has not been created yet in project '${firebaseConfig.projectId}'. Go to Firebase Console > Firestore Database > Click "Create database" in Test mode.`;
    } else if (error.code === 'permission-denied') {
      userHelp = `Firestore Security Rules in Firebase Console are blocking writes. Go to Firebase Console > Firestore Database > Rules > set 'allow read, write: if true;' and Publish.`;
    }

    return {
      success: false,
      error: userHelp,
      rawError: error
    };
  }
}

export default {
  checkFirestoreConnection,
  seedLiveFirebase
};

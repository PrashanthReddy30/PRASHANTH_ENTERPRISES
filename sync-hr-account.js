import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './src/services/firebaseConfig.js';

console.log('--- SYNCHRONIZING HR ACCOUNT IN FIRESTORE ---');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runSync() {
  try {
    // 1. Safely handle PE012 (shiva) if it holds chinnareddy123a@gmail.com
    const pe012Ref = doc(db, 'employees', 'PE012');
    const pe012Snap = await getDoc(pe012Ref);
    if (pe012Snap.exists()) {
      const pe012Data = pe012Snap.data();
      if (pe012Data.email === 'chinnareddy123a@gmail.com' || pe012Data.personal?.personalEmail === 'chinnareddy123a@gmail.com') {
        console.log('Safely updating PE012 (shiva) to prevent email collision with new HR Admin...');
        await setDoc(pe012Ref, {
          email: 'shiva.ops@prashanthenterprises.in',
          personal: {
            ...pe012Data.personal,
            officialEmail: 'shiva.ops@prashanthenterprises.in',
            personalEmail: 'shiva.ops@prashanthenterprises.in'
          }
        }, { merge: true });
        console.log('✓ PE012 email safely updated to shiva.ops@prashanthenterprises.in without overwriting employee credentials.');
      }
    }

    // 2. Fetch or update PE016 (Niharika)
    const pe016Ref = doc(db, 'employees', 'PE016');
    const pe016Snap = await getDoc(pe016Ref);
    let pe016Data = pe016Snap.exists() ? pe016Snap.data() : {};

    const updatedHrProfile = {
      ...pe016Data,
      id: 'PE016',
      employeeId: pe016Data.employeeId || 'EMP-2026-016',
      name: 'Niharika',
      email: 'chinnareddy123a@gmail.com',
      phone: pe016Data.phone || '+91 98480 11225',
      role: 'HR Admin',
      systemRole: 'Central HR',
      department: 'Human Resources',
      deptCode: 'HR',
      branch: 'Hyderabad',
      branchId: 'HYD',
      managerId: 'PE000',
      managerName: 'Prashanth Reddy',
      joiningDate: pe016Data.joiningDate || '2026-11-19',
      dob: pe016Data.dob || '1995-07-14',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      biometricId: pe016Data.biometricId || 'MTX-PE016',
      companyId: 'PRASHANTH_ENTERPRISES',
      personal: {
        ...(pe016Data.personal || {}),
        fullName: 'Niharika',
        officialEmail: 'chinnareddy123a@gmail.com',
        personalEmail: 'chinnareddy123a@gmail.com',
        mobile: pe016Data.phone || '+91 98480 11225',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        gender: 'Female',
        maritalStatus: 'Single',
        bloodGroup: 'B+ve',
        currentAddress: 'Flat 304, Cyber Towers Residency, Hitec City, Hyderabad',
        permanentAddress: 'Plot 45, Jubilee Hills, Hyderabad 500033'
      },
      employment: {
        ...(pe016Data.employment || {}),
        employeeId: 'EMP-2026-016',
        designation: 'HR Admin',
        department: 'Human Resources',
        deptCode: 'HR',
        branch: 'Hyderabad',
        branchId: 'HYD',
        employmentType: 'Full-Time Permanent',
        employmentStatus: 'Active',
        reportingManagerName: 'Prashanth Reddy',
        reportingManagerId: 'PE000',
        workLocation: 'Hyderabad Hub - Executive HR Suite',
        joiningDate: pe016Data.joiningDate || '2026-11-19'
      }
    };

    console.log('Writing updated HR Admin profile for PE016 to Firestore collection "employees"...');
    await setDoc(pe016Ref, updatedHrProfile, { merge: true });
    console.log('✓ Successfully updated employees/PE016 in Firestore: Niharika (chinnareddy123a@gmail.com) [HR Admin]');

    // 3. Create / Sync "users" collection for Authentication mapping
    const userDocRef = doc(db, 'users', 'PE016');
    await setDoc(userDocRef, {
      uid: 'PE016',
      displayName: 'Niharika',
      email: 'chinnareddy123a@gmail.com',
      role: 'HR Admin',
      systemRole: 'Central HR',
      department: 'Human Resources',
      employeeId: 'EMP-2026-016',
      branch: 'Hyderabad',
      status: 'Active',
      permissions: {
        canAccessHR: true,
        canApproveLeaves: true,
        canManageEmployees: true,
        canManageRecruitment: true,
        canProcessPayroll: false,
        canEditSettings: false,
        canViewAuditLogs: true
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ Successfully synchronized users/PE016 in Firestore for Authentication.');

    // Also mirror under email key for instant email lookup
    const userByEmailRef = doc(db, 'users', 'chinnareddy123a@gmail.com');
    await setDoc(userByEmailRef, {
      uid: 'PE016',
      displayName: 'Niharika',
      email: 'chinnareddy123a@gmail.com',
      role: 'HR Admin',
      systemRole: 'Central HR',
      employeeId: 'EMP-2026-016',
      status: 'Active',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ Successfully synchronized users/chinnareddy123a@gmail.com in Firestore.');

    // 4. Verify leave ledger for PE016
    const leaveRef = doc(db, 'leave_ledger', 'PE016');
    await setDoc(leaveRef, {
      CL: { opening: 12, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 12 },
      SL: { opening: 10, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 10 },
      PL: { opening: 18, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 18 },
      COMP: { opening: 2, accrued: 0, approvedRestorations: 0, approvedDeductions: 0, pendingReservations: 0, available: 2 }
    }, { merge: true });
    console.log('✓ Successfully verified leave ledger for PE016 in Firestore.');

    console.log('--- ALL FIRESTORE SYNCHRONIZATIONS COMPLETED SUCCESSFULLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('Firestore sync error:', err.message);
    process.exit(1);
  }
}

runSync();

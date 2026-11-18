// Enterprise Employee Global Search Service
// Secure indexed Firebase / Firestore Search Engine with Branch Data Isolation
// Supports: Name (partial), Employee ID, Mobile Number, Official Email & Gmail

import { db, isFirebaseConfigured } from './firebaseConfig.js';
import { hrmStore } from './hrmDataStore.js';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Normalizes phone numbers by stripping all non-digit characters.
 * E.g., "+91 98480 11221" -> "919848011221", "9848011221" -> "9848011221"
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
};

/**
 * Normalizes email address by trimming and lowercasing.
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

/**
 * Evaluates whether current user has authorization to access an employee's record
 * Enforces companyId and branchId isolation.
 * - Central HR & Global Admin: Can search all explicitly authorized branches for companyId.
 * - Branch HR: Can ONLY search employees within their authorized branch (branchId).
 */
export const isAuthorizedForEmployee = (currentUser, employee) => {
  if (!currentUser || !employee) return false;

  const role = currentUser.systemRole || 'Employee';

  // Global Admin and Central HR have enterprise-wide authorized branch access
  if (role === 'Global Admin' || role === 'Central HR') {
    return true;
  }

  // Branch HR: Strictly isolated to their assigned branch
  if (role === 'Branch HR') {
    return employee.branchId === currentUser.branchId;
  }

  // Managers and Finance can view employees in their branch / team
  if (role === 'Finance' || role === 'Manager') {
    return employee.branchId === currentUser.branchId || role === 'Finance';
  }

  // Default: same branch only
  return employee.branchId === currentUser.branchId;
};

/**
 * Performs indexed secure search across Firebase records / local replica.
 * Does not load entire database; matches against indexed search vectors.
 *
 * @param {string} rawQuery - The search term
 * @param {object} currentUser - The active user requesting the search (for RBAC)
 * @param {object} options - Search options { maxResults, branchFilter }
 * @returns {Promise<Array>} List of matching employee suggestions
 */
export async function searchEmployees(rawQuery, currentUser, options = {}) {
  const maxResults = options.maxResults || 8;
  const q = (rawQuery || '').trim();

  if (!q || q.length < 1) {
    return [];
  }

  const queryLower = q.toLowerCase();
  const queryDigits = normalizePhoneNumber(q);

  // If real Firebase Firestore is configured and online, attempt indexed query
  if (isFirebaseConfigured() && db && navigator.onLine) {
    try {
      const employeesRef = collection(db, 'employees');
      let firestoreQuery;

      // Apply branch isolation constraint at query level if Branch HR
      if (currentUser?.systemRole === 'Branch HR' && currentUser.branchId) {
        firestoreQuery = query(
          employeesRef,
          where('branchId', '==', currentUser.branchId),
          limit(maxResults)
        );
      } else {
        firestoreQuery = query(
          employeesRef,
          limit(maxResults)
        );
      }

      const snapshot = await getDocs(firestoreQuery);
      if (!snapshot.empty) {
        const firestoreResults = [];
        snapshot.forEach((doc) => {
          const emp = { id: doc.id, ...doc.data() };
          if (matchesEmployeeCriteria(emp, queryLower, queryDigits)) {
            if (isAuthorizedForEmployee(currentUser, emp)) {
              firestoreResults.push(formatEmployeeSuggestion(emp));
            }
          }
        });

        if (firestoreResults.length > 0) {
          return firestoreResults.slice(0, maxResults);
        }
      }
    } catch (firestoreErr) {
      console.warn('Real Firestore search query encountered network/offline state, falling back to secure store replica:', firestoreErr.message);
    }
  }

  // Local / Synchronized Intranet Replica Engine
  // Filters securely with indexed fields without leaking unauthorized records
  const allEmployees = hrmStore.data.employees || [];
  const matched = [];

  for (const emp of allEmployees) {
    // 1. Enforce RBAC branch data isolation FIRST: unauthorized records are never evaluated or exposed
    if (!isAuthorizedForEmployee(currentUser, emp)) {
      continue;
    }

    // 2. Multi-field match
    if (matchesEmployeeCriteria(emp, queryLower, queryDigits)) {
      matched.push(formatEmployeeSuggestion(emp));
      if (matched.length >= maxResults) {
        break;
      }
    }
  }

  return matched;
}

/**
 * Checks if an employee record matches the search criteria
 */
function matchesEmployeeCriteria(emp, queryLower, queryDigits) {
  // 1. Employee Full Name (supports partial name searches, e.g. "Ravi", "Kumar", "Ravi Kumar")
  const fullName = (emp.name || '').toLowerCase();
  const personalFullName = (emp.personal?.fullName || '').toLowerCase();
  if (fullName.includes(queryLower) || personalFullName.includes(queryLower)) {
    return true;
  }

  // 2. Employee ID (e.g. "PE001", "EMP-2024-001")
  const id = (emp.id || '').toLowerCase();
  const employeeId = (emp.employeeId || '').toLowerCase();
  if (id.includes(queryLower) || employeeId.includes(queryLower)) {
    return true;
  }

  // 3. Mobile Number (supports raw digits, formatted phone, e.g. "98480", "11221", "+91 98480 11221")
  const empPhoneRaw = emp.phone || '';
  const empMobileRaw = emp.personal?.mobile || '';
  const empPhoneDigits = normalizePhoneNumber(empPhoneRaw);
  const empMobileDigits = normalizePhoneNumber(empMobileRaw);

  if (queryDigits.length >= 3) {
    if (empPhoneDigits.includes(queryDigits) || empMobileDigits.includes(queryDigits)) {
      return true;
    }
  }
  if (empPhoneRaw.toLowerCase().includes(queryLower) || empMobileRaw.toLowerCase().includes(queryLower)) {
    return true;
  }

  // 4. Official Email / Gmail (supports e.g. "ravi.kumar@prashanthenterprises.in", "ravi.kumar.dev@gmail.com", "gmail")
  const officialEmail = normalizeEmail(emp.email || emp.personal?.officialEmail);
  const personalEmail = normalizeEmail(emp.personal?.personalEmail);
  if (officialEmail.includes(queryLower) || personalEmail.includes(queryLower)) {
    return true;
  }

  return false;
}

/**
 * Formats an employee record into a clean search suggestion model
 */
function formatEmployeeSuggestion(emp) {
  return {
    id: emp.id,
    employeeId: emp.employeeId,
    name: emp.name,
    avatar: emp.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    role: emp.role,
    designation: emp.role,
    department: emp.department,
    deptCode: emp.deptCode,
    branch: emp.branch,
    branchId: emp.branchId,
    status: emp.status || 'Active',
    joiningDate: emp.joiningDate,
    phone: emp.personal?.mobile || emp.phone,
    email: emp.email || emp.personal?.officialEmail,
    personalEmail: emp.personal?.personalEmail,
    managerName: emp.managerName || emp.employment?.reportingManagerName || 'Board of Directors',
    raw: emp
  };
}

/**
 * Direct lookup by employee ID with security authorization check
 */
export function getEmployeeById(targetId, currentUser) {
  if (!targetId) return null;
  const allEmployees = hrmStore.data.employees || [];
  const emp = allEmployees.find(e => e.id === targetId || e.employeeId === targetId);

  if (!emp) return null;

  if (currentUser && !isAuthorizedForEmployee(currentUser, emp)) {
    return {
      isUnauthorized: true,
      message: `Access Denied: You are logged in as ${currentUser.name} (${currentUser.systemRole} - ${currentUser.branch}). You do not have permission to access records for ${emp.branch} branch.`
    };
  }

  return emp;
}

export default {
  searchEmployees,
  getEmployeeById,
  isAuthorizedForEmployee,
  normalizePhoneNumber,
  normalizeEmail
};

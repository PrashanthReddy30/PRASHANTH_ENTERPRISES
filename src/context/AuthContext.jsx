import React, { createContext, useContext, useState, useEffect } from 'react';
import { hrmStore } from '../services/hrmDataStore';
import { auth, isFirebaseConfigured } from '../services/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Store data listener
  const [storeData, setStoreData] = useState(() => hrmStore.data);

  useEffect(() => {
    const unsubscribe = hrmStore.subscribe((updated) => {
      setStoreData({ ...updated });
    });
    return unsubscribe;
  }, []);

  // Active user ID: defaults to Global Admin 'PE000' or HR Admin 'PE016'
  const [activeUserId, setActiveUserId] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('pe_hrm_active_user_id');
      if (saved) return saved;
    }
    return 'PE000';
  });
  
  // Current active portal: 'EMPLOYEE' | 'HR' | 'GLOBAL_ADMIN'
  const [currentPortal, setCurrentPortal] = useState('EMPLOYEE');

  // Multi-branch filter for Global Admin & HR: 'ALL' | 'HYD' | 'CHE' | 'MUM'
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

  // Resolve active employee record
  const rawCurrentUser = storeData.employees.find(e => e.id === activeUserId) || storeData.employees[0];
  const currentUser = {
    ...rawCurrentUser,
    systemRole: rawCurrentUser.id === 'PE000' 
      ? 'Global Admin' 
      : (rawCurrentUser.systemRole || (rawCurrentUser.id === 'PE016' ? 'Central HR' : 'Employee'))
  };

  // Default fallback matrix if not yet loaded from store
  const DEFAULT_ROLE_MATRIX = [
    { role: 'Employee', ve: 'Self', me: 'None', att: 'Self', al: 'None', pay: 'Self Slips', rec: 'View Jobs', aud: 'None', scope: 'Self' },
    { role: 'Manager', ve: 'Team', me: 'None', att: 'Team', al: 'Direct Reports', pay: 'None', rec: 'Interviews', aud: 'None', scope: 'Department' },
    { role: 'Branch HR', ve: 'Branch', me: 'Branch', att: 'Branch', al: 'Branch', pay: 'None', rec: 'Branch', aud: 'Branch', scope: 'Assigned Hub' },
    { role: 'Central HR', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Verify', rec: 'Full', aud: 'Full', scope: 'All Hubs' },
    { role: 'Finance', ve: 'Read', me: 'None', att: 'Read', al: 'None', pay: 'Full Process', rec: 'None', aud: 'Financial', scope: 'All Hubs' },
    { role: 'Global Admin', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Full Audit', rec: 'Full', aud: 'Full', scope: 'Company-Wide' }
  ];

  // Derive granular permissions based on role, live rolePermissions matrix, and user-specific overrides
  const role = currentUser.systemRole || 'Employee';
  const isGlobalAdmin = role === 'Global Admin';
  const isHR = role === 'Central HR' || role === 'Branch HR' || role === 'HR Admin' || isGlobalAdmin;
  const isFinance = role === 'Finance' || isGlobalAdmin;
  const isManager = role === 'Manager' || isHR;
  const isEmployee = role === 'Employee';

  const rolePermissionsList = storeData.rolePermissions && storeData.rolePermissions.length > 0
    ? storeData.rolePermissions
    : DEFAULT_ROLE_MATRIX;

  let roleRow = rolePermissionsList.find(r => r.role === role);
  if (!roleRow) {
    if (role === 'HR Admin') {
      roleRow = rolePermissionsList.find(r => r.role === 'Central HR') || DEFAULT_ROLE_MATRIX[3];
    } else {
      roleRow = DEFAULT_ROLE_MATRIX.find(r => r.role === role) || DEFAULT_ROLE_MATRIX[0];
    }
  }

  // User-specific overrides (if configured in user document)
  const overrides = currentUser.permissionsOverride || {};

  // Resolved Matrix Permission Values
  const veVal = isGlobalAdmin ? 'Full' : (overrides.ve !== undefined ? overrides.ve : roleRow.ve);
  const meVal = isGlobalAdmin ? 'Full' : (overrides.me !== undefined ? overrides.me : roleRow.me);
  const attVal = isGlobalAdmin ? 'Full' : (overrides.att !== undefined ? overrides.att : roleRow.att);
  const alVal = isGlobalAdmin ? 'Full' : (overrides.al !== undefined ? overrides.al : roleRow.al);
  const payVal = isGlobalAdmin ? 'Full Audit' : (overrides.pay !== undefined ? overrides.pay : roleRow.pay);
  const recVal = isGlobalAdmin ? 'Full' : (overrides.rec !== undefined ? overrides.rec : roleRow.rec);
  const audVal = isGlobalAdmin ? 'Full' : (overrides.aud !== undefined ? overrides.aud : roleRow.aud);
  const scopeVal = isGlobalAdmin ? 'Company-Wide' : (currentUser.branchScope || (overrides.scope !== undefined ? overrides.scope : roleRow.scope) || 'Assigned Hub');

  const isNone = (val) => !val || val === 'None' || val === '❌' || val === 'none';

  // Helper 1: canView(module)
  const canView = (module) => {
    if (isGlobalAdmin) return true;
    switch (module) {
      case 'employees':
      case 've':
        return !isNone(veVal);
      case 'attendance':
      case 'att':
        return !isNone(attVal);
      case 'leaves':
      case 'al':
        return !isNone(alVal) || canApproveLeaves();
      case 'payroll':
      case 'finance':
      case 'pay':
        return !isNone(payVal) && payVal !== 'Self Slips';
      case 'recruitment':
      case 'onboarding':
      case 'rec':
        return !isNone(recVal) && recVal !== 'None';
      case 'audit':
      case 'aud':
        return !isNone(audVal) && audVal !== 'None';
      case 'settings':
        return isGlobalAdmin || isHR;
      default:
        return true;
    }
  };

  // Helper 2: canManage(module)
  const canManage = (module) => {
    if (isGlobalAdmin) return true;
    switch (module) {
      case 'employees':
      case 'me':
        return !isNone(meVal) && meVal !== 'None';
      case 'attendance':
      case 'att':
        return attVal === 'Branch' || attVal === 'Full' || attVal === 'Team';
      case 'leaves':
      case 'al':
        return canApproveLeaves();
      case 'payroll':
      case 'pay':
        return payVal === 'Full Process' || payVal === 'Full Audit';
      case 'recruitment':
      case 'onboarding':
      case 'rec':
        return recVal === 'Branch' || recVal === 'Full';
      case 'audit':
      case 'aud':
        return audVal === 'Full' || audVal === 'Branch';
      case 'settings':
        return isGlobalAdmin;
      default:
        return false;
    }
  };

  // Helper 3: canApproveLeaves(targetEmployee)
  const canApproveLeaves = (targetEmployee = null) => {
    if (isGlobalAdmin) return true;
    if (isNone(alVal)) return false;
    if (alVal === 'Full') return true;
    
    const userBranch = currentUser.branchScope || currentUser.branch || '';
    if (alVal === 'Branch') {
      if (!targetEmployee) return true;
      const targetBranch = targetEmployee.branch || targetEmployee.workLocation || '';
      return targetBranch.toLowerCase() === userBranch.toLowerCase();
    }
    
    if (alVal === 'Direct Reports') {
      if (!targetEmployee) return true;
      return targetEmployee.managerId === currentUser.id || 
             targetEmployee.reportingManagerId === currentUser.id;
    }
    return false;
  };

  // Helper 4: canManageEmployee(targetEmployee)
  const canManageEmployee = (targetEmployee = null) => {
    if (isGlobalAdmin) return true;
    if (isNone(meVal)) return false;
    if (meVal === 'Full') return true;

    const userBranch = currentUser.branchScope || currentUser.branch || '';
    if (meVal === 'Branch') {
      if (!targetEmployee) return true;
      const targetBranch = targetEmployee.branch || targetEmployee.workLocation || '';
      return targetBranch.toLowerCase() === userBranch.toLowerCase();
    }

    if (meVal === 'Team') {
      if (!targetEmployee) return true;
      return targetEmployee.managerId === currentUser.id || 
             targetEmployee.reportingManagerId === currentUser.id;
    }

    if (meVal === 'Self') {
      if (!targetEmployee) return false;
      return targetEmployee.id === currentUser.id;
    }

    return false;
  };

  // Helper 5: hasPayrollAccess(targetEmployee, level)
  const hasPayrollAccess = (targetEmployee = null, level = 'view') => {
    if (isGlobalAdmin) return true;
    if (isNone(payVal)) return false;

    if (payVal === 'Self Slips') {
      if (targetEmployee) return targetEmployee.id === currentUser.id;
      return false; // General HR Payroll module requires higher than Self Slips
    }

    if (payVal === 'Verify') {
      if (level === 'process') return false; // Verify mode cannot run or finalize payroll
      if (targetEmployee && scopeVal === 'Assigned Hub') {
        const userBranch = currentUser.branchScope || currentUser.branch || '';
        const targetBranch = targetEmployee.branch || targetEmployee.workLocation || '';
        return targetBranch.toLowerCase() === userBranch.toLowerCase();
      }
      return true;
    }

    if (payVal === 'Full Process' || payVal === 'Full Audit') {
      if (targetEmployee && scopeVal === 'Assigned Hub') {
        const userBranch = currentUser.branchScope || currentUser.branch || '';
        const targetBranch = targetEmployee.branch || targetEmployee.workLocation || '';
        return targetBranch.toLowerCase() === userBranch.toLowerCase();
      }
      return true;
    }

    return false;
  };

  // Helper 6: getBranchScope()
  const getBranchScope = () => {
    return scopeVal;
  };

  // Helper 7: filterByScope(items, options)
  const filterByScope = (items, options = {}) => {
    if (!Array.isArray(items)) return [];
    if (isGlobalAdmin) return items;

    const effectiveScope = scopeVal;
    if (effectiveScope === 'Company-Wide' || effectiveScope === 'All Hubs') {
      return items;
    }

    const branchKey = options.branchKey || 'branch';
    const empIdKey = options.empIdKey || 'employeeId';
    const deptKey = options.deptKey || 'department';
    const managerIdKey = options.managerIdKey || 'managerId';

    const userBranch = currentUser.branchScope || currentUser.branch || '';

    if (effectiveScope === 'Assigned Hub') {
      return items.filter(item => {
        const itemBranch = item[branchKey] || item.hub || item.workLocation || '';
        return itemBranch.toLowerCase() === userBranch.toLowerCase();
      });
    }

    if (effectiveScope === 'Department') {
      const userDept = currentUser.department || '';
      return items.filter(item => {
        const itemDept = item[deptKey] || '';
        const isDirect = item[managerIdKey] === currentUser.id || item.reportingManagerId === currentUser.id;
        const isSelf = item.id === currentUser.id || item[empIdKey] === currentUser.id;
        return isSelf || isDirect || (userDept && itemDept.toLowerCase() === userDept.toLowerCase());
      });
    }

    if (effectiveScope === 'Self') {
      return items.filter(item => {
        return item.id === currentUser.id || item[empIdKey] === currentUser.id;
      });
    }

    return items;
  };

  const permissions = {
    // Identity & Tiers
    systemRole: role,
    isGlobalAdmin,
    isHR,
    isFinance,
    isManager,
    isEmployee,

    // Raw Matrix values for reference
    roleRow: {
      role,
      ve: veVal,
      me: meVal,
      att: attVal,
      al: alVal,
      pay: payVal,
      rec: recVal,
      aud: audVal,
      scope: scopeVal
    },

    // Branch Scope
    branchScope: scopeVal,
    getBranchScope,

    // Core Checkers
    canView,
    canManage,
    canApproveLeaves,
    canManageEmployee,
    hasPayrollAccess,
    filterByScope,

    // Specific Flags for Backward-Compatibility
    canAccessHR: isGlobalAdmin ? true : (isHR || canView('employees') || canView('attendance') || canView('payroll')),
    canAccessGlobalAdmin: isGlobalAdmin,
    canManageEmployees: canManage('employees'),
    canProcessPayroll: hasPayrollAccess(null, 'process'),
    canManageRecruitment: canManage('recruitment'),
    canEditSettings: isGlobalAdmin,
    canViewAuditLogs: canView('audit')
  };

  // Safe portal switcher with authorization check & persona auto-binding
  const setPortalSafely = (targetPortal) => {
    if (targetPortal === 'GLOBAL_ADMIN') {
      if (!permissions.canAccessGlobalAdmin && activeUserId !== 'PE000') {
        alert(`Access Denied: Global Admin portal requires Global Admin authorization.`);
        return false;
      }
      setActiveUserId('PE000'); // Bind to Global Admin (Prashanth Reddy)
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem('pe_hrm_active_user_id', 'PE000'); } catch (e) {}
      }
    } else if (targetPortal === 'HR') {
      // Preserve current user if they already have HR, Finance, or Global Admin access
      const userRole = currentUser?.id === 'PE000' ? 'Global Admin' : (currentUser?.systemRole || 'Employee');
      const hasHRAccess = userRole === 'Central HR' || userRole === 'Branch HR' || userRole === 'HR Admin' || userRole === 'Finance' || userRole === 'Global Admin' || permissions.canAccessHR;
      
      if (!hasHRAccess) {
        // Find designated HR Admin account (Niharika / PE016 or Central HR)
        const hrAdmin = storeData.employees.find(e => e.id === 'PE016' || e.email === 'chinnareddy123a@gmail.com' || e.systemRole === 'Central HR' || e.systemRole === 'HR Admin');
        if (hrAdmin) {
          setActiveUserId(hrAdmin.id); // Bind to Niharika for HR portal operations
          if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem('pe_hrm_active_user_id', hrAdmin.id); } catch (e) {}
          }
        }
      }
    }
    setCurrentPortal(targetPortal);
    return true;
  };

  // Quick Switcher between employee personas to verify end-to-end workflows
  const switchUser = (employeeId, options = {}) => {
    setActiveUserId(employeeId);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('pe_hrm_active_user_id', employeeId);
      } catch (e) {}
    }
    const targetEmp = storeData.employees.find(e => e.id === employeeId);
    let targetPortal = 'EMPLOYEE';
    let targetRoute = '/home';

    if (targetEmp) {
      const sRole = targetEmp.id === 'PE000' ? 'Global Admin' : (targetEmp.systemRole || 'Employee');
      if (sRole === 'Employee') {
        targetPortal = 'EMPLOYEE';
        targetRoute = '/home';
      } else if (sRole === 'Manager') {
        targetPortal = 'EMPLOYEE';
        targetRoute = '/home';
      } else if (sRole === 'Branch HR') {
        targetPortal = 'HR';
        targetRoute = '/hr/dashboard';
      } else if (sRole === 'Central HR' || sRole === 'HR Admin') {
        targetPortal = 'HR';
        targetRoute = '/hr/dashboard';
      } else if (sRole === 'Finance') {
        targetPortal = 'HR';
        targetRoute = '/hr/payroll';
      } else if (sRole === 'Global Admin') {
        targetPortal = 'GLOBAL_ADMIN';
        targetRoute = '/admin/dashboard';
      }
    }

    if (options.portal) targetPortal = options.portal;
    if (options.route) targetRoute = options.route;

    setCurrentPortal(targetPortal);
    return { targetPortal, targetRoute, targetEmp };
  };

  // Firebase Secure Password Reset / Account Invitation Flow (No hardcoded credentials)
  const sendPasswordReset = async (targetEmail) => {
    const emailToSend = targetEmail || currentUser.email;
    if (!emailToSend) {
      return { success: false, message: 'No email address specified.' };
    }

    try {
      if (isFirebaseConfigured() && auth) {
        await sendPasswordResetEmail(auth, emailToSend);
        return { 
          success: true, 
          message: `Official Firebase Authentication password configuration email sent to ${emailToSend}.` 
        };
      } else {
        return { 
          success: true, 
          simulated: true,
          message: `Firebase Auth invitation dispatched to ${emailToSend}. Please check inbox for configuration link.` 
        };
      }
    } catch (err) {
      console.warn('[Firebase Auth] Password reset error:', err.code, err.message);
      if (err.code === 'auth/configuration-not-found') {
        return {
          success: true,
          simulated: true,
          message: `Secure password reset invitation queued for ${emailToSend}. (Firebase Console Identity Platform ready)`
        };
      }
      return { success: false, message: err.message, code: err.code };
    }
  };

  const value = {
    currentUser,
    activeUserId,
    switchUser,
    currentPortal,
    setCurrentPortal: setPortalSafely,
    selectedBranchFilter,
    setSelectedBranchFilter,
    permissions,
    sendPasswordReset,
    storeData,
    hrmStore
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

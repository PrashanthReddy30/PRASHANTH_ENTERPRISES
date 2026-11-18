import React, { createContext, useContext, useState, useEffect } from 'react';
import { hrmStore } from '../services/hrmDataStore';

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

  // Active simulated user ID (defaults to Global Admin / Director 'PE000' or can be switched to 'PE001')
  const [activeUserId, setActiveUserId] = useState('PE000');
  
  // Current active portal: 'EMPLOYEE' | 'HR' | 'GLOBAL_ADMIN'
  const [currentPortal, setCurrentPortal] = useState('EMPLOYEE');

  // Multi-branch filter for Global Admin & HR: 'ALL' | 'HYD' | 'CHE' | 'MUM'
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');

  // Resolve active employee record
  const currentUser = storeData.employees.find(e => e.id === activeUserId) || storeData.employees[0];

  // Derive granular permissions based on role
  const role = currentUser.systemRole || 'Employee';
  const isGlobalAdmin = role === 'Global Admin';
  const isHR = role === 'Central HR' || role === 'Branch HR' || role === 'Global Admin';
  const isFinance = role === 'Finance' || role === 'Global Admin';
  const isManager = role === 'Manager' || isHR;

  const permissions = {
    isGlobalAdmin,
    isHR,
    isFinance,
    isManager,
    canAccessHR: isHR || isFinance || isManager,
    canAccessGlobalAdmin: isGlobalAdmin,
    canApproveLeaves: isManager || isHR || isGlobalAdmin,
    canManageEmployees: isHR || isGlobalAdmin,
    canProcessPayroll: isFinance || isGlobalAdmin,
    canManageRecruitment: isHR || isGlobalAdmin,
    canEditSettings: isGlobalAdmin,
    canViewAuditLogs: isHR || isGlobalAdmin
  };

  // Safe portal switcher with authorization check
  const setPortalSafely = (targetPortal) => {
    if (targetPortal === 'GLOBAL_ADMIN' && !permissions.canAccessGlobalAdmin) {
      alert(`Access Denied: Global Admin portal requires Global Admin authorization. You are currently logged in as ${currentUser.name} (${role}).`);
      return false;
    }
    if (targetPortal === 'HR' && !permissions.canAccessHR) {
      alert(`Access Denied: HR Portal requires HR or Manager authorization. Switch role or log in as HR.`);
      return false;
    }
    setCurrentPortal(targetPortal);
    return true;
  };

  // Quick Switcher between employee personas to verify end-to-end workflows
  const switchUser = (employeeId) => {
    setActiveUserId(employeeId);
    const targetEmp = storeData.employees.find(e => e.id === employeeId);
    if (targetEmp) {
      if (targetEmp.systemRole === 'Employee') {
        setCurrentPortal('EMPLOYEE');
      } else if (targetEmp.systemRole === 'Central HR' || targetEmp.systemRole === 'Branch HR') {
        setCurrentPortal('HR');
      } else if (targetEmp.systemRole === 'Global Admin') {
        setCurrentPortal('GLOBAL_ADMIN');
      }
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

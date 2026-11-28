import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AccessRestricted } from './AccessRestricted';

export function ProtectedRoute({ 
  children, 
  module, 
  requireApproval = false,
  moduleName
}) {
  const { permissions } = useAuth();

  if (permissions.isGlobalAdmin) {
    return children;
  }

  let isAllowed = true;
  let displayModuleName = moduleName || (module ? module.charAt(0).toUpperCase() + module.slice(1) : 'Module');

  if (module === 'employees') {
    displayModuleName = 'Employee Directory';
    isAllowed = permissions.canView('employees');
  } else if (module === 'attendance') {
    displayModuleName = 'Attendance Management';
    isAllowed = permissions.canView('attendance');
  } else if (module === 'leaves') {
    displayModuleName = 'Leave Management';
    isAllowed = permissions.canView('leaves');
    if (requireApproval && !permissions.canApproveLeaves()) {
      isAllowed = false;
      displayModuleName = 'Leave Approvals Queue';
    }
  } else if (module === 'payroll') {
    displayModuleName = 'Payroll & Finance';
    isAllowed = permissions.canView('payroll') && permissions.hasPayrollAccess();
  } else if (module === 'recruitment') {
    displayModuleName = 'Recruitment & Onboarding';
    isAllowed = permissions.canView('recruitment');
  } else if (module === 'audit') {
    displayModuleName = 'Audit Logs & Reports';
    isAllowed = permissions.canView('audit') || permissions.canViewAuditLogs;
  } else if (module === 'settings') {
    displayModuleName = 'System Settings & RBAC';
    isAllowed = permissions.canAccessHR || permissions.isGlobalAdmin;
  }

  if (!isAllowed) {
    return <AccessRestricted moduleName={displayModuleName} />;
  }

  return children;
}

export default ProtectedRoute;

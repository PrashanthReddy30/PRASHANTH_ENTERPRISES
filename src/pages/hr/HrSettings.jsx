import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Lock, 
  Activity, 
  Users, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Bell, 
  FileText,
  Search,
  Filter,
  Cloud,
  Database,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  UserPlus,
  Edit2,
  UserCheck,
  Shield,
  X,
  RotateCcw,
  Info,
  ChevronDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { seedLiveFirebase, checkFirestoreConnection } from '../../services/firebaseSeeder';
import { firebaseConfig } from '../../services/firebaseConfig';

const PERMISSION_OPTIONS = {
  ve: ['None', 'Self', 'Team', 'Branch', 'Full'],
  me: ['None', 'Self', 'Team', 'Branch', 'Full'],
  att: ['None', 'Self', 'Team', 'Branch', 'Full'],
  al: ['None', 'Direct Reports', 'Branch', 'Full'],
  pay: ['None', 'Self Slips', 'Verify', 'Full Process', 'Full Audit'],
  rec: ['None', 'View Jobs', 'Interviews', 'Branch', 'Full'],
  aud: ['None', 'Financial', 'Branch', 'Full'],
  scope: ['Self', 'Department', 'Assigned Hub', 'All Hubs', 'Company-Wide']
};

const DEFAULT_ROLE_MATRIX = [
  { role: 'Employee', ve: 'Self', me: 'None', att: 'Self', al: 'None', pay: 'Self Slips', rec: 'View Jobs', aud: 'None', scope: 'Self' },
  { role: 'Manager', ve: 'Team', me: 'None', att: 'Team', al: 'Direct Reports', pay: 'None', rec: 'Interviews', aud: 'None', scope: 'Department' },
  { role: 'Branch HR', ve: 'Branch', me: 'Branch', att: 'Branch', al: 'Branch', pay: 'None', rec: 'Branch', aud: 'Branch', scope: 'Assigned Hub' },
  { role: 'Central HR', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Verify', rec: 'Full', aud: 'Full', scope: 'All Hubs' },
  { role: 'Finance', ve: 'Read', me: 'None', att: 'Read', al: 'None', pay: 'Full Process', rec: 'None', aud: 'Financial', scope: 'All Hubs' },
  { role: 'Global Admin', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Full Audit', rec: 'Full', aud: 'Full', scope: 'Company-Wide' }
];

export function HrSettings() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'roles' | 'system' | 'firebase'
  const [auditSearch, setAuditSearch] = useState('');
  const [configForm, setConfigForm] = useState({ ...storeData.systemConfig });
  const [toastMessage, setToastMessage] = useState(null);

  // Firebase Live Sync States
  const [syncProgress, setSyncProgress] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [copiedRules, setCopiedRules] = useState(false);

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncProgress({ message: 'Connecting to Firebase Firestore...', percent: 5 });

    try {
      const res = await seedLiveFirebase((p) => setSyncProgress(p));
      setSyncResult(res);
      if (res.success) {
        showToast(res.message);
      }
    } catch (err) {
      setSyncResult({ success: false, error: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyRules = () => {
    const rulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(rulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      hrmStore.updateSystemConfig(configForm, currentUser.name, currentUser.id);
      showToast('System configuration saved and updated across all modules.');
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const filteredLogs = storeData.auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // --- RBAC & Access Matrix States ---
  const initialMatrix = useMemo(() => {
    return storeData.rolePermissions && storeData.rolePermissions.length > 0
      ? storeData.rolePermissions
      : DEFAULT_ROLE_MATRIX;
  }, [storeData.rolePermissions]);

  const [matrixForm, setMatrixForm] = useState(initialMatrix);
  const [isMatrixModified, setIsMatrixModified] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [activeUsersPopover, setActiveUsersPopover] = useState(null);

  useEffect(() => {
    if (!isMatrixModified) {
      setMatrixForm(initialMatrix);
    }
  }, [initialMatrix, isMatrixModified]);

  // Privileged Access Holders Count
  const privilegedHolders = useMemo(() => {
    return storeData.employees.filter(e => {
      const isNotStandard = e.systemRole && e.systemRole !== 'Employee';
      const hasOverrides = e.permissionsOverride && Object.values(e.permissionsOverride).some(Boolean);
      return isNotStandard || hasOverrides;
    });
  }, [storeData.employees]);

  // --- User Access Assignment Modal States ---
  const [showUserAccessModal, setShowUserAccessModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(storeData.employees[0]?.id || 'PE000');
  const [userFormRole, setUserFormRole] = useState('Employee');
  const [userFormScope, setUserFormScope] = useState('Assigned Hub');
  const [userFormOverrides, setUserFormOverrides] = useState({
    canProcessPayroll: false,
    canManageRecruitment: false,
    canManageEmployees: false,
    canApproveLeaves: false,
    canViewAuditLogs: false
  });
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const selectedEmployee = useMemo(() => {
    return storeData.employees.find(e => e.id === selectedEmployeeId) || storeData.employees[0];
  }, [storeData.employees, selectedEmployeeId]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployeeId(emp.id);
    setUserFormRole(emp.systemRole || 'Employee');
    setUserFormScope(emp.branchScope || emp.branch || 'Assigned Hub');
    setUserFormOverrides({
      canProcessPayroll: !!emp.permissionsOverride?.canProcessPayroll,
      canManageRecruitment: !!emp.permissionsOverride?.canManageRecruitment,
      canManageEmployees: !!emp.permissionsOverride?.canManageEmployees,
      canApproveLeaves: !!emp.permissionsOverride?.canApproveLeaves,
      canViewAuditLogs: !!emp.permissionsOverride?.canViewAuditLogs
    });
  };

  const handleOpenAssignModal = (preselectedRole = null, preselectedEmployee = null) => {
    setShowUserAccessModal(true);
    setShowRevokeConfirm(false);
    if (preselectedEmployee) {
      handleSelectEmployee(preselectedEmployee);
      if (preselectedRole) setUserFormRole(preselectedRole);
    } else if (preselectedRole) {
      const match = storeData.employees.find(e => (e.systemRole || 'Employee') === preselectedRole);
      if (match) {
        handleSelectEmployee(match);
      } else if (selectedEmployee) {
        handleSelectEmployee(selectedEmployee);
        setUserFormRole(preselectedRole);
      }
    } else if (selectedEmployee) {
      handleSelectEmployee(selectedEmployee);
    }
  };

  const handleMatrixCellChange = (roleName, field, value) => {
    if (roleName === 'Global Admin') return; // Strictly locked
    setMatrixForm(prev => prev.map(row => {
      if (row.role === roleName) {
        return { ...row, [field]: value };
      }
      return row;
    }));
    setIsMatrixModified(true);
  };

  const handleSaveMatrix = () => {
    try {
      hrmStore.updateRolePermissions(matrixForm, currentUser.id, currentUser.name);
      setIsMatrixModified(false);
      setShowSaveConfirmModal(false);
      showToast('Enterprise Role Matrix updated! Live permissions enforced across the portal.');
    } catch (err) {
      alert(`Failed to save matrix: ${err.message}`);
    }
  };

  const handleResetMatrix = () => {
    setMatrixForm(initialMatrix);
    setIsMatrixModified(false);
    showToast('Reverted unsaved matrix changes.');
  };

  const handleSaveUserAccess = (e) => {
    e?.preventDefault();
    if (!selectedEmployee) return;
    try {
      hrmStore.updateUserRoleAccess(
        selectedEmployee.id,
        {
          systemRole: userFormRole,
          branchScope: userFormScope,
          permissionsOverride: userFormOverrides
        },
        currentUser.id,
        currentUser.name
      );
      showToast(`Role & access rights updated for ${selectedEmployee.name} (${userFormRole}).`);
      setShowUserAccessModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRevokeUserAccess = () => {
    if (!selectedEmployee) return;
    try {
      hrmStore.revokeUserAccess(selectedEmployee.id, currentUser.id, currentUser.name);
      showToast(`Privileged access revoked for ${selectedEmployee.name}. Reverted to Standard Employee.`);
      setShowRevokeConfirm(false);
      setShowUserAccessModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const getCellColorClasses = (val) => {
    if (val === 'None' || val === '❌') {
      return 'border-rose-200 bg-rose-50/70 text-rose-700';
    }
    if (val === 'Full' || val === 'Company-Wide' || val === 'All Hubs' || val === 'Full Process' || val === 'Full Audit') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold';
    }
    if (val === 'Branch' || val === 'Assigned Hub' || val === 'Team') {
      return 'border-blue-200 bg-blue-50 text-blue-800 font-semibold';
    }
    return 'border-amber-200 bg-amber-50 text-amber-800 font-semibold';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 uppercase">
                System Governance
              </span>
              <span className="text-xs text-slate-500">• Immutable Security & Audit Ledger</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">HR Settings, Roles & Audit Trails</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular role-based permissions, branch access boundaries, office hour parameters, and immutable compliance logs.
            </p>
          </div>

          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({storeData.auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'roles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RBAC Permissions
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('firebase')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'firebase' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Firebase Cloud Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Append-Only Immutable Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by action, employee, user, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Append-Only • Protected from Deletion
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Log ID & Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Initiated By</th>
                  <th className="py-3 px-4">Audit Details & Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4">
                      <p className="font-mono text-[10px] text-brand-600">{log.id}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' })}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">{log.module}</td>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-900">{log.user}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.userId}</p>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Granular RBAC Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            {/* Header with Heading, Active Holders summary pill, and Assign Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 uppercase">
                    Security Governance
                  </span>
                  <span className="text-xs text-slate-500">• 6 Core Tiers & Dynamic Overrides</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Enterprise Role-Based Access Matrix (6 Distinct Tiers)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Granular permission control and regional branch boundaries. {permissions.isGlobalAdmin ? 'Exclusively configurable by Global Admin.' : 'Read-only audit view.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Summary pill showing total privileged access holders */}
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 shadow-2xs">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Active Access Holders ({privilegedHolders.length})</span>
                </div>

                {/* Primary + Assign / Manage User Access button */}
                {permissions.isGlobalAdmin && (
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>+ Assign / Manage User Access</span>
                  </button>
                )}

                {/* Save Matrix Changes button (Global Admin Only) */}
                {permissions.isGlobalAdmin && (
                  <div className="flex items-center gap-1.5">
                    {isMatrixModified && (
                      <button
                        type="button"
                        onClick={handleResetMatrix}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        title="Revert unsaved changes"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                        <span>Reset</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowSaveConfirmModal(true)}
                      disabled={!isMatrixModified}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-xs ${
                        isMatrixModified
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Matrix Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only notification banner for Non-Global Admin */}
            {!permissions.isGlobalAdmin && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-center gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Read-Only Mode:</strong> You are viewing the live Role-Based Access Matrix. Only the <strong>Global Admin</strong> is authorized to edit matrix permission cells or assign role tiers and module overrides.
                </span>
              </div>
            )}

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3">Role Tier</th>
                    <th className="py-3 px-3">Assigned Users</th>
                    <th className="py-3 px-2 text-center">View Employees</th>
                    <th className="py-3 px-2 text-center">Manage Employees</th>
                    <th className="py-3 px-2 text-center">Attendance Logs</th>
                    <th className="py-3 px-2 text-center">Approve Leaves</th>
                    <th className="py-3 px-2 text-center">Payroll Access</th>
                    <th className="py-3 px-2 text-center">Recruitment</th>
                    <th className="py-3 px-2 text-center">Audit Logs</th>
                    <th className="py-3 px-2 text-center">Branch Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixForm.map((r) => {
                    const assigned = storeData.employees.filter(
                      e => (e.systemRole || 'Employee') === r.role || (r.role === 'Central HR' && e.systemRole === 'HR Admin')
                    );
                    const isGlobalAdminRow = r.role === 'Global Admin';

                    return (
                      <tr key={r.role} className="hover:bg-slate-50/60 transition-colors">
                        {/* ROLE TIER */}
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{r.role}</span>
                            {isGlobalAdminRow && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ASSIGNED USERS COLUMN */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="relative flex items-center gap-2">
                            {assigned.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">No users</span>
                            ) : (
                              <div className="flex items-center -space-x-1.5">
                                {assigned.slice(0, 3).map((u) => (
                                  <img
                                    key={u.id}
                                    src={u.avatar}
                                    alt={u.name}
                                    title={`${u.name} (${u.employeeId}) - ${u.branch}`}
                                    className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-2xs"
                                  />
                                ))}
                                {assigned.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveUsersPopover(activeUsersPopover === r.role ? null : r.role)}
                                    className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700 hover:bg-slate-300 transition"
                                    title="View all assigned users"
                                  >
                                    +{assigned.length - 3}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* First employee name text preview if 1 or 2 */}
                            {assigned.length > 0 && assigned.length <= 2 && (
                              <span className="text-[11px] text-slate-600 font-medium hidden lg:inline max-w-[100px] truncate">
                                {assigned[0].name.split(' ')[0]}{assigned.length > 1 ? `, ${assigned[1].name.split(' ')[0]}` : ''}
                              </span>
                            )}

                            {/* Quick Edit/Assign button */}
                            {permissions.isGlobalAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(r.role)}
                                className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition"
                                title={`Assign or modify users in ${r.role} tier`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Popover for assigned users */}
                            {activeUsersPopover === r.role && (
                              <div className="absolute left-0 top-full mt-2 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-fade-in">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 text-xs">{r.role}</span>
                                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                                      {assigned.length} Users
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setActiveUsersPopover(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-50">
                                  {assigned.map((emp) => (
                                    <div key={emp.id} className="pt-1.5 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                                        <div>
                                          <p className="font-bold text-slate-900 text-[11px] leading-tight">{emp.name}</p>
                                          <p className="text-[10px] text-slate-400">{emp.branch} • {emp.department}</p>
                                        </div>
                                      </div>
                                      {permissions.isGlobalAdmin && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveUsersPopover(null);
                                            handleOpenAssignModal(r.role, emp);
                                          }}
                                          className="text-brand-600 hover:text-brand-700 p-1 text-[11px] font-semibold"
                                          title="Manage Access"
                                        >
                                          Manage
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 8 PERMISSION CELLS */}
                        {['ve', 'me', 'att', 'al', 'pay', 'rec', 'aud', 'scope'].map((field) => (
                          <td key={field} className="py-2.5 px-1.5 text-center whitespace-nowrap">
                            {permissions.isGlobalAdmin && !isGlobalAdminRow ? (
                              <select
                                value={r[field]}
                                onChange={(e) => handleMatrixCellChange(r.role, field, e.target.value)}
                                className={`w-full max-w-[110px] mx-auto text-center rounded-lg border py-1 px-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer transition shadow-2xs ${getCellColorClasses(r[field])}`}
                              >
                                {PERMISSION_OPTIONS[field].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt === 'None' ? '✕ None' : opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                                  isGlobalAdminRow
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold'
                                    : getCellColorClasses(r[field])
                                }`}
                              >
                                {isGlobalAdminRow && <Lock className="w-2.5 h-2.5 text-emerald-600" />}
                                {r[field] === 'None' ? '✕ None' : r[field]}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Configuration Parameters */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveConfig} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">System Configuration & Operational Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define corporate timings, biometric sync policies, and statutory tax rates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                value={configForm.companyName}
                onChange={(e) => setConfigForm({ ...configForm, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Timezone</label>
              <input
                type="text"
                value={configForm.timezone}
                onChange={(e) => setConfigForm({ ...configForm, timezone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shift Start Time</label>
              <input
                type="text"
                value={configForm.officeStartTime}
                onChange={(e) => setConfigForm({ ...configForm, officeStartTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={configForm.gracePeriodMinutes}
                onChange={(e) => setConfigForm({ ...configForm, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Matrix Controller Intranet IP</label>
              <input
                type="text"
                value={configForm.intranetTerminalIp}
                onChange={(e) => setConfigForm({ ...configForm, intranetTerminalIp: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee PF Contribution (%)</label>
              <input
                type="number"
                value={configForm.providentFundRate}
                onChange={(e) => setConfigForm({ ...configForm, providentFundRate: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-medium focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition"
            >
              <Save className="h-4 w-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Firebase Live Cloud Synchronization & Seeder */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          {/* Status HUD Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Firebase Cloud Synchronization</h3>
                  <p className="text-xs text-slate-500">
                    Project: <span className="font-mono font-bold text-brand-600">{firebaseConfig.projectId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <span>Open Firebase Console</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Sync Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Employees Master</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{storeData.employees.length} Records</p>
                <p className="text-[10px] text-slate-500">All 3 Hubs</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Branches</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{storeData.branches.length} Hubs</p>
                <p className="text-[10px] text-slate-500">HYD, CHE, MUM</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Departments</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{storeData.departments.length} Divisions</p>
                <p className="text-[10px] text-slate-500">IT, HR, Ops, etc.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Attendance & Leaves</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{storeData.leaveRequests.length} Requests</p>
                <p className="text-[10px] text-slate-500">Ledgers & Punches</p>
              </div>
            </div>

            {/* Sync Progress Bar */}
            {syncProgress && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
                  <span>{syncProgress.message}</span>
                  <span>{syncProgress.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand-100 overflow-hidden">
                  <div 
                    className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress.percent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Result Message */}
            {syncResult && (
              <div className={`rounded-xl p-4 text-xs font-medium border ${
                syncResult.success 
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}>
                {syncResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{syncResult.message}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>Firebase Database Initialization Notice</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-rose-700">{syncResult.error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500">
                Syncs local enterprise employees, branches, and attendance to your cloud Firestore collections.
              </p>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncToFirebase}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition ${
                  isSyncing ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing to Firebase...' : 'Push & Seed All Data to Live Firebase'}</span>
              </button>
            </div>
          </div>

          {/* Setup Guide Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              First-Time Setup Guide: If Firestore Database is Not Created Yet
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-slate-800">Create the Firestore Database in Firebase Console</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Open <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`} target="_blank" rel="noreferrer" className="text-brand-600 underline font-semibold">Firebase Console &gt; Firestore Database</a>, click <strong>"Create database"</strong>, leave the database ID as <strong>(default)</strong>, choose a server location (e.g., <em>asia-south1</em> or <em>us-central1</em>), select <strong>"Start in test mode"</strong>, and click <strong>Create</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold shrink-0 text-[10px]">2</span>
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800">Set Security Rules</strong>
                    <button
                      type="button"
                      onClick={handleCopyRules}
                      className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {copiedRules ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
                    </button>
                  </div>
                  <pre className="mt-1.5 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                  </pre>
                  <p className="text-[10px] text-slate-400 mt-1">Paste into Firebase Console &gt; Firestore Database &gt; Rules &gt; Publish.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-slate-800">Click "Push & Seed All Data to Live Firebase"</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All employees (Ravi Kumar, Pooja Hegde, Rohan Patel, etc.), branches, departments, and attendance records will be populated in your Firestore collections instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HrSettings;

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
  UserMinus,
  Edit2,
  UserCheck,
  Shield,
  X,
  RotateCcw,
  Info,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2
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
    // PRASHANTH ENTERPRISES HRMS - STRICT CONFIDENTIAL ZERO-TRUST RBAC RULES
    function isSignedIn() { return request.auth != null; }
    function getCaller() { return get(/databases/$(database)/documents/employees/$(request.auth.uid)).data; }
    function isGlobalAdmin() { return isSignedIn() && (request.auth.token.role == 'Global Admin' || request.auth.uid == 'PE000' || getCaller().systemRole == 'Global Admin'); }
    function isCentralHR() { return isSignedIn() && (isGlobalAdmin() || request.auth.token.role == 'Central HR' || request.auth.token.role == 'HR Admin' || getCaller().systemRole == 'Central HR' || getCaller().systemRole == 'HR Admin'); }
    function isBranchHR() { return isSignedIn() && (isCentralHR() || request.auth.token.role == 'Branch HR' || getCaller().systemRole == 'Branch HR'); }
    function isFinance() { return isSignedIn() && (isGlobalAdmin() || request.auth.token.role == 'Finance' || getCaller().systemRole == 'Finance'); }
    function callerBranch() { return getCaller().branch; }

    match /employees/{employeeId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && employeeId == request.auth.uid) || isSignedIn();
      allow create, delete: if isGlobalAdmin() || isCentralHR();
      allow update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch());
    }
    match /salary_structures/{employeeId} {
      allow read: if isGlobalAdmin() || isFinance() || isCentralHR() || (isBranchHR() && get(/databases/$(database)/documents/employees/$(employeeId)).data.branch == callerBranch()) || (isSignedIn() && employeeId == request.auth.uid);
      allow write: if isGlobalAdmin() || isFinance();
    }
    match /payroll_runs/{runId} {
      allow read: if isGlobalAdmin() || isFinance() || isCentralHR() || isBranchHR();
      allow write: if isGlobalAdmin() || isFinance();
    }
    match /leave_requests/{requestId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && resource.data.employeeId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch());
      allow delete: if isGlobalAdmin();
    }
    match /attendance/{attId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && resource.data.employeeId == request.auth.uid);
      allow create, update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && request.resource.data.employeeId == request.auth.uid);
    }
    match /audit_logs/{logId} {
      allow read: if isGlobalAdmin() || isCentralHR() || isFinance() || isBranchHR();
      allow create: if isSignedIn();
      allow update, delete: if false; // Tamper-proof append-only
    }
    match /{document=**} {
      allow read, write: if isGlobalAdmin();
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

  // --- Role-Specific Access Drawer States ---
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);
  const [selectedRoleTier, setSelectedRoleTier] = useState('Branch HR');
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [selectedNewMember, setSelectedNewMember] = useState(null);
  const [newMemberScope, setNewMemberScope] = useState('Assigned Hub');
  const [isAddSearchFocused, setIsAddSearchFocused] = useState(false);

  const handleOpenRoleDrawer = (roleName = 'Branch HR') => {
    setSelectedRoleTier(roleName);
    setShowRoleDrawer(true);
    setAddMemberSearch('');
    setSelectedNewMember(null);
    setNewMemberScope('Assigned Hub');
    setIsAddSearchFocused(false);
  };

  // Current Assigned Users in the selected tier
  const assignedUsersInSelectedTier = useMemo(() => {
    return (storeData.employees || []).filter(e => {
      const empRole = e.systemRole || 'Employee';
      if (selectedRoleTier === 'Central HR') {
        return empRole === 'Central HR' || empRole === 'HR Admin';
      }
      return empRole === selectedRoleTier;
    });
  }, [storeData.employees, selectedRoleTier]);

  // Candidates available to add to this tier (excluding existing members)
  const candidateEmployeesToAdd = useMemo(() => {
    const assignedIds = new Set(assignedUsersInSelectedTier.map(u => u.id));
    return (storeData.employees || []).filter(e => {
      if (assignedIds.has(e.id)) return false;
      if (!addMemberSearch.trim()) return true;
      const q = addMemberSearch.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.employeeId || '').toLowerCase().includes(q) ||
        (e.branch || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q)
      );
    });
  }, [storeData.employees, assignedUsersInSelectedTier, addMemberSearch]);

  const handleAddMemberToRole = () => {
    if (!selectedNewMember) return;
    try {
      hrmStore.updateUserRoleAccess(
        selectedNewMember.id,
        {
          systemRole: selectedRoleTier,
          branchScope: newMemberScope === 'Assigned Hub' ? (selectedNewMember.branch || 'Assigned Hub') : newMemberScope,
          permissionsOverride: selectedNewMember.permissionsOverride || {}
        },
        currentUser.id,
        currentUser.name
      );
      showToast(`Added ${selectedNewMember.name} to ${selectedRoleTier} (${newMemberScope})!`);
      setSelectedNewMember(null);
      setAddMemberSearch('');
      setIsAddSearchFocused(false);
    } catch (err) {
      alert(`Error adding member: ${err.message}`);
    }
  };

  const handleUpdateUserScope = (emp, newScope) => {
    try {
      hrmStore.updateUserRoleAccess(
        emp.id,
        {
          systemRole: emp.systemRole || selectedRoleTier,
          branchScope: newScope,
          permissionsOverride: emp.permissionsOverride || {}
        },
        currentUser.id,
        currentUser.name
      );
      showToast(`Branch scope for ${emp.name} set to "${newScope}".`);
    } catch (err) {
      alert(`Error updating scope: ${err.message}`);
    }
  };

  const handleRemoveMemberFromRole = (emp) => {
    if (selectedRoleTier === 'Global Admin' && emp.id === 'PE000') {
      alert('Cannot revoke primary Global Admin account.');
      return;
    }
    if (window.confirm(`Revoke ${selectedRoleTier} access for ${emp.name}? They will be reverted to standard Employee role.`)) {
      try {
        hrmStore.revokeUserAccess(emp.id, currentUser.id, currentUser.name);
        showToast(`Revoked ${selectedRoleTier} role from ${emp.name}. Reverted to Employee.`);
      } catch (err) {
        alert(`Error removing user: ${err.message}`);
      }
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
                    onClick={() => handleOpenRoleDrawer('Branch HR')}
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
                                onClick={() => handleOpenRoleDrawer(r.role)}
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
                                            handleOpenRoleDrawer(r.role);
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
                  <pre className="mt-1.5 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto max-h-48">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PRASHANTH ENTERPRISES HRMS - STRICT CONFIDENTIAL ZERO-TRUST RBAC RULES
    function isSignedIn() { return request.auth != null; }
    function getCaller() { return get(/databases/$(database)/documents/employees/$(request.auth.uid)).data; }
    function isGlobalAdmin() { return isSignedIn() && (request.auth.token.role == 'Global Admin' || request.auth.uid == 'PE000' || getCaller().systemRole == 'Global Admin'); }
    function isCentralHR() { return isSignedIn() && (isGlobalAdmin() || request.auth.token.role == 'Central HR' || request.auth.token.role == 'HR Admin' || getCaller().systemRole == 'Central HR' || getCaller().systemRole == 'HR Admin'); }
    function isBranchHR() { return isSignedIn() && (isCentralHR() || request.auth.token.role == 'Branch HR' || getCaller().systemRole == 'Branch HR'); }
    function isFinance() { return isSignedIn() && (isGlobalAdmin() || request.auth.token.role == 'Finance' || getCaller().systemRole == 'Finance'); }
    function callerBranch() { return getCaller().branch; }

    match /employees/{employeeId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && employeeId == request.auth.uid) || isSignedIn();
      allow create, delete: if isGlobalAdmin() || isCentralHR();
      allow update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch());
    }
    match /salary_structures/{employeeId} {
      allow read: if isGlobalAdmin() || isFinance() || isCentralHR() || (isBranchHR() && get(/databases/$(database)/documents/employees/$(employeeId)).data.branch == callerBranch()) || (isSignedIn() && employeeId == request.auth.uid);
      allow write: if isGlobalAdmin() || isFinance();
    }
    match /payroll_runs/{runId} {
      allow read: if isGlobalAdmin() || isFinance() || isCentralHR() || isBranchHR();
      allow write: if isGlobalAdmin() || isFinance();
    }
    match /leave_requests/{requestId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && resource.data.employeeId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch());
      allow delete: if isGlobalAdmin();
    }
    match /attendance/{attId} {
      allow read: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && resource.data.employeeId == request.auth.uid);
      allow create, update: if isGlobalAdmin() || isCentralHR() || (isBranchHR() && resource.data.branch == callerBranch()) || (isSignedIn() && request.resource.data.employeeId == request.auth.uid);
    }
    match /audit_logs/{logId} {
      allow read: if isGlobalAdmin() || isCentralHR() || isFinance() || isBranchHR();
      allow create: if isSignedIn();
      allow update, delete: if false; // Tamper-proof append-only
    }
    match /{document=**} {
      allow read, write: if isGlobalAdmin();
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

      {/* 3. Role-Focused Right-Side Slide-Over Drawer */}
      {showRoleDrawer && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 border border-brand-200 text-brand-600 shadow-2xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Manage {selectedRoleTier} Access
                    </h3>
                    <p className="text-xs text-slate-500">
                      View current holders, adjust branch scopes, or assign new members.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Tier Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {DEFAULT_ROLE_MATRIX.map(m => (
                  <button
                    key={m.role}
                    type="button"
                    onClick={() => {
                      setSelectedRoleTier(m.role);
                      setSelectedNewMember(null);
                      setAddMemberSearch('');
                      setIsAddSearchFocused(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedRoleTier === m.role
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m.role}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body - 2 Clear Sections */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* SECTION 1: Assigned Members (X) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Current Assigned Members ({assignedUsersInSelectedTier.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedRoleTier === 'Global Admin' ? 'Super Administrators' : `${selectedRoleTier} Tier`}
                  </span>
                </div>

                {assignedUsersInSelectedTier.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No members assigned to {selectedRoleTier}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the quick add form below to assign employees to this role tier.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assignedUsersInSelectedTier.map(emp => {
                      const isLockedAdmin = selectedRoleTier === 'Global Admin' && emp.id === 'PE000';
                      const currentScope = emp.branchScope || emp.branch || 'Assigned Hub';

                      return (
                        <div
                          key={emp.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-2xs"
                        >
                          {/* User info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs truncate">{emp.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({emp.employeeId})</span>
                                {isLockedAdmin && (
                                  <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {emp.role} • <span className="text-slate-600 font-medium">{emp.department}</span>
                              </p>
                            </div>
                          </div>

                          {/* Branch Scope selector & Remove button */}
                          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Scope</span>
                              <select
                                value={currentScope}
                                onChange={(e) => handleUpdateUserScope(emp, e.target.value)}
                                disabled={!permissions.isGlobalAdmin}
                                className="rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs"
                              >
                                <option value="Assigned Hub">Assigned Hub ({emp.branch || 'Local'})</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="All Hubs">All Hubs (Corporate)</option>
                              </select>
                            </div>

                            {/* One-click remove button */}
                            {permissions.isGlobalAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberFromRole(emp)}
                                disabled={isLockedAdmin}
                                className={`self-end px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 ${
                                  isLockedAdmin
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                }`}
                                title={isLockedAdmin ? 'Primary Global Admin cannot be removed' : `Remove from ${selectedRoleTier} (Revert to Employee)`}
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: Add New Member to [Tier] */}
              {permissions.isGlobalAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-brand-600" />
                      <span>Add Member to {selectedRoleTier}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Search any employee to elevate them to {selectedRoleTier} and designate their hub scope.
                    </p>
                  </div>

                  {/* Compact Search & Autocomplete Flow */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder={`Search employee name, ID or branch to add...`}
                        value={addMemberSearch}
                        onFocus={() => setIsAddSearchFocused(true)}
                        onChange={(e) => {
                          setAddMemberSearch(e.target.value);
                          setIsAddSearchFocused(true);
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-medium focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none shadow-2xs"
                      />
                      {addMemberSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddMemberSearch('');
                            setIsAddSearchFocused(false);
                          }}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {isAddSearchFocused && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in divide-y divide-slate-50">
                        {candidateEmployeesToAdd.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No matching available employees found.
                          </div>
                        ) : (
                          candidateEmployeesToAdd.map(emp => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => {
                                setSelectedNewMember(emp);
                                setAddMemberSearch(`${emp.name} (${emp.employeeId})`);
                                setIsAddSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-brand-50/60 flex items-center justify-between gap-2 transition"
                            >
                              <div className="flex items-center gap-2">
                                <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">{emp.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId} • {emp.branch} • {emp.department}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Current: {emp.systemRole || 'Employee'}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Candidate Config Card */}
                  {selectedNewMember && (
                    <div className="rounded-xl border border-brand-200 bg-white p-3.5 space-y-3 shadow-2xs animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={selectedNewMember.avatar}
                            alt={selectedNewMember.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{selectedNewMember.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {selectedNewMember.employeeId} • Home: {selectedNewMember.branch}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNewMember(null);
                            setAddMemberSearch('');
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Branch Scope selector for the new member */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Assigned Branch Scope:
                          </label>
                          <select
                            value={newMemberScope}
                            onChange={(e) => setNewMemberScope(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-1.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="Assigned Hub">Assigned Hub ({selectedNewMember.branch})</option>
                            <option value="Hyderabad">Hyderabad (PE-HYD)</option>
                            <option value="Chennai">Chennai (PE-CHE)</option>
                            <option value="Mumbai">Mumbai (PE-MUM)</option>
                            <option value="All Hubs">All Hubs (Corporate Multi-Branch)</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddMemberToRole}
                            className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition inline-flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign to {selectedRoleTier}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live sync & audit logging enabled.</span>
              </span>
              <button
                type="button"
                onClick={() => setShowRoleDrawer(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-2xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Saving Matrix Changes */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Confirm Role Matrix Updates</h4>
                <p className="text-xs text-slate-500">Enforce enterprise access tier rules</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              You are about to save changes to the 6-tier Enterprise Role-Based Access Matrix. These updated permissions will take effect immediately for all active employee sessions and synchronize to Firestore.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMatrix}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Confirm & Enforce Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HrSettings;

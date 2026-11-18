import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function HrSettings() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'roles' | 'system'
  const [auditSearch, setAuditSearch] = useState('');
  const [configForm, setConfigForm] = useState({ ...storeData.systemConfig });
  const [toastMessage, setToastMessage] = useState(null);

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Enterprise Role-Based Access Matrix (6 Distinct Tiers)</h2>
          <p className="text-xs text-slate-500">
            Permissions are dynamically validated on the backend and enforce branch scope partitioning.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-3">Role Tier</th>
                  <th className="py-3 px-3 text-center">View Employees</th>
                  <th className="py-3 px-3 text-center">Manage Employees</th>
                  <th className="py-3 px-3 text-center">Attendance Logs</th>
                  <th className="py-3 px-3 text-center">Approve Leaves</th>
                  <th className="py-3 px-3 text-center">Payroll Access</th>
                  <th className="py-3 px-3 text-center">Recruitment</th>
                  <th className="py-3 px-3 text-center">Audit Logs</th>
                  <th className="py-3 px-3 text-center">Branch Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { role: 'Employee', ve: 'Self', me: '❌', att: 'Self', al: '❌', pay: 'Self Slips', rec: 'View Jobs', aud: '❌', scope: 'Self' },
                  { role: 'Manager', ve: 'Team', me: '❌', att: 'Team', al: 'Direct Reports', pay: '❌', rec: 'Interviews', aud: '❌', scope: 'Department' },
                  { role: 'Branch HR', ve: 'Branch', me: 'Branch', att: 'Branch', al: 'Branch', pay: '❌', rec: 'Branch', aud: 'Branch', scope: 'Assigned Hub' },
                  { role: 'Central HR', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Verify', rec: 'Full', aud: 'Full', scope: 'All Hubs' },
                  { role: 'Finance', ve: 'Read', me: '❌', att: 'Read', al: '❌', pay: 'Full Process', rec: '❌', aud: 'Financial', scope: 'All Hubs' },
                  { role: 'Global Admin', ve: 'Full', me: 'Full', att: 'Full', al: 'Full', pay: 'Full Audit', rec: 'Full', aud: 'Full', scope: 'Company-Wide' },
                ].map(r => (
                  <tr key={r.role} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-900">{r.role}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.ve}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.me}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.att}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.al}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.pay}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.rec}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{r.aud}</td>
                    <td className="py-3 px-3 text-center font-bold text-brand-600">{r.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}

export default HrSettings;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  UserCheck,
  Inbox,
  Users,
  Building2,
  Megaphone,
  LifeBuoy,
  Wallet,
  ShieldCheck,
  Cpu,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  Sliders,
  Activity,
  Layers,
  MapPin,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ collapsed, setCollapsed }) {
  const { currentPortal, storeData, permissions } = useAuth();

  // Pending counts
  const pendingLeaves = storeData.leaveRequests.filter(r => r.status === 'Pending').length;
  const pendingCorrections = storeData.attendanceCorrections.filter(c => c.status === 'Pending').length;
  const pendingOnboarding = (storeData.onboardingCases || []).filter(c => c.status === 'Documents Submitted' || c.status === 'Pending HR Verification').length;
  const totalPending = pendingLeaves + pendingCorrections;

  // 1. Employee Navigation Items (ESS)
  const employeeNavItems = [
    { name: 'Home', path: '/home', icon: Home, description: 'Overview & Celebrations' },
    { name: 'Me', path: '/me', icon: UserCheck, description: 'Profile, Attendance & Leave' },
    { name: 'Inbox', path: '/inbox', icon: Inbox, badge: totalPending, badgeColor: 'bg-rose-500 text-white', description: 'Pending Tasks' },
    { name: 'My Team', path: '/team', icon: Users, description: 'Manager Tracking', visible: permissions.isGlobalAdmin || permissions.isManager || permissions.canView('employees') },
    { name: 'Org', path: '/org', icon: Building2, description: 'Directory & Policies' },
    { name: 'Engage', path: '/engage', icon: Megaphone, description: 'Announcements & Polls' },
    { name: 'Helpdesk', path: '/helpdesk', icon: LifeBuoy, description: 'Ticketing & Support' },
    { name: 'Finance', path: '/finance', icon: Wallet, description: 'Summary, Payslips & Taxes', visible: permissions.isGlobalAdmin || (permissions.roleRow?.pay !== 'None' && permissions.roleRow?.pay !== '❌') }
  ];

  // 2. HR Admin Navigation Items (Dynamically filtered by Role-Based Access Matrix)
  const hrNavItems = [
    { name: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard, description: 'Command Center', visible: true },
    { name: 'Employees', path: '/hr/employees', icon: Users, description: 'Directory & Lifecycle', visible: permissions.canView('employees') },
    { name: 'Attendance', path: '/hr/attendance', icon: Clock, description: 'Live Biometric Console', visible: permissions.canView('attendance') },
    { name: 'Leave Mgmt', path: '/hr/leaves', icon: Calendar, badge: pendingLeaves, badgeColor: 'bg-amber-500 text-white', description: 'Approvals & Ledger', visible: permissions.canView('leaves') },
    { name: 'Payroll', path: '/hr/payroll', icon: DollarSign, description: 'Runs & CTC Master', visible: permissions.canView('payroll') && permissions.hasPayrollAccess() },
    { name: 'Recruitment', path: '/hr/recruitment', icon: Briefcase, description: 'Pipeline & Openings', visible: permissions.canView('recruitment') },
    { name: 'Onboarding', path: '/hr/onboarding-tracker', icon: UserCheck, badge: pendingOnboarding, badgeColor: 'bg-emerald-500 text-white', description: 'Letters & Document Verification', visible: permissions.canView('recruitment') },
    { name: 'Depts & Hubs', path: '/hr/departments', icon: Building2, description: 'Regional Branches', visible: permissions.isGlobalAdmin || permissions.isHR },
    { name: 'Celebrations', path: '/hr/celebrations', icon: Sparkles, description: 'Automated 01:00 AM Engine', visible: permissions.isGlobalAdmin || permissions.isHR },
    { name: 'Approvals', path: '/hr/approvals', icon: CheckSquare, badge: totalPending, badgeColor: 'bg-rose-500 text-white', description: 'Queue', visible: permissions.canApproveLeaves() },
    { name: 'Reports', path: '/hr/reports', icon: FileText, description: 'Audit & CSV Export', visible: permissions.canView('audit') || permissions.canViewAuditLogs },
    { name: 'Settings', path: '/hr/settings', icon: Sliders, description: 'RBAC & Audit Trail', visible: permissions.isGlobalAdmin || permissions.isHR }
  ];

  // 3. Global Admin Navigation Items (Always unrestricted)
  const adminNavItems = [
    { name: 'Control Center', path: '/admin/dashboard', icon: LayoutDashboard, description: 'Executive HUD', visible: true },
    { name: 'Personnel Census', path: '/hr/employees', icon: Users, description: 'All Branches', visible: true },
    { name: 'Attendance Logs', path: '/hr/attendance', icon: Clock, description: 'Multi-Hub Biometric', visible: true },
    { name: 'Leave Governance', path: '/hr/leaves', icon: Calendar, badge: pendingLeaves, badgeColor: 'bg-amber-500 text-white', description: 'Approvals', visible: true },
    { name: 'Payroll Audit', path: '/hr/payroll', icon: DollarSign, description: 'Financial Overview', visible: true },
    { name: 'Recruitment Pipeline', path: '/hr/recruitment', icon: Briefcase, description: 'Hiring Operations', visible: true },
    { name: 'Onboarding Hub', path: '/hr/onboarding-tracker', icon: UserCheck, badge: pendingOnboarding, badgeColor: 'bg-emerald-500 text-white', description: 'Letters & Verification', visible: true },
    { name: 'Hub Infrastructure', path: '/hr/departments', icon: MapPin, description: 'HYD / CHE / MUM', visible: true },
    { name: 'Celebration Automation', path: '/hr/celebrations', icon: Sparkles, description: '01:00 AM Scheduler', visible: true },
    { name: 'Executive Reports', path: '/hr/reports', icon: FileText, description: '8 Regulatory Reports', visible: true },
    { name: 'System Governance', path: '/hr/settings', icon: ShieldCheck, description: 'Compliance & Audit', visible: true }
  ];

  const rawNavItems = 
    currentPortal === 'HR' ? hrNavItems : 
    currentPortal === 'GLOBAL_ADMIN' ? adminNavItems : 
    employeeNavItems;

  const currentNavItems = rawNavItems.filter(item => item.visible !== false);

  const portalBadge = 
    currentPortal === 'HR' ? { text: 'HR ADMIN', color: 'bg-brand-500/20 text-brand-300' } :
    currentPortal === 'GLOBAL_ADMIN' ? { text: 'GLOBAL ADMIN', color: 'bg-purple-500/20 text-purple-300' } :
    { text: 'EMPLOYEE PORTAL', color: 'bg-emerald-500/20 text-emerald-300' };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-900 text-white transition-all duration-200 ease-in-out shrink-0 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex h-16 items-center border-b border-slate-800 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-brand-600 font-extrabold text-white text-base shadow-lg shadow-brand-500/20">
            PE
          </div>
          {!collapsed && (
            <div className="truncate">
              <h2 className="text-xs font-bold text-white tracking-wide truncate">
                PRASHANTH
              </h2>
              <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider ${portalBadge.color}`}>
                {portalBadge.text}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition ${collapsed ? 'hidden' : ''}`}
          title="Collapse sidebar"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-2.5 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path + item.name}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Intranet Terminal Tag */}
      <div className="border-t border-slate-800 p-3">
        <div className={`flex items-center gap-2 rounded-xl bg-slate-800/60 p-2 text-[11px] text-slate-400 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
          {!collapsed && (
            <div className="truncate">
              <p className="font-semibold text-slate-300 truncate">192.168.1.240</p>
              <p className="text-[10px] text-slate-500">Biometric Online</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

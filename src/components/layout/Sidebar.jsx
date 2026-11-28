import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  Sliders,
  Activity,
  MapPin,
  CheckSquare,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { storeData, permissions, currentUser } = useAuth();
  const location = useLocation();

  // Pending counts
  const pendingLeaves = (storeData?.leaveRequests || []).filter(r => r.status === 'Pending').length;
  const pendingCorrections = (storeData?.attendanceCorrections || []).filter(c => c.status === 'Pending').length;
  const pendingOnboarding = (storeData?.onboardingCases || []).filter(c => c.status === 'Documents Submitted' || c.status === 'Pending HR Verification').length;
  const totalPending = pendingLeaves + pendingCorrections;

  // Active Role Tier
  const roleTier = currentUser?.id === 'PE000' 
    ? 'Global Admin' 
    : (currentUser?.roleTier || currentUser?.systemRole || 'Employee');

  // Detect current portal by route location (Strict Portal Separation)
  const isGlobalAdminRoute = location.pathname.startsWith('/admin');
  const isHrRoute = location.pathname.startsWith('/hr');
  const isEmployeeRoute = !isGlobalAdminRoute && !isHrRoute;

  // =========================================================================
  // 1. DYNAMIC NAVIGATION ITEMS (Strictly Portal Separated - Zero Duplication)
  // =========================================================================
  let navItems = [];
  let sectionTitle = '';

  if (isGlobalAdminRoute) {
    // -----------------------------------------------------------------------
    // A. GLOBAL ADMIN PORTAL (/admin/*): Clean executive list
    // -----------------------------------------------------------------------
    sectionTitle = 'Global Admin Governance';
    navItems = [
      { name: 'Global Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, description: 'Executive HUD' },
      { name: 'Employees', path: '/hr/employees', icon: Users, description: 'All Branches' },
      { name: 'Attendance', path: '/hr/attendance', icon: Clock, description: 'Multi-Hub Biometric' },
      { name: 'Leaves', path: '/hr/leaves', icon: Calendar, badge: pendingLeaves, badgeColor: 'bg-amber-500 text-white', description: 'Approvals & Ledger' },
      { name: 'Payroll', path: '/hr/payroll', icon: DollarSign, description: 'Financial Overview' },
      { name: 'Onboarding / Recruitment', path: '/hr/onboarding-tracker', icon: UserCheck, badge: pendingOnboarding, badgeColor: 'bg-emerald-500 text-white', description: 'Letters & Verification' },
      { name: 'Audit Logs', path: '/hr/reports', icon: FileText, description: 'Executive Audit Logs' },
      { name: 'Role Matrix & Settings', path: '/hr/settings', icon: Sliders, description: 'System Governance & RBAC' }
    ];
  } else if (isHrRoute) {
    // -----------------------------------------------------------------------
    // B. HR ADMIN PORTAL (/hr/*): Strictly HR/Finance/Manager icons by role
    // -----------------------------------------------------------------------
    if (roleTier === 'Finance') {
      sectionTitle = 'Finance & Payroll Hub';
      navItems = [
        { name: 'Payroll & Compensation', path: '/hr/payroll', icon: DollarSign, description: 'Disbursement & Compensation' },
        { name: 'Financial Audit Logs', path: '/hr/reports', icon: FileText, description: 'Financial Reports & Logs' }
      ];
    } else if (roleTier === 'Manager') {
      sectionTitle = 'Manager Controls';
      navItems = [
        { name: 'Team Attendance', path: '/hr/attendance', icon: Clock, description: 'Live Biometric Console' },
        { name: 'Leave Approvals', path: '/hr/leaves', icon: CheckSquare, badge: pendingLeaves, badgeColor: 'bg-amber-500 text-white', description: 'Direct Reports Approvals' }
      ];
    } else {
      // Branch HR, Central HR, HR Admin, or Global Admin viewing HR Portal
      sectionTitle = roleTier === 'Branch HR' ? `Branch HR (${currentUser?.branch || 'Hub'})` : 'HR Administration';
      navItems = [
        { name: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutDashboard, description: 'Command Center', visible: true },
        { name: 'Employees', path: '/hr/employees', icon: Users, description: 'Directory & Lifecycle', visible: permissions?.canView('employees') },
        { name: 'Attendance', path: '/hr/attendance', icon: Clock, description: 'Live Biometric Console', visible: permissions?.canView('attendance') },
        { name: 'Leaves', path: '/hr/leaves', icon: Calendar, badge: pendingLeaves, badgeColor: 'bg-amber-500 text-white', description: 'Approvals & Ledger', visible: permissions?.canView('leaves') },
        { name: 'Recruitment / Onboarding', path: '/hr/onboarding-tracker', icon: UserCheck, badge: pendingOnboarding, badgeColor: 'bg-emerald-500 text-white', description: 'Letters & Verification', visible: permissions?.canView('recruitment') },
        { name: 'Payroll', path: '/hr/payroll', icon: DollarSign, description: 'Runs & CTC Master', visible: permissions?.canView('payroll') && permissions?.hasPayrollAccess() },
        { name: 'Audit Logs', path: '/hr/reports', icon: FileText, description: 'Audit & CSV Export', visible: permissions?.canView('audit') },
        { name: 'Settings', path: '/hr/settings', icon: Sliders, description: 'Role Matrix & Config', visible: permissions?.isGlobalAdmin || roleTier === 'Central HR' || roleTier === 'HR Admin' }
      ].filter(item => item.visible !== false);
    }
  } else {
    // -----------------------------------------------------------------------
    // C. EMPLOYEE SELF-SERVICE PORTAL (/home, /me, /inbox, /my-finances, /org):
    // Show ONLY standard Employee icons. No HR/Admin icons here!
    // -----------------------------------------------------------------------
    sectionTitle = 'Employee Self-Service';
    navItems = [
      { name: 'Home', path: '/home', icon: Home, description: 'Overview & Celebrations' },
      { name: 'Me', path: '/me', icon: UserCheck, description: 'Profile, Attendance & Leave' },
      { name: 'Inbox', path: '/inbox', icon: Inbox, badge: totalPending, badgeColor: 'bg-rose-500 text-white', description: 'Pending Tasks' },
      { name: 'My Finances', path: '/finance', icon: Wallet, description: 'Summary, Payslips & Taxes' },
      { name: 'Org', path: '/org', icon: Building2, description: 'Directory & Policies' }
    ];
  }

  const portalBadge = isGlobalAdminRoute
    ? { text: 'GLOBAL ADMIN', color: 'bg-purple-500/20 text-purple-300' }
    : isHrRoute
      ? (roleTier === 'Finance'
          ? { text: 'FINANCE', color: 'bg-amber-500/20 text-amber-300' }
          : roleTier === 'Branch HR'
            ? { text: 'BRANCH HR', color: 'bg-cyan-500/20 text-cyan-300' }
            : { text: 'HR ADMIN', color: 'bg-emerald-500/20 text-emerald-300' })
      : { text: 'EMPLOYEE', color: 'bg-emerald-500/20 text-emerald-300' };

  // Desktop NavLink Renderer
  const renderDesktopNavItem = (item) => {
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
              <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  // Mobile NavLink Renderer
  const renderMobileNavItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path + item.name}
        to={item.path}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
            isActive
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <div className="flex-1 flex items-center justify-between truncate">
          <span className="truncate">{item.name}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
              {item.badge}
            </span>
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          {/* Mobile Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-extrabold text-white text-base shadow-lg shadow-brand-500/20">
                  PE
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">PRASHANTH</h2>
                  <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider ${portalBadge.color}`}>
                    {portalBadge.text}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sectionTitle}
              </div>
              {navItems.map(renderMobileNavItem)}
            </nav>

            <div className="border-t border-slate-800 p-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/60 p-2.5 text-[11px] text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
                <div>
                  <p className="font-semibold text-slate-300">192.168.1.240</p>
                  <p className="text-[10px] text-slate-500">Biometric Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
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

        {/* Clean, Non-Duplicated Navigation List */}
        <nav className="flex-1 space-y-1 p-2.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {sectionTitle}
            </div>
          )}
          {navItems.map(renderDesktopNavItem)}
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
    </>
  );
}

export default Sidebar;
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
              <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  // Mobile NavLink Renderer
  const renderMobileNavItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path + item.name}
        to={item.path}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
            isActive
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <div className="flex-1 flex items-center justify-between truncate">
          <span className="truncate">{item.name}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor || 'bg-rose-500 text-white'}`}>
              {item.badge}
            </span>
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          {/* Mobile Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-extrabold text-white text-base shadow-lg shadow-brand-500/20">
                  PE
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">PRASHANTH</h2>
                  <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider ${portalBadge.color}`}>
                    {portalBadge.text}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
              {/* 1. Common Employee Items */}
              {commonEmployeeNavItems.map(renderMobileNavItem)}

              {/* 2. Role-Specific Extra Icons */}
              {extraNavItems.length > 0 && (
                <>
                  <div className="border-t border-slate-700/50 my-2.5"></div>
                  <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {sectionHeader}
                  </div>
                  {extraNavItems.map(renderMobileNavItem)}
                </>
              )}
            </nav>

            <div className="border-t border-slate-800 p-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/60 p-2.5 text-[11px] text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
                <div>
                  <p className="font-semibold text-slate-300">192.168.1.240</p>
                  <p className="text-[10px] text-slate-500">Biometric Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
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

        {/* Unified Additive Navigation List */}
        <nav className="flex-1 space-y-1 p-2.5 overflow-y-auto">
          {/* 1. Common Employee Self-Service Icons (Always at top for all 6 tiers) */}
          {commonEmployeeNavItems.map(renderDesktopNavItem)}

          {/* 2. Role-Specific Extra Icons (Appended below subtle divider) */}
          {extraNavItems.length > 0 && (
            <>
              <div className="border-t border-slate-700/50 my-2"></div>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sectionHeader}
                </div>
              )}
              {extraNavItems.map(renderDesktopNavItem)}
            </>
          )}
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
    </>
  );
}

export default Sidebar;

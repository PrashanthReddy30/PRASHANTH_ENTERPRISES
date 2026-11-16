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
  ChevronRight
} from 'lucide-react';

export const navigationItems = [
  {
    name: 'Home',
    path: '/home',
    icon: Home,
    description: 'Overview, Open place & Joinees'
  },
  {
    name: 'Me',
    path: '/me',
    icon: UserCheck,
    description: 'Attendance, Leaves & Claims'
  },
  {
    name: 'Inbox',
    path: '/inbox',
    icon: Inbox,
    badge: 4,
    badgeColor: 'bg-rose-500 text-white',
    description: 'Pending Tasks & Approvals'
  },
  {
    name: 'My Team',
    path: '/team',
    icon: Users,
    description: 'Manager view & Tracking'
  },
  {
    name: 'Org',
    path: '/org',
    icon: Building2,
    description: 'Directory, Policies & Hiring'
  },
  {
    name: 'Engage',
    path: '/engage',
    icon: Megaphone,
    description: 'Announcements & Polls'
  },
  {
    name: 'Helpdesk',
    path: '/helpdesk',
    icon: LifeBuoy,
    description: 'Ticketing & Support'
  },
  {
    name: 'My Finances',
    path: '/finances',
    icon: Wallet,
    description: 'Salary, Payslips & Taxes'
  }
];

export function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 bg-slate-900 text-white transition-all duration-200 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-brand-600 font-extrabold text-white text-base shadow-lg shadow-brand-500/20">
            PE
          </div>
          {!collapsed && (
            <div className="truncate">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">
                PRASHANTH
              </h2>
              <p className="text-[10px] uppercase font-semibold text-brand-400 tracking-wider">
                Enterprises HRM
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <div className={`px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Core Modules'}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${collapsed ? 'justify-center' : 'justify-between'}`
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {/* Badges / indicators */}
                  {!collapsed && item.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor || 'bg-brand-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Local Intranet & Biometric Status Footer */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-800/90 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Matrix Push Agent</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Local Intranet Server Active.
            Real-time biometric punch sync active.
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>PORT 5173 / HTTP</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center">
          <div className="mx-auto h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Matrix Biometric Online" />
        </div>
      )}
    </aside>
  );
}

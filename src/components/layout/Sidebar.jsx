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
              <p className="text-[9px] uppercase font-semibold text-brand-400 tracking-wider">
                Enterprises HRM
              </p>
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

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-2 py-3 overflow-y-auto">
        <div className="px-1 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center">
          {collapsed ? 'Modules' : 'Core Modules'}
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                collapsed
                  ? `group relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  : `group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
              }
              title={item.name}
            >
              {({ isActive }) => (
                collapsed ? (
                  <>
                    <div className="relative flex items-center justify-center">
                      <Icon className={`h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`mt-1 text-[10px] font-medium leading-tight text-center tracking-tight truncate max-w-full px-0.5 ${
                      isActive ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor || 'bg-brand-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Local Intranet & Biometric Status Footer */}
      {!collapsed ? (
        <div className="p-3 m-2 rounded-xl bg-slate-800/90 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Matrix Push Agent</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 leading-tight">
            Local Intranet Server Active.
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>PORT 5173</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      ) : (
        <div className="p-2 pb-3 text-center flex flex-col items-center gap-1.5">
          <div className="relative flex items-center justify-center" title="Matrix Biometric Online">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[9px] font-medium text-slate-400">Matrix</span>

          {/* Expand Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Expand sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}

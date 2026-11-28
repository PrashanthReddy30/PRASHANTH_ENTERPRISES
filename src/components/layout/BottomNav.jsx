import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  UserCheck,
  Inbox,
  Wallet,
  Menu,
  X,
  Users,
  Building2,
  Megaphone,
  LifeBuoy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function BottomNav() {
  const { permissions } = useAuth();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const rawMainMobileTabs = [
    { name: 'Home', path: '/home', icon: Home, visible: true },
    { name: 'Me', path: '/me', icon: UserCheck, visible: true },
    { name: 'Inbox', path: '/inbox', icon: Inbox, badge: 4, visible: true },
    { name: 'Finance', path: '/finance', icon: Wallet, visible: permissions.isGlobalAdmin || (permissions.roleRow?.pay !== 'None' && permissions.roleRow?.pay !== '❌') },
  ];

  const mainMobileTabs = rawMainMobileTabs.filter(t => t.visible !== false);

  const rawMoreModules = [
    { name: 'My Team', path: '/team', icon: Users, desc: 'Team attendance, approvals & tracking', visible: permissions.isGlobalAdmin || permissions.isManager || permissions.canView('employees') },
    { name: 'Org & Policies', path: '/org', icon: Building2, desc: 'Directory, Org tree, IT policy-2025, Hiring', visible: true },
    { name: 'Engage', path: '/engage', icon: Megaphone, desc: 'Company announcements, polls & articles', visible: true },
    { name: 'Helpdesk', path: '/helpdesk', icon: LifeBuoy, desc: 'My tickets, SLA tracker & support requests', visible: true },
  ];

  const moreModules = rawMoreModules.filter(m => m.visible !== false);

  return (
    <>
      {/* Drawer Overlay for Mobile More Menu */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          <div 
            className="flex-1" 
            onClick={() => setShowMoreDrawer(false)} 
          />
          <div className="rounded-t-2xl bg-white p-4 pb-8 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">All Modules</h3>
                <p className="text-xs text-slate-500">Prashanth Enterprises HRM</p>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {moreModules.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMoreDrawer(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl p-3 transition ${
                        isActive
                          ? 'bg-brand-50 border border-brand-200 text-brand-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200 text-brand-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold">{item.name}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl bg-slate-100 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Matrix Biometric Push Service Connected
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Intranet Server: 192.168.1.240</p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur md:hidden pb-safe">
        <div className="flex items-center justify-around">
          {mainMobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition ${
                    isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1">{tab.name}</span>
              </NavLink>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition ${
              showMoreDrawer ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span className="mt-1">More</span>
          </button>
        </div>
      </div>
    </>
  );
}

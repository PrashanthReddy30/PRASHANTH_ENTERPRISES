// Prashanth Enterprises HRMS
// Keka-style Employee Profile Side Drawer
// Clean, minimal side panel with basic info, 6-tier persona switcher, and navigation menu.

import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Settings,
  MessageSquare,
  CreditCard,
  Info,
  LogOut,
  ChevronRight,
  Building2,
  BadgeCheck,
  MapPin,
  Mail,
  Key,
  Users,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PERSONA_TIERS = [
  {
    tier: 'Employee',
    portal: 'EMPLOYEE',
    route: '/home',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    defaultId: 'PE001',
    description: 'Self-Service (/home)'
  },
  {
    tier: 'Manager',
    portal: 'EMPLOYEE',
    route: '/home',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    defaultId: 'PE003',
    description: 'Team & Approvals View'
  },
  {
    tier: 'Branch HR',
    portal: 'HR',
    route: '/hr/dashboard',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    defaultId: 'PE006',
    description: 'Branch-Restricted HR Portal'
  },
  {
    tier: 'Central HR',
    portal: 'HR',
    route: '/hr/dashboard',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultId: 'PE016',
    description: 'Corporate HR Portal'
  },
  {
    tier: 'Finance',
    portal: 'HR',
    route: '/hr/payroll',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    defaultId: 'PE010',
    description: 'Payroll & Finance Hub'
  },
  {
    tier: 'Global Admin',
    portal: 'GLOBAL_ADMIN',
    route: '/admin/dashboard',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    defaultId: 'PE000',
    description: 'Full Global Admin Access'
  }
];

export function ProfileDrawer({ isOpen, onClose }) {
  const { currentUser, switchUser, sendPasswordReset, storeData } = useAuth();
  const drawerRef = useRef(null);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Dynamically resolve representative employee persona for each of the 6 tiers
  const personas = useMemo(() => {
    const list = storeData?.employees || [];
    return PERSONA_TIERS.map(config => {
      let emp;
      if (config.tier === 'Global Admin') {
        emp = list.find(e => e.id === 'PE000') || list.find(e => e.systemRole === 'Global Admin');
      } else if (config.tier === 'Central HR') {
        emp = list.find(e => e.id === 'PE016' || e.email === 'chinnareddy123a@gmail.com') ||
              list.find(e => (e.systemRole === 'Central HR' || e.systemRole === 'HR Admin') && e.id !== 'PE000');
      } else if (config.tier === 'Branch HR') {
        emp = list.find(e => e.id === config.defaultId) || list.find(e => e.systemRole === 'Branch HR');
      } else if (config.tier === 'Finance') {
        emp = list.find(e => e.id === config.defaultId) || list.find(e => e.systemRole === 'Finance');
      } else if (config.tier === 'Manager') {
        emp = list.find(e => e.id === config.defaultId) || list.find(e => e.systemRole === 'Manager');
      } else {
        emp = list.find(e => e.id === config.defaultId) || list.find(e => e.systemRole === 'Employee');
      }

      if (!emp) {
        emp = list.find(e => e.id === config.defaultId) || list[0];
      }

      return {
        ...config,
        emp
      };
    });
  }, [storeData?.employees]);

  if (!isOpen) return null;

  // Active persona's true role resolution
  const currentUserRole = currentUser.id === 'PE000'
    ? 'Global Admin'
    : (currentUser.systemRole || (currentUser.id === 'PE016' ? 'Central HR' : 'Employee'));

  const getRoleBadgeStyle = (roleName) => {
    switch (roleName) {
      case 'Global Admin':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'Central HR':
      case 'HR Admin':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Branch HR':
        return 'bg-cyan-50 border-cyan-200 text-cyan-700';
      case 'Finance':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Manager':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Employee':
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  const ActiveRoleIcon = currentUserRole === 'Global Admin'
    ? ShieldCheck
    : (currentUserRole === 'Central HR' || currentUserRole === 'Branch HR' || currentUserRole === 'HR Admin'
        ? UserCheck
        : (currentUserRole === 'Finance'
            ? CreditCard
            : (currentUserRole === 'Manager' ? Users : BadgeCheck)));

  const handlePersonaClick = (persona) => {
    const { targetRoute } = switchUser(persona.emp.id, {
      portal: persona.portal,
      route: persona.route
    });
    onClose();
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      description: 'Basic employee information',
      href: '/me',
      color: 'text-brand-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Preferences & notifications',
      href: null,
      action: () => alert('Settings coming soon.'),
      color: 'text-slate-500'
    },
    {
      icon: MessageSquare,
      label: 'Send Feedback',
      description: 'Help us improve',
      href: null,
      action: () => alert('Thank you! Feedback feature coming soon.'),
      color: 'text-emerald-600'
    },
    {
      icon: CreditCard,
      label: 'View ID Card',
      description: 'Digital employee ID card',
      href: null,
      action: () => alert(`Employee ID Card\n\n${currentUser.name}\n${currentUser.id} · ${currentUser.role}\n${currentUser.branch} Branch\nPrashanth Enterprises`),
      color: 'text-violet-600'
    },
    {
      icon: Key,
      label: 'Password & Security',
      description: 'Firebase password reset & verification',
      href: null,
      action: async () => {
        const res = await sendPasswordReset(currentUser.email);
        alert(res.message);
      },
      color: 'text-amber-600'
    },
    {
      icon: Info,
      label: 'About',
      description: 'Version 2.0 · Prashanth Enterprises HRMS',
      href: null,
      action: () => alert('Prashanth Enterprises HRMS\nVersion 2.0.0\nBuilt on Firebase · React 19 · Vite'),
      color: 'text-slate-400'
    }
  ];

  const handleMenuClick = (item) => {
    onClose();
    if (item.href) {
      navigate(item.href);
    } else if (item.action) {
      setTimeout(item.action, 150);
    }
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => {
      if (window.confirm('Are you sure you want to log out of Prashanth Enterprises HRMS?')) {
        alert('Logged out successfully.\n\nIn production, this will clear your Firebase Auth session.');
      }
    }, 150);
  };

  // Initials fallback for avatar
  const initials = (currentUser.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Employee Profile Menu"
        className="fixed right-0 top-0 z-50 h-full w-84 max-w-full bg-white shadow-2xl flex flex-col"
        style={{
          animation: 'slideInFromRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ── Header strip ───────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              My Account
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Session Active" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close profile menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable Body: Identity, Persona Switcher & Menus ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* ── Employee identity card ──────────────── */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3.5">
              {/* Profile photo */}
              <div className="relative shrink-0">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center ring-2 ring-slate-100 shadow-xs">
                    <span className="text-lg font-bold text-brand-700">{initials}</span>
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {/* Name + company */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                  Prashanth Enterprises
                </p>
              </div>
            </div>

            {/* Basic identity chips */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span className="font-mono font-medium">{currentUser.id}</span>
                <span className="text-slate-300">·</span>
                <span className="truncate text-slate-500">{currentUser.role}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {currentUser.department || currentUser.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{currentUser.branch} Branch</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Dynamic System Role Badge (Requirement 3: Role Badge Sync Fixed) */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getRoleBadgeStyle(currentUserRole)} shadow-2xs`}>
                <ActiveRoleIcon className="h-3 w-3" />
                <span>{currentUserRole}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                • {currentUser.branch} Hub
              </span>
            </div>

            {/* ── Quick Persona Switcher (All 6 Role Tiers) ────────────────── */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span>Switch Active Persona (6 Tiers)</span>
                </p>
                <span className="text-[9px] text-slate-400 font-medium">Auto Portal Sync</span>
              </div>

              {/* Scrollable Container (Requirement 4: max-h-64 scrollable container) */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 select-none">
                {personas.map((p) => {
                  const isActive = currentUser.id === p.emp.id;
                  return (
                    <button
                      key={p.tier}
                      type="button"
                      onClick={() => handlePersonaClick(p)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition text-xs group ${
                        isActive
                          ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-bold shadow-2xs ring-1 ring-brand-400/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={p.emp.avatar}
                          alt={p.emp.name}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 truncate text-xs leading-none">
                              {p.emp.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none ${p.badgeClass}`}>
                              {p.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-normal truncate mt-0.5">
                            <span className="truncate">{p.emp.email}</span>
                            <span className="text-slate-300">•</span>
                            <span className="shrink-0 font-medium text-slate-600">{p.emp.branch}</span>
                          </div>
                        </div>
                      </div>

                      {/* Active status pill */}
                      <div className="shrink-0 ml-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                            Active
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Menu items ──────────────────────────── */}
          <nav className="py-1.5">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition group"
                  >
                    <span className={`shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition ${item.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900 leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  {(idx === 0 || idx === 2) && (
                    <div className="mx-5 border-t border-slate-100" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* ── Logout footer (pinned at bottom) ───── */}
        <div className="border-t border-slate-100 p-3.5 flex-shrink-0 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition group"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

export default ProfileDrawer;

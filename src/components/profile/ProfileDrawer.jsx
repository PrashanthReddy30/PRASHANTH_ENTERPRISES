// Prashanth Enterprises HRMS
// Keka-style Employee Profile Side Drawer
// Clean, minimal side panel with basic info and navigation menu only.
// NO salary, PF, ESI, attendance, leave history or financial records displayed here.

import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProfileDrawer({ isOpen, onClose }) {
  const { currentUser, switchUser, sendPasswordReset } = useAuth();
  const drawerRef = useRef(null);
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when drawer open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      // Small delay so drawer closes cleanly before alert
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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Employee Profile Menu"
        className="fixed right-0 top-0 z-50 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col"
        style={{
          animation: 'slideInFromRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ── Header strip ───────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            My Account
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close profile menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Employee identity card ──────────────── */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Profile photo */}
            <div className="relative shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center ring-2 ring-slate-100">
                  <span className="text-xl font-bold text-brand-700">{initials}</span>
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {/* Name + company */}
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                Prashanth Enterprises
              </p>
            </div>
          </div>

          {/* Basic identity chips */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BadgeCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span className="font-mono font-medium">{currentUser.id}</span>
              <span className="text-slate-300">·</span>
              <span className="truncate text-slate-500">{currentUser.role}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {currentUser.department || currentUser.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{currentUser.branch} Branch</span>
            </div>
          </div>

          {/* System role badge */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
              {currentUser.systemRole}
            </span>
          </div>
        </div>

        {/* ── Menu items ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.label}>
                <button
                  onClick={() => handleMenuClick(item)}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-slate-50 transition group"
                >
                  <span className={`shrink-0 p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                {/* Thin divider after My Profile and after Send Feedback */}
                {(idx === 0 || idx === 2) && (
                  <div className="mx-5 border-t border-slate-100" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* ── Logout footer ───────────────────────── */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition group"
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

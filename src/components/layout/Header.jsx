import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Clock, 
  Wifi, 
  CheckCircle2, 
  HelpCircle,
  Menu,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { currentUser, matrixBiometricStatus } from '../../data/mockData';
import { Link } from 'react-router-dom';

export function Header({ toggleMobileSidebar, pendingCount = 4 }) {
  const [clockedIn, setClockedIn] = useState(true);
  const [clockTime, setClockTime] = useState("09:12 AM");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handlePunchToggle = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (clockedIn) {
      setClockedIn(false);
      alert(`Clocked OUT at ${formatted}. Pushed event to Matrix Biometric Reader.`);
    } else {
      setClockedIn(true);
      setClockTime(formatted);
      alert(`Clocked IN at ${formatted}. Biometric event synced via Intranet.`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      {/* Left: Mobile hamburger & branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-900 to-brand-600 font-bold text-white shadow-sm shadow-brand-500/30">
            PE
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              Prashanth Enterprises
            </h1>
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <span>HRM Intranet</span>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Matrix Biometric Synced
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Intranet Search */}
      <div className="hidden max-w-md flex-1 px-8 lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, IT policy-2025, tickets, payslips..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Intranet Device Pill */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
          <Wifi className="h-3 w-3 text-emerald-600" />
          <span>Intranet Node: 192.168.1.240</span>
        </div>

        {/* Quick Punch Button */}
        <button
          onClick={handlePunchToggle}
          className={`group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
            clockedIn
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Click to Clock IN / OUT (Syncs with Matrix Biometric)"
        >
          <Clock className={`h-4 w-4 ${clockedIn ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">
            {clockedIn ? `In since ${clockTime}` : 'Clock IN'}
          </span>
          <span className={`inline-block h-2 w-2 rounded-full ${clockedIn ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
        </button>

        {/* Pending Tasks Bell */}
        <Link
          to="/inbox"
          className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          title="Inbox & Pending Tasks"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-2 transition hover:bg-slate-50 focus:outline-none"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="hidden text-xs font-semibold text-slate-700 sm:inline-block max-w-[100px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.role}</p>
                <p className="text-[10px] text-brand-600 font-mono mt-0.5">{currentUser.biometricId}</p>
              </div>
              <div className="py-1 text-xs text-slate-700">
                <Link to="/me" onClick={() => setShowProfileMenu(false)} className="block px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                  My Profile & Attendance
                </Link>
                <Link to="/finances" onClick={() => setShowProfileMenu(false)} className="block px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                  My Payslips & Taxes
                </Link>
                <Link to="/helpdesk" onClick={() => setShowProfileMenu(false)} className="block px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                  Helpdesk Support
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button 
                  onClick={() => { setShowProfileMenu(false); alert("Session locked for safety on Intranet terminal."); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                >
                  Lock Terminal / Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

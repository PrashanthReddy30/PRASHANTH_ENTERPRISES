import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Newspaper, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Coffee,
  Check
} from 'lucide-react';
import { currentUser, pendingTasks, newJoinees, companyNews, matrixBiometricStatus } from '../data/mockData';
import { Link } from 'react-router-dom';

export function Home() {
  const [completedOpenItems, setCompletedOpenItems] = useState([]);

  const toggleItemDone = (id) => {
    if (completedOpenItems.includes(id)) {
      setCompletedOpenItems(completedOpenItems.filter(item => item !== id));
    } else {
      setCompletedOpenItems([...completedOpenItems, id]);
    }
  };

  const openPlaceItems = [
    {
      id: "OP-1",
      title: "Sign-off mandatory IT Policy-2025",
      desc: "Annual compliance requirement for enterprise device & intranet security",
      deadline: "Due by Nov 20, 2026",
      urgent: true,
      category: "Compliance",
      link: "/org"
    },
    {
      id: "OP-2",
      title: "Review missing punch for Nov 14 (Matrix Door Reader 01)",
      desc: "Attendance regularization requested by System Audit",
      deadline: "Due today",
      urgent: true,
      category: "Attendance",
      link: "/me"
    },
    {
      id: "OP-3",
      title: "Declare Tax Savings for Q3 / FY 2026-27",
      desc: "Verify 80C, 80D and NPS proofs to avoid TDS deduction in December payroll",
      deadline: "Due Dec 10, 2026",
      urgent: false,
      category: "Finances",
      link: "/finances"
    },
    {
      id: "OP-4",
      title: "Submit Q3 Self-Performance Review",
      desc: "Key milestones & OKR achievements feedback for H2 review",
      deadline: "Due Nov 30, 2026",
      urgent: false,
      category: "Performance",
      link: "/me"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-5 sm:p-7 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-700/60 px-3 py-1 text-xs font-semibold text-brand-200 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Prashanth Enterprises HRM • Intranet Edition</span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight">
              Good evening, {currentUser.name}! 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-brand-200 max-w-xl">
              Welcome back to your workspace dashboard. All services are connected to the local office Matrix Biometric server (192.168.1.240).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/me"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition"
            >
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>View Attendance Log</span>
            </Link>
            <Link
              to="/inbox"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-950/20 transition"
            >
              <span>{pendingTasks.length} Pending Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Background decorative flare */}
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Complete Open Place + Biometric Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 1: Complete Open Place (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 font-bold text-xs">
                ✓
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Complete Open Place
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {completedOpenItems.length} of {openPlaceItems.length} completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completedOpenItems.length / openPlaceItems.length) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            {openPlaceItems.map((item) => {
              const isDone = completedOpenItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`group flex items-start justify-between gap-3 rounded-xl border p-4 transition ${
                    isDone 
                      ? 'border-emerald-200 bg-emerald-50/40 opacity-75' 
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleItemDone(item.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        isDone
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-brand-500'
                      }`}
                      aria-label="Mark task done"
                    >
                      {isDone && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {item.title}
                        </h3>
                        {item.urgent && !isDone && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200">
                            Required
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.deadline}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={item.link}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 group-hover:text-brand-600 hover:bg-slate-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Local Biometric Status Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Matrix Biometric Terminal
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Device Model</span>
                <span className="font-semibold text-slate-800">{matrixBiometricStatus.deviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Intranet IP</span>
                <span className="font-mono text-slate-700">{matrixBiometricStatus.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">My Biometric ID</span>
                <span className="font-mono font-bold text-brand-600">{currentUser.biometricId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Punch Synced</span>
                <span className="font-medium text-emerald-600">{matrixBiometricStatus.lastSync}</span>
              </div>
            </div>

            {/* Today's Punches */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Today's Punch Log
              </p>
              <div className="mt-2 space-y-2">
                {matrixBiometricStatus.todayPunches.map((punch, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        punch.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {punch.type}
                      </span>
                      <span className="font-semibold text-slate-700">{punch.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                      {punch.machine}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/me"
              className="mt-4 block w-full text-center rounded-xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-semibold text-slate-700 transition"
            >
              Request Duty / Partial Day
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Section 2 (New Joinees) & Section 3 (Company News) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Section 2: New Joinees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                New Joinees
              </h2>
            </div>
            <Link to="/org" className="text-xs font-medium text-brand-600 hover:underline">
              View Directory
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {newJoinees.map((joinee) => (
              <div key={joinee.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={joinee.avatar}
                    alt={joinee.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {joinee.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {joinee.role} • <span className="text-slate-700 font-medium">{joinee.department}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    Joined {joinee.joiningDate}
                  </span>
                  <p className="text-[10px] text-brand-600 font-medium mt-1 cursor-pointer hover:underline">
                    Say Hello 👋
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Company News */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Newspaper className="h-4 w-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Company News & Bulletins
              </h2>
            </div>
            <Link to="/engage" className="text-xs font-medium text-brand-600 hover:underline">
              Engage Hub
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {companyNews.map((news) => (
              <div
                key={news.id}
                className="group rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-slate-50 hover:border-slate-200"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">
                    {news.badge}
                  </span>
                  <span className="text-slate-400">{news.date}</span>
                </div>
                <h3 className="mt-2 text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">
                  {news.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Category: {news.category}</span>
                  <span className="text-brand-600 font-medium group-hover:underline">Read bulletin →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  Coffee, 
  Check, 
  PartyPopper, 
  Cake, 
  Gift, 
  Heart, 
  Send, 
  UserPlus, 
  MessageSquare, 
  Smile,
  Megaphone,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';
import { 
  currentUser, 
  pendingTasks, 
  newJoinees, 
  employeeCelebrations as initialCelebrations 
} from '../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { currentUser: authUser, storeData, hrmStore } = useAuth();
  const activeUser = authUser || currentUser;

  const [celebrations, setCelebrations] = useState(initialCelebrations);
  const [celebrationFilter, setCelebrationFilter] = useState('all');
  const [activeWishInput, setActiveWishInput] = useState({});
  const [wishSentNotification, setWishSentNotification] = useState(null);

  const [showHolidayModal, setShowHolidayModal] = useState(false);

  const upcomingFestival = {
    name: "Diwali (Festival of Lights)",
    badge: "Upcoming Major Festival 🪔",
    date: "25 Nov 2026",
    day: "Wednesday",
    holidayType: "Mandatory Corporate Paid Holiday",
    note: "Prashanth Enterprises Annual Festive Holiday",
    daysLeft: "In 5 Days"
  };

  const annualHolidayCalendar = [
    { id: 1, date: "01 Jan 2026", day: "Thursday", name: "New Year's Day 🎉", type: "National Holiday", past: true },
    { id: 2, date: "15 Jan 2026", day: "Thursday", name: "Makar Sankranti / Pongal 🌾", type: "Festive Holiday", past: true },
    { id: 3, date: "26 Jan 2026", day: "Monday", name: "Republic Day 🇮🇳", type: "National Holiday", past: true },
    { id: 4, date: "16 Feb 2026", day: "Monday", name: "Maha Shivratri 🔱", type: "Festive Holiday", past: true },
    { id: 5, date: "04 Mar 2026", day: "Wednesday", name: "Holi (Festival of Colors) 🎨", type: "Festive Holiday", past: true },
    { id: 6, date: "20 Mar 2026", day: "Friday", name: "Ugadi / Gudi Padwa 🌸", type: "Regional Festival", past: true },
    { id: 7, date: "03 Apr 2026", day: "Friday", name: "Good Friday ✝️", type: "Public Holiday", past: true },
    { id: 8, date: "21 Apr 2026", day: "Tuesday", name: "Eid-ul-Fitr (Ramzan) 🌙", type: "Public Holiday", past: true },
    { id: 9, date: "15 Aug 2026", day: "Saturday", name: "Independence Day 🇮🇳", type: "National Holiday", past: true },
    { id: 10, date: "14 Sep 2026", day: "Monday", name: "Ganesh Chaturthi 🐘", type: "Festive Holiday", past: true },
    { id: 11, date: "02 Oct 2026", day: "Friday", name: "Mahatma Gandhi Jayanti 🕊️", type: "National Holiday", past: true },
    { id: 12, date: "20 Oct 2026", day: "Tuesday", name: "Dussehra (Vijayadashami) 🏹", type: "Festive Holiday", past: true },
    { id: 13, date: "08 Nov 2026", day: "Sunday", name: "Diwali (Deepavali) 🪔", type: "Festival of Lights", past: true },
    { id: 14, date: "25 Nov 2026", day: "Wednesday", name: "Guru Nanak Jayanti ✨", type: "Public Holiday", upcoming: true },
    { id: 15, date: "25 Dec 2026", day: "Friday", name: "Christmas Day 🎄", type: "Public Holiday", upcoming: true },
    { id: 16, date: "01 Jan 2027", day: "Friday", name: "New Year's Day 2027 🎊", type: "Public Holiday", upcoming: true },
    { id: 17, date: "14 Jan 2027", day: "Thursday", name: "Sankranti / Pongal 2027 🪁", type: "Festive Holiday", upcoming: true }
  ];

  const userLeaves = [
    { code: 'CL', name: 'Casual Leave', available: '4.5', total: '6', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { code: 'SL', name: 'Sick Leave', available: '6.0', total: '8', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { code: 'PL', name: 'Privilege Leave', available: '14.5', total: '18', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { code: 'COMP', name: 'Comp Off', available: '2.0', total: '2', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const announcements = [
    {
      id: "ANN-1",
      badge: "Milestone",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      title: "Prashanth Enterprises Achieves ISO 27001 Certification",
      date: "Nov 14"
    },
    {
      id: "ANN-2",
      badge: "HR Notice",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      title: "Diwali Festive Bonus & 2027 Holiday Schedule Released 🪔",
      date: "Nov 12"
    },
    {
      id: "ANN-3",
      badge: "Infrastructure",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "New Matrix Biometric Touchless Terminals Active Across All Hubs",
      date: "Nov 10"
    }
  ];

  const handleSendWish = (celebrationId, customText) => {
    const textToSend = customText || activeWishInput[celebrationId];
    if (!textToSend || !textToSend.trim()) return;

    const newWish = {
      id: `w-${Date.now()}`,
      from: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
      message: textToSend.trim(),
      time: "Just now",
      likes: 1
    };

    setCelebrations(prev => prev.map(c => {
      if (c.id === celebrationId) {
        return {
          ...c,
          wishes: [newWish, ...(c.wishes || [])]
        };
      }
      return c;
    }));

    // Clear input
    setActiveWishInput(prev => ({ ...prev, [celebrationId]: '' }));

    // Show celebratory feedback
    setWishSentNotification(celebrationId);
    setTimeout(() => {
      setWishSentNotification(null);
    }, 3500);
  };

  const handleLikeWish = (celebrationId, wishId) => {
    setCelebrations(prev => prev.map(c => {
      if (c.id === celebrationId) {
        return {
          ...c,
          wishes: c.wishes.map(w => {
            if (w.id === wishId) {
              return { ...w, likes: (w.likes || 0) + 1 };
            }
            return w;
          })
        };
      }
      return c;
    }));
  };

  const filteredCelebrations = celebrations.filter(item => {
    if (celebrationFilter === 'all') return true;
    if (celebrationFilter === 'new_joinee') return item.type === 'new_joinee';
    if (celebrationFilter === 'birthday') return item.type === 'birthday';
    if (celebrationFilter === 'anniversary') return item.type === 'anniversary';
    return true;
  });

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

      {/* ======================================================== */}
      {/* 2-COLUMN RESPONSIVE ENTERPRISE DASHBOARD GRID           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column (lg:col-span-4 — 3 Stacked Containers) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Container 1 (Top): Upcoming Holiday with Festival Poster */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
                  <PartyPopper className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Holiday</h3>
                  <p className="text-[11px] text-slate-500">Official Festive & Public Holidays</p>
                </div>
              </div>
              <button
                onClick={() => setShowHolidayModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/70 border border-brand-200/60 transition shadow-2xs active:scale-95"
              >
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Visual Festival Poster / Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 p-5 text-white shadow-md">
              {/* Decorative background festive glow */}
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
              <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-rose-900/40 blur-2xl pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-200 border border-white/20">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>{upcomingFestival.badge}</span>
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/30 shadow-2xs">
                    {upcomingFestival.daysLeft}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                      {upcomingFestival.name}
                    </h4>
                  </div>
                  <p className="text-xs text-amber-100 font-medium mt-0.5 opacity-95">
                    {upcomingFestival.note}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/25 pt-3 mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 shadow-inner">
                      <Calendar className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-white leading-tight">{upcomingFestival.date}</span>
                      <span className="block text-[11px] text-amber-200 font-medium">{upcomingFestival.day} • {upcomingFestival.holidayType}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowHolidayModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl bg-white text-slate-900 hover:bg-amber-50 px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
                  >
                    <span>Full Calendar</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Container 2 (Middle): Leave Balance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Leave Balance</h3>
                  <p className="text-[11px] text-slate-500">Available leaves & annual quota</p>
                </div>
              </div>
              <Link
                to="/me?tab=leave&apply=true"
                className="text-[11px] font-bold text-brand-700 hover:underline"
              >
                Apply Leave
              </Link>
            </div>

            {/* Leave Balance Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {userLeaves.map((l) => (
                <div
                  key={l.code}
                  className={`rounded-xl p-3 border ${l.color} shadow-2xs flex items-center justify-between`}
                >
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">{l.code}</span>
                    <span className="text-xs font-semibold opacity-90 truncate block max-w-[90px]">{l.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black">{l.available}</span>
                    <span className="text-[10px] opacity-60">/{l.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Container 3 (Bottom): Company Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 shadow-2xs">
                  <Megaphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Company Announcements</h3>
                  <p className="text-[11px] text-slate-500">Corporate notices & official bulletins</p>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-2.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className={`px-2 py-0.5 rounded-md border ${ann.badgeColor}`}>{ann.badge}</span>
                    <span className="text-slate-400 font-normal">{ann.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-8 — Wishes & Celebrations) */}
        <div className="lg:col-span-8">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header with celebration category filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white shadow-sm shadow-pink-500/20">
                  <PartyPopper className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Wishes & Celebrations
                    </h2>
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200">
                      {celebrations.length} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Welcome new joinees and share hearty birthday & work anniversary wishes with team members!
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl shrink-0 max-w-full">
                <button
                  onClick={() => setCelebrationFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                    celebrationFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({celebrations.length})
                </button>
                <button
                  onClick={() => setCelebrationFilter('new_joinee')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                    celebrationFilter === 'new_joinee'
                      ? 'bg-white text-brand-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="h-3 w-3" />
                  <span>New Joinees</span>
                </button>
                <button
                  onClick={() => setCelebrationFilter('birthday')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                    celebrationFilter === 'birthday'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cake className="h-3 w-3" />
                  <span>Birthdays</span>
                </button>
                <button
                  onClick={() => setCelebrationFilter('anniversary')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                    celebrationFilter === 'anniversary'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="h-3 w-3" />
                  <span>Anniversaries</span>
                </button>
              </div>
            </div>

            {/* List of Celebrations & Wish Cards */}
            <div className="space-y-4">
              {filteredCelebrations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No celebrations found under this category today.
                </div>
              ) : (
                filteredCelebrations.map((item) => {
                  const isNewJoinee = item.type === 'new_joinee';
                  const isBirthday = item.type === 'birthday';
                  const isAnniversary = item.type === 'anniversary';

                  return (
                    <div
                      key={item.id}
                      className={`relative overflow-hidden rounded-2xl border transition-all ${
                        isNewJoinee
                          ? 'border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/60'
                          : isBirthday
                          ? 'border-pink-200 bg-gradient-to-br from-pink-50/40 via-white to-amber-50/40'
                          : 'border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/40'
                      } p-4 sm:p-5 shadow-xs`}
                    >
                      {/* Top Row: Celebrant Avatar + Info + Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={item.avatar}
                              alt={item.employeeName}
                              className={`h-14 w-14 rounded-2xl object-cover ring-2 ${
                                isNewJoinee
                                  ? 'ring-blue-400'
                                  : isBirthday
                                  ? 'ring-pink-400'
                                  : 'ring-purple-400'
                              } shadow-sm`}
                            />
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-xs border border-slate-200">
                              {isNewJoinee ? '👋' : isBirthday ? '🎂' : '🎖️'}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900">
                                {item.employeeName}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isNewJoinee
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isBirthday
                                  ? 'bg-pink-100 text-pink-800 border border-pink-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}>
                                {item.badge}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-0.5">
                              {item.role} • <span className="font-medium text-slate-800">{item.department}</span>
                            </p>
                            <p className="text-[11px] font-semibold text-brand-700 mt-0.5 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              <span>{item.title} ({item.subtitle})</span>
                            </p>
                          </div>
                        </div>

                        {/* Date Pill */}
                        <div className="text-left sm:text-right text-[11px] text-slate-500 font-medium shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 border border-slate-200 px-2.5 py-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{item.date}</span>
                          </span>
                        </div>
                      </div>

                      {/* Quick Wish Buttons (One-tap wishes) */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Quick One-Tap Wishes:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.quickWishes.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleSendWish(item.id, preset)}
                              className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-300 px-3 py-1 text-xs font-medium text-slate-700 hover:text-brand-700 shadow-2xs transition active:scale-95"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Wish Input Field */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder={`Type a personal greeting wish for ${item.employeeName.split(' ')[0]}...`}
                            value={activeWishInput[item.id] || ''}
                            onChange={(e) => setActiveWishInput({ ...activeWishInput, [item.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendWish(item.id);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
                          />
                          <Smile className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleSendWish(item.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Send Wish</span>
                        </button>
                      </div>

                      {/* Wish Sent Alert Toast */}
                      {wishSentNotification === item.id && (
                        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-xs font-semibold text-emerald-800 animate-fade-in">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          <span>Your wish has been posted to {item.employeeName}! 🎉</span>
                        </div>
                      )}

                      {/* Existing Wishes Feed from Colleagues */}
                      {item.wishes && item.wishes.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>Wishes from Colleagues ({item.wishes.length})</span>
                            </span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {item.wishes.map((w) => (
                              <div
                                key={w.id}
                                className="flex items-start justify-between gap-2.5 rounded-xl bg-white/90 border border-slate-100 p-2.5 text-xs shadow-2xs"
                              >
                                <div className="flex items-start gap-2.5">
                                  <img
                                    src={w.avatar}
                                    alt={w.from}
                                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900">{w.from}</span>
                                      <span className="text-[10px] text-slate-400">({w.role})</span>
                                      <span className="text-[10px] text-slate-400">• {w.time}</span>
                                    </div>
                                    <p className="mt-1 text-slate-700 leading-relaxed font-normal">
                                      {w.message}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleLikeWish(item.id, w.id)}
                                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold shrink-0 p-1 rounded-md hover:bg-rose-50 transition"
                                  title="Like this wish"
                                >
                                  <Heart className="h-3.5 w-3.5 fill-rose-500" />
                                  <span>{w.likes || 1}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FULL YEAR HOLIDAY CALENDAR MODAL (VIEW ALL POPUP)       */}
      {/* ======================================================== */}
      {showHolidayModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowHolidayModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 bg-gradient-to-r from-amber-50/60 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20">
                  <PartyPopper className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Annual Holiday Calendar</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200">
                      2026 – 2027
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Approved Public & Festive Holidays for Prashanth Enterprises
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHolidayModal(false)}
                className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition active:scale-95"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: List of Holidays */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100">
              {annualHolidayCalendar.map((h) => (
                <div
                  key={h.id}
                  className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-xl transition ${
                    h.upcoming
                      ? 'bg-amber-50/70 border border-amber-200/80 shadow-2xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex flex-col items-center justify-center h-12 w-14 rounded-xl border font-mono shrink-0 ${
                      h.upcoming
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <span className="text-[10px] font-bold uppercase leading-none">{h.date.split(' ')[1]}</span>
                      <span className="text-base font-black leading-tight">{h.date.split(' ')[0]}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{h.name}</span>
                        {h.upcoming && (
                          <span className="rounded-full bg-amber-200/90 text-amber-900 px-2 py-0.5 text-[9px] font-extrabold border border-amber-300">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {h.day} • <span className="font-medium text-slate-600">{h.type}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    h.upcoming
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {h.upcoming ? 'Mandatory Off' : 'Holiday'}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50 text-xs">
              <span className="text-slate-500 text-[11px]">
                Total {annualHolidayCalendar.length} corporate holidays configured across all hubs.
              </span>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

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
  Smile 
} from 'lucide-react';
import { 
  currentUser, 
  pendingTasks, 
  newJoinees, 
  employeeCelebrations as initialCelebrations 
} from '../data/mockData';
import { Link } from 'react-router-dom';

export function Home() {
  const [celebrations, setCelebrations] = useState(initialCelebrations);
  const [celebrationFilter, setCelebrationFilter] = useState('all');
  const [activeWishInput, setActiveWishInput] = useState({});
  const [wishSentNotification, setWishSentNotification] = useState(null);

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
      {/* SECTION: WISHES & CELEBRATIONS (NEW JOININGS & EMPLOYEES) */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            {/* Header with celebration category filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
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
              <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl shrink-0">
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
  );
}

export default Home;

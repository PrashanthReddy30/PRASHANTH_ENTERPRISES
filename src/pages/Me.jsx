import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Award, 
  Receipt, 
  Grid, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText,
  UserCheck,
  Send,
  X,
  List,
  Edit2,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { currentUser, matrixBiometricStatus, leaveBalances } from '../data/mockData';

export function Me() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showPartialDayModal, setShowPartialDayModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);

  // Keka-style attendance states
  const [attendanceSubTab, setAttendanceSubTab] = useState('Attendance Log');
  const [is24Hour, setIs24Hour] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('SEP');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [selectedDay, setSelectedDay] = useState(4); // Default 4 Sept matching reference
  const [regReason, setRegReason] = useState('');
  const [regPunchType, setRegPunchType] = useState('Missing In-Punch');
  const [regTime, setRegTime] = useState('09:00:00 AM');

  // Form states
  const [dutyReason, setDutyReason] = useState('');
  const [dutyLocation, setDutyLocation] = useState('');
  const [leaveType, setLeaveType] = useState('Privilege Leave (PL)');
  const [leaveDays, setLeaveDays] = useState('1');

  // Time conversion helper for 12h / 24h
  const formatPunchTime = (timeStr, use24Hour) => {
    if (!timeStr || timeStr === '-') return timeStr;
    if (!use24Hour) return timeStr;
    const match = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeStr;
    let [_, hours, mins, secs, ampm] = match;
    let h = parseInt(hours, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${mins}:${secs}`;
  };

  // Calendar days matching Keka September 2026 reference layout
  const septDays = [
    { day: 31, isPrev: true, isWeekend: false },
    { day: 1, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 15m', effectiveHours: '8h 30m', location: 'Hyderabad maindoor' },
    { day: 2, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 22m', effectiveHours: '8h 45m', location: 'Hyderabad maindoor' },
    { day: 3, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 08m', effectiveHours: '8h 20m', location: 'Hyderabad maindoor' },
    { day: 4, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 56m', effectiveHours: '8h 12m', location: 'Hyderabad maindoor' },
    { day: 5, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 6, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 7, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 30m', effectiveHours: '8h 50m', location: 'Hyderabad maindoor' },
    { day: 8, isPrev: false, isWeekend: false, hasAlert: true, label: 'NO ENTRIES LOGGED', status: 'missing', grossHours: '0h 00m', effectiveHours: '0h 00m', location: 'Hyderabad maindoor' },
    { day: 9, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 10m', effectiveHours: '8h 15m', location: 'Hyderabad maindoor' },
    { day: 10, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 40m', effectiveHours: '8h 35m', location: 'Hyderabad maindoor' },
    { day: 11, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 05m', effectiveHours: '8h 05m', location: 'Hyderabad maindoor' },
    { day: 12, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 13, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 14, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 18m', effectiveHours: '8h 25m', location: 'Hyderabad maindoor' },
    { day: 15, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 25m', effectiveHours: '8h 40m', location: 'Hyderabad maindoor' },
    { day: 16, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 12m', effectiveHours: '8h 10m', location: 'Hyderabad maindoor' },
    { day: 17, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 35m', effectiveHours: '8h 55m', location: 'Hyderabad maindoor' },
    { day: 18, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 02m', effectiveHours: '8h 00m', location: 'Hyderabad maindoor' },
    { day: 19, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 20, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 21, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 20m', effectiveHours: '8h 30m', location: 'Hyderabad maindoor' },
    { day: 22, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 15m', effectiveHours: '8h 22m', location: 'Hyderabad maindoor' },
    { day: 23, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 45m', effectiveHours: '8h 50m', location: 'Hyderabad maindoor' },
    { day: 24, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 05m', effectiveHours: '8h 12m', location: 'Hyderabad maindoor' },
    { day: 25, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 10m', effectiveHours: '8h 18m', location: 'Hyderabad maindoor' },
    { day: 26, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 27, isPrev: false, isWeekend: true, label: 'W-OFF', status: 'weekend', grossHours: '0h 00m', effectiveHours: '0h 00m' },
    { day: 28, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 25m', effectiveHours: '8h 35m', location: 'Hyderabad maindoor' },
    { day: 29, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 15m', effectiveHours: '8h 20m', location: 'Hyderabad maindoor' },
    { day: 30, isPrev: false, isWeekend: false, status: 'present', grossHours: '9h 30m', effectiveHours: '8h 40m', location: 'Hyderabad maindoor' },
  ];

  // Detailed In/Out punch logs per day
  const dayPunchesMap = {
    4: [
      { in: "8:43:23 AM", out: "9:35:30 AM" },
      { in: "9:40:37 AM", out: "9:50:29 AM" },
      { in: "9:50:56 AM", out: "10:32:25 AM" },
      { in: "10:38:53 AM", out: "12:33:00 PM" },
      { in: "1:15:20 PM", out: "4:20:10 PM" },
      { in: "4:35:00 PM", out: "6:39:23 PM" },
    ],
    1: [
      { in: "9:02:14 AM", out: "1:10:22 PM" },
      { in: "1:55:10 PM", out: "6:17:45 PM" },
    ],
    2: [
      { in: "8:58:30 AM", out: "12:50:18 PM" },
      { in: "1:35:02 PM", out: "6:08:11 PM" },
    ],
    3: [
      { in: "9:10:05 AM", out: "1:12:30 PM" },
      { in: "2:00:15 PM", out: "6:25:40 PM" },
    ],
    7: [
      { in: "9:04:18 AM", out: "1:15:00 PM" },
      { in: "1:55:12 PM", out: "6:14:05 PM" },
    ],
    8: [], // NO ENTRIES LOGGED
  };

  const currentDayData = septDays.find((d) => d.day === selectedDay && !d.isPrev) || septDays[4];
  const currentPunches = dayPunchesMap[selectedDay] !== undefined 
    ? dayPunchesMap[selectedDay] 
    : (currentDayData.isWeekend ? [] : [
        { in: "9:01:10 AM", out: "1:10:00 PM" },
        { in: "1:50:20 PM", out: "6:12:30 PM" }
      ]);

  const formattedDate = (selectedDay < 10 ? '0' + selectedDay : selectedDay) + ' Sept';

  const handleApplyRegularize = (e) => {
    e.preventDefault();
    alert(`Regularization request submitted for ${formattedDate} 2026 (${regPunchType} at ${regTime}). Sent to reporting manager for approval.`);
    setShowRegularizeModal(false);
    setRegReason('');
  };

  const attendanceLog = [
    { date: "15 Nov 2026 (Today)", in: "09:12 AM", out: "06:15 PM", hours: "9h 03m", source: "Matrix Terminal 01", status: "Present" },
    { date: "14 Nov 2026", in: "09:05 AM", out: "06:10 PM", hours: "9h 05m", source: "Matrix Terminal 01", status: "Present" },
    { date: "13 Nov 2026", in: "09:45 AM", out: "06:30 PM", hours: "8h 45m", source: "Matrix Terminal 02", status: "Late Mark (Regularized)" },
    { date: "12 Nov 2026", in: "09:00 AM", out: "06:02 PM", hours: "9h 02m", source: "Matrix Terminal 01", status: "Present" },
    { date: "11 Nov 2026", in: "-", out: "-", hours: "0h", source: "Approved Leave", status: "Sick Leave" },
  ];

  const handleApplyDuty = (e) => {
    e.preventDefault();
    alert(`On-Duty (OD) request submitted for: ${dutyLocation} (${dutyReason}). Sent to manager for approval.`);
    setShowDutyModal(false);
  };

  const handleApplyPartial = (e) => {
    e.preventDefault();
    alert("Partial Day (Half-Day/Late permission) request successfully registered.");
    setShowPartialDayModal(false);
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    alert(`Leave application for ${leaveDays} day(s) under ${leaveType} submitted.`);
    setShowLeaveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-100"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h1>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Emp ID: <span className="font-mono text-slate-700 font-semibold">{currentUser.id}</span> • 
                Biometric ID: <span className="font-mono text-emerald-600 font-semibold">{currentUser.biometricId}</span>
              </p>
              <p className="text-xs text-slate-500">
                Department: <span className="font-medium text-slate-700">{currentUser.department}</span> • Joined {currentUser.joiningDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDutyModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Request Duty (OD)
            </button>
            <button
              onClick={() => setShowPartialDayModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Request Partial Day
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition"
            >
              Apply Leave
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex overflow-x-auto border-b border-slate-200 gap-1 sm:gap-2">
          {[
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'leave', label: 'Leave (Apply & Balance)', icon: Calendar },
            { id: 'performance', label: 'Performance', icon: Award },
            { id: 'expenses', label: 'Expenses & Travel', icon: Receipt },
            { id: 'apps', label: 'Apps & Tools', icon: Grid },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Attendance (Keka-style Reference Layout) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Dark Navy Card matching reference */}
          <div className="rounded-2xl bg-[#090f1d] border border-[#1b263b] overflow-hidden shadow-2xl text-slate-100">
            {/* 1. Header: Logs & Requests & 24h toggle */}
            <div className="px-5 pt-4 pb-0 border-b border-[#1b263b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Logs & Requests</h2>
                {/* Sub-tabs */}
                <div className="flex items-center gap-2 sm:gap-6 mt-3 overflow-x-auto">
                  {['Attendance Log', 'Calendar', 'Attendance Requests', 'Overtime Requests'].map((tab) => {
                    const active = attendanceSubTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setAttendanceSubTab(tab)}
                        className={`relative pb-3 text-xs font-semibold transition whitespace-nowrap ${
                          active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                        {active && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 24-hour format switch */}
              <div
                onClick={() => setIs24Hour(!is24Hour)}
                className="flex items-center gap-2.5 cursor-pointer pb-3 sm:pb-0 select-none self-end sm:self-auto"
              >
                <span className="text-xs text-slate-300 font-medium">24 hour format</span>
                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                    is24Hour ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      is24Hour ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Subtab 1: Attendance Log */}
            {attendanceSubTab === 'Attendance Log' && (
              <>
                {/* 2. Month Selector & View Toggle Bar */}
                <div className="px-5 py-3.5 bg-[#0b1325] border-b border-[#1b263b] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                    September, 2026
                  </div>

                  {/* Month Pills */}
                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
                    {['SEP', 'AUG', 'JUL', 'JUN', 'MAY', 'APR', 'MAR'].map((m) => {
                      const isSelected = selectedMonth === m;
                      return (
                        <button
                          key={m}
                          onClick={() => setSelectedMonth(m)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#5c54e5] text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#162238]'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewMode('list')}
                      title="List View"
                      className={`p-1.5 rounded-lg border transition ${
                        viewMode === 'list'
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                          : 'text-slate-400 border-[#23355b] hover:bg-[#162238]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      title="Calendar View"
                      className={`p-1.5 rounded-lg border transition ${
                        viewMode === 'calendar'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'text-slate-400 border-[#23355b] hover:bg-[#162238]'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Main Split View: Calendar Grid + Daily Shift / Punches */}
                {viewMode === 'calendar' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 bg-[#080d1a]">
                    {/* Left / Center 8 Columns: Calendar Grid */}
                    <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#1b263b]">
                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 border-b border-[#1b263b] bg-[#0c1427] text-center text-[11px] font-bold text-slate-400 py-2.5 tracking-wider">
                        <div>MON</div>
                        <div>TUE</div>
                        <div>WED</div>
                        <div>THU</div>
                        <div>FRI</div>
                        <div>SAT</div>
                        <div>SUN</div>
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7">
                        {septDays.map((item, idx) => {
                          const isSelected = selectedDay === item.day && !item.isPrev;
                          return (
                            <div
                              key={idx}
                              onClick={() => !item.isPrev && setSelectedDay(item.day)}
                              className={`relative min-h-[72px] sm:min-h-[86px] p-2 border-b border-r border-[#1b263b] transition cursor-pointer select-none ${
                                item.isPrev
                                  ? 'bg-[#070b16] opacity-30 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#10293d] border-cyan-500/90 ring-1 ring-cyan-500/80 shadow-inner'
                                  : 'bg-[#090f1d] hover:bg-[#111c33]'
                              }`}
                            >
                              {/* Day number */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold ${
                                    item.isPrev
                                      ? 'text-slate-600'
                                      : isSelected
                                      ? 'text-cyan-300 font-bold'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {item.day}
                                </span>
                              </div>

                              {/* Special Alert Ribbon for Day 8 */}
                              {item.hasAlert && (
                                <div className="absolute top-0 left-0">
                                  <div className="w-0 h-0 border-t-[14px] border-t-indigo-600 border-r-[14px] border-r-transparent" />
                                </div>
                              )}

                              {/* Content inside cell */}
                              <div className="mt-2 flex flex-col items-center justify-center">
                                {item.label === 'W-OFF' && (
                                  <span className="inline-block bg-[#3a2f20] text-[#e3b879] border border-[#52422c] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    W-OFF
                                  </span>
                                )}

                                {item.hasAlert && (
                                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tight text-center leading-tight">
                                    NO ENTRIES LOGGED
                                  </span>
                                )}

                                {!item.isPrev && !item.isWeekend && !item.hasAlert && (
                                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                                    {item.effectiveHours}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right 4 Columns: Daily Shift & Login/Logout Punches */}
                    <div className="lg:col-span-4 bg-[#0a1122] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        {/* Shift Title & Timings */}
                        <div className="border-b border-[#1b263b] pb-3">
                          <h3 className="text-sm font-bold text-white">General Shift</h3>
                          <p className="text-xs text-slate-400">({formattedDate})</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">9:00 AM - 6:00 PM</p>

                          {/* Timeline visualization bar */}
                          <div className="mt-3">
                            <div className="h-2.5 w-full bg-[#131d33] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[#23355b]">
                              {currentDayData.status === 'present' ? (
                                <>
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '14%' }} title="08:43 - 09:35" />
                                  <div className="h-full bg-transparent" style={{ width: '2%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '4%' }} title="09:40 - 09:50" />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '9%' }} title="09:50 - 10:32" />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '20%' }} title="10:38 - 12:33" />
                                  <div className="h-full bg-transparent" style={{ width: '6%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '32%' }} title="13:15 - 16:20" />
                                  <div className="h-full bg-transparent" style={{ width: '2%' }} />
                                  <div className="h-full bg-cyan-400 rounded-xs" style={{ width: '11%' }} title="16:35 - 18:39" />
                                </>
                              ) : (
                                <div className="h-full w-full bg-slate-800/50" />
                              )}
                            </div>
                            <div className="flex justify-between px-0.5 text-[9px] text-slate-500 font-mono mt-1">
                              <span>9:00 AM</span>
                              <span>1:00 PM</span>
                              <span>6:00 PM</span>
                            </div>
                          </div>
                        </div>

                        {/* Gross & Effective Hours */}
                        <div className="flex items-center justify-between py-3 border-b border-[#1b263b]">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">GROSS HOURS</span>
                            <span className="text-sm font-extrabold text-white font-mono">{currentDayData.grossHours}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">EFFECTIVE HOURS</span>
                            <span className="text-sm font-extrabold text-white font-mono">{currentDayData.effectiveHours}</span>
                          </div>
                        </div>

                        {/* Status & Regularize Button */}
                        <div className="flex items-center justify-between py-3 border-b border-[#1b263b]">
                          {currentDayData.status === 'present' ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>On Time</span>
                            </div>
                          ) : currentDayData.hasAlert ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>No Entries Logged</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e3b879]">
                              <span>Weekly Off</span>
                            </div>
                          )}

                          <button
                            onClick={() => setShowRegularizeModal(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Regularize</span>
                          </button>
                        </div>

                        {/* Reader Location */}
                        <div className="py-2.5 text-xs font-bold text-slate-200 border-b border-[#1b263b] flex items-center justify-between">
                          <span>{currentDayData.location || 'Hyderabad maindoor'}</span>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Matrix Synced
                          </span>
                        </div>

                        {/* Punch Stream List (Login / Logout) */}
                        <div className="mt-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Punch Records (In / Out)</p>
                          <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                            {currentPunches.length > 0 ? (
                              currentPunches.map((punch, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[#070d1a] border border-[#1b263b]"
                                >
                                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-medium">
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>{formatPunchTime(punch.in, is24Hour)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-200 font-mono font-medium">
                                    <ArrowUpRight className="w-3 h-3 text-amber-400 stroke-[2.5]" />
                                    <span>{formatPunchTime(punch.out, is24Hour)}</span>
                                  </div>
                                </div>
                              ))
                            ) : currentDayData.hasAlert ? (
                              <div className="text-center py-5 px-3 bg-[#070d1a] rounded-xl border border-indigo-950">
                                <AlertCircle className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-slate-300">No punches found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Missing biometric terminal logs.</p>
                                <button
                                  onClick={() => setShowRegularizeModal(true)}
                                  className="mt-2.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                  Regularize Punch
                                </button>
                              </div>
                            ) : (
                              <div className="text-center py-5 px-3 bg-[#070d1a] rounded-xl border border-[#1b263b]">
                                <p className="text-xs font-bold text-[#e3b879]">Weekend Off (W-OFF)</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">No punches required on scheduled off days.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="p-4 overflow-x-auto bg-[#080d1a]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0c1427] text-[11px] font-bold text-slate-400 uppercase border-b border-[#1b263b]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Shift</th>
                          <th className="py-2.5 px-3">First In</th>
                          <th className="py-2.5 px-3">Last Out</th>
                          <th className="py-2.5 px-3">Gross Hours</th>
                          <th className="py-2.5 px-3">Effective Hours</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b263b]">
                        {septDays.filter((d) => !d.isPrev).map((item) => {
                          const punches = dayPunchesMap[item.day] || [];
                          const firstIn = punches[0]?.in || (item.isWeekend ? '-' : '09:00 AM');
                          const lastOut = punches[punches.length - 1]?.out || (item.isWeekend ? '-' : '06:00 PM');
                          return (
                            <tr key={item.day} className="hover:bg-[#0f1b33] transition">
                              <td className="py-2.5 px-3 font-semibold text-slate-200">
                                {item.day < 10 ? '0' + item.day : item.day} Sep 2026
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">
                                {item.isWeekend ? 'Weekly Off' : 'General Shift (9-6)'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-emerald-400 font-medium">
                                {formatPunchTime(firstIn, is24Hour)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-300">
                                {formatPunchTime(lastOut, is24Hour)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-200">{item.grossHours}</td>
                              <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{item.effectiveHours}</td>
                              <td className="py-2.5 px-3">
                                {item.status === 'present' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800">
                                    ✓ Present
                                  </span>
                                ) : item.hasAlert ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-800">
                                    No Entries Logged
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3a2f20] text-[#e3b879] border border-[#52422c]">
                                    W-OFF
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedDay(item.day);
                                    setShowRegularizeModal(true);
                                  }}
                                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                                >
                                  Regularize
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Subtab 2: Calendar */}
            {attendanceSubTab === 'Calendar' && (
              <div className="p-8 text-center bg-[#080d1a]">
                <Calendar className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">Full Shift Calendar View</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Displaying full enterprise biometric schedules, assigned shift rosters, and holiday leaves for Prashanth Enterprises.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-950/50 border border-indigo-800/60 px-4 py-2 text-xs text-indigo-300">
                  <span>Current Roster: General Office Shift (09:00 AM - 06:00 PM)</span>
                </div>
              </div>
            )}

            {/* Subtab 3: Attendance Requests */}
            {attendanceSubTab === 'Attendance Requests' && (
              <div className="p-5 bg-[#080d1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Attendance Regularization Requests</h3>
                  <button
                    onClick={() => setShowRegularizeModal(true)}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    + Raise Request
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#1b263b] bg-[#0c1427] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">08 Sept 2026</span>
                        <span className="rounded-full bg-amber-950/60 border border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Reason: Biometric scanner did not record morning entry punch.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Approver: Sunil Verma (Engineering Director)
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Requested: 09:00 AM</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab 4: Overtime Requests */}
            {attendanceSubTab === 'Overtime Requests' && (
              <div className="p-5 bg-[#080d1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Overtime (OT) Approvals & Requests</h3>
                  <button
                    onClick={() => alert("Overtime request for current pay-cycle initiated.")}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    + Apply Overtime
                  </button>
                </div>
                <div className="rounded-xl border border-[#1b263b] bg-[#0c1427] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Month Overtime Total</p>
                    <p className="text-xs text-slate-400 mt-0.5">Overtime rate: 1.5x standard hourly rate</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-400 font-mono">4.5 hrs</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Leave (Apply & Balance) */}
      {activeTab === 'leave' && (
        <div className="space-y-6 animate-fade-in">
          {/* Balance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {leaveBalances.map((leave, idx) => (
              <div key={idx} className={`rounded-2xl border p-4 ${leave.color} bg-white shadow-xs`}>
                <p className="text-xs font-bold text-slate-700">{leave.type}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">{leave.available}</span>
                  <span className="text-xs text-slate-500">/ {leave.total} days</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600"
                    style={{ width: `${(leave.available / leave.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Apply Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Apply for Leave</h3>
              <span className="text-xs text-slate-500">Leave Period: Jan 2026 - Dec 2026</span>
            </div>
            <form onSubmit={handleApplyLeave} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option>Privilege Leave (PL)</option>
                  <option>Sick Leave (SL)</option>
                  <option>Casual Leave (CL)</option>
                  <option>Compensatory Off</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action</label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 py-2 px-4 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Q3 Performance & OKRs (2026)</h3>
            <p className="text-xs text-slate-500 mt-1">Review cycle: Jul 2026 - Sep 2026</p>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Objective 1: Zero-Downtime Local Intranet & Matrix Biometric Migration</span>
                  <span className="font-bold text-emerald-600">100% Achieved</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Migrated 4 door controllers and 250+ employee fingerprints with automatic failover.</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Objective 2: Enterprise IT Policy-2025 Audit Compliance</span>
                  <span className="font-bold text-brand-600">85% In Progress</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Ensuring all workstations have disk encryption and password rotation active.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expenses & Travel */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Claims & Travel Advances</h3>
            <button
              onClick={() => alert("Open New Expense Claim form")}
              className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              + File New Claim
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-800">EXP-8291: Client Site Visit & Transport</p>
                <p className="text-slate-500">Submitted on Nov 05, 2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₹ 3,450.00</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Approved & Disbursed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Apps */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Grid className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Matrix COSEC Web Console</h4>
            <p className="text-[11px] text-slate-500 mt-1">Direct local biometric portal access (192.168.1.240)</p>
            <button 
              onClick={() => alert("Opening Matrix COSEC web panel on local intranet")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">IT Asset & Inventory Management</h4>
            <p className="text-[11px] text-slate-500 mt-1">Track hardware issued, licenses & serial keys</p>
            <button 
              onClick={() => alert("Opening IT Asset Management Portal")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">ERP & Vendor Invoicing</h4>
            <p className="text-[11px] text-slate-500 mt-1">Enterprise ERP module for Prashanth Enterprises</p>
            <button 
              onClick={() => alert("Opening Enterprise ERP")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              <span>Open Portal</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Request Duty (OD) */}
      {showDutyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request On-Duty (OD)</h3>
              <button onClick={() => setShowDutyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyDuty} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Client Site</label>
                <input
                  required
                  placeholder="e.g. Hyderabad Plant / Pune Client Office"
                  value={dutyLocation}
                  onChange={(e) => setDutyLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Project Name</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe purpose of visit..."
                  value={dutyReason}
                  onChange={(e) => setDutyReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                On-duty status will adjust biometric punch calculation once approved by your reporting manager.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDutyModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Partial Day */}
      {showPartialDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request Partial Day (Late / Early)</h3>
              <button onClick={() => setShowPartialDayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyPartial} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type</label>
                <select className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500">
                  <option>Late Coming Permission (Up to 2 hours)</option>
                  <option>Early Departure Permission (Up to 2 hours)</option>
                  <option>First Half Leave</option>
                  <option>Second Half Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Doctor appointment, urgent personal work, etc."
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartialDayModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apply Leave */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Apply Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Leave Type</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-800 outline-none"
                >
                  <option>Privilege Leave (PL) - 14.5 days available</option>
                  <option>Sick Leave (SL) - 6.0 days available</option>
                  <option>Casual Leave (CL) - 4.5 days available</option>
                  <option>Compensatory Off - 2.0 days available</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                  <input type="date" defaultValue="2026-11-20" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                  <input type="date" defaultValue="2026-11-20" className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea rows="2" placeholder="Brief reason for your manager..." className="w-full rounded-xl border border-slate-300 p-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Confirm & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attendance Regularization */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Regularization</h3>
                <p className="text-xs text-slate-500">For {formattedDate} 2026</p>
              </div>
              <button onClick={() => setShowRegularizeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyRegularize} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Regularization Type</label>
                <select
                  value={regPunchType}
                  onChange={(e) => setRegPunchType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                >
                  <option>Missing In-Punch</option>
                  <option>Missing Out-Punch</option>
                  <option>Both Punches Missing</option>
                  <option>Biometric Scanner Failed / Fingerprint Error</option>
                  <option>Official Client Site Visit (On-Duty)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Time</label>
                  <input
                    type="text"
                    value={regTime}
                    onChange={(e) => setRegTime(e.target.value)}
                    placeholder="e.g. 09:00:00 AM"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-800 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Terminal</label>
                  <input
                    type="text"
                    readOnly
                    value="Hyderabad maindoor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Regularization</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Please state why attendance punch was missing or unrecorded..."
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-brand-500"
                />
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-900">
                <p className="font-semibold">Reporting Approver:</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">Sunil Verma (Engineering Director) • Matrix Punch Sync ID: EMP-1042</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegularizeModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Me;

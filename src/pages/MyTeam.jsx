import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { teamMembers as initialMembers } from '../data/mockData';

export function MyTeam() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredMembers = initialMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const presentCount = initialMembers.filter(m => m.status === 'In Office').length;
  const wfhCount = initialMembers.filter(m => m.status === 'Work From Home').length;
  const leaveCount = initialMembers.filter(m => m.status === 'On Leave').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">My Team Tracking & Attendance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric presence, shift compliance, and team availability for Prashanth Enterprises.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reportee by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Team Presence Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setFilterStatus('All')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterStatus === 'All' ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500">Total Direct Reports</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{initialMembers.length}</p>
          <p className="text-[11px] text-brand-600 font-medium">Full Roster</p>
        </div>

        <div 
          onClick={() => setFilterStatus('In Office')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterStatus === 'In Office' ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500">In Office (Biometric Punched)</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{presentCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium">On-site at Office Hub</p>
        </div>

        <div 
          onClick={() => setFilterStatus('Work From Home')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterStatus === 'Work From Home' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500">Work From Home (WFH)</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">{wfhCount}</p>
          <p className="text-[11px] text-blue-700 font-medium">Web Clock-in</p>
        </div>

        <div 
          onClick={() => setFilterStatus('On Leave')}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            filterStatus === 'On Leave' ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-500' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500">On Planned Leave</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-600">{leaveCount}</p>
          <p className="text-[11px] text-amber-700 font-medium">Casual / Sick Leave</p>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.role}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{member.id}</p>
                </div>
              </div>

              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                member.status === 'In Office'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : member.status === 'Work From Home'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {member.status}
              </span>
            </div>

            {/* Attendance & Biometric details */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 block">First Punch In:</span>
                <span className="font-mono font-bold text-slate-800">{member.inTime}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Punch Terminal:</span>
                <span className="font-semibold text-slate-700">{member.matrixDevice}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Assigned Shift:</span>
                <span className="font-medium text-slate-700">{member.shift}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert(`Calling ${member.name} on local PBX phone...`)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Call Extension"
                >
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => alert(`Opening email compose for ${member.name}...`)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Send Email"
                >
                  <Mail className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => alert(`Opening attendance history for ${member.name}`)}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View Punch History →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTeam;

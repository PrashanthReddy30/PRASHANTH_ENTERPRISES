import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function DepartmentsBranches() {
  const { storeData, hrmStore } = useAuth();
  const [selectedHub, setSelectedHub] = useState('ALL');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 uppercase">
              Corporate Hierarchy
            </span>
            <span className="text-xs text-slate-500">• 3 Regional Hubs & 7 Strategic Divisions</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Branches & Departments Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic hub assignments, corporate divisions, department head allocations, and inter-branch governance.
          </p>
        </div>
      </div>

      {/* Section 1: The Three Corporate Hubs */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-600" />
          <span>Regional Corporate Hubs</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storeData.branches.map((b) => {
            const employeesInBranch = storeData.employees.filter(e => e.branchId === b.id);
            return (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{b.name} Hub</h3>
                    <p className="text-xs text-slate-500">{b.type}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold">
                    {b.id}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{b.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Hub Lead: <strong>{b.head}</strong></span>
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between text-xs border border-slate-100">
                  <span className="text-slate-600">Active Headcount:</span>
                  <span className="font-bold text-slate-900 text-sm">{employeesInBranch.length} personnel</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Enterprise Departments */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand-600" />
          <span>Department Directory & Leadership</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeData.departments.map((dept) => {
            const emps = storeData.employees.filter(e => e.deptCode === dept.id);
            return (
              <div key={dept.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    {dept.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {emps.length} Active Staff
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Division Lead: <strong>{dept.head}</strong>
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Branch Presence:</span>
                  <span className="font-semibold text-slate-700">All 3 Hubs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DepartmentsBranches;

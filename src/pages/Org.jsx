import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  Briefcase, 
  Search, 
  Download, 
  Eye, 
  Share2, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Network
} from 'lucide-react';
import { documentsList } from '../data/mockData';

export function Org() {
  const [activeTab, setActiveTab] = useState('documents'); // default to documents or employees
  const [employeeSubTab, setEmployeeSubTab] = useState('directory');
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const employees = [
    { name: "Prashanth Reddy", role: "Director of Operations", dept: "Executive Management", email: "prashanth.reddy@prashanthenterprises.in", phone: "+91 98480 11223", location: "Headquarters (HQ)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { name: "Pooja Hegde", role: "VP People Operations", dept: "Human Resources", email: "pooja.hegde@prashanthenterprises.in", phone: "+91 98480 11224", location: "Headquarters (HQ)", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
    { name: "Rajesh Kannan", role: "Head of IT & Infrastructure", dept: "Information Technology", email: "rajesh.k@prashanthenterprises.in", phone: "+91 98480 11225", location: "IT Hub", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { name: "Kavitha Sharma", role: "Lead QA Automation", dept: "Engineering", email: "kavitha.s@prashanthenterprises.in", phone: "+91 98480 11226", location: "Engineering Bay 4", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
    { name: "Vikram Malhotra", role: "Senior Backend Developer", dept: "Engineering", email: "vikram.m@prashanthenterprises.in", phone: "+91 98480 11227", location: "Engineering Bay 4", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" }
  ];

  const jobOpenings = [
    { id: "JOB-401", title: "Senior Full-Stack Engineer (React & Node.js)", dept: "Engineering", type: "Full-Time", experience: "4-7 Years", referralBonus: "₹ 50,000" },
    { id: "JOB-402", title: "DevOps & Local Intranet Security Specialist", dept: "Infrastructure", type: "Full-Time", experience: "3-5 Years", referralBonus: "₹ 40,000" },
    { id: "JOB-403", title: "HR Business Partner (Talent & Operations)", dept: "Human Resources", type: "Full-Time", experience: "2-4 Years", referralBonus: "₹ 30,000" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Organization (Org)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee directory, hierarchical org tree, corporate governance & policies, and internal hiring.
            </p>
          </div>
        </div>

        {/* Top 3 Org Tabs */}
        <div className="mt-6 flex border-b border-slate-200 gap-2 overflow-x-auto">
          {[
            { id: 'employees', label: 'Employees & Directory', icon: Users },
            { id: 'documents', label: 'Documents & Policies', icon: FileText },
            { id: 'hiring', label: 'Hiring (Refer & Apply)', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Employees */}
      {activeTab === 'employees' && (
        <div className="space-y-4 animate-fade-in">
          {/* Subtabs: Directory vs Tree */}
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setEmployeeSubTab('directory')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  employeeSubTab === 'directory' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Directory View
              </button>
              <button
                onClick={() => setEmployeeSubTab('tree')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  employeeSubTab === 'tree' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Organization Tree
              </button>
            </div>
            <span className="text-xs text-slate-500 font-medium">{employees.length} Members Listed</span>
          </div>

          {employeeSubTab === 'directory' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-200 transition">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{emp.name}</h3>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {emp.dept}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <p className="truncate">📧 {emp.email}</p>
                    <p>📞 {emp.phone}</p>
                    <p>📍 {emp.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Org Tree Representation */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center justify-center gap-2">
                <Network className="h-4 w-4 text-brand-600" />
                <span>Prashanth Enterprises Organizational Hierarchy</span>
              </h3>

              {/* Node 1: Director */}
              <div className="inline-block rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-4 shadow-sm text-center min-w-[220px]">
                <p className="text-xs font-bold text-slate-900">Prashanth Reddy</p>
                <p className="text-[11px] font-semibold text-brand-700">Director of Operations</p>
                <p className="text-[10px] text-slate-500">Board & Executive Head</p>
              </div>

              <div className="h-8 w-0.5 bg-slate-300 mx-auto my-2" />

              {/* Node 2: Department Heads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-900">Pooja Hegde</p>
                  <p className="text-[11px] text-slate-600">VP People Operations (HR)</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-900">Rajesh Kannan</p>
                  <p className="text-[11px] text-slate-600">Head of IT & Infrastructure</p>
                </div>
              </div>

              <div className="h-8 w-0.5 bg-slate-300 mx-auto my-2" />

              {/* Node 3: Teams */}
              <div className="rounded-xl border border-dashed border-slate-200 p-4 max-w-2xl mx-auto bg-slate-50/60">
                <p className="text-xs font-bold text-slate-700">Engineering & Operations Teams</p>
                <p className="text-xs text-slate-500 mt-1">
                  Kavitha Sharma (Lead QA) • Vikram Malhotra (Sr. Backend) • Rohan Patel (DevOps) • Deepa Nair (Analyst)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Documents (Highlighting IT policy-2025 as requested) */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-fade-in">
          {/* Highlight Banner: IT Policy-2025 */}
          <div className="rounded-2xl border-2 border-brand-500 bg-gradient-to-r from-brand-900 to-slate-900 p-6 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/30 px-3 py-1 text-xs font-bold text-brand-300 border border-brand-400/40">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
                  <span>Mandatory Compliance Document</span>
                </div>
                <h2 className="text-lg font-bold">IT Policy-2025: Information Security & Intranet Guidelines</h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Covers device encryption, authorized Matrix Biometric access terminal protocols, network security, acceptable data use, and local intranet firewall compliance.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Downloading IT Policy-2025 (PDF, 1.8MB)...")}
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Policy</span>
                </button>
              </div>
            </div>
          </div>

          {/* All Policies List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">All Company Policies & Handbooks</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {documentsList
                .filter(d => d.title.toLowerCase().includes(searchDoc.toLowerCase()))
                .map((doc) => (
                  <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FileText className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Category: <span className="font-medium text-slate-700">{doc.category}</span> • 
                          Version: {doc.version} • Updated: {doc.updated} • Size: {doc.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => alert(`Previewing ${doc.title}`)}
                        className="rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        title="Preview Document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => alert(`Downloading ${doc.title}`)}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 p-2 text-xs font-semibold text-slate-700 transition"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hiring (Refer & Apply) */}
      {activeTab === 'hiring' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Openings at Prashanth Enterprises</h3>
                <p className="text-xs text-slate-500">Refer a friend or apply internally for career growth.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                {jobOpenings.length} Active Positions
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {jobOpenings.map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Department: {job.dept} • Experience Required: {job.experience}
                      </p>
                      <p className="text-xs font-bold text-emerald-700 mt-1">
                        🎁 Employee Referral Bonus: {job.referralBonus}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Referral link generated for ${job.title}. Share with your network!`)}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Refer Candidate
                      </button>
                      <button
                        onClick={() => alert(`Applying internally for ${job.title}`)}
                        className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                      >
                        Apply Internally
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Org;

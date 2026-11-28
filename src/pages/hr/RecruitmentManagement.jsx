import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  UserPlus, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Star, 
  ChevronRight, 
  ArrowRight, 
  X, 
  FileText, 
  Check, 
  Phone, 
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function RecruitmentManagement() {
  const navigate = useNavigate();
  const { storeData, hrmStore, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'openings'
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for New Job
  const [newJobData, setNewJobData] = useState({
    title: '',
    department: 'Information Technology',
    branch: 'Hyderabad',
    branchId: 'HYD',
    type: 'Full-Time',
    experience: '3-5 Years',
    vacancies: 1
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddJobSubmit = (e) => {
    e.preventDefault();
    if (!newJobData.title) {
      alert('Job title is required.');
      return;
    }

    try {
      hrmStore.addJobOpening(newJobData);
      showToast(`Job vacancy for "${newJobData.title}" created successfully!`);
      setShowAddJobModal(false);
      setNewJobData({
        title: '',
        department: 'Information Technology',
        branch: 'Hyderabad',
        branchId: 'HYD',
        type: 'Full-Time',
        experience: '3-5 Years',
        vacancies: 1
      });
    } catch (err) {
      alert(`Error creating opening: ${err.message}`);
    }
  };

  const handleMoveStage = (candidateId, nextStage) => {
    try {
      hrmStore.updateCandidateStage(candidateId, nextStage, currentUser.name);
      showToast(`Candidate moved to stage: ${nextStage}`);
    } catch (err) {
      alert(`Stage transition failed: ${err.message}`);
    }
  };

  const handleHireAndOnboard = (candidate) => {
    if (confirm(`Confirm hiring ${candidate.name} as ${candidate.jobTitle}? This will trigger the employee onboarding workflow.`)) {
      try {
        hrmStore.updateCandidateStage(candidate.id, 'Hired', currentUser.name);
        // Automatically onboard into employee master
        hrmStore.addEmployee({
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          role: candidate.jobTitle,
          systemRole: 'Employee',
          department: 'Information Technology',
          deptCode: 'IT',
          branch: 'Hyderabad',
          branchId: 'HYD',
          basicSalary: 55000,
          joiningDate: new Date().toISOString().split('T')[0]
        }, currentUser.id, currentUser.name);

        showToast(`Congratulations! ${candidate.name} has been hired and added to Employee Directory.`);
      } catch (err) {
        alert(`Hiring failed: ${err.message}`);
      }
    }
  };

  const stages = ['Screening', 'Technical Round 2', 'HR Discussion', 'Offer Stage', 'Hired'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700 uppercase">
                Talent Acquisition
              </span>
              <span className="text-xs text-slate-500">• {storeData.recruitmentJobs.length} Open Positions</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Recruitment & Applicant Tracking</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Candidate pipeline, interview progression, offer release, and seamless transition to employee master.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddJobModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Opening</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'pipeline' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Candidate Hiring Pipeline ({storeData.candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'openings' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Job Openings ({storeData.recruitmentJobs.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Pipeline Kanban Board */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {stages.map((st) => {
              const stageCandidates = storeData.candidates.filter(c => c.stage === st);
              return (
                <div key={st} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 min-w-[240px] flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-800 truncate">{st}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="mt-3 space-y-3 flex-1">
                    {stageCandidates.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-6">No applicants in this stage</p>
                    ) : (
                      stageCandidates.map((cand) => (
                        <div key={cand.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{cand.name}</span>
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {cand.rating}
                            </span>
                          </div>

                          <p className="text-[11px] font-medium text-brand-600">{cand.jobTitle}</p>
                          <p className="text-[10px] text-slate-500">{cand.experience} Exp • Applied {cand.appliedDate}</p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            {st !== 'Hired' ? (
                              <button
                                onClick={() => {
                                  const curIdx = stages.indexOf(st);
                                  if (curIdx < stages.length - 1) {
                                    handleMoveStage(cand.id, stages[curIdx + 1]);
                                  }
                                }}
                                className="text-[10px] font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                              >
                                <span>Advance &rarr;</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600">✓ Onboarded</span>
                            )}

                            {st === 'Offer Stage' && (
                              <button
                                onClick={() => handleHireAndOnboard(cand)}
                                className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                              >
                                Finalize Hire
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Job Openings List */}
      {activeTab === 'openings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeData.recruitmentJobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-bold text-purple-700">
                  {job.department}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.branch}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Experience: {job.experience} • Type: {job.type} • Vacancies: <strong>{job.vacancies}</strong>
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Total Applicants: <strong>{job.applicantsCount}</strong>
                </span>
                <span className="font-semibold text-purple-600">
                  Status: {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Post New Career Opening</h3>
              <button onClick={() => setShowAddJobModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddJobSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer (Node.js/Go)"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newJobData.department}
                    onChange={(e) => setNewJobData({ ...newJobData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-purple-500 outline-none"
                  >
                    {storeData.departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Hub</label>
                  <select
                    value={newJobData.branchId}
                    onChange={(e) => {
                      const b = storeData.branches.find(br => br.id === e.target.value);
                      setNewJobData({
                        ...newJobData,
                        branchId: e.target.value,
                        branch: b ? b.name : 'Hyderabad'
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-purple-500 outline-none"
                  >
                    {storeData.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={newJobData.experience}
                    onChange={(e) => setNewJobData({ ...newJobData, experience: e.target.value })}
                    placeholder="e.g. 3-6 Years"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    value={newJobData.vacancies}
                    onChange={(e) => setNewJobData({ ...newJobData, vacancies: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruitmentManagement;

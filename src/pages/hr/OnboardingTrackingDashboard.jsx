import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Check, 
  X, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Mail,
  RefreshCw,
  Sliders,
  PenTool
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export function OnboardingTrackingDashboard() {
  const { storeData, hrmStore, currentUser } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseForReview, setSelectedCaseForReview] = useState(null);
  const [verificationRemarks, setVerificationRemarks] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cases = storeData.onboardingCases || [];

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const name = c.personal?.fullName || c.candidateInfo?.name || '';
    const role = c.employment?.designation || c.candidateInfo?.jobTitle || '';
    const email = c.personal?.personalEmail || c.candidateInfo?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Document Verification Action (Approve / Reject)
  const handleVerifyDoc = (caseId, docKey, status) => {
    const remarks = verificationRemarks[`${caseId}_${docKey}`] || '';
    try {
      hrmStore.verifyOnboardingDocument(caseId, docKey, status, remarks, currentUser.name, currentUser.id);
      showToast(`Document ${docKey} marked as ${status}!`);

      // Update local modal state
      if (selectedCaseForReview && selectedCaseForReview.id === caseId) {
        const updated = hrmStore.getOnboardingCaseById(caseId);
        setSelectedCaseForReview(JSON.parse(JSON.stringify(updated)));
      }
    } catch (err) {
      showToast(`Verification failed: ${err.message}`, 'error');
    }
  };

  // Final Employee Activation Action
  const handleCompleteAndActivate = (caseId) => {
    const obCase = cases.find(c => c.id === caseId);
    if (!obCase) return;

    if (confirm(`Confirm onboarding completion for ${obCase.personal?.fullName}? This will activate the employee record in Employee Management and Employee 360 with ID ${obCase.employment?.employeeId}.`)) {
      setIsProcessing(true);
      try {
        const result = hrmStore.completeOnboardingAndCreateEmployee(caseId, currentUser.name, currentUser.id);
        showToast(`🎉 Success! ${result.employee.name} (${result.employee.employeeId}) is now active in Employee Master & Directory!`);
        setSelectedCaseForReview(null);
      } catch (err) {
        showToast(`Activation failed: ${err.message}`, 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Resend Email Invitation
  const handleResendEmail = (caseId) => {
    try {
      const obCase = cases.find(c => c.id === caseId);
      hrmStore.sendOnboardingInvitation(caseId, {
        recipient: obCase.personal?.personalEmail || obCase.candidateInfo?.email
      }, currentUser.name, currentUser.id);
      showToast(`Resent onboarding invitation email to ${obCase.personal?.personalEmail}!`);
    } catch (err) {
      showToast(`Failed to resend: ${err.message}`, 'error');
    }
  };

  // Pipeline Metrics
  const draftCount = cases.filter(c => c.status === 'Draft').length;
  const invitedCount = cases.filter(c => c.status === 'Invitation Sent' || c.status === 'Pending Employee Action').length;
  const submittedCount = cases.filter(c => c.status === 'Documents Submitted' || c.status === 'Pending HR Verification').length;
  const verifiedCount = cases.filter(c => c.status === 'Verification Completed').length;
  const completedCount = cases.filter(c => c.status === 'Onboarding Completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold ${
          toastMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/hr/recruitment" className="hover:text-white transition">Recruitment & Applicant Tracking</Link>
            <span>&bull;</span>
            <span className="text-purple-400 font-bold uppercase tracking-wider">Candidate Onboarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-brand-400" />
            HR Onboarding Tracking Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitor employee onboarding progress, verify statutory PF/ESIC forms, review submitted proofs, and activate verified candidates into Employee 360.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/hr/onboarding"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
          >
            <span>New Employee Onboarding Form</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 5 Status Pipeline Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Draft' ? 'ALL' : 'Draft')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Draft' ? 'bg-slate-800 text-white border-slate-700 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">Drafts</span>
          <span className="text-2xl font-black">{draftCount}</span>
          <span className="text-[10px] opacity-60 block mt-0.5">Being prepared by HR</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Invitation Sent' ? 'ALL' : 'Invitation Sent')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Invitation Sent' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">Invitations Sent</span>
          <span className="text-2xl font-black">{invitedCount}</span>
          <span className="text-[10px] opacity-60 block mt-0.5">Awaiting candidate action</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Documents Submitted' ? 'ALL' : 'Documents Submitted')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Documents Submitted' ? 'bg-amber-600 text-white border-amber-500 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">Docs Submitted</span>
          <span className="text-2xl font-black text-amber-600">{submittedCount}</span>
          <span className="text-[10px] opacity-60 block mt-0.5">Pending HR verification</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Verification Completed' ? 'ALL' : 'Verification Completed')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Verification Completed' ? 'bg-purple-600 text-white border-purple-500 shadow-md' : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">Verified</span>
          <span className="text-2xl font-black text-purple-600">{verifiedCount}</span>
          <span className="text-[10px] opacity-60 block mt-0.5">Ready for final activation</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Onboarding Completed' ? 'ALL' : 'Onboarding Completed')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Onboarding Completed' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">Completed</span>
          <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
          <span className="text-[10px] opacity-60 block mt-0.5">Active in Employee 360</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by candidate name, role, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800"
          >
            <option value="ALL">All Statuses ({cases.length})</option>
            <option value="Draft">Draft</option>
            <option value="Invitation Sent">Invitation Sent</option>
            <option value="Documents Submitted">Documents Submitted</option>
            <option value="Verification Completed">Verification Completed</option>
            <option value="Onboarding Completed">Onboarding Completed</option>
          </select>
        </div>
      </div>

      {/* Onboarding Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12 p-6 text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No onboarding cases match your current filter.</p>
            <p>Select a candidate from the Recruitment module or click "New Employee Onboarding Form" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Candidate & Role</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Date of Joining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Signature</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCases.map((c) => {
                  const uploadedDocsCount = Object.values(c.documents || {}).filter(d => d.uploaded).length;
                  const verifiedDocsCount = Object.values(c.documents || {}).filter(d => d.verified).length;
                  const totalDocs = Object.keys(c.documents || {}).length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      {/* Candidate & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.personal?.photograph || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{c.personal?.fullName || c.candidateInfo?.name}</div>
                            <div className="text-[11px] text-slate-500">{c.employment?.designation} • {c.employment?.department}</div>
                            <div className="text-[10px] text-slate-400">{c.personal?.personalEmail || c.candidateInfo?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {c.employment?.employeeId || '-'}
                      </td>

                      {/* Date of Joining */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.employment?.dateOfJoining || '-'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">{c.employment?.workLocation}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status === 'Onboarding Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Verification Completed'
                            ? 'bg-purple-100 text-purple-800'
                            : c.status === 'Documents Submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'Invitation Sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Documents Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>{uploadedDocsCount}/{totalDocs} Attached</span>
                            <span className="text-emerald-600 font-bold">{verifiedDocsCount} Verified</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-600 rounded-full" 
                              style={{ width: `${(uploadedDocsCount / totalDocs) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Signature Status */}
                      <td className="py-3.5 px-4">
                        {c.signatures?.employeeSignature ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <Check className="w-3.5 h-3.5" /> Digitally Signed
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Pending</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCaseForReview(c)}
                            className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg transition"
                            title="Verify and review documents"
                          >
                            Review & Verify
                          </button>

                          <Link
                            to={`/hr/onboarding?caseId=${c.id}`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                            title="Edit full case details"
                          >
                            Edit
                          </Link>

                          {c.status !== 'Onboarding Completed' && (
                            <button
                              onClick={() => handleResendEmail(c.id)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                              title="Resend onboarding invitation"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {c.createdEmployeeId && (
                            <Link
                              to={`/hr/employees/${c.createdEmployeeId}/profile`}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Open Employee 360 profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REVIEW & VERIFICATION MODAL                                               */}
      {/* ========================================================================= */}
      {selectedCaseForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  HR Document Verification & Onboarding Approval
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Case {selectedCaseForReview.id} &bull; {selectedCaseForReview.personal?.fullName} ({selectedCaseForReview.employment?.designation})
                </p>
              </div>

              <button onClick={() => setSelectedCaseForReview(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Assignment</span>
                <div className="font-bold text-slate-900 text-xs">{selectedCaseForReview.personal?.fullName}</div>
                <div className="text-slate-600">{selectedCaseForReview.employment?.employeeId} &bull; {selectedCaseForReview.employment?.department}</div>
                <div className="text-slate-500 mt-1">DOJ: {selectedCaseForReview.employment?.dateOfJoining}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Salary / CTC Structure</span>
                <div className="font-bold text-slate-900 text-xs">Annual CTC: ₹{Number(selectedCaseForReview.salary?.annualCtc).toLocaleString('en-IN')}</div>
                <div className="text-slate-600">Net Take Home: ₹{Number(selectedCaseForReview.salary?.netSalary).toLocaleString('en-IN')}/mo</div>
                <div className="text-emerald-600 font-semibold mt-1">PF: ₹{selectedCaseForReview.salary?.employeePf} | PT: ₹{selectedCaseForReview.salary?.professionalTax}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Electronic Signature</span>
                <div className="font-bold text-slate-900 text-xs">{selectedCaseForReview.signatures?.employeeSignature || 'Pending Signature'}</div>
                <div className="text-slate-500">{selectedCaseForReview.signatures?.signedAt ? `Signed: ${new Date(selectedCaseForReview.signatures.signedAt).toLocaleDateString()}` : 'Not Signed'}</div>
                <div className="text-slate-400 mt-1">{selectedCaseForReview.signatures?.ipAddress || 'Intranet IP'}</div>
              </div>
            </div>

            {/* Document Checklist & Verification Actions */}
            <div className="space-y-3">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Submitted Documents & Statutory Verifications
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {Object.entries(selectedCaseForReview.documents || {}).map(([key, doc]) => (
                  <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.name}</span>
                        {doc.verified ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                        ) : doc.rejected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Rejected</span>
                        ) : doc.uploaded ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending Review</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Not Uploaded</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {doc.fileName ? `📄 ${doc.fileName}` : 'No file attached yet'}
                      </div>
                      {doc.remarks && (
                        <div className="text-[11px] text-amber-700 italic mt-0.5">Remark: {doc.remarks}</div>
                      )}
                    </div>

                    {/* HR Verification Controls */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add verification remark..."
                        value={verificationRemarks[`${selectedCaseForReview.id}_${key}`] || ''}
                        onChange={(e) => setVerificationRemarks({
                          ...verificationRemarks,
                          [`${selectedCaseForReview.id}_${key}`]: e.target.value
                        })}
                        className="px-2.5 py-1.5 border border-slate-300 rounded text-[11px] w-44"
                      />
                      <button
                        onClick={() => handleVerifyDoc(selectedCaseForReview.id, key, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerifyDoc(selectedCaseForReview.id, key, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded flex items-center gap-1 shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Finalize Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="text-slate-500 text-[11px]">
                Upon approval, candidate details are transferred into Employee Management & Employee 360.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCaseForReview(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>

                {selectedCaseForReview.status !== 'Onboarding Completed' && (
                  <button
                    onClick={() => handleCompleteAndActivate(selectedCaseForReview.id)}
                    disabled={isProcessing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isProcessing ? 'Activating...' : 'Approve & Activate Employee in Master'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnboardingTrackingDashboard;

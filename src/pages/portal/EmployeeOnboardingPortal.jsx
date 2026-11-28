import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Upload, 
  ShieldCheck, 
  User, 
  Building2, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Check, 
  Eye, 
  Sparkles, 
  PenTool, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { hrmStore } from '../../services/hrmDataStore';
import { populateDocumentText, DEFAULT_ONBOARDING_TEMPLATES } from '../../services/onboardingService';

export function EmployeeOnboardingPortal() {
  const { token } = useParams();

  const [onboardingCase, setOnboardingCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1); // 1: Profile, 2: Letters, 3: Statutory, 4: Documents, 5: Signature
  const [activeLetterTab, setActiveLetterTab] = useState('APPOINTMENT_LETTER');

  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Form Fields State
  const [personalData, setPersonalData] = useState({});
  const [addressData, setAddressData] = useState({});
  const [bankData, setBankData] = useState({});
  const [emergencyData, setEmergencyData] = useState({});
  const [statutoryData, setStatutoryData] = useState({});
  const [signatureType, setSignatureType] = useState('type'); // 'type' | 'draw'
  const [typedSignature, setTypedSignature] = useState('');
  const [drawnSignatureData, setDrawnSignatureData] = useState(null);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Load Case on Mount
  useEffect(() => {
    try {
      const c = hrmStore.getOnboardingCaseByToken(token);
      if (c) {
        setOnboardingCase(JSON.parse(JSON.stringify(c)));
        setPersonalData(c.personal || {});
        setAddressData(c.address || {});
        setBankData(c.bank || {});
        setEmergencyData(c.emergencyContact || {});
        setStatutoryData(c.statutoryForms || {});
        setTypedSignature(c.personal?.fullName || '');
        if (c.status === 'Documents Submitted' || c.status === 'Verification Completed' || c.status === 'Onboarding Completed') {
          setIsSubmittedSuccess(true);
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding case:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Drawing signature canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
  }, [activeStep, signatureType]);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    setDrawnSignatureData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSignatureData(null);
  };

  // Upload simulation
  const handleDocUpload = (docKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOnboardingCase(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          ...prev.documents[docKey],
          uploaded: true,
          fileName: file.name
        }
      }
    }));
    showToast(`Uploaded ${file.name} successfully!`);
  };

  // Submit Completed Onboarding Packet
  const handleSubmitPacket = () => {
    if (!declarationAgreed) {
      alert('Please check the formal declaration box to confirm your electronic submission.');
      return;
    }

    const finalSignature = signatureType === 'type' ? typedSignature : (drawnSignatureData || 'Digitally Signed by Employee');
    if (!finalSignature || !finalSignature.trim()) {
      alert('Please provide your electronic signature before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      hrmStore.submitEmployeeOnboarding(token, {
        personal: personalData,
        address: addressData,
        bank: bankData,
        emergencyContact: emergencyData,
        statutoryForms: statutoryData,
        documents: onboardingCase.documents,
        signature: finalSignature
      });

      setIsSubmittedSuccess(true);
      showToast('Onboarding packet submitted successfully to HR!');
    } catch (err) {
      showToast(`Submission failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-sm font-semibold flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying secure onboarding link...</span>
        </div>
      </div>
    );
  }

  if (!onboardingCase) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Invalid or Expired Onboarding Link</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The onboarding invitation link you used is either invalid or has expired. Please contact the Prashanth Enterprises People Operations team for an updated link.
          </p>
          <div className="pt-2">
            <a
              href="mailto:hr@prashanthenterprises.in"
              className="inline-block px-4 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              Contact HR Operations
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Current rendered letter for Step 2
  const letterTemplate = DEFAULT_ONBOARDING_TEMPLATES.find(t => t.code === activeLetterTab) || DEFAULT_ONBOARDING_TEMPLATES[0];
  const renderedLetter = populateDocumentText(letterTemplate.templateText, onboardingCase);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 font-sans pb-16">
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

      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 font-black flex items-center justify-center text-white text-sm shadow-md">
              PE
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight">PRASHANTH ENTERPRISES</h1>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Employee Self-Service Onboarding Portal</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-white block">{onboardingCase.personal?.fullName}</span>
            <span className="text-[11px] text-brand-400">{onboardingCase.employment?.designation}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
            <Sparkles className="w-4 h-4" /> Official Joining & Onboarding Kit
          </div>
          <h2 className="text-2xl font-black">
            Welcome to Prashanth Enterprises, {onboardingCase.personal?.fullName.split(' ')[0]}! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Please complete your profile details, review your formal appointment letters and agreements, complete statutory declarations, and submit your verified onboarding packet.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
          {[
            { step: 1, label: '1. Profile Verification' },
            { step: 2, label: '2. Review Letters & NDA' },
            { step: 3, label: '3. Statutory Forms' },
            { step: 4, label: '4. Upload Documents' },
            { step: 5, label: '5. Sign & Submit' }
          ].map(s => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStep === s.step
                  ? 'bg-brand-600 text-white shadow-xs'
                  : activeStep > s.step
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>{s.label}</span>
              {activeStep > s.step && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>

        {/* =================================================================== */}
        {/* SUCCESS CONFIRMATION STATE                                          */}
        {/* =================================================================== */}
        {isSubmittedSuccess ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-md text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Onboarding Packet Submitted Successfully!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, {onboardingCase.personal?.fullName}! Your onboarding declarations, signed letters, and uploaded documents have been received by the Prashanth Enterprises People Operations team for final verification.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-xs text-left space-y-1">
              <div><strong>Status:</strong> {onboardingCase.status}</div>
              <div><strong>Employee ID:</strong> {onboardingCase.employment?.employeeId}</div>
              <div><strong>Date of Joining:</strong> {onboardingCase.employment?.dateOfJoining}</div>
              <div><strong>Work Location:</strong> {onboardingCase.employment?.workLocation}</div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {/* STEP 1: PROFILE DETAILS */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-600" />
                    Step 1: Verify Personal & Banking Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please check and update your contact and bank details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={personalData.fullName || ''}
                      onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={personalData.dob || ''}
                      onChange={(e) => setPersonalData({ ...personalData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={personalData.mobile || ''}
                      onChange={(e) => setPersonalData({ ...personalData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Personal Email</label>
                    <input
                      type="email"
                      value={personalData.personalEmail || ''}
                      onChange={(e) => setPersonalData({ ...personalData, personalEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Current Residential Address</label>
                    <textarea
                      rows={2}
                      value={addressData.currentAddress || ''}
                      onChange={(e) => setAddressData({ ...addressData, currentAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankData.bankName || 'HDFC Bank Ltd'}
                      onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankData.accountNumber || ''}
                      onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={bankData.ifscCode || ''}
                      onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={emergencyData.name || ''}
                      onChange={(e) => setEmergencyData({ ...emergencyData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed to Step 2: Review Letters &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REVIEW LETTERS & NDA */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-600" />
                      Step 2: Review Employment Letters & Agreements
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Carefully review each agreement before electronic sign-off.</p>
                  </div>

                  {/* Letter Subtabs */}
                  <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl">
                    {[
                      { code: 'APPOINTMENT_LETTER', label: 'Appointment' },
                      { code: 'NDA', label: 'NDA Covenant' },
                      { code: 'CODE_OF_CONDUCT', label: 'Code of Conduct' },
                      { code: 'ASSET_ALLOCATION', label: 'Assets' }
                    ].map(l => (
                      <button
                        key={l.code}
                        onClick={() => setActiveLetterTab(l.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeLetterTab === l.code ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Content */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl font-serif text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {renderedLetter}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setActiveStep(1)} className="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl text-slate-700">
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed to Step 3: Statutory Forms &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: STATUTORY FORMS */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-600" />
                    Step 3: Statutory Forms & Background Check Consent
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Government prescribed EPF Form 11, Form 2 nomination, and BGV authorization.</p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* PF Form 11 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">1. Employees' Provident Fund (EPF Form 11 Declaration)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1">Previous Universal Account Number (UAN), if any</label>
                        <input
                          type="text"
                          placeholder="12-digit UAN or leave blank if fresh graduate"
                          value={statutoryData.pfForm11?.prevUan || ''}
                          onChange={(e) => setStatutoryData({
                            ...statutoryData,
                            pfForm11: { ...statutoryData.pfForm11, prevUan: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Previous PF Account Number</label>
                        <input
                          type="text"
                          placeholder="e.g. MH/BAN/0012938/000/000000"
                          value={statutoryData.pfForm11?.prevPfNumber || ''}
                          onChange={(e) => setStatutoryData({
                            ...statutoryData,
                            pfForm11: { ...statutoryData.pfForm11, prevPfNumber: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PF Form 2 */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">2. EPF & EPS Nomination (Form 2)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1">Nominee Full Name</label>
                        <input
                          type="text"
                          value={statutoryData.pfForm2?.nomineeName || ''}
                          onChange={(e) => setStatutoryData({
                            ...statutoryData,
                            pfForm2: { ...statutoryData.pfForm2, nomineeName: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Relationship</label>
                        <input
                          type="text"
                          value={statutoryData.pfForm2?.nomineeRelation || 'Parent / Spouse'}
                          onChange={(e) => setStatutoryData({
                            ...statutoryData,
                            pfForm2: { ...statutoryData.pfForm2, nomineeRelation: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Share Percentage (%)</label>
                        <input
                          type="text"
                          value={statutoryData.pfForm2?.nomineeShare || '100%'}
                          onChange={(e) => setStatutoryData({
                            ...statutoryData,
                            pfForm2: { ...statutoryData.pfForm2, nomineeShare: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BGV Consent */}
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <div className="font-bold text-blue-950">3. Background Verification (BGV) Authorization</div>
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      I hereby authorize Prashanth Enterprises to verify my previous employment tenures, academic degrees, and address history through third-party background screening agencies.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-blue-950">
                      <input
                        type="checkbox"
                        checked={statutoryData.bgvConsent?.signed || true}
                        onChange={(e) => setStatutoryData({
                          ...statutoryData,
                          bgvConsent: { ...statutoryData.bgvConsent, signed: e.target.checked }
                        })}
                        className="rounded text-brand-600"
                      />
                      <span>I provide full authorization for background verification</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setActiveStep(2)} className="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl text-slate-700">
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed to Step 4: Upload Documents &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: UPLOAD DOCUMENTS */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-brand-600" />
                    Step 4: Upload Mandatory Identification & Academic Proofs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please upload clear scanned copies in PDF or JPG format.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(onboardingCase.documents || {}).map(([key, doc]) => (
                    <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                        {doc.uploaded ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Attached
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Required
                          </span>
                        )}
                      </div>

                      {doc.fileName && (
                        <div className="text-[11px] font-mono text-slate-600 truncate bg-white p-1.5 rounded border border-slate-200">
                          📄 {doc.fileName}
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="cursor-pointer text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{doc.uploaded ? 'Replace Document' : 'Upload File'}</span>
                          <input type="file" onChange={(e) => handleDocUpload(key, e)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setActiveStep(3)} className="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl text-slate-700">
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed to Step 5: Sign & Submit &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SIGN & SUBMIT */}
            {activeStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-brand-600" />
                    Step 5: Electronic Signature & Formal Submission
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Legally binding electronic signature under the Information Technology Act, 2000.</p>
                </div>

                <div className="space-y-4">
                  {/* Signature Type Switcher */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSignatureType('type')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        signatureType === 'type' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Type Full Legal Name
                    </button>
                    <button
                      onClick={() => setSignatureType('draw')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        signatureType === 'draw' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Draw Digital Signature
                    </button>
                  </div>

                  {signatureType === 'type' ? (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name (Electronic Signature)</label>
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-serif italic text-brand-950 focus:ring-2 focus:ring-brand-500"
                        placeholder="e.g. Tanvi Suresh Joshi"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Draw Signature on Screen</label>
                        <button onClick={clearCanvas} className="text-xs text-rose-600 font-semibold hover:underline">
                          Clear Canvas
                        </button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="border border-slate-300 rounded-xl bg-white w-full cursor-crosshair shadow-inner"
                      />
                    </div>
                  )}

                  {/* Declaration Checkbox */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAgreed}
                        onChange={(e) => setDeclarationAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-brand-600"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed font-medium">
                        I hereby affirm that all personal, address, educational, and employment information provided by me is genuine, complete, and accurate. I have read, understood, and accept the terms of the Appointment Letter, NDA, Code of Conduct, and BGV authorization.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button onClick={() => setActiveStep(4)} className="px-4 py-2 border border-slate-300 text-xs font-bold rounded-xl text-slate-700">
                    &larr; Back
                  </button>
                  <button
                    onClick={handleSubmitPacket}
                    disabled={isSubmitting || !declarationAgreed}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Complete Onboarding Packet'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default EmployeeOnboardingPortal;

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  FileText, 
  Sliders, 
  Send, 
  Save, 
  Eye, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Briefcase, 
  CreditCard, 
  FileCheck, 
  Layers, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  User,
  Sparkles,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  calculateSalaryBreakup, 
  DEFAULT_ONBOARDING_TEMPLATES, 
  populateDocumentText, 
  generateOnboardingEmailHtml 
} from '../../services/onboardingService';

export function NewEmployeeOnboarding() {
  const { storeData, hrmStore, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const candidateIdParam = searchParams.get('candidateId');
  const caseIdParam = searchParams.get('caseId');

  // Navigation Tabs: 'form' | 'letters' | 'templates' | 'preview'
  const [activeTab, setActiveTab] = useState('form');
  const [activeFormSection, setActiveFormSection] = useState('personal'); // 'personal'|'address'|'employment'|'salary'|'bank'|'emergency'|'education'|'experience'|'documents'
  const [selectedDocForPreview, setSelectedDocForPreview] = useState('APPOINTMENT_LETTER');

  const [toastMessage, setToastMessage] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFullReviewModal, setShowFullReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template Management state
  const [templateList, setTemplateList] = useState(storeData.onboardingTemplates || DEFAULT_ONBOARDING_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Load or initialize Case Data
  const existingCases = storeData.onboardingCases || [];
  let initialCase = null;

  if (caseIdParam) {
    initialCase = existingCases.find(c => c.id === caseIdParam);
  } else if (candidateIdParam) {
    initialCase = existingCases.find(c => c.candidateId === candidateIdParam);
  }

  // Fallback to first existing case or draft
  if (!initialCase && existingCases.length > 0) {
    initialCase = existingCases[0];
  }

  const [onboardingCase, setOnboardingCase] = useState(() => {
    if (initialCase) return JSON.parse(JSON.stringify(initialCase));
    // Default Fallback
    return {
      id: `ONB-${Date.now()}`,
      token: `onb-tok-${Date.now().toString(36)}`,
      candidateId: candidateIdParam || 'CAN-NEW',
      status: 'Draft',
      candidateInfo: {
        name: 'Selected Candidate',
        email: 'candidate@example.com',
        phone: '+91 98480 00000',
        jobTitle: 'Software Engineer',
        experience: '3 Years',
        department: 'Information Technology',
        branch: 'Hyderabad'
      },
      personal: {
        fullName: 'Selected Candidate',
        dob: '1996-05-15',
        gender: 'Male',
        personalEmail: 'candidate@example.com',
        mobile: '+91 98480 00000',
        alternatePhone: '',
        bloodGroup: 'O+ve',
        maritalStatus: 'Single',
        photograph: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      },
      address: {
        currentAddress: 'Flat 402, Cyber Residency, Madhapur',
        permanentAddress: 'Plot 12, Tilak Road, Rajahmundry, Andhra Pradesh',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        pinCode: '500081'
      },
      employment: {
        employeeId: 'EMP-2026-011',
        dateOfJoining: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        designation: 'Software Engineer',
        department: 'Information Technology',
        deptCode: 'IT',
        employmentType: 'Full-Time Permanent',
        workLocation: 'Hyderabad Hub - Tech Floor Bay 4',
        branch: 'Hyderabad',
        branchId: 'HYD',
        reportingManager: 'Rajesh Kannan',
        reportingManagerId: 'PE003',
        employmentCategory: 'Core Engineering',
        probationPeriod: '6 Months',
        noticePeriod: '60 Days',
        workEmail: 'candidate@prashanthenterprises.in'
      },
      salary: calculateSalaryBreakup(1800000),
      bank: {
        accountHolderName: 'Selected Candidate',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '5010048291000',
        ifscCode: 'HDFC0001823',
        branchName: 'Madhapur Tech Hub Branch'
      },
      emergencyContact: {
        name: 'Emergency Contact Person',
        relationship: 'Parent / Spouse',
        phone: '+91 98480 99881',
        address: 'On Record'
      },
      education: [
        {
          id: 'EDU-1',
          qualification: 'B.Tech in Computer Science',
          institution: 'JNTU College of Engineering',
          yearOfPassing: '2019',
          percentage: '84.5%',
          certificateFile: 'BTech_Degree.pdf'
        }
      ],
      previousEmployment: [
        {
          id: 'EXP-1',
          companyName: 'Previous Tech Solutions',
          designation: 'Software Engineer',
          duration: '3.5 Years',
          ctc: 1200000,
          relievingLetter: 'Relieving_Letter.pdf',
          experienceCert: 'Experience_Cert.pdf'
        }
      ],
      documents: {
        aadhaar: { name: 'Aadhaar Card', uploaded: false, fileName: '', verified: false, remarks: '' },
        pan: { name: 'PAN Card', uploaded: false, fileName: '', verified: false, remarks: '' },
        photo: { name: 'Passport Size Photograph', uploaded: true, fileName: 'Candidate_Photo.jpg', verified: false, remarks: '' },
        education: { name: 'Educational Certificates', uploaded: false, fileName: '', verified: false, remarks: '' },
        previousEmployment: { name: 'Previous Employment Documents', uploaded: false, fileName: '', verified: false, remarks: '' },
        bankProof: { name: 'Bank Proof (Cancelled Cheque / Passbook)', uploaded: false, fileName: '', verified: false, remarks: '' },
        addressProof: { name: 'Address Proof', uploaded: false, fileName: '', verified: false, remarks: '' }
      },
      lettersConfig: {
        appointmentLetter: { enabled: true, status: 'Ready', signed: false },
        nda: { enabled: true, status: 'Ready', signed: false },
        codeOfConduct: { enabled: true, status: 'Ready', signed: false },
        assetAllocation: {
          enabled: true,
          laptopDetails: 'MacBook Pro M3 / 16GB / 512GB SSD',
          laptopSerial: 'C02XYZ12345M',
          charger: '70W USB-C Power Adapter',
          idCard: 'PE-ID-2026-011',
          accessCard: 'HID-RFID-8921',
          companyPhone: 'N/A',
          issueDate: new Date().toISOString().split('T')[0],
          signed: false
        },
        joiningReport: { enabled: true, signed: false },
        serviceBond: { enabled: false, bondPeriod: '2 Years', bondAmount: 200000, signed: false },
        ipAssignment: { enabled: true, signed: false }
      },
      statutoryForms: {
        pfForm11: { enabled: true, prevUan: '', prevPfNumber: '', signed: false },
        pfForm2: { enabled: true, nomineeName: '', nomineeRelation: '', nomineeShare: '100%', signed: false },
        esicForm: { enabled: false, eligible: false, reason: 'Gross wages exceed ₹21,000 threshold', signed: false },
        bgvConsent: { enabled: true, signed: false }
      },
      emailTracking: {
        sentAt: null,
        sentTo: 'candidate@example.com',
        emailSubject: 'Welcome to Prashanth Enterprises – Complete Your Onboarding',
        status: 'Draft'
      },
      signatures: {
        employeeSignature: null,
        signedAt: null,
        ipAddress: null,
        hrSignature: `${currentUser?.name || 'Niharika'} (${currentUser?.role || 'HR Admin'})`,
        hrSignedAt: new Date().toISOString()
      },
      timeline: []
    };
  });

  // Sync if candidateIdParam changes
  useEffect(() => {
    if (candidateIdParam && (!onboardingCase || onboardingCase.candidateId !== candidateIdParam)) {
      try {
        const c = hrmStore.createOrGetOnboardingCase(candidateIdParam, currentUser.name, currentUser.id);
        setOnboardingCase(JSON.parse(JSON.stringify(c)));
      } catch (err) {
        console.warn('Could not auto-create case:', err);
      }
    }
  }, [candidateIdParam]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Live recalculate salary breakup when Annual CTC changes
  const handleCtcChange = (annualCtc) => {
    const val = Number(annualCtc) || 0;
    const breakup = calculateSalaryBreakup(val);
    setOnboardingCase(prev => ({
      ...prev,
      salary: breakup,
      statutoryForms: {
        ...prev.statutoryForms,
        esicForm: {
          ...prev.statutoryForms?.esicForm,
          enabled: breakup.esiApplicable,
          eligible: breakup.esiApplicable,
          reason: breakup.esiApplicable ? 'Statutory ESIC Applicable' : 'Monthly gross wages exceed ₹21,000 threshold'
        }
      }
    }));
  };

  // Save as Draft
  const handleSaveDraft = () => {
    try {
      hrmStore.saveOnboardingDraft(onboardingCase, currentUser.name, currentUser.id);
      showToast('Onboarding details saved as Draft successfully!');
    } catch (err) {
      showToast(`Error saving draft: ${err.message}`, 'error');
    }
  };

  // Send Onboarding Email Action
  const handleSendOnboardingEmail = () => {
    setIsSubmitting(true);
    try {
      const recipient = onboardingCase.personal?.personalEmail || onboardingCase.candidateInfo?.email;
      if (!recipient) {
        alert('Please specify a valid candidate email address in Personal Information.');
        setIsSubmitting(false);
        return;
      }

      hrmStore.sendOnboardingInvitation(onboardingCase.id, {
        recipient,
        subject: 'Welcome to Prashanth Enterprises – Complete Your Onboarding'
      }, currentUser.name, currentUser.id);

      setOnboardingCase(prev => ({
        ...prev,
        status: 'Invitation Sent',
        emailTracking: {
          sentAt: new Date().toISOString(),
          sentTo: recipient,
          emailSubject: 'Welcome to Prashanth Enterprises – Complete Your Onboarding',
          status: 'Sent'
        }
      }));

      showToast(`Onboarding invitation and secure portal link dispatched to ${recipient}!`);
      setShowEmailModal(false);
    } catch (err) {
      showToast(`Failed to send invitation: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload Document Simulation (Reads file name & sets uploaded flag)
  const handleFileUpload = (docKey, e) => {
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
    showToast(`Uploaded ${file.name} for ${prev => prev.documents[docKey].name}`);
  };

  // Render printable text of currently selected document
  const currentDocTemplate = templateList.find(t => t.code === selectedDocForPreview) || templateList[0];
  const renderedDocumentText = populateDocumentText(currentDocTemplate?.templateText || '', onboardingCase);

  const portalLink = `${window.location.origin}/onboarding/${onboardingCase.token}`;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-slide-up ${
          toastMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/hr/recruitment" className="hover:text-white flex items-center gap-1 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Recruitment & Pipeline
            </Link>
            <span>•</span>
            <span className="text-purple-400 font-bold uppercase tracking-wider">Candidate Onboarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-brand-400" />
            New Employee Onboarding
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Candidate verification, legal appointment letters, NDA covenants, statutory PF/ESIC forms, and seamless integration into Employee 360.
          </p>
        </div>

        {/* Status Pill & Case Selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Onboarding Status</div>
            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              onboardingCase.status === 'Onboarding Completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : onboardingCase.status === 'Invitation Sent'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : onboardingCase.status === 'Documents Submitted'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-700 text-slate-200'
            }`}>
              {onboardingCase.status}
            </span>
          </div>

          <Link
            to="/hr/onboarding-tracker"
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span>Tracker ({existingCases.length})</span>
          </Link>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-xl shadow-xs overflow-x-auto">
        {[
          { id: 'form', label: '1. Employee Information', icon: User },
          { id: 'letters', label: '2. Letters & Agreements', icon: FileCheck },
          { id: 'templates', label: '3. Template Management', icon: Sliders },
          { id: 'preview', label: '4. Document Preview & PDF', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYEE INFORMATION FORM (SECTIONS A TO I)                        */}
      {/* ========================================================================= */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Left Section Nav (3 cols) */}
          <div className="lg:col-span-3 space-y-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs h-fit">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Form Sections
            </div>
            {[
              { id: 'personal', label: 'A. Personal Information' },
              { id: 'address', label: 'B. Address Information' },
              { id: 'employment', label: 'C. Employment Details' },
              { id: 'salary', label: 'D. Salary & CTC Breakup' },
              { id: 'bank', label: 'E. Bank Account Details' },
              { id: 'emergency', label: 'F. Emergency Contacts' },
              { id: 'education', label: 'G. Qualifications' },
              { id: 'experience', label: 'H. Prior Experience' },
              { id: 'documents', label: 'I. Required Document Uploads' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveFormSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeFormSection === sec.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{sec.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${activeFormSection === sec.id ? 'text-white' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>

          {/* Form Right Input Container (9 cols) */}
          <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {/* Section A: Personal Information */}
            {activeFormSection === 'personal' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-600" />
                    Section A: Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Prepopulated from Recruitment candidate profile.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Employee Full Name *</label>
                    <input
                      type="text"
                      value={onboardingCase.personal?.fullName || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, fullName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      value={onboardingCase.personal?.dob || '1996-05-15'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, dob: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
                    <select
                      value={onboardingCase.personal?.gender || 'Male'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, gender: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer Not to Say">Prefer Not to Say</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Personal Email Address *</label>
                    <input
                      type="email"
                      value={onboardingCase.personal?.personalEmail || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, personalEmail: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={onboardingCase.personal?.mobile || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, mobile: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Alternate Contact Number</label>
                    <input
                      type="tel"
                      value={onboardingCase.personal?.alternatePhone || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, alternatePhone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. B+ve, O+ve"
                      value={onboardingCase.personal?.bloodGroup || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, bloodGroup: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Marital Status (Optional)</label>
                    <select
                      value={onboardingCase.personal?.maritalStatus || 'Single'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        personal: { ...onboardingCase.personal, maritalStatus: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section B: Address Information */}
            {activeFormSection === 'address' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    Section B: Address Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Permanent and current local communication addresses.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Current Residential Address *</label>
                    <textarea
                      rows={2}
                      value={onboardingCase.address?.currentAddress || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        address: { ...onboardingCase.address, currentAddress: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Permanent Residential Address *</label>
                    <textarea
                      rows={2}
                      value={onboardingCase.address?.permanentAddress || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        address: { ...onboardingCase.address, permanentAddress: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                      <input
                        type="text"
                        value={onboardingCase.address?.city || 'Hyderabad'}
                        onChange={(e) => setOnboardingCase({
                          ...onboardingCase,
                          address: { ...onboardingCase.address, city: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">State *</label>
                      <input
                        type="text"
                        value={onboardingCase.address?.state || 'Telangana'}
                        onChange={(e) => setOnboardingCase({
                          ...onboardingCase,
                          address: { ...onboardingCase.address, state: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Country *</label>
                      <input
                        type="text"
                        value={onboardingCase.address?.country || 'India'}
                        onChange={(e) => setOnboardingCase({
                          ...onboardingCase,
                          address: { ...onboardingCase.address, country: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">PIN Code *</label>
                      <input
                        type="text"
                        value={onboardingCase.address?.pinCode || '500081'}
                        onChange={(e) => setOnboardingCase({
                          ...onboardingCase,
                          address: { ...onboardingCase.address, pinCode: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section C: Employment Details */}
            {activeFormSection === 'employment' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-600" />
                    Section C: Employment Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate assignment, employee ID, and reporting hierarchy.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Employee ID <span className="text-[10px] text-emerald-600 font-semibold">(Automatically Generated)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={onboardingCase.employment?.employeeId || 'EMP-2026-011'}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date of Joining *</label>
                    <input
                      type="date"
                      value={onboardingCase.employment?.dateOfJoining || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, dateOfJoining: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                    <input
                      type="text"
                      value={onboardingCase.employment?.designation || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, designation: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Department *</label>
                    <select
                      value={onboardingCase.employment?.department || 'Information Technology'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, department: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white"
                    >
                      {storeData.departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Branch / Hub *</label>
                    <select
                      value={onboardingCase.employment?.branch || 'Hyderabad'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, branch: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white"
                    >
                      {storeData.branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name} ({b.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Reporting Manager *</label>
                    <select
                      value={onboardingCase.employment?.reportingManagerId || 'PE003'}
                      onChange={(e) => {
                        const m = storeData.employees.find(emp => emp.id === e.target.value);
                        setOnboardingCase({
                          ...onboardingCase,
                          employment: {
                            ...onboardingCase.employment,
                            reportingManagerId: e.target.value,
                            reportingManager: m ? m.name : 'Rajesh Kannan'
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white"
                    >
                      {storeData.employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Probation Period</label>
                    <input
                      type="text"
                      value={onboardingCase.employment?.probationPeriod || '6 Months'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, probationPeriod: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notice Period</label>
                    <input
                      type="text"
                      value={onboardingCase.employment?.noticePeriod || '60 Days'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, noticePeriod: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Official Work Email</label>
                    <input
                      type="email"
                      value={onboardingCase.employment?.workEmail || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        employment: { ...onboardingCase.employment, workEmail: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Salary & Compensation Details */}
            {activeFormSection === 'salary' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Section D: Salary & Compensation Details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Statutory Indian payroll structure (Basic 40%, HRA 20%, PF 12%, ESI threshold check).
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-emerald-900 block mb-1">
                        Enter Annual Cost To Company (Annual CTC in INR) *
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={onboardingCase.salary?.annualCtc || 1800000}
                        onChange={(e) => handleCtcChange(e.target.value)}
                        className="w-64 px-3 py-2 border border-emerald-400 bg-white rounded-lg text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-800 uppercase block">Monthly Take-Home (Net)</span>
                      <span className="text-2xl font-black text-emerald-700 font-mono">
                        ₹{Number(onboardingCase.salary?.netSalary || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salary Breakup Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Monthly Gross</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">₹{Number(onboardingCase.salary?.monthlyGross || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Basic Salary (40%)</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">₹{Number(onboardingCase.salary?.basicSalary || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">HRA (20%)</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">₹{Number(onboardingCase.salary?.hra || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Special Allowance</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">₹{Number(onboardingCase.salary?.specialAllowance || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Employee PF (12%)</span>
                    <span className="font-bold text-rose-600 text-sm font-mono">-₹{Number(onboardingCase.salary?.employeePf || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Employer PF Contribution</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">₹{Number(onboardingCase.salary?.employerPf || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">ESIC (0.75%)</span>
                    <span className="font-bold text-slate-700 text-sm font-mono">
                      {onboardingCase.salary?.esiApplicable ? `₹${onboardingCase.salary.esiEmployee}` : 'Not Applicable (>₹21k)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Professional Tax (PT)</span>
                    <span className="font-bold text-rose-600 text-sm font-mono">-₹{onboardingCase.salary?.professionalTax || 200}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section E: Bank Account Details */}
            {activeFormSection === 'bank' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    Section E: Bank Account Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate salary account for automated monthly NEFT/RTGS disbursals.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Full Name *</label>
                    <input
                      type="text"
                      value={onboardingCase.bank?.accountHolderName || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        bank: { ...onboardingCase.bank, accountHolderName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name *</label>
                    <input
                      type="text"
                      value={onboardingCase.bank?.bankName || 'HDFC Bank Ltd'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        bank: { ...onboardingCase.bank, bankName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={onboardingCase.bank?.accountNumber || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        bank: { ...onboardingCase.bank, accountNumber: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      value={onboardingCase.bank?.ifscCode || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        bank: { ...onboardingCase.bank, ifscCode: e.target.value.toUpperCase() }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={onboardingCase.bank?.branchName || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        bank: { ...onboardingCase.bank, branchName: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section F: Emergency Contacts */}
            {activeFormSection === 'emergency' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-brand-600" />
                    Section F: Emergency Contact Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Primary emergency notification contact.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      value={onboardingCase.emergencyContact?.name || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        emergencyContact: { ...onboardingCase.emergencyContact, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Relationship *</label>
                    <input
                      type="text"
                      value={onboardingCase.emergencyContact?.relationship || 'Parent / Spouse'}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        emergencyContact: { ...onboardingCase.emergencyContact, relationship: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      value={onboardingCase.emergencyContact?.phone || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        emergencyContact: { ...onboardingCase.emergencyContact, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Address</label>
                    <input
                      type="text"
                      value={onboardingCase.emergencyContact?.address || ''}
                      onChange={(e) => setOnboardingCase({
                        ...onboardingCase,
                        emergencyContact: { ...onboardingCase.emergencyContact, address: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section G: Educational Qualifications */}
            {activeFormSection === 'education' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-600" />
                      Section G: Educational Qualifications
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Degrees, universities, passing years, and grades.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newEdu = {
                        id: `EDU-${Date.now()}`,
                        qualification: 'Master of Technology (M.Tech)',
                        institution: 'University / Institute',
                        yearOfPassing: '2021',
                        percentage: '82%',
                        certificateFile: ''
                      };
                      setOnboardingCase(prev => ({ ...prev, education: [...(prev.education || []), newEdu] }));
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Qualification
                  </button>
                </div>

                <div className="space-y-3">
                  {(onboardingCase.education || []).map((edu, idx) => (
                    <div key={edu.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Degree / Course</label>
                        <input
                          type="text"
                          value={edu.qualification}
                          onChange={(e) => {
                            const updated = [...onboardingCase.education];
                            updated[idx].qualification = e.target.value;
                            setOnboardingCase({ ...onboardingCase, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Year of Passing</label>
                        <input
                          type="text"
                          value={edu.yearOfPassing}
                          onChange={(e) => {
                            const updated = [...onboardingCase.education];
                            updated[idx].yearOfPassing = e.target.value;
                            setOnboardingCase({ ...onboardingCase, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Percentage / GPA</label>
                        <input
                          type="text"
                          value={edu.percentage}
                          onChange={(e) => {
                            const updated = [...onboardingCase.education];
                            updated[idx].percentage = e.target.value;
                            setOnboardingCase({ ...onboardingCase, education: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section H: Previous Employment Details */}
            {activeFormSection === 'experience' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-brand-600" />
                      Section H: Previous Employment History
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Prior company names, designations, durations, and CTC.</p>
                  </div>
                  <button
                    onClick={() => {
                      const newExp = {
                        id: `EXP-${Date.now()}`,
                        companyName: 'Previous Company',
                        designation: 'Software Developer',
                        duration: '2 Years',
                        ctc: 900000,
                        relievingLetter: '',
                        experienceCert: ''
                      };
                      setOnboardingCase(prev => ({ ...prev, previousEmployment: [...(prev.previousEmployment || []), newExp] }));
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                <div className="space-y-3">
                  {(onboardingCase.previousEmployment || []).map((exp, idx) => (
                    <div key={exp.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Company Name</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => {
                            const updated = [...onboardingCase.previousEmployment];
                            updated[idx].companyName = e.target.value;
                            setOnboardingCase({ ...onboardingCase, previousEmployment: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Designation</label>
                        <input
                          type="text"
                          value={exp.designation}
                          onChange={(e) => {
                            const updated = [...onboardingCase.previousEmployment];
                            updated[idx].designation = e.target.value;
                            setOnboardingCase({ ...onboardingCase, previousEmployment: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Tenure / Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...onboardingCase.previousEmployment];
                            updated[idx].duration = e.target.value;
                            setOnboardingCase({ ...onboardingCase, previousEmployment: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section I: Required Document Uploads */}
            {activeFormSection === 'documents' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-brand-600" />
                    Section I: Required Document Uploads & Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Government proofs, academic transcripts, and banking documents for compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(onboardingCase.documents || {}).map(([key, doc]) => (
                    <div key={key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{doc.name}</span>
                        {doc.uploaded ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </div>

                      {doc.fileName && (
                        <div className="text-[11px] font-mono text-slate-600 truncate bg-white p-1.5 rounded border border-slate-200">
                          📄 {doc.fileName}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <label className="cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{doc.uploaded ? 'Replace Document' : 'Upload File'}</span>
                          <input type="file" onChange={(e) => handleFileUpload(key, e)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LETTERS & AGREEMENTS SECTION                                       */}
      {/* ========================================================================= */}
      {activeTab === 'letters' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-600" />
                Letters, Employment Agreements & Statutory Forms
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure which mandatory and optional agreements are included in the employee's onboarding package.
              </p>
            </div>

            {/* Group 1: Main Employment Letters */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                A. Main Employment Letters (Mandatory)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'appointmentLetter', code: 'APPOINTMENT_LETTER', title: '1. Appointment Letter', desc: 'Terms, probation, notice period, and full compensation structure' },
                  { key: 'nda', code: 'NDA', title: '2. Non-Disclosure Agreement (NDA)', desc: 'Company proprietary data, client protection & 3-year confidentiality' },
                  { key: 'codeOfConduct', code: 'CODE_OF_CONDUCT', title: '3. Code of Conduct & POSH Policy', desc: 'Office timings, biometric punches, IT safety & zero tolerance harassment' },
                  { key: 'assetAllocation', code: 'ASSET_ALLOCATION', title: '4. Asset Allocation & Handover Letter', desc: 'Hardware details, serial numbers, RFID access card, return terms' },
                  { key: 'joiningReport', code: 'JOINING_REPORT', title: '5. Joining Letter & Official Report', desc: 'Official joining report signed by employee and VP People Operations' }
                ].map(item => (
                  <div key={item.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      <button
                        onClick={() => {
                          setSelectedDocForPreview(item.code);
                          setActiveTab('preview');
                        }}
                        className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Populated Letter
                      </button>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Mandatory
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Role-Specific Agreements */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                B. Role-Specific Agreements (Optional by Cadre)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">6. Service Agreement / Employment Bond</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Specialized training commitment covenant and reimbursement terms.</div>
                    <button
                      onClick={() => { setSelectedDocForPreview('SERVICE_BOND'); setActiveTab('preview'); }}
                      className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Covenant
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={onboardingCase.lettersConfig?.serviceBond?.enabled || false}
                    onChange={(e) => setOnboardingCase({
                      ...onboardingCase,
                      lettersConfig: {
                        ...onboardingCase.lettersConfig,
                        serviceBond: { ...onboardingCase.lettersConfig?.serviceBond, enabled: e.target.checked }
                      }
                    })}
                    className="w-5 h-5 text-brand-600 rounded border-slate-300 mt-1"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">7. Intellectual Property (IP) Assignment</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Work-for-hire code, algorithms, and patent assignment to Prashanth Enterprises.</div>
                    <button
                      onClick={() => { setSelectedDocForPreview('IP_ASSIGNMENT'); setActiveTab('preview'); }}
                      className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Agreement
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={onboardingCase.lettersConfig?.ipAssignment?.enabled !== false}
                    onChange={(e) => setOnboardingCase({
                      ...onboardingCase,
                      lettersConfig: {
                        ...onboardingCase.lettersConfig,
                        ipAssignment: { ...onboardingCase.lettersConfig?.ipAssignment, enabled: e.target.checked }
                      }
                    })}
                    className="w-5 h-5 text-brand-600 rounded border-slate-300 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Onboarding Statutory Forms */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                C. Government Statutory Declarations & BGV Forms
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'pfForm11', code: 'PF_FORM_11', title: '8. PF Form 11 (Declaration)', desc: 'EPF Scheme 1952 Para 34/57, previous UAN and employment declaration' },
                  { key: 'pfForm2', code: 'PF_FORM_2', title: '9. PF Form 2 (Nomination)', desc: 'Statutory family nomination & EPF/EPS share allocation' },
                  { key: 'esicForm', code: 'ESIC_FORM_1', title: '10. ESIC Form 1 Declaration', desc: 'ESI Act 1948 (Statutory eligibility: Monthly Gross <= ₹21,000)' },
                  { key: 'bgvConsent', code: 'BGV_CONSENT', title: '11. Background Verification (BGV) Consent', desc: 'Authorization for academic, address, and criminal background checks' }
                ].map(item => (
                  <div key={item.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      <button
                        onClick={() => { setSelectedDocForPreview(item.code); setActiveTab('preview'); }}
                        className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Statutory Form
                      </button>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Govt Statutory
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HR TEMPLATE MANAGEMENT SECTION                                     */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                HR Template Management System
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload PDF/DOCX templates, customize placeholders, toggle mandatory agreements, and manage document categories.
              </p>
            </div>

            <button
              onClick={() => {
                const newTpl = {
                  id: `TPL-CUSTOM-${Date.now()}`,
                  category: 'EMPLOYMENT_LETTERS',
                  code: `CUSTOM_LETTER_${Date.now()}`,
                  title: 'New Custom HR Letter Template',
                  description: 'Custom corporate document',
                  isMandatory: false,
                  enabled: true,
                  version: '1.0',
                  templateText: 'COMPANY: PRASHANTH ENTERPRISES\nEmployee: {{EMPLOYEE_NAME}}\nDesignation: {{DESIGNATION}}'
                };
                setTemplateList([newTpl, ...templateList]);
                setEditingTemplate(newTpl);
              }}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Letter Template
            </button>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateList.map(tpl => (
              <div key={tpl.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {tpl.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v{tpl.version}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{tpl.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                  >
                    Edit & Preview
                  </button>
                  <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tpl.enabled !== false}
                      onChange={(e) => {
                        const updated = templateList.map(t => t.id === tpl.id ? { ...t, enabled: e.target.checked } : t);
                        setTemplateList(updated);
                        showToast(`Template ${tpl.title} ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                      }}
                      className="rounded text-brand-600"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Template Editor Drawer/Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Edit Template: {editingTemplate.title}</h3>
                  <button onClick={() => setEditingTemplate(null)} className="p-1 text-slate-400 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Template Content (Supports Placeholders)</label>
                  <textarea
                    rows={12}
                    value={editingTemplate.templateText || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, templateText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Available placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-600">{'{{EMPLOYEE_NAME}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-600">{'{{DESIGNATION}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-600">{'{{ANNUAL_CTC}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-600">{'{{JOINING_DATE}}'}</code>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg">Cancel</button>
                  <button
                    onClick={() => {
                      hrmStore.saveOnboardingTemplate(editingTemplate, currentUser.name, currentUser.id);
                      setTemplateList(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                      setEditingTemplate(null);
                      showToast('Template saved successfully!');
                    }}
                    className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOCUMENT PREVIEW & PDF DOWNLOAD                                    */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-600" />
                Live Generated Document Preview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time generated document with candidate information populated automatically.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDocForPreview}
                onChange={(e) => setSelectedDocForPreview(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-800"
              >
                {templateList.map(t => (
                  <option key={t.code} value={t.code}>{t.title}</option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Letterhead Document Preview Container */}
          <div className="border border-slate-300 rounded-xl p-8 bg-white shadow-md max-w-4xl mx-auto font-serif text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {renderedDocumentText}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM ACTION BAR (4 BUTTONS)                                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Case: <strong>{onboardingCase.id}</strong> ({onboardingCase.personal?.fullName})</span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save as Draft</span>
          </button>

          <button
            onClick={() => setShowFullReviewModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition active:scale-95"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>Preview Details</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('preview');
              showToast('Documents generated with live employee data!');
            }}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl border border-purple-200 flex items-center gap-1.5 transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Documents</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send Onboarding Email</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEND ONBOARDING EMAIL MODAL                                               */}
      {/* ========================================================================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">Send Employee Onboarding Invitation</h3>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Email Address</label>
                <input
                  type="email"
                  value={onboardingCase.personal?.personalEmail || onboardingCase.candidateInfo?.email || ''}
                  onChange={(e) => setOnboardingCase({
                    ...onboardingCase,
                    personal: { ...onboardingCase.personal, personalEmail: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Subject</label>
                <input
                  type="text"
                  defaultValue="Welcome to Prashanth Enterprises – Complete Your Onboarding"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unique Portal Access Link</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-brand-700 truncate">
                  {portalLink}
                </div>
              </div>

              {/* Live Branded Email Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  Live Branded Email Template Preview
                </div>
                <div 
                  className="p-4 max-h-56 overflow-y-auto text-xs bg-white"
                  dangerouslySetInnerHTML={{ __html: generateOnboardingEmailHtml(onboardingCase, portalLink) }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOnboardingEmail}
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Dispatching...' : 'Confirm & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW DETAILS SUMMARY MODAL                                             */}
      {/* ========================================================================= */}
      {showFullReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Onboarding Packet Summary Review</h3>
              <button onClick={() => setShowFullReviewModal(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Personal Details</span>
                <div>Name: {onboardingCase.personal?.fullName}</div>
                <div>DOB: {onboardingCase.personal?.dob}</div>
                <div>Email: {onboardingCase.personal?.personalEmail}</div>
                <div>Mobile: {onboardingCase.personal?.mobile}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Employment Assignment</span>
                <div>Employee ID: {onboardingCase.employment?.employeeId}</div>
                <div>Role: {onboardingCase.employment?.designation}</div>
                <div>Dept: {onboardingCase.employment?.department}</div>
                <div>DOJ: {onboardingCase.employment?.dateOfJoining}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Compensation</span>
                <div>Annual CTC: ₹{Number(onboardingCase.salary?.annualCtc).toLocaleString('en-IN')}</div>
                <div>Monthly Gross: ₹{Number(onboardingCase.salary?.monthlyGross).toLocaleString('en-IN')}</div>
                <div>Net Salary: ₹{Number(onboardingCase.salary?.netSalary).toLocaleString('en-IN')}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Bank Account</span>
                <div>Bank: {onboardingCase.bank?.bankName}</div>
                <div>Account: {onboardingCase.bank?.accountNumber}</div>
                <div>IFSC: {onboardingCase.bank?.ifscCode}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFullReviewModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewEmployeeOnboarding;

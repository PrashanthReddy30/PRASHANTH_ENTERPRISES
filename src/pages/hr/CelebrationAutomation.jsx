import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Cake, 
  Award, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Settings, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Heart, 
  MessageSquare, 
  Check, 
  Info, 
  Upload, 
  ShieldCheck, 
  UserCheck, 
  X,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  DEFAULT_CELEBRATION_TEMPLATES, 
  generateCelebrationPoster, 
  interpolatePlaceholders 
} from '../../services/celebrationImageGenerator';
import { 
  getNowInIST, 
  parseDateSafe, 
  calculateCompletedYears, 
  isBirthdayToday 
} from '../../services/celebrationAutomationEngine';

export function CelebrationAutomation() {
  const { storeData, currentUser, hrmStore } = useAuth();

  // Active Submenu Tab: 'dashboard' | 'welcome' | 'birthday' | 'anniversary' | 'settings' | 'published' | 'logs'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [actionToast, setActionToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Template Editor State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewEmployeeId, setPreviewEmployeeId] = useState(storeData.employees[0]?.id || 'PE001');
  const [previewPosterUrl, setPreviewPosterUrl] = useState(null);
  const canvasRef = useRef(null);

  // Date Simulation State
  const istNow = getNowInIST();
  const [simulatedDate, setSimulatedDate] = useState(istNow.dateStr);

  // Enlarged Poster Modal
  const [enlargedPoster, setEnlargedPoster] = useState(null);

  const showToast = (msg, type = 'success') => {
    setActionToast({ msg, type });
    setTimeout(() => setActionToast(null), 3800);
  };

  // Safe data access
  const employees = storeData.employees || [];
  const templates = storeData.celebrationTemplates || DEFAULT_CELEBRATION_TEMPLATES;
  const posts = storeData.employeeEngagementPosts || [];
  const settings = storeData.celebrationAutomationSettings || {
    autoPublishEnabled: true,
    scheduledTimeIST: "01:00",
    feb29BirthdayRule: "FEB_28",
    allowedCategories: { welcome: true, birthday: true, anniversary: true },
    catchUpMissedRuns: true
  };
  const logs = storeData.celebrationProcessingLogs || [];

  // Filter templates by active category
  const welcomeTemplates = templates.filter(t => t.category === 'welcome');
  const birthdayTemplates = templates.filter(t => t.category === 'birthday');
  const anniversaryTemplates = templates.filter(t => t.category === 'anniversary');

  // Selected employee for preview
  const previewEmployee = employees.find(e => e.id === previewEmployeeId) || employees[0];

  // Refresh live canvas preview whenever editingTemplate or previewEmployee changes
  useEffect(() => {
    let isCancelled = false;
    async function updatePreview() {
      if (!editingTemplate || !previewEmployee) return;
      try {
        let sampleEvent = {};
        if (editingTemplate.category === 'anniversary') {
          sampleEvent = {
            completedYears: 3,
            badgeTitle: "HAPPY WORK ANNIVERSARY! 🎖️",
            message: `Congratulations to ${previewEmployee.name} on completing 3 glorious years with Prashanth Enterprises!`
          };
        } else if (editingTemplate.category === 'birthday') {
          sampleEvent = {
            badgeTitle: "HAPPY BIRTHDAY! 🎂",
            message: `Wishing ${previewEmployee.name} a joyous birthday filled with success and happiness!`
          };
        } else {
          sampleEvent = {
            badgeTitle: "WELCOME ABOARD! 🚀",
            message: `Welcome to the Prashanth Enterprises family, ${previewEmployee.name}!`
          };
        }

        const dataUrl = await generateCelebrationPoster(editingTemplate, previewEmployee, sampleEvent);
        if (!isCancelled) {
          setPreviewPosterUrl(dataUrl);
        }
      } catch (err) {
        console.warn('Error generating live poster preview:', err);
      }
    }
    updatePreview();
    return () => { isCancelled = true; };
  }, [editingTemplate, previewEmployeeId]);

  // Compute eligible events for the simulated or current date
  const evalDateParsed = parseDateSafe(simulatedDate) || {
    year: istNow.year,
    month: istNow.month,
    day: istNow.day,
    dateStr: istNow.dateStr
  };

  const eligibleForSelectedDate = employees.filter(emp => {
    if (emp.status !== 'Active') return false;
    const joiningParsed = parseDateSafe(emp.joiningDate);
    const dobParsed = parseDateSafe(emp.dob);

    const isWelcome = settings.allowedCategories?.welcome !== false &&
      joiningParsed && joiningParsed.dateStr === evalDateParsed.dateStr;

    const isBday = settings.allowedCategories?.birthday !== false &&
      dobParsed && isBirthdayToday(dobParsed, evalDateParsed, settings.feb29BirthdayRule);

    const isAnniv = settings.allowedCategories?.anniversary !== false &&
      joiningParsed &&
      joiningParsed.month === evalDateParsed.month &&
      joiningParsed.day === evalDateParsed.day &&
      evalDateParsed.year > joiningParsed.year;

    return isWelcome || isBday || isAnniv;
  });

  // Manual Trigger: Run 01:00 AM Engine Now
  const handleRunAutomationNow = async (forceSimDate = null) => {
    setIsProcessing(true);
    try {
      const targetDate = forceSimDate || simulatedDate;
      const result = await hrmStore.triggerCelebrationSchedulerNow(targetDate, true);
      showToast(
        `Celebration Engine Executed! Published: ${result.publishedCount}, Skipped (Already Published): ${result.skippedCount}, Errors: ${result.failedCount}`,
        result.failedCount > 0 ? 'error' : 'success'
      );
    } catch (err) {
      showToast(`Automation run failed: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    try {
      hrmStore.updateCelebrationAutomationSettings(newSettings, currentUser?.name || 'HR Admin', currentUser?.id || 'HR');
      showToast('Automation settings saved successfully! 01:00 AM IST scheduler updated.');
    } catch (err) {
      showToast(`Error saving settings: ${err.message}`, 'error');
    }
  };

  // Save Template
  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    try {
      hrmStore.saveCelebrationTemplate(editingTemplate, currentUser?.name || 'HR Admin', currentUser?.id || 'HR');
      showToast(`Celebration template "${editingTemplate.name}" saved!`);
      setEditingTemplate(null);
    } catch (err) {
      showToast(`Failed to save template: ${err.message}`, 'error');
    }
  };

  // Delete Template
  const handleDeleteTemplate = (tplId, tplName) => {
    if (confirm(`Are you sure you want to delete template "${tplName}"?`)) {
      try {
        hrmStore.deleteCelebrationTemplate(tplId, currentUser?.name || 'HR Admin', currentUser?.id || 'HR');
        showToast(`Template "${tplName}" deleted.`);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Upload Custom Background Image (Data URL)
  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Background image must be under 2.5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingTemplate(prev => ({
        ...prev,
        customBgImage: event.target.result
      }));
      showToast('Custom background template uploaded!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-bounce ${
          actionToast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {actionToast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{actionToast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Employee Celebrations & Wishes Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Celebration Automation Hub
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Auto-detects New Joiners, Employee Birthdays, and Work Anniversaries. Generates personalized posters and publishes to the Employee Home Page daily at exactly 01:00 AM IST.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunAutomationNow()}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Play className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Evaluating...' : 'Run Automation Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Submenu Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 bg-white px-4 pt-3 rounded-xl shadow-sm">
        {[
          { id: 'dashboard', label: 'Automation Dashboard', icon: Sliders },
          { id: 'welcome', label: `Welcome Templates (${welcomeTemplates.length})`, icon: UserCheck },
          { id: 'birthday', label: `Birthday Templates (${birthdayTemplates.length})`, icon: Cake },
          { id: 'anniversary', label: `Work Anniversary (${anniversaryTemplates.length})`, icon: Award },
          { id: 'settings', label: 'Automation Settings', icon: Settings },
          { id: 'published', label: `Published Posts (${posts.length})`, icon: Eye },
          { id: 'logs', label: `Execution Audit Logs (${logs.length})`, icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingTemplate(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBMENU: AUTOMATION DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Engine Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xl font-bold text-slate-900">Armed & Active</div>
              <p className="text-xs text-slate-500 mt-1">Triggers automatically at 01:00 AM IST</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Eligible for {simulatedDate}</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-600">{eligibleForSelectedDate.length} Employee(s)</div>
              <p className="text-xs text-slate-500 mt-1">Ready for automated poster generation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Published on Home Feed</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900">{posts.length} Live Cards</div>
              <p className="text-xs text-slate-500 mt-1">Visible to all employees across branches</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Templates</span>
                <ImageIcon className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-600">{templates.length} Configured</div>
              <p className="text-xs text-slate-500 mt-1">Welcome, Birthday & Anniversary designs</p>
            </div>
          </div>

          {/* Date Simulation & Immediate Evaluation Console */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Date Simulation & Pre-Execution Preview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate any date to test leap-year birthdays (Feb 29), new joiners, or work anniversaries without waiting for 01:00 AM.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={simulatedDate}
                  onChange={(e) => setSimulatedDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSimulatedDate(istNow.dateStr)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Reset Today
                </button>
                <button
                  onClick={() => handleRunAutomationNow(simulatedDate)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Play className="w-3.5 h-3.5" />
                  Execute for {simulatedDate}
                </button>
              </div>
            </div>

            {/* List of Eligible Employees */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Eligible Employees on {simulatedDate} ({eligibleForSelectedDate.length})
              </div>

              {eligibleForSelectedDate.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">No celebrations scheduled for {simulatedDate}.</p>
                  <p className="text-xs text-slate-400 mt-1">Try selecting 2026-11-15 (Ananya Deshmukh welcome) or 2026-11-16 (Rajesh Kannan 4th anniversary / Kavitha Sharma birthday).</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eligibleForSelectedDate.map(emp => {
                    const joiningParsed = parseDateSafe(emp.joiningDate);
                    const dobParsed = parseDateSafe(emp.dob);
                    const isWelcome = joiningParsed?.dateStr === evalDateParsed.dateStr;
                    const isBday = dobParsed && isBirthdayToday(dobParsed, evalDateParsed, settings.feb29BirthdayRule);
                    const completedY = calculateCompletedYears(joiningParsed, evalDateParsed);
                    const isAnniv = joiningParsed && joiningParsed.month === evalDateParsed.month && joiningParsed.day === evalDateParsed.day && completedY > 0;

                    let eventType = 'Celebration';
                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    let eventDetail = '';

                    if (isWelcome) {
                      eventType = 'New Joiner Welcome';
                      badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
                      eventDetail = `Joined: ${emp.joiningDate}`;
                    } else if (isBday) {
                      eventType = 'Birthday Celebration';
                      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      eventDetail = `DOB: **-**-${dobParsed.day} (Age hidden)`;
                    } else if (isAnniv) {
                      eventType = 'Work Anniversary';
                      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                      eventDetail = `Completed: ${completedY} Year(s)`;
                    }

                    return (
                      <div key={emp.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar || emp.personal?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{emp.name}</div>
                            <div className="text-xs text-slate-500 truncate">{emp.role} • {emp.branch}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
                                {eventType}
                              </span>
                              <span className="text-[11px] text-slate-400">{eventDetail}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary of Live Home Posts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Recent Active Home Page Celebration Posts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Currently visible in the Wishes & Celebrations section of the Employee Dashboard.</p>
              </div>
              <button
                onClick={() => setActiveTab('published')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All ({posts.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.slice(0, 3).map(post => (
                <div key={post.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={post.employeeName}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">{post.employeeName}</div>
                      <div className="text-xs text-slate-500 truncate">{post.employeeRole}</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {post.badgeText || post.type}
                    </span>
                  </div>

                  {post.posterUrl && (
                    <div 
                      onClick={() => setEnlargedPoster(post)}
                      className="relative rounded-lg overflow-hidden cursor-pointer border border-slate-200 group mb-3"
                    >
                      <img src={post.posterUrl} alt="Poster" className="w-full h-32 object-cover group-hover:scale-105 transition-all" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <Eye className="w-4 h-4" /> Click to Enlarge
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-rose-600">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" /> {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <MessageSquare className="w-3.5 h-3.5" /> {post.wishesCount || post.wishes?.length || 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{post.eventDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBMENUS: WELCOME, BIRTHDAY & ANNIVERSARY TEMPLATES */}
      {/* ========================================================================= */}
      {(activeTab === 'welcome' || activeTab === 'birthday' || activeTab === 'anniversary') && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                {activeTab === 'welcome' && <UserCheck className="w-5 h-5 text-sky-600" />}
                {activeTab === 'birthday' && <Cake className="w-5 h-5 text-rose-600" />}
                {activeTab === 'anniversary' && <Award className="w-5 h-5 text-amber-600" />}
                {activeTab} Templates Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload custom background designs (PNG/JPG) and configure typography & coordinates. Posters are generated automatically using employee profile photos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const defaultTpl = templates.find(t => t.category === activeTab) || DEFAULT_CELEBRATION_TEMPLATES[0];
                  setEditingTemplate({
                    ...JSON.parse(JSON.stringify(defaultTpl)),
                    id: `tpl-${activeTab}-${Date.now()}`,
                    name: `Custom ${activeTab.toUpperCase()} Poster ${templates.length + 1}`,
                    category: activeTab,
                    isDefault: false
                  });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Template
              </button>
            </div>
          </div>

          {/* Age Privacy Banner for Birthday Tab */}
          {activeTab === 'birthday' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Strict Employee Privacy Rule:</span> In compliance with Prashanth Enterprises HR Data Protection Guidelines, employee birth years and calculated ages are strictly masked and never published to intranet posters or feeds. Only Day and Month (e.g. 16 Nov) are referenced.
              </div>
            </div>
          )}

          {/* List of Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'welcome' ? welcomeTemplates : activeTab === 'birthday' ? birthdayTemplates : anniversaryTemplates).map(tpl => (
              <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{tpl.name}</div>
                      <div className="text-[11px] text-slate-400">{tpl.category.toUpperCase()} • {tpl.width}x{tpl.height}px</div>
                    </div>
                    {tpl.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase">
                        Active Default
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">{tpl.description || 'Enterprise celebration template'}</p>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>Avatar Shape: <span className="font-semibold text-slate-700 capitalize">{tpl.photoConfig?.shape || 'Circle'}</span></div>
                      <div>Theme: <span className="font-semibold text-slate-700 capitalize">{tpl.theme || 'Corporate Blue'}</span></div>
                      <div>Custom Background: <span className="font-semibold text-slate-700">{tpl.customBgImage ? 'Uploaded (PNG/JPG)' : 'Built-in Canvas Gradient'}</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingTemplate(JSON.parse(JSON.stringify(tpl)))}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Edit & Preview
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Template Visual Editor & Canvas Preview Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-blue-600" />
                      Celebration Template Studio: {editingTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customize background, avatar position, typography, and live test with employee data.</p>
                  </div>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Controls (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Template Name</label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                      <input
                        type="text"
                        value={editingTemplate.description || ''}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Background Customization */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Background & Theme</span>
                        {editingTemplate.customBgImage && (
                          <button
                            onClick={() => setEditingTemplate({ ...editingTemplate, customBgImage: null })}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Remove Custom BG
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer py-2 px-3 bg-white border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>Upload BG (PNG/JPG)</span>
                          <input type="file" accept="image/png,image/jpeg" onChange={handleBgImageUpload} className="hidden" />
                        </label>

                        <select
                          value={editingTemplate.theme || 'blue'}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, theme: e.target.value })}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="blue">Corporate Blue</option>
                          <option value="pink">Festive Pink/Ruby</option>
                          <option value="purple">Anniversary Purple</option>
                          <option value="gold">Gold & Dark</option>
                        </select>
                      </div>
                    </div>

                    {/* Photo Box Config */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-800">Profile Photo Position & Shape</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">X Position</label>
                          <input
                            type="number"
                            value={editingTemplate.photoConfig?.x ?? 400}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              photoConfig: { ...editingTemplate.photoConfig, x: Number(e.target.value) }
                            })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">Y Position</label>
                          <input
                            type="number"
                            value={editingTemplate.photoConfig?.y ?? 175}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              photoConfig: { ...editingTemplate.photoConfig, y: Number(e.target.value) }
                            })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">Diameter / Size</label>
                          <input
                            type="number"
                            value={editingTemplate.photoConfig?.size ?? 130}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              photoConfig: { ...editingTemplate.photoConfig, size: Number(e.target.value) }
                            })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">Shape</label>
                          <select
                            value={editingTemplate.photoConfig?.shape || 'circle'}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              photoConfig: { ...editingTemplate.photoConfig, shape: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                          >
                            <option value="circle">Circular Clip</option>
                            <option value="square">Rounded Square</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Template Message / Greeting */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Message Template (Supports Placeholders)
                      </label>
                      <textarea
                        rows={3}
                        value={editingTemplate.messageConfig?.templateText || ''}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          messageConfig: { ...editingTemplate.messageConfig, templateText: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <div className="text-[11px] text-slate-400 mt-1">
                        Placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">{'{{EMPLOYEE_NAME}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">{'{{ANNIVERSARY_YEARS}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">{'{{BRANCH_NAME}}'}</code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefaultCheck"
                        checked={editingTemplate.isDefault || false}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, isDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <label htmlFor="isDefaultCheck" className="text-xs font-semibold text-slate-700">
                        Set as Active Default Template for {editingTemplate.category.toUpperCase()}
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Live Poster Rendering Preview (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-blue-600" />
                          Live Real-Time Poster Rendering (800 x 500 px)
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Preview with:</span>
                          <select
                            value={previewEmployeeId}
                            onChange={(e) => setPreviewEmployeeId(e.target.value)}
                            className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white text-slate-800"
                          >
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Canvas Container */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 flex items-center justify-center min-h-[300px]">
                        {previewPosterUrl ? (
                          <img src={previewPosterUrl} alt="Preview" className="w-full h-auto object-contain" />
                        ) : (
                          <div className="text-slate-400 text-xs flex items-center gap-2 p-8">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> Generating preview...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 mt-4">
                      <button
                        onClick={() => setEditingTemplate(null)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveTemplate}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Save Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBMENU: AUTOMATION SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Celebration Scheduler Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control the 01:00 AM IST execution behavior, leap-year birthday policies, and automatic feed publishing.
            </p>
          </div>

          <div className="divide-y divide-slate-100 space-y-4">
            {/* Auto Publish Toggle */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Automatic Daily 01:00 AM IST Evaluation</div>
                <div className="text-xs text-slate-500">Automatically inspects employee database and publishes wishes without manual intervention.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPublishEnabled !== false}
                onChange={(e) => handleSaveSettings({ ...settings, autoPublishEnabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-slate-300"
              />
            </div>

            {/* Scheduled Time IST */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Scheduled Trigger Time</div>
                <div className="text-xs text-slate-500">Fixed target execution time in Asia/Kolkata (IST) zone.</div>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold">
                01:00 AM IST
              </span>
            </div>

            {/* Leap Year Birthday Rule */}
            <div className="pt-4 space-y-2">
              <div>
                <div className="text-sm font-bold text-slate-900">February 29 Birthday Policy (Non-Leap Years)</div>
                <div className="text-xs text-slate-500">For employees born on Feb 29 (leap day), choose which date to publish their birthday post during non-leap years.</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  settings.feb29BirthdayRule !== 'MAR_01'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="feb29Rule"
                    checked={settings.feb29BirthdayRule !== 'MAR_01'}
                    onChange={() => handleSaveSettings({ ...settings, feb29BirthdayRule: 'FEB_28' })}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold">February 28 (Recommended)</div>
                    <div className="text-[11px] text-slate-500">Celebrates on the last day of February</div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  settings.feb29BirthdayRule === 'MAR_01'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="feb29Rule"
                    checked={settings.feb29BirthdayRule === 'MAR_01'}
                    onChange={() => handleSaveSettings({ ...settings, feb29BirthdayRule: 'MAR_01' })}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold">March 1</div>
                    <div className="text-[11px] text-slate-500">Celebrates on the day following Feb 28</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Event Type Toggles */}
            <div className="pt-4 space-y-3">
              <div>
                <div className="text-sm font-bold text-slate-900">Permitted Celebration Categories</div>
                <div className="text-xs text-slate-500">Select which automated celebration types are published to the home feed.</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'welcome', label: 'New Joiners', desc: 'Published on date of joining' },
                  { key: 'birthday', label: 'Birthdays', desc: 'Age-masked annual wishes' },
                  { key: 'anniversary', label: 'Work Anniversaries', desc: 'Milestones & service years' }
                ].map(cat => (
                  <label key={cat.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowedCategories?.[cat.key] !== false}
                      onChange={(e) => {
                        const newAllowed = { ...(settings.allowedCategories || {}), [cat.key]: e.target.checked };
                        handleSaveSettings({ ...settings, allowedCategories: newAllowed });
                      }}
                      className="mt-0.5 text-blue-600 rounded border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{cat.label}</div>
                      <div className="text-[11px] text-slate-500">{cat.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Catch-Up Runs */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Intranet Catch-Up Publishing</div>
                <div className="text-xs text-slate-500">If the intranet or application starts after 01:00 AM IST, automatically evaluate and publish today's pending wishes.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.catchUpMissedRuns !== false}
                onChange={(e) => handleSaveSettings({ ...settings, catchUpMissedRuns: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBMENU: PUBLISHED POSTS */}
      {/* ========================================================================= */}
      {activeTab === 'published' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Live Published Celebration Posts ({posts.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All celebration cards generated and live on the Employee Home Page feed.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 p-8">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Celebration Posts Published Yet</h4>
              <p className="text-xs text-slate-500 mt-1">Use the "Run Automation Now" button on the Dashboard to evaluate and publish today's celebrations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                      <img
                        src={post.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={post.employeeName}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{post.employeeName}</div>
                        <div className="text-xs text-slate-500 truncate">{post.employeeRole} • {post.branch}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                        {post.badgeText || post.type}
                      </span>
                    </div>

                    {/* Poster Thumbnail */}
                    {post.posterUrl && (
                      <div
                        onClick={() => setEnlargedPoster(post)}
                        className="relative cursor-pointer group bg-slate-900 border-b border-slate-200"
                      >
                        <img src={post.posterUrl} alt="Poster" className="w-full h-44 object-cover group-hover:opacity-90 transition-all" />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" /> Click to Enlarge Poster
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className="p-4">
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{post.message}"</p>
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-semibold text-rose-600">
                        <Heart className="w-4 h-4 fill-rose-500" /> {post.likesCount || 0} Likes
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <MessageSquare className="w-4 h-4" /> {post.wishesCount || post.wishes?.length || 0} Wishes
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{post.eventDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUBMENU: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Celebration Scheduler Execution Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit logs of automated 01:00 AM IST runs and manual triggers.</p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">No execution logs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Eval Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                      <td className="py-3 px-4">{log.evalDate || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{log.publishedCount ?? '-'}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enlarged Poster Modal */}
      {enlargedPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-sm font-bold">{enlargedPoster.employeeName} • {enlargedPoster.badgeText || enlargedPoster.type}</div>
                  <div className="text-[11px] text-slate-400">{enlargedPoster.employeeRole} • {enlargedPoster.branch}</div>
                </div>
              </div>
              <button
                onClick={() => setEnlargedPoster(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-2 flex items-center justify-center">
              <img src={enlargedPoster.posterUrl} alt="Enlarged Celebration Poster" className="max-h-[70vh] w-auto rounded-lg shadow-lg" />
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs border-t border-slate-200">
              <div className="text-slate-600 italic">"{enlargedPoster.message}"</div>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = enlargedPoster.posterUrl;
                  a.download = `${enlargedPoster.employeeName.replace(/\s+/g, '_')}_Celebration_Poster.png`;
                  a.click();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm"
              >
                Download Poster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CelebrationAutomation;

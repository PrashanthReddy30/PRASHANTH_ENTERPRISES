import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Menu,
  ShieldCheck, 
  ChevronDown,
  UserCheck,
  Layers
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HrGlobalEmployeeSearch } from '../hr/HrGlobalEmployeeSearch';
import { ProfileDrawer } from '../profile/ProfileDrawer';

export function Header({ toggleMobileSidebar }) {
  const { 
    currentUser, 
    switchUser, 
    currentPortal, 
    setCurrentPortal, 
    switchPersona,
    permissions, 
    storeData, 
    hrmStore 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const isHrPortal = location.pathname.startsWith('/hr') || currentPortal === 'HR';

  // Unread notifications
  const unreadNotifications = storeData.notifications.filter(n => !n.read);

  // Today's attendance for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const myAtt = storeData.attendance.find(a => a.employeeId === currentUser.id && a.date === todayStr);
  const isPunchedIn = myAtt ? myAtt.firstIn && myAtt.firstIn !== '-' && (!myAtt.lastOut || myAtt.lastOut === '-') : false;

  const handlePunchToggle = () => {
    try {
      if (isPunchedIn) {
        hrmStore.markAttendancePunch({
          employeeId: currentUser.id,
          direction: 'OUT',
          machine: 'Intranet Gate Reader (192.168.1.240)'
        });
        alert(`Clocked OUT successfully. Synchronized event with Matrix Intranet.`);
      } else {
        hrmStore.markAttendancePunch({
          employeeId: currentUser.id,
          direction: 'IN',
          machine: 'Intranet Gate Reader (192.168.1.240)'
        });
        alert(`Clocked IN successfully. Synchronized event with Matrix Intranet.`);
      }
    } catch (e) {
      alert(`Punch sync error: ${e.message}`);
    }
  };

  const handlePortalSwitch = (portal) => {
    if (portal === 'GLOBAL_ADMIN') {
      if (switchPersona) {
        switchPersona('Global Admin', { portal: 'GLOBAL_ADMIN', route: '/admin/dashboard' });
      } else {
        setCurrentPortal('GLOBAL_ADMIN');
      }
      navigate('/admin/dashboard');
      return;
    }
    const success = setCurrentPortal(portal);
    if (success) {
      if (portal === 'EMPLOYEE') {
        navigate('/home');
      } else if (portal === 'HR') {
        navigate('/hr/dashboard');
      }
    }
  };

  return (
    <>
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur transition-all">
      <div className="flex h-16 w-full items-center justify-between px-3 md:px-6">
        {/* Left: Mobile hamburger & branding */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMobileSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-900 to-brand-600 font-bold text-white shadow-sm shadow-brand-500/30 shrink-0">
              PE
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base leading-none">
                Prashanth Enterprises
              </h1>
              <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                <span>Enterprise HRMS</span>
                <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300"></span>
                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Firebase Synced
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* HR TOP HEADER – SMART EMPLOYEE SEARCH (Prominent in HR Portal Header) */}
        {isHrPortal ? (
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-3 lg:mx-6">
            <HrGlobalEmployeeSearch />
          </div>
        ) : (
          /* Middle: 3-PORTAL TOP NAVIGATION (EMPLOYEE | HR | GLOBAL ADMIN) (Employee Portal) */
          <div className="hidden lg:flex items-center rounded-2xl bg-slate-100/90 p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => handlePortalSwitch('EMPLOYEE')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                currentPortal === 'EMPLOYEE'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>EMPLOYEE</span>
            </button>

            <button
              onClick={() => handlePortalSwitch('HR')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                currentPortal === 'HR'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>HR ADMIN</span>
            </button>

            <button
              onClick={() => handlePortalSwitch('GLOBAL_ADMIN')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                currentPortal === 'GLOBAL_ADMIN'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>GLOBAL ADMIN</span>
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Portal Switcher in HR Portal (Desktop) */}
          {isHrPortal && (
            <div className="hidden xl:flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => handlePortalSwitch('EMPLOYEE')}
                className={`px-2.5 py-1 text-[11px] font-semibold transition rounded-lg ${
                  currentPortal === 'EMPLOYEE' ? 'bg-white text-brand-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Employee
              </button>
              <button
                onClick={() => handlePortalSwitch('HR')}
                className={`px-2.5 py-1 text-[11px] font-semibold transition rounded-lg ${
                  currentPortal === 'HR' ? 'bg-white text-brand-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HR Admin
              </button>
              <button
                onClick={() => handlePortalSwitch('GLOBAL_ADMIN')}
                className={`px-2.5 py-1 text-[11px] font-semibold transition rounded-lg ${
                  currentPortal === 'GLOBAL_ADMIN' ? 'bg-white text-purple-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          )}

          {/* Mobile Portal Selector */}
          <div className="lg:hidden">
            <select
              value={currentPortal}
              onChange={(e) => handlePortalSwitch(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-[11px] font-bold text-slate-800"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR">HR Admin</option>
              <option value="GLOBAL_ADMIN">Global Admin</option>
            </select>
          </div>

        {/* Quick Punch Button */}
        <button
          onClick={handlePunchToggle}
          className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
            isPunchedIn
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Clock IN / OUT (Direct Matrix Push Sync)"
        >
          <Clock className={`h-3.5 w-3.5 ${isPunchedIn ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">
            {isPunchedIn ? `In (${myAtt?.firstIn})` : 'Clock IN'}
          </span>
          <span className={`inline-block h-2 w-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
            title="System Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <p className="text-xs font-bold text-slate-900">Notifications ({unreadNotifications.length})</p>
                <button
                  onClick={() => hrmStore.markAllNotificationsRead()}
                  className="text-[10px] font-semibold text-brand-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {storeData.notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={`p-2 rounded-xl text-xs ${n.read ? 'bg-slate-50 text-slate-600' : 'bg-brand-50/60 text-slate-900 font-semibold border border-brand-100'}`}>
                    <p className="text-xs">{n.title}</p>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Keka-style Profile Drawer Trigger ─────────────────── */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileDrawer(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-2.5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-300"
            aria-label="Open profile menu"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </p>
              <p className="text-[10px] font-semibold text-brand-600 leading-none mt-0.5">
                {currentUser.id === 'PE000'
                  ? 'Global Admin'
                  : (currentUser.roleTier || (currentUser.systemRole === 'Central HR' ? 'Central HR' : (currentUser.systemRole || 'Employee')))}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </div>

    {/* HR Global Employee Search: Mobile Header Bar */}
    {isHrPortal && (
      <div className="md:hidden px-3 pb-2.5 pt-1 border-t border-slate-100 bg-white/95">
        <HrGlobalEmployeeSearch isMobile={true} />
      </div>
    )}
  </header>

  {/* Keka-style Profile Side Drawer */}
  <ProfileDrawer
    isOpen={showProfileDrawer}
    onClose={() => setShowProfileDrawer(false)}
  />
  </>
  );
}

export default Header;

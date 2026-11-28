import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

// 8 Core Employee Self-Service (ESS) Modules (Preserved)
import Home from './pages/Home';
import Me from './pages/Me';
import Inbox from './pages/Inbox';
import MyTeam from './pages/MyTeam';
import Org from './pages/Org';
import Engage from './pages/Engage';
import Helpdesk from './pages/Helpdesk';
import Finance from './pages/Finance';
import MyFinances from './pages/MyFinances';

// HR Admin Modules
import HrDashboard from './pages/hr/HrDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import EmployeeProfilePage from './pages/hr/EmployeeProfilePage';
import AttendanceManagement from './pages/hr/AttendanceManagement';
import LeaveManagement from './pages/hr/LeaveManagement';
import PayrollManagement from './pages/hr/PayrollManagement';
import RecruitmentManagement from './pages/hr/RecruitmentManagement';
import DepartmentsBranches from './pages/hr/DepartmentsBranches';
import HrApprovals from './pages/hr/HrApprovals';
import HrReports from './pages/hr/HrReports';
import HrSettings from './pages/hr/HrSettings';
import CelebrationAutomation from './pages/hr/CelebrationAutomation';
import NewEmployeeOnboarding from './pages/hr/NewEmployeeOnboarding';
import OnboardingTrackingDashboard from './pages/hr/OnboardingTrackingDashboard';
import EmployeeOnboardingPortal from './pages/portal/EmployeeOnboardingPortal';

// Global Admin Module
import GlobalAdminDashboard from './pages/admin/GlobalAdminDashboard';
import BranchMonitor from './pages/admin/BranchMonitor';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Standalone Candidate Self-Service Onboarding Portal */}
          <Route path="onboarding/:token" element={<EmployeeOnboardingPortal />} />

          {/* Main Application Layout wrapper */}
          <Route path="/" element={<Layout />}>
            {/* Default redirect to Home */}
            <Route index element={<Navigate to="/home" replace />} />
            
            {/* 1. Employee Self-Service (ESS) Portal */}
            <Route path="home" element={<Home />} />
            <Route path="me" element={<Me />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="team" element={<MyTeam />} />
            <Route path="org" element={<Org />} />
            <Route path="engage" element={<Engage />} />
            <Route path="helpdesk" element={<Helpdesk />} />
            <Route path="finance" element={<Finance />} />
            <Route path="finance/:section" element={<Finance />} />
            <Route path="finance/:section/:subSection" element={<Finance />} />
            <Route path="finances" element={<Navigate to="/finance" replace />} />

            {/* 2. HR Admin Portal (Guarded by Live Role-Based Access Matrix) */}
            <Route path="hr">
              <Route index element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="dashboard" element={<HrDashboard />} />
              <Route path="employees" element={<ProtectedRoute module="employees"><EmployeeManagement /></ProtectedRoute>} />
              <Route path="employees/:employeeId/profile" element={<ProtectedRoute module="employees"><EmployeeProfilePage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute module="attendance"><AttendanceManagement /></ProtectedRoute>} />
              <Route path="leaves" element={<ProtectedRoute module="leaves"><LeaveManagement /></ProtectedRoute>} />
              <Route path="payroll" element={<ProtectedRoute module="payroll"><PayrollManagement /></ProtectedRoute>} />
              <Route path="recruitment" element={<ProtectedRoute module="recruitment"><RecruitmentManagement /></ProtectedRoute>} />
              <Route path="onboarding" element={<ProtectedRoute module="recruitment"><NewEmployeeOnboarding /></ProtectedRoute>} />
              <Route path="onboarding-tracker" element={<ProtectedRoute module="recruitment"><OnboardingTrackingDashboard /></ProtectedRoute>} />
              <Route path="departments" element={<DepartmentsBranches />} />
              <Route path="approvals" element={<ProtectedRoute module="leaves" requireApproval={true}><HrApprovals /></ProtectedRoute>} />
              <Route path="celebrations" element={<CelebrationAutomation />} />
              <Route path="reports" element={<ProtectedRoute module="audit"><HrReports /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute module="settings"><HrSettings /></ProtectedRoute>} />
            </Route>

            {/* 3. Global Admin Portal */}
            <Route path="admin">
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<GlobalAdminDashboard />} />
              <Route path="branch-monitor" element={<BranchMonitor />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

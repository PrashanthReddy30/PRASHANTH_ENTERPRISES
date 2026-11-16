import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// 8 Main Modules
import Home from './pages/Home';
import Me from './pages/Me';
import Inbox from './pages/Inbox';
import MyTeam from './pages/MyTeam';
import Org from './pages/Org';
import Engage from './pages/Engage';
import Helpdesk from './pages/Helpdesk';
import MyFinances from './pages/MyFinances';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Layout wrapper */}
        <Route path="/" element={<Layout />}>
          {/* Default redirect to Home */}
          <Route index element={<Navigate to="/home" replace />} />
          
          {/* 1. Home: 'Complete open place', 'New Joinees', 'Company News' */}
          <Route path="home" element={<Home />} />
          
          {/* 2. Me: Attendance (Matrix Biometric), Leave, Performance, Expenses & Travel, Apps */}
          <Route path="me" element={<Me />} />
          
          {/* 3. Inbox: 'Pending Tasks' */}
          <Route path="inbox" element={<Inbox />} />
          
          {/* 4. My Team: Manager view for team tracking */}
          <Route path="team" element={<MyTeam />} />
          
          {/* 5. Org (Organization): Employees, Documents (IT policy-2025), Hiring */}
          <Route path="org" element={<Org />} />
          
          {/* 6. Engage: Announcements, Polls, and Articles */}
          <Route path="engage" element={<Engage />} />
          
          {/* 7. Helpdesk: 'My Tickets' and 'Following' */}
          <Route path="helpdesk" element={<Helpdesk />} />
          
          {/* 8. My Finances: Summary, My Pay (Salary & Payslips), Manage Taxes */}
          <Route path="finances" element={<MyFinances />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

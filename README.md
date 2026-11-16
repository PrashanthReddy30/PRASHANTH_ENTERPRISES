# Prashanth Enterprises HRM (Human Resource Management)

A comprehensive, progressive web application (PWA) built with **React**, **Vite**, **React Router**, and **Tailwind CSS**, designed specifically for high responsiveness on Mobile and Desktop and optimized for a **Local Intranet (Local Server setup)** with real-time **Matrix Biometric integration**.

---

## 🚀 Key Modules Included (Keka-Style)

1. **Home**:
   - 'Complete Open Place' checklist (IT policy sign-off, missing attendance regularization, tax declaration deadlines)
   - 'New Joinees' onboarding showcase
   - 'Company News' & corporate bulletins
   - Live Matrix Biometric terminal status widget (`192.168.1.240`)

2. **Me**:
   - **Attendance**: Live biometric push sync, punch log history, "Request Duty" (On-Duty / OD modal), "Request Partial Day" (Late/early departure permission), and Attendance Policy summary
   - **Leave**: Balance cards (PL, SL, CL, Comp-off) and interactive Leave Application modal
   - **Performance**: Objectives & Key Results (OKRs), milestones, and review feedback
   - **Expenses & Travel**: Claim reimbursement submissions, advances, and status tracking
   - **Apps**: Single-sign-on launchpad to Matrix COSEC console, IT Asset Portal, and ERP

3. **Inbox**:
   - 'Pending Tasks' approval center (Leave applications, Biometric regularization, expense claims, IT policy sign-offs) with single-click Approve / Reject actions and category filters

4. **My Team**:
   - Manager tracking view with real-time biometric presence counters (In Office, Remote/WFH, On Leave)
   - Detailed direct reportee cards with first punch-in times, assigned shifts, and communication shortcuts

5. **Org (Organization)**:
   - **Employees**: Employee Directory with search and visual Organization Hierarchy Tree
   - **Documents**: Corporate policies with special focus on **IT Policy-2025** (Information Security, Intranet access & device encryption)
   - **Hiring**: Internal job openings, referral rewards, and internal applications

6. **Engage**:
   - Company announcements with likes and comments
   - Interactive workplace polls with real-time percentage calculations
   - Employee spotlights and wellness articles

7. **Helpdesk**:
   - Ticketing system with **'My Tickets'** and **'Following'** tabs
   - Create Ticket modal with categories (IT Support, Biometric & Attendance, HR, Facilities) and priority levels (Low, Medium, High, Critical)

8. **My Finances**:
   - **Summary**: Monthly Gross, Net Take-Home, Deductions breakdown, and Annual CTC
   - **My Pay**: Earnings vs Deductions statement, downloadable monthly payslips
   - **Manage Taxes**: Investment declarations under Chapter VI-A (80C, 80D, 80CCD NPS), Form 12B Previous Income, Statutory Form 16 / 12BB downloads, and Regime Comparison (New 115BAC vs Old)

---

## 🌐 Local Intranet & PWA Setup

- **Host Binding**: Configured in `vite.config.js` to bind to `0.0.0.0:5173`, allowing any mobile phone, tablet, or workstation connected to the office Wi-Fi / Local Area Network (LAN) to access the HRM via `http://<LOCAL_SERVER_IP>:5173`.
- **Offline PWA Capabilities**: Built with `vite-plugin-pwa` and Service Worker runtime caching for offline fallback, standalone mobile display, and punch buffering if the intranet drops.
- **Biometric Device Integration**: Built with support for Matrix COSEC DOOR FMX / COSEC CENTRA push API protocol over local HTTP/WebSocket.

---

## 🛠️ Getting Started

```bash
# 1. Navigate to the project directory
cd "C:\Users\sandh\.gemini\antigravity\scratch\prashanth-enterprises-hrm"

# 2. Start the local Intranet development server
npm run dev -- --host
```

Access from:
- **Local Machine**: `http://localhost:5173`
- **Any Mobile or Office PC on the Intranet**: `http://192.168.1.X:5173`

# PRASHANTH_ENTERPRISES

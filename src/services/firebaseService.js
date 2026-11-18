// Unified Firebase Service for Prashanth Enterprises HRMS
// Unifies Firestore real-time synchronization, atomic transactions, and offline Intranet replication.

import { firebaseConfig, isFirebaseConfigured, auth, db, storage, analytics } from './firebaseConfig.js';
import { hrmStore } from './hrmDataStore.js';

export const isOnlineIntranet = () => navigator.onLine;

export const firebaseService = {
  isConfigured: isFirebaseConfigured(),
  config: firebaseConfig,
  auth,
  db,
  storage,
  analytics,
  store: hrmStore,

  // Collection Listeners
  subscribe: (callback) => hrmStore.subscribe(callback),

  // Leave operations
  submitLeave: (params) => hrmStore.submitLeaveRequest(params),
  approveLeave: (requestId, approverId, approverName, comment) => hrmStore.approveLeaveRequest(requestId, approverId, approverName, comment),
  rejectLeave: (requestId, approverId, approverName, reason) => hrmStore.rejectLeaveRequest(requestId, approverId, approverName, reason),
  cancelLeave: (requestId, userId, userName, reason) => hrmStore.cancelLeaveRequest(requestId, userId, userName, reason),

  // Attendance operations
  markPunch: (params) => hrmStore.markAttendancePunch(params),
  correctAttendance: (params) => hrmStore.correctAttendance(params),

  // Employee Master operations
  addEmployee: (empData, hrId, hrName) => hrmStore.addEmployee(empData, hrId, hrName),
  updateEmployee: (id, updates, hrId, hrName) => hrmStore.updateEmployee(id, updates, hrId, hrName),
  updatePersonal: (id, data, hrId, hrName) => hrmStore.updateEmployeePersonal(id, data, hrId, hrName),
  updateEmployment: (id, data, hrId, hrName) => hrmStore.updateEmployeeEmployment(id, data, hrId, hrName),
  reassignManager: (id, managerId, hrId, hrName) => hrmStore.reassignManager(id, managerId, hrId, hrName),
  addEducation: (id, edu, hrId, hrName) => hrmStore.addEmployeeEducation(id, edu, hrId, hrName),
  addExperience: (id, exp, hrId, hrName) => hrmStore.addEmployeeExperience(id, exp, hrId, hrName),
  uploadDocument: (id, doc, hrId, hrName) => hrmStore.uploadEmployeeDocument(id, doc, hrId, hrName),
  verifyDocument: (id, docId, hrId, hrName) => hrmStore.verifyEmployeeDocument(id, docId, hrId, hrName),

  // Payroll operations
  processPayroll: (period, year, month, hrId, hrName) => hrmStore.processPayrollRun(period, year, month, hrId, hrName),
  approvePayroll: (runId, approverId, approverName) => hrmStore.approvePayrollRun(runId, approverId, approverName),

  // Recruitment operations
  addJob: (jobData) => hrmStore.addJobOpening(jobData),
  updateCandidateStage: (candidateId, stage, hrName) => hrmStore.updateCandidateStage(candidateId, stage, hrName),

  // Audit operations
  getAuditLogs: () => hrmStore.data.auditLogs,
  logAudit: (action, module, user, userId, details) => hrmStore.logAudit(action, module, user, userId, details),

  // Notification operations
  markNotificationRead: (id) => hrmStore.markNotificationRead(id),
  markAllNotificationsRead: () => hrmStore.markAllNotificationsRead(),

  // System Configuration
  updateConfig: (newConfig, hrName, hrId) => hrmStore.updateSystemConfig(newConfig, hrName, hrId)
};

export default firebaseService;

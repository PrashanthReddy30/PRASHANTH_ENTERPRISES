import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit2, 
  CheckCircle2, 
  X, 
  Eye, 
  Download, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Employee360Profile } from './Employee360Profile';

export function EmployeeManagement() {
  const { storeData, hrmStore, currentUser, permissions } = useAuth();
  const navigate = useNavigate();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Add Employee
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    systemRole: 'Employee',
    department: 'Information Technology',
    deptCode: 'IT',
    branch: 'Hyderabad',
    branchId: 'HYD',
    managerName: 'Rajesh Kannan',
    managerId: 'PE003',
    basicSalary: 45000,
    joiningDate: new Date().toISOString().split('T')[0],
    panNumber: '',
    employmentType: 'Full-Time Permanent'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 8-Field Search Matcher: Name, ID, Email, Phone/Mobile, Department, Designation, Branch, Manager
  const matchEmployeeSearch = (emp, query) => {
    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    const name = (emp.name || '').toLowerCase();
    const empId = (emp.employeeId || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const personalEmail = (emp.personal?.personalEmail || '').toLowerCase();
    const phone = (emp.phone || '').toLowerCase();
    const mobile = (emp.personal?.mobile || '').toLowerCase();
    const emergencyPhone = (emp.personal?.emergencyContact?.mobile || '').toLowerCase();
    const role = (emp.role || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const branch = (emp.branch || '').toLowerCase();
    const branchCode = (emp.branchId || '').toLowerCase();
    const manager = (emp.managerName || '').toLowerCase();

    return (
      name.includes(q) ||
      empId.includes(q) ||
      email.includes(q) ||
      personalEmail.includes(q) ||
      phone.includes(q) ||
      mobile.includes(q) ||
      emergencyPhone.includes(q) ||
      role.includes(q) ||
      dept.includes(q) ||
      branch.includes(q) ||
      branchCode.includes(q) ||
      manager.includes(q)
    );
  };

  // Quick Autocomplete / Search Matches
  const matchedEmployeesForDropdown = storeData.employees.filter((emp) =>
    matchEmployeeSearch(emp, searchQuery)
  );

  // Filter Employees
  const filteredEmployees = storeData.employees.filter((emp) => {
    const matchesSearch = matchEmployeeSearch(emp, searchQuery);
    const matchesBranch = branchFilter === 'ALL' || emp.branchId === branchFilter;
    const matchesDept = deptFilter === 'ALL' || emp.deptCode === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesBranch && matchesDept && matchesStatus;
  });

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all mandatory fields.');
      return;
    }

    try {
      const newEmp = hrmStore.addEmployee(formData, currentUser.id, currentUser.name);
      showToast(`Employee ${newEmp.name} (${newEmp.employeeId}) onboarded successfully!`);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        systemRole: 'Employee',
        department: 'Information Technology',
        deptCode: 'IT',
        branch: 'Hyderabad',
        branchId: 'HYD',
        managerName: 'Rajesh Kannan',
        managerId: 'PE003',
        basicSalary: 45000,
        joiningDate: new Date().toISOString().split('T')[0],
        panNumber: '',
        employmentType: 'Full-Time Permanent'
      });
    } catch (err) {
      alert(`Error creating employee: ${err.message}`);
    }
  };

  const handleToggleStatus = (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    const reason = prompt(`Reason for changing ${emp.name}'s status to ${newStatus}:`, newStatus === 'Inactive' ? 'Resigned / Exited' : 'Reinstated');
    if (reason) {
      hrmStore.updateEmployee(emp.id, { status: newStatus, exitDate: newStatus === 'Inactive' ? new Date().toISOString().split('T')[0] : null }, currentUser.id, currentUser.name);
      showToast(`Updated ${emp.name}'s status to ${newStatus}.`);
    }
  };

  // If an employee is selected, render the complete 360° Profile view
  if (selectedEmployeeId) {
    return (
      <Employee360Profile
        employeeId={selectedEmployeeId}
        onBack={() => setSelectedEmployeeId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
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
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 uppercase">
                Workforce Master
              </span>
              <span className="text-xs text-slate-500">• {filteredEmployees.length} Records</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Employee Directory & Lifecycle</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive personnel directory, onboarding, department transfers, branch assignments, and status tracking.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Onboard New Employee</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
          {/* Search with 8-Field Matching & Autocomplete Dropdown */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, ID, Email, Phone, Dept, Role, Branch, Manager..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 250);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Live Autocomplete / Fast Matches Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div 
                className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl animate-fade-in"
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Matched Employees ({matchedEmployeesForDropdown.length})</span>
                  <span className="text-brand-600 font-semibold">Select to open 360° Profile</span>
                </div>
                {matchedEmployeesForDropdown.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No employees matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="mt-1 divide-y divide-slate-50">
                    {matchedEmployeesForDropdown.slice(0, 8).map((emp) => (
                      <div
                        key={emp.id}
                        onMouseDown={() => {
                          navigate(`/hr/employees/${emp.id}/profile`);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-50 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              <span className="font-mono text-brand-600 font-semibold">{emp.employeeId}</span> • {emp.role} • {emp.department}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                            {emp.branch}
                          </span>
                          <p className="mt-0.5 text-[9px] text-slate-400">Mgr: {emp.managerName || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="ALL">All Branches (HYD, CHE, MUM)</option>
              <option value="HYD">Hyderabad Hub</option>
              <option value="CHE">Chennai Hub</option>
              <option value="MUM">Mumbai Hub</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="ALL">All Departments</option>
              {storeData.departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive / Exited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role & System Scope</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Reporting Manager</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition">
                  {/* Employee Identity - Click opens complete 360 Profile */}
                  <td className="py-3 px-4">
                    <div 
                      onClick={() => navigate(`/hr/employees/${emp.id}/profile`)}
                      className="flex items-center gap-3 cursor-pointer group"
                      title={`Open ${emp.name}'s complete 360° Profile`}
                    >
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-brand-500 transition"
                      />
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition flex items-center gap-1">
                          {emp.name}
                        </p>
                        <p className="text-[11px] font-mono text-brand-600 font-semibold">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{emp.role}</p>
                    <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      emp.systemRole === 'Global Admin' ? 'bg-purple-100 text-purple-700' :
                      emp.systemRole === 'Central HR' || emp.systemRole === 'Branch HR' ? 'bg-brand-100 text-brand-700' :
                      emp.systemRole === 'Finance' ? 'bg-amber-100 text-amber-700' :
                      emp.systemRole === 'Manager' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.systemRole}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {emp.department}
                  </td>

                  {/* Branch */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {emp.branch}
                    </span>
                  </td>

                  {/* Manager */}
                  <td className="py-3 px-4 text-slate-600">
                    {emp.managerName || '—'}
                  </td>

                  {/* Joining Date */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {emp.joiningDate}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {emp.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/hr/employees/${emp.id}/profile`)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-xs transition"
                        title={`Open ${emp.name}'s complete 360° Profile`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>360° Profile</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`rounded-lg p-1.5 transition ${
                          emp.status === 'Active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={emp.status === 'Active' ? "Mark Inactive / Process Exit" : "Reactivate Employee"}
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Onboard New Employee</h3>
                <p className="text-xs text-slate-500">Assign role, department, branch, and statutory credentials.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh.c@prashanthenterprises.in"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Designation / Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior QA Engineer"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
                  />
                </div>

                {/* System Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Access Level</label>
                  <select
                    value={formData.systemRole}
                    onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-brand-500 outline-none"
                  >
                    <option value="Employee">Employee (Self-Service)</option>
                    <option value="Manager">Manager</option>
                    <option value="Branch HR">Branch HR</option>
                    <option value="Central HR">Central HR</option>
                    <option value="Finance">Finance User</option>
                    <option value="Global Admin">Global Admin</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.deptCode}
                    onChange={(e) => {
                      const selected = storeData.departments.find(d => d.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        deptCode: e.target.value, 
                        department: selected ? selected.name : 'Information Technology' 
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-brand-500 outline-none"
                  >
                    {storeData.departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Hub</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => {
                      const b = storeData.branches.find(br => br.id === e.target.value);
                      setFormData({
                        ...formData,
                        branchId: e.target.value,
                        branch: b ? b.name : 'Hyderabad'
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-brand-500 outline-none"
                  >
                    {storeData.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                {/* Reporting Manager */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => {
                      const m = storeData.employees.find(emp => emp.id === e.target.value);
                      setFormData({
                        ...formData,
                        managerId: e.target.value,
                        managerName: m ? m.name : 'Prashanth Reddy'
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold focus:border-brand-500 outline-none"
                  >
                    {storeData.employees.filter(e => e.systemRole !== 'Employee').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Basic Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Confirm & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Personnel Dossier Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-900 to-brand-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/30"
                />
                <div>
                  <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                  <p className="text-xs text-brand-200">{selectedEmployee.role}</p>
                  <p className="text-[11px] font-mono text-brand-300">{selectedEmployee.employeeId} • {selectedEmployee.biometricId}</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">Department</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.department}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">Branch Location</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.branch}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">Corporate Email</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.email}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">Reporting Manager</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.managerName || '—'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">PAN Number</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedEmployee.panNumber || '—'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-500">PF / UAN Number</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedEmployee.uan || '—'}</p>
                </div>
              </div>

              {/* Leave Ledger summary for this employee */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900 mb-2">Current Leave Balances</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {['CL', 'SL', 'PL', 'COMP'].map(code => {
                    const ledger = storeData.leaveLedger[selectedEmployee.id] || storeData.leaveLedger['PE001'];
                    const bal = ledger ? ledger[code] : null;
                    return (
                      <div key={code} className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500">{code}</p>
                        <p className="text-sm font-bold text-brand-600 mt-0.5">{bal ? bal.available : 0}</p>
                        <p className="text-[9px] text-slate-400">Days Avail</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 text-right">
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;

import React from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  ShieldCheck,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Employee Basic Information Card Modal
 * Displays clean, compact, professional snapshot of essential employee details:
 * - Profile Photo, Full Name, Employee ID
 * - Designation, Department, Branch, Employment Status
 * - Mobile Number, Official Email, Joining Date, Reporting Manager
 * - Prominent "VIEW FULL DETAILS" button navigating to Employee 360° Profile
 * - Close button
 */
export function EmployeeBasicInfoCard({ employee, onClose, onSelectFullDetails }) {
  const navigate = useNavigate();

  if (!employee) return null;

  const handleViewFullDetails = () => {
    if (onClose) onClose();
    if (onSelectFullDetails) {
      onSelectFullDetails(employee);
    } else {
      // Use unique employee ID in route (e.g. /hr/employees/PE001/profile)
      const empUniqueId = employee.id || employee.employeeId;
      navigate(`/hr/employees/${empUniqueId}/profile`);
    }
  };

  const statusColor = employee.status === 'Active' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-slide-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600"></div>

        {/* Header with Photo, Name, ID & Close */}
        <div className="flex items-start justify-between gap-3 pt-2">
          <div className="flex items-center gap-3.5">
            <img
              src={employee.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`}
              alt={employee.name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0 bg-slate-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
              }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {employee.name}
                </h3>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusColor}`}>
                  {employee.status || 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md">
                  {employee.employeeId || employee.id}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  ID: {employee.id}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            title="Close Card"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Employee Basic Details Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-4 bg-slate-50/50 rounded-xl px-4">
          {/* Designation */}
          <div className="flex items-start gap-2.5">
            <Briefcase className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{employee.role || employee.designation}</p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{employee.department}</p>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch Location</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{employee.branch} Hub ({employee.branchId})</p>
            </div>
          </div>

          {/* Joining Date */}
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{employee.joiningDate}</p>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex items-start gap-2.5">
            <Phone className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{employee.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Official Email */}
          <div className="flex items-start gap-2.5">
            <Mail className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Email</span>
              <p className="font-mono font-semibold text-brand-700 text-xs mt-0.5 truncate" title={employee.email}>
                {employee.email || 'N/A'}
              </p>
            </div>
          </div>

          {/* Reporting Manager */}
          <div className="flex items-start gap-2.5 sm:col-span-2">
            <UserCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporting Manager</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{employee.managerName || 'Board of Directors'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleViewFullDetails}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-700 to-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-brand-800 hover:to-brand-700 transition"
          >
            <span>VIEW FULL DETAILS</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeBasicInfoCard;

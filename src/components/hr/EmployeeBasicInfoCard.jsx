import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Employee Quick-View Modal (Employee Basic Info Card)
 * Rendered at root level via document.body portal to prevent header clipping.
 * 
 * Features:
 * - Rendered in portal outside header boundary (no backdrop-filter/overflow trap)
 * - Perfectly centered with fixed inset-0 z-[9999]
 * - Close via X, Close button, backdrop click, or Escape key
 * - Clean 2-column detail grid
 * - Navigates directly to Employee 360° Profile (/hr/employees/:id/profile)
 */
export function EmployeeBasicInfoCard({ employee, onClose, onSelectFullDetails }) {
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!employee) return null;

  const handleViewFullDetails = () => {
    if (onClose) onClose();
    if (onSelectFullDetails) {
      onSelectFullDetails(employee);
    } else {
      const empUniqueId = employee.id || employee.employeeId;
      navigate(`/hr/employees/${empUniqueId}/profile`);
    }
  };

  const statusColor = employee.status === 'Active' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : 'bg-rose-50 text-rose-700 border-rose-200';

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-quickview-title"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={employee.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`}
              alt={employee.name}
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs shrink-0 bg-slate-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
              }}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="employee-quickview-title" className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {employee.name}
                </h3>
                <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md shrink-0">
                  {employee.employeeId || employee.id}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusColor} shrink-0`}>
                  {employee.status || 'Active'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                {employee.role || employee.designation}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0"
            title="Close Quick-View"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Details Grid - 2 Column) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 text-xs">
          {/* Branch Location */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 border border-emerald-100 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch Location</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5 truncate">
                {employee.branch || 'Corporate'} Hub {employee.branchId ? `(PE-${employee.branchId})` : ''}
              </p>
            </div>
          </div>

          {/* Joining Date */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 border border-purple-100 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">
                {employee.joiningDate || 'N/A'}
              </p>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100 shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number</span>
              <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5 truncate">
                {employee.phone || employee.personal?.mobile || 'N/A'}
              </p>
            </div>
          </div>

          {/* Official Email */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 border border-indigo-100 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Email</span>
              <p 
                className="font-mono font-semibold text-brand-700 text-xs mt-0.5 truncate break-all" 
                title={employee.email || employee.personal?.officialEmail}
              >
                {employee.email || employee.personal?.officialEmail || 'N/A'}
              </p>
            </div>
          </div>

          {/* Reporting Manager */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 border border-amber-100 shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporting Manager</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5 truncate">
                {employee.managerName || 'Board of Directors'}
              </p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600 border border-brand-100 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5 truncate">
                {employee.department || 'Operations'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleViewFullDetails}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <span>View Full Details</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default EmployeeBasicInfoCard;

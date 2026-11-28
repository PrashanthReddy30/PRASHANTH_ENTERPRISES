import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AccessRestricted({ 
  moduleName = 'Module', 
  returnPath
}) {
  const navigate = useNavigate();
  const { currentUser, currentPortal } = useAuth();
  
  const roleName = currentUser?.id === 'PE000' 
    ? 'Global Admin' 
    : (currentUser?.systemRole || 'Employee');

  const defaultReturn = currentPortal === 'HR' ? '/hr/dashboard' : '/home';
  const targetReturn = returnPath || defaultReturn;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
            ✕
          </span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Access Restricted by Global Admin</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {moduleName} Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your active role (<strong className="text-slate-800">{roleName}</strong>) does not have active permission for <strong className="text-slate-800">{moduleName}</strong> in the live Enterprise Role-Based Access Matrix.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Active Persona:</span>
            <span className="font-bold text-slate-900">{currentUser?.name} ({currentUser?.id})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assigned Role Tier:</span>
            <span className="font-bold text-brand-700">{roleName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Matrix Policy:</span>
            <span className="font-bold text-rose-600">✕ None (Blocked)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hub Scope:</span>
            <span className="font-mono text-slate-700">{currentUser?.branch || 'Local'}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => navigate(targetReturn)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessRestricted;

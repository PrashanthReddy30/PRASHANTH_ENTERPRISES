import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  FileCheck, 
  AlertCircle, 
  Check, 
  X,
  Search,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { pendingTasks as initialTasks } from '../data/mockData';

export function Inbox() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);

  const handleApprove = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    alert(`Task ${id} has been Approved.`);
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const handleReject = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    alert(`Task ${id} has been Rejected.`);
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(t => t.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Inbox & Pending Tasks</h1>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600 border border-rose-200">
              {tasks.length} Action Needed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review and take action on employee leave requests, biometric punch regularizations, and compliance sign-offs.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Leave', 'Attendance', 'Finance', 'Policy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List and Detailed Preview (Split Screen on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">All Caught Up!</h3>
              <p className="text-xs text-slate-500 mt-1">No pending tasks found under '{filter}'.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`group cursor-pointer rounded-2xl border p-4 transition ${
                  selectedTask?.id === task.id
                    ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {task.avatar ? (
                      <img
                        src={task.avatar}
                        alt={task.requester}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <ShieldCheck className="h-5 w-5 text-brand-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          {task.type}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {task.date}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        Requester: <span className="text-brand-700">{task.requester}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {task.details}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(task.id);
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(task.id);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Preview Drawer / Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-fit sticky top-20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Task Context & Policy Rules
          </h3>

          {selectedTask ? (
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Selected Item:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedTask.type} ({selectedTask.id})</p>
              </div>
              <div>
                <span className="text-slate-400">Applicant:</span>
                <p className="font-semibold text-slate-800">{selectedTask.requester}</p>
              </div>
              <div>
                <span className="text-slate-400">Details:</span>
                <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedTask.details}
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleReject(selectedTask.id)}
                  className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedTask.id)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Approve Now
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Select any pending request on the left to preview details, policy checks, and audit notes.
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-bold text-slate-700">Audit SLA Guarantee</p>
            <p className="text-[11px] text-slate-500 mt-1">
              All leave & attendance regularization approvals are synced back to the Matrix Biometric database engine within 60 seconds.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Inbox;

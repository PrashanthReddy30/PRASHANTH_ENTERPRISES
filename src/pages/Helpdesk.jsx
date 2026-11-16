import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Paperclip, 
  Filter,
  User,
  X
} from 'lucide-react';
import { helpdeskTickets as initialTickets } from '../data/mockData';

export function Helpdesk() {
  const [activeTab, setActiveTab] = useState('my_tickets');
  const [tickets, setTickets] = useState(initialTickets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('IT Support');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const created = {
      id: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      status: "Open",
      assignedTo: "Auto-Routing Queue",
      createdDate: "Just now",
      following: false,
      lastUpdate: newDesc
    };
    setTickets([created, ...tickets]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    alert(`Ticket ${created.id} created successfully! IT/HR team notified.`);
  };

  const displayedTickets = tickets.filter(t => {
    const matchesTab = activeTab === 'my_tickets' ? true : t.following;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.id.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Helpdesk & Support Ticketing</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                SLA Guarantee: 4 Hours
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submit issues for IT hardware, biometric punch discrepancies, HR queries, or facilities.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Tabs: My Tickets vs Following */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === 'my_tickets'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>My Tickets</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === 'following'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Following</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {tickets.filter(t => t.following).length}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64 pb-2 sm:pb-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Ticket List Cards */}
      <div className="space-y-3">
        {displayedTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <LifeBuoy className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No Tickets Found</h3>
            <p className="text-xs text-slate-500 mt-1">No tickets match your current filter.</p>
          </div>
        ) : (
          displayedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-600 font-mono font-bold text-xs">
                    {ticket.id.split('-')[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-brand-600">{ticket.id}</span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{ticket.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Category: <span className="font-semibold text-slate-700">{ticket.category}</span> • 
                      Assigned To: <span className="text-slate-700 font-medium">{ticket.assignedTo}</span> • 
                      Created: {ticket.createdDate}
                    </p>

                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Latest Update: </span>
                      {ticket.lastUpdate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : ticket.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Helpdesk Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Subject / Title</label>
                <input
                  required
                  placeholder="e.g. Matrix Biometric card punch failure at Gate 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none"
                  >
                    <option>IT Support</option>
                    <option>Biometric & Attendance</option>
                    <option>HR & Payroll</option>
                    <option>Facilities & Workstation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe what occurred, terminal number, error message..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Helpdesk;

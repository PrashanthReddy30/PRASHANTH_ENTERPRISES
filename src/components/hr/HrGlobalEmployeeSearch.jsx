import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  User, 
  MapPin, 
  Briefcase, 
  ArrowRight,
  ShieldAlert,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchEmployees } from '../../services/employeeSearchService';
import { EmployeeBasicInfoCard } from './EmployeeBasicInfoCard';

/**
 * HR Global Employee Search Bar Component
 * Prominent search bar in top header of HR Portal.
 * 
 * Supports:
 * 1. Full/partial Employee Name
 * 2. Employee ID (e.g. PE001, EMP-2024-001)
 * 3. Mobile Number (formatted or raw digits)
 * 4. Official Email / Gmail
 * 
 * Features:
 * - Real Firebase / Firestore backend search
 * - 250ms debounce
 * - Keyboard navigation (Down, Up, Enter, Escape)
 * - Clear button
 * - Mobile responsive width
 * - Branch HR data isolation
 * - Direct selection opens Employee Basic Information Card
 */
export function HrGlobalEmployeeSearch({ isMobile = false }) {
  const { currentUser } = useAuth();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchEmployees(trimmed, currentUser, { maxResults: 8 });
        setSuggestions(results);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Error during global employee search:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [query, currentUser]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (target) {
        handleSelectEmployee(target);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSelectEmployee = (suggestion) => {
    setIsOpen(false);
    setSelectedEmployeeForCard(suggestion.raw || suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const branchRestrictionNotice = currentUser?.systemRole === 'Branch HR' 
    ? `Searching ${currentUser.branch} Hub records` 
    : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Input Container */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search employee by Name, Mobile Number, Employee ID or Gmail..."
          aria-label="Search employee by Name, Mobile Number, Employee ID or Gmail"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2 pl-10 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
        />

        {/* Status indicator: Loader or Clear Button */}
        <div className="absolute right-2.5 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete / Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div 
          className="absolute left-0 right-0 top-full mt-2 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-slide-up"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>
              {isLoading ? 'Searching...' : `Matched Employees (${suggestions.length})`}
            </span>
            {branchRestrictionNotice ? (
              <span className="text-amber-600 font-semibold lowercase">
                • {branchRestrictionNotice}
              </span>
            ) : (
              <span className="text-brand-600 font-semibold hidden sm:inline lowercase">
                Use ↑↓ to navigate • Enter to select
              </span>
            )}
          </div>

          {/* Results List */}
          {isLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>Querying Firebase workforce records...</span>
            </div>
          ) : suggestions.length === 0 ? (
            /* Clear No-Results Message */
            <div className="py-6 px-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">
                No matching employees found for "{query}"
              </p>
              <p className="text-[11px] text-slate-400">
                Try searching by full/partial name, employee ID (e.g. PE001), mobile number (e.g. 98480), or email/Gmail.
              </p>
            </div>
          ) : (
            <div className="mt-1 divide-y divide-slate-50">
              {suggestions.map((suggestion, index) => {
                const isHighlighted = index === selectedIndex;
                return (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSelectEmployee(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition group ${
                      isHighlighted
                        ? 'bg-brand-50/80 ring-1 ring-brand-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Employee Photo */}
                      <img
                        src={suggestion.avatar}
                        alt={suggestion.name}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
                        }}
                      />
                      
                      {/* Name, ID, Designation & Branch */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700 truncate">
                            {suggestion.name}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded shrink-0">
                            {suggestion.employeeId || suggestion.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {suggestion.designation || suggestion.role} • {suggestion.department}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <MapPin className="h-2.5 w-2.5 text-emerald-500" />
                            {suggestion.branch}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{suggestion.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Chevron / Action hint */}
                    <div className="shrink-0 pl-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        isHighlighted ? 'text-brand-700' : 'text-slate-400 group-hover:text-brand-600'
                      }`}>
                        <span className="hidden sm:inline text-[10px]">Select</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Employee Basic Information Card Modal */}
      {selectedEmployeeForCard && (
        <EmployeeBasicInfoCard
          employee={selectedEmployeeForCard}
          onClose={() => setSelectedEmployeeForCard(null)}
        />
      )}
    </div>
  );
}

export default HrGlobalEmployeeSearch;

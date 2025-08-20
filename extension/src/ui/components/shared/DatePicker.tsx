import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

interface DatePickerProps {
  value: string; // Date string in YYYY-MM-DD format or empty
  onChange: (date: string) => void;
  showTestOptions?: boolean;
}

export default function DatePicker({ value, onChange, showTestOptions = false }: DatePickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside and handle focus trapping
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        // Return focus to the date picker button
        const button = dropdownRef.current?.querySelector('button[tabIndex="3"]') as HTMLButtonElement;
        button?.focus();
      }
      
      // Focus trapping
      if (e.key === 'Tab' && showDropdown) {
        const focusableElements = dropdownRef.current?.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey) {
            // Shift+Tab - move focus backward
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab - move focus forward
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };
    
    if (showDropdown) {
      // Use click instead of mousedown to allow button clicks to fire first
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus the first preset button when dropdown opens
      setTimeout(() => {
        // Find the dropdown content div (the absolute positioned one)
        const dropdown = dropdownRef.current?.querySelector('.absolute');
        if (dropdown) {
          // Get the first button in the dropdown
          const firstButton = dropdown.querySelector('button') as HTMLButtonElement;
          if (firstButton) {
            firstButton.focus();
          }
        }
      }, 10);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showDropdown]);

  const formatDateButton = () => {
    if (!value) return 'No date';
    
    const date = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  };

  const setPresetDate = (preset: 'weekAgo' | 'yesterday' | 'today' | 'tomorrow' | 'nextWeek' | 'none') => {
    const today = new Date();
    
    switch(preset) {
      case 'weekAgo':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        onChange(weekAgo.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        onChange(yesterday.toISOString().split('T')[0]);
        break;
      case 'today':
        onChange(today.toISOString().split('T')[0]);
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        onChange(tomorrow.toISOString().split('T')[0]);
        break;
      case 'nextWeek':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        onChange(nextWeek.toISOString().split('T')[0]);
        break;
      case 'none':
        onChange('');
        break;
    }
    setShowDropdown(false);
    
    // Return focus to the date picker button
    setTimeout(() => {
      const button = dropdownRef.current?.querySelector('button[tabIndex="3"]') as HTMLButtonElement;
      button?.focus();
    }, 0);
  };

  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setShowDropdown(false);
    
    // Return focus to the date picker button
    setTimeout(() => {
      const button = dropdownRef.current?.querySelector('button[tabIndex="3"]') as HTMLButtonElement;
      button?.focus();
    }, 0);
  };

  const changeMonth = (direction: number, e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  return (
    <div className="relative date-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          // Only open dropdown on actual click, not Enter key
          if (e.detail > 0) {  // e.detail is 0 for keyboard activation, > 0 for mouse clicks
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }
          // Don't handle Enter key - let it bubble up to submit the form
        }}
        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1 ${
          value 
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
            : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
        }`}
        tabIndex={3}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatDateButton()}
      </button>
      
      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 p-3 min-w-[320px]">
          {/* Quick presets */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {showTestOptions && (
              <>
                <button
                  type="button"
                  onClick={() => setPresetDate('weekAgo')}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                    (() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return value === weekAgo.toISOString().split('T')[0];
                    })()
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}
                >
                  Week Ago (Test)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate('yesterday')}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                    (() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return value === yesterday.toISOString().split('T')[0];
                    })()
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}
                >
                  Yesterday (Test)
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setPresetDate('today')}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                value === new Date().toISOString().split('T')[0]
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate('tomorrow')}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                (() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return value === tomorrow.toISOString().split('T')[0];
                })()
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400'
              }`}
            >
              Tomorrow
            </button>
            {!showTestOptions && (
              <button
                type="button"
                onClick={() => setPresetDate('nextWeek')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-all col-span-2 ${
                  (() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    return value === nextWeek.toISOString().split('T')[0];
                  })()
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400'
                }`}
              >
                Next Week
              </button>
            )}
          </div>
          
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={(e) => changeMonth(-1, e)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium">
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={(e) => changeMonth(1, e)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toISOString().split('T')[0] === value;
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`p-2 text-xs rounded transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isToday
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                      : isCurrentMonth
                      ? isPast
                        ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          
          {value && (
            <>
              <div className="border-t border-gray-200 dark:border-zinc-700 mt-3 mb-2"></div>
              <button
                type="button"
                onClick={() => setPresetDate('none')}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
              >
                Clear Date
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
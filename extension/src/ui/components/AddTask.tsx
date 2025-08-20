import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getSettings } from '../../state/storage';
import { Settings, Priority } from '../../types';

interface AddTaskProps {
  onAdd: (title: string, priority?: Priority, dueDate?: string) => void;
}

const placeholders = [
  "What do you need to accomplish?",
  "What would you like to do?",
  "What do you aspire for?",
  "What do you want to do?",
  "What would make you happy?",
  "What would you like to achieve?",
  "What would make yourself proud?",
  "What do you want to focus on?",
  "What do you want to improve?",
  "What do you want to learn?",
  "What do you want to create?",
  "What do you want to build?",
  "What do you want to explore?",
];

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [placeholder, setPlaceholder] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Load settings
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!settings) return;
    
    // Pause the animation if there's text in the input
    if (title.length > 0) return;
    
    // Add initial delay before starting to type
    if (charIndex === 0 && isTyping && currentPlaceholderIndex === 0 && placeholder === '') {
      const timeout = setTimeout(() => {
        setCharIndex(1);
        setPlaceholder(placeholders[0].slice(0, 1));
      }, 500); // Wait 500ms before starting
      return () => clearTimeout(timeout);
    }
    
    const currentText = placeholders[currentPlaceholderIndex];
    
    if (isTyping) {
      // Typing forward
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 70); // Type speed (slower)
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start deleting (only if rotation is enabled)
        if (settings.enablePlaceholderRotation) {
          const timeout = setTimeout(() => {
            setIsTyping(false);
            setCharIndex(currentText.length);
          }, 3000); // Wait 3 seconds before deleting
          return () => clearTimeout(timeout);
        }
      }
    } else {
      // Deleting backward
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50); // Delete speed
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next placeholder
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
        setCharIndex(0);
      }
    }
  }, [charIndex, isTyping, currentPlaceholderIndex, settings, title]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), priority, dueDate || undefined);
      setTitle('');
      setPriority(undefined);
      setDueDate(new Date().toISOString().split('T')[0]); // Reset to today
      setShowDateDropdown(false);
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const formatDateButton = () => {
    if (!dueDate) return 'No date';
    
    const date = new Date(dueDate + 'T00:00:00'); // Ensure local timezone
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
        setDueDate(weekAgo.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDueDate(yesterday.toISOString().split('T')[0]);
        break;
      case 'today':
        setDueDate(today.toISOString().split('T')[0]);
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow.toISOString().split('T')[0]);
        break;
      case 'nextWeek':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setDueDate(nextWeek.toISOString().split('T')[0]);
        break;
      case 'none':
        setDueDate('');
        break;
    }
    setShowDateDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
    };
    
    if (showDateDropdown) {
      // Use click instead of mousedown to allow button clicks to fire first
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDateDropdown]);

  // Calendar generation
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
    setDueDate(`${year}-${month}-${day}`);
    setShowDateDropdown(false);
  };

  const changeMonth = (direction: number, e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
        >
          Add
        </button>
      </form>
      
      {/* Show priority and due date options only when there's text */}
      {title.length > 0 && (
        <div className="flex gap-3 items-center animate-fade-in">
          {/* Priority selector - High to Low */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPriority(priority === 'high' ? undefined : 'high')}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                priority === 'high' 
                  ? getPriorityColor('high')
                  : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => setPriority(priority === 'medium' ? undefined : 'medium')}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                priority === 'medium'
                  ? getPriorityColor('medium')
                  : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setPriority(priority === 'low' ? undefined : 'low')}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                priority === 'low' 
                  ? getPriorityColor('low')
                  : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              Low
            </button>
          </div>
          
          {/* Due date dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDateDropdown(!showDateDropdown);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1 ${
                dueDate 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                  : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDateButton()}
            </button>
            
            {showDateDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-10 p-3 min-w-[320px]">
                {/* Quick presets */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPresetDate('weekAgo')}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                      (() => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return dueDate === weekAgo.toISOString().split('T')[0];
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
                        return dueDate === yesterday.toISOString().split('T')[0];
                      })()
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                  >
                    Yesterday (Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDate('today')}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                      dueDate === new Date().toISOString().split('T')[0]
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
                        return dueDate === tomorrow.toISOString().split('T')[0];
                      })()
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDate('nextWeek')}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                      (() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        return dueDate === nextWeek.toISOString().split('T')[0];
                      })()
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400'
                    }`}
                  >
                    Next Week
                  </button>
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
                    const isSelected = date.toISOString().split('T')[0] === dueDate;
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
                
                {dueDate && (
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
        </div>
      )}
    </div>
  );
}
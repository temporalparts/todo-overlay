import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Priority } from '../../../types';
import PrioritySelector from './PrioritySelector';
import DatePicker from './DatePicker';

interface TaskFormProps {
  initialTitle?: string;
  initialPriority?: Priority;
  initialDueDate?: string;
  onSave: (title: string, priority?: Priority, dueDate?: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  showTestDateOptions?: boolean;
  resetOnClear?: boolean; // Reset priority and date when text is cleared
}

export default function TaskForm({
  initialTitle = '',
  initialPriority,
  initialDueDate = '',
  onSave,
  onCancel,
  submitLabel = 'Save',
  showCancel = false,
  placeholder = 'Task title',
  autoFocus = false,
  showTestDateOptions = true,
  resetOnClear = false
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<Priority | undefined>(initialPriority);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [showError, setShowError] = useState(false);
  const [showOptions, setShowOptions] = useState(initialTitle.length > 0);

  useEffect(() => {
    setShowOptions(title.length > 0);
  }, [title]);

  const handleSubmit = (e?: Event) => {
    e?.preventDefault();
    
    if (!title.trim()) {
      setShowError(true);
      return;
    }
    
    onSave(title.trim(), priority, dueDate || undefined);
    
    // Reset form if it's for adding new tasks
    if (!showCancel) {
      setTitle('');
      setPriority(undefined);
      setDueDate(new Date().toISOString().split('T')[0]);
      setShowError(false);
      setShowOptions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setTitle(value);
    if (value.trim()) {
      setShowError(false);
    } else if (resetOnClear && !value) {
      // Reset priority and date when text is cleared (only for add mode)
      setPriority(undefined);
      setDueDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Add keydown handler at form level to catch Enter anywhere
  const handleFormKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Check if the date picker dropdown is open
      const dateDropdown = document.querySelector('.date-dropdown-wrapper .absolute');
      if (!dateDropdown) {
        // Only submit if date picker dropdown is not open
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <div className="space-y-3" onKeyDown={handleFormKeyDown}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onInput={(e) => handleInputChange((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && showCancel && onCancel) {
                onCancel();
              }
            }}
            placeholder={placeholder}
            className={`flex-1 px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              showError 
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                : 'border-gray-200 dark:border-zinc-700 focus:ring-indigo-500 dark:focus:ring-indigo-400'
            } ${showCancel ? '' : 'px-4 py-2'}`}
            autoFocus={autoFocus}
            tabIndex={1}
          />
          <button
            type="button"
            onClick={() => handleSubmit()}
            className={`${showCancel ? 'px-4 py-1.5 text-sm' : 'px-6 py-2'} bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors`}
            tabIndex={4}
          >
            {submitLabel}
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        {showError && (
          <p className="text-xs text-red-600 dark:text-red-400 -mt-1">
            Task title cannot be empty
          </p>
        )}
      </div>
      
      {/* Show priority and due date options when there's text */}
      {showOptions && (
        <div className="flex gap-3 items-center animate-fade-in">
          <PrioritySelector value={priority} onChange={setPriority} />
          <DatePicker 
            value={dueDate} 
            onChange={setDueDate} 
            showTestOptions={showTestDateOptions}
          />
        </div>
      )}
    </div>
  );
}
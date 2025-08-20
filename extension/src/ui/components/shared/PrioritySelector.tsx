import { h } from 'preact';
import { Priority } from '../../../types';

interface PrioritySelectorProps {
  value?: Priority;
  onChange: (priority?: Priority) => void;
}

export default function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'high': 
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': 
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': 
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange(value === 'high' ? undefined : 'high')}
        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
          value === 'high' 
            ? getPriorityColor('high')
            : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
        }`}
      >
        High
      </button>
      <button
        type="button"
        onClick={() => onChange(value === 'medium' ? undefined : 'medium')}
        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
          value === 'medium'
            ? getPriorityColor('medium')
            : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
        }`}
      >
        Medium
      </button>
      <button
        type="button"
        onClick={() => onChange(value === 'low' ? undefined : 'low')}
        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
          value === 'low' 
            ? getPriorityColor('low')
            : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
        }`}
      >
        Low
      </button>
    </div>
  );
}
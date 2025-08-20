import { h } from 'preact';
import { Task, Priority } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDraggable?: boolean;
}

export default function TaskItem({ task, onToggle, onDelete, isDraggable }: TaskItemProps) {
  const getPriorityColor = (priority?: Priority) => {
    if (!priority) return {
      border: 'border-gray-300 dark:border-zinc-600',
      bg: 'bg-gray-400 dark:bg-gray-500',
      hover: 'hover:border-gray-400 dark:hover:border-gray-500'
    };
    
    switch(priority) {
      case 'high':
        return {
          border: 'border-red-500 dark:border-red-400',
          bg: 'bg-red-500 dark:bg-red-400',
          hover: 'hover:border-red-600 dark:hover:border-red-300'
        };
      case 'medium':
        return {
          border: 'border-yellow-500 dark:border-yellow-400',
          bg: 'bg-yellow-500 dark:bg-yellow-400',
          hover: 'hover:border-yellow-600 dark:hover:border-yellow-300'
        };
      case 'low':
        return {
          border: 'border-blue-500 dark:border-blue-400',
          bg: 'bg-blue-500 dark:bg-blue-400',
          hover: 'hover:border-blue-600 dark:hover:border-blue-300'
        };
    }
  };

  const formatDueDate = (dateString: string | undefined, isCompleted: boolean) => {
    if (!dateString || isCompleted) return null;
    
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dueText = '';
    let dueClass = 'text-gray-500 dark:text-gray-400';
    
    if (diffDays < 0) {
      dueText = `${Math.abs(diffDays)} days overdue`;
      dueClass = 'text-red-600 dark:text-red-400 font-medium';
    } else if (diffDays === 0) {
      dueText = 'Due today';
      dueClass = 'text-green-600 dark:text-green-400 font-medium';
    } else if (diffDays === 1) {
      dueText = 'Due tomorrow';
      dueClass = 'text-yellow-600 dark:text-yellow-400';
    } else if (diffDays <= 7) {
      dueText = `Due in ${diffDays} days`;
      dueClass = 'text-gray-600 dark:text-gray-300';
    } else {
      // Format as YYYY/MM/DD for longer durations
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dueText = `${year}/${month}/${day}`;
    }
    
    return (
      <span className={`text-xs ${dueClass}`}>
        {dueText}
      </span>
    );
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const priorityColors = getPriorityColor(task.priority);
  
  return (
    <div className="group flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-colors">
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
          task.completed
            ? `${priorityColors.bg} border-current`
            : `${priorityColors.border} ${priorityColors.hover}`
        }`}
      >
        {task.completed && (
          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`${
            task.completed 
              ? 'text-gray-500 dark:text-gray-500 line-through' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatCreatedDate(task.createdAt)}
          </span>
        </div>
        {formatDueDate(task.dueDate, task.completed) && (
          <div className="mt-1">
            {formatDueDate(task.dueDate, task.completed)}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
        title="Delete task"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
import { h } from 'preact';
import { Task, Priority } from '../../types';
import TaskForm from './shared/TaskForm';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  isDraggable?: boolean;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export default function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onUpdate, 
  isDraggable, 
  isEditing = false, 
  onEditStart, 
  onEditEnd 
}: TaskItemProps) {
  
  const getPriorityColor = (priority?: Priority) => {
    if (!priority) return {
      border: 'border-gray-300 dark:border-zinc-600',
      bg: 'bg-gray-400 dark:bg-gray-500',
      hover: 'hover:border-gray-400 dark:hover:border-gray-500',
      gradient: 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-zinc-800/70 dark:to-zinc-800/30',
      hoverGradient: 'hover:from-gray-200 hover:to-gray-100 dark:hover:from-zinc-700/70 dark:hover:to-zinc-700/30'
    };
    
    switch(priority) {
      case 'high':
        return {
          border: 'border-red-500 dark:border-red-400',
          bg: 'bg-red-500 dark:bg-red-400',
          hover: 'hover:border-red-600 dark:hover:border-red-300',
          gradient: 'bg-gradient-to-r from-red-100 to-gray-50 dark:from-red-900/30 dark:to-zinc-800/30',
          hoverGradient: 'hover:from-red-200 hover:to-gray-100 dark:hover:from-red-900/40 dark:hover:to-zinc-700/30'
        };
      case 'medium':
        return {
          border: 'border-yellow-500 dark:border-yellow-400',
          bg: 'bg-yellow-500 dark:bg-yellow-400',
          hover: 'hover:border-yellow-600 dark:hover:border-yellow-300',
          gradient: 'bg-gradient-to-r from-yellow-100 to-gray-50 dark:from-yellow-900/30 dark:to-zinc-800/30',
          hoverGradient: 'hover:from-yellow-200 hover:to-gray-100 dark:hover:from-yellow-900/40 dark:hover:to-zinc-700/30'
        };
      case 'low':
        return {
          border: 'border-blue-500 dark:border-blue-400',
          bg: 'bg-blue-500 dark:bg-blue-400',
          hover: 'hover:border-blue-600 dark:hover:border-blue-300',
          gradient: 'bg-gradient-to-r from-blue-100 to-gray-50 dark:from-blue-900/30 dark:to-zinc-800/30',
          hoverGradient: 'hover:from-blue-200 hover:to-gray-100 dark:hover:from-blue-900/40 dark:hover:to-zinc-700/30'
        };
    }
  };

  const formatDueDate = (dateString: string | undefined, isCompleted: boolean) => {
    if (!dateString) return null;
    
    const date = new Date(dateString + 'T00:00:00'); // Ensure local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Always format the date as YYYY/MM/DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;
    
    if (isCompleted) {
      // For completed tasks, only show the date in gray
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formattedDate}
        </span>
      );
    } else {
      // For active tasks, show with colored relative text and gray date
      let relativeText = '';
      let relativeClass = '';
      
      if (diffDays < 0) {
        relativeText = `${Math.abs(diffDays)} days overdue`;
        relativeClass = 'text-red-600 dark:text-red-400 font-medium';
      } else if (diffDays === 0) {
        relativeText = 'Due today';
        relativeClass = 'text-green-600 dark:text-green-400 font-medium';
      } else if (diffDays === 1) {
        relativeText = 'Due tomorrow';
        relativeClass = 'text-yellow-600 dark:text-yellow-400';
      } else if (diffDays <= 7) {
        relativeText = `Due in ${diffDays} days`;
        relativeClass = 'text-gray-600 dark:text-gray-300';
      }
      
      if (relativeText) {
        return (
          <span className="text-xs">
            <span className={relativeClass}>{relativeText}</span>
            <span className="text-gray-500 dark:text-gray-400"> - {formattedDate}</span>
          </span>
        );
      } else {
        // For dates more than 7 days away, just show the date
        return (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formattedDate}
          </span>
        );
      }
    }
  };

  const priorityColors = getPriorityColor(task.priority);
  
  const handleSave = (title: string, priority?: Priority, dueDate?: string) => {
    onUpdate(task.id, {
      title,
      priority,
      dueDate: dueDate || undefined
    });
    onEditEnd?.();
  };

  const handleCancel = () => {
    onEditEnd?.();
  };
  
  if (isEditing) {
    return (
      <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
        <TaskForm
          initialTitle={task.title}
          initialPriority={task.priority}
          initialDueDate={task.dueDate || ''}
          onSave={handleSave}
          onCancel={handleCancel}
          submitLabel="Save"
          showCancel={true}
          autoFocus={true}
          showTestDateOptions={true}
        />
      </div>
    );
  }
  
  return (
    <div className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${priorityColors.gradient} ${priorityColors.hoverGradient}`}>
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
        <div className={`${task.completed ? 'flex items-baseline gap-2' : ''}`}>
          <span className={`${
            task.completed 
              ? 'text-gray-500 dark:text-gray-500 line-through' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </span>
          {task.completed && (formatDueDate(task.dueDate, task.completed) || task.priority) && (
            <span className="flex-shrink-0 flex items-center gap-2">
              {task.priority && (
                <span className={`text-xs font-medium ${
                  task.priority === 'high' 
                    ? 'text-red-500 dark:text-red-400' 
                    : task.priority === 'medium'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-500 dark:text-blue-400'
                }`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              {formatDueDate(task.dueDate, task.completed)}
            </span>
          )}
        </div>
        {!task.completed && (formatDueDate(task.dueDate, task.completed) || task.priority) && (
          <div className="mt-1 flex items-center gap-2">
            {task.priority && (
              <span className={`text-xs font-medium ${
                task.priority === 'high' 
                  ? 'text-red-600 dark:text-red-400' 
                  : task.priority === 'medium'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
            {formatDueDate(task.dueDate, task.completed)}
          </div>
        )}
      </div>

      {!task.completed && (
        <button
          onClick={() => onEditStart?.()}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

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
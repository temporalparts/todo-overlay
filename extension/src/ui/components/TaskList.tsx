import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Task } from '../../types';
import TaskItem from './TaskItem';
import { getLocalDateString, isBeforeToday } from '../../lib/date';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onReorder: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onUpdate, onReorder }: TaskListProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<Task | null>(null);
  const [tempActiveTasks, setTempActiveTasks] = useState<Task[]>([]);
  const [tempOverdueTasks, setTempOverdueTasks] = useState<Task[]>([]);
  const [dragSection, setDragSection] = useState<'past' | 'present' | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showOverdue, setShowOverdue] = useState(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('tabula_showOverdue');
    return saved !== null ? JSON.parse(saved) : false; // Default to collapsed
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Save overdue section state when it changes
  useEffect(() => {
    localStorage.setItem('tabula_showOverdue', JSON.stringify(showOverdue));
  }, [showOverdue]);
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add one above!</p>
      </div>
    );
  }

  // Sort active tasks by: 1) due date (earliest first, no date last), 2) priority (high>medium>low>none)
  // Uses stable sort to maintain relative order for ties
  const sortActiveTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      // First, sort by due date
      if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate + 'T00:00:00').getTime();
        const dateB = new Date(b.dueDate + 'T00:00:00').getTime();
        if (dateA !== dateB) return dateA - dateB;
      } else if (a.dueDate && !b.dueDate) {
        return -1; // Tasks with dates come before tasks without
      } else if (!a.dueDate && b.dueDate) {
        return 1;
      }
      
      // Then sort by priority
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const priorityA = a.priority ? priorityOrder[a.priority] : 3;
      const priorityB = b.priority ? priorityOrder[b.priority] : 3;
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      // For ties, maintain current order (stable sort)
      return 0;
    });
  };

  // Check if a task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return isBeforeToday(task.dueDate);
  };

  const baseActiveTasks = tasks.filter(t => !t.completed && !isOverdue(t));
  const baseOverdueTasks = tasks.filter(t => !t.completed && isOverdue(t));
  const unsortedCompletedTasks = tasks.filter(t => t.completed);
  
  // Sort overdue tasks by how overdue they are (most overdue first), then by priority
  const sortedOverdueTasks = [...baseOverdueTasks].sort((a, b) => {
    // First, sort by due date (oldest first = most overdue)
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate + 'T00:00:00').getTime();
      const dateB = new Date(b.dueDate + 'T00:00:00').getTime();
      if (dateA !== dateB) return dateA - dateB;
    }
    
    // Then sort by priority
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    const priorityA = a.priority ? priorityOrder[a.priority] : 3;
    const priorityB = b.priority ? priorityOrder[b.priority] : 3;
    return priorityA - priorityB;
  });

  // Sort completed tasks by completion date descending (newest first), then priority descending (high > medium > low)
  const completedTasks = [...unsortedCompletedTasks].sort((a, b) => {
    // First sort by completion date
    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();
    if (dateA !== dateB) return dateB - dateA; // Descending (newest first)
    
    // Then sort by priority (high > medium > low > none)
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    const priorityA = a.priority ? priorityOrder[a.priority] : 3;
    const priorityB = b.priority ? priorityOrder[b.priority] : 3;
    return priorityA - priorityB;
  });
  
  // Use temporary order during drag, otherwise use sorted order for past, base order for present
  const activeTasks = draggedTask && tempActiveTasks.length > 0 ? tempActiveTasks : baseActiveTasks;
  const overdueTasks = draggedTask && tempOverdueTasks.length > 0 ? tempOverdueTasks : baseOverdueTasks;
  
  // Check if tasks are currently sorted
  const checkIfSorted = (taskList: Task[]) => {
    if (taskList.length <= 1) return true; // 0 or 1 tasks are always sorted
    
    // Create a sorted version
    const sorted = sortActiveTasks([...taskList]);
    
    // Compare the IDs in order
    for (let i = 0; i < taskList.length; i++) {
      if (sorted[i].id !== taskList[i].id) {
        return false;
      }
    }
    return true;
  };
  
  const isPresentSorted = checkIfSorted(baseActiveTasks);
  const isPastSorted = checkIfSorted(baseOverdueTasks);

  const handleDragStart = (e: DragEvent, task: Task, section: 'past' | 'present') => {
    setDraggedTask(task);
    setDragSection(section);
    // Always initialize both temp arrays for all drag operations
    setTempActiveTasks([...baseActiveTasks]);
    setTempOverdueTasks([...baseOverdueTasks]);
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/html', ''); // Firefox requires this
  };

  const handleDragEnter = (e: DragEvent, task: Task | null, section: 'past' | 'present') => {
    if (!draggedTask || (task && draggedTask.id === task.id)) return;
    
    // Allow dragging from past to present (but not present to past)
    if (dragSection === 'past' && section === 'present') {
      // Moving from past to present - will update date to today
      const draggedIndexInPresent = tempActiveTasks.findIndex(t => t.id === draggedTask.id);
      const draggedIndexInPast = tempOverdueTasks.findIndex(t => t.id === draggedTask.id);
      
      // If target task is null (empty present section), or target doesn't exist, add to end
      const targetIndex = task ? tempActiveTasks.findIndex(t => t.id === task.id) : -1;
      
      const newTasks = [...tempActiveTasks];
      const newOverdueTasks = [...tempOverdueTasks];
      
      // If dragged task is not yet in present section, add it
      if (draggedIndexInPresent === -1) {
        // Remove from past section first
        if (draggedIndexInPast !== -1) {
          newOverdueTasks.splice(draggedIndexInPast, 1);
        }
        
        // Insert the dragged task with today's date
        const updatedTask = { ...draggedTask, dueDate: getLocalDateString() };
        if (targetIndex === -1) {
          // Add to end if no target (empty section or dragging to empty area)
          newTasks.push(updatedTask);
        } else {
          // Insert at target position
          newTasks.splice(targetIndex, 0, updatedTask);
        }
      } else {
        // Already in present, just reorder
        newTasks.splice(draggedIndexInPresent, 1);
        const updatedTask = { ...draggedTask, dueDate: getLocalDateString() };
        if (targetIndex === -1) {
          newTasks.push(updatedTask);
        } else {
          newTasks.splice(targetIndex, 0, updatedTask);
        }
      }
      
      setTempActiveTasks(newTasks);
      setTempOverdueTasks(newOverdueTasks);
    } else if (dragSection === section) {
      // Same section reordering
      if (section === 'present') {
        const draggedIndex = tempActiveTasks.findIndex(t => t.id === draggedTask.id);
        const targetIndex = task ? tempActiveTasks.findIndex(t => t.id === task.id) : -1;
        
        if (draggedIndex === -1) return;
        
        const newTasks = [...tempActiveTasks];
        newTasks.splice(draggedIndex, 1);
        
        if (targetIndex === -1 || !task) {
          // Add to end if dragging to empty space
          newTasks.push(draggedTask);
        } else {
          // Insert at target position
          const adjustedTarget = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
          newTasks.splice(adjustedTarget, 0, draggedTask);
        }
        
        setTempActiveTasks(newTasks);
      } else if (section === 'past') {
        const draggedIndex = tempOverdueTasks.findIndex(t => t.id === draggedTask.id);
        const targetIndex = task ? tempOverdueTasks.findIndex(t => t.id === task.id) : -1;
        
        if (draggedIndex === -1) return;
        
        const newTasks = [...tempOverdueTasks];
        newTasks.splice(draggedIndex, 1);
        
        if (targetIndex === -1 || !task) {
          // Add to end if dragging to empty space
          newTasks.push(draggedTask);
        } else {
          // Insert at target position
          const adjustedTarget = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
          newTasks.splice(adjustedTarget, 0, draggedTask);
        }
        
        setTempOverdueTasks(newTasks);
      }
    }
    setDraggedOverTask(task);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, section: 'past' | 'present') => {
    e.preventDefault();
    
    if (draggedTask) {
      // Handle cross-section drag from Past to Present
      if (dragSection === 'past' && section === 'present') {
        // The task has already been moved to tempActiveTasks with today's date in handleDragEnter
        // Just combine all sections using the modified temp arrays
        const newTasks = [...tempOverdueTasks, ...tempActiveTasks, ...completedTasks];
        
        // SAFEGUARD: Ensure we're not losing tasks
        const originalCount = tasks.length;
        const newCount = newTasks.length;
        if (newCount === originalCount && newCount > 0) {
          onReorder(newTasks);
        } else {
          console.error('[TABULA] Task count mismatch prevented data loss. Original:', originalCount, 'New:', newCount);
        }
      }
      // Handle same-section reordering
      else if (dragSection === section) {
        if (section === 'present' && tempActiveTasks.length > 0) {
          // Commit the temporary order for present section
          // Use tempOverdueTasks since it may have been modified during drag
          const newTasks = [...tempOverdueTasks, ...tempActiveTasks, ...completedTasks];
          
          // SAFEGUARD: Ensure we're not losing tasks
          const originalCount = tasks.length;
          const newCount = newTasks.length;
          if (newCount === originalCount && newCount > 0) {
            onReorder(newTasks);
          } else {
            console.error('[TABULA] Task count mismatch prevented data loss. Original:', originalCount, 'New:', newCount);
          }
        } else if (section === 'past') {
          // Commit the temporary order for past section
          // Use tempActiveTasks since it may have been modified during drag
          const newTasks = [...tempOverdueTasks, ...tempActiveTasks, ...completedTasks];
          
          // SAFEGUARD: Ensure we're not losing tasks
          const originalCount = tasks.length;
          const newCount = newTasks.length;
          if (newCount === originalCount && newCount > 0) {
            onReorder(newTasks);
          } else {
            console.error('[TABULA] Task count mismatch prevented data loss. Original:', originalCount, 'New:', newCount);
          }
        }
      }
      // Prevent dragging from Present to Past
      else if (dragSection === 'present' && section === 'past') {
        console.log('[TABULA] Cannot drag from Present to Past');
      }
    }
    
    setDraggedTask(null);
    setDraggedOverTask(null);
    setTempActiveTasks([]);
    setTempOverdueTasks([]);
    setDragSection(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverTask(null);
    setTempActiveTasks([]);
    setTempOverdueTasks([]);
    setDragSection(null);
  };

  const handleSortPresent = () => {
    if (!isPresentSorted) {
      const sortedTasks = [...baseOverdueTasks, ...sortActiveTasks(baseActiveTasks), ...completedTasks];
      
      // SAFEGUARD: Ensure we're not losing tasks
      const originalCount = tasks.length;
      const newCount = sortedTasks.length;
      if (newCount === originalCount && newCount > 0) {
        onReorder(sortedTasks);
      } else {
        console.error('[TABULA] Sort prevented data loss. Original:', originalCount, 'New:', newCount);
      }
    }
  };

  const handleSortPast = () => {
    if (!isPastSorted) {
      const sortedPastTasks = sortActiveTasks([...baseOverdueTasks]);
      const sortedTasks = [...sortedPastTasks, ...baseActiveTasks, ...completedTasks];
      
      // SAFEGUARD: Ensure we're not losing tasks
      const originalCount = tasks.length;
      const newCount = sortedTasks.length;
      if (newCount === originalCount && newCount > 0) {
        onReorder(sortedTasks);
      } else {
        console.error('[TABULA] Sort prevented data loss. Original:', originalCount, 'New:', newCount);
      }
    }
  };

  return (
    <div className="space-y-4">
      {overdueTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {activeTasks.length > 0 ? (
              <button
                onClick={() => setShowOverdue(!showOverdue)}
                className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                  showOverdue 
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' 
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'
                }`}
              >
                {showOverdue ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                Past {showOverdue && `(${overdueTasks.length})`}
              </button>
            ) : (
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Past ({overdueTasks.length})
              </h3>
            )}
            {(showOverdue || activeTasks.length === 0) && (
              <button
                onClick={handleSortPast}
                disabled={isPastSorted}
                className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1 ${
                  isPastSorted
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-default'
                    : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer'
                }`}
              >
                {isPastSorted ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sorted
                  </>
                ) : (
                  'Sort'
                )}
              </button>
            )}
          </div>
          {(showOverdue || activeTasks.length === 0) && (
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task, 'past')}
                  onDragEnter={(e) => handleDragEnter(e, task, 'past')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'past')}
                  onDragEnd={handleDragEnd}
                  className={`transition-all duration-200 cursor-move ${
                    draggedTask && draggedTask.id === task.id ? 'opacity-50' : ''
                  }`}
                >
                  <TaskItem 
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    isDraggable={true}
                    isEditing={editingTaskId === task.id}
                    onEditStart={() => setEditingTaskId(task.id)}
                    onEditEnd={() => setEditingTaskId(null)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(activeTasks.length > 0 || overdueTasks.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Present {activeTasks.length > 0 && `(${activeTasks.length})`}
            </h3>
            {activeTasks.length > 0 && (
              <button
                onClick={handleSortPresent}
                disabled={isPresentSorted}
                className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1 ${
                  isPresentSorted
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-default'
                    : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer'
                }`}
              >
                {isPresentSorted ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sorted
                  </>
                ) : (
                  'Sort'
                )}
              </button>
            )}
          </div>
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <div
                key={task.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, task, 'present')}
                onDragEnter={(e) => handleDragEnter(e, task, 'present')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'present')}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 cursor-move ${
                  draggedTask && draggedTask.id === task.id ? 'opacity-50' : ''
                }`}
              >
                <TaskItem 
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isDraggable={true}
                  isEditing={editingTaskId === task.id}
                  onEditStart={() => setEditingTaskId(task.id)}
                  onEditEnd={() => setEditingTaskId(null)}
                />
              </div>
            ))
          ) : (
            <div 
              className="p-8 border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg text-center text-gray-500 dark:text-gray-400"
              onDragEnter={(e) => handleDragEnter(e, null, 'present')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'present')}
              onDragEnd={handleDragEnd}
            >
              <p className="text-sm">Drag tasks from Past to make them current</p>
            </div>
          )}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-full text-left"
          >
            {showCompleted ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            Completed
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isEditing={editingTaskId === task.id}
                  onEditStart={() => setEditingTaskId(task.id)}
                  onEditEnd={() => setEditingTaskId(null)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
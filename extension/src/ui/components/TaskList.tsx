import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Task } from '../../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<Task | null>(null);
  const [tempActiveTasks, setTempActiveTasks] = useState<Task[]>([]);
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

  // Sort active tasks by: 1) due date (earliest first, no date last), 2) priority (high>medium>low>none), 3) creation date (oldest first)
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
      
      // Finally, sort by creation date (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const baseActiveTasks = tasks.filter(t => !t.completed);
  const unsortedCompletedTasks = tasks.filter(t => t.completed);
  
  // Sort completed tasks by date descending (newest first), then priority descending (high > medium > low)
  const completedTasks = [...unsortedCompletedTasks].sort((a, b) => {
    // First sort by completion date (using createdAt as proxy for completion time)
    // We could also use dueDate if preferred
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (dateA !== dateB) return dateB - dateA; // Descending (newest first)
    
    // Then sort by priority (high > medium > low > none)
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    const priorityA = a.priority ? priorityOrder[a.priority] : 3;
    const priorityB = b.priority ? priorityOrder[b.priority] : 3;
    return priorityA - priorityB;
  });
  
  // Use temporary order during drag, otherwise use base order
  const activeTasks = draggedTask && tempActiveTasks.length > 0 ? tempActiveTasks : baseActiveTasks;
  
  // Check if tasks are currently sorted
  const checkIfSorted = () => {
    if (baseActiveTasks.length <= 1) return true; // 0 or 1 tasks are always sorted
    
    // Create a sorted version
    const sorted = sortActiveTasks([...baseActiveTasks]);
    
    // Compare the IDs in order
    for (let i = 0; i < baseActiveTasks.length; i++) {
      if (sorted[i].id !== baseActiveTasks[i].id) {
        return false;
      }
    }
    return true;
  };
  
  const isSorted = checkIfSorted();

  const handleDragStart = (e: DragEvent, task: Task) => {
    setDraggedTask(task);
    setTempActiveTasks([...baseActiveTasks]);
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/html', ''); // Firefox requires this
  };

  const handleDragEnter = (e: DragEvent, task: Task) => {
    if (!draggedTask || draggedTask.id === task.id) return;
    
    const draggedIndex = tempActiveTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tempActiveTasks.findIndex(t => t.id === task.id);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newTasks = [...tempActiveTasks];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    
    setTempActiveTasks(newTasks);
    setDraggedOverTask(task);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    
    if (draggedTask && tempActiveTasks.length > 0) {
      // Commit the temporary order
      const newTasks = [...tempActiveTasks, ...completedTasks];
      onReorder(newTasks);
    }
    
    setDraggedTask(null);
    setDraggedOverTask(null);
    setTempActiveTasks([]);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverTask(null);
    setTempActiveTasks([]);
  };

  const handleSort = () => {
    if (!isSorted) {
      const sortedTasks = [...sortActiveTasks(activeTasks), ...completedTasks];
      onReorder(sortedTasks);
    }
  };

  return (
    <div className="space-y-4">
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Active ({activeTasks.length})
            </h3>
            <button
              onClick={handleSort}
              disabled={isSorted}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex items-center gap-1 ${
                isSorted
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-default'
                  : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer'
              }`}
            >
              {isSorted ? (
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
          </div>
          {activeTasks.map((task) => (
            <div
              key={task.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnter={(e) => handleDragEnter(e, task)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 cursor-move ${
                draggedTask && draggedTask.id === task.id ? 'opacity-50' : ''
              }`}
            >
              <TaskItem 
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                isDraggable={true}
              />
            </div>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Completed ({completedTasks.length})
          </h3>
          {completedTasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
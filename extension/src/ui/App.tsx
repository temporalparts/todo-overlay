import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { Task, Settings as SettingsType } from '../types';
import { getTasks, saveTasks, getSettings } from '../state/storage';
import { getRootDomain } from '../lib/domain';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import Settings from './components/Settings';

interface AppProps {
  onSnooze: (minutes: number) => void;
}

export default function App({ onSnooze }: AppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'settings'>('tasks');
  const currentDomain = getRootDomain(window.location.href);

  useEffect(() => {
    loadInitialData();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local') {
        if (changes.tasks) {
          console.log('[TABULA] Tasks updated from another tab');
          setTasks(changes.tasks.newValue || []);
        }
        if (changes.settings) {
          console.log('[TABULA] Settings updated from another tab');
          setSettings(changes.settings.newValue || null);
        }
      }
    };
    
    browser.storage.onChanged.addListener(handleStorageChange);
    
    // Cleanup listener on unmount
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadInitialData = async () => {
    const [loadedTasks, loadedSettings] = await Promise.all([
      getTasks(),
      getSettings()
    ]);
    setTasks(loadedTasks);
    setSettings(loadedSettings);
    setLoading(false);
  };

  const addTask = async (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const handleSnooze = () => {
    console.log('[TABULA App] Snooze button clicked');
    try {
      const minutes = settings?.snoozeMinutes || 0.25;
      onSnooze(minutes);
    } catch (error) {
      console.error('[TABULA App] Error calling onSnooze:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[TABULA App] Dismiss button clicked');
    try {
      const minutes = settings?.dismissMinutes || 1;
      onSnooze(minutes);
    } catch (error) {
      console.error('[TABULA App] Error calling onSnooze:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-600 dark:text-gray-400">
          Loading tasks...
        </div>
      </div>
    );
  }

  // Full-screen takeover UI
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col h-screen w-screen overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">TABULA</h1>
                <p className="text-xs text-white/80 tracking-wider">
                  <span className="font-bold">TA</span>ke <span className="font-bold">B</span>ack <span className="font-bold">YOUR</span> <span className="underline font-bold">L</span><span className="underline">ife</span> <span className="font-bold">A</span>gain
                </p>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                URL matches: {currentDomain}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSnooze}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                title={`Snooze for ${settings?.snoozeMinutes || 0.25} minutes`}
              >
                Snooze {settings?.snoozeMinutes && settings.snoozeMinutes < 1 
                  ? `${settings.snoozeMinutes * 60}s` 
                  : `${settings?.snoozeMinutes || 0.25}m`}
              </button>
              <button
                onClick={handleDismiss}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                title={`Dismiss for ${settings?.dismissMinutes || 1} minutes`}
              >
                Dismiss {settings?.dismissMinutes || 1}m
              </button>
            </div>
          </div>
          <p className="text-white/80">
            Your time is valuable. Consider your priorities prior to giving your time to {currentDomain}.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'tasks'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'settings'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto p-6">
          {activeTab === 'tasks' ? (
            <>
              {/* Add task form */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add New Task
                </h2>
                <AddTask onAdd={addTask} />
              </div>

              {/* Task list */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Your Tasks
                </h2>
                <TaskList 
                  tasks={tasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>
            </>
          ) : (
            <Settings />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {tasks.filter(t => !t.completed).length} tasks to reclaim your day
          </span>
          <span>
            Every moment counts. Take back your life!
          </span>
        </div>
      </div>
    </div>
  );
}
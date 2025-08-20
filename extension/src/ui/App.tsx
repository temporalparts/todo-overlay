import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { Task, Settings as SettingsType, Priority } from '../types';
import { getTasks, saveTasks, getSettings } from '../state/storage';
import { getRootDomain } from '../lib/domain';
import { getShuffledQuotes, Quote } from '../data/quotes';
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
  const [scrollToDomains, setScrollToDomains] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [quotesArray, setQuotesArray] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentDomain = getRootDomain(window.location.href);

  // Helper to format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      // Less than 1 minute: show seconds with up to 1 decimal place
      const seconds = minutes * 60;
      const rounded = Math.round(seconds * 10) / 10;
      return rounded % 1 === 0 ? `${Math.floor(rounded)}s` : `${rounded}s`;
    } else {
      // 1 minute or more: show as XmYs format
      const wholeMinutes = Math.floor(minutes);
      const seconds = Math.round((minutes - wholeMinutes) * 60);
      
      if (seconds === 0) {
        return `${wholeMinutes}m`;
      } else {
        return `${wholeMinutes}m${seconds}s`;
      }
    }
  };

  // Initialize quotes on mount
  useEffect(() => {
    const shuffled = getShuffledQuotes();
    // Find Mary Oliver quote and move it to the front
    const maryOliverIndex = shuffled.findIndex(q => 
      q.author === "Mary Oliver" && 
      q.text.includes("Tell me, what is it you plan to do")
    );
    if (maryOliverIndex > 0) {
      const maryOliverQuote = shuffled[maryOliverIndex];
      shuffled.splice(maryOliverIndex, 1);
      shuffled.unshift(maryOliverQuote);
    }
    setQuotesArray(shuffled);
  }, []);

  // Rotate quotes based on interval setting
  useEffect(() => {
    if (!settings || quotesArray.length === 0 || !settings.enableQuoteRotation) return;
    
    const transitionDuration = 700; // Duration of the fade animation in ms
    const interval = setInterval(() => {
      // Start fade out
      setIsTransitioning(true);
      
      // After fade out, change quote and fade in
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotesArray.length);
      }, 400);
      
      // Start fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 450);
    }, (settings.quoteRotationSeconds * 1000) + transitionDuration);
    
    return () => clearInterval(interval);
  }, [settings?.enableQuoteRotation, settings?.quoteRotationSeconds, quotesArray.length]);

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
          const newSettings = changes.settings.newValue;
          setSettings(newSettings || null);
          if (newSettings) {
            applyTheme(newSettings.theme);
          }
        }
      }
    };
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (settings?.theme === 'auto') {
        setIsDark(e.matches);
      }
    };
    
    browser.storage.onChanged.addListener(handleStorageChange);
    mediaQuery.addEventListener('change', handleThemeChange);
    
    // Cleanup listeners on unmount
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [settings?.theme]);

  const loadInitialData = async () => {
    const [loadedTasks, loadedSettings] = await Promise.all([
      getTasks(),
      getSettings()
    ]);
    setTasks(loadedTasks);
    setSettings(loadedSettings);
    
    // Apply theme
    applyTheme(loadedSettings.theme);
    
    setLoading(false);
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(theme === 'dark');
    }
  };

  const addTask = async (title: string, priority?: Priority, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
      dueDate
    };
    
    // Always add new tasks at the top for better visibility
    const updatedTasks = [newTask, ...tasks];
    
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        return {
          ...task,
          completed: isCompleting,
          completedAt: isCompleting ? new Date().toISOString() : undefined
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const reorderTasks = async (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const handleSnooze = () => {
    console.log('[TABULA App] Snooze button clicked');
    try {
      const minutes = settings?.snoozeMinutes || 15;
      onSnooze(minutes);
    } catch (error) {
      console.error('[TABULA App] Error calling onSnooze:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[TABULA App] Dismiss button clicked');
    try {
      const minutes = settings?.dismissMinutes || 60;
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
    <div className={`fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col h-screen w-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-5xl font-light tracking-tight">tabula</h1>
                <p className="text-xs text-white/80 tracking-wider">
                  <span className="underline">ta</span>ke <span className="underline">b</span>ack <span className="italic underline font-dramatic tracking-wide text-sm">your</span> <span className="underline">L</span>ife <span className="underline">a</span>gain
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setScrollToDomains(true);
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors cursor-pointer"
                title="Click to manage enabled domains"
              >
                URL matches: {currentDomain}
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSnooze}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-normal transition-colors"
                title={`Snooze for ${settings?.snoozeMinutes || 15} minutes`}
              >
                Snooze ({formatTime(settings?.snoozeMinutes || 15)})
              </button>
              <button
                onClick={handleDismiss}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-normal transition-colors"
                title={`Dismiss for ${settings?.dismissMinutes || 60} minutes`}
              >
                Dismiss ({formatTime(settings?.dismissMinutes || 60)})
              </button>
            </div>
          </div>
          <p className="text-white/80">
            Your life is precious. Consider before gifting your time to <span className="font-mono">
              {(() => {
                const lowerDomain = currentDomain.toLowerCase();
                if (lowerDomain === 'facebook.com' || lowerDomain === 'instagram.com') {
                  return 'Mark Zuckerberg';
                } else if (lowerDomain === 'x.com' || lowerDomain === 'twitter.com') {
                  return 'Elon Musk';
                } else {
                  return currentDomain;
                }
              })()}
            </span>.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-3 font-normal transition-colors border-b-2 ${
                activeTab === 'tasks'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 font-normal transition-colors border-b-2 ${
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
                <AddTask onAdd={addTask} />
              </div>

              {/* Task list */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
                <TaskList 
                  tasks={tasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onUpdate={updateTask}
                  onReorder={reorderTasks}
                />
              </div>
            </>
          ) : (
            <Settings scrollToDomains={scrollToDomains} onScrollComplete={() => setScrollToDomains(false)} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {tasks.filter(t => !t.completed).length} tasks to reclaim your day
          </span>
          {quotesArray.length > 0 && (
            <div className="text-right flex-1 ml-4 relative overflow-hidden">
              <div 
                key={currentQuoteIndex}
                className={`${
                  isTransitioning 
                    ? 'opacity-0 translate-y-3 transition-all duration-500' 
                    : 'animate-slide-up-fade'
                }`}
              >
                <span className="italic inline">"{quotesArray[currentQuoteIndex].text}" </span>
                <span className="whitespace-nowrap inline">-{quotesArray[currentQuoteIndex].author}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
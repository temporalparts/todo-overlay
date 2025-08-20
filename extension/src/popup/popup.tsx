import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { Task } from '../types';
import { getTasks } from '../state/storage';
import '../styles/tailwind.css';

function Popup() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
    setLoading(false);
  };

  const openOverlay = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      try {
        await browser.tabs.sendMessage(tab.id, { type: 'OPEN_OVERLAY' });
        window.close();
      } catch {
        // Content script not injected, inject it first
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/inject.js']
        });
        setTimeout(() => {
          browser.tabs.sendMessage(tab.id!, { type: 'OPEN_OVERLAY' });
          window.close();
        }, 100);
      }
    }
  };

  const openOptions = () => {
    browser.runtime.openOptionsPage();
  };

  const activeTasks = tasks.filter(t => !t.completed);

  return (
    <div className="w-80 p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          NudgeNotes
        </h1>
        <button
          onClick={openOptions}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center py-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {activeTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Tasks
            </div>
          </div>

          <button
            onClick={openOverlay}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Open Todo List
          </button>

          <button
            onClick={openOptions}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-sm"
          >
            Manage Settings
          </button>
        </div>
      )}
    </div>
  );
}

// Render popup
const container = document.getElementById('app');
if (container) {
  render(<Popup />, container);
}
import { h } from 'preact';

interface TopBarProps {
  domain: string;
  onSnooze: () => void;
  onDismiss: () => void;
}

export default function TopBar({ domain, onSnooze, onDismiss }: TopBarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/10">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
          {domain}
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          NudgeNotes
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onSnooze}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Snooze for 15 seconds (testing)"
        >
          Snooze 15s
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="Dismiss for 1 minute (testing)"
        >
          Dismiss 1m
        </button>
      </div>
    </div>
  );
}
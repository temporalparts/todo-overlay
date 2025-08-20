import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Settings } from '../types';
import { getSettings, saveSettings, getTasks, saveTasks } from '../state/storage';
import { getRootDomain } from '../lib/domain';
import '../styles/tailwind.css';

function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const addDomain = () => {
    if (!settings || !newDomain) return;
    
    // Clean and validate domain
    let domain = newDomain.toLowerCase().trim();
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
    domain = domain.split('/')[0]; // Remove path
    
    if (!domain || settings.domains.includes(domain)) return;
    
    const updatedSettings = {
      ...settings,
      domains: [...settings.domains, domain]
    };
    setSettings(updatedSettings);
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      domains: settings.domains.filter(d => d !== domain)
    };
    setSettings(updatedSettings);
  };

  const handleSave = async () => {
    if (!settings) return;
    
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = async () => {
    const tasks = await getTasks();
    const data = {
      tasks,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nudgenotes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.tasks) await saveTasks(data.tasks);
      if (data.settings) {
        await saveSettings(data.settings);
        setSettings(data.settings);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Invalid backup file');
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          NudgeNotes Settings
        </h1>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Domain Allowlist
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The overlay will automatically appear on these domains (unless snoozed).
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDomain}
              onInput={(e) => setNewDomain((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              placeholder="Enter domain (e.g., reddit.com)"
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={addDomain}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {settings.domains.map(domain => (
              <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <span className="text-gray-900 dark:text-white">{domain}</span>
                <button
                  onClick={() => removeDomain(domain)}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Behavior
          </h2>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoOpenOnAllowlisted}
              onChange={(e) => setSettings({
                ...settings,
                autoOpenOnAllowlisted: (e.target as HTMLInputElement).checked
              })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <span className="text-gray-900 dark:text-white">
              Automatically open overlay on allowlisted domains
            </span>
          </label>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Theme
          </h2>
          
          <div className="flex gap-3">
            {(['auto', 'light', 'dark'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setSettings({ ...settings, theme })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.theme === theme
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Management
          </h2>
          
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-lg font-medium transition-colors"
            >
              Export Data
            </button>
            <label className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-lg font-medium transition-colors cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Render options
const container = document.getElementById('app');
if (container) {
  render(<Options />, container);
}
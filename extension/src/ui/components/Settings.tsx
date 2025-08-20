import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { getSettings, saveSettings } from '../../state/storage';
import { Settings as SettingsType } from '../../types';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.settings) {
        console.log('[TABULA Settings] Settings updated from another tab');
        setSettings(changes.settings.newValue || null);
      }
    };
    
    browser.storage.onChanged.addListener(handleStorageChange);
    
    // Cleanup listener on unmount
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
    setLoading(false);
  };

  const handleAddDomain = async () => {
    if (!settings || !newDomain) return;
    
    // Clean up domain (remove protocol, www, trailing slash)
    const cleanDomain = newDomain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase();
    
    if (!cleanDomain || settings.domains.includes(cleanDomain)) {
      setNewDomain('');
      return;
    }
    
    const updatedSettings = {
      ...settings,
      domains: [...settings.domains, cleanDomain]
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setNewDomain('');
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      domains: settings.domains.filter(d => d !== domain)
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleToggleAutoOpen = async () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      autoOpenOnAllowlisted: !settings.autoOpenOnAllowlisted
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      theme
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleTimersUpdate = async (field: 'snoozeMinutes' | 'dismissMinutes', value: number) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [field]: value
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-400">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme setting */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-4 py-2 rounded-lg border ${
                settings.theme === 'light'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-600'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-4 py-2 rounded-lg border ${
                settings.theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-600'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange('auto')}
              className={`px-4 py-2 rounded-lg border ${
                settings.theme === 'auto'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-600'
              }`}
            >
              Auto
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Auto follows your system theme preference
          </p>
        </div>
      </div>

      {/* Auto-open setting */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Behavior
        </h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoOpenOnAllowlisted}
            onChange={handleToggleAutoOpen}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700 dark:text-gray-300">
            Automatically show overlay on blocked domains
          </span>
        </label>
      </div>

      {/* Timer settings */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Timers
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Snooze Duration (minutes)
            </label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={settings.snoozeMinutes}
              onChange={(e) => handleTimersUpdate('snoozeMinutes', parseFloat(e.currentTarget.value) || 5)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently: {settings.snoozeMinutes < 1 ? `${settings.snoozeMinutes * 60} seconds` : `${settings.snoozeMinutes} minutes`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dismiss Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={settings.dismissMinutes}
              onChange={(e) => handleTimersUpdate('dismissMinutes', parseInt(e.currentTarget.value) || 60)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently: {settings.dismissMinutes} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Blocked domains */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Blocked Domains
        </h3>
        
        {/* Add domain form */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            onClick={handleAddDomain}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Domain
          </button>
        </div>

        {/* Domain list */}
        <div className="space-y-2">
          {settings.domains.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No domains blocked yet. Add domains above to get started.
            </p>
          ) : (
            settings.domains.map(domain => (
              <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                <span className="text-gray-900 dark:text-white font-mono text-sm">
                  {domain}
                </span>
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove domain"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
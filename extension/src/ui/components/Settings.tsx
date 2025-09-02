import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import browser from 'webextension-polyfill';
import { getSettings, saveSettings } from '../../state/storage';
import { Settings as SettingsType } from '../../types';
import { normalizeDomainPattern, validateDomainPattern } from '../../lib/domain';

interface SettingsProps {
  scrollToDomains?: boolean;
  onScrollComplete?: () => void;
}

interface DomainRowProps {
  domain: string;
  onRemove: (domain: string) => void;
  highlightOnCreate?: boolean;
}

function DomainRow({ domain, onRemove, highlightOnCreate = false }: DomainRowProps) {
  const [isHighlighted, setIsHighlighted] = useState(highlightOnCreate);

  useEffect(() => {
    if (highlightOnCreate) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightOnCreate]);

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg transition-all duration-300 ${
      isHighlighted ? 'ring-2 ring-yellow-300 dark:ring-yellow-600' : ''
    }`}>
      <span className="text-gray-900 dark:text-white font-mono text-sm">
        {domain}
      </span>
      <button
        onClick={() => onRemove(domain)}
        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        title="Remove domain"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Settings({ scrollToDomains, onScrollComplete }: SettingsProps) {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [justAddedDomains, setJustAddedDomains] = useState<Set<string>>(new Set());
  const [domainError, setDomainError] = useState<string | null>(null);
  const [showPatternHelp, setShowPatternHelp] = useState(false);
  const domainsRef = useRef<HTMLDivElement>(null);

  // Helper to format time display for settings
  const formatTimeDisplay = (minutes: number): string => {
    if (minutes < 1) {
      // Less than 1 minute: show as seconds
      const seconds = minutes * 60;
      const rounded = Math.round(seconds * 10) / 10;
      if (rounded % 1 === 0) {
        return `${Math.floor(rounded)} seconds`;
      } else {
        return `${rounded} seconds`;
      }
    } else {
      // 1 minute or more: show as X minutes Y seconds format
      const wholeMinutes = Math.floor(minutes);
      const seconds = Math.round((minutes - wholeMinutes) * 60);
      
      if (seconds === 0) {
        return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''}`;
      } else {
        return `${wholeMinutes} minute${wholeMinutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (scrollToDomains && domainsRef.current && !loading) {
      // Add a small delay to ensure the content is rendered
      setTimeout(() => {
        if (domainsRef.current) {
          domainsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (onScrollComplete) {
            // Keep the highlight for 2 seconds
            setTimeout(onScrollComplete, 2000);
          }
        }
      }, 100);
    }
  }, [scrollToDomains, loading, onScrollComplete]);

  useEffect(() => {
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.settings) {
        console.log('[TABULA Settings] Settings updated from another tab');
        const oldSettings = changes.settings.oldValue;
        const newSettings = changes.settings.newValue;
        
        if (oldSettings && newSettings) {
          // Check if a new domain was added
          const oldDomains = oldSettings.domains || [];
          const newDomains = newSettings.domains || [];
          
          // Find newly added domains
          const addedDomains = newDomains.filter((d: string) => !oldDomains.includes(d));
          
          // Highlight any newly added domains
          addedDomains.forEach((domain: string) => {
            setJustAddedDomains(prev => new Set([...prev, domain]));
            
            // Remove from just added after 2.5 seconds
            setTimeout(() => {
              setJustAddedDomains(prev => {
                const newSet = new Set(prev);
                newSet.delete(domain);
                return newSet;
              });
            }, 2500);
          });
        }
        
        setSettings(newSettings || null);
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
    
    // Clear any previous error
    setDomainError(null);
    
    // Validate the domain pattern
    const validationError = validateDomainPattern(newDomain);
    if (validationError) {
      setDomainError(validationError);
      setTimeout(() => setDomainError(null), 4000);
      return;
    }
    
    // Normalize the pattern for storage
    const normalizedPattern = normalizeDomainPattern(newDomain);
    
    if (!normalizedPattern) {
      setNewDomain('');
      return;
    }
    
    // Helper function to highlight a domain
    const highlightDomain = (domain: string) => {
      setJustAddedDomains(prev => new Set([...prev, domain]));
      
      // Remove from just added after 2.5 seconds (slightly longer than highlight duration)
      setTimeout(() => {
        setJustAddedDomains(prev => {
          const newSet = new Set(prev);
          newSet.delete(domain);
          return newSet;
        });
      }, 2500);
    };
    
    // Check if pattern already exists
    if (settings.domains.includes(normalizedPattern)) {
      setNewDomain('');
      highlightDomain(normalizedPattern);
      return;
    }
    
    const updatedSettings = {
      ...settings,
      domains: [...settings.domains, normalizedPattern]
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setNewDomain('');
    
    // Highlight the newly added pattern
    highlightDomain(normalizedPattern);
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

  const handleTimersUpdate = async (field: 'snoozeMinutes' | 'dismissMinutes' | 'quoteRotationSeconds', value: number) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [field]: value
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleToggleQuoteRotation = async () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      enableQuoteRotation: !settings.enableQuoteRotation
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleTogglePlaceholderRotation = async () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      enablePlaceholderRotation: !settings.enablePlaceholderRotation
    };
    
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleSave = async (updatedSettings: SettingsType) => {
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
      {/* Support/Contribute section */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Support TABULA
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          TABULA is open source and free to use. If you find it helpful in reclaiming your time, consider supporting the project:
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://chromewebstore.google.com/detail/tabula/ljcogekgnjdiknmficpiamehmlnemakg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Leave a Review
          </a>
          <a
            href="https://github.com/temporalparts/todo-overlay"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Star on GitHub
          </a>
          <a
            href="https://ko-fi.com/temporalparts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
            </svg>
            Support on Ko-fi
          </a>
        </div>
      </div>

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
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoOpenOnAllowlisted}
              onChange={handleToggleAutoOpen}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Automatically show overlay on enabled domains
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enablePlaceholderRotation}
              onChange={handleTogglePlaceholderRotation}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Rotate task input placeholder text
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showOnNewTab}
              onChange={() => handleSave({ ...settings, showOnNewTab: !settings.showOnNewTab })}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show TABULA on new tab pages
            </span>
          </label>
        </div>
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
              min="1"
              step="1"
              value={settings.snoozeMinutes}
              onChange={(e) => handleTimersUpdate('snoozeMinutes', parseFloat(e.currentTarget.value) || 5)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently: {formatTimeDisplay(settings.snoozeMinutes)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dismiss Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={settings.dismissMinutes}
              onChange={(e) => handleTimersUpdate('dismissMinutes', parseInt(e.currentTarget.value) || 60)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently: {formatTimeDisplay(settings.dismissMinutes)}
            </p>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={settings.enableQuoteRotation}
                onChange={handleToggleQuoteRotation}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Quote Rotation
              </span>
            </label>
            {settings.enableQuoteRotation && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quote Display Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={settings.quoteRotationSeconds}
                  onChange={(e) => handleTimersUpdate('quoteRotationSeconds', parseInt(e.currentTarget.value) || 20)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  disabled={!settings.enableQuoteRotation}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Each quote displays for {settings.quoteRotationSeconds} seconds
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enabled domains */}
      <div ref={domainsRef} className={`bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 transition-all duration-300 ${scrollToDomains ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enabled Domains
        </h3>
        
        {/* Add domain form */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => {
                setNewDomain(e.currentTarget.value);
                setDomainError(null); // Clear error on typing
              }}
              onKeyUp={(e) => {
                // Support Enter, Numpad Enter, and with any modifier keys (Cmd/Ctrl/Shift)
                if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
                  handleAddDomain();
                }
              }}
              placeholder="e.g. github.com, docs.google.com, reddit.com/r/programming"
              className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                domainError 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-zinc-600'
              }`}
            />
            <button
              onClick={handleAddDomain}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Domain
            </button>
          </div>
          {domainError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {domainError}
            </p>
          )}
        </div>

        {/* Pattern examples help text - collapsible */}
        <div className="mb-4">
          <button
            onClick={() => setShowPatternHelp(!showPatternHelp)}
            className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
              <svg 
                className={`w-3 h-3 transition-transform ${showPatternHelp ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
              Pattern Examples
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {showPatternHelp ? 'Hide' : 'Show'} supported formats
            </span>
          </button>
          
          {showPatternHelp && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <code className="bg-white/50 dark:bg-black/20 px-1 rounded">google.com</code>
                    <span className="text-blue-500 dark:text-blue-300 ml-2">Matches all Google subdomains (mail, docs, etc.)</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <code className="bg-white/50 dark:bg-black/20 px-1 rounded">mail.google.com</code>
                    <span className="text-blue-500 dark:text-blue-300 ml-2">Matches only Gmail specifically</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <code className="bg-white/50 dark:bg-black/20 px-1 rounded">github.com/facebook</code>
                    <span className="text-blue-500 dark:text-blue-300 ml-2">Only paths starting with /facebook</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <code className="bg-white/50 dark:bg-black/20 px-1 rounded">reddit.com/r/programming</code>
                    <span className="text-blue-500 dark:text-blue-300 ml-2">Only the programming subreddit</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <code className="bg-white/50 dark:bg-black/20 px-1 rounded">localhost:3000</code>
                    <span className="text-blue-500 dark:text-blue-300 ml-2">Local development server</span>
                  </div>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Important:</p>
                <ul className="text-xs text-blue-500 dark:text-blue-300 space-y-0.5">
                  <li>• http:// and https:// are automatically removed</li>
                  <li>• Matching is case-insensitive</li>
                  <li>• www. prefix is automatically ignored</li>
                  <li>• Other protocols (ftp://, ws://) are not supported</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Domain list */}
        <div className="space-y-2">
          {settings.domains.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No patterns enabled yet. Add domains or paths above to get started.
            </p>
          ) : (
            settings.domains.map(domain => (
              <DomainRow 
                key={domain} 
                domain={domain} 
                onRemove={handleRemoveDomain}
                highlightOnCreate={justAddedDomains.has(domain)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
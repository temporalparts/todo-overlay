import { render } from 'preact';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import App from '../ui/App';
import { getSettings, saveSettings } from '../state/storage';
import '../styles/tailwind.css';

function TabulaPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleToggleNewTab = async () => {
    if (!settings) return;
    const newSettings = { ...settings, showOnNewTab: !settings.showOnNewTab };
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleBack = () => {
    // Go back to previous page or close tab
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Close the tab if no history
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <App 
      isNewTab={true}
      onDismiss={handleBack}
      customControls={
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-white/90 text-sm cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={settings?.showOnNewTab || false}
              onChange={handleToggleNewTab}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span>Always show on new tabs</span>
          </label>
          <button
            onClick={handleBack}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-normal transition-colors text-sm"
          >
            Hide
          </button>
        </div>
      }
    />
  );
}

render(<TabulaPage />, document.getElementById('root')!);
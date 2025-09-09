import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import browser from 'webextension-polyfill';
import type { EngagementStats, EngagementSettings } from '../../types/engagement';
import { EngagementTracker } from '../../lib/engagement';

interface EngagementDisplayProps {
  domain?: string;
  mode: 'overlay' | 'settings';
  showTimer?: boolean;
  snoozeMinutes?: number;
  dismissMinutes?: number;
}

export default function EngagementDisplay({ 
  domain, 
  mode, 
  showTimer = true,
  snoozeMinutes = 15,
  dismissMinutes = 60 
}: EngagementDisplayProps) {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [settings, setSettings] = useState<EngagementSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Refresh data every minute
    const interval = setInterval(loadData, 60000);
    
    // Listen for storage changes
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes.engagementMetrics) {
        loadData();
      }
    };
    
    browser.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      clearInterval(interval);
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [domain]);

  const loadData = async () => {
    try {
      const [statsData, settingsData] = await Promise.all([
        browser.runtime.sendMessage({ type: 'GET_ENGAGEMENT_STATS', domain }),
        browser.runtime.sendMessage({ type: 'GET_ENGAGEMENT_SETTINGS' })
      ]);
      
      setStats(statsData);
      setSettings(settingsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load engagement data:', error);
      setLoading(false);
    }
  };

  if (loading || !settings?.enabled || !stats) {
    return null;
  }

  if (mode === 'overlay' && !settings.showInOverlay) {
    return null;
  }

  if (mode === 'settings' && !settings.showInSettings) {
    return null;
  }

  const getDisplayStats = () => {
    switch (settings.displayMode) {
      case 'today':
        return { count: stats.todayCount, minutes: stats.todayMinutes, dailyAvg: 0, label: 'today' };
      case '24hours':
        return { count: stats.last24HoursCount, minutes: stats.last24HoursMinutes, dailyAvg: 0, label: 'last 24h' };
      case 'week':
        return { count: stats.weekCount, minutes: stats.weekMinutes, dailyAvg: stats.weekDailyAvg, label: 'this week' };
      case 'month':
        return { count: stats.monthCount, minutes: stats.monthMinutes, dailyAvg: stats.monthDailyAvg, label: 'this month' };
      default:
        return { count: stats.todayCount, minutes: stats.todayMinutes, dailyAvg: 0, label: 'today' };
    }
  };

  const { count, minutes, dailyAvg, label } = getDisplayStats();
  const usageColor = EngagementTracker.getUsageColor(count);
  const formattedTime = EngagementTracker.formatMinutes(minutes);
  const percentage = Math.min(100, (count / 10) * 100); // Cap at 10 uses

  // Format display with daily average for week/month
  const displayText = () => {
    if (count === 0) return '—';
    
    let text = `${formattedTime} · ${count}× · ${label}`;
    
    // Add daily average for week and month views
    if (dailyAvg > 0 && (settings.displayMode === 'week' || settings.displayMode === 'month')) {
      text += ` (${EngagementTracker.formatMinutes(dailyAvg)}/day)`;
    }
    
    return text;
  };

  if (mode === 'overlay') {
    return (
      <div className="text-xs text-white/60">
        {displayText()}
      </div>
    );
  }

  // Settings mode - minimal inline display
  return (
    <span className="text-xs">
      {displayText()}
    </span>
  );
}
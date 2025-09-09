import type { EngagementMetrics, EngagementAction, EngagementStats, EngagementSettings, DomainEngagement } from '../types/engagement';
import { DEFAULT_ENGAGEMENT_SETTINGS } from '../types/engagement';

export class EngagementTracker {
  private static STORAGE_KEY = 'engagementMetrics';

  static async getMetrics(): Promise<EngagementMetrics> {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    if (!result[this.STORAGE_KEY]) {
      return this.getDefaultMetrics();
    }
    return result[this.STORAGE_KEY];
  }

  static async saveMetrics(metrics: EngagementMetrics): Promise<void> {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: metrics });
  }

  static getDefaultMetrics(): EngagementMetrics {
    return {
      domains: {},
      global: {
        actions: [],
        totalMinutesPaused: 0,
        lastReset: Date.now()
      },
      settings: DEFAULT_ENGAGEMENT_SETTINGS
    };
  }

  static async trackAction(domain: string, minutes: number, type: 'snooze' | 'dismiss'): Promise<void> {
    const metrics = await this.getMetrics();
    
    if (!metrics.settings.enabled) {
      return;
    }

    const action: EngagementAction = {
      timestamp: Date.now(),
      minutes,
      type
    };

    // Track global metrics
    metrics.global.actions.push(action);
    metrics.global.totalMinutesPaused += minutes;

    // Track domain-specific metrics
    if (!metrics.domains[domain]) {
      metrics.domains[domain] = {
        actions: [],
        totalMinutesPaused: 0,
        lastReset: Date.now()
      };
    }
    
    metrics.domains[domain].actions.push(action);
    metrics.domains[domain].totalMinutesPaused += minutes;

    // Clean up old data based on retention settings
    await this.cleanupOldData(metrics);
    
    await this.saveMetrics(metrics);
  }

  static async cleanupOldData(metrics: EngagementMetrics): Promise<void> {
    if (metrics.settings.retentionDays === -1) {
      return; // Keep forever
    }
    
    if (metrics.settings.retentionDays === 0) {
      // Don't retain history - keep only today's data
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const cutoff = todayStart.getTime();
      
      metrics.global.actions = metrics.global.actions.filter(a => a.timestamp >= cutoff);
      
      for (const domain in metrics.domains) {
        metrics.domains[domain].actions = metrics.domains[domain].actions.filter(a => a.timestamp >= cutoff);
      }
    } else {
      // Retain for specified days
      const cutoff = Date.now() - (metrics.settings.retentionDays * 24 * 60 * 60 * 1000);
      
      metrics.global.actions = metrics.global.actions.filter(a => a.timestamp >= cutoff);
      
      for (const domain in metrics.domains) {
        metrics.domains[domain].actions = metrics.domains[domain].actions.filter(a => a.timestamp >= cutoff);
        
        // Remove domain entry if no actions remain
        if (metrics.domains[domain].actions.length === 0) {
          delete metrics.domains[domain];
        }
      }
    }
  }

  static async getStats(domain?: string): Promise<EngagementStats> {
    const metrics = await this.getMetrics();
    const now = Date.now();
    
    // Get today's start (midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartTime = todayStart.getTime();
    
    // Get 24 hours ago
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Get week ago
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Get month ago (30 days)
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const domainData = domain ? metrics.domains[domain] : null;
    const actions = domain ? (domainData?.actions || []) : metrics.global.actions;
    
    // Find oldest action timestamp
    const oldestActionTimestamp = actions.length > 0 
      ? Math.min(...actions.map(a => a.timestamp))
      : now;
    
    // Calculate days since oldest action
    const daysSinceOldest = Math.max(1, Math.floor((now - oldestActionTimestamp) / (24 * 60 * 60 * 1000)) + 1);
    
    // Calculate stats
    const todayActions = actions.filter(a => a.timestamp >= todayStartTime);
    const last24HoursActions = actions.filter(a => a.timestamp >= twentyFourHoursAgo);
    const weekActions = actions.filter(a => a.timestamp >= weekAgo);
    const monthActions = actions.filter(a => a.timestamp >= monthAgo);
    
    // Calculate daily averages based on actual data age
    const weekDays = Math.min(7, daysSinceOldest);
    const monthDays = Math.min(30, daysSinceOldest);
    
    const weekMinutes = weekActions.reduce((sum, a) => sum + a.minutes, 0);
    const monthMinutes = monthActions.reduce((sum, a) => sum + a.minutes, 0);
    
    const stats: EngagementStats = {
      domain: domain || 'all',
      todayCount: todayActions.length,
      todayMinutes: todayActions.reduce((sum, a) => sum + a.minutes, 0),
      last24HoursCount: last24HoursActions.length,
      last24HoursMinutes: last24HoursActions.reduce((sum, a) => sum + a.minutes, 0),
      weekCount: weekActions.length,
      weekMinutes: weekMinutes,
      weekDailyAvg: weekDays > 0 ? Math.round(weekMinutes / weekDays) : 0,
      monthCount: monthActions.length,
      monthMinutes: monthMinutes,
      monthDailyAvg: monthDays > 0 ? Math.round(monthMinutes / monthDays) : 0,
      averageSnoozeLength: actions.length > 0 
        ? actions.reduce((sum, a) => sum + a.minutes, 0) / actions.length 
        : 0,
      mostRecentAction: actions[actions.length - 1],
      oldestActionTimestamp: actions.length > 0 ? oldestActionTimestamp : undefined
    };
    
    return stats;
  }

  static async updateSettings(settings: Partial<EngagementSettings>): Promise<void> {
    const metrics = await this.getMetrics();
    metrics.settings = { ...metrics.settings, ...settings };
    await this.saveMetrics(metrics);
  }

  static async clearAllData(): Promise<void> {
    await chrome.storage.local.remove(this.STORAGE_KEY);
  }

  static async clearDomainData(domain: string): Promise<void> {
    const metrics = await this.getMetrics();
    
    if (metrics.domains[domain]) {
      // Remove domain-specific actions from global
      const domainActionTimestamps = new Set(
        metrics.domains[domain].actions.map(a => a.timestamp)
      );
      
      metrics.global.actions = metrics.global.actions.filter(
        a => !domainActionTimestamps.has(a.timestamp)
      );
      
      // Recalculate global total
      metrics.global.totalMinutesPaused = metrics.global.actions.reduce(
        (sum, a) => sum + a.minutes, 0
      );
      
      // Remove domain entry
      delete metrics.domains[domain];
      
      await this.saveMetrics(metrics);
    }
  }

  static formatTimeRange(mode: 'today' | '24hours' | 'week' | 'month'): string {
    switch (mode) {
      case 'today':
        return 'Today';
      case '24hours':
        return 'Last 24 hours';
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
    }
  }

  static formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  static getUsageColor(count: number): string {
    if (count <= 3) return '#10b981'; // green
    if (count <= 7) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }
}
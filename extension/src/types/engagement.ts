export interface EngagementAction {
  timestamp: number;
  minutes: number; // Duration of snooze/dismiss
  type: 'snooze' | 'dismiss';
}

export interface DomainEngagement {
  actions: EngagementAction[];
  totalMinutesPaused: number;
  lastReset: number;
}

export interface EngagementMetrics {
  domains: {
    [domain: string]: DomainEngagement;
  };
  global: {
    actions: EngagementAction[];
    totalMinutesPaused: number;
    lastReset: number;
  };
  settings: EngagementSettings;
}

export interface EngagementSettings {
  enabled: boolean;
  showInOverlay: boolean;
  showInSettings: boolean;
  retentionDays: number; // 0 = don't retain history, -1 = retain forever
  displayMode: 'today' | '24hours' | 'week' | 'month';
}

export interface EngagementStats {
  domain: string;
  todayCount: number;
  todayMinutes: number;
  last24HoursCount: number;
  last24HoursMinutes: number;
  weekCount: number;
  weekMinutes: number;
  weekDailyAvg: number;
  monthCount: number;
  monthMinutes: number;
  monthDailyAvg: number;
  averageSnoozeLength: number;
  mostRecentAction?: EngagementAction;
  oldestActionTimestamp?: number;
}

export const DEFAULT_ENGAGEMENT_SETTINGS: EngagementSettings = {
  enabled: true,
  showInOverlay: true,
  showInSettings: true,
  retentionDays: 30,
  displayMode: '24hours'
};
// MVP Types - keeping it simple for now

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string; // ISO string for completion time
  priority?: Priority;
  dueDate?: string; // ISO string for date
}

export interface Settings {
  domains: string[]; // e.g., ["reddit.com", "twitter.com"]
  theme: "light" | "dark" | "auto";
  autoOpenOnAllowlisted: boolean;
  snoozeMinutes: number; // How long to snooze
  dismissMinutes: number; // How long to dismiss
  enableQuoteRotation: boolean; // Whether to enable automatic quote rotation
  quoteRotationSeconds: number; // How often to rotate quotes (in seconds)
  enablePlaceholderRotation: boolean; // Whether to enable placeholder rotation in task input
}

export interface SnoozeState {
  [domain: string]: number; // domain -> timestamp when snooze expires
}

export type Message = 
  | { type: "OPEN_OVERLAY" }
  | { type: "CLOSE_OVERLAY" }
  | { type: "SNOOZE"; minutes: number }
  | { type: "CHECK_SHOULD_SHOW"; domain: string }
  | { type: "SHOULD_SHOW_RESPONSE"; shouldShow: boolean };
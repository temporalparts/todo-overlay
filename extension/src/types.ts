// MVP Types - keeping it simple for now

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Settings {
  domains: string[]; // e.g., ["reddit.com", "twitter.com"]
  theme: "light" | "dark" | "auto";
  autoOpenOnAllowlisted: boolean;
  snoozeMinutes: number; // How long to snooze
  dismissMinutes: number; // How long to dismiss
  quoteRotationSeconds: number; // How often to rotate quotes (in seconds)
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
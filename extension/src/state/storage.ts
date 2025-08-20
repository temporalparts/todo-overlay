import browser from 'webextension-polyfill';
import { Task, Settings, SnoozeState } from '../types';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  domains: ['reddit.com', 'x.com', 'youtube.com'],
  theme: 'auto',
  autoOpenOnAllowlisted: true,
  snoozeMinutes: 15, // 15 minutes default
  dismissMinutes: 60, // 60 minutes default
  enableQuoteRotation: false, // Disable quote rotation by default
  quoteRotationSeconds: 20 // 20 seconds default
};

// Tasks storage (using chrome.storage.local for more space)
export async function getTasks(): Promise<Task[]> {
  const result = await browser.storage.local.get('tasks');
  return result.tasks || [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await browser.storage.local.set({ tasks });
}

// Settings storage (using chrome.storage.local for consistency)
export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get('settings');
  if (!result.settings) {
    return DEFAULT_SETTINGS;
  }
  
  // Migrate old settings that don't have timer fields
  const settings = result.settings;
  if (settings.snoozeMinutes === undefined) {
    settings.snoozeMinutes = DEFAULT_SETTINGS.snoozeMinutes;
  }
  if (settings.dismissMinutes === undefined) {
    settings.dismissMinutes = DEFAULT_SETTINGS.dismissMinutes;
  }
  if (settings.enableQuoteRotation === undefined) {
    settings.enableQuoteRotation = DEFAULT_SETTINGS.enableQuoteRotation;
  }
  if (settings.quoteRotationSeconds === undefined) {
    settings.quoteRotationSeconds = DEFAULT_SETTINGS.quoteRotationSeconds;
  }
  
  return settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ settings });
}

// Snooze state storage
export async function getSnoozeState(): Promise<SnoozeState> {
  const result = await browser.storage.local.get('domainSnoozes');
  return result.domainSnoozes || {};
}

export async function setSnoozeForDomain(domain: string, minutes: number): Promise<void> {
  const domainSnoozes = await getSnoozeState();
  domainSnoozes[domain] = Date.now() + (minutes * 60 * 1000);
  await browser.storage.local.set({ domainSnoozes });
}

export async function isdomainSnoozed(domain: string): Promise<boolean> {
  const domainSnoozes = await getSnoozeState();
  const snoozeUntil = domainSnoozes[domain];
  if (!snoozeUntil) return false;
  return Date.now() < snoozeUntil;
}
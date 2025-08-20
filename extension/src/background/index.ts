import browser from 'webextension-polyfill';
import { getRootDomain } from '../lib/domain';
import { getSettings, isdomainSnoozed, setSnoozeForDomain } from '../state/storage';

// Track active snooze timers
const snoozeTimers = new Map<string, number>();

// Inject content script into tab
async function injectContentScript(tabId: number) {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['content/inject.js']
    });
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
}

// Handle icon click - inject content script and open overlay
browser.action.onClicked.addListener(async (tab) => {
  console.log('[Background] Extension icon clicked');
  if (tab.id) {
    // Check if content script is already injected
    try {
      // Try to send a ping message
      await browser.tabs.sendMessage(tab.id, { type: 'PING' });
      // If successful, content script is already injected, just open overlay
      await browser.tabs.sendMessage(tab.id, { type: 'OPEN_OVERLAY' });
    } catch {
      // Content script not injected, inject it first
      console.log('[Background] Injecting content script...');
      await injectContentScript(tab.id);
      // Give it a moment to initialize
      setTimeout(async () => {
        await browser.tabs.sendMessage(tab.id!, { type: 'OPEN_OVERLAY' });
      }, 100);
    }
  }
});

// Track which tabs have had content script injected
const injectedTabs = new Set<number>();

// Auto-inject content script on allowed domains
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const settings = await getSettings();
    const domain = getRootDomain(tab.url);
    
    if (settings.domains.includes(domain)) {
      // Only inject if not already injected in this tab
      if (!injectedTabs.has(tabId)) {
        await injectContentScript(tabId);
        injectedTabs.add(tabId);
      }
    }
  }
});

// Clean up when tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

// Handle messages from content scripts
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'CHECK_SHOULD_SHOW') {
    const settings = await getSettings();
    const domain = message.domain;
    
    const shouldShow = settings.autoOpenOnAllowlisted && 
                      settings.domains.includes(domain) &&
                      !(await isdomainSnoozed(domain));
    
    return { shouldShow };
  } else if (message.type === 'SNOOZE_DOMAIN') {
    console.log(`[Background] Received SNOOZE_DOMAIN for ${message.domain}, ${message.minutes} minutes`);
    const { domain, minutes } = message;
    
    try {
      // Set snooze in storage
      await setSnoozeForDomain(domain, minutes);
      
      // Clear any existing timer for this domain
      if (snoozeTimers.has(domain)) {
        clearTimeout(snoozeTimers.get(domain)!);
        console.log(`[Background] Cleared existing timer for ${domain}`);
      }
      
      // Set a new timer to notify all tabs when snooze expires
      const timer = setTimeout(async () => {
        console.log(`[Background] Snooze expired for ${domain}`);
        snoozeTimers.delete(domain);
        
        // Clear from storage
        const { domainSnoozes } = await browser.storage.local.get('domainSnoozes');
        if (domainSnoozes && domainSnoozes[domain]) {
          delete domainSnoozes[domain];
          await browser.storage.local.set({ domainSnoozes });
        }
        
        // Find all tabs with this domain and notify them
        const tabs = await browser.tabs.query({});
        for (const tab of tabs) {
          if (tab.url && getRootDomain(tab.url) === domain) {
            try {
              await browser.tabs.sendMessage(tab.id!, { 
                type: 'SNOOZE_EXPIRED',
                domain 
              });
            } catch (error) {
              // Tab might not have content script injected
              console.log(`Could not notify tab ${tab.id} of snooze expiration`);
            }
          }
        }
      }, minutes * 60 * 1000);
      
      snoozeTimers.set(domain, timer);
      console.log(`[Background] Set timer for ${domain}, expires in ${minutes} minutes`);
      
      // Notify all tabs with this domain to close their overlays
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && getRootDomain(tab.url) === domain && tab.id !== sender.tab?.id) {
          try {
            await browser.tabs.sendMessage(tab.id!, { 
              type: 'CLOSE_OVERLAY'
            });
          } catch (error) {
            // Tab might not have content script injected
            console.log(`Could not notify tab ${tab.id} to close overlay`);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('[Background] Error handling SNOOZE_DOMAIN:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
});

// Optional: Update badge with task count
async function updateBadge() {
  const { tasks } = await browser.storage.local.get('tasks');
  const activeTasks = (tasks || []).filter((t: any) => !t.completed);
  
  if (activeTasks.length > 0) {
    await browser.action.setBadgeText({ text: String(activeTasks.length) });
    await browser.action.setBadgeBackgroundColor({ color: '#4F46E5' });
  } else {
    await browser.action.setBadgeText({ text: '' });
  }
}

// Update badge on storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.tasks) {
    updateBadge();
  }
});

// Initial badge update
updateBadge();

// Restore active snooze timers on startup
async function restoreSnoozeTimers() {
  const { domainSnoozes } = await browser.storage.local.get('domainSnoozes');
  if (!domainSnoozes) return;
  
  const now = Date.now();
  for (const [domain, expiresAt] of Object.entries(domainSnoozes)) {
    const remaining = (expiresAt as number) - now;
    
    if (remaining > 0) {
      // Snooze is still active, create a timer for the remaining time
      const timer = setTimeout(async () => {
        console.log(`[Background] Snooze expired for ${domain} (restored)`);
        snoozeTimers.delete(domain);
        
        // Clear from storage
        const { domainSnoozes: currentSnoozes } = await browser.storage.local.get('domainSnoozes');
        if (currentSnoozes && currentSnoozes[domain]) {
          delete currentSnoozes[domain];
          await browser.storage.local.set({ domainSnoozes: currentSnoozes });
        }
        
        // Notify all tabs with this domain
        const tabs = await browser.tabs.query({});
        for (const tab of tabs) {
          if (tab.url && getRootDomain(tab.url) === domain) {
            try {
              await browser.tabs.sendMessage(tab.id!, { 
                type: 'SNOOZE_EXPIRED',
                domain 
              });
            } catch (error) {
              console.log(`Could not notify tab ${tab.id} of snooze expiration`);
            }
          }
        }
      }, remaining);
      
      snoozeTimers.set(domain, timer);
      console.log(`[Background] Restored snooze timer for ${domain}, expires in ${Math.round(remaining / 1000)}s`);
    } else {
      // Snooze has expired, clear it from storage
      const { domainSnoozes: currentSnoozes } = await browser.storage.local.get('domainSnoozes');
      if (currentSnoozes && currentSnoozes[domain]) {
        delete currentSnoozes[domain];
        await browser.storage.local.set({ domainSnoozes: currentSnoozes });
      }
    }
  }
}

// Restore timers on startup
restoreSnoozeTimers();
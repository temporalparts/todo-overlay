import browser from 'webextension-polyfill';
import { render } from 'preact';
import { h } from 'preact';
import App from '../ui/App';
import { getRootDomain, isUrlInDomainList } from '../lib/domain';
import { getSettings, isdomainSnoozed, setSnoozeForDomain } from '../state/storage';
import '../styles/tailwind.css';

// Singleton class to manage overlay
class OverlayManager {
  private static instance: OverlayManager | null = null;
  private overlayRoot: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  async shouldShowOverlay(): Promise<boolean> {
    try {
      const settings = await getSettings();
      if (!settings.autoOpenOnAllowlisted) return false;
      
      const currentUrl = window.location.href;
      if (!isUrlInDomainList(currentUrl, settings.domains)) return false;
      
      const domain = getRootDomain(currentUrl);
      const isSnoozed = await isdomainSnoozed(domain);
      return !isSnoozed;
    } catch (error) {
      // If extension context is invalidated, don't show overlay
      console.log('[TABULA] Error checking if should show overlay:', error);
      return false;
    }
  }

  async createOverlay() {
    // If overlay already exists, just return
    if (this.overlayRoot) {
      console.log('[TABULA] Overlay already exists, not creating another');
      return;
    }

    console.log('[TABULA] Creating overlay...');
    
    // Wait for body to be available
    await this.waitForBody();
    
    // Create container that takes over entire viewport
    this.overlayRoot = document.createElement('div');
    this.overlayRoot.id = 'tabula-overlay';
    this.overlayRoot.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647;'; // Max z-index
    
    // Create shadow DOM to isolate styles
    this.shadowRoot = this.overlayRoot.attachShadow({ mode: 'open' });
    
    // Fetch and inject CSS
    try {
      const cssUrl = browser.runtime.getURL('content/styles.css');
      const response = await fetch(cssUrl);
      const cssText = await response.text();
      
      const styleEl = document.createElement('style');
      styleEl.textContent = cssText;
      this.shadowRoot.appendChild(styleEl);
    } catch (error) {
      console.error('[TABULA] Failed to load styles:', error);
    }
    
    // Create app container
    const appContainer = document.createElement('div');
    this.shadowRoot.appendChild(appContainer);
    
    // Render app
    render(
      h(App, {
        onSnooze: this.handleSnooze.bind(this)
      }),
      appContainer
    );
    
    // Final safety check before appending
    if (!document.body) {
      console.error('[TABULA] document.body is still null after wait, aborting overlay creation');
      this.overlayRoot = null;
      this.shadowRoot = null;
      return;
    }
    
    document.body.appendChild(this.overlayRoot);
  }

  private waitForBody(): Promise<void> {
    return new Promise((resolve) => {
      const checkBody = () => {
        if (document.body && document.readyState !== 'loading') {
          resolve();
          return true;
        }
        return false;
      };

      // Check immediately
      if (checkBody()) return;

      // If not ready, set up multiple strategies to detect when ready
      
      // Strategy 1: DOMContentLoaded event
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          checkBody();
        }, { once: true });
      }

      // Strategy 2: MutationObserver as fallback
      const observer = new MutationObserver(() => {
        if (checkBody()) {
          observer.disconnect();
        }
      });
      
      if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }

      // Strategy 3: Polling as last resort
      const pollInterval = setInterval(() => {
        if (checkBody()) {
          clearInterval(pollInterval);
        }
      }, 100);

      // Strategy 4: Timeout to ensure we eventually resolve
      setTimeout(() => {
        clearInterval(pollInterval);
        observer.disconnect();
        resolve(); // Resolve anyway after 5 seconds
      }, 5000);
    });
  }

  closeOverlay() {
    console.log('[TABULA] Closing overlay');
    if (this.overlayRoot) {
      this.overlayRoot.remove();
      this.overlayRoot = null;
      this.shadowRoot = null;
    }
  }

  async handleSnooze(minutes: number) {
    console.log(`[TABULA] handleSnooze called with ${minutes} minutes`);
    const domain = getRootDomain(window.location.href);
    
    try {
      // Check if runtime is still connected
      if (!browser.runtime?.id) {
        console.error('[TABULA] Extension runtime disconnected, reloading page...');
        window.location.reload();
        return;
      }
      
      // Send snooze request to background script
      const response = await browser.runtime.sendMessage({
        type: 'SNOOZE_DOMAIN',
        domain,
        minutes
      });
      
      console.log('[TABULA] Snooze response:', response);
      
      if (response && response.success) {
        this.closeOverlay();
      } else {
        console.error('[TABULA] Snooze failed, response:', response);
        // Still close overlay to not leave user stuck
        this.closeOverlay();
      }
    } catch (error) {
      console.error('[TABULA] Error sending snooze message:', error);
      
      // Check if it's a disconnection error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Extension context invalidated')) {
        console.error('[TABULA] Extension was reloaded/updated. Refreshing page...');
        window.location.reload();
      } else {
        // Try to close overlay anyway to not leave user stuck
        this.closeOverlay();
      }
    }
  }

  async initialize() {
    try {
      // Check if we should show on page load
      console.log('[TABULA] Initializing overlay manager...');
      
      // Check if extension context is still valid
      if (!browser.runtime?.id) {
        console.log('[TABULA] Extension context not available, skipping initialization');
        return;
      }
      
      const shouldShow = await this.shouldShowOverlay();
      console.log('[TABULA] Should show overlay?', shouldShow);
      
      if (shouldShow) {
        await this.createOverlay();
      }
    } catch (error) {
      console.log('[TABULA] Error during initialization:', error);
      // Don't throw, just log - page will work normally without overlay
    }
  }
}

// Check if already injected (for duplicate script prevention)
if ((window as any).__tabulaInjected) {
  console.log('[TABULA] Already injected, exiting...');
} else {
  (window as any).__tabulaInjected = true;
  
  // Get singleton instance
  const overlayManager = OverlayManager.getInstance();

  // Listen for messages from popup/background
  const messageHandler = async (message: any) => {
    try {
      if (message.type === 'PING') {
        // Just respond to indicate content script is loaded
        return { status: 'ok' };
      } else if (message.type === 'OPEN_OVERLAY') {
        await overlayManager.createOverlay();
      } else if (message.type === 'CLOSE_OVERLAY') {
        overlayManager.closeOverlay();
      } else if (message.type === 'SNOOZE_EXPIRED') {
        console.log('[TABULA] Snooze expired notification received');
        // Check if we should show overlay (user might have navigated away)
        const currentDomain = getRootDomain(window.location.href);
        if (currentDomain === message.domain && await overlayManager.shouldShowOverlay()) {
          await overlayManager.createOverlay();
        }
      }
    } catch (error) {
      console.log('[TABULA] Error handling message:', error);
      // If extension context invalidated, don't try to use browser APIs anymore
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        try {
          browser.runtime.onMessage.removeListener(messageHandler);
        } catch {
          // Even removing the listener might fail if context is invalidated
        }
      }
    }
    // Return true to indicate we'll send a response asynchronously
    return true;
  };
  
  browser.runtime.onMessage.addListener(messageHandler);

  // Initialize on page load
  console.log('[TABULA] Content script loaded on:', window.location.href);
  overlayManager.initialize();
}
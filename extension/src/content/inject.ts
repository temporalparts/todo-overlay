import browser from 'webextension-polyfill';
import { render } from 'preact';
import { h } from 'preact';
import App from '../ui/App';
import { getRootDomain, isUrlInDomainList } from '../lib/domain';
import { getSettings, isdomainSnoozed, setSnoozeForDomain, saveSettings } from '../state/storage';
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

  async shouldShowOverlay(): Promise<{ show: boolean; isEnabledDomain: boolean }> {
    try {
      const settings = await getSettings();
      const currentUrl = window.location.href;
      const isEnabledDomain = isUrlInDomainList(currentUrl, settings.domains);
      
      if (!settings.autoOpenOnAllowlisted) {
        return { show: false, isEnabledDomain };
      }
      
      if (!isEnabledDomain) {
        return { show: false, isEnabledDomain: false };
      }
      
      const domain = getRootDomain(currentUrl);
      const isSnoozed = await isdomainSnoozed(domain);
      return { show: !isSnoozed, isEnabledDomain: true };
    } catch (error) {
      // If extension context is invalidated, don't show overlay
      console.log('[TABULA] Error checking if should show overlay:', error);
      return { show: false, isEnabledDomain: false };
    }
  }

  async createOverlay(isEnabledDomain: boolean = true) {
    // If overlay already exists, just return
    if (this.overlayRoot) {
      console.log('[TABULA] Overlay already exists, not creating another');
      return;
    }

    console.log('[TABULA] Creating overlay...');
    
    // Wait for body to be available
    await this.waitForBody();
    
    // Inject global style to fix YouTube-specific viewport issues
    const globalStyleId = 'tabula-youtube-fix';
    if (!document.getElementById(globalStyleId)) {
      const globalStyle = document.createElement('style');
      globalStyle.id = globalStyleId;
      globalStyle.textContent = `
        /* Fix for YouTube's viewport manipulation */
        html:has(#tabula-overlay), 
        body:has(#tabula-overlay) {
          overflow: hidden !important;
          position: static !important;
          transform: none !important;
          zoom: 1 !important;
        }
        #tabula-overlay {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 2147483647 !important;
          zoom: 1 !important;
          transform: none !important;
          font-size: 16px !important;
        }
        /* Ensure YouTube's player and other elements don't interfere */
        ytd-app, #content, #page-manager, #container {
          transform: none !important;
          zoom: 1 !important;
        }
        /* Reset YouTube's responsive zoom */
        html {
          zoom: 1 !important;
        }
      `;
      document.head.appendChild(globalStyle);
    }
    
    // Create container that takes over entire viewport
    this.overlayRoot = document.createElement('div');
    this.overlayRoot.id = 'tabula-overlay';
    // Reset all potential CSS interference and ensure full viewport coverage
    this.overlayRoot.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      max-height: none !important;
      min-width: 100vw !important;
      min-height: 100vh !important;
      z-index: 2147483647 !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
      box-sizing: border-box !important;
      overflow: visible !important;
    `.replace(/\s+/g, ' ').trim();
    
    // Prevent scroll events from reaching the underlying page
    this.overlayRoot.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: false });
    
    this.overlayRoot.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: false });
    
    // Create shadow DOM to isolate styles
    this.shadowRoot = this.overlayRoot.attachShadow({ mode: 'open' });
    
    // Fetch and inject CSS
    try {
      const cssUrl = browser.runtime.getURL('content/styles.css');
      const response = await fetch(cssUrl);
      const cssText = await response.text();
      
      // Add additional viewport fix CSS specifically for YouTube
      const viewportFix = `
        :host {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          display: block !important;
          /* Reset any zoom or scale transforms */
          zoom: 1 !important;
          transform: none !important;
          transform-origin: top left !important;
        }
        
        /* Ensure consistent sizing for all elements */
        * {
          max-width: none !important;
          zoom: 1 !important;
          transform: none !important;
        }
        
        /* Force consistent font sizing */
        :host > * {
          font-size: 16px !important;
          zoom: 1 !important;
        }
        
        /* Reset any inherited zoom from YouTube */
        :host, :host * {
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.textContent = viewportFix + '\n' + cssText;
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
        onSnooze: this.handleSnooze.bind(this),
        onDismiss: this.closeOverlay.bind(this),
        isEnabledDomain,
        onAddDomain: this.handleAddDomain.bind(this)
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
    
    // Try appending to documentElement first for better compatibility with YouTube
    // Fall back to body if that fails
    try {
      // First, let's ensure we're at the top level document, not in an iframe
      if (window.self !== window.top) {
        console.log('[TABULA] Running in iframe context, using parent document if possible');
      }
      
      // Append to documentElement for maximum coverage
      if (document.documentElement) {
        document.documentElement.appendChild(this.overlayRoot);
      } else {
        document.body.appendChild(this.overlayRoot);
      }
    } catch (e) {
      console.log('[TABULA] Failed to append to documentElement, using body', e);
      document.body.appendChild(this.overlayRoot);
    }
    
    // Disable scrolling on the body when overlay is shown
    document.body.style.overflow = 'hidden';
    
    // Also set overflow on html element for YouTube compatibility
    if (document.documentElement) {
      document.documentElement.style.overflow = 'hidden';
    }
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
      
      // Re-enable scrolling on the body and html
      document.body.style.overflow = '';
      if (document.documentElement) {
        document.documentElement.style.overflow = '';
      }
      
      // Remove global YouTube fix styles
      const globalStyle = document.getElementById('tabula-youtube-fix');
      if (globalStyle) {
        globalStyle.remove();
      }
    }
  }

  async handleSnooze(minutes: number, actionType: 'snooze' | 'dismiss' = 'snooze') {
    console.log(`[TABULA] handleSnooze called with ${minutes} minutes (${actionType})`);
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
        minutes,
        actionType
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

  async handleAddDomain(): Promise<boolean> {
    console.log('[TABULA] handleAddDomain called');
    const domain = getRootDomain(window.location.href);
    
    try {
      // Check if runtime is still connected
      if (!browser.runtime?.id) {
        console.error('[TABULA] Extension runtime disconnected, reloading page...');
        window.location.reload();
        return false;
      }
      
      // Get current settings
      const settings = await getSettings();
      
      // Add domain to the list
      if (!settings.domains.includes(domain)) {
        settings.domains.push(domain);
        await saveSettings(settings);
        console.log(`[TABULA] Added domain ${domain} to enabled list`);
        
        // Return success so the App component knows the domain was added
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TABULA] Error adding domain:', error);
      return false;
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
      
      const { show, isEnabledDomain } = await this.shouldShowOverlay();
      console.log('[TABULA] Should show overlay?', show, 'Is enabled domain?', isEnabledDomain);
      
      if (show) {
        await this.createOverlay(isEnabledDomain);
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
        // Check if domain is enabled when opening manually
        const settings = await getSettings();
        const currentUrl = window.location.href;
        const isEnabledDomain = isUrlInDomainList(currentUrl, settings.domains);
        await overlayManager.createOverlay(isEnabledDomain);
      } else if (message.type === 'CLOSE_OVERLAY') {
        overlayManager.closeOverlay();
      } else if (message.type === 'SNOOZE_EXPIRED') {
        console.log('[TABULA] Snooze expired notification received');
        // Check if we should show overlay (user might have navigated away)
        const currentDomain = getRootDomain(window.location.href);
        const { show, isEnabledDomain } = await overlayManager.shouldShowOverlay();
        if (currentDomain === message.domain && show) {
          await overlayManager.createOverlay(isEnabledDomain);
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
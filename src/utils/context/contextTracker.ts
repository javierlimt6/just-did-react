// contextTracker.ts - Main context tracking orchestrator

import type { ContextTrackerConfig, ContextHistory, TrackerState } from '../../types';
import { ContextStorage } from './storage';
import { NavigationTracker } from './navigationTracker';
import { TabTracker } from './tabTracker';
import { WindowTracker } from './windowTracker';
import { DownloadTracker } from './downloadTracker';

export class ContextTracker {
  private storage: ContextStorage;
  private navigationTracker: NavigationTracker;
  private tabTracker: TabTracker;
  private windowTracker: WindowTracker;
  private downloadTracker: DownloadTracker;
  private config: Required<ContextTrackerConfig>;
  private state: TrackerState;

  constructor(config: ContextTrackerConfig = {}) {
    this.config = {
      enableNavigation: true,
      enableTabs: true,
      enableWindows: true,
      enableDownloads: true,
      enableSearches: true,
      enableForms: true,
      maxRecords: 10000,
      storageKey: 'contextHistory',
      ...config,
    };

    this.storage = ContextStorage.getInstance(this.config);
    this.navigationTracker = new NavigationTracker(this.storage);
    this.tabTracker = new TabTracker(this.storage);
    this.windowTracker = new WindowTracker(this.storage);
    this.downloadTracker = new DownloadTracker(this.storage);

    this.state = {
      isTracking: false,
      lastUpdate: Date.now(),
      totalEvents: 0,
    };

    this.setupMessageListener();
  }

  async start(): Promise<void> {
    if (this.state.isTracking) return;

    try {
      // Start individual trackers based on config
      if (this.config.enableNavigation) {
        this.navigationTracker.start();
      }

      if (this.config.enableTabs) {
        this.tabTracker.start();
      }

      if (this.config.enableWindows) {
        this.windowTracker.start();
      }

      if (this.config.enableDownloads) {
        this.downloadTracker.start();
      }

      this.state.isTracking = true;
      this.state.lastUpdate = Date.now();

      // Inject content script if forms tracking is enabled
      if (this.config.enableForms) {
        await this.injectContentScript();
      }

    } catch (error) {
      console.error('Failed to start context tracker:', error);
    }
  }

  stop(): void {
    if (!this.state.isTracking) return;

    this.navigationTracker.stop();
    this.tabTracker.stop();
    this.windowTracker.stop();
    this.downloadTracker.stop();

    this.state.isTracking = false;
  }

  async getFullHistory(): Promise<ContextHistory> {
    return await this.storage.getHistory();
  }

  async clearHistory(): Promise<void> {
    await this.storage.clearHistory();
    this.state.totalEvents = 0;
  }

  getState(): TrackerState {
    return { ...this.state };
  }

  async getStats(): Promise<{
    navigationCount: number;
    tabCount: number;
    windowCount: number;
    downloadCount: number;
    searchCount: number;
    formCount: number;
    totalEvents: number;
  }> {
    const history = await this.getFullHistory();

    return {
      navigationCount: history.navigation.length,
      tabCount: history.tabs.length,
      windowCount: history.windows.length,
      downloadCount: history.downloads.length,
      searchCount: history.searches.length,
      formCount: history.forms.length,
      totalEvents: Object.values(history).reduce((sum, arr) => sum + arr.length, 0),
    };
  }

  private async injectContentScript(): Promise<void> {
    try {
      const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({}, resolve);
      });

      for (const tab of tabs) {
        if (tab.id && tab.url?.startsWith('http')) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['contentTracker.js'],
            });
          } catch (error) {
            // Ignore injection errors for individual tabs
          }
        }
      }
    } catch (error) {
      console.error('Failed to inject content scripts:', error);
    }
  }

  private setupMessageListener(): void {
    if (chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'addNavigationEvent') {
          this.storage.addNavigationEvent(message.data);
        } else if (message.action === 'addFormEvent') {
          this.storage.addFormEvent(message.data);
        }
        sendResponse({ success: true });
      });
    }
  }
}

// Export singleton instance
let trackerInstance: ContextTracker | null = null;

export const getContextTracker = (config?: ContextTrackerConfig): ContextTracker => {
  if (!trackerInstance) {
    trackerInstance = new ContextTracker(config);
  }
  return trackerInstance;
};

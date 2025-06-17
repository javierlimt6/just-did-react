// tabTracker.ts - Tab activity monitoring

import type { TabEvent } from './types';
import { ContextStorage } from './storage';

export class TabTracker {
  private storage: ContextStorage;
  private isListening = false;

  constructor(storage: ContextStorage) {
    this.storage = storage;
  }

  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Listen to tab events
    if (chrome.tabs?.onCreated) {
      chrome.tabs.onCreated.addListener(this.handleTabCreated);
    }

    if (chrome.tabs?.onRemoved) {
      chrome.tabs.onRemoved.addListener(this.handleTabRemoved);
    }

    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.addListener(this.handleTabActivated);
    }

    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener(this.handleTabUpdated);
    }
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (chrome.tabs?.onCreated) {
      chrome.tabs.onCreated.removeListener(this.handleTabCreated);
    }

    if (chrome.tabs?.onRemoved) {
      chrome.tabs.onRemoved.removeListener(this.handleTabRemoved);
    }

    if (chrome.tabs?.onActivated) {
      chrome.tabs.onActivated.removeListener(this.handleTabActivated);
    }

    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.removeListener(this.handleTabUpdated);
    }
  }

  private handleTabCreated = (tab: chrome.tabs.Tab): void => {
    const event: TabEvent = {
      type: 'created',
      tabId: tab.id || 0,
      url: tab.url,
      title: tab.title,
      timestamp: Date.now(),
      windowId: tab.windowId,
    };

    this.storage.addTabEvent(event);
  };

  private handleTabRemoved = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): void => {
    const event: TabEvent = {
      type: 'removed',
      tabId: tabId,
      timestamp: Date.now(),
      windowId: removeInfo.windowId,
    };

    this.storage.addTabEvent(event);
  };

  private handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo): void => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) return;

      const event: TabEvent = {
        type: 'activated',
        tabId: activeInfo.tabId,
        url: tab.url,
        title: tab.title,
        timestamp: Date.now(),
        windowId: activeInfo.windowId,
      };

      this.storage.addTabEvent(event);
    });
  };

  private handleTabUpdated = (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): void => {
    // Only track significant updates (URL or title changes)
    if (changeInfo.url || changeInfo.title) {
      const event: TabEvent = {
        type: 'updated',
        tabId: tabId,
        url: tab.url,
        title: tab.title,
        timestamp: Date.now(),
        windowId: tab.windowId,
      };

      this.storage.addTabEvent(event);
    }
  };

  async getRecentTabActivity(limit: number = 100): Promise<TabEvent[]> {
    const history = await this.storage.getHistory();
    return history.tabs.slice(-limit);
  }

  async getTabsByType(type: TabEvent['type'], limit: number = 50): Promise<TabEvent[]> {
    const history = await this.storage.getHistory();
    return history.tabs
      .filter(event => event.type === type)
      .slice(-limit);
  }

  async getCurrentTabs(): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) {
          resolve([]);
        } else {
          resolve(tabs);
        }
      });
    });
  }
}

// storage.ts - Local storage management for Chrome extension

import type { ContextHistory, ContextTrackerConfig } from './types';

export class ContextStorage {
  private static instance: ContextStorage;
  private storageKey: string;
  private maxRecords: number;

  private constructor(config: ContextTrackerConfig) {
    this.storageKey = config.storageKey || 'contextHistory';
    this.maxRecords = config.maxRecords || 10000;
  }

  static getInstance(config: ContextTrackerConfig = {}): ContextStorage {
    if (!ContextStorage.instance) {
      ContextStorage.instance = new ContextStorage(config);
    }
    return ContextStorage.instance;
  }

  async getHistory(): Promise<ContextHistory> {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || this.getEmptyHistory();
    } catch (error) {
      console.error('Failed to get context history:', error);
      return this.getEmptyHistory();
    }
  }

  async saveHistory(history: ContextHistory): Promise<void> {
    try {
      // Trim each array to max records to prevent storage bloat
      const trimmedHistory: ContextHistory = {
        navigation: history.navigation.slice(-this.maxRecords),
        tabs: history.tabs.slice(-this.maxRecords),
        windows: history.windows.slice(-this.maxRecords),
        downloads: history.downloads.slice(-this.maxRecords),
        searches: history.searches.slice(-this.maxRecords),
        forms: history.forms.slice(-this.maxRecords),
      };

      await chrome.storage.local.set({ [this.storageKey]: trimmedHistory });
    } catch (error) {
      console.error('Failed to save context history:', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.storageKey]);
    } catch (error) {
      console.error('Failed to clear context history:', error);
    }
  }

  async addNavigationEvent(event: import('./types').NavigationEvent): Promise<void> {
    const history = await this.getHistory();
    history.navigation.push(event);
    await this.saveHistory(history);
  }

  async addTabEvent(event: import('./types').TabEvent): Promise<void> {
    const history = await this.getHistory();
    history.tabs.push(event);
    await this.saveHistory(history);
  }

  async addWindowEvent(event: import('./types').WindowEvent): Promise<void> {
    const history = await this.getHistory();
    history.windows.push(event);
    await this.saveHistory(history);
  }

  async addDownloadEvent(event: import('./types').DownloadEvent): Promise<void> {
    const history = await this.getHistory();
    history.downloads.push(event);
    await this.saveHistory(history);
  }

  async addSearchQuery(event: import('./types').SearchQuery): Promise<void> {
    const history = await this.getHistory();
    history.searches.push(event);
    await this.saveHistory(history);
  }

  async addFormEvent(event: import('./types').FormEvent): Promise<void> {
    const history = await this.getHistory();
    history.forms.push(event);
    await this.saveHistory(history);
  }

  private getEmptyHistory(): ContextHistory {
    return {
      navigation: [],
      tabs: [],
      windows: [],
      downloads: [],
      searches: [],
      forms: [],
    };
  }
}

// navigationTracker.ts - Navigation and URL visit tracking

import type { NavigationEvent, SearchQuery } from './types';
import { ContextStorage } from './storage';

export class NavigationTracker {
  private storage: ContextStorage;
  private isListening = false;

  constructor(storage: ContextStorage) {
    this.storage = storage;
  }

  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Listen to history visits
    if (chrome.history?.onVisited) {
      chrome.history.onVisited.addListener(this.handleHistoryVisit);
    }

    // Listen to tab updates for real-time navigation
    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.addListener(this.handleTabUpdate);
    }
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (chrome.history?.onVisited) {
      chrome.history.onVisited.removeListener(this.handleHistoryVisit);
    }

    if (chrome.tabs?.onUpdated) {
      chrome.tabs.onUpdated.removeListener(this.handleTabUpdate);
    }
  }

  private handleHistoryVisit = (historyItem: chrome.history.HistoryItem): void => {
    if (historyItem.url) {
      const event: NavigationEvent = {
        url: historyItem.url,
        title: historyItem.title || '',
        timestamp: Date.now(),
        visitId: historyItem.id,
      };

      this.storage.addNavigationEvent(event);
      this.extractSearchQuery(historyItem.url);
    }
  };

  private handleTabUpdate = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
    if (changeInfo.url && tab.url) {
      const event: NavigationEvent = {
        url: tab.url,
        title: tab.title || '',
        timestamp: Date.now(),
      };

      this.storage.addNavigationEvent(event);
      this.extractSearchQuery(tab.url);
    }
  };

  private extractSearchQuery(url: string): void {
    try {
      const urlObj = new URL(url);
      const searchEngines = [
        { name: 'Google', domain: 'google.com', param: 'q' },
        { name: 'Bing', domain: 'bing.com', param: 'q' },
        { name: 'DuckDuckGo', domain: 'duckduckgo.com', param: 'q' },
        { name: 'Yahoo', domain: 'yahoo.com', param: 'p' },
        { name: 'Yandex', domain: 'yandex.com', param: 'text' },
      ];

      for (const engine of searchEngines) {
        if (urlObj.hostname.includes(engine.domain)) {
          const query = urlObj.searchParams.get(engine.param);
          if (query) {
            const searchEvent: SearchQuery = {
              query: decodeURIComponent(query),
              engine: engine.name,
              url: url,
              timestamp: Date.now(),
            };
            this.storage.addSearchQuery(searchEvent);
          }
          break;
        }
      }
    } catch (error) {
      // Ignore invalid URLs
    }
  }

  async getRecentNavigation(limit: number = 100): Promise<NavigationEvent[]> {
    const history = await this.storage.getHistory();
    return history.navigation.slice(-limit);
  }

  async getSearchHistory(limit: number = 100): Promise<SearchQuery[]> {
    const history = await this.storage.getHistory();
    return history.searches.slice(-limit);
  }
}

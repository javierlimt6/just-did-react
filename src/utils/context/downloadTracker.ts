// downloadTracker.ts - Download activity tracking

import type { DownloadEvent } from './types';
import { ContextStorage } from './storage';

export class DownloadTracker {
  private storage: ContextStorage;
  private isListening = false;

  constructor(storage: ContextStorage) {
    this.storage = storage;
  }

  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Listen to download events
    if (chrome.downloads?.onCreated) {
      chrome.downloads.onCreated.addListener(this.handleDownloadCreated);
    }

    if (chrome.downloads?.onChanged) {
      chrome.downloads.onChanged.addListener(this.handleDownloadChanged);
    }
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (chrome.downloads?.onCreated) {
      chrome.downloads.onCreated.removeListener(this.handleDownloadCreated);
    }

    if (chrome.downloads?.onChanged) {
      chrome.downloads.onChanged.removeListener(this.handleDownloadChanged);
    }
  }

  private handleDownloadCreated = (downloadItem: chrome.downloads.DownloadItem): void => {
    const event: DownloadEvent = {
      id: downloadItem.id,
      filename: downloadItem.filename,
      url: downloadItem.url,
      timestamp: Date.now(),
      state: downloadItem.state,
      bytesReceived: downloadItem.bytesReceived,
      totalBytes: downloadItem.totalBytes,
    };

    this.storage.addDownloadEvent(event);
  };

  private handleDownloadChanged = (delta: chrome.downloads.DownloadDelta): void => {
    if (delta.state?.current || delta.bytesReceived?.current) {
      chrome.downloads.search({ id: delta.id }, (results) => {
        if (chrome.runtime.lastError || results.length === 0) return;

        const downloadItem = results[0];
        const event: DownloadEvent = {
          id: downloadItem.id,
          filename: downloadItem.filename,
          url: downloadItem.url,
          timestamp: Date.now(),
          state: downloadItem.state,
          bytesReceived: downloadItem.bytesReceived,
          totalBytes: downloadItem.totalBytes,
        };

        this.storage.addDownloadEvent(event);
      });
    }
  };

  async getRecentDownloads(limit: number = 100): Promise<DownloadEvent[]> {
    const history = await this.storage.getHistory();
    return history.downloads.slice(-limit);
  }

  async getDownloadsByState(state: chrome.downloads.State, limit: number = 50): Promise<DownloadEvent[]> {
    const history = await this.storage.getHistory();
    return history.downloads
      .filter(event => event.state === state)
      .slice(-limit);
  }
}

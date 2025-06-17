// windowTracker.ts - Window and focus tracking

import type { WindowEvent } from './types';
import { ContextStorage } from './storage';

export class WindowTracker {
  private storage: ContextStorage;
  private isListening = false;

  constructor(storage: ContextStorage) {
    this.storage = storage;
  }

  start(): void {
    if (this.isListening) return;
    this.isListening = true;

    // Listen to window events
    if (chrome.windows?.onCreated) {
      chrome.windows.onCreated.addListener(this.handleWindowCreated);
    }

    if (chrome.windows?.onRemoved) {
      chrome.windows.onRemoved.addListener(this.handleWindowRemoved);
    }

    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.addListener(this.handleWindowFocusChanged);
    }
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (chrome.windows?.onCreated) {
      chrome.windows.onCreated.removeListener(this.handleWindowCreated);
    }

    if (chrome.windows?.onRemoved) {
      chrome.windows.onRemoved.removeListener(this.handleWindowRemoved);
    }

    if (chrome.windows?.onFocusChanged) {
      chrome.windows.onFocusChanged.removeListener(this.handleWindowFocusChanged);
    }
  }

  private handleWindowCreated = (window: chrome.windows.Window): void => {
    const event: WindowEvent = {
      type: 'created',
      windowId: window.id || 0,
      timestamp: Date.now(),
      tabIds: window.tabs?.map(tab => tab.id || 0),
    };

    this.storage.addWindowEvent(event);
  };

  private handleWindowRemoved = (windowId: number): void => {
    const event: WindowEvent = {
      type: 'removed',
      windowId: windowId,
      timestamp: Date.now(),
    };

    this.storage.addWindowEvent(event);
  };

  private handleWindowFocusChanged = (windowId: number): void => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;

    const event: WindowEvent = {
      type: 'focused',
      windowId: windowId,
      timestamp: Date.now(),
    };

    this.storage.addWindowEvent(event);
  };

  async getRecentWindowActivity(limit: number = 100): Promise<WindowEvent[]> {
    const history = await this.storage.getHistory();
    return history.windows.slice(-limit);
  }

  async getCurrentWindows(): Promise<chrome.windows.Window[]> {
    return new Promise((resolve) => {
      chrome.windows.getAll({ populate: true }, (windows) => {
        if (chrome.runtime.lastError) {
          resolve([]);
        } else {
          resolve(windows);
        }
      });
    });
  }
}

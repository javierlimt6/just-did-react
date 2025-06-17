// background.ts - Service worker for Chrome extension

import { getContextTracker } from './contextTracker';

// Initialize the context tracker with default configuration
const tracker = getContextTracker({
  enableNavigation: true,
  enableTabs: true,
  enableWindows: true,
  enableDownloads: true,
  enableSearches: true,
  enableForms: true,
  maxRecords: 10000,
  storageKey: 'contextHistory'
});

// Start tracking as soon as the extension loads
tracker.start().catch(error => {
  console.error('Failed to start context tracker:', error);
});

// Listen for messages from popup or options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.action === 'getHistory') {
        const history = await tracker.getFullHistory();
        sendResponse({ success: true, data: history });
      } else if (message.action === 'getStats') {
        const stats = await tracker.getStats();
        sendResponse({ success: true, data: stats });
      } else if (message.action === 'clearHistory') {
        await tracker.clearHistory();
        sendResponse({ success: true });
      } else if (message.action === 'stopTracking') {
        tracker.stop();
        sendResponse({ success: true });
      } else if (message.action === 'startTracking') {
        await tracker.start();
        sendResponse({ success: true });
      }
    } catch (error) {
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  })();

  return true; // Indicates async response
});

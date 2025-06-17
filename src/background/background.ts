// Background service worker for JustDid extension
import type { ChromeMessage, ChromeResponse, TimerState, BrowserHistoryItem } from '@/types'
import { STORAGE_KEYS } from '@/types'
// import { getContextTracker } from '@/utils/context/contextTracker'
let timerState: TimerState = {
  isRunning: false,
  startTime: null,
  duration: 15, // default 15 minutes
  alarmName: 'justDidTimer'
}
// const tracker = getContextTracker({
//     enableNavigation: true,
//     enableTabs: true,
//     enableWindows: true,
//     enableDownloads: true,
//     enableSearches: true,
//     enableForms: true,
//     maxRecords: 10000,
//     storageKey: 'contextHistory'
//   });
// tracker.start().catch(error => {
//     console.error('Failed to start context tracker:', error);
//   });
// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('JustDid extension installed')
  // tracker.start().catch(error => {
  //   console.error('Failed to start context tracker:', error);
  // });


  // Initialize storage if needed
  chrome.storage.local.get([STORAGE_KEYS.ACTIVITY_LOGS, STORAGE_KEYS.TIMER_STATE], (result) => {
    if (!result[STORAGE_KEYS.ACTIVITY_LOGS]) {
      chrome.storage.local.set({ [STORAGE_KEYS.ACTIVITY_LOGS]: [] })
    }

    if (!result[STORAGE_KEYS.TIMER_STATE]) {
      chrome.storage.local.set({ [STORAGE_KEYS.TIMER_STATE]: timerState })
    } else {
      timerState = result[STORAGE_KEYS.TIMER_STATE]
    }
  })
})
// chrome.runtime.onInstalled.addListener(() => {
//   console.log('Extension installed - initializing context tracker');
  
//   const tracker = getContextTracker({
//     enableNavigation: true,
//     enableTabs: true,
//     enableWindows: true,
//     enableDownloads: true,
//     enableSearches: true,
//     enableForms: true,
//     maxRecords: 10000,
//     storageKey: 'contextHistory'
//   });
  
//   tracker.start().catch(error => {
//     console.error('Failed to start context tracker:', error);
//   });
// });
// Handle messages from popup
chrome.runtime.onMessage.addListener((
  message: ChromeMessage, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: ChromeResponse) => void
) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.data.duration)
      sendResponse({ success: true })
      break

    case 'getTimerState':
      getTimerState(sendResponse)
      return true // Keep message channel open for async response

    case 'stopTimer':
      stopTimer()
      sendResponse({ success: true })
      break

    case 'getBrowserHistory':
      // Get browser history for the last X minutes
      console.log('Fetching browser history for', message.data?.minutes || 15, 'minutes')
      getBrowserHistory(message.data?.minutes || 15, sendResponse)
      return true // Keep message channel open for async response

    case 'openTaskEntry':
      // close any leftover popups first
      chrome.windows.getAll({}, (wins) => {
        wins
          .filter(w => w.type === 'popup')
          .map(w => chrome.windows.remove(w.id!))
        // once all are removed, open the TaskEntry popup
        // chrome.action.openPopup().catch(() => {
        //   chrome.windows.create({
        //     url: chrome.runtime.getURL('src/popup.html?view=taskEntry'),
        //     type: 'popup',
        //     focused: true,
        //     width: 320,
        //     height: 480
        //   });
        // });
      })
      sendResponse({ success: true })
      break

    default:
      sendResponse({ success: false, error: 'Unknown action' })
  }
})

function startTimer(duration: number): void {
  const now = Date.now()
  timerState = {
    isRunning: true,
    startTime: now,
    duration: duration,
    alarmName: 'justDidTimer'
  }

  // Save timer state
  chrome.storage.local.set({ [STORAGE_KEYS.TIMER_STATE]: timerState })

  // Create alarm
  chrome.alarms.create('justDidTimer', {
    when: now + (duration * 60 * 1000) // duration in minutes
  })

  console.log(`Timer started for ${duration} minutes`)
}

function stopTimer(): void {
  chrome.alarms.clear('justDidTimer')
  timerState.isRunning = false
  chrome.storage.local.set({ [STORAGE_KEYS.TIMER_STATE]: timerState })
  console.log('Timer stopped')
}

function getTimerState(callback: (response: ChromeResponse) => void): void {
  chrome.storage.local.get([STORAGE_KEYS.TIMER_STATE], (result) => {
    const state = result[STORAGE_KEYS.TIMER_STATE] || timerState
    
    // Add debug logging
    // console.log('Timer state from storage:', state);

    // Make sure we always include the data property
    callback({
      success: true,
      data: {
        isRunning: state.isRunning || false,
        remaining: state.startTime 
          ? Math.max(0, ((state.duration || 15) * 60 * 1000) - (Date.now() - state.startTime)) 
          : 0,
        duration: state.duration || 15
      }
    });
  });
}

// Handle alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'justDidTimer') {
    console.log('Timer alarm triggered')
    timerState.isRunning = false

    chrome.storage.local.set({
      [STORAGE_KEYS.TIMER_STATE]: timerState,
      [STORAGE_KEYS.TIMER_COMPLETE]: true
    })

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon.png',
      title: 'JustDid - Time to Log!',
      message: 'What did you just accomplish? Click to log your activity.',
      buttons: [{ title: 'Log Activity' }]
    });
    // Force open popup window
    chrome.action.openPopup().catch((e) => {
      console.log("Failed to open popup, creating new window:");
      chrome.windows.create({
        url: chrome.runtime.getURL('src/popup.html?view=taskEntry'),
        type: 'popup',
        focused: true,
        width: 400,
        height: 600
      });
    });
  }
})

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.action.openPopup()
  chrome.notifications.clear(notificationId)
})

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // Log Activity button
    chrome.action.openPopup()
  }
  chrome.notifications.clear(notificationId)
})

async function getBrowserHistory(
  minutes: number, 
  callback: (response: ChromeResponse) => void
): Promise<void> {
  try {
    console.log('Fetching browser history for the last', minutes, 'minutes')
    const endTime = Date.now()
    const startTime = endTime - (minutes * 60 * 1000)

    const historyItems = await chrome.history.search({
      text: '',
      startTime: startTime,
      endTime: endTime,
      maxResults: 50
    })
  
    // Filter and format history items
    const formattedHistory: BrowserHistoryItem[] = historyItems
      .filter(item => item.visitCount && item.visitCount > 0)
      .sort((a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0))
      .slice(0, 10)
      .map(item => ({
        title: item.title || 'Untitled',
        url: item.url || '',
        visitTime: new Date(item.lastVisitTime || 0).toLocaleTimeString(),
        domain: item.url ? new URL(item.url).hostname : 'unknown'
      }))
      
    callback({ 
      success: true, 
      data: formattedHistory 
    })
  } catch (error) {
    console.error('Error fetching browser history:', error)
    callback({ 
      success: false, 
      error: 'Failed to fetch browser history',
      data: [] 
    })
  }
}
// Background service worker for JustDid extension
import type { ChromeMessage, ChromeResponse, TimerState, BrowserHistoryItem } from '@/types'
import { STORAGE_KEYS } from '@/types'

let timerState: TimerState = {
  isRunning: false,
  startTime: null,
  duration: 15, // default 15 minutes
  alarmName: 'justDidTimer'
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('JustDid extension installed')

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
      getBrowserHistory(message.data?.minutes || 15, sendResponse)
      return true // Keep message channel open for async response

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

    if (state.isRunning && state.startTime) {
      const elapsed = Date.now() - state.startTime
      const remaining = Math.max(0, (state.duration * 60 * 1000) - elapsed)

      callback({
        success: true,
        data: {
          isRunning: state.isRunning,
          remaining: remaining,
          duration: state.duration
        }
      })
    } else {
      callback({ 
        success: true, 
        data: { isRunning: false } 
      })
    }
  })
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
    })
    
    chrome.windows.getAll({}, (windows) => {
      windows.forEach((w) => {
        console.log(`Closing window: ${w.id}, type: ${w.type}`)
        if (w.type === 'popup') {
          chrome.windows.remove(w.id);
        }
      });
    });
    // Force open popup window
    chrome.windows.create({
      url: 'src/popup.html',
      type: 'popup',
      focused: true,
      width: 320,
      height: 480
    })
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
    const endTime = Date.now()
    const startTime = endTime - (minutes * 60 * 1000)

    const historyItems = await chrome.history.search({
      text: '',
      startTime: startTime,
      endTime: endTime,
      maxResults: 50
    })

    const historyWithoutExtensions = historyItems.filter(item => {
      !item.url.includes('chrome-extension://') &&
      !item.url.includes('chrome://') &&
      !item.url.includes('about:') &&
      !item.url.includes('lnahgngcehjfhnngogjpemhpooebkike')
    }) // rejecting extension urls

    // Filter and format history items
    const formattedHistory: BrowserHistoryItem[] = historyWithoutExtensions
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
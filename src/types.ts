// Chrome Extension Types
export interface TimerState {
  isRunning: boolean
  startTime: number | null
  duration: number // in minutes
  remaining?: number // in milliseconds
  alarmName: string
}

export interface ActivityLog {
  id: string
  task: string
  timestamp: number
  duration: number // in minutes
  browserHistory?: BrowserHistoryItem[]
}

export interface BrowserHistoryItem {
  title: string
  url: string
  visitTime: string
  domain: string
}

export interface AppState {
  currentView: 'landing' | 'timer' | 'task-entry' | 'history'
  timerState: TimerState
  logs: ActivityLog[]
  isTimerComplete: boolean
}

// Chrome API Message Types
export type MessageAction = 
  | 'startTimer'
  | 'stopTimer'
  | 'getTimerState'
  | 'getBrowserHistory'
  | 'getActivityLogs'
  | 'saveActivityLog'
  | 'openTaskEntry'

export interface ChromeMessage {
  action: MessageAction
  data?: any
}

export interface ChromeResponse {
  success: boolean
  data?: any
  error?: string
}

// Export formats
export type ExportFormat = 'json' | 'csv' | 'pdf'

// Timer duration constraints
export const TIMER_CONSTRAINTS = {
  MIN_DURATION: 1,
  MAX_DURATION: 60,
  DEFAULT_DURATION: 15,
  DEBUG_ID: null
} as const

// Storage keys
export const STORAGE_KEYS = {
  TIMER_STATE: 'timerState',
  ACTIVITY_LOGS: 'logs',
  TIMER_COMPLETE: 'timerComplete'
} as const
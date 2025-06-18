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

export interface NavigationEvent {
  url: string;
  title: string;
  timestamp: number;
  transitionType?: string; // e.g., 'link', 'typed', 'auto_bookmark'
  visitId?: string;
}

export interface TabEvent {
  type: 'created' | 'updated' | 'activated' | 'removed';
  tabId: number;
  url?: string;
  title?: string;
  timestamp: number;
  windowId?: number;
}

export interface WindowEvent {
  type: 'created' | 'removed' | 'focused';
  windowId: number;
  timestamp: number;
  tabIds?: number[];
}

export interface DownloadEvent {
  id: number;
  filename: string;
  url: string;
  timestamp: number;
  state: string;
  bytesReceived?: number;
  totalBytes?: number;
}

export interface SearchQuery {
  query: string;
  engine: string;
  url: string;
  timestamp: number;
}

export interface FormEvent {
  url: string;
  timestamp: number;
  formData?: Record<string, string>;
  type: 'submit' | 'focus';
}

export interface ContextHistory {
  navigation: NavigationEvent[];
  tabs: TabEvent[];
  windows: WindowEvent[];
  downloads: DownloadEvent[];
  searches: SearchQuery[];
  forms: FormEvent[];
}

export interface ContextTrackerConfig {
  enableNavigation?: boolean;
  enableTabs?: boolean;
  enableWindows?: boolean;
  enableDownloads?: boolean;
  enableSearches?: boolean;
  enableForms?: boolean;
  maxRecords?: number;
  storageKey?: string;
}

export interface TrackerState {
  isTracking: boolean;
  lastUpdate: number;
  totalEvents: number;
}

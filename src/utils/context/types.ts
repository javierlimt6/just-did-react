// types.ts - TypeScript interfaces for Chrome extension context tracking

export interface NavigationEvent {
  url: string;
  title: string;
  timestamp: number;
  transitionType?: chrome.history.TransitionType;
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
  state: chrome.downloads.State;
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

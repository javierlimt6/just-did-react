// useContextHistory.tsx - React hook for Chrome extension context tracking

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ContextHistory, 
  ContextTrackerConfig, 
  TrackerState,
  NavigationEvent,
  TabEvent,
  WindowEvent,
  DownloadEvent,
  SearchQuery,
  FormEvent
} from '@/types';
import { getContextTracker } from './contextTracker';

interface UseContextHistoryReturn {
  // Data
  history: ContextHistory | null;
  state: TrackerState;
  stats: {
    navigationCount: number;
    tabCount: number;
    windowCount: number;
    downloadCount: number;
    searchCount: number;
    formCount: number;
    totalEvents: number;
  };

  // Controls
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;

  // Getters for specific data
  getRecentNavigation: (limit?: number) => Promise<NavigationEvent[]>;
  getRecentTabs: (limit?: number) => Promise<TabEvent[]>;
  getRecentWindows: (limit?: number) => Promise<WindowEvent[]>;
  getRecentDownloads: (limit?: number) => Promise<DownloadEvent[]>;
  getSearchHistory: (limit?: number) => Promise<SearchQuery[]>;
  getFormActivity: (limit?: number) => Promise<FormEvent[]>;

  // State
  isLoading: boolean;
  error: string | null;
}

/**
 * React hook for Chrome extension context history tracking
 * 
 * @param config - Configuration options for the context tracker
 * @returns Object with history data, controls, and state
 * 
 * @example
 * ```tsx
 * const {
 *   history,
 *   startTracking,
 *   stopTracking,
 *   clearHistory,
 *   stats
 * } = useContextHistory({
 *   enableNavigation: true,
 *   enableTabs: true,
 *   maxRecords: 5000
 * });
 * 
 * useEffect(() => {
 *   startTracking();
 * }, []);
 * ```
 */
export const useContextHistory = (
  config: ContextTrackerConfig = {}
): UseContextHistoryReturn => {
  // State
  const [history, setHistory] = useState<ContextHistory | null>(null);
  const [state, setState] = useState<TrackerState>({
    isTracking: false,
    lastUpdate: Date.now(),
    totalEvents: 0,
  });
  const [stats, setStats] = useState({
    navigationCount: 0,
    tabCount: 0,
    windowCount: 0,
    downloadCount: 0,
    searchCount: 0,
    formCount: 0,
    totalEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const trackerRef = useRef(getContextTracker(config));
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and refresh data
  const refreshHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tracker = trackerRef.current;
      const [historyData, statsData, stateData] = await Promise.all([
        tracker.getFullHistory(),
        tracker.getStats(),
        Promise.resolve(tracker.getState()),
      ]);

      setHistory(historyData);
      setStats(statsData);
      setState(stateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await trackerRef.current.start();
      await refreshHistory();

      // Set up periodic refresh
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      refreshIntervalRef.current = setInterval(refreshHistory, 5000); // Refresh every 5 seconds

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
    } finally {
      setIsLoading(false);
    }
  }, [refreshHistory]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    try {
      trackerRef.current.stop();

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      setState(prev => ({ ...prev, isTracking: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop tracking');
    }
  }, []);

  // Clear history
  const clearHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await trackerRef.current.clearHistory();
      await refreshHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    } finally {
      setIsLoading(false);
    }
  }, [refreshHistory]);

  // Specific data getters
  const getRecentNavigation = useCallback(async (limit: number = 100): Promise<NavigationEvent[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.navigation.slice(-limit);
  }, []);

  const getRecentTabs = useCallback(async (limit: number = 100): Promise<TabEvent[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.tabs.slice(-limit);
  }, []);

  const getRecentWindows = useCallback(async (limit: number = 100): Promise<WindowEvent[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.windows.slice(-limit);
  }, []);

  const getRecentDownloads = useCallback(async (limit: number = 100): Promise<DownloadEvent[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.downloads.slice(-limit);
  }, []);

  const getSearchHistory = useCallback(async (limit: number = 100): Promise<SearchQuery[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.searches.slice(-limit);
  }, []);

  const getFormActivity = useCallback(async (limit: number = 100): Promise<FormEvent[]> => {
    const currentHistory = await trackerRef.current.getFullHistory();
    return currentHistory.forms.slice(-limit);
  }, []);

  // Initialize on mount
  useEffect(() => {
    refreshHistory();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshHistory]);

  return {
    // Data
    history,
    state,
    stats,

    // Controls
    startTracking,
    stopTracking,
    clearHistory,
    refreshHistory,

    // Getters
    getRecentNavigation,
    getRecentTabs,
    getRecentWindows,
    getRecentDownloads,
    getSearchHistory,
    getFormActivity,

    // State
    isLoading,
    error,
  };
};

export default useContextHistory;

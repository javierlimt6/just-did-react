// index.ts - Unified export for Chrome extension context history tracker

import { useContextHistory } from './useContextHistory';
import { getContextTracker } from './contextTracker';
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
} from './types';

// Export all types
export type {
  ContextHistory,
  ContextTrackerConfig,
  TrackerState,
  NavigationEvent,
  TabEvent,
  WindowEvent,
  DownloadEvent,
  SearchQuery,
  FormEvent
};

/**
 * Main entry point for the Chrome Extension Context History Tracker.
 * This is the unified function that should be imported in React applications.
 * 
 * @param config - Configuration options for the context tracker
 * @returns React hook for Chrome extension context history tracking
 * 
 * @example
 * ```tsx
 * import { useContextTracker } from 'chrome-context-tracker';
 * 
 * const MyComponent = () => {
 *   const {
 *     history,
 *     startTracking,
 *     stopTracking,
 *     clearHistory,
 *     stats
 *   } = useContextTracker({
 *     enableNavigation: true,
 *     enableTabs: true,
 *     maxRecords: 5000
 *   });
 *   
 *   useEffect(() => {
 *     startTracking();
 *     return () => stopTracking();
 *   }, []);
 *   
 *   return (
 *     <div>
 *       <h1>Chrome Activity Tracker</h1>
 *       <p>Total navigation events: {stats.navigationCount}</p>
 *       <p>Total tab events: {stats.tabCount}</p>
 *       <button onClick={clearHistory}>Clear History</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useContextTracker = useContextHistory;

// Alternative direct API for non-React usage
export const createContextTracker = getContextTracker;

// Default export the main hook for simplicity
export default useContextTracker;

// popup.tsx - Popup UI for Chrome extension

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useContextTracker } from './index';

const Popup: React.FC = () => {
  const {
    history,
    stats,
    state,
    startTracking,
    stopTracking,
    clearHistory,
    refreshHistory,
    isLoading,
    error
  } = useContextTracker();

  useEffect(() => {
    // Load the history data when popup opens
    refreshHistory();
  }, [refreshHistory]);

  return (
    <div className="popup">
      <header>
        <h1>Context History Tracker</h1>
        <div className="tracking-status">
          Status: {state.isTracking ? 'Tracking' : 'Paused'}
          <button onClick={state.isTracking ? stopTracking : startTracking}>
            {state.isTracking ? 'Pause' : 'Resume'} Tracking
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <div className="stats">
          <h2>Activity Statistics</h2>
          <ul>
            <li>Navigation events: {stats.navigationCount}</li>
            <li>Tab events: {stats.tabCount}</li>
            <li>Window events: {stats.windowCount}</li>
            <li>Download events: {stats.downloadCount}</li>
            <li>Search queries: {stats.searchCount}</li>
            <li>Form interactions: {stats.formCount}</li>
          </ul>
          <div className="total">Total events: {stats.totalEvents}</div>

          <button onClick={clearHistory} className="clear-btn">
            Clear History
          </button>

          <a href="options.html" target="_blank" className="options-link">
            View Detailed History
          </a>
        </div>
      )}
    </div>
  );
};

// Render the popup
ReactDOM.render(<Popup />, document.getElementById('root'));

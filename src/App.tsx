import React, { useEffect } from 'react'
import { useAppStore } from '@/store'
import LandingView from '@/components/LandingView'
import TimerView from '@/components/TimerView'
import TaskEntryView from '@/components/TaskEntryView'
import HistoryView from '@/components/HistoryView'
import { STORAGE_KEYS } from '@/types'

function App() {
  const { currentView, setCurrentView, setTimerComplete, sendChromeMessage } = useAppStore()

  useEffect(() => {
    // Check timer state and completion on app load
    const checkTimerState = async () => {
      try {
        // Check if timer just completed
        const result = await chrome.storage.local.get([STORAGE_KEYS.TIMER_COMPLETE])
        if (result[STORAGE_KEYS.TIMER_COMPLETE]) {
          // Clear the flag and show task entry
          await chrome.storage.local.set({ [STORAGE_KEYS.TIMER_COMPLETE]: false })
          setTimerComplete(true)
          setCurrentView('task-entry')
          return
        }

        // Check current timer state with better error handling
        const response = await sendChromeMessage('getTimerState')
        console.log('Timer state response:', response);

        // First check if response exists
        if (!response) {
          console.error('No response received from getTimerState');
          return;
        }

        // Then check for data property
        if (!response.data) {
          console.log('Response missing data property:', response);
          // Provide a default value
          response.data = { isRunning: false };
        }

        // Now safely check isRunning
        if (response.success && typeof response.data.isRunning !== 'undefined') {
          if (response.data.isRunning) {
            setCurrentView('timer')
          }
        } else {
          console.error('Invalid timer state response structure:', response);
        }
      } catch (error) {
        console.error('Error checking timer state:', error)
      }
    }

    checkTimerState()
  }, [setCurrentView, setTimerComplete, sendChromeMessage])

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />
      case 'timer':
        return <TimerView />
      case 'task-entry':
        return <TaskEntryView />
      case 'history':
        return <HistoryView />
      default:
        return <LandingView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto p-4">
        {renderCurrentView()}
      </div>
    </div>
  )
}

export default App
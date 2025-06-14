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

        // Check current timer state
        const response = await sendChromeMessage('getTimerState')
        if (response.success && response.data.isRunning) {
          setCurrentView('timer')
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
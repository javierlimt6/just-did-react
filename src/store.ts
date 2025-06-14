import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AppState, ActivityLog, TimerState, BrowserHistoryItem } from '@/types'
import { STORAGE_KEYS, TIMER_CONSTRAINTS } from '@/types'

interface AppStore extends AppState {
  // Timer actions
  setTimerState: (state: Partial<TimerState>) => void
  startTimer: (duration: number) => Promise<void>
  stopTimer: () => Promise<void>
  updateTimerRemaining: (remaining: number) => void

  // View actions
  setCurrentView: (view: AppState['currentView']) => void

  // Activity log actions
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
  getActivityLogs: () => ActivityLog[]
  clearActivityLogs: () => void

  // Timer completion
  setTimerComplete: (complete: boolean) => void

  // Browser history
  setBrowserHistory: (history: BrowserHistoryItem[]) => void

  // Chrome messaging
  sendChromeMessage: (action: string, data?: any) => Promise<any>
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentView: 'landing',
        timerState: {
          isRunning: false,
          startTime: null,
          duration: TIMER_CONSTRAINTS.DEFAULT_DURATION,
          alarmName: 'justDidTimer'
        },
        logs: [],
        isTimerComplete: false,

        // Timer actions
        setTimerState: (newState) => 
          set((state) => ({
            timerState: { ...state.timerState, ...newState }
          }), false, 'setTimerState'),

        startTimer: async (duration) => {
          const startTime = Date.now()
          set((state) => ({
            timerState: {
              ...state.timerState,
              isRunning: true,
              startTime,
              duration
            },
            currentView: 'timer'
          }), false, 'startTimer')

          // Send message to background script
          await get().sendChromeMessage('startTimer', { duration })
        },

        stopTimer: async () => {
          set((state) => ({
            timerState: {
              ...state.timerState,
              isRunning: false,
              startTime: null
            },
            currentView: 'landing'
          }), false, 'stopTimer')

          await get().sendChromeMessage('stopTimer')
        },

        updateTimerRemaining: (remaining) =>
          set((state) => ({
            timerState: { ...state.timerState, remaining }
          }), false, 'updateTimerRemaining'),

        // View actions
        setCurrentView: (view) => 
          set({ currentView: view }, false, 'setCurrentView'),

        // Activity log actions
        addActivityLog: (logData) => {
          const newLog: ActivityLog = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...logData
          }

          set((state) => ({
            logs: [newLog, ...state.logs]
          }), false, 'addActivityLog')
        },

        getActivityLogs: () => get().logs,

        clearActivityLogs: () => 
          set({ logs: [] }, false, 'clearActivityLogs'),

        // Timer completion
        setTimerComplete: (complete) => 
          set({ isTimerComplete: complete }, false, 'setTimerComplete'),

        // Browser history
        setBrowserHistory: (history) => 
          set((state) => ({
            // Store history with the most recent log if exists
            logs: state.logs.length > 0 
              ? [
                  { ...state.logs[0], browserHistory: history },
                  ...state.logs.slice(1)
                ]
              : state.logs
          }), false, 'setBrowserHistory'),

        // Chrome messaging
        sendChromeMessage: async (action, data) => {
          try {
            const response = await chrome.runtime.sendMessage({ action, data })
            return response
          } catch (error) {
            console.error('Chrome message error:', error)
            throw error
          }
        }
      }),
      {
        name: 'justdid-storage',
        partialize: (state) => ({
          logs: state.logs,
          timerState: {
            duration: state.timerState.duration
          }
        })
      }
    ),
    { name: 'JustDid Store' }
  )
)

// Selectors for better performance
export const useTimerState = () => useAppStore((state) => state.timerState)
export const useCurrentView = () => useAppStore((state) => state.currentView)
export const useActivityLogs = () => useAppStore((state) => state.logs)
export const useIsTimerComplete = () => useAppStore((state) => state.isTimerComplete)
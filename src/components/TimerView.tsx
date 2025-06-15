import { useEffect, useState } from 'react'
import { StopIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '@/store'

const TimerView = () => {
  const { timerState, stopTimer, setCurrentView, sendChromeMessage, updateTimerRemaining } = useAppStore()
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const updateTimer = async () => {
      try {
        const response = await sendChromeMessage('getTimerState')
        if (response.success) {
          if (response.data.isRunning) {
            const remaining = response.data.remaining
            setTimeRemaining(remaining)
            updateTimerRemaining(remaining)

            if (remaining <= 0) {
              window.close() // Close the popup when timer ends
              setCurrentView('task-entry')
              return
            }
          } else {
            setCurrentView('landing')
            return
          }
        }
      } catch (error) {
        console.error('Error updating timer:', error)
      }
    }

    const startInterval = () => {
      updateTimer() // Initial update
      setIsLoaded(true)
      interval = setInterval(updateTimer, 1000)
    }

    startInterval()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [sendChromeMessage, setCurrentView, updateTimerRemaining])

  const handleStopTimer = async () => {
    try {
      await stopTimer()
    } catch (error) {
      console.error('Error stopping timer:', error)
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!timerState.duration || !timerState.startTime) return 0
    const totalMs = timerState.duration * 60 * 1000
    const elapsed = totalMs - timeRemaining
    return Math.min(100, Math.max(0, (elapsed / totalMs) * 100))
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">
          Focus Session Active
        </h1>
      </div>

      {/* Timer Display */}
      <div className="glass-card p-8 mb-6 text-center">
        <div className="timer-display mb-6">
          {formatTime(timeRemaining)}
        </div>

        {/* Progress Bar */}
        {/* <div className="progress-bar mb-6">
          <div 
            className="progress-fill"
            style={{ width: `${getProgress()}%` }}
          />
        </div> */}



        <button
          onClick={handleStopTimer}
          className="btn-danger flex items-center justify-center space-x-2 mx-auto"
        >
          <StopIcon className="w-4 h-4" />
          <span>Stop Session</span>
        </button>
      </div>

      {/* Motivation */}
      <div className="glass-card p-4 bg-white/80">
        <div className="text-center">
          <span className="text-sm text-gray-700 font-medium mb-2">
            🧠 Stay Focused
          </span><br/>
          <span className="text-xs text-gray-600">
            Your timer is still running, come back later!
          </span>
        </div>
      </div>
    </div>
  )
}

export default TimerView
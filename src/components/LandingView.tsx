import React, { useState } from 'react'
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '@/store'
import { TIMER_CONSTRAINTS } from '@/types'

const LandingView = () => {
  const { startTimer, setCurrentView } = useAppStore()
  const [duration, setDuration] = useState<number>(TIMER_CONSTRAINTS.DEFAULT_DURATION)
  const [isStarting, setIsStarting] = useState(false)

  const handleStartTimer = async () => {
    if (duration < TIMER_CONSTRAINTS.MIN_DURATION || duration > TIMER_CONSTRAINTS.MAX_DURATION) {
      alert(`Please enter a duration between ${TIMER_CONSTRAINTS.MIN_DURATION} and ${TIMER_CONSTRAINTS.MAX_DURATION} minutes.`)
      return
    }

    setIsStarting(true)
    try {
      await startTimer(duration)
      // The store will handle view change
      window.close();   // Close the popup after starting the timer
    } catch (error) {
      console.error('Error starting timer:', error)
      setIsStarting(false)
    }
  }

  const handleShowHistory = () => {
    setCurrentView('history')
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      setDuration(Math.max(TIMER_CONSTRAINTS.MIN_DURATION, Math.min(TIMER_CONSTRAINTS.MAX_DURATION, value)))
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">
          JustDid
        </h1>
        <p className="text-blue-100 text-sm opacity-90">
          What will you accomplish next?
        </p>
      </div>

      {/* Timer Configuration */}
      <div className="glass-card p-6 mb-6">
        <label className="block text-gray-700 font-semibold mb-4 text-sm">
          Focus Duration
        </label>

        <div className="flex items-center justify-center space-x-3 mb-6">
          <input
            type="number"
            min={TIMER_CONSTRAINTS.MIN_DURATION}
            max={TIMER_CONSTRAINTS.MAX_DURATION}
            value={duration}
            onChange={handleDurationChange}
            className="w-20 h-12 text-center text-xl font-bold text-primary-600 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
          />
          <span className="text-lg font-semibold text-gray-600">minutes</span>
        </div>

        <div className="text-center">
          <button
            onClick={handleStartTimer}
            disabled={isStarting}
            className="btn-primary flex items-center justify-center space-x-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClockIcon className="w-5 h-5" />
            <span>{isStarting ? 'Starting...' : 'Start Focus Session'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleShowHistory}
          className="btn-secondary flex items-center justify-center space-x-2 w-full"
        >
          <DocumentTextIcon className="w-5 h-5" />
          <span>View Activity History</span>
        </button>
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-4 mt-6 bg-white/80">
        <h3 className="font-semibold text-gray-700 mb-2 text-sm">💡 Quick Tips</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Choose a realistic focus duration</li>
          <li>• Minimize distractions before starting</li>
          <li>• Log your accomplishments when the timer ends</li>
        </ul>
      </div>
    </div>
  )
}

export default LandingView
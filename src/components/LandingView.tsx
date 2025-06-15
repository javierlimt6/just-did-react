import React, { useState } from 'react'
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '@/store'
import { TIMER_CONSTRAINTS } from '@/types'
import { Field, NumberInput } from '@chakra-ui/react';

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

  const handleDurationChange = (details: { value: string }) => {
    const value = parseInt(details.value)
    if (!isNaN(value)) {
      setDuration(Math.max(TIMER_CONSTRAINTS.MIN_DURATION, Math.min(TIMER_CONSTRAINTS.MAX_DURATION, value)))
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">
          JustDid
        </h1>
        <span className="text-blue-100 text-sm opacity-90">
          Be intentional with your productivity.
        </span>
        <p className="mt-6 text-sm leading-relaxed">
          Inspired by the {' '}
          <a 
            href="https://chrisguillebeau.com/168-hours-time-tracking" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors"
          >
            168 Hours Method
          </a>
          {' '}by{' '}
          <a
              href="https://www.linkedin.com/in/lauravanderkam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
          >
              Laura Vanderkam
          </a>
        </p>
      </div>

      {/* Timer Configuration */}
      <div className="glass-card p-6 mb-6">
        {/* <label
          className="block text-gray-700 font-semibold mb-4"
          style={{ fontSize: '1.75rem', lineHeight: '2rem' }}
        >
          Time Interval
        </label> */}
      <Field.Root>
        <Field.Label>Focus Interval</Field.Label>
          <NumberInput.Root width="100%"
          defaultValue={TIMER_CONSTRAINTS.DEFAULT_DURATION.toString()}
          min={TIMER_CONSTRAINTS.MAX_DURATION}
          max={TIMER_CONSTRAINTS.MIN_DURATION}
          value={duration.toString()}
          onValueChange={(e) => handleDurationChange(e)}>
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
            <Field.HelperText>Enter a number between {TIMER_CONSTRAINTS.MIN_DURATION} and {TIMER_CONSTRAINTS.MAX_DURATION}</Field.HelperText>
      </Field.Root>
      </div>

      {/* Action Buttons */}
      <div className="glass-card w-full p-4 mt-6 flex gap-4">
        <button
          onClick={handleStartTimer}
          disabled={isStarting}
          className="btn-primary flex items-center justify-center space-x-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ClockIcon/>
          <span>{isStarting ? 'Starting...' : 'Start Focus Session'}</span>
        </button>

        <button
          onClick={() => handleShowHistory()}
          className="btn-secondary flex items-center justify-center space-x-2 flex-1"
        >
          <DocumentTextIcon/>
          <span>View Activity History</span>
        </button>
      </div>
      {/* Quick Tips */}
      <div className="glass-card p-4 mt-6 bg-white/80">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">💡 Quick Tips</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <span>Set a short focus interval (I use 15 mins)</span>
          <br/>
          <span>Use 2-5 words to log your tasks at every interval</span>
        </div>
      </div>
    </div>
  )
}

export default LandingView;
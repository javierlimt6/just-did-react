import { useState, useEffect } from 'react'
import { SparklesIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Confetti from 'react-confetti'
import { useAppStore } from '@/store'
import type { BrowserHistoryItem } from '@/types'

const TaskEntryView = () => {
  const { 
    addActivityLog, 
    setCurrentView, 
    timerState, 
    isTimerComplete,
    sendChromeMessage,
    setBrowserHistory 
  } = useAppStore()

  const [task, setTask] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)
  const [browserHistory, setBrowserHistoryLocal] = useState<BrowserHistoryItem[]>([])
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)

  useEffect(() => {
    // Load browser history when component mounts
    loadBrowserHistory()

    // Hide confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000)

    return () => clearTimeout(timer)
  }, [])

  const loadBrowserHistory = async () => {
    try {
      const response = await sendChromeMessage('getBrowserHistory', { minutes: timerState.duration || 15 })
      if (response.success) {
        setBrowserHistoryLocal(response.data)
        setBrowserHistory(response.data)
      }
    } catch (error) {
      console.error('Error loading browser history:', error)
    }
  }

  const generateAISuggestion = () => {
    setIsGeneratingSuggestion(true)

    // Simple AI suggestion based on browser history and common patterns
    const suggestions = [
      'Researched and learned about new development techniques',
      'Reviewed and organized project documentation',
      'Analyzed data and prepared insights for upcoming decisions',
      'Collaborated on team project and provided valuable input',
      'Completed focused work on current priorities',
      'Studied and absorbed new information from online resources',
      'Organized and planned upcoming tasks and projects',
      'Reviewed and optimized existing processes and workflows'
    ]

    // Add browser history context if available
    if (browserHistory.length > 0) {
      const domains = browserHistory.map(item => item.domain)
      const uniqueDomains = [...new Set(domains)]

      if (uniqueDomains.some(domain => domain.includes('github'))) {
        suggestions.unshift('Worked on code development and reviewed GitHub repositories')
      }
      if (uniqueDomains.some(domain => domain.includes('stackoverflow'))) {
        suggestions.unshift('Researched technical solutions and debugged code issues')
      }
      if (uniqueDomains.some(domain => domain.includes('docs') || domain.includes('documentation'))) {
        suggestions.unshift('Read documentation and learned about new technologies')
      }
    }

    setTimeout(() => {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
      setTask(randomSuggestion)
      setIsGeneratingSuggestion(false)
    }, 1500) // Simulate AI processing time
  }

  const handleSaveAndContinue = async () => {
    if (!task.trim()) {
      alert('Please describe what you accomplished!')
      return
    }

    setIsLoading(true)
    try {
      addActivityLog({
        task: task.trim(),
        duration: timerState.duration || 0,
        browserHistory
      })

      // Show success and redirect to landing
      setTimeout(() => {
        setCurrentView('landing')
      }, 500)
    } catch (error) {
      console.error('Error saving activity log:', error)
      setIsLoading(false)
    }
  }

  const handleSaveAndViewHistory = async () => {
    if (!task.trim()) {
      alert('Please describe what you accomplished!')
      return
    }

    setIsLoading(true)
    try {
      addActivityLog({
        task: task.trim(),
        duration: timerState.duration || 0,
        browserHistory
      })

      // Redirect to history view
      setTimeout(() => {
        setCurrentView('history')
      }, 500)
    } catch (error) {
      console.error('Error saving activity log:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Confetti Animation */}
      {showConfetti && isTimerComplete && (
        <Confetti
          width={400}
          height={600}
          recycle={false}
          numberOfPieces={50}
          gravity={0.3}
        />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-2xl font-bold mb-2 text-white">
          Great Work!
        </h1>
        <p className="text-blue-100 text-sm opacity-90">
          What did you just accomplish?
        </p>
      </div>

      {/* Task Entry Form */}
      <div className="glass-card p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 font-semibold text-sm">
              Describe your accomplishment
            </label>
            <button
              onClick={generateAISuggestion}
              disabled={isGeneratingSuggestion}
              className="btn-secondary text-xs py-1 px-2 flex items-center space-x-1 disabled:opacity-50"
            >
              <SparklesIcon className="w-3 h-3" />
              <span>{isGeneratingSuggestion ? 'Thinking...' : 'AI Suggest'}</span>
            </button>
          </div>

          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="I completed research on React state management patterns and learned about Zustand..."
            className="input-field h-24 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSaveAndContinue}
            disabled={isLoading || !task.trim()}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ClockIcon className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save & Start New Session'}</span>
          </button>

          <button
            onClick={handleSaveAndViewHistory}
            disabled={isLoading || !task.trim()}
            className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Save & View History</span>
          </button>
        </div>
      </div>

      {/* Browser History Context */}
      {browserHistory.length > 0 && (
        <div className="glass-card p-4 bg-white/80">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">
            📱 Recent Activity Context
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {browserHistory.slice(0, 3).map((item, index) => (
              <div key={index} className="text-xs text-gray-600 truncate">
                <span className="font-medium">{item.domain}</span> - {item.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskEntryView
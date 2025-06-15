import React, { useState } from 'react'
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon, 
  TrashIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import { useAppStore } from '@/store'
import type { ActivityLog, ExportFormat } from '@/types'

const HistoryView = () => {
  const { logs, setCurrentView, clearActivityLogs } = useAppStore()
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleBack = () => {
    setCurrentView('landing')
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `justdid-logs-${format(new Date(), 'yyyy-MM-dd')}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Duration (min)', 'Task', 'Domains Visited']
    const csvData = logs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd'),
      format(new Date(log.timestamp), 'HH:mm:ss'),
      log.duration.toString(),
      `"${log.task.replace(/"/g, '""')}"`, // Escape quotes in task description
      log.browserHistory ? log.browserHistory.map(h => h.domain).join('; ') : ''
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `justdid-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 20

    // Title
    doc.setFontSize(18)
    doc.text('JustDid Activity Log', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Date range
    doc.setFontSize(10)
    doc.text(`Generated on ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Activity entries
    doc.setFontSize(12)
    logs.forEach((log, index) => {
      if (yPosition > 270) { // Add new page if needed
        doc.addPage()
        yPosition = 20
      }

      // Date and duration
      const dateStr = format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')
      doc.setFont(undefined, 'bold')
      doc.text(`${index + 1}. ${dateStr} (${log.duration} min)`, 20, yPosition)
      yPosition += 8

      // Task description
      doc.setFont(undefined, 'normal')
      const taskLines = doc.splitTextToSize(log.task, pageWidth - 40)
      doc.text(taskLines, 20, yPosition)
      yPosition += taskLines.length * 5 + 5

      // Browser history if available
      if (log.browserHistory && log.browserHistory.length > 0) {
        doc.setFontSize(10)
        doc.text('Visited:', 20, yPosition)
        yPosition += 4

        log.browserHistory.slice(0, 3).forEach(item => {
          const historyLine = `• ${item.domain}`
          doc.text(historyLine, 25, yPosition)
          yPosition += 4
        })
      }

      yPosition += 10
      doc.setFontSize(12)
    })

    doc.save(`justdid-logs-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format)

    try {
      switch (format) {
        case 'json':
          exportToJSON()
          break
        case 'csv':
          exportToCSV()
          break
        case 'pdf':
          exportToPDF()
          break
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error)
      alert(`Failed to export to ${format.toUpperCase()}`)
    } finally {
      setTimeout(() => setIsExporting(null), 1000)
    }
  }

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
      clearActivityLogs()
    }
  }

  const getTotalHours = () => {
    return logs.reduce((total, log) => total + log.duration, 0) / 60
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="btn-secondary flex items-center space-x-2 py-2 px-3"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-xl font-bold text-white">Activity History</h1>

        <div className="w-16"></div> {/* Spacer for alignment */}
      </div>

      {/* Stats */}
      <div className="glass-card p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{logs.length}</div>
            <div className="text-sm text-gray-600">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">{getTotalHours().toFixed(1)}h</div>
            <div className="text-sm text-gray-600">Total Focus</div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="glass-card p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Export Data</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['json', 'csv', 'pdf'] as ExportFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting === format || logs.length === 0}
              className="btn-secondary text-xs py-2 px-3 flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="w-3 h-3" />
              <span>{isExporting === format ? '...' : format.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No activities logged yet</p>
            <p className="text-sm text-gray-400">Start your first focus session to see your accomplishments here!</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <ActivityLogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {logs.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={handleClearLogs}
            className="text-danger-500 hover:text-danger-600 text-sm font-medium flex items-center space-x-1 mx-auto transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear All Logs</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Activity Log Entry Component
const ActivityLogEntry: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className="p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500">
          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
        </div>
        <div className="text-xs text-primary-600 font-medium">
          {log.duration} min
        </div>
      </div>

      <div className="text-sm text-gray-800">
        {log.task.length > 100 && !isExpanded 
          ? `${log.task.substring(0, 100)}...`
          : log.task
        }
      </div>

      {isExpanded && log.browserHistory && log.browserHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Browser Activity:</div>
          <div className="space-y-1">
            {log.browserHistory.slice(0, 5).map((item, index) => (
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

export default HistoryView
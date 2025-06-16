import React, { useState } from 'react'
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon, 
  TrashIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon 
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import { useAppStore } from '@/store'
import type { ActivityLog, ExportFormat } from '@/types'
import { Button, HStack, IconButton, Collapsible, Stat, Box, Dialog, CloseButton, Portal } from '@chakra-ui/react'

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

  const getTotalHours = () => {
    return logs.reduce((total, log) => total + log.duration, 0) / 60
  }


  const data = [
    { label: 'Total Tasks', value: logs.length },
    { label: 'Total Focus Time', value: `${getTotalHours().toFixed(1)} hours` }
  ]
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <IconButton onClick={handleBack} variant="surface">
          <ArrowLeftIcon />
        </IconButton>

        <h2 className="text-xl font-bold text-white">Your Tasks</h2>

        <div className="w-16"></div> {/* Spacer for alignment */}
      </div>

      {/* Stats */}
      <div className="glass-card p-4 mb-6">
      <HStack justifyContent="space-between" className="mb-4">
      {/* <DataList.Root variant="bold" size="lg"> */}
        {data.map((item) => (
          <Stat.Root key={item.label}>
            <Stat.Label>{item.label}</Stat.Label>
            <Stat.ValueText alignItems="baseline">
              {item.value}
            </Stat.ValueText>
          </Stat.Root>
        ))}
      {/* </DataList.Root> */}
      </HStack>
      </div>
      {/* <div className="glass-card p-4 mb-6">
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
      </div> */}

      {/* Export Buttons */}
      <div className="glass-card p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-6 text-sm">Export</h3>
        <div className="grid grid-cols-3 mt-4">
          <HStack>
          {(['json', 'csv', 'pdf'] as ExportFormat[]).map((format) => (
            <Button
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting === format || logs.length === 0}
              loading={isExporting === format}
              loadingText={format.toUpperCase()}
              size="sm"
              variant="surface"
            >
              <DocumentArrowDownIcon/>
              {format.toUpperCase()}
            </Button>
          ))}
          </HStack>
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-card overflow-hidden">
        <Collapsible.Root unmountOnExit>
          <Collapsible.Trigger paddingY="3">
            <h3 className="font-semibold text-gray-700">View Task History</h3>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Box padding="4" borderWidth="1px">
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
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
        
      </div>

      {/* Clear All Button */}
      {logs.length > 0 && (
        <div className="mt-4 text-center">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="solid" colorPalette="red" size="sm">
                Delete All Tasks
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content bg="black" color="white" maxWidth="sm" width="90%">
                  <Dialog.Header>
                    <Dialog.Title>Confirm Delete</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <p>
                      Are you sure you want to delete your task history? This is irreversible.
                    </p>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button
                      onClick={clearActivityLogs}
                      colorPalette="red"
                      variant="subtle"
                      size="sm"
                      aria-label="Clear all tasks"
                    >
                      <TrashIcon /> Confirm
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
          
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
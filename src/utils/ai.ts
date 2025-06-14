import type { BrowserHistoryItem } from '@/types'

export function generateAISuggestion(browserHistory: BrowserHistoryItem[]): string {
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

  // Pick one suggestion at random
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
  return randomSuggestion
}
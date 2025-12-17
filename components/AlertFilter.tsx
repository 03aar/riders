'use client'

// Alert filter component with toggles for each alert type
// Allows users to show/hide specific alert types on the map

import { AlertType } from '@/types/database.types'
import { useState } from 'react'

interface AlertFilterProps {
  onFilterChange: (enabledTypes: AlertType[]) => void
}

const alertTypes = [
  { value: 'cop' as AlertType, label: 'Police', icon: '🚓', color: 'bg-red-500' },
  { value: 'accident' as AlertType, label: 'Accident', icon: '⚠️', color: 'bg-orange-500' },
  { value: 'roadblock' as AlertType, label: 'Roadblock', icon: '🚧', color: 'bg-purple-500' },
  { value: 'pothole' as AlertType, label: 'Pothole', icon: '🕳️', color: 'bg-yellow-600' },
  { value: 'traffic' as AlertType, label: 'Traffic', icon: '🚦', color: 'bg-pink-500' },
  { value: 'speedtrap' as AlertType, label: 'Speed Trap', icon: '📷', color: 'bg-indigo-500' },
  { value: 'flooding' as AlertType, label: 'Flooding', icon: '💧', color: 'bg-cyan-500' },
]

export default function AlertFilter({ onFilterChange }: AlertFilterProps) {
  const [enabledTypes, setEnabledTypes] = useState<AlertType[]>(
    alertTypes.map(t => t.value)
  )
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleType = (type: AlertType) => {
    const newEnabledTypes = enabledTypes.includes(type)
      ? enabledTypes.filter(t => t !== type)
      : [...enabledTypes, type]

    setEnabledTypes(newEnabledTypes)
    onFilterChange(newEnabledTypes)
  }

  const toggleAll = () => {
    if (enabledTypes.length === alertTypes.length) {
      // Disable all
      setEnabledTypes([])
      onFilterChange([])
    } else {
      // Enable all
      const allTypes = alertTypes.map(t => t.value)
      setEnabledTypes(allTypes)
      onFilterChange(allTypes)
    }
  }

  return (
    <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg z-10">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium text-gray-700">Filters</span>
          <span className="text-xs text-gray-500">({enabledTypes.length}/{alertTypes.length})</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter options */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          {/* Toggle all button */}
          <button
            onClick={toggleAll}
            className="w-full mb-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            {enabledTypes.length === alertTypes.length ? 'Disable All' : 'Enable All'}
          </button>

          {/* Individual toggles */}
          <div className="space-y-2">
            {alertTypes.map((alertType) => {
              const isEnabled = enabledTypes.includes(alertType.value)
              return (
                <button
                  key={alertType.value}
                  onClick={() => toggleType(alertType.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isEnabled
                      ? `${alertType.color} text-white shadow-sm`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{alertType.icon}</span>
                    <span className="text-sm font-medium">{alertType.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isEnabled
                      ? 'bg-white border-white'
                      : 'border-gray-300'
                  }`}>
                    {isEnabled && (
                      <svg className="w-4 h-4 text-current" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

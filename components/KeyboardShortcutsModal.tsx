'use client'

// Keyboard Shortcuts Help Modal
// Shows all available keyboard shortcuts

import { useEffect, useState } from 'react'

interface Shortcut {
  keys: string[]
  description: string
}

const shortcuts: Shortcut[] = [
  { keys: ['Alt', 'M'], description: 'Go to Map' },
  { keys: ['Alt', 'P'], description: 'Go to Profile' },
  { keys: ['Alt', 'S'], description: 'Go to Settings' },
  { keys: ['Ctrl', 'N'], description: 'Create new alert' },
  { keys: ['Ctrl', 'F'], description: 'Toggle filters' },
  { keys: ['Shift', '?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close modals' },
]

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleShowShortcuts() {
      setIsOpen(true)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('show-shortcuts', handleShowShortcuts)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('show-shortcuts', handleShowShortcuts)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1002] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Keyboard Shortcuts</h2>
            <p className="text-sm text-gray-600 mt-1">Boost your productivity with these shortcuts</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center space-x-2">
                {shortcut.keys.map((key, keyIndex) => (
                  <div key={keyIndex} className="flex items-center space-x-1">
                    <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-400">+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded">Esc</kbd> to close this dialog
          </p>
        </div>
      </div>
    </div>
  )
}

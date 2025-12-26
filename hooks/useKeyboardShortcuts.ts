'use client'

// Keyboard Shortcuts Hook
// Provides keyboard shortcuts for power users

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey || shortcut.ctrl === event.metaKey
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          altMatch &&
          shiftMatch
        ) {
          event.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Global keyboard shortcuts
export function useGlobalShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'm',
      alt: true,
      action: () => router.push('/map'),
      description: 'Go to Map'
    },
    {
      key: 'p',
      alt: true,
      action: () => router.push('/profile'),
      description: 'Go to Profile'
    },
    {
      key: 's',
      alt: true,
      action: () => router.push('/settings'),
      description: 'Go to Settings'
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Show keyboard shortcuts modal
        const event = new CustomEvent('show-shortcuts')
        window.dispatchEvent(event)
      },
      description: 'Show keyboard shortcuts'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Trigger new alert
        const event = new CustomEvent('new-alert')
        window.dispatchEvent(event)
      },
      description: 'Create new alert'
    },
    {
      key: 'f',
      ctrl: true,
      action: () => {
        // Toggle filters
        const event = new CustomEvent('toggle-filters')
        window.dispatchEvent(event)
      },
      description: 'Toggle filters'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}

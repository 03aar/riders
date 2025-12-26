'use client'

// Global Toast Provider
// Listens for toast events from anywhere in the app

import { useEffect, useState } from 'react'
import Toast from './Toast'

interface ToastData {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function GlobalToastProvider() {
  const [toasts, setToasts] = useState<(ToastData & { id: number })[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    function handleShowToast(event: Event) {
      const customEvent = event as CustomEvent<ToastData>
      const newToast = {
        ...customEvent.detail,
        id: nextId
      }
      setToasts(prev => [...prev, newToast])
      setNextId(prev => prev + 1)
    }

    window.addEventListener('show-toast', handleShowToast as EventListener)

    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener)
    }
  }, [nextId])

  function removeToast(id: number) {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            bottom: `${24 + index * 80}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'fixed',
            zIndex: 1001
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  )
}

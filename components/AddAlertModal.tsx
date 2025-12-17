'use client'

// Modal for adding new alerts with all 7 types
// Enhanced UI with character limit and success feedback

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertType } from '@/types/database.types'
import Toast from './Toast'

interface AddAlertModalProps {
  location: { lat: number; lng: number }
  onClose: () => void
  onSuccess?: () => void
}

export default function AddAlertModal({ location, onClose, onSuccess }: AddAlertModalProps) {
  const [type, setType] = useState<AlertType>('cop')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [showToast, setShowToast] = useState(false)

  const supabase = createClient()
  const maxDescriptionLength = 50

  // Get user's username
  useEffect(() => {
    async function getUsername() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUsername(profile.username)
        }
      }
    }
    getUsername()
  }, [])

  const alertTypes = [
    { value: 'cop', label: 'Police', icon: '🚓', color: 'bg-red-500' },
    { value: 'accident', label: 'Accident', icon: '⚠️', color: 'bg-orange-500' },
    { value: 'roadblock', label: 'Roadblock', icon: '🚧', color: 'bg-purple-500' },
    { value: 'pothole', label: 'Pothole', icon: '🕳️', color: 'bg-yellow-600' },
    { value: 'traffic', label: 'Traffic', icon: '🚦', color: 'bg-pink-500' },
    { value: 'speedtrap', label: 'Speed Trap', icon: '📷', color: 'bg-indigo-500' },
    { value: 'flooding', label: 'Flooding', icon: '💧', color: 'bg-cyan-500' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to add alerts')
        return
      }

      const { error: insertError } = await (supabase as any).from('alerts').insert({
        user_id: user.id,
        type,
        description: description.trim(),
        latitude: location.lat,
        longitude: location.lng,
        posted_by_username: username,
        upvotes: 0,
        downvotes: 0,
        voted_by: [],
      })

      if (insertError) throw insertError

      // Show success toast
      setShowToast(true)

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after a brief delay to show toast
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add alert')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What's happening?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {alertTypes.map((alertType) => (
                <button
                  key={alertType.value}
                  type="button"
                  onClick={() => setType(alertType.value as AlertType)}
                  className={`
                    p-3 rounded-lg border-2 transition-all flex flex-col items-center
                    ${type === alertType.value
                      ? `${alertType.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{alertType.icon}</div>
                  <div className="text-xs font-medium text-center leading-tight">{alertType.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <span className={`text-xs ${description.length > maxDescriptionLength ? 'text-red-500' : 'text-gray-500'}`}>
                {description.length}/{maxDescriptionLength}
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= maxDescriptionLength) {
                  setDescription(e.target.value)
                }
              }}
              rows={2}
              maxLength={maxDescriptionLength}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief details (optional)"
            />
          </div>

          {/* Location info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <div className="font-medium mb-1">📍 Location</div>
            <div>Lat: {location.lat.toFixed(6)}</div>
            <div>Lng: {location.lng.toFixed(6)}</div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Posting Alert...' : 'Post Alert'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Alert expires in 2 hours • Other riders can vote on accuracy
          </p>
        </form>
      </div>

      {/* Success toast */}
      {showToast && (
        <Toast
          message="Alert posted successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

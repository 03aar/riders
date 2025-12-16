'use client'

// Modal for adding new spots (water, rest, repair)
// Includes name and type selection

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SpotType } from '@/types/database.types'

interface AddSpotModalProps {
  location: { lat: number; lng: number }
  onClose: () => void
}

export default function AddSpotModal({ location, onClose }: AddSpotModalProps) {
  const [type, setType] = useState<SpotType>('water')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const spotTypes = [
    { value: 'water', label: 'Water', icon: '💧', color: 'bg-blue-500' },
    { value: 'rest', label: 'Rest Area', icon: '☕', color: 'bg-green-500' },
    { value: 'repair', label: 'Repair Shop', icon: '🔧', color: 'bg-orange-500' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to add spots')
        return
      }

      const { error: insertError } = await (supabase as any).from('spots').insert({
        user_id: user.id,
        name,
        type,
        latitude: location.lat,
        longitude: location.lng,
      })

      if (insertError) throw insertError

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add spot')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Spot</h2>
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
          {/* Spot type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Spot Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {spotTypes.map((spotType) => (
                <button
                  key={spotType.value}
                  type="button"
                  onClick={() => setType(spotType.value as SpotType)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${type === spotType.value
                      ? `${spotType.color} text-white border-transparent`
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{spotType.icon}</div>
                  <div className="text-xs font-medium">{spotType.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Spot Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Shree Krishna Dhaba"
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
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Spot...' : 'Add Spot'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            This spot will stay on the map permanently
          </p>
        </form>
      </div>
    </div>
  )
}

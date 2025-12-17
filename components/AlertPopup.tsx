'use client'

// Alert popup component for map markers
// Shows alert details with voting buttons and distance

import { useState } from 'react'
import { Alert } from '@/types/database.types'
import { handleVote, calculateDistance, formatDistance } from '@/lib/voting'
import { formatDistanceToNow } from 'date-fns'
import Toast from './Toast'

interface AlertPopupProps {
  alert: Alert
  userId: string | null
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onVoteSuccess?: () => void
}

export default function AlertPopup({
  alert,
  userId,
  userLocation,
  onClose,
  onVoteSuccess
}: AlertPopupProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(
    userId ? alert.voted_by?.includes(userId) : false
  )
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Calculate distance from user
  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        alert.latitude,
        alert.longitude
      )
    : null

  // Get alert type styling
  const alertTypeConfig = {
    cop: { label: 'Police', icon: '🚓', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' },
    accident: { label: 'Accident', icon: '⚠️', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
    roadblock: { label: 'Roadblock', icon: '🚧', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-100' },
    pothole: { label: 'Pothole', icon: '🕳️', color: 'bg-yellow-600', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    traffic: { label: 'Traffic', icon: '🚦', color: 'bg-pink-500', textColor: 'text-pink-700', bgColor: 'bg-pink-100' },
    speedtrap: { label: 'Speed Trap', icon: '📷', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-100' },
    flooding: { label: 'Flooding', icon: '💧', color: 'bg-cyan-500', textColor: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  }

  const config = alertTypeConfig[alert.type]

  async function handleVoteClick(voteType: 'upvote' | 'downvote') {
    if (!userId) {
      setError('You must be logged in to vote')
      return
    }

    if (hasVoted) {
      setError('You have already voted on this alert')
      return
    }

    setIsVoting(true)
    setError(null)

    const result = await handleVote(alert.id, voteType, userId)

    if (result.success) {
      setHasVoted(true)
      setToastMessage(voteType === 'upvote' ? 'Upvoted successfully!' : 'Downvoted successfully!')
      setShowToast(true)

      if (onVoteSuccess) {
        onVoteSuccess()
      }

      // Close popup after showing toast
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setError(result.error || 'Failed to vote')
    }

    setIsVoting(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{config.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{config.label}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Alert info */}
        <div className="space-y-3 mb-4">
          {alert.description && (
            <div>
              <p className="text-gray-700">{alert.description}</p>
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {distance !== null && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{formatDistance(distance)} away</span>
              </div>
            )}
            {alert.posted_by_username && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>@{alert.posted_by_username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Voting section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {hasVoted ? (
                <span className="text-green-600 font-medium">✓ You voted on this alert</span>
              ) : (
                <span>Is this alert accurate?</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {/* Upvote button */}
              <button
                onClick={() => handleVoteClick('upvote')}
                disabled={isVoting || hasVoted || !userId}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  hasVoted || !userId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
                <span className="font-bold">{alert.upvotes}</span>
              </button>

              {/* Downvote button */}
              <button
                onClick={() => handleVoteClick('downvote')}
                disabled={isVoting || hasVoted || !userId}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  hasVoted || !userId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 20l8-8h-5V4H9v8H4z" />
                </svg>
                <span className="font-bold">{alert.downvotes}</span>
              </button>
            </div>
          </div>

          {!userId && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Log in to vote on alerts
            </p>
          )}
        </div>

        {/* Net votes indicator */}
        <div className="mt-3 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            alert.upvotes - alert.downvotes > 0
              ? 'bg-green-100 text-green-700'
              : alert.upvotes - alert.downvotes < 0
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            Net Score: {alert.upvotes - alert.downvotes > 0 ? '+' : ''}{alert.upvotes - alert.downvotes}
          </div>
        </div>
      </div>

      {/* Success toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}

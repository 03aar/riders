// Voting utility functions
// Handles upvote/downvote logic with user tracking and auto-delete

import { createClient } from '@/lib/supabase/client'

export async function handleVote(
  alertId: string,
  voteType: 'upvote' | 'downvote',
  userId: string
) {
  const supabase = createClient()

  try {
    // Get the current alert data
    const { data: alert, error: fetchError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (fetchError || !alert) {
      throw new Error('Alert not found')
    }

    // Check if user already voted
    if (alert.voted_by && alert.voted_by.includes(userId)) {
      throw new Error('You have already voted on this alert')
    }

    // Calculate new vote counts
    const newUpvotes = voteType === 'upvote' ? alert.upvotes + 1 : alert.upvotes
    const newDownvotes = voteType === 'downvote' ? alert.downvotes + 1 : alert.downvotes
    const newVotedBy = [...(alert.voted_by || []), userId]

    // Update the alert with new vote counts
    const { error: updateError } = await (supabase as any)
      .from('alerts')
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        voted_by: newVotedBy,
      })
      .eq('id', alertId)

    if (updateError) throw updateError

    // The database trigger will auto-delete if downvotes - upvotes >= 5
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to vote'
    }
  }
}

// Calculate distance between two coordinates in kilometers
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

// Format distance for display
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`
  }
  return `${distanceInKm.toFixed(1)}km`
}

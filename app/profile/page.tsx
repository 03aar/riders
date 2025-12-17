'use client'

// User profile page
// Shows user info, their alerts and spots, and logout option

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Alert, Spot } from '@/types/database.types'
import { logout } from '@/app/auth/actions'
import BottomNav from '@/components/BottomNav'
import { formatDistanceToNow } from 'date-fns'
import { calculateDistance, formatDistance } from '@/lib/voting'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userAlerts, setUserAlerts] = useState<Alert[]>([])
  const [userSpots, setUserSpots] = useState<Spot[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})

  const supabase = createClient()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        { enableHighAccuracy: true }
      )
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // If profile doesn't exist, create it
        if (!profileData && profileError) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'rider'
          const newProfile = {
            id: user.id,
            email: user.email!,
            username: username,
            bike_type: user.user_metadata?.bike_type || null,
            city: user.user_metadata?.city || null,
          }

          const { data: createdProfile } = await (supabase as any)
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()

          setProfile(createdProfile || newProfile)
          setEditedProfile(createdProfile || newProfile)
        } else {
          setProfile(profileData)
          setEditedProfile(profileData || {})
        }

        // Fetch user's alerts
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setUserAlerts(alertsData || [])

        // Fetch user's spots
        const { data: spotsData } = await supabase
          .from('spots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setUserSpots(spotsData || [])
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  async function handleUpdateProfile() {
    if (!profile || !editedProfile.username) return

    try {
      // Using any to bypass Supabase type inference issue
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          username: editedProfile.username,
          bike_type: editedProfile.bike_type || null,
          city: editedProfile.city || null,
        })
        .eq('id', profile.id)

      if (!error) {
        setProfile({ ...profile, ...editedProfile } as Profile)
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  async function handleDeleteAlert(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId)

    if (!error) {
      setUserAlerts(userAlerts.filter(alert => alert.id !== alertId))
    }
  }

  async function handleDeleteSpot(spotId: string) {
    const { error } = await supabase
      .from('spots')
      .delete()
      .eq('id', spotId)

    if (!error) {
      setUserSpots(userSpots.filter(spot => spot.id !== spotId))
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-blue-100">{profile.email}</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Profile Info</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.username || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bike Type</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.bike_type || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bike_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.bike_type || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.city || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.city || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-3xl font-bold text-red-500">{userAlerts.length}</div>
              <div className="text-sm text-gray-600">Alerts Posted</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-3xl font-bold text-blue-500">{userSpots.length}</div>
              <div className="text-sm text-gray-600">Spots Added</div>
            </div>
          </div>

          {/* User Alerts */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Alerts</h2>
            {userAlerts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No alerts posted yet
              </div>
            ) : (
              <div className="space-y-3">
                {userAlerts.map((alert) => {
                  const alertTypeConfig = {
                    cop: { label: 'Police', icon: '🚓', bgColor: 'bg-red-100', textColor: 'text-red-700' },
                    accident: { label: 'Accident', icon: '⚠️', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
                    roadblock: { label: 'Roadblock', icon: '🚧', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
                    pothole: { label: 'Pothole', icon: '🕳️', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
                    traffic: { label: 'Traffic', icon: '🚦', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
                    speedtrap: { label: 'Speed Trap', icon: '📷', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
                    flooding: { label: 'Flooding', icon: '💧', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
                  }
                  const config = alertTypeConfig[alert.type]
                  const distance = userLocation
                    ? calculateDistance(userLocation.lat, userLocation.lng, alert.latitude, alert.longitude)
                    : null
                  const netScore = alert.upvotes - alert.downvotes

                  return (
                    <div key={alert.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <span className={`px-3 py-1 ${config.bgColor} ${config.textColor} rounded-full text-xs font-medium`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {alert.description && (
                        <p className="text-gray-700 text-sm mb-3">{alert.description}</p>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                          </span>
                          {distance !== null && (
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{formatDistance(distance)}</span>
                            </span>
                          )}
                        </div>

                        {/* Voting stats */}
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4l-8 8h5v8h6v-8h5z" />
                            </svg>
                            <span className="font-medium">{alert.upvotes}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-red-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 20l8-8h-5V4H9v8H4z" />
                            </svg>
                            <span className="font-medium">{alert.downvotes}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            netScore > 0
                              ? 'bg-green-100 text-green-700'
                              : netScore < 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {netScore > 0 ? '+' : ''}{netScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* User Spots */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Spots</h2>
            {userSpots.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                No spots added yet
              </div>
            ) : (
              <div className="space-y-3">
                {userSpots.map((spot) => (
                  <div key={spot.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-800">{spot.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                            {spot.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="text-gray-700">
                            {spot.average_rating.toFixed(1)} ({spot.total_reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSpot(spot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <BottomNav currentPage="profile" />
    </div>
  )
}

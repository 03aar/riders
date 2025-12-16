'use client'

// Main map page - home screen of the app
// Shows all alerts and spots with real-time updates

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Alert, Spot, Profile } from '@/types/database.types'
import AddAlertModal from '@/components/AddAlertModal'
import AddSpotModal from '@/components/AddSpotModal'
import BottomNav from '@/components/BottomNav'

// Dynamically import Map component (client-side only)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
})

export default function MapPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Real-time location tracking with improved accuracy handling
  useEffect(() => {
    let watchId: number | null = null

    if (navigator.geolocation) {
      // First, get a quick position (even if not super accurate)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting initial location:', error)
        },
        {
          enableHighAccuracy: false, // Quick, approximate position
          timeout: 10000,
          maximumAge: 300000, // Accept cached position up to 5 minutes old
        }
      )

      // Then start continuous tracking with high accuracy
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Update location as GPS gets more accurate
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error watching location:', error)
          // Only set default if we haven't gotten any position yet
          setUserLocation((current) => current || { lat: 20.5937, lng: 78.9629 })
        },
        {
          enableHighAccuracy: true, // Use GPS for accurate tracking
          timeout: 10000, // Wait up to 10 seconds for position
          maximumAge: 0, // Always get fresh position for updates
        }
      )
    } else {
      // Geolocation not supported, use default
      setUserLocation({ lat: 20.5937, lng: 78.9629 })
    }

    // Cleanup: stop watching location when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  // Fetch alerts and spots
  useEffect(() => {
    async function fetchData() {
      // Fetch active alerts (not expired)
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      // Fetch all spots
      const { data: spotsData } = await supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false })

      setAlerts(alertsData || [])
      setSpots(spotsData || [])
    }

    fetchData()

    // Subscribe to real-time updates for alerts
    const alertsChannel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((current) => [payload.new as Alert, ...current])
          } else if (payload.eventType === 'DELETE') {
            setAlerts((current) => current.filter((alert) => alert.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to real-time updates for spots
    const spotsChannel = supabase
      .channel('spots-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spots' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSpots((current) => [payload.new as Spot, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setSpots((current) =>
              current.map((spot) => (spot.id === payload.new.id ? (payload.new as Spot) : spot))
            )
          } else if (payload.eventType === 'DELETE') {
            setSpots((current) => current.filter((spot) => spot.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(alertsChannel)
      supabase.removeChannel(spotsChannel)
    }
  }, [])

  const handleAddAlert = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setShowAddAlert(true)
  }

  const handleAddSpot = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setShowAddSpot(true)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Map container */}
      <div className="flex-1 relative">
        <Map
          alerts={alerts}
          spots={spots}
          userLocation={userLocation}
        />

        {/* Floating action button to add alert */}
        <button
          onClick={() => {
            if (userLocation) {
              handleAddAlert(userLocation.lat, userLocation.lng)
            }
          }}
          className="absolute bottom-24 right-4 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
          title="Add Alert"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>

        {/* Floating action button to add spot */}
        <button
          onClick={() => {
            if (userLocation) {
              handleAddSpot(userLocation.lat, userLocation.lng)
            }
          }}
          className="absolute bottom-24 right-20 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-10"
          title="Add Spot"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{alerts.length}</div>
              <div className="text-xs text-gray-600">Active Alerts</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{spots.length}</div>
              <div className="text-xs text-gray-600">Spots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddAlert && selectedLocation && (
        <AddAlertModal
          location={selectedLocation}
          onClose={() => setShowAddAlert(false)}
        />
      )}

      {showAddSpot && selectedLocation && (
        <AddSpotModal
          location={selectedLocation}
          onClose={() => setShowAddSpot(false)}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav currentPage="map" />
    </div>
  )
}

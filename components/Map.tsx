'use client'

// Interactive map component using Leaflet.js
// Displays alerts, spots, and allows users to add new markers

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, Spot, AlertType, SpotType } from '@/types/database.types'
import { formatDistanceToNow } from 'date-fns'
import AlertPopup from './AlertPopup'

// Fix Leaflet default marker icons in Next.js
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Custom icons for different marker types
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
          color: white;
        ">${symbol}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

const alertIcons = {
  cop: createCustomIcon('#ef4444', '🚓'),
  accident: createCustomIcon('#f97316', '⚠️'),
  roadblock: createCustomIcon('#8b5cf6', '🚧'),
  pothole: createCustomIcon('#ca8a04', '🕳️'),
  traffic: createCustomIcon('#ec4899', '🚦'),
  speedtrap: createCustomIcon('#6366f1', '📷'),
  flooding: createCustomIcon('#06b6d4', '💧'),
}

const spotIcons = {
  water: createCustomIcon('#3b82f6', '💧'),
  rest: createCustomIcon('#10b981', '☕'),
  repair: createCustomIcon('#f59e0b', '🔧'),
}

interface MapProps {
  alerts: Alert[]
  spots: Spot[]
  onAddAlert?: (lat: number, lng: number) => void
  onAddSpot?: (lat: number, lng: number) => void
  userLocation?: { lat: number; lng: number } | null
  addingMarkerType?: 'alert' | 'spot' | null
  userId?: string | null
  onAlertVoted?: () => void
}

// Component to handle map clicks for adding markers
function MapClickHandler({
  onAddAlert,
  onAddSpot,
  addingMarkerType
}: {
  onAddAlert?: (lat: number, lng: number) => void
  onAddSpot?: (lat: number, lng: number) => void
  addingMarkerType?: 'alert' | 'spot' | null
}) {
  useMapEvents({
    click(e) {
      if (addingMarkerType === 'alert' && onAddAlert) {
        onAddAlert(e.latlng.lat, e.latlng.lng)
      } else if (addingMarkerType === 'spot' && onAddSpot) {
        onAddSpot(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Component to show user's real-time location
function LocationMarker({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Only center map on first position, not on every update
    if (position && !hasInitialized) {
      map.flyTo([position.lat, position.lng], 15)
      setHasInitialized(true)
    }
  }, [position, map, hasInitialized])

  if (!position) return null

  // Pulsing marker with animation to show real-time tracking
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        .pulse-dot {
          animation: pulse 2s infinite;
        }
      </style>
      <div class="pulse-dot" style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <div className="font-bold">You are here</div>
          <div className="text-xs text-gray-600 mt-1">Live tracking enabled</div>
        </div>
      </Popup>
    </Marker>
  )
}

export default function Map({
  alerts,
  spots,
  onAddAlert,
  onAddSpot,
  userLocation,
  addingMarkerType,
  userId,
  onAlertVoted,
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  // Only render map on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [20.5937, 78.9629] // Center of India as default

  return (
    <>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker */}
      <LocationMarker position={userLocation || null} />

      {/* Click handler for adding markers */}
      <MapClickHandler
        onAddAlert={onAddAlert}
        onAddSpot={onAddSpot}
        addingMarkerType={addingMarkerType}
      />

      {/* Alert markers */}
      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={alertIcons[alert.type]}
          eventHandlers={{
            click: () => {
              setSelectedAlert(alert)
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg capitalize">{alert.type}</h3>
              <p className="text-gray-700 mt-1">{alert.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Click for details and voting
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Spot markers */}
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.latitude, spot.longitude]}
          icon={spotIcons[spot.type]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{spot.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{spot.type}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm">
                  {spot.average_rating.toFixed(1)} ({spot.total_reviews} reviews)
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>

      {/* Alert popup modal */}
      {selectedAlert && (
        <AlertPopup
          alert={selectedAlert}
          userId={userId || null}
          userLocation={userLocation || null}
          onClose={() => setSelectedAlert(null)}
          onVoteSuccess={() => {
            setSelectedAlert(null)
            if (onAlertVoted) {
              onAlertVoted()
            }
          }}
        />
      )}
    </>
  )
}

'use client'

// Settings Page
// User preferences and app configuration

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Settings state
  const [settings, setSettings] = useState({
    nearbyRadius: 5, // km
    autoRefresh: true,
    soundAlerts: false,
    showExpiredAlerts: false,
    defaultAlertType: 'cop' as 'cop' | 'accident' | 'roadblock' | 'pothole' | 'traffic' | 'speedtrap' | 'flooding',
    theme: 'light' as 'light' | 'dark',
    language: 'en' as const,
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Load settings from localStorage
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      setIsLoading(false)
    }

    loadSettings()
  }, [])

  function handleSaveSettings() {
    setIsSaving(true)

    // Save to localStorage
    localStorage.setItem('app-settings', JSON.stringify(settings))

    // Show success feedback
    setTimeout(() => {
      setIsSaving(false)

      const event = new CustomEvent('show-toast', {
        detail: { message: 'Settings saved successfully!', type: 'success' }
      })
      window.dispatchEvent(event)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-blue-100 mt-2">Customize your experience</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Map Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Map Settings</h2>

          <div className="space-y-4">
            {/* Nearby Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearby Radius
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.nearbyRadius}
                  onChange={(e) => setSettings({ ...settings, nearbyRadius: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                  {settings.nearbyRadius} km
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alerts within this distance are considered "nearby"
              </p>
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Auto Refresh</p>
                <p className="text-xs text-gray-500">Automatically update alerts in real-time</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoRefresh: !settings.autoRefresh })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Show Expired Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Show Expired Alerts</p>
                <p className="text-xs text-gray-500">Display alerts that have expired (older than 2 hours)</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showExpiredAlerts: !settings.showExpiredAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showExpiredAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showExpiredAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Alert Settings</h2>

          <div className="space-y-4">
            {/* Default Alert Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Alert Type
              </label>
              <select
                value={settings.defaultAlertType}
                onChange={(e) => setSettings({ ...settings, defaultAlertType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cop">🚓 Police</option>
                <option value="accident">⚠️ Accident</option>
                <option value="roadblock">🚧 Roadblock</option>
                <option value="pothole">🕳️ Pothole</option>
                <option value="traffic">🚦 Traffic</option>
                <option value="speedtrap">📷 Speed Trap</option>
                <option value="flooding">💧 Flooding</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This type will be pre-selected when creating new alerts
              </p>
            </div>

            {/* Sound Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Sound Alerts</p>
                <p className="text-xs text-gray-500">Play sound when new alerts appear nearby</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, soundAlerts: !settings.soundAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Appearance</h2>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    settings.theme === 'light'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Light</span>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    settings.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark</span>
                  </div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Dark mode coming soon!
              </p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Account</h2>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/profile')}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-left"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                // Show keyboard shortcuts
                const event = new CustomEvent('show-shortcuts')
                window.dispatchEvent(event)
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-left"
            >
              Keyboard Shortcuts
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-20 bg-white rounded-xl shadow-lg p-4">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPage="settings" />
    </div>
  )
}

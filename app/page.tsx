// Landing page - redirects to map if logged in, otherwise shows welcome screen

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to map if already logged in
  if (user) {
    redirect('/map')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        {/* Logo */}
        <div className="w-32 h-32 bg-white rounded-full mx-auto mb-8 flex items-center justify-center">
          <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-4">Rider Community</h1>
        <p className="text-xl text-blue-100 mb-8">
          Real-time alerts, rider spots, and community safety
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-3">🚓</div>
            <h3 className="font-bold mb-2">Live Alerts</h3>
            <p className="text-sm text-blue-100">
              Share and see police checkpoints, accidents, and roadblocks
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-3">💧</div>
            <h3 className="font-bold mb-2">Rider Spots</h3>
            <p className="text-sm text-blue-100">
              Find water, rest areas, and repair shops along your route
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Real-time Updates</h3>
            <p className="text-sm text-blue-100">
              Get instant notifications when riders add new alerts
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

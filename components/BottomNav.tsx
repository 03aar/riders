'use client'

// Bottom navigation bar for mobile-first design
// Shows: Map, Alerts, Profile

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  currentPage: 'map' | 'profile'
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Map',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      href: '/map',
      id: 'map',
    },
    {
      name: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/profile',
      id: 'profile',
    },
  ]

  return (
    <nav className="bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full transition-colors
                ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// SEO Metadata Configuration
// Defines metadata for the app

import { Metadata } from 'next'

export const siteMetadata: Metadata = {
  title: {
    default: 'Rider Community - Real-time Road Alerts for Motorcyclists',
    template: '%s | Rider Community'
  },
  description: 'Join thousands of riders sharing real-time road alerts, discovering riding spots, and staying safe on the road. Report police, accidents, potholes, traffic, and more with community voting.',
  keywords: [
    'motorcycle',
    'rider community',
    'road alerts',
    'traffic alerts',
    'police alerts',
    'accident reports',
    'riding spots',
    'motorcycle community',
    'road safety',
    'biker app',
    'motorcycle GPS',
    'rider alerts'
  ],
  authors: [{ name: 'Rider Community' }],
  creator: 'Rider Community',
  publisher: 'Rider Community',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://riders.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Rider Community',
    title: 'Rider Community - Real-time Road Alerts for Motorcyclists',
    description: 'Join thousands of riders sharing real-time road alerts and discovering riding spots.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rider Community App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rider Community - Real-time Road Alerts',
    description: 'Join thousands of riders sharing real-time road alerts and discovering riding spots.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

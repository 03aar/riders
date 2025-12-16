# 🏍️ Rider Community App

A real-time community app for riders to share alerts, find spots, and stay safe on the road.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-✓-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

### 🚨 Real-time Alert System
- Drop pins for police checkpoints, accidents, and roadblocks
- Alerts automatically expire after 2 hours
- Real-time updates for all users
- Color-coded markers (red, orange, purple)

### 📍 Permanent Spots
- Mark water spots, rest areas, and repair shops
- Rate spots with 1-5 stars
- Read and write reviews
- Spots stay on the map permanently

### 👤 User System
- Email/password authentication
- User profiles with bike type and city
- View your submitted alerts and spots
- Edit profile information

### 📱 Mobile-First Design
- Responsive layout that works on all devices
- Bottom navigation bar
- Touch-friendly map controls
- Clean, modern UI with Tailwind CSS

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd riders
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-schema.sql` in your SQL Editor
3. Enable Realtime for `alerts`, `spots`, and `reviews` tables
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Complete setup instructions
- Supabase configuration guide
- Deployment instructions
- Troubleshooting tips

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js & React-Leaflet
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
riders/
├── app/
│   ├── auth/           # Authentication pages (login/signup)
│   ├── map/            # Main map page with alerts & spots
│   ├── profile/        # User profile management
│   └── layout.tsx      # Root layout with Leaflet CSS
├── components/
│   ├── Map.tsx         # Interactive Leaflet map
│   ├── AddAlertModal.tsx
│   ├── AddSpotModal.tsx
│   └── BottomNav.tsx
├── lib/
│   └── supabase/       # Supabase client configurations
├── types/
│   └── database.types.ts  # TypeScript types
└── supabase-schema.sql    # Database schema & RLS policies
```

## 🎨 Features Breakdown

### Map Component
- Interactive Leaflet map with OpenStreetMap tiles
- Custom markers for alerts and spots
- User location tracking
- Click to add new markers
- Real-time marker updates

### Alert System
- Three types: Police, Accident, Roadblock
- Quick-add with minimal form
- Automatic expiration (2 hours)
- Real-time sync across all users

### Spot System
- Three types: Water, Rest, Repair
- Name and location
- Rating and review system
- Permanent markers

### Authentication
- Email/password signup
- Profile creation with username, bike, city
- Protected routes with middleware
- Secure session management

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

### Netlify

```bash
npm run build
netlify deploy --prod
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase
- Environment variables for sensitive data
- No API keys exposed to client

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

Built with ❤️ for the riding community

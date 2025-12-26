# Rider Community App 🏍️

A real-time community platform for motorcyclists to share road alerts, discover riding spots, and connect with fellow riders.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

### Core Functionality

- **Real-time Road Alerts** - Report and view live road conditions
- **7 Alert Types** - Police, Accidents, Roadblocks, Potholes, Traffic, Speed Traps, Flooding
- **Community Voting** - Upvote/downvote alerts to verify accuracy
- **Smart Filtering** - Toggle alert types on/off to see what matters to you
- **Distance Tracking** - See how far away each alert is from your location
- **Auto-Deletion** - Alerts with -5 net votes are automatically removed
- **GPS Tracking** - Real-time location updates with high accuracy
- **Riding Spots** - Discover and share great riding locations
- **User Profiles** - Track your contributions and statistics
- **Spot Reviews** - Rate and review riding spots

### Technical Features

- **Real-time Updates** - Powered by Supabase Realtime
- **Offline Support** - GPS works without internet
- **Mobile-First** - Optimized for smartphones
- **Secure Authentication** - Email/password with JWT tokens
- **Row Level Security** - Database-level access control
- **Type-Safe** - Full TypeScript coverage
- **Responsive Design** - Works on all screen sizes

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier works)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd riders
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Follow the detailed guide in [DEPLOYMENT.md](./DEPLOYMENT.md) to:
- Create a Supabase project
- Run the database schema
- Run the voting migration
- Get your API credentials

4. **Configure environment variables**

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication Flow
- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Error handling for invalid credentials
- [ ] Error handling for duplicate email
- [ ] Logout functionality

#### Alert Management
- [ ] Create alert with all 7 types
- [ ] View alert details on map
- [ ] Upvote an alert
- [ ] Downvote an alert
- [ ] Verify alert auto-deletes at -5 net votes
- [ ] Check 50-character description limit
- [ ] Verify alert expires after 2 hours

#### Filtering System
- [ ] Open/close filter panel
- [ ] Enable/disable individual alert types
- [ ] Enable/disable all alerts at once
- [ ] Verify filtered alerts update on map
- [ ] Check alert count updates correctly

#### Map Features
- [ ] GPS location permission prompt
- [ ] Map centers on user location
- [ ] Click marker to open details
- [ ] Add alert at current location
- [ ] Add spot at current location
- [ ] Zoom in/out functionality
- [ ] Pan around map

#### Profile Page
- [ ] View user profile
- [ ] See all posted alerts
- [ ] View voting statistics
- [ ] Check distance calculations
- [ ] Edit profile information
- [ ] Delete own alerts

#### Real-time Features
- [ ] Open app in two browser tabs
- [ ] Add alert in tab 1, see it in tab 2
- [ ] Vote on alert in tab 1, see update in tab 2
- [ ] Delete alert in tab 1, see removal in tab 2

#### Responsive Design
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px width)
- [ ] Test in portrait mode
- [ ] Test in landscape mode

#### Error Handling
- [ ] No internet connection
- [ ] GPS permission denied
- [ ] Failed API request
- [ ] Invalid form submission
- [ ] Database errors

## 📁 Project Structure

```
riders/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   └── actions.ts     # Auth server actions
│   ├── map/               # Main map page
│   ├── profile/           # User profile page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── AddAlertModal.tsx  # Alert creation modal
│   ├── AlertFilter.tsx    # Filter panel
│   ├── AlertPopup.tsx     # Alert details popup
│   ├── BottomNav.tsx      # Navigation bar
│   ├── Map.tsx            # Leaflet map
│   └── Toast.tsx          # Toast notifications
├── lib/                   # Utilities and helpers
│   ├── supabase/          # Supabase clients
│   └── voting.ts          # Voting logic
├── types/                 # TypeScript types
│   └── database.types.ts  # Database schema types
├── public/                # Static assets
├── supabase-schema.sql    # Database schema
├── supabase-migration-voting.sql  # Voting migration
├── DEPLOYMENT.md          # Deployment guide
├── README.md              # This file
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.ts         # Next.js config
├── tailwind.config.ts     # Tailwind config
└── vercel.json            # Vercel deployment config
```

## 🗄️ Database Schema

### Tables

- **profiles** - User profile information
- **alerts** - Road alerts with voting
- **spots** - Riding spots
- **reviews** - Spot reviews

### Key Features

- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions for live updates
- Automatic alert expiration (2 hours)
- Auto-delete trigger for negative alerts (-5 votes)
- GIN index on voted_by array for fast lookups

## 🔐 Security

### Authentication
- Email/password authentication via Supabase Auth
- JWT tokens with automatic refresh
- Secure password hashing (bcrypt)

### Authorization
- Row Level Security policies on all tables
- Users can only edit their own content
- Vote validation to prevent duplicate voting

### Data Protection
- Environment variables for sensitive data
- HTTPS enforced in production
- SQL injection prevention via parameterized queries
- XSS protection via React escaping

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Map**: Leaflet.js with OpenStreetMap tiles
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **State Management**: React Hooks
- **Date Formatting**: date-fns

## 📊 Performance

- **Build**: Production build completes successfully
- **TypeScript**: Zero type errors
- **Bundle Size**: Optimized with code splitting
- **Real-time**: Sub-second update latency

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

None at this time. Report issues on GitHub.

## 🔮 Future Enhancements

- [ ] Push notifications for nearby alerts
- [ ] Route planning with alert avoidance
- [ ] Group rides and events
- [ ] Private messaging between riders
- [ ] Gamification (badges, leaderboards)
- [ ] Weather integration
- [ ] Fuel price tracker
- [ ] Offline map caching
- [ ] Photo uploads for alerts and spots
- [ ] Social media sharing

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**Built with ❤️ for the riding community**

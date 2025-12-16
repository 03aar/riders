# Rider Community App - Setup Guide

This is a complete guide to set up and deploy your Rider Community App MVP.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development](#local-development)
4. [Environment Variables](#environment-variables)
5. [Running the App](#running-the-app)
6. [Deployment](#deployment)
7. [Features Overview](#features-overview)

---

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Git installed

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: rider-community (or any name)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
6. Click "Create new project" (this takes ~2 minutes)

### 2. Run Database Schema

1. Once your project is ready, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the `supabase-schema.sql` file in this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned"

This creates:
- ✅ `profiles` table (user profiles)
- ✅ `alerts` table (temporary alerts)
- ✅ `spots` table (permanent spots)
- ✅ `reviews` table (spot reviews)
- ✅ Row Level Security policies
- ✅ Real-time subscriptions
- ✅ Automatic triggers

### 3. Enable Realtime

1. Click "Database" in the left sidebar
2. Click "Replication" tab
3. Find these tables and enable realtime for each:
   - `alerts`
   - `spots`
   - `reviews`

### 4. Get Your API Keys

1. Click "Project Settings" (gear icon at bottom left)
2. Click "API" in the sidebar
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
4. Keep this tab open - you'll need these values

---

## Local Development

### 1. Clone and Install

```bash
# You're already in the project directory
# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Running the App

### Development Mode

```bash
npm run dev
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps.

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub**:
   - Push your code to GitHub
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables in Vercel**:
   - In your Vercel project dashboard
   - Go to "Settings" → "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Save"

4. **Redeploy**:
   - Vercel will automatically redeploy
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables**:
   - Go to Netlify dashboard
   - Site Settings → Environment Variables
   - Add your Supabase credentials

---

## Features Overview

### ✅ Authentication
- Email/password signup and login
- User profiles with bike type and city
- Secure session management

### ✅ Real-time Alerts
- Drop pins for police checkpoints, accidents, roadblocks
- Alerts auto-delete after 2 hours
- Real-time updates for all users
- Color-coded markers:
  - 🚓 Red = Police checkpoint
  - ⚠️ Orange = Accident
  - 🚧 Purple = Roadblock

### ✅ Permanent Spots
- Mark water spots, rest areas, repair shops
- Rating system (1-5 stars)
- User reviews
- Color-coded markers:
  - 💧 Blue = Water
  - ☕ Green = Rest area
  - 🔧 Orange = Repair shop

### ✅ User Profile
- View and edit profile information
- See your submitted alerts and spots
- Delete your submissions
- View statistics

### ✅ Mobile-First Design
- Responsive layout
- Bottom navigation bar
- Touch-friendly controls
- Works on all devices

---

## Troubleshooting

### Build Errors

**Error: Missing environment variables**
- Make sure `.env.local` exists
- Check that all variables are set correctly
- Restart the dev server: `npm run dev`

**Error: Supabase connection failed**
- Verify your Supabase URL and API key
- Check that your Supabase project is running
- Make sure you ran the schema SQL

### Runtime Errors

**"You must be logged in" errors**
- Clear your browser cookies
- Try logging out and back in
- Check Supabase authentication settings

**Map not loading**
- Check browser console for errors
- Ensure Leaflet CSS is imported
- Try a different browser

**Real-time updates not working**
- Verify realtime is enabled in Supabase
- Check the replication settings
- Look for WebSocket errors in console

---

## Next Steps

### Optional Enhancements

1. **Email Verification**
   - Enable in Supabase → Authentication → Email Auth

2. **Automatic Alert Cleanup**
   - Set up a Supabase Edge Function to run `delete_expired_alerts()`
   - Or use Supabase cron jobs

3. **Push Notifications**
   - Integrate with Firebase Cloud Messaging
   - Send alerts when users are near a checkpoint

4. **Advanced Features**
   - Filter alerts by type
   - Search for spots
   - Share spots via link
   - Export trip routes

---

## Support

If you encounter issues:
1. Check the console for errors
2. Verify your Supabase setup
3. Review the troubleshooting section
4. Check that all dependencies are installed

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel/Netlify

---

## Project Structure

```
riders/
├── app/
│   ├── auth/          # Authentication pages
│   ├── map/           # Main map page
│   ├── profile/       # User profile page
│   └── layout.tsx     # Root layout
├── components/        # React components
├── lib/
│   └── supabase/      # Supabase clients
├── types/             # TypeScript types
├── supabase-schema.sql # Database schema
└── .env.local.example  # Environment template
```

---

Happy riding! 🏍️⚡

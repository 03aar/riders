# Deployment Guide - Rider Community App

This guide covers the complete deployment process for the Rider Community App on Vercel with Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (free tier works)
- Git repository

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Choose a project name, database password, and region
4. Wait for the project to be provisioned (~2 minutes)

### 1.2 Run Database Schema

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute
5. Verify tables are created in **Table Editor**

### 1.3 Run Voting Migration

1. In **SQL Editor**, create another new query
2. Copy and paste the contents of `supabase-migration-voting.sql`
3. Click **Run** to execute
4. This adds voting features and new alert types

### 1.4 Enable Realtime

1. Go to **Database → Replication** in Supabase dashboard
2. Enable replication for these tables:
   - `alerts`
   - `spots`
   - `reviews`
   - `profiles`

### 1.5 Configure Authentication

1. Go to **Authentication → Providers** in Supabase dashboard
2. Click on **Email** provider
3. **Turn OFF** "Confirm email" (for easier testing)
4. Save changes

### 1.6 Get API Credentials

1. Go to **Settings → API** in Supabase dashboard
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long JWT token under "Project API keys")

## Part 2: Vercel Deployment

### 2.1 Prepare Repository

Ensure your repository has these files:
- ✅ `vercel.json` (already created)
- ✅ `package.json` with proper scripts
- ✅ `.gitignore` excludes `.env.local` and `node_modules`

### 2.2 Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click **Add New → Project**
4. Import your Git repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave default (.next)
   - **Install Command**: `npm install`

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### 2.3 Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | All (Production, Preview, Development) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key | All (Production, Preview, Development) |

**Important**: Add these to ALL environments (Production, Preview, Development)

### 2.4 Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋮ → Redeploy** to rebuild with environment variables

## Part 3: Verification

### 3.1 Test Authentication

1. Visit your deployed app URL (e.g., `your-app.vercel.app`)
2. Click **Sign Up**
3. Create an account with email and password
4. Verify you can log in

### 3.2 Test Core Features

- ✅ **GPS Location**: Allow location permission, verify map centers on your location
- ✅ **Add Alert**: Click the red button, select alert type, add description, submit
- ✅ **Vote on Alert**: Click an alert marker, upvote or downvote
- ✅ **Filter Alerts**: Click filter panel, toggle alert types on/off
- ✅ **View Profile**: Navigate to profile, see your alerts with voting stats
- ✅ **Add Spot**: Click blue button, add riding spot details
- ✅ **Realtime Updates**: Open app in two tabs, add alert in one, see it appear in other

### 3.3 Test Auto-Delete

1. Create a test alert
2. Downvote it 5 times (you'll need multiple accounts or ask friends)
3. Verify it automatically disappears when net score reaches -5

## Part 4: Production Configuration

### 4.1 Domain Setup (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (~5 minutes)

### 4.2 Performance Optimization

The app is already optimized with:
- ✅ Server-side rendering (SSR)
- ✅ Dynamic imports for map component
- ✅ Image optimization (if you add images later)
- ✅ Code splitting
- ✅ Gzip compression

### 4.3 Enable Analytics (Optional)

1. In Vercel dashboard, go to **Analytics** tab
2. Enable **Web Analytics** (free on Hobby plan)
3. Monitor page views, performance, and user behavior

### 4.4 Set Up Monitoring

**Vercel Monitoring:**
- Go to **Logs** to view runtime logs
- Go to **Deployments** to see build logs
- Set up **Notifications** for failed deployments

**Supabase Monitoring:**
- Go to **Reports** to view database metrics
- Go to **Logs** to view database queries and errors
- Set up **Database Webhooks** for custom alerts (optional)

## Part 5: Environment Variables Reference

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Local Development

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Part 6: Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
- **Solution**: Ensure you have the latest code from the repository
- Run `npm run build` locally to catch errors before deployment

**Issue**: Build fails with "Missing environment variables"
- **Solution**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel settings

### Runtime Errors

**Issue**: "Invalid credentials or email not confirmed"
- **Solution**: Disable email confirmation in Supabase: Authentication → Providers → Email → Turn OFF "Confirm email"

**Issue**: Map not loading
- **Solution**: Check browser console for errors. Ensure location permission is granted.

**Issue**: Alerts not appearing
- **Solution**:
  1. Check Supabase RLS policies are correctly set
  2. Verify Realtime is enabled for `alerts` table
  3. Check browser console for WebSocket errors

**Issue**: Voting not working
- **Solution**:
  1. Verify the voting migration SQL was run
  2. Check Supabase logs for errors
  3. Ensure user is logged in

### Database Issues

**Issue**: "Profile not found" error
- **Solution**: The app auto-creates profiles. If it persists, manually insert a profile:
  ```sql
  INSERT INTO public.profiles (id, email, username)
  VALUES ('user-uuid', 'email@example.com', 'username');
  ```

**Issue**: Trigger not auto-deleting alerts
- **Solution**:
  1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_check_alert_votes';`
  2. Re-run the trigger creation from `supabase-migration-voting.sql`

## Part 7: Maintenance

### Database Cleanup

Alerts auto-expire after 2 hours. To manually clean up:

```sql
-- Delete expired alerts
DELETE FROM public.alerts
WHERE expires_at < NOW();

-- Delete old reviews (optional, older than 1 year)
DELETE FROM public.reviews
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Monitoring Quotas

**Supabase Free Tier Limits:**
- 500MB database size
- 2GB file storage
- 50GB bandwidth per month
- Paused after 1 week inactivity

**Vercel Free Tier Limits:**
- 100GB bandwidth per month
- 100 deployments per day
- 6,000 build minutes per month

### Updating the App

```bash
# Pull latest changes
git pull origin main

# Deploy to Vercel (auto-deploys if connected to Git)
# Or manually:
vercel --prod
```

## Part 8: Security Best Practices

### Row Level Security (RLS)

Supabase RLS is enabled on all tables. Policies:
- ✅ Users can only edit their own profiles
- ✅ Users can read all alerts and spots
- ✅ Users can create alerts/spots only when authenticated
- ✅ Users can vote on any alert when authenticated
- ✅ Users can only delete their own alerts/spots

### API Keys

- **Never** commit `.env.local` to Git
- **Never** share your Supabase `service_role` key (not used in this app)
- The `anon` key is safe to expose in client-side code (it's public)

### Authentication

- Passwords are hashed by Supabase Auth
- JWT tokens expire after 1 hour
- Refresh tokens are handled automatically

## Part 9: Scaling Considerations

### When to Upgrade

Consider upgrading from free tier when:
- Database size exceeds 500MB
- Monthly bandwidth exceeds 100GB
- You have >1,000 active users
- You need guaranteed uptime

### Performance Tips

1. **Enable caching** for static assets
2. **Add database indexes** for frequently queried fields
3. **Optimize images** using Next.js Image component
4. **Use CDN** for map tiles (already configured)
5. **Monitor slow queries** in Supabase

### Database Optimization

```sql
-- Add index on frequently queried fields
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_expires_at ON public.alerts(expires_at);
CREATE INDEX idx_spots_location ON public.spots USING GIST(
  ST_MakePoint(longitude, latitude)
);
```

## Part 10: Feature Flags

To disable features without code changes, use Vercel environment variables:

```env
# Add these in Vercel Settings → Environment Variables
NEXT_PUBLIC_ENABLE_VOTING=true
NEXT_PUBLIC_ENABLE_SPOTS=true
NEXT_PUBLIC_ENABLE_FILTERS=true
```

Then update your code to check these flags.

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Check browser console for client errors
4. Review this guide's troubleshooting section

---

**Deployment Checklist:**

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Voting migration executed
- [ ] Realtime enabled for all tables
- [ ] Email confirmation disabled
- [ ] API credentials copied
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] App deployed successfully
- [ ] Authentication tested
- [ ] Alert creation tested
- [ ] Voting tested
- [ ] Filters tested
- [ ] Profile page tested
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

**You're all set! 🚀**

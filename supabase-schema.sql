-- Rider Community App - Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries (optional but useful for location-based features)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    bike_type TEXT,
    city TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table (temporary alerts that auto-delete after 2 hours)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cop', 'accident', 'roadblock')),
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

-- Spots table (permanent locations like water, rest, repair)
CREATE TABLE IF NOT EXISTS public.spots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('water', 'rest', 'repair')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    average_rating NUMERIC(2,1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table (user reviews for spots)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(spot_id, user_id) -- One review per user per spot
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_alerts_expires_at ON public.alerts(expires_at);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON public.alerts(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_spots_type ON public.spots(type);
CREATE INDEX IF NOT EXISTS idx_spots_user_id ON public.spots(user_id);
CREATE INDEX IF NOT EXISTS idx_spots_location ON public.spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON public.reviews(spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Alerts
CREATE POLICY "Alerts are viewable by everyone" ON public.alerts
    FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Authenticated users can insert alerts" ON public.alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON public.alerts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Spots
CREATE POLICY "Spots are viewable by everyone" ON public.spots
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert spots" ON public.spots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spots" ON public.spots
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spots" ON public.spots
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update spot ratings when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.spots
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update spot ratings
CREATE TRIGGER trigger_update_spot_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_spot_rating();

-- Function to automatically delete expired alerts (run via cron or scheduled function)
CREATE OR REPLACE FUNCTION delete_expired_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.alerts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for alerts and spots (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- Migration: Add voting system and new alert types
-- Run this in your Supabase SQL Editor after the initial schema

-- 1. Drop the existing CHECK constraint on alert types
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_type_check;

-- 2. Add new CHECK constraint with all 7 alert types
ALTER TABLE public.alerts ADD CONSTRAINT alerts_type_check
CHECK (type IN ('cop', 'accident', 'roadblock', 'pothole', 'traffic', 'speedtrap', 'flooding'));

-- 3. Add voting columns to alerts table
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS voted_by UUID[] DEFAULT '{}';
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS posted_by_username TEXT;

-- 4. Update existing alerts to have the new fields
UPDATE public.alerts SET upvotes = 0 WHERE upvotes IS NULL;
UPDATE public.alerts SET downvotes = 0 WHERE downvotes IS NULL;
UPDATE public.alerts SET voted_by = '{}' WHERE voted_by IS NULL;

-- 5. Create index on voted_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_alerts_voted_by ON public.alerts USING GIN(voted_by);

-- 6. Function to auto-delete alerts with too many downvotes
CREATE OR REPLACE FUNCTION check_alert_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- If downvotes - upvotes >= 5, delete the alert
    IF (NEW.downvotes - NEW.upvotes) >= 5 THEN
        DELETE FROM public.alerts WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to run the function on every vote update
DROP TRIGGER IF EXISTS trigger_check_alert_votes ON public.alerts;
CREATE TRIGGER trigger_check_alert_votes
AFTER UPDATE OF upvotes, downvotes ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION check_alert_votes();

-- 8. Update the realtime publication to include new columns
-- (Realtime should already be enabled from previous setup)

-- 9. Add RLS policy for voting (users can update votes on any alert)
DROP POLICY IF EXISTS "Users can vote on alerts" ON public.alerts;
CREATE POLICY "Users can vote on alerts" ON public.alerts
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

COMMENT ON COLUMN public.alerts.upvotes IS 'Number of upvotes for this alert';
COMMENT ON COLUMN public.alerts.downvotes IS 'Number of downvotes for this alert';
COMMENT ON COLUMN public.alerts.voted_by IS 'Array of user IDs who have voted on this alert';
COMMENT ON COLUMN public.alerts.posted_by_username IS 'Username of the person who posted this alert';

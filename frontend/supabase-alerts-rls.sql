-- Run this in Supabase SQL Editor to fix RLS for the alerts table
-- Assumes alerts table has: user_id, title, message, category, latitude, longitude, expires_at, photo_url, is_future_event

-- If your alerts table has user_id column, use this INSERT policy:
CREATE POLICY "Users can insert own alerts"
ON public.alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read all alerts (for map/feed)
CREATE POLICY "Users can read alerts"
ON public.alerts
FOR SELECT
TO authenticated
USING (true);

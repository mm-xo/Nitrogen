-- Optional: Run this in Supabase SQL Editor ONLY if you're on campus but still get "Outside campus bounds"
-- This expands the Fort Garry campus bounds slightly to account for GPS drift (indoors) and campus edges.
-- Original: lat 49.8-49.85, lng -97.15 to -97.10
-- Expanded: lat 49.79-49.86, lng -97.16 to -97.09 (adds ~1km buffer)
--
-- The app uses a circle check (frontend/src/constants/campus.js). If needed, increase CAMPUS_RADIUS_M.

ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_latitude_check;
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_longitude_check;

ALTER TABLE public.alerts ADD CONSTRAINT alerts_latitude_check
  CHECK (latitude >= 49.79::double precision AND latitude <= 49.86::double precision);

ALTER TABLE public.alerts ADD CONSTRAINT alerts_longitude_check
  CHECK (longitude >= (-97.16)::double precision AND longitude <= (-97.09)::double precision);

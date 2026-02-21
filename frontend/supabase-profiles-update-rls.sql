-- Run this in Supabase SQL Editor to allow profile updates
-- 1. Add optional profile columns if they don't exist
-- 2. Users can update their own profile row

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS program text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year_of_study smallint;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faculty text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

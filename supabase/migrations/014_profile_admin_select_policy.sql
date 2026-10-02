-- Migration: 014_profile_admin_select_policy
-- Description: Grant SELECT access to authenticated users so they can read and subsequently update their profile.

-- 1. Grant SELECT privilege to the authenticated role
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- 2. Drop the policy if it exists to avoid duplicate-policy errors
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- 3. Create the SELECT policy
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

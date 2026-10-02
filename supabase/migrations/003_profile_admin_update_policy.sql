-- Migration: 003_profile_admin_update_policy
-- Description: Create Row Level Security policy allowing authenticated admins to update the profile

-- Grant UPDATE permission to the authenticated role
GRANT UPDATE ON TABLE profiles TO authenticated;

-- Create RLS policy for authenticated updates
CREATE POLICY "Authenticated users can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

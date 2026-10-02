-- Migration: 005_skills_admin_policies
-- Description: Create Row Level Security policies allowing authenticated admins to manage skills

-- Grant privileges to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE skills TO authenticated;

-- Authenticated SELECT
CREATE POLICY "Authenticated users can view skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated INSERT
CREATE POLICY "Authenticated users can insert skills"
  ON skills
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated UPDATE
CREATE POLICY "Authenticated users can update skills"
  ON skills
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated DELETE
CREATE POLICY "Authenticated users can delete skills"
  ON skills
  FOR DELETE
  TO authenticated
  USING (true);

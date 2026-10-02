-- Migration: 004_projects_admin_policies
-- Description: Create Row Level Security policies allowing authenticated admins to manage projects

-- Grant privileges to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE projects TO authenticated;

-- Authenticated SELECT
CREATE POLICY "Authenticated users can view projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated INSERT
CREATE POLICY "Authenticated users can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated UPDATE
CREATE POLICY "Authenticated users can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated DELETE
CREATE POLICY "Authenticated users can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (true);

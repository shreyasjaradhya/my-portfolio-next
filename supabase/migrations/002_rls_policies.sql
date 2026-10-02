-- Migration: 002_rls_policies
-- Description: Create Row Level Security policies for public anonymous access

-- Make sure RLS is enabled on all tables (just in case they were missed)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PUBLIC READ POLICIES (Portfolio Content)
-- ==============================================================================
-- Allow anonymous users to view portfolio content. They cannot insert, update, or delete.

-- PROFILES
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles" 
  ON profiles 
  FOR SELECT 
  TO anon 
  USING (true);

-- PROJECTS
DROP POLICY IF EXISTS "Public can view projects" ON projects;
CREATE POLICY "Public can view projects" 
  ON projects 
  FOR SELECT 
  TO anon 
  USING (true);

-- SKILLS
DROP POLICY IF EXISTS "Public can view skills" ON skills;
CREATE POLICY "Public can view skills" 
  ON skills 
  FOR SELECT 
  TO anon 
  USING (true);

-- EXPERIENCES
DROP POLICY IF EXISTS "Public can view experiences" ON experiences;
CREATE POLICY "Public can view experiences" 
  ON experiences 
  FOR SELECT 
  TO anon 
  USING (true);

-- EDUCATION
DROP POLICY IF EXISTS "Public can view education" ON education;
CREATE POLICY "Public can view education" 
  ON education 
  FOR SELECT 
  TO anon 
  USING (true);

-- CERTIFICATIONS
DROP POLICY IF EXISTS "Public can view certifications" ON certifications;
CREATE POLICY "Public can view certifications" 
  ON certifications 
  FOR SELECT 
  TO anon 
  USING (true);

-- ACHIEVEMENTS
DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
CREATE POLICY "Public can view achievements" 
  ON achievements 
  FOR SELECT 
  TO anon 
  USING (true);

-- ==============================================================================
-- MESSAGES POLICIES (Contact Form)
-- ==============================================================================
-- Allow anonymous users to submit (insert) new contact messages.
-- They CANNOT select (read), update, or delete messages.

DROP POLICY IF EXISTS "Public can insert messages" ON messages;
CREATE POLICY "Public can insert messages" 
  ON messages 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- ==============================================================================
-- NOTE ON ADMIN AUTHORIZATION
-- ==============================================================================
-- Admin policies (for creating, updating, and deleting portfolio content, 
-- and for reading messages) will be implemented in a future migration once
-- the secure authentication and authorization mechanism is established.

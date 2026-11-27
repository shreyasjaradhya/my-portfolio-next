-- Migration: 029_security_hardening.sql
-- Description: Harden Supabase RLS and Storage policies to strictly isolate Admin access from public Google OAuth users.

-- ==============================================================================
-- 1. DEFINE CONSTANT / HELPER FOR ADMIN VERIFICATION
-- ==============================================================================
-- Portfolio owner email: shreyasjaradhya@gmail.com
-- Checks whether caller's JWT email matches the authorized administrator.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (COALESCE(auth.jwt() ->> 'email', '') = 'shreyasjaradhya@gmail.com');
$$;

-- Grant execution to authenticated and anon
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ==============================================================================
-- 2. HARDEN MESSAGES TABLE (RECRUITER INQUIRIES)
-- ==============================================================================
-- Public visitors can submit inquiries; ONLY the verified admin can view/manage them.

DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can view messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can update messages" ON public.messages;
DROP POLICY IF EXISTS "Admin can delete messages" ON public.messages;

CREATE POLICY "Admin can view messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can update messages"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete messages"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 3. HARDEN WEBSITE ANALYTICS TABLE
-- ==============================================================================
-- Anyone can insert visit events (anon or authenticated); ONLY admin can read analytics.

DROP POLICY IF EXISTS "Authenticated can view analytics" ON public.website_analytics;
DROP POLICY IF EXISTS "Admin can view analytics" ON public.website_analytics;

CREATE POLICY "Admin can view analytics"
  ON public.website_analytics
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 4. HARDEN TESTIMONIALS TABLE
-- ==============================================================================
-- 1) Public can only view approved testimonials.
-- 2) Authenticated visitors can submit pending testimonials for themselves.
-- 3) Authenticated visitors can view their own submissions (pending or approved).
-- 4) ONLY admin can insert approved testimonials directly, approve/reject, or delete.

DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert pending testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Visitors can insert pending testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin can delete testimonials" ON public.testimonials;

-- Policy A: Everyone can view approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Policy B: Logged-in visitors can view their own submissions
CREATE POLICY "Users can view own testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Policy C: Public visitors can insert testimonials ONLY as 'pending'
CREATE POLICY "Visitors can insert pending testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    (status = 'pending' AND (user_id IS NULL OR user_id = auth.uid()))
  );

-- Policy D: ONLY admin can update testimonials (approve, reject, edit)
CREATE POLICY "Admin can update testimonials"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy E: ONLY admin can delete testimonials
CREATE POLICY "Admin can delete testimonials"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 5. HARDEN PORTFOLIO CONTENT TABLES (PROJECTS, SKILLS, EXPERIENCES, ETC.)
-- ==============================================================================
-- Public can read; ONLY admin can insert, update, or delete.

-- Projects
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;

CREATE POLICY "Admin can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- Skills
DROP POLICY IF EXISTS "Authenticated users can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can update skills" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can delete skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can update skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can delete skills" ON public.skills;

CREATE POLICY "Admin can insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update skills" ON public.skills FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete skills" ON public.skills FOR DELETE TO authenticated USING (public.is_admin());

-- Experiences
DROP POLICY IF EXISTS "Authenticated users can insert experiences" ON public.experiences;
DROP POLICY IF EXISTS "Authenticated users can update experiences" ON public.experiences;
DROP POLICY IF EXISTS "Authenticated users can delete experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin can insert experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin can update experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin can delete experiences" ON public.experiences;

CREATE POLICY "Admin can insert experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update experiences" ON public.experiences FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete experiences" ON public.experiences FOR DELETE TO authenticated USING (public.is_admin());

-- Education
DROP POLICY IF EXISTS "Authenticated users can insert education" ON public.education;
DROP POLICY IF EXISTS "Authenticated users can update education" ON public.education;
DROP POLICY IF EXISTS "Authenticated users can delete education" ON public.education;
DROP POLICY IF EXISTS "Admin can insert education" ON public.education;
DROP POLICY IF EXISTS "Admin can update education" ON public.education;
DROP POLICY IF EXISTS "Admin can delete education" ON public.education;

CREATE POLICY "Admin can insert education" ON public.education FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update education" ON public.education FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete education" ON public.education FOR DELETE TO authenticated USING (public.is_admin());

-- Certifications
DROP POLICY IF EXISTS "Authenticated users can insert certifications" ON public.certifications;
DROP POLICY IF EXISTS "Authenticated users can update certifications" ON public.certifications;
DROP POLICY IF EXISTS "Authenticated users can delete certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can insert certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can update certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can delete certifications" ON public.certifications;

CREATE POLICY "Admin can insert certifications" ON public.certifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update certifications" ON public.certifications FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete certifications" ON public.certifications FOR DELETE TO authenticated USING (public.is_admin());

-- Achievements
DROP POLICY IF EXISTS "Authenticated users can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Authenticated users can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Authenticated users can delete achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can delete achievements" ON public.achievements;

CREATE POLICY "Admin can insert achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update achievements" ON public.achievements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete achievements" ON public.achievements FOR DELETE TO authenticated USING (public.is_admin());

-- Profiles
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;

CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. HARDEN STORAGE BUCKET POLICIES
-- ==============================================================================
-- Public can view assets; ONLY admin can upload, overwrite, or delete assets.

DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete resumes" ON storage.objects;

CREATE POLICY "Admin can upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin can update resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin()) WITH CHECK (bucket_id = 'resumes' AND public.is_admin());
CREATE POLICY "Admin can delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete project images" ON storage.objects;

CREATE POLICY "Admin can upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin can update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin()) WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "Admin can delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete profile photos" ON storage.objects;

CREATE POLICY "Admin can upload profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND public.is_admin());
CREATE POLICY "Admin can update profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND public.is_admin()) WITH CHECK (bucket_id = 'profile-photos' AND public.is_admin());
CREATE POLICY "Admin can delete profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND public.is_admin());

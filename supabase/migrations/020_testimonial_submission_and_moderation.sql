-- Migration: 020_testimonial_submission_and_moderation
-- Description: Add moderation status, user association, contact links, and RLS policies for public testimonial submissions

-- 1. Add new columns to public.testimonials table
ALTER TABLE public.testimonials 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Backfill: Mark existing testimonials as 'approved' so current testimonials remain visible
UPDATE public.testimonials 
SET status = 'approved' 
WHERE status IS NULL OR status = 'pending';

-- 3. Create indexes for high-performance filtering
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 5. Drop outdated policies if they exist
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert pending testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users can view own testimonials" ON public.testimonials;

-- Policy 1: Visitors (both anon and authenticated) can ONLY view approved testimonials
CREATE POLICY "Public can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Policy 2: Authenticated visitors can submit testimonials strictly with status = 'pending'
CREATE POLICY "Authenticated users can insert pending testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending' AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Policy 3: Authenticated users can view their own submitted testimonials (even while pending)
CREATE POLICY "Users can view own testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 4: Allow authenticated users to perform updates/deletes if they are the admin
CREATE POLICY "Authenticated users can update testimonials"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (true);

-- 6. Grant privileges
GRANT SELECT ON TABLE public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.testimonials TO authenticated;

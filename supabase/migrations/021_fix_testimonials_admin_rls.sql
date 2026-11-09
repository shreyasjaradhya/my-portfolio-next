-- Migration: 021_fix_testimonials_admin_rls.sql
-- Description: Restore full insert/update/delete permissions on testimonials for authenticated admin

-- 1. Drop restricted insert policies from the public submission migration
DROP POLICY IF EXISTS "Authenticated users can insert pending testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;

-- 2. Allow authenticated admin to insert testimonials with any status (approved, pending, etc.)
CREATE POLICY "Authenticated users can insert testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Ensure public can read testimonials (or approved testimonials)
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

CREATE POLICY "Public can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO public
  USING (true);

-- 4. Ensure authenticated admin has full SELECT, UPDATE, and DELETE access
DROP POLICY IF EXISTS "Authenticated users can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;

CREATE POLICY "Authenticated users can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (true);

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

-- 5. Confirm grants
GRANT SELECT ON TABLE public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.testimonials TO authenticated;

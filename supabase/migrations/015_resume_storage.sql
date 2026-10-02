-- Migration: 015_resume_storage
-- Description: Create Supabase Storage bucket and RLS policies for the resume feature

-- 1. Create the bucket (Public, 10MB limit, PDF only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    true,
    10485760, -- 10MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies to allow safe reruns
DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete resumes" ON storage.objects;

-- 3. Public SELECT policy (Anon)
CREATE POLICY "Public can view resumes"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'resumes');

-- 4. Authenticated CRUD policies
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can update resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can delete resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');

-- 5. Authenticated SELECT policy (so admins can read the object too)
DROP POLICY IF EXISTS "Authenticated users can view resumes" ON storage.objects;
CREATE POLICY "Authenticated users can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

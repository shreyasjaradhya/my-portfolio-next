-- Migration: 016_project_images_storage
-- Description: Create Supabase Storage bucket and RLS policies for project images

-- 1. Create the bucket (Public, 5MB limit, JPG/PNG/WEBP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-images',
    'project-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies to allow safe reruns
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;

-- 3. Public SELECT policy (Anon)
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'project-images');

-- 4. Authenticated SELECT policy
CREATE POLICY "Authenticated users can view project images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-images');

-- 5. Authenticated CRUD policies
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images')
WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

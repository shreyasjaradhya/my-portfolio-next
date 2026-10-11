-- Migration: 018_experiences_image_storage
-- Description: Add image_url to experiences table and create experience-images storage bucket with RLS policies

-- 1. Add image_url column to experiences table if it does not exist
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create the bucket (Public, 5MB limit, JPG/PNG/WEBP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'experience-images',
    'experience-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Public can view experience images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view experience images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload experience images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update experience images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete experience images" ON storage.objects;

CREATE POLICY "Public can view experience images"
ON storage.objects FOR SELECT TO anon USING (bucket_id = 'experience-images');

CREATE POLICY "Authenticated users can view experience images"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'experience-images');

CREATE POLICY "Authenticated users can upload experience images"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'experience-images');

CREATE POLICY "Authenticated users can update experience images"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'experience-images') WITH CHECK (bucket_id = 'experience-images');

CREATE POLICY "Authenticated users can delete experience images"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'experience-images');

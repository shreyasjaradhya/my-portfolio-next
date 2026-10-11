-- Migration: 019_certificates_layout_and_storage
-- Description: Add tags, issuer_logo_url, callout, action_label to certifications table, ensure storage bucket permissions, and insert reference certificates

-- 1. Add new columns to certifications table if they do not exist
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS issuer_logo_url TEXT;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS callout TEXT;
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS action_label TEXT;

-- 2. Ensure storage bucket for certificates and issuer logos exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'certificates',
    'certificates',
    true,
    10485760, -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Public can view certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete certificates" ON storage.objects;

CREATE POLICY "Public can view certificates"
ON storage.objects FOR SELECT TO anon USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can update certificates"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can delete certificates"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates');

-- 4. Insert reference certificates from screenshot
INSERT INTO certifications (name, issuer, issue_date, credential_url, certificate_url, description, tags, issuer_logo_url, callout, action_label, display_order)
VALUES 
(
    'MY Bharat Budget Quest 2026 – Final Round',
    'Ministry of Youth Affairs & Sports',
    '2026-04-12',
    '#experience',
    NULL,
    'Shortlisted out of over 12 lakh participants for the Final Round of MY Bharat Budget Quest 2026—a prestigious National-Level Virtual Dialogue with the Hon''ble Prime Minister of India, Shri Narendra Modi ji.',
    ARRAY['National Round', 'Virtual Dialogue', 'Public Policy'],
    '/logos/emblem_india.svg',
    'Organized by Ministry of Youth Affairs & Sports',
    'View Experience →',
    1
),
(
    'Certificate of Presentation – AIDE 2026',
    'IEEE & NMAMIT',
    '2026-02-01',
    '#projects',
    NULL,
    'Presented the research paper on machine learning for marketing prediction at the IEEE AIDE 2026 International Conference.',
    ARRAY['Paper Presentation', 'Research'],
    '/logos/ieee.svg',
    'Organized by IEEE & NMAMIT',
    'View Project →',
    2
),
(
    'AIC Nitte Internship',
    'Atal Incubation Centre Nitte',
    '2025-05-01',
    '#experience',
    NULL,
    'Completed a hands-on internship at Atal Incubation Centre Nitte, gaining practical experience in tech innovation, startup incubation processes, and entrepreneurship.',
    ARRAY['1 Event Photos', 'Tech Innovation'],
    '/logos/aim.svg',
    'Completed in under 4 months.',
    'View Experience →',
    3
);

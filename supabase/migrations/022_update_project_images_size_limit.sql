-- Migration: 022_update_project_images_size_limit
-- Description: Increase project-images bucket storage file size limit from 5MB to 10MB (10485760 bytes)

UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'project-images';

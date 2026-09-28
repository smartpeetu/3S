-- 1. Create a public storage bucket for team-member photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-member-photos',
  'team-member-photos',
  true,
  5242880, -- 5 MB limit in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies
-- Controlled write/upload permissions for team member registration
DROP POLICY IF EXISTS "Allow photo uploads for team member registration" ON storage.objects;
CREATE POLICY "Allow photo uploads for team member registration"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'team-member-photos');

-- Controlled update permissions for team member photos
DROP POLICY IF EXISTS "Allow photo updates for team member registration" ON storage.objects;
CREATE POLICY "Allow photo updates for team member registration"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'team-member-photos')
WITH CHECK (bucket_id = 'team-member-photos');

-- Controlled delete permissions for team member photos
DROP POLICY IF EXISTS "Allow photo deletes for team member registration" ON storage.objects;
CREATE POLICY "Allow photo deletes for team member registration"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'team-member-photos');

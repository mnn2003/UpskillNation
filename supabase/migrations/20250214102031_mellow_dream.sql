/*
  # Storage setup for avatars

  1. Storage Configuration
    - Create avatars bucket for user profile pictures
    - Enable public access to avatars

  2. Security
    - Add RLS policies for avatar uploads and updates
    - Allow authenticated users to manage their own avatars
    - Allow public read access to all avatars
*/

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to avatars bucket
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatar files
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar files
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar files
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
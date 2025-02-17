/*
  # Add admin role support
  
  1. Changes
    - Add `is_admin` column to profiles table with default value of false
    - Add index on is_admin column for faster queries
    - Update RLS policies to allow admin access
*/

-- Add is_admin column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  ));
/*
  # Fix Database Issues and Policies

  1. Changes
    - Fix recursive policies for profiles table
    - Create learn table
    - Fix foreign key relationships
    - Update RLS policies
    
  2. Security
    - Simplified RLS policies to prevent recursion
    - Added proper policies for all tables
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, simplified policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create learn table
CREATE TABLE IF NOT EXISTS learn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  category text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for learn table
ALTER TABLE learn ENABLE ROW LEVEL SECURITY;

-- Add policies for learn table
CREATE POLICY "Learn resources are viewable by everyone"
  ON learn FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create learn resources"
  ON learn FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own learn resources"
  ON learn FOR UPDATE
  USING (auth.uid() = created_by);

-- Update trigger for learn table
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON learn
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Fix posts foreign key
ALTER TABLE posts 
  DROP CONSTRAINT IF EXISTS posts_created_by_fkey,
  ADD CONSTRAINT posts_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
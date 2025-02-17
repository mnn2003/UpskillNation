/*
  # Initial Schema Setup for Unstop Clone

  1. New Tables
    - profiles (extends auth.users)
      - id (uuid, references auth.users)
      - full_name (text)
      - avatar_url (text)
      - bio (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - events
      - id (uuid)
      - title (text)
      - description (text)
      - start_date (timestamp)
      - end_date (timestamp)
      - location (text)
      - category (text)
      - created_by (uuid, references profiles)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - jobs
      - id (uuid)
      - title (text)
      - company (text)
      - description (text)
      - location (text)
      - type (text)
      - salary_range (text)
      - created_by (uuid, references profiles)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - resources
      - id (uuid)
      - title (text)
      - description (text)
      - type (text)
      - url (text)
      - created_by (uuid, references profiles)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - posts
      - id (uuid)
      - title (text)
      - content (text)
      - created_by (uuid, references profiles)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  category text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = created_by);

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text,
  location text,
  type text,
  salary_range text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = created_by);

-- Create resources table
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  url text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = created_by);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = created_by);

-- Create functions to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
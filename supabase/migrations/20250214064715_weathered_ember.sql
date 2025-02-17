/*
  # Add event registrations and job applications

  1. New Tables
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references auth.users)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `job_applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `user_id` (uuid, references auth.users)
      - `resume_url` (text)
      - `cover_letter` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to view their own applications/registrations
    - Add policies for event/job creators to view applications/registrations for their content
*/

-- Create event_registrations table
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create job_applications table
CREATE TABLE job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url text,
  cover_letter text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for event_registrations
CREATE POLICY "Users can view their own registrations"
  ON event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event creators can view registrations"
  ON event_registrations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM events WHERE id = event_registrations.event_id
    )
  );

-- Policies for job_applications
CREATE POLICY "Users can view their own applications"
  ON job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit job applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Job posters can view applications"
  ON job_applications
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM jobs WHERE id = job_applications.job_id
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
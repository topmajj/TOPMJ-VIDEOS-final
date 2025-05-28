-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  status TEXT NOT NULL,
  video_url TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_id TEXT NOT NULL,
  avatar_name TEXT,
  voice_id TEXT NOT NULL,
  voice_name TEXT,
  script TEXT NOT NULL,
  heygen_video_id TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos(user_id);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at);

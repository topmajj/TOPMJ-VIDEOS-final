-- Check if videos table exists, if not create it
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  url TEXT,
  thumbnail_url TEXT,
  heygen_video_id TEXT,
  avatar_id TEXT,
  voice_id TEXT,
  script TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check if policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Users can view their own videos'
  ) THEN
    CREATE POLICY "Users can view their own videos" 
    ON videos FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Users can insert their own videos'
  ) THEN
    CREATE POLICY "Users can insert their own videos" 
    ON videos FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Users can update their own videos'
  ) THEN
    CREATE POLICY "Users can update their own videos" 
    ON videos FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Users can delete their own videos'
  ) THEN
    CREATE POLICY "Users can delete their own videos" 
    ON videos FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
  
  -- Add a policy for anon inserts if needed
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'videos' AND policyname = 'Allow anonymous video creation'
  ) THEN
    CREATE POLICY "Allow anonymous video creation" 
    ON videos FOR INSERT 
    WITH CHECK (user_id IS NULL);
  END IF;
END
$$;

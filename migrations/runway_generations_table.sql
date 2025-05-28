-- Create the runway_generations table
CREATE TABLE IF NOT EXISTS runway_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'text-to-image', 'text-to-video', 'image-to-image'
  prompt TEXT NOT NULL,
  result_url TEXT,
  source_image_url TEXT, -- For image-to-image
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE runway_generations ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own generations
CREATE POLICY "Users can view their own generations"
  ON runway_generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own generations
CREATE POLICY "Users can insert their own generations"
  ON runway_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own generations
CREATE POLICY "Users can update their own generations"
  ON runway_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own generations
CREATE POLICY "Users can delete their own generations"
  ON runway_generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS runway_generations_user_id_idx ON runway_generations(user_id);

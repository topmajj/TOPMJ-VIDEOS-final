-- Create a table for storing RunwayML generations
CREATE TABLE IF NOT EXISTS runway_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'image', 'video', or 'image-to-image'
  input_image_url TEXT, -- For image-to-image transformations
  output_url TEXT, -- URL to the generated content
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE runway_generations ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own generations
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

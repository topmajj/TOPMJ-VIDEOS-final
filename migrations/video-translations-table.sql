-- Create video_translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS video_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  heygen_translation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  source_video_url TEXT NOT NULL,
  target_language TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE video_translations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own translations
CREATE POLICY "Users can view their own translations"
ON video_translations
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own translations
CREATE POLICY "Users can insert their own translations"
ON video_translations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own translations
CREATE POLICY "Users can update their own translations"
ON video_translations
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own translations
CREATE POLICY "Users can delete their own translations"
ON video_translations
FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_video_translations_user_id ON video_translations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_translations_heygen_id ON video_translations(heygen_translation_id);

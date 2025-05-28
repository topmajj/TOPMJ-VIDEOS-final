-- Create photo avatars table
CREATE TABLE IF NOT EXISTS photo_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  orientation TEXT NOT NULL,
  pose TEXT NOT NULL,
  style TEXT NOT NULL,
  appearance TEXT NOT NULL,
  generation_id TEXT,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE photo_avatars ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own photo avatars)
CREATE POLICY photo_avatars_select_policy ON photo_avatars
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for insert (users can only insert their own photo avatars)
CREATE POLICY photo_avatars_insert_policy ON photo_avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own photo avatars)
CREATE POLICY photo_avatars_update_policy ON photo_avatars
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for delete (users can only delete their own photo avatars)
CREATE POLICY photo_avatars_delete_policy ON photo_avatars
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS photo_avatars_user_id_idx ON photo_avatars(user_id);

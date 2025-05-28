-- Add supabase_url column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS supabase_url TEXT;

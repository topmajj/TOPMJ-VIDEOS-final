-- Add view_count column to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing videos with a default view count
UPDATE videos 
SET view_count = 0 
WHERE view_count IS NULL;

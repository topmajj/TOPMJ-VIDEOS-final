-- Create the videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to view their own videos
CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (
  auth.uid() = owner AND
  bucket_id = 'videos'
);

-- Policy: Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'videos'
);

-- Policy: Allow authenticated users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (
  auth.uid() = owner AND
  bucket_id = 'videos'
)
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'videos'
);

-- Policy: Allow authenticated users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  auth.uid() = owner AND
  bucket_id = 'videos'
);

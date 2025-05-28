-- Create the happyscribe_translations table
CREATE TABLE IF NOT EXISTS public.happyscribe_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transcription_id TEXT NOT NULL,
  export_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  source_video_url TEXT NOT NULL,
  target_language TEXT NOT NULL,
  download_url TEXT,
  format TEXT DEFAULT 'subtitles',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.happyscribe_translations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own translations
CREATE POLICY "Users can view their own translations"
ON public.happyscribe_translations
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own translations
CREATE POLICY "Users can insert their own translations"
ON public.happyscribe_translations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own translations
CREATE POLICY "Users can update their own translations"
ON public.happyscribe_translations
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own translations
CREATE POLICY "Users can delete their own translations"
ON public.happyscribe_translations
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_happyscribe_translations_user_id ON public.happyscribe_translations(user_id);
CREATE INDEX idx_happyscribe_translations_export_id ON public.happyscribe_translations(export_id);
CREATE INDEX idx_happyscribe_translations_status ON public.happyscribe_translations(status);

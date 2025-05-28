-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(255),
  language VARCHAR(255),
  timezone VARCHAR(255),
  sidebar_collapsed BOOLEAN DEFAULT false,
  compact_view BOOLEAN DEFAULT false,
  default_page VARCHAR(255) DEFAULT 'dashboard',
  email_notifications JSONB DEFAULT '{"processing_complete": true, "new_features": true, "tips": false}'::jsonb,
  app_notifications JSONB DEFAULT '{"processing_complete": true, "new_features": true, "tips": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Set up RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own preferences
CREATE POLICY user_preferences_select_policy ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own preferences
CREATE POLICY user_preferences_insert_policy ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own preferences
CREATE POLICY user_preferences_update_policy ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;

-- Create veo_generations table
CREATE TABLE IF NOT EXISTS veo_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    aspect_ratio VARCHAR(10) DEFAULT '16:9',
    status VARCHAR(20) DEFAULT 'processing',
    operation_id TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_veo_generations_user_id ON veo_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_veo_generations_status ON veo_generations(status);
CREATE INDEX IF NOT EXISTS idx_veo_generations_created_at ON veo_generations(created_at);

-- Enable RLS
ALTER TABLE veo_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own veo generations" ON veo_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own veo generations" ON veo_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own veo generations" ON veo_generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own veo generations" ON veo_generations
    FOR DELETE USING (auth.uid() = user_id);

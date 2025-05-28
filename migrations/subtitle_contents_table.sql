-- Create a table to store subtitle contents
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subtitle_contents') THEN
        -- Table exists, check if translation_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'subtitle_contents' 
                      AND column_name = 'translation_id') THEN
            -- Add translation_id column
            ALTER TABLE subtitle_contents ADD COLUMN translation_id UUID;
        END IF;
        
        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS subtitle_contents_translation_id_idx ON subtitle_contents(translation_id);
        
        -- Add unique constraint to prevent duplicates
        ALTER TABLE subtitle_contents ADD CONSTRAINT unique_translation_id UNIQUE (translation_id);
    ELSE
        -- Create the table from scratch
        CREATE TABLE subtitle_contents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            translation_id UUID,
            content TEXT NOT NULL,
            format TEXT NOT NULL,
            language TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS subtitle_contents_translation_id_idx ON subtitle_contents(translation_id);
        
        -- Add unique constraint to prevent duplicates
        ALTER TABLE subtitle_contents ADD CONSTRAINT unique_translation_id UNIQUE (translation_id);
    END IF;
END $$;

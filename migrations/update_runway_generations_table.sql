-- Add runway_task_id column to runway_generations table
ALTER TABLE runway_generations ADD COLUMN IF NOT EXISTS runway_task_id UUID;
ALTER TABLE runway_generations ADD COLUMN IF NOT EXISTS promptText TEXT;

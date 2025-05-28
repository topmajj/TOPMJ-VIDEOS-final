-- Modify the happyscribe_translations table to allow NULL values for export_id
ALTER TABLE public.happyscribe_translations 
ALTER COLUMN export_id DROP NOT NULL;

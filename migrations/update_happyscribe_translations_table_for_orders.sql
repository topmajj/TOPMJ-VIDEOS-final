-- Add order_id column to happyscribe_translations table
ALTER TABLE public.happyscribe_translations 
ADD COLUMN order_id TEXT;

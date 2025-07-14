-- Add missing capacity column to classes table
ALTER TABLE public.classes ADD COLUMN capacity INTEGER DEFAULT 30;

-- Update existing classes to have a default capacity
UPDATE public.classes SET capacity = 30 WHERE capacity IS NULL;
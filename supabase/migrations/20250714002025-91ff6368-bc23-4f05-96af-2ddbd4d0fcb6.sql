-- Add teacher_id column to classes table to support teacher assignments
ALTER TABLE public.classes ADD COLUMN teacher_id UUID REFERENCES public.profiles(id);
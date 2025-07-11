-- Add specific admin user
-- This will be handled by the admin signup process, but we can pre-create the profile

-- First, let's create a function to add admin user when they sign up
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update existing profile to admin if it exists
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = user_email;
  
  -- If no rows were updated, the profile doesn't exist yet
  -- The trigger will handle creating it when they sign up
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if user is admin by email
CREATE OR REPLACE FUNCTION public.is_admin_email(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_email = 'mynameisjyotirmoy@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to automatically make specific email admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'mynameisjyotirmoy@gmail.com' THEN 'admin'::public.user_role
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.user_role
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update role if it's the admin email
    IF NEW.email = 'mynameisjyotirmoy@gmail.com' THEN
      UPDATE public.profiles 
      SET role = 'admin'
      WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default school if none exists
INSERT INTO public.schools (name, address, email, phone, website)
SELECT 
  'ScholarMate Academy',
  '123 Education Street, Knowledge City',
  'info@scholarmate.edu',
  '+1-555-SCHOOL',
  'https://scholarmate.edu'
WHERE NOT EXISTS (SELECT 1 FROM public.schools LIMIT 1);

-- Create some default subjects
INSERT INTO public.subjects (name, code, description) VALUES
  ('Mathematics', 'MATH', 'Core mathematics curriculum'),
  ('English Language', 'ENG', 'English language and literature'),
  ('Science', 'SCI', 'General science and physics'),
  ('History', 'HIST', 'World and local history'),
  ('Geography', 'GEO', 'Physical and human geography'),
  ('Computer Science', 'CS', 'Programming and computer literacy'),
  ('Physical Education', 'PE', 'Sports and physical fitness'),
  ('Art', 'ART', 'Creative arts and design')
ON CONFLICT (name) DO NOTHING;

-- Create default classes
DO $$
DECLARE
  school_uuid UUID;
BEGIN
  SELECT id INTO school_uuid FROM public.schools LIMIT 1;
  
  IF school_uuid IS NOT NULL THEN
    INSERT INTO public.classes (school_id, name, grade_level, section, academic_year) VALUES
      (school_uuid, 'Grade 1', 1, 'A', '2024-2025'),
      (school_uuid, 'Grade 2', 2, 'A', '2024-2025'),
      (school_uuid, 'Grade 3', 3, 'A', '2024-2025'),
      (school_uuid, 'Grade 4', 4, 'A', '2024-2025'),
      (school_uuid, 'Grade 5', 5, 'A', '2024-2025'),
      (school_uuid, 'Grade 6', 6, 'A', '2024-2025'),
      (school_uuid, 'Grade 7', 7, 'A', '2024-2025'),
      (school_uuid, 'Grade 8', 8, 'A', '2024-2025'),
      (school_uuid, 'Grade 9', 9, 'A', '2024-2025'),
      (school_uuid, 'Grade 10', 10, 'A', '2024-2025')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

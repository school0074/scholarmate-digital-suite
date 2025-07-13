-- Create additional tables that are referenced in the codebase but missing from schema

-- Create exam_results table
CREATE TABLE IF NOT EXISTS public.exam_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid REFERENCES public.exams(id),
  student_id uuid REFERENCES public.profiles(id),
  marks_obtained numeric,
  graded_at timestamp with time zone,
  graded_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create attendance_records view/table alias for attendance
CREATE OR REPLACE VIEW public.attendance_records AS 
SELECT * FROM public.attendance;

-- Create student_profiles view as alias for profiles filtered to students
CREATE OR REPLACE VIEW public.student_profiles AS 
SELECT 
  id,
  email,
  full_name,
  address,
  phone,
  date_of_birth,
  avatar_url,
  'A+' as blood_group,
  phone as emergency_contact,
  full_name as parent_name,
  phone as parent_phone,
  created_at,
  updated_at
FROM public.profiles 
WHERE role = 'student';

-- Create fee_types table
CREATE TABLE IF NOT EXISTS public.fee_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  is_recurring boolean DEFAULT false,
  due_frequency text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default fee types
INSERT INTO public.fee_types (name, amount, description, is_recurring) 
VALUES 
  ('Tuition Fee', 5000, 'Monthly tuition fee', true),
  ('Library Fee', 500, 'Annual library fee', false),
  ('Lab Fee', 1000, 'Semester lab fee', false),
  ('Sports Fee', 300, 'Annual sports fee', false)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;

-- Create policies for exam_results
CREATE POLICY "Students can view their exam results" ON public.exam_results
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage exam results" ON public.exam_results
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.teacher_assignments ta ON e.class_id = ta.class_id
    WHERE e.id = exam_results.exam_id AND ta.teacher_id = auth.uid()
  ) OR get_user_role() = 'admin'::user_role
);

-- Create policies for fee_types
CREATE POLICY "Everyone can view fee types" ON public.fee_types
FOR SELECT USING (true);

CREATE POLICY "Admins can manage fee types" ON public.fee_types
FOR ALL USING (get_user_role() = 'admin'::user_role);
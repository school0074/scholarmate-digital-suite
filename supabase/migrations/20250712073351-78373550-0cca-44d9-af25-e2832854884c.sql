-- Optimize database for production and ensure proper RLS policies

-- Update profiles table to ensure proper constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure proper RLS policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Ensure homework table has proper policies
DROP POLICY IF EXISTS "Students can view homework assigned to their class" ON public.homework;
CREATE POLICY "Students can view homework assigned to their class" 
ON public.homework FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM student_enrollments 
    WHERE student_enrollments.student_id = auth.uid() 
    AND student_enrollments.class_id = homework.class_id
  )
);

DROP POLICY IF EXISTS "Teachers can manage homework for their classes" ON public.homework;
CREATE POLICY "Teachers can manage homework for their classes" 
ON public.homework FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM teacher_assignments 
    WHERE teacher_assignments.teacher_id = auth.uid() 
    AND teacher_assignments.class_id = homework.class_id
  ) OR get_user_role() = 'admin'::user_role
);

-- Update announcements policies
DROP POLICY IF EXISTS "Everyone can view announcements" ON public.announcements;
CREATE POLICY "Everyone can view announcements" 
ON public.announcements FOR SELECT 
TO authenticated 
USING (
  target_role IS NULL OR 
  target_role = get_user_role() OR 
  get_user_role() = 'admin'::user_role
);

DROP POLICY IF EXISTS "Teachers and admins can create announcements" ON public.announcements;
CREATE POLICY "Teachers and admins can create announcements" 
ON public.announcements FOR INSERT 
TO authenticated 
WITH CHECK (
  get_user_role() IN ('teacher'::user_role, 'admin'::user_role)
);

-- Ensure subjects table is accessible
DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;
CREATE POLICY "Everyone can view subjects" 
ON public.subjects FOR SELECT 
TO authenticated 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON public.student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_class_id ON public.student_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class_id ON public.teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_class_id ON public.homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON public.homework(due_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Update updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables that have updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_homework_updated_at ON public.homework;
CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure proper storage policies for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false) 
ON CONFLICT (id) DO NOTHING;

-- Create avatar storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create document storage policies
DROP POLICY IF EXISTS "Users can view their class documents" ON storage.objects;
CREATE POLICY "Users can view their class documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'documents' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    get_user_role() IN ('teacher'::user_role, 'admin'::user_role)
  )
);

DROP POLICY IF EXISTS "Teachers can upload documents" ON storage.objects;
CREATE POLICY "Teachers can upload documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  get_user_role() IN ('teacher'::user_role, 'admin'::user_role)
);
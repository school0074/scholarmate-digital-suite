-- Create timetable table
CREATE TABLE public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create student submissions table
CREATE TABLE public.student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id UUID REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_urls TEXT[],
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded BOOLEAN DEFAULT FALSE,
  grade NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMPTZ,
  UNIQUE(homework_id, student_id)
);

-- Create study materials table
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table for private messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  reply_to UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create group chats table
CREATE TABLE public.group_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create group chat messages table
CREATE TABLE public.group_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'voice', 'video')),
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fees table
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_limit_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_taken_seconds INTEGER
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT NOT NULL,
  badge_icon TEXT,
  points INTEGER DEFAULT 0,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events calendar table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT DEFAULT 'general',
  target_audience TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students
CREATE POLICY "Students can view their timetable" ON public.timetable
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = timetable.class_id
  )
);

CREATE POLICY "Students can view their exams" ON public.exams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = exams.class_id
  )
);

CREATE POLICY "Students can manage their submissions" ON public.student_submissions
FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Students can view approved study materials" ON public.study_materials
FOR SELECT USING (
  approved = TRUE AND EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = study_materials.class_id
  )
);

-- Create RLS policies for teachers
CREATE POLICY "Teachers can manage their class timetables" ON public.timetable
FOR ALL USING (
  teacher_id = auth.uid() OR 
  public.get_user_role() = 'admin'
);

CREATE POLICY "Teachers can manage exams for their classes" ON public.exams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.teacher_assignments 
    WHERE teacher_id = auth.uid() AND class_id = exams.class_id
  ) OR public.get_user_role() = 'admin'
);

CREATE POLICY "Teachers can upload study materials" ON public.study_materials
FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Teachers can view all study materials" ON public.study_materials
FOR SELECT USING (
  public.get_user_role() IN ('teacher', 'admin')
);

-- Create RLS policies for messaging
CREATE POLICY "Users can send and receive messages" ON public.messages
FOR ALL USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('homework-submissions', 'homework-submissions', false),
('study-materials', 'study-materials', false),
('profile-avatars', 'profile-avatars', true);

-- Create storage policies
CREATE POLICY "Users can upload their homework" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'homework-submissions' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their homework" ON storage.objects
FOR SELECT USING (
  bucket_id = 'homework-submissions' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can upload study materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'study-materials' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

CREATE POLICY "Public can view approved study materials" ON storage.objects
FOR SELECT USING (bucket_id = 'study-materials');

CREATE POLICY "Anyone can upload profile avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-avatars');

CREATE POLICY "Public can view profile avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-avatars');
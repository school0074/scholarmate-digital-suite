-- Add missing tables for complete school management system

-- Library system
CREATE TABLE public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category TEXT,
  description TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  cover_image_url TEXT,
  digital_copy_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Book borrowing system
CREATE TABLE public.book_borrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue'))
);

-- Transportation/Bus tracking
CREATE TABLE public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number TEXT UNIQUE NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  route_name TEXT,
  capacity INTEGER,
  gps_device_id TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bus stops
CREATE TABLE public.bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  estimated_time TIME,
  stop_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student bus assignments
CREATE TABLE public.student_bus_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  bus_stop_id UUID REFERENCES public.bus_stops(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-learning courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course lessons/videos
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  lesson_order INTEGER,
  duration_minutes INTEGER,
  is_free BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student course progress
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0,
  last_watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- Counseling/career guidance
CREATE TABLE public.counseling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'career' CHECK (session_type IN ('career', 'academic', 'personal', 'behavioral')),
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily motivational quotes
CREATE TABLE public.daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'motivation',
  date_featured DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Birthday reminders and celebrations
CREATE TABLE public.birthday_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parent-child relationships
CREATE TABLE public.parent_child_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'emergency_contact')),
  primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Student performance analytics
CREATE TABLE public.student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- format: 'YYYY-MM'
  attendance_percentage DECIMAL(5,2) DEFAULT 0,
  assignment_completion_rate DECIMAL(5,2) DEFAULT 0,
  average_marks DECIMAL(5,2) DEFAULT 0,
  quiz_performance DECIMAL(5,2) DEFAULT 0,
  participation_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, subject_id, month_year)
);

-- Teacher performance tracking
CREATE TABLE public.teacher_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  classes_conducted INTEGER DEFAULT 0,
  assignments_graded INTEGER DEFAULT 0,
  student_feedback_score DECIMAL(3,2) DEFAULT 0,
  response_time_hours DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, month_year)
);

-- Digital ID card QR codes
CREATE TABLE public.student_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_data TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push notification tokens
CREATE TABLE public.notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT DEFAULT 'web' CHECK (device_type IN ('web', 'android', 'ios')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Offline notes storage
CREATE TABLE public.offline_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backup configurations
CREATE TABLE public.backup_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type TEXT DEFAULT 'cloud' CHECK (backup_type IN ('cloud', 'local')),
  auto_backup BOOLEAN DEFAULT TRUE,
  backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  last_backup_at TIMESTAMPTZ,
  storage_used_mb INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for library system
CREATE POLICY "Everyone can view library books" ON public.library_books
FOR SELECT USING (true);

CREATE POLICY "Users can manage their book borrows" ON public.book_borrows
FOR ALL USING (user_id = auth.uid());

-- Create policies for transportation
CREATE POLICY "Students can view their bus information" ON public.buses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_bus_assignments 
    WHERE student_id = auth.uid() AND bus_id = buses.id AND active = true
  )
);

-- Create policies for courses
CREATE POLICY "Students can view published courses for their class" ON public.courses
FOR SELECT USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM public.student_enrollments 
    WHERE student_id = auth.uid() AND class_id = courses.class_id
  )
);

CREATE POLICY "Students can track their course progress" ON public.course_progress
FOR ALL USING (student_id = auth.uid());

-- Create policies for counseling
CREATE POLICY "Users can view their counseling sessions" ON public.counseling_sessions
FOR SELECT USING (student_id = auth.uid() OR counselor_id = auth.uid());

-- Create policies for personal data
CREATE POLICY "Users can manage their own QR codes" ON public.student_qr_codes
FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Users can manage their notification tokens" ON public.notification_tokens
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their offline notes" ON public.offline_notes
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their backup settings" ON public.backup_configurations
FOR ALL USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_book_borrows_user_status ON public.book_borrows(user_id, status);
CREATE INDEX idx_course_progress_student_course ON public.course_progress(student_id, course_id);
CREATE INDEX idx_student_analytics_student_month ON public.student_analytics(student_id, month_year);
CREATE INDEX idx_teacher_performance_teacher_month ON public.teacher_performance(teacher_id, month_year);
CREATE INDEX idx_notification_tokens_user_active ON public.notification_tokens(user_id, active);

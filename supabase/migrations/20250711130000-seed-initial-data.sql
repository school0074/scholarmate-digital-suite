-- Insert sample school
INSERT INTO public.schools (id, name, address, email, phone, website)
VALUES (
  gen_random_uuid(),
  'ScholarMate Digital Academy',
  '123 Education Street, Learning City, State 12345',
  'admin@scholarmate.edu',
  '+1 (555) 123-4567',
  'https://scholarmate.edu'
) ON CONFLICT DO NOTHING;

-- Insert sample subjects
INSERT INTO public.subjects (id, name, code, description) VALUES
  (gen_random_uuid(), 'Mathematics', 'MATH', 'Core mathematics curriculum'),
  (gen_random_uuid(), 'Science', 'SCI', 'General science and physics'),
  (gen_random_uuid(), 'English', 'ENG', 'English language and literature'),
  (gen_random_uuid(), 'History', 'HIST', 'World and local history'),
  (gen_random_uuid(), 'Geography', 'GEO', 'Physical and human geography'),
  (gen_random_uuid(), 'Computer Science', 'CS', 'Programming and computer literacy')
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO public.classes (id, name, grade_level, section, academic_year) VALUES
  (gen_random_uuid(), 'Grade 9A', 9, 'A', '2024-25'),
  (gen_random_uuid(), 'Grade 9B', 9, 'B', '2024-25'),
  (gen_random_uuid(), 'Grade 10A', 10, 'A', '2024-25'),
  (gen_random_uuid(), 'Grade 10B', 10, 'B', '2024-25'),
  (gen_random_uuid(), 'Grade 11A', 11, 'A', '2024-25'),
  (gen_random_uuid(), 'Grade 12A', 12, 'A', '2024-25')
ON CONFLICT DO NOTHING;

-- Insert sample daily quotes
INSERT INTO public.daily_quotes (quote_text, author, category, date_featured) VALUES
  ('Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', 'education', CURRENT_DATE),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams', CURRENT_DATE + INTERVAL '1 day'),
  ('Learning is a treasure that will follow its owner everywhere.', 'Chinese Proverb', 'learning', CURRENT_DATE + INTERVAL '2 days'),
  ('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation', CURRENT_DATE + INTERVAL '3 days'),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'perseverance', CURRENT_DATE + INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- Insert sample study materials
INSERT INTO public.study_materials (
  title, 
  description, 
  file_type, 
  file_url, 
  file_size, 
  approved, 
  class_id, 
  subject_id
) 
SELECT 
  'Mathematics Chapter 5 - Algebra Basics',
  'Comprehensive guide to algebraic expressions and equations',
  'pdf',
  '/materials/math-chapter-5.pdf',
  2048576,
  true,
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Mathematics'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.study_materials (
  title, 
  description, 
  file_type, 
  file_url, 
  file_size, 
  approved, 
  class_id, 
  subject_id
) 
SELECT 
  'Science Lab Manual - Physics Experiments',
  'Lab procedures and safety guidelines for physics experiments',
  'pdf',
  '/materials/science-lab-manual.pdf',
  3145728,
  true,
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 10A' AND s.name = 'Science'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample homework assignments
INSERT INTO public.homework (
  title,
  description,
  due_date,
  class_id,
  subject_id
)
SELECT 
  'Algebra Practice Problems',
  'Complete exercises 1-20 from chapter 5. Show all work and calculations.',
  CURRENT_DATE + INTERVAL '7 days',
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Mathematics'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.homework (
  title,
  description,
  due_date,
  class_id,
  subject_id
)
SELECT 
  'History Essay - World War II',
  'Write a 500-word essay on the causes and effects of World War II.',
  CURRENT_DATE + INTERVAL '10 days',
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 10A' AND s.name = 'History'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample exams
INSERT INTO public.exams (
  title,
  description,
  exam_date,
  start_time,
  duration_minutes,
  total_marks,
  class_id,
  subject_id
)
SELECT 
  'Mid-term Mathematics Exam',
  'Comprehensive test covering algebra and geometry topics',
  CURRENT_DATE + INTERVAL '14 days',
  '09:00:00',
  120,
  100,
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Mathematics'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO public.events (
  title,
  description,
  event_date,
  start_time,
  end_time,
  event_type,
  target_audience
) VALUES
  (
    'Annual Science Fair',
    'Students showcase their scientific projects and innovations',
    CURRENT_DATE + INTERVAL '21 days',
    '09:00:00',
    '16:00:00',
    'academic',
    'all'
  ),
  (
    'Parent-Teacher Conference',
    'Individual meetings between parents and teachers to discuss student progress',
    CURRENT_DATE + INTERVAL '28 days',
    '10:00:00',
    '15:00:00',
    'meeting',
    'parents'
  ),
  (
    'Sports Day',
    'Inter-class sports competitions and athletic events',
    CURRENT_DATE + INTERVAL '35 days',
    '08:00:00',
    '17:00:00',
    'sports',
    'all'
  )
ON CONFLICT DO NOTHING;

-- Insert sample quiz
INSERT INTO public.quizzes (
  title,
  description,
  total_questions,
  time_limit_minutes,
  active,
  class_id,
  subject_id
)
SELECT 
  'Basic Algebra Quiz',
  'Quick assessment of fundamental algebraic concepts',
  10,
  30,
  true,
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Mathematics'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (
  question,
  options,
  correct_answer,
  points,
  explanation,
  quiz_id
)
SELECT 
  'What is the value of x in the equation 2x + 5 = 13?',
  '["4", "6", "8", "10"]'::json,
  '4',
  1,
  'Solving: 2x + 5 = 13, subtract 5 from both sides: 2x = 8, divide by 2: x = 4',
  q.id
FROM public.quizzes q
WHERE q.title = 'Basic Algebra Quiz'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.quiz_questions (
  question,
  options,
  correct_answer,
  points,
  explanation,
  quiz_id
)
SELECT 
  'Which of the following is a quadratic equation?',
  '["x + 5 = 0", "2x + 3y = 7", "x² + 4x + 4 = 0", "3x = 12"]'::json,
  'x² + 4x + 4 = 0',
  1,
  'A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0',
  q.id
FROM public.quizzes q
WHERE q.title = 'Basic Algebra Quiz'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample library books
INSERT INTO public.library_books (
  title,
  author,
  isbn,
  category,
  description,
  total_copies,
  available_copies,
  cover_image_url
) VALUES
  (
    'Introduction to Computer Science',
    'Dr. John Smith',
    '978-0-123456-78-9',
    'Computer Science',
    'Comprehensive introduction to programming and computer science concepts',
    5,
    4,
    '/images/books/intro-cs.jpg'
  ),
  (
    'Advanced Mathematics',
    'Prof. Jane Doe',
    '978-0-987654-32-1',
    'Mathematics',
    'Advanced mathematical concepts for high school students',
    3,
    2,
    '/images/books/advanced-math.jpg'
  ),
  (
    'World History Encyclopedia',
    'Historical Society',
    '978-0-111222-33-4',
    'History',
    'Comprehensive reference for world historical events',
    2,
    2,
    '/images/books/world-history.jpg'
  )
ON CONFLICT DO NOTHING;

-- Insert sample timetable entries (for Grade 9A)
INSERT INTO public.timetable (
  day_of_week,
  start_time,
  end_time,
  room_number,
  class_id,
  subject_id
)
SELECT 
  1, -- Monday
  '09:00:00',
  '10:00:00',
  'Room 101',
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Mathematics'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.timetable (
  day_of_week,
  start_time,
  end_time,
  room_number,
  class_id,
  subject_id
)
SELECT 
  1, -- Monday
  '10:00:00',
  '11:00:00',
  'Room 102',
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'Science'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.timetable (
  day_of_week,
  start_time,
  end_time,
  room_number,
  class_id,
  subject_id
)
SELECT 
  2, -- Tuesday
  '09:00:00',
  '10:00:00',
  'Room 103',
  c.id,
  s.id
FROM public.classes c
CROSS JOIN public.subjects s
WHERE c.name = 'Grade 9A' AND s.name = 'English'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Note: User profiles will be created through the authentication system
-- Student enrollments, teacher assignments, fees, etc. will be created by admin users

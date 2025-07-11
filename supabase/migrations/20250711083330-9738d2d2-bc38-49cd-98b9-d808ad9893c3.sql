-- Insert demo school
INSERT INTO public.schools (name, address, phone, email, website) VALUES
('Demo High School', '123 Education Street, Learning City, LC 12345', '+1-555-0123', 'admin@demohigh.edu', 'www.demohigh.edu');

-- Get the school ID for reference
DO $$
DECLARE
    school_uuid UUID;
    math_subject_uuid UUID;
    science_subject_uuid UUID;
    english_subject_uuid UUID;
    grade10a_uuid UUID;
    grade10b_uuid UUID;
    grade11a_uuid UUID;
BEGIN
    -- Get school ID
    SELECT id INTO school_uuid FROM public.schools WHERE name = 'Demo High School' LIMIT 1;
    
    -- Insert demo subjects
    INSERT INTO public.subjects (name, code, description) VALUES
    ('Mathematics', 'MATH', 'Core mathematics curriculum'),
    ('Science', 'SCI', 'General science and physics'),
    ('English Literature', 'ENG', 'English language and literature'),
    ('History', 'HIST', 'World and local history'),
    ('Physical Education', 'PE', 'Physical fitness and sports');
    
    -- Get subject IDs
    SELECT id INTO math_subject_uuid FROM public.subjects WHERE code = 'MATH' LIMIT 1;
    SELECT id INTO science_subject_uuid FROM public.subjects WHERE code = 'SCI' LIMIT 1;
    SELECT id INTO english_subject_uuid FROM public.subjects WHERE code = 'ENG' LIMIT 1;
    
    -- Insert demo classes
    INSERT INTO public.classes (school_id, name, grade_level, section, academic_year) VALUES
    (school_uuid, 'Grade 10-A', 10, 'A', '2024-2025'),
    (school_uuid, 'Grade 10-B', 10, 'B', '2024-2025'),
    (school_uuid, 'Grade 11-A', 11, 'A', '2024-2025'),
    (school_uuid, 'Grade 9-C', 9, 'C', '2024-2025');
    
    -- Get class IDs
    SELECT id INTO grade10a_uuid FROM public.classes WHERE name = 'Grade 10-A' LIMIT 1;
    SELECT id INTO grade10b_uuid FROM public.classes WHERE name = 'Grade 10-B' LIMIT 1;
    SELECT id INTO grade11a_uuid FROM public.classes WHERE name = 'Grade 11-A' LIMIT 1;
    
    -- Insert demo homework assignments
    INSERT INTO public.homework (title, description, subject_id, class_id, assigned_by, due_date) VALUES
    ('Algebra Practice Set 1', 'Complete exercises 1-20 from chapter 5', math_subject_uuid, grade10a_uuid, 
     (SELECT id FROM auth.users WHERE email = 'teacher@demo.com' LIMIT 1), 
     CURRENT_DATE + INTERVAL '3 days'),
    ('Physics Lab Report', 'Write a detailed report on the pendulum experiment', science_subject_uuid, grade11a_uuid,
     (SELECT id FROM auth.users WHERE email = 'teacher@demo.com' LIMIT 1), 
     CURRENT_DATE + INTERVAL '1 week'),
    ('Essay on Shakespeare', 'Write a 500-word essay on Hamlet', english_subject_uuid, grade10b_uuid,
     (SELECT id FROM auth.users WHERE email = 'teacher@demo.com' LIMIT 1), 
     CURRENT_DATE + INTERVAL '5 days');
    
    -- Insert demo announcements
    INSERT INTO public.announcements (title, content, author_id, target_role, priority) VALUES
    ('Welcome to New Academic Year', 'We welcome all students and staff to the new academic year 2024-2025. Let''s make it a great year of learning!', 
     (SELECT id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1), 
     'student', 'high'),
    ('Parent-Teacher Meeting', 'The monthly parent-teacher meeting is scheduled for next Friday at 2:00 PM in the main auditorium.', 
     (SELECT id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1), 
     NULL, 'normal'),
    ('Science Fair Registration', 'Registration for the annual science fair is now open. Students can register with their science teachers.', 
     (SELECT id FROM auth.users WHERE email = 'teacher@demo.com' LIMIT 1), 
     'student', 'medium');
     
END $$;
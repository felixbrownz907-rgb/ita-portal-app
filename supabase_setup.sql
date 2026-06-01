-- SUPABASE DATABASE SETUP FOR ITA ACADEMY PORTAL
-- Optimized for Real-time Identity Verification and Academic Monitoring

-- 1. Portal Profiles (Students, Staff, Admins)
CREATE TABLE IF NOT EXISTS portal_profiles (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    nrc TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    role TEXT DEFAULT 'student',
    course_id TEXT,
    intake_id TEXT,
    status TEXT DEFAULT 'Active',
    progress INTEGER DEFAULT 0,
    attendance_progress INTEGER DEFAULT 0,
    lab_progress INTEGER DEFAULT 0,
    payment_status TEXT DEFAULT 'Outstanding',
    payment_history JSONB DEFAULT '[]'::jsonb,
    admission_year INTEGER DEFAULT 2026,
    current_module_id TEXT DEFAULT '1',
    current_track TEXT DEFAULT 'Unit 1: Fundamentals',
    selected_duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2a. Modules
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    pdf_url TEXT,
    audio_url TEXT,
    external_links JSONB DEFAULT '[]'::jsonb,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Intakes
CREATE TABLE IF NOT EXISTS intakes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lecturers
CREATE TABLE IF NOT EXISTS lecturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT,
    course_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    lecturer_id TEXT,
    day TEXT,
    session_time TEXT,
    notes TEXT,
    audio_url TEXT,
    pdf_url TEXT,
    wps_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    amount NUMERIC,
    balance NUMERIC,
    status TEXT DEFAULT 'Pending',
    transaction_id TEXT,
    payment_method TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    category TEXT DEFAULT 'System',
    action TEXT NOT NULL,
    details TEXT,
    user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Submissions (Enhanced for AI Marking)
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    type TEXT,
    title TEXT,
    module_id TEXT,
    file_url TEXT,
    file_type TEXT,
    status TEXT DEFAULT 'pending',
    grade TEXT,
    feedback TEXT,
    ai_grade TEXT,
    ai_feedback TEXT,
    is_ai_marked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8a. Exams (Practical-based)
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    module_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    type TEXT,
    max_mark INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. Student Progress
CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    student_id TEXT,
    lesson_id TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- 8c. Learning Materials
CREATE TABLE IF NOT EXISTS learning_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    module_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- 8d. Active Meetings
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    host_id TEXT,
    title TEXT DEFAULT 'Academic Audio Session',
    status TEXT DEFAULT 'active',
    room_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 9. Mentor Bookings
CREATE TABLE IF NOT EXISTS mentor_bookings (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    topic TEXT,
    duration TEXT,
    status TEXT DEFAULT 'Pending',
    preferred_time TEXT,
    notes TEXT,
    transaction_id TEXT,
    booking_date TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Library
CREATE TABLE IF NOT EXISTS library (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    type TEXT,
    category TEXT,
    file_url TEXT,
    course_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Community Messages
CREATE TABLE IF NOT EXISTS community_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    text TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    faculty TEXT
);

-- 12. Settings
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    announcement_marquee TEXT,
    whatsapp_ai JSONB DEFAULT '{}'::jsonb,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    transparency_mode BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    amount NUMERIC,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Paid',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Online Classes
CREATE TABLE IF NOT EXISTS online_classes (
    id TEXT PRIMARY KEY,
    title TEXT,
    course_id TEXT,
    session_time TEXT,
    zoom_link TEXT,
    date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WhatsApp Messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    sender TEXT,
    message TEXT,
    reply TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    "type" TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    target_role TEXT DEFAULT 'admin'
);

-- 18. Mock Exams
CREATE TABLE IF NOT EXISTS mock_exams (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Mock Exam Results
CREATE TABLE IF NOT EXISTS mock_exam_results (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    exam_id TEXT,
    answers JSONB DEFAULT '[]'::jsonb,
    score INTEGER,
    max_score INTEGER,
    feedback TEXT,
    is_ai_graded BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Class Attendance (New)
CREATE TABLE IF NOT EXISTS class_attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    student_name TEXT,
    class_id TEXT,
    class_title TEXT,
    date DATE DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'present',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Marketing Media (TV Station Assets)
CREATE TABLE IF NOT EXISTS marketing_media (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'video', 'audio', 'image', 'document'
    url TEXT NOT NULL,
    duration TEXT,
    category TEXT,
    description TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE portal_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Profiles select" ON portal_profiles FOR SELECT USING (true);
CREATE POLICY "Public Profiles insert" ON portal_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Profiles update" ON portal_profiles FOR UPDATE USING (true);

-- Repeat for other tables to ensure they are accessible in the demo environment
-- For a real app, you would have much stricter policies.
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Courses access" ON courses FOR SELECT USING (true);
CREATE POLICY "Public Courses manage" ON courses FOR ALL USING (true);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Modules access" ON modules FOR SELECT USING (true);
CREATE POLICY "Public Modules manage" ON modules FOR ALL USING (true);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Lessons access" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public Lessons manage" ON lessons FOR ALL USING (true);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Submissions access" ON submissions FOR SELECT USING (true);
CREATE POLICY "Public Submissions insert" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Submissions update" ON submissions FOR UPDATE USING (true);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Payments access" ON payments FOR SELECT USING (true);
CREATE POLICY "Public Payments insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Payments update" ON payments FOR UPDATE USING (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Audit access" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Audit insert" ON audit_logs FOR INSERT WITH CHECK (true);

ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Community access" ON community_messages FOR SELECT USING (true);
CREATE POLICY "Public Community insert" ON community_messages FOR INSERT WITH CHECK (true);

ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Mock Exams access" ON mock_exams FOR SELECT USING (true);
CREATE POLICY "Public Mock Exams manage" ON mock_exams FOR ALL USING (true);

ALTER TABLE mock_exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Mock Exam Results access" ON mock_exam_results FOR SELECT USING (true);
CREATE POLICY "Public Mock Exam Results insert" ON mock_exam_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Mock Exam Results update" ON mock_exam_results FOR UPDATE USING (true);

ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Lecturers access" ON lecturers FOR SELECT USING (true);
CREATE POLICY "Public Lecturers manage" ON lecturers FOR ALL USING (true);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Timetable access" ON timetable FOR SELECT USING (true);
CREATE POLICY "Public Timetable manage" ON timetable FOR ALL USING (true);

ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Intakes access" ON intakes FOR SELECT USING (true);
CREATE POLICY "Public Intakes manage" ON intakes FOR ALL USING (true);

ALTER TABLE library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Library access" ON library FOR SELECT USING (true);
CREATE POLICY "Public Library manage" ON library FOR ALL USING (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Settings access" ON settings FOR SELECT USING (true);
CREATE POLICY "Public Settings manage" ON settings FOR ALL USING (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Invoices access" ON invoices FOR SELECT USING (true);
CREATE POLICY "Public Invoices manage" ON invoices FOR ALL USING (true);

ALTER TABLE online_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Online Classes access" ON online_classes FOR SELECT USING (true);
CREATE POLICY "Public Online Classes manage" ON online_classes FOR ALL USING (true);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public WhatsApp access" ON whatsapp_messages FOR SELECT USING (true);
CREATE POLICY "Public WhatsApp manage" ON whatsapp_messages FOR ALL USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Announcements access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public Announcements manage" ON announcements FOR ALL USING (true);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Notifications access" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public Notifications manage" ON notifications FOR ALL USING (true);

ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Attendance access" ON class_attendance FOR SELECT USING (true);
CREATE POLICY "Public Attendance manage" ON class_attendance FOR ALL USING (true);

ALTER TABLE marketing_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Media access" ON marketing_media FOR SELECT USING (true);
CREATE POLICY "Public Media manage" ON marketing_media FOR ALL USING (true);

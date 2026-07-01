-- ============================================================================
-- FUD Assessment System - PostgreSQL Database Schema & Seed Data
-- ============================================================================
-- Copy and paste this script directly into the Supabase SQL Editor and click RUN.
-- This will build all required tables, constraints, and mock seed records.

-- Clean existing tables if they exist (restarts schema cleanly)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS virtual_classes CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS lecture_materials CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- 1. Courses Table
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    lecturer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
    avatar VARCHAR(10) NOT NULL,
    password VARCHAR(100) NOT NULL DEFAULT 'password123',
    is_first_login BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Groups Table
CREATE TABLE groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    leader_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Group Members Junction Table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, student_id)
);

-- 5. Quizzes Table
CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    time_limit INT NOT NULL DEFAULT 10,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 6. Assignments Table
CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    max_score INT NOT NULL DEFAULT 100,
    due_date DATE NOT NULL,
    is_group BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. Submissions Table
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL, -- Links to quizzes.id or assignments.id
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('quiz', 'assignment')),
    is_group_submission BOOLEAN NOT NULL DEFAULT FALSE,
    group_id VARCHAR(50) REFERENCES groups(id) ON DELETE SET NULL,
    group_name VARCHAR(100),
    attachment_name VARCHAR(150),
    submission_text TEXT,
    score INT,
    feedback TEXT,
    is_released BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at VARCHAR(30) NOT NULL
);

-- ============================================================================
-- Seed Records (Starting Data)
-- ============================================================================

-- Seed Courses
INSERT INTO courses (id, code, name, semester, department, lecturer_id) VALUES
('cosc_301', 'COSC 301', 'Software Engineering', 'First Semester', 'Computer Science', 'lecturer_bello'),
('cosc_305', 'COSC 305', 'Database Systems Design', 'First Semester', 'Computer Science', 'lecturer_bello');

-- Seed Users (Staff & Students)
INSERT INTO users (id, name, email, role, avatar, password, is_first_login) VALUES
('admin_fud', 'System Administrator', 'admin@fud.edu.ng', 'admin', 'AD', 'password123', FALSE),
('lecturer_bello', 'Dr. Bello', 'bello@fud.edu.ng', 'lecturer', 'DB', 'password123', FALSE),
('student_aliyu', 'Aliyu Ibrahim', 'FUD/CSC/22/1001', 'student', 'AI', 'password123', FALSE),
('student_fatima', 'Fatima Abubakar', 'FUD/CSC/22/1002', 'student', 'FA', 'password123', FALSE),
('student_chidi', 'Chidi Okafor', 'FUD/CSC/22/1003', 'student', 'CO', 'password123', FALSE);

-- Seed Groups for COSC 301
INSERT INTO groups (id, name, course_id, leader_id) VALUES
('group_alpha', 'Group Alpha', 'cosc_301', 'student_aliyu'),
('group_beta', 'Group Beta', 'cosc_301', 'student_chidi');

-- Seed Group Members relationships
INSERT INTO group_members (group_id, student_id) VALUES
('group_alpha', 'student_aliyu'),
('group_alpha', 'student_fatima'),
('group_beta', 'student_chidi');

-- Seed Quizzes
INSERT INTO quizzes (id, course_id, title, description, time_limit, questions) VALUES
('quiz_seed_1', 'cosc_301', 'Software Development Methodologies', 'Covers agile methodologies, scrum practices, waterfall models, and spiral lifecycle development.', 5, 
'[
  {
    "id": "q1",
    "text": "Which methodology is characterized by iterative cycles called Sprints?",
    "type": "mcq",
    "options": ["Waterfall", "Scrum / Agile", "V-Model", "Spiral Model"],
    "correctOptionIndex": 1
  },
  {
    "id": "q2",
    "text": "The Waterfall model is highly adaptive and suitable for requirements that change rapidly.",
    "type": "tf",
    "options": ["True", "False"],
    "correctOptionIndex": 1
  }
]'::jsonb);

-- Seed Assignments
INSERT INTO assignments (id, course_id, title, description, max_score, due_date, is_group) VALUES
('assign_seed_1', 'cosc_305', 'Entity Relationship Diagram (ERD)', 'Design a comprehensive ERD diagram representing an online university registry. Detail attributes, primary keys, and relationships.', 100, '2026-06-01', FALSE),
('assign_seed_2', 'cosc_301', 'Software Requirement Specifications (SRS)', 'In your assigned student groups, write an IEEE Standard 830 compliant SRS document for an automated student clinic reservation portal.', 100, '2026-06-15', TRUE);

-- Seed Submissions
INSERT INTO submissions (id, task_id, student_id, type, is_group_submission, group_id, group_name, attachment_name, submission_text, score, feedback, submitted_at) VALUES
('sub_seed_1', 'quiz_seed_1', 'student_chidi', 'quiz', FALSE, NULL, NULL, NULL, NULL, 100, 'Auto-graded upon submission', '2026-05-20');

-- ============================================================================
-- Extension Tables
-- ============================================================================

-- 8. Lecture Materials Table
CREATE TABLE lecture_materials (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Slide', 'Book', 'Other')),
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Announcements Forum Table
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Virtual Classes Table (Google Meet links)
CREATE TABLE virtual_classes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    meet_url TEXT NOT NULL,
    class_date VARCHAR(50) NOT NULL,
    class_time VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Attendance Sessions Table
CREATE TABLE attendance_sessions (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Attendance Records Table (capturing GPS locations)
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    reg_no VARCHAR(50) NOT NULL,
    marked_at TIMESTAMP DEFAULT NOW(),
    gps_lat DOUBLE PRECISION,
    gps_lng DOUBLE PRECISION,
    UNIQUE(session_id, student_id)
);

-- Grant privileges for Anonymous and Authenticated users to query and insert into tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


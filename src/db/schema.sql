-- MultiGrade Mitra PostgreSQL Database Schema
-- Production Relational Schema for Educational SaaS Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. User Profiles (1-to-1 with Users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    education_level VARCHAR(32) CHECK (education_level IN ('class12', 'undergrad', 'btech', 'advanced')),
    degree VARCHAR(128),
    branch VARCHAR(128),
    year_level VARCHAR(64),
    semester VARCHAR(64),
    institution VARCHAR(255),
    preferred_language VARCHAR(32) DEFAULT 'English',
    learning_style VARCHAR(64) DEFAULT 'step-by-step',
    difficulty_preference VARCHAR(32) DEFAULT 'intermediate',
    subjects_taught TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Education Programs Catalog
CREATE TABLE IF NOT EXISTS education_programs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(32) NOT NULL,
    description TEXT,
    branches JSONB DEFAULT '[]'::jsonb,
    semesters JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subjects Catalog
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32),
    name VARCHAR(255) NOT NULL,
    program_id VARCHAR(64) REFERENCES education_programs(id) ON DELETE SET NULL,
    education_level VARCHAR(32) NOT NULL,
    branch VARCHAR(128),
    semester VARCHAR(64),
    chapters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_level ON subjects(education_level);
CREATE INDEX IF NOT EXISTS idx_subjects_branch ON subjects(branch);

-- 5. Saved Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(512) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    education_level VARCHAR(32) NOT NULL,
    program VARCHAR(128),
    branch VARCHAR(128),
    semester VARCHAR(64),
    resource_type VARCHAR(64) NOT NULL CHECK (
        resource_type IN (
            'notes', 'revision_summary', 'formula_sheet', 'practice_questions',
            'quiz', 'worksheet', 'lesson_plan', 'assignment', 'multigrade'
        )
    ),
    content TEXT NOT NULL,
    structured_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_reviewed_by_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_user ON learning_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON learning_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_level ON learning_resources(education_level);

-- 6. Uploaded Documents
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(512) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    extracted_text TEXT,
    identified_subject VARCHAR(255),
    identified_topic VARCHAR(255),
    analysis_status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON uploaded_documents(user_id);

-- 7. Generated Quizzes & Questions
CREATE TABLE IF NOT EXISTS generated_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id VARCHAR(64) REFERENCES learning_resources(id) ON DELETE CASCADE,
    question_type VARCHAR(32) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(32) DEFAULT 'intermediate',
    marks INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Saved Conversations / Learning Sessions
CREATE TABLE IF NOT EXISTS saved_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    prompt_payload JSONB NOT NULL,
    ai_response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON saved_conversations(user_id);
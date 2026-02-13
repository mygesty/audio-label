-- Initialize Audio Label Pro database

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('annotator', 'reviewer', 'project_admin', 'system_admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'submitted', 'reviewing', 'approved', 'rejected', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE project_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE ai_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE ai_job_type AS ENUM ('asr', 'speaker_diarization', 'segmentation', 'noise_detection');
CREATE TYPE annotation_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE layer_type AS ENUM ('transcript', 'speaker', 'emotion', 'event', 'noise');
CREATE TYPE tag_type AS ENUM ('emotion', 'scene', 'custom');
CREATE TYPE team_member_role AS ENUM ('member', 'admin');

-- Create indexes for common queries will be handled by TypeORM migrations

-- Grant permissions (if needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
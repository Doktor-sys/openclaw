-- Supabase SQL Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contexts table
CREATE TABLE IF NOT EXISTS contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  model VARCHAR(50) DEFAULT 'GPT-4',
  status VARCHAR(50) DEFAULT 'inactive',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'info',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_contexts_filename ON contexts(filename);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Insert sample data
INSERT INTO projects (name, description, status) VALUES
  ('Dashboard Projekt', 'OpenClaw Dashboard Entwicklung', 'in_progress'),
  ('Bot Integration', 'WebSocket und Bot-Kommunikation', 'in_progress'),
  ('Datenbank Setup', 'Supabase-Integration', 'completed')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, priority, project_id) 
SELECT 
  'Backend API', 
  'Express Server mit WebSocket', 
  'completed', 
  'high',
  id 
FROM projects 
WHERE name = 'Dashboard Projekt'
ON CONFLICT DO NOTHING;

INSERT INTO contexts (filename, content) VALUES
  ('Memory.md', '# Memory.md\n\nLangzeitgedächtnis des Bots'),
  ('ProjectContext.md', '# Project Context\n\nProjektinformationen'),
  ('AgentConfig.md', '# Agent Config\n\nBot-Konfiguration')
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, type, model, status, config) VALUES
  ('OpenClaw Bot', 'general', 'GPT-4', 'active', '{"version": "1.0.0"}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO activities (type, message, status) VALUES
  ('system', 'Dashboard initialisiert', 'info'),
  ('bot', 'Bot verbunden', 'success'),
  ('project', 'Neues Projekt erstellt', 'info')
ON CONFLICT DO NOTHING;
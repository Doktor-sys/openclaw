# Supabase-Integration

## Einrichtung

1. Erstellen Sie ein Supabase-Projekt: https://supabase.com
2. Rufen Sie die API-URL und den Anon-Schlüssel ab
3. Konfigurieren Sie die `.env`-Datei

## Datenbank-Tabellen

Die folgenden Tabellen werden automatisch erstellt:

### projects
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- status (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### tasks
- id (UUID)
- project_id (UUID, Foreign Key)
- title (VARCHAR)
- description (TEXT)
- status (VARCHAR)
- priority (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### contexts
- id (UUID)
- filename (VARCHAR, UNIQUE)
- content (TEXT)
- updated_at (TIMESTAMP)

### agents
- id (UUID)
- name (VARCHAR)
- type (VARCHAR)
- model (VARCHAR)
- status (VARCHAR)
- config (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### activities
- id (UUID)
- type (VARCHAR)
- message (TEXT)
- status (VARCHAR)
- created_at (TIMESTAMP)

## API-Endpunkte

Alle CRUD-Operationen sind verfügbar für:
- `/api/projects`
- `/api/tasks`
- `/api/context`
- `/api/agents`
- `/api/activities`
const supabase = require('../config/supabase');

const mockTasks = [
  { id: 1, title: 'Dashboard entwerfen', description: 'UI-Design für Haupt-Dashboard', project_id: 1, status: 'done', priority: 'high', created_at: new Date().toISOString() },
  { id: 2, title: 'API-Endpunkte implementieren', description: 'RESTful API für CRUD-Operationen', project_id: 1, status: 'done', priority: 'high', created_at: new Date().toISOString() },
  { id: 3, title: 'Authentifizierung', description: 'JWT-basiertes Login/Register', project_id: 1, status: 'done', priority: 'high', created_at: new Date().toISOString() },
  { id: 4, title: 'TaskBoard-Komponente', description: 'Kanban-Board mit Drag & Drop', project_id: 1, status: 'in_progress', priority: 'high', created_at: new Date().toISOString() },
  { id: 5, title: 'Unit Tests schreiben', description: 'Jest-Tests für Backend', project_id: 1, status: 'todo', priority: 'medium', created_at: new Date().toISOString() },
  { id: 6, title: 'Docker部署', description: 'Multi-Stage Docker Builds', project_id: 1, status: 'done', priority: 'medium', created_at: new Date().toISOString() },
  { id: 7, title: 'WebSocket-Kommunikation', description: 'Echtzeit-Updates für Bot', project_id: 2, status: 'todo', priority: 'low', created_at: new Date().toISOString() },
  { id: 8, title: 'Supabase-Integration', description: 'Datenbank-Verbindung', project_id: 1, status: 'in_progress', priority: 'high', created_at: new Date().toISOString() }
];

let taskCounter = 9;

const useMock = () => !supabase;

exports.getTasks = async (req, res) => {
  try {
    if (useMock()) {
      let tasks = [...mockTasks];
      if (req.query.project_id) {
        tasks = tasks.filter(t => t.project_id === parseInt(req.query.project_id));
      }
      return res.json(tasks);
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    if (useMock()) {
      const tasks = mockTasks.filter(t => t.project_id === parseInt(req.params.projectId));
      return res.json(tasks);
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (useMock()) {
      const newTask = {
        id: taskCounter++,
        ...req.body,
        created_at: new Date().toISOString()
      };
      mockTasks.unshift(newTask);
      return res.json(newTask);
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockTasks.findIndex(t => t.id === parseInt(req.params.id));
      if (index !== -1) {
        mockTasks[index] = { ...mockTasks[index], ...req.body };
        return res.json(mockTasks[index]);
      }
      return res.status(404).json({ error: 'Task not found' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockTasks.findIndex(t => t.id === parseInt(req.params.id));
      if (index !== -1) {
        mockTasks.splice(index, 1);
        return res.json({ message: 'Task deleted' });
      }
      return res.status(404).json({ error: 'Task not found' });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const supabase = require('../config/supabase');

console.log('[ProjectController] supabase:', supabase ? 'initialized' : 'null');

const mockProjects = [
  { id: 1, name: 'OpenClaw Dashboard', description: 'Hauptprojekt für das Dashboard', status: 'active', created_at: new Date().toISOString() },
  { id: 2, name: 'Bot-Integration', description: 'Discord Bot für Echtzeit-Kommunikation', status: 'active', created_at: new Date().toISOString() }
];

let projectCounter = 3;

const useMock = () => !supabase;

exports.getProjects = async (req, res) => {
  try {
    if (useMock()) {
      return res.json(mockProjects);
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    if (useMock()) {
      const project = mockProjects.find(p => p.id === parseInt(req.params.id));
      if (project) {
        return res.json(project);
      }
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    if (useMock()) {
      const newProject = {
        id: projectCounter++,
        ...req.body,
        created_at: new Date().toISOString()
      };
      mockProjects.unshift(newProject);
      return res.json(newProject);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockProjects.findIndex(p => p.id === parseInt(req.params.id));
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...req.body };
        return res.json(mockProjects[index]);
      }
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data, error } = await supabase
      .from('projects')
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

exports.deleteProject = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockProjects.findIndex(p => p.id === parseInt(req.params.id));
      if (index !== -1) {
        mockProjects.splice(index, 1);
        return res.json({ message: 'Project deleted' });
      }
      return res.status(404).json({ error: 'Project not found' });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

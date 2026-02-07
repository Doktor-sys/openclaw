const supabase = require('../config/supabase');

const mockAgents = [
  { id: 1, name: 'CodeAgent', status: 'online', type: 'coding', created_at: new Date().toISOString() },
  { id: 2, name: 'ResearchAgent', status: 'idle', type: 'research', created_at: new Date().toISOString() },
  { id: 3, name: 'WriteAgent', status: 'offline', type: 'writing', created_at: new Date().toISOString() }
];
let agentCounter = 4;

const useMock = () => !supabase;

exports.getAgents = async (req, res) => {
  try {
    if (useMock()) {
      return res.json(mockAgents);
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgent = async (req, res) => {
  try {
    if (useMock()) {
      const agent = mockAgents.find(a => a.id === parseInt(req.params.id));
      if (agent) {
        return res.json(agent);
      }
      return res.status(404).json({ error: 'Agent not found' });
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    if (useMock()) {
      const newAgent = {
        id: agentCounter++,
        ...req.body,
        created_at: new Date().toISOString()
      };
      mockAgents.push(newAgent);
      return res.json(newAgent);
    }

    const { data, error } = await supabase
      .from('agents')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockAgents.findIndex(a => a.id === parseInt(req.params.id));
      if (index !== -1) {
        mockAgents[index] = { ...mockAgents[index], ...req.body };
        return res.json(mockAgents[index]);
      }
      return res.status(404).json({ error: 'Agent not found' });
    }

    const { data, error } = await supabase
      .from('agents')
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

exports.deleteAgent = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockAgents.findIndex(a => a.id === parseInt(req.params.id));
      if (index !== -1) {
        mockAgents.splice(index, 1);
        return res.json({ message: 'Agent deleted' });
      }
      return res.status(404).json({ error: 'Agent not found' });
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

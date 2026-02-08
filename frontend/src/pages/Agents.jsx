import { useState, useEffect } from 'react';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Fehler beim Laden der Agenten:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Leerlauf';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🤖 Agenten-Verwaltung</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Neuer Agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    agent.type === 'coding' ? 'bg-blue-100' : 
                    agent.type === 'research' ? 'bg-green-100' : 
                    agent.type === 'analysis' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {agent.type === 'coding' ? '💻' : agent.type === 'research' ? '🔍' : agent.type === 'analysis' ? '📊' : '🤖'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                  <span className="text-sm text-gray-600">{getStatusLabel(agent.status)}</span>
                </div>
              </div>

              {agent.description && (
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Aufgaben:</span>
                  <span className="font-medium">{agent.tasks_completed || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Letzte Aktivität:</span>
                  <span className="font-medium">
                    {agent.last_active ? new Date(agent.last_active).toLocaleString('de-DE') : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  ⚙️ Konfigurieren
                </button>
                <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-500">Keine Agenten gefunden</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Ersten Agenten erstellen
          </button>
        </div>
      )}
    </div>
  );
}

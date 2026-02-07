import { useState } from 'react'

const initialAgents = [
  { id: 1, name: 'OpenClaw Bot', status: 'active', type: 'general', model: 'GPT-4' }
]

export default function Agents() {
  const [agents, setAgents] = useState(initialAgents)
  const [selectedAgent, setSelectedAgent] = useState(agents[0])

  const updateAgent = (field, value) => {
    setSelectedAgent({ ...selectedAgent, [field]: value })
    setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, [field]: value } : a))
  }

  const addAgent = () => {
    const newAgent = {
      id: Date.now(),
      name: 'Neuer Agent',
      status: 'inactive',
      type: 'general',
      model: 'GPT-4'
    }
    setAgents([...agents, newAgent])
    setSelectedAgent(newAgent)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Agenten</h1>
      
      <div className="flex justify-end">
        <button
          onClick={addAgent}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Neuer Agent
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-gray-700">Agenten</h3>
          <ul className="space-y-2">
            {agents.map(agent => (
              <li key={agent.id}>
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedAgent?.id === agent.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{agent.name}</div>
                  <div className={`text-xs mt-1 flex items-center gap-1`}>
                    <span className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {agent.status}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Agent Konfiguration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={selectedAgent?.name || ''}
                onChange={(e) => updateAgent('name', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select
                value={selectedAgent?.type || ''}
                onChange={(e) => updateAgent('type', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="specialist">Specialist</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modell</label>
              <select
                value={selectedAgent?.model || ''}
                onChange={(e) => updateAgent('model', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="GPT-4">GPT-4</option>
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="Claude">Claude</option>
                <option value="Llama">Llama</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedAgent?.status || ''}
                onChange={(e) => updateAgent('status', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="error">Fehler</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
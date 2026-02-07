import { useState, useEffect } from 'react'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [stats, setStats] = useState({ total_projects: 0, total_tasks: 0, by_status: {} })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'in_progress'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        fetch('http://localhost:3002/api/projects').then(r => r.json()),
        fetch('http://localhost:3002/api/projects/stats').then(r => r.json())
      ])
      setProjects(projectsData)
      setStats(statsData)
      setLoading(false)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await fetch(`http://localhost:3002/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('http://localhost:3002/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      setShowModal(false)
      setEditingProject(null)
      setFormData({ name: '', description: '', status: 'in_progress' })
      loadData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
      try {
        await fetch(`http://localhost:3002/api/projects/${id}`, {
          method: 'DELETE'
        })
        loadData()
      } catch (error) {
        console.error('Fehler beim Löschen:', error)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800'
    }
    return colors[status] || colors.todo
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Projekte</h1>
        <button
          onClick={() => {
            setEditingProject(null)
            setFormData({ name: '', description: '', status: 'in_progress' })
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Neues Projekt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Gesamt Projekte</div>
          <div className="text-3xl font-bold text-primary-600">{stats.total_projects}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Gesamt Aufgaben</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.total_tasks}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Abgeschlossen</div>
          <div className="text-3xl font-bold text-green-600">{stats.by_status?.done || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projekt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aufgaben</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-500">{project.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status === 'in_progress' ? 'In Arbeit' : project.status === 'done' ? 'Abgeschlossen' : 'Offen'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.tasks?.length || 0} Aufgaben
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Projekt bearbeiten' : 'Neues Projekt'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="todo">Offen</option>
                  <option value="in_progress">In Arbeit</option>
                  <option value="done">Abgeschlossen</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingProject ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
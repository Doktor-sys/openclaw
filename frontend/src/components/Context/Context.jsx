import { useState, useEffect } from 'react'

const contextFiles = ['Memory.md', 'ProjectContext.md', 'AgentConfig.md']

export default function Context() {
  const [selectedFile, setSelectedFile] = useState(contextFiles[0])
  const [content, setContent] = useState('')

  useEffect(() => {
    loadContent(selectedFile)
  }, [selectedFile])

  const loadContent = async (filename) => {
    try {
      const response = await fetch(`/api/context/${filename}`)
      const data = await response.json()
      setContent(data.content || '')
    } catch (error) {
      setContent('# ' + filename + '\n\nNeuer Kontext...')
    }
  }

  const saveContent = async () => {
    try {
      await fetch(`/api/context/${selectedFile}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      alert('Gespeichert!')
    } catch (error) {
      alert('Fehler beim Speichern')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Kontext</h1>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-gray-700">Dateien</h3>
          <ul className="space-y-2">
            {contextFiles.map(file => (
              <li key={file}>
                <button
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedFile === file
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  📄 {file}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedFile}</h2>
            <button
              onClick={saveContent}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Speichern
            </button>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[500px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Markdown-Content..."
          />
        </div>
      </div>
    </div>
  )
}
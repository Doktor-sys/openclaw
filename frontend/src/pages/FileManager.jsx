import { useState, useEffect } from 'react';
import FileUpload from '../components/Upload/FileUpload';

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
    loadFiles();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Fehler beim Laden der Projekte:', error);
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProject) {
        params.projectId = selectedProject;
      }
      
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`http://localhost:3002/api/uploads?${queryString}`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Fehler beim Laden der Dateien:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [selectedProject]);

  const handleUploadComplete = (uploadedFiles) => {
    loadFiles();
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Möchten Sie "${filename}" wirklich löschen?`)) {
      return;
    }

    try {
      await fetch(`http://localhost:3002/api/uploads/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      loadFiles();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Datei konnte nicht gelöscht werden');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      ppt: '📽️', pptx: '📽️',
      txt: '📃', md: '📃',
      json: '{ }',
      zip: '📦'
    };
    return icons[ext] || '📎';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dateien</h1>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Alle Projekte</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Hochgeladene Dateien</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>Keine Dateien gefunden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div 
                    key={file.filename}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{getFileIcon(file.filename)}</span>
                      <div>
                        <p className="font-medium text-gray-800">{file.filename}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`http://localhost:3002/uploads/${file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors text-sm font-medium"
                      >
                        Ansehen
                      </a>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Dateien hochladen</h2>
            <FileUpload onUploadComplete={handleUploadComplete} projectId={selectedProject || null} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Statistiken</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gesamte Dateien:</span>
                <span className="font-semibold">{files.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gesamtgröße:</span>
                <span className="font-semibold">
                  {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

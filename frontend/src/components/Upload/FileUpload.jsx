import { useState, useRef } from 'react';

export default function FileUpload({ onUploadComplete, projectId, taskId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (projectId) formData.append('projectId', projectId);
        if (taskId) formData.append('taskId', taskId);

        const response = await fetch('http://localhost:3002/api/uploads', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload fehlgeschlagen: ${file.name}`);
        }

        const data = await response.json();
        results.push(data);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        setError(err.message);
      }
    }

    if (results.length > 0) {
      setUploadedFiles(prev => [...prev, ...results]);
      if (onUploadComplete) {
        onUploadComplete(results);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const fakeEvent = { target: { files } };
    handleFileSelect(fakeEvent);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return '📊';
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return '📦';
    } else if (mimeType.includes('text')) {
      return '📃';
    }
    return '📎';
  };

  const removeFile = (filename) => {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename));
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.json,.zip"
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600">Upload läuft... {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <p className="text-gray-600">
              Dateien hier ablegen oder <span className="text-primary-600 font-medium">klicken zum Hochladen</span>
            </p>
            <p className="text-xs text-gray-400">
              Unterstützte Formate: JPG, PNG, GIF, PDF, DOC, XLS, TXT, MD, JSON, ZIP (max. 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Hochgeladene Dateien:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <p className="font-medium text-gray-800">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`http://localhost:3002${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ansehen
                  </a>
                  <button
                    onClick={() => removeFile(file.filename)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

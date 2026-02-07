const API_URL = 'http://localhost:3002/api';

class UploadService {
  async uploadFile(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload fehlgeschlagen');
    }

    return response.json();
  }

  async uploadMultiple(files, metadata = {}) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, metadata);
        results.push(result);
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
      }
    }

    return { results, errors };
  }

  async getFiles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/uploads?${queryString}`);
    
    if (!response.ok) {
      throw new Error('Dateien konnten nicht geladen werden');
    }

    return response.json();
  }

  async deleteFile(filename) {
    const response = await fetch(`${API_URL}/uploads/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Löschen fehlgeschlagen');
    }

    return response.json();
  }

  getFileUrl(filename) {
    return `http://localhost:3002/uploads/${filename}`;
  }
}

export default new UploadService();

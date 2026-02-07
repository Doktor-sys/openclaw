const API_URL = 'http://localhost:3002/api';

class SearchService {
  async search(query, options = {}) {
    const { type, status, priority, project } = options;
    
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (project) params.append('project', project);

    const response = await fetch(`${API_URL}/search?${params}`);
    
    if (!response.ok) {
      throw new Error('Suche fehlgeschlagen');
    }

    return response.json();
  }

  async getFilters() {
    const response = await fetch(`${API_URL}/search/filters`);
    return response.json();
  }

  async getSuggestions(query) {
    if (!query || query.length < 2) {
      return Promise.resolve([]);
    }
    
    const response = await fetch(`${API_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.json();
  }
}

export default new SearchService();

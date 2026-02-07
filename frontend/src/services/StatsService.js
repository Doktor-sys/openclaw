const API_URL = 'http://localhost:3002/api';

class StatsService {
  async getOverview() {
    const response = await fetch(`${API_URL}/stats/overview`);
    return response.json();
  }

  async getTaskStats() {
    const response = await fetch(`${API_URL}/stats/tasks`);
    return response.json();
  }

  async getProjectStats() {
    const response = await fetch(`${API_URL}/stats/projects`);
    return response.json();
  }

  async getActivityStats() {
    const response = await fetch(`${API_URL}/stats/activities`);
    return response.json();
  }

  async getPerformance() {
    const response = await fetch(`${API_URL}/stats/performance`);
    return response.json();
  }

  async getCharts() {
    const response = await fetch(`${API_URL}/stats/charts`);
    return response.json();
  }

  async getHealth() {
    const response = await fetch(`${API_URL}/stats/health`);
    return response.json();
  }
}

export default new StatsService();

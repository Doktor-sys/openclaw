import axios from 'axios';

const API_BASE = 'http://localhost:3002/api';

class AuthService {
  static async login(username, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password
    });
    return response.data;
  }

  static async register(username, email, password) {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      username,
      email,
      password
    });
    return response.data;
  }

  static async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  static setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default AuthService;
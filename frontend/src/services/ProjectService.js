import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3002/api'

class ProjectService {
  async getProjects() {
    const response = await fetch(`${API_URL}/projects`)
    return response.json()
  }

  async getProject(id) {
    const response = await fetch(`${API_URL}/projects/${id}`)
    return response.json()
  }

  async createProject(data) {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async updateProject(id, data) {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async deleteProject(id) {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  async getStats() {
    const response = await fetch(`${API_URL}/projects/stats`)
    return response.json()
  }
}

export default new ProjectService()
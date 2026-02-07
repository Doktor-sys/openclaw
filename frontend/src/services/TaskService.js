import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3002/api'

class TaskService {
  async getTasks(projectId = null) {
    const url = projectId 
      ? `${API_URL}/projects/tasks?project_id=${projectId}`
      : `${API_URL}/projects/tasks`
    const response = await fetch(url)
    return response.json()
  }

  async getTask(id) {
    const response = await fetch(`${API_URL}/projects/tasks/${id}`)
    return response.json()
  }

  async createTask(data) {
    const response = await fetch(`${API_URL}/projects/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async updateTask(id, data) {
    const response = await fetch(`${API_URL}/projects/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async deleteTask(id) {
    const response = await fetch(`${API_URL}/projects/tasks/${id}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  async bulkUpdate(taskIds, updates) {
    const response = await fetch(`${API_URL}/projects/tasks/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_ids: taskIds, updates })
    })
    return response.json()
  }
}

export default new TaskService()
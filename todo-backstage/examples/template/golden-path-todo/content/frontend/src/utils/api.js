import axios from 'axios'
import xrayContext from './xray.js'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add X-Ray trace context to all requests
  xrayContext.addTraceToRequest(config)
  
  return config
})

// Prevent redirect loops by tracking redirect state
let isRedirecting = false

api.interceptors.response.use(
  (response) => {
    // Extract trace context from backend response to continue trace
    xrayContext.extractTraceFromResponse(response)
    return response.data
  },
  (error) => {
    // Extract trace context even from error responses
    if (error?.response) {
      xrayContext.extractTraceFromResponse(error.response)
    }
    if (error?.response?.status === 401) {
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('user')
      // Only redirect if we're not already redirecting and not already on login page
      if (!isRedirecting && window.location.pathname !== '/login' && !window.location.pathname.includes('/login')) {
        isRedirecting = true
        // Use setTimeout to prevent multiple rapid redirects
        setTimeout(() => {
          window.location.replace('/login')
          // Reset flag after redirect completes
          setTimeout(() => { isRedirecting = false }, 1000)
        }, 100)
      }
    }
    const message = error?.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export const authAPI = {
  register: (username, email, password, firstName, lastName) =>
    api.post('/auth/register', { username, email, password, firstName, lastName }),
  login: (emailOrUsername, password) => api.post('/auth/login', { emailOrUsername, password })
}

export const todoAPI = {
  getTodos: (filter = 'all', options = {}) => api.get(`/todos`, { params: { filter, ...options } }),
  createTodo: (todoData) =>
    api.post('/todos', todoData).then((data) => ({ todo: data?.todo ?? data })),
  updateTodo: (id, updates) => api.put(`/todos/${id}`, updates).then((data) => ({ todo: data?.todo ?? data })),
  deleteTodo: (id) => api.delete(`/todos/${id}`),

  // Enhanced endpoints
  getStatistics: () => api.get('/todos/statistics'),
  getOverdueTodos: () => api.get('/todos/overdue'),
  getUpcomingTodos: (days = 7) => api.get('/todos/upcoming', { params: { days } }),

  // Subtask management
  addSubtask: (todoId, title) => api.post(`/todos/${todoId}/subtasks`, { title }),
  updateSubtask: (todoId, subtaskId, completed) => api.put(`/todos/${todoId}/subtasks/${subtaskId}`, { completed }),
  deleteSubtask: (todoId, subtaskId) => api.delete(`/todos/${todoId}/subtasks/${subtaskId}`)
}

export default api



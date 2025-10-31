import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
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



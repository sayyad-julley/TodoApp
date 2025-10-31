import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  List,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Checkbox,
  Segmented,
  Spin,
  Select,
  DatePicker,
  Tag,
  Badge,
  Dropdown,
  Modal,
  Form,
  App as AntApp
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  MoreOutlined,
  CalendarOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { todoAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const EnhancedTodoList = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState(null)
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState(null)
  const [subtasksModal, setSubtasksModal] = useState({ visible: false, todo: null })
  const [loadingAction, setLoadingAction] = useState(null)

  const { loading: authLoading, token, getDisplayName } = useAuth()
  const { message } = AntApp.useApp()

  // Normalize todo data from API
  const normalizeTodo = useCallback((t) => {
    if (!t) return t
    return {
      ...t,
      completed: !!t.completed,
      title: t.title || (t.text || ''),
      priority: t.priority || 'medium',
      tags: t.tags || [],
      category: t.category || 'general',
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      subtasks: t.subtasks || [],
      isOverdue: t.isOverdue,
      subtaskProgress: t.subtaskProgress || 0
    }
  }, [])

  // Fetch todos
  const fetchTodos = async () => {
    setLoading(true)
    try {
      const options = {
        priority: selectedPriority || undefined,
        category: selectedCategory || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }
      const data = await todoAPI.getTodos(filter, options)
      const list = Array.isArray(data?.todos) ? data.todos : []
      setTodos(list.filter(Boolean).map(normalizeTodo))
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const data = await todoAPI.getStatistics()
      // Ensure we have the statistics object with proper structure
      if (data && data.statistics) {
        setStatistics(data.statistics)
      } else if (data) {
        // Sometimes the API might return statistics directly
        setStatistics(data)
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
      // Don't set statistics to null on error, keep previous value
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchTodos()
      fetchStatistics()
    }
  }, [filter, selectedPriority, selectedCategory, tags, authLoading, token])

  // Filter todos
  const visibleTodos = useMemo(() => {
    if (!Array.isArray(todos)) return []
    if (filter === 'completed') return todos.filter(t => t?.completed)
    if (filter === 'pending') return todos.filter(t => !t?.completed)
    return todos
  }, [todos, filter])

  // Create todo
  const addTodo = async () => {
    if (!newTodo.trim()) return
    setLoadingAction('create')
    try {
      const todoData = {
        title: newTodo.trim(),
        description: '',
        priority: selectedPriority || 'medium',
        category: selectedCategory || 'general',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        dueDate: dueDate ? dueDate.toISOString() : null
      }

      const data = await todoAPI.createTodo(todoData)
      const created = normalizeTodo(data?.todo || null)
      if (!created) throw new Error('Invalid server response')
      setTodos([created, ...todos].filter(Boolean))

      // Reset form
      setNewTodo('')
      setSelectedPriority('')
      setSelectedCategory('')
      setTags('')
      setDueDate(null)

      message.success('Task added')
      fetchStatistics() // Refresh statistics
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoadingAction(null)
    }
  }

  // Toggle todo completion
  const toggleTodo = async (id) => {
    const current = todos.find(t => t.id === id)
    if (!current) return
    const prev = todos
    const optimistic = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTodos(optimistic)
    setLoadingAction(`toggle-${id}`)
    try {
      const data = await todoAPI.updateTodo(id, { completed: !current.completed })
      const updated = normalizeTodo(data?.todo || null)
      if (updated) {
        setTodos(prevList => prevList.map(t => t.id === id ? updated : t))
      }
      fetchStatistics() // Refresh statistics
    } catch (err) {
      message.error(err.message)
      setTodos(prev)
    } finally {
      setLoadingAction(null)
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    const prev = todos
    setTodos(todos.filter(todo => todo.id !== id))
    setLoadingAction(`delete-${id}`)
    try {
      await todoAPI.deleteTodo(id)
      message.success('Task deleted')
      fetchStatistics() // Refresh statistics
    } catch (err) {
      message.error(err.message)
      setTodos(prev)
    } finally {
      setLoadingAction(null)
    }
  }

  // Priority colors
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    }
    return colors[priority] || 'default'
  }

  // Handle subtasks
  const openSubtasksModal = (todo) => {
    setSubtasksModal({ visible: true, todo })
  }

  const closeSubtasksModal = () => {
    setSubtasksModal({ visible: false, todo: null })
  }

  const toggleSubtask = async (todoId, subtaskId) => {
    const todo = subtasksModal.todo
    const subtask = todo.subtasks.find(st => st._id === subtaskId)
    if (!subtask) return

    try {
      await todoAPI.updateSubtask(todoId, subtaskId, !subtask.completed)
      // Re-fetch todos to get updated subtasks
      await fetchTodos()
      message.success('Subtask updated')
    } catch (err) {
      message.error(err.message)
    }
  }

  // Calculate statistics from todos and fetched statistics
  const calculatedStats = useMemo(() => {
    // First, try to use fetched statistics (more accurate, includes all todos)
    // Backend returns: { total, completed, pending, ... }
    if (statistics) {
      const created = statistics.total || 0
      const completed = statistics.completed || 0
      const completionRate = created > 0 ? Math.round((completed / created) * 100) : 0
      return { created, completed, completionRate }
    }
    
    // Fallback: calculate from current todos array (may be filtered, less accurate)
    // This is only used if statistics API hasn't loaded yet
    const allTodos = todos.filter(Boolean)
    const created = allTodos.length
    const completed = allTodos.filter(t => t.completed).length
    const completionRate = created > 0 ? Math.round((completed / created) * 100) : 0
    return { created, completed, completionRate }
  }, [statistics, todos])

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Statistics Header */}
      <Card className="shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700" styles={{ body: { padding: 20 } }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg dark:text-gray-200" />
              <Title level={3} style={{ margin: 0 }} className="dark:text-gray-100">
                {getDisplayName()}'s Tasks
              </Title>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Badge count={calculatedStats.created} showZero color="blue">
                <Text type="secondary">Created</Text>
              </Badge>
              <Badge count={calculatedStats.completed} showZero color="green">
                <Text type="secondary">Completed</Text>
              </Badge>
              <Badge count={calculatedStats.completionRate} showZero color="purple">
                <Text type="secondary">{calculatedStats.completionRate}% Complete</Text>
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Todo List */}
      <Card className="shadow-sm dark:bg-gray-800 dark:border-gray-700" styles={{ body: { padding: 24 } }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={2} style={{ marginBottom: 0 }} className="dark:text-gray-100">Tasks</Title>
          <div className="flex items-center gap-2">
            <Segmented
              value={filter}
              onChange={(val) => setFilter(val)}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' }
              ]}
            />
          </div>
        </div>

        {/* Create Todo Form */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onPressEnter={addTodo}
              size="large"
            />

            <div className="flex flex-wrap gap-2">
              <Select
                placeholder="Priority"
                value={selectedPriority}
                onChange={setSelectedPriority}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>

              <Select
                placeholder="Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="personal">Personal</Option>
                <Option value="work">Work</Option>
                <Option value="shopping">Shopping</Option>
                <Option value="health">Health</Option>
                <Option value="learning">Learning</Option>
              </Select>

              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                style={{ width: 150 }}
              />

              <DatePicker
                placeholder="Due date"
                value={dueDate}
                onChange={setDueDate}
                style={{ width: 120 }}
                allowClear
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addTodo}
                loading={loadingAction === 'create'}
                size="large"
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="w-full flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <List
            rowKey="id"
            dataSource={visibleTodos.filter(Boolean)}
            bordered
            className="bg-white dark:bg-gray-800 dark:border-gray-700"
            renderItem={(todo) => (
              <List.Item
                key={todo.id}
                className={`todo-item ${todo.completed ? 'todo-completed' : ''}`}
                actions={[
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={() => openSubtasksModal(todo)}
                    disabled={todo.subtasks.length === 0}
                  >
                    {todo.subtasks.length > 0 && (
                      <Badge count={todo.subtasks.filter(st => !st.completed).length} size="small" />
                    )}
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo.id)}
                    loading={loadingAction === `delete-${todo.id}`}
                  />
                ]}
              >
                <div className="flex items-center gap-3 w-full">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    disabled={loadingAction === `toggle-${todo.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          opacity: todo.completed ? 0.6 : 1,
                          fontWeight: todo.completed ? 'normal' : '500'
                        }}>
                          {todo.title}
                        </span>
                        <Tag color={getPriorityColor(todo.priority)} size="small">
                          {todo.priority}
                        </Tag>
                        {todo.category && (
                          <Tag color="default" size="small">
                            {todo.category}
                          </Tag>
                        )}
                        {todo.isOverdue && (
                          <Tag color="red" icon={<ExclamationCircleOutlined />} size="small">
                            Overdue
                          </Tag>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {todo.dueDate && (
                          <Tag icon={<CalendarOutlined />} color="default" size="small">
                            {dayjs(todo.dueDate).format('MMM D')}
                          </Tag>
                        )}
                        {todo.tags.length > 0 && (
                          <div className="flex gap-1">
                            {todo.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} icon={<TagOutlined />} size="small">
                                {tag}
                              </Tag>
                            ))}
                            {todo.tags.length > 2 && (
                              <Tag size="small">+{todo.tags.length - 2}</Tag>
                            )}
                          </div>
                        )}
                        {todo.subtaskProgress > 0 && (
                          <Text type="secondary" className="text-xs">
                            {todo.subtaskProgress}% complete
                          </Text>
                        )}
                      </div>
                    </div>
                  </Checkbox>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Subtasks Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span>Subtasks</span>
            <Text type="secondary">({subtasksModal.todo?.title})</Text>
          </div>
        }
        open={subtasksModal.visible}
        onCancel={closeSubtasksModal}
        footer={[
          <Button key="close" onClick={closeSubtasksModal}>
            Close
          </Button>
        ]}
      >
        {subtasksModal.todo && (
          <List
            dataSource={subtasksModal.todo.subtasks}
            renderItem={(subtask) => (
              <List.Item
                key={subtask._id}
                actions={[
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtasksModal.todo.id, subtask._id)}
                  />
                ]}
              >
                <span
                  style={{
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    opacity: subtask.completed ? 0.6 : 1
                  }}
                >
                  {subtask.title}
                </span>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  )
}

export default EnhancedTodoList
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  List,
  Input,
  Button,
  Card,
  Typography,
  Checkbox,
  Segmented,
  Spin,
  Select,
  DatePicker,
  Tag,
  Badge,
  Modal,
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
import { useTheme } from '../contexts/ThemeContext'
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
  const { isDarkMode } = useTheme()
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

  // Fetch todos - wrapped in useCallback to prevent infinite loops
  const fetchTodos = useCallback(async () => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedPriority, selectedCategory, tags, normalizeTodo])

  // Fetch statistics - wrapped in useCallback to prevent infinite loops
  const fetchStatistics = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!authLoading && token) {
      fetchTodos()
      fetchStatistics()
    }
  }, [authLoading, token, fetchTodos, fetchStatistics])

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
        dueDate: dueDate ? dayjs(dueDate).toISOString() : null
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
      <Card className="shadow-sm mb-4 p-4 bg-gray-50 dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-lg" styles={{ body: { padding: 20 } }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg dark:text-blue-400" />
              <Title level={3} style={{ margin: 0 }} className="dark:text-white">
                {getDisplayName()}'s Tasks
              </Title>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Badge count={calculatedStats.created} showZero color="blue" className="dark:[&_.ant-badge-count]:bg-blue-600 dark:[&_.ant-badge-count]:text-white">
                <Text type="secondary" className="dark:text-gray-200">Created</Text>
              </Badge>
              <Badge count={calculatedStats.completed} showZero color="green" className="dark:[&_.ant-badge-count]:bg-green-600 dark:[&_.ant-badge-count]:text-white">
                <Text type="secondary" className="dark:text-gray-200">Completed</Text>
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-200 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                {calculatedStats.completionRate}% Complete
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Todo List */}
      <Card className="shadow-sm bg-white dark:bg-[#1e293b] dark:border dark:border-gray-700 dark:shadow-lg" styles={{ body: { padding: 24 } }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={2} style={{ marginBottom: 0 }} className="dark:text-white">Tasks</Title>
            <div className="flex items-center gap-2">
            <Segmented
              value={filter}
              onChange={(val) => setFilter(val)}
              className="dark:[&_.ant-segmented]:bg-gray-800 dark:[&_.ant-segmented-item]:text-gray-300 dark:[&_.ant-segmented-item-selected]:bg-blue-600 dark:[&_.ant-segmented-item-selected]:text-white dark:[&_.ant-segmented-item:hover]:bg-gray-700"
              options={[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' }
              ]}
            />
          </div>
        </div>

        {/* Create Todo Form */}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-[#0f172a] dark:border dark:border-gray-700 rounded-lg">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onPressEnter={addTodo}
              size="large"
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
            />

            <div className="flex flex-wrap gap-2">
              <Select
                placeholder="Priority"
                value={selectedPriority}
                onChange={setSelectedPriority}
                style={{ width: 120 }}
                allowClear
                className="dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:border-gray-600 dark:[&_.ant-select-selector]:text-gray-100"
                popupClassName="dark:[&_.ant-select-item]:bg-gray-800 dark:[&_.ant-select-item]:text-gray-100 dark:[&_.ant-select-item-option-selected]:bg-gray-700"
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
                className="dark:[&_.ant-select-selector]:bg-gray-800 dark:[&_.ant-select-selector]:border-gray-600 dark:[&_.ant-select-selector]:text-gray-100"
                popupClassName="dark:[&_.ant-select-item]:bg-gray-800 dark:[&_.ant-select-item]:text-gray-100 dark:[&_.ant-select-item-option-selected]:bg-gray-700"
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
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
              />

              <DatePicker
                placeholder="Due date"
                value={dueDate}
                onChange={setDueDate}
                style={{ width: 120 }}
                allowClear
                className="dark:[&_.ant-picker-input]:bg-gray-800 dark:[&_input]:text-gray-100 dark:[&_input]:placeholder:text-gray-400"
                popupClassName="dark:[&_.ant-picker-dropdown]:bg-gray-800"
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
            <Spin size="large" className="dark:[&_.ant-spin-dot-item]:bg-blue-400" />
          </div>
        ) : (
          <List
            rowKey="id"
            dataSource={visibleTodos.filter(Boolean)}
            bordered={false}
            className="bg-transparent dark:bg-transparent"
            renderItem={(todo) => (
              <List.Item
                key={todo.id}
                className={`todo-item bg-white dark:!bg-[#0f172a] dark:!border-gray-700 dark:hover:!bg-[#1e293b] border border-gray-200 dark:border-gray-700 mb-2 rounded-lg transition-colors ${todo.completed ? 'todo-completed' : ''}`}
                actions={[
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    onClick={() => openSubtasksModal(todo)}
                    disabled={todo.subtasks.length === 0}
                    className="dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-700"
                  >
                    {todo.subtasks.length > 0 && (
                      <Badge count={todo.subtasks.filter(st => !st.completed).length} size="small" className="dark:[&_.ant-badge-count]:bg-blue-600 dark:[&_.ant-badge-count]:text-white" />
                    )}
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo.id)}
                    loading={loadingAction === `delete-${todo.id}`}
                    className="dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  />
                ]}
              >
                <div className="flex items-center gap-3 w-full">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    disabled={loadingAction === `toggle-${todo.id}`}
                    className="dark:[&_.ant-checkbox-inner]:bg-gray-700 dark:[&_.ant-checkbox-inner]:border-gray-500 dark:[&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-blue-600 dark:[&_.ant-checkbox-checked_.ant-checkbox-inner]:border-blue-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-gray-900 dark:!text-white todo-title-text" 
                          style={{
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            opacity: todo.completed ? 0.6 : 1,
                            fontWeight: todo.completed ? 'normal' : '500',
                            color: isDarkMode ? '#ffffff' : undefined
                          }}
                        >
                          {todo.title}
                        </span>
                        <Tag color={getPriorityColor(todo.priority)} size="small" className="dark:border-0">
                          {todo.priority}
                        </Tag>
                        {todo.category && (
                          <Tag color="default" size="small" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            {todo.category}
                          </Tag>
                        )}
                        {todo.isOverdue && (
                          <Tag color="red" icon={<ExclamationCircleOutlined />} size="small" className="dark:border-0">
                            Overdue
                          </Tag>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {todo.dueDate && (
                          <Tag icon={<CalendarOutlined className="dark:text-gray-300" />} color="default" size="small" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            {dayjs(todo.dueDate).format('MMM D')}
                          </Tag>
                        )}
                        {todo.tags.length > 0 && (
                          <div className="flex gap-1">
                            {todo.tags.slice(0, 2).map(tag => (
                              <Tag key={tag} icon={<TagOutlined className="dark:text-gray-300" />} size="small" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                {tag}
                              </Tag>
                            ))}
                            {todo.tags.length > 2 && (
                              <Tag size="small" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">+{todo.tags.length - 2}</Tag>
                            )}
                          </div>
                        )}
                        {todo.subtaskProgress > 0 && (
                          <Text type="secondary" className="text-xs dark:text-gray-400">
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
            <span className="dark:text-gray-50">Subtasks</span>
            <Text type="secondary" className="dark:text-gray-400">({subtasksModal.todo?.title})</Text>
          </div>
        }
        open={subtasksModal.visible}
        onCancel={closeSubtasksModal}
        className="dark:[&_.ant-modal-content]:bg-[#1e293b] dark:[&_.ant-modal-header]:bg-[#1e293b] dark:[&_.ant-modal-header]:border-gray-700 dark:[&_.ant-modal-title]:text-gray-50 dark:[&_.ant-modal-body]:text-gray-100"
        footer={[
          <Button key="close" onClick={closeSubtasksModal} className="dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700">
            Close
          </Button>
        ]}
      >
        {subtasksModal.todo && (
          <List
            className="dark:bg-[#1e293b]"
            dataSource={subtasksModal.todo.subtasks}
            renderItem={(subtask) => (
              <List.Item
                key={subtask._id}
                className="dark:bg-[#1e293b] dark:border-gray-700 dark:hover:bg-[#334155]"
                actions={[
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtasksModal.todo.id, subtask._id)}
                    className="dark:[&_.ant-checkbox-inner]:bg-gray-700 dark:[&_.ant-checkbox-inner]:border-gray-500 dark:[&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-blue-600 dark:[&_.ant-checkbox-checked_.ant-checkbox-inner]:border-blue-600 dark:[&_span]:text-gray-100"
                  />
                ]}
              >
                <span
                  className="dark:text-gray-100"
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
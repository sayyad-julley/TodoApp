import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { List, Input, Button, Card, Typography, Space, Checkbox, Segmented, Spin, App as AntApp } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { todoAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const { Title } = Typography

const TodoList = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const { loading: authLoading, token } = useAuth()
  const { message } = AntApp.useApp()

  const normalizeTodo = useCallback((t) => {
    if (!t) return t
    let completed = !!t.completed
    if (typeof t.completed === 'string') {
      const lowered = t.completed.toLowerCase()
      if (lowered === 'true') completed = true
      else if (lowered === 'false') completed = false
    }
    const title = typeof t.title === 'string' ? t.title : (t.text || '')
    return { ...t, title, completed }
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const data = await todoAPI.getTodos(filter)
      const list = Array.isArray(data?.todos) ? data.todos : []
      setTodos(list.filter(Boolean).map(normalizeTodo))
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      fetchTodos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, authLoading, token])

  const visibleTodos = useMemo(() => {
    if (!Array.isArray(todos)) return []
    if (filter === 'completed') return todos.filter(t => t?.completed)
    if (filter === 'pending') return todos.filter(t => !t?.completed)
    return todos
  }, [todos, filter])

  const addTodo = async () => {
    if (!newTodo.trim()) return
    try {
      const data = await todoAPI.createTodo(newTodo, '')
      const created = normalizeTodo(data?.todo || null)
      if (!created) throw new Error('Invalid server response')
      setTodos([created, ...todos].filter(Boolean))
      setNewTodo('')
      message.success('Task added')
    } catch (err) {
      message.error(err.message)
    }
  }

  const toggleTodo = async (id) => {
    const current = todos.find(t => t.id === id)
    if (!current) return
    const prev = todos
    const optimistic = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    setTodos(optimistic)
    try {
      const data = await todoAPI.updateTodo(id, { completed: !current.completed })
      const updated = normalizeTodo(data?.todo || null)
      if (updated) {
        setTodos(prevList => prevList.map(t => t.id === id ? updated : t))
      }
    } catch (err) {
      message.error(err.message)
      setTodos(prev)
    }
  }

  const deleteTodo = async (id) => {
    const prev = todos
    setTodos(todos.filter(todo => todo.id !== id))
    try {
      await todoAPI.deleteTodo(id)
      message.success('Task deleted')
    } catch (err) {
      message.error(err.message)
      setTodos(prev)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm" styles={{ body: { padding: 24 } }}>
        <div className="flex items-center justify-between mb-4">
          <Title level={2} style={{ marginBottom: 0 }}>Tasks</Title>
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

        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="Add a new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onPressEnter={addTodo}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={addTodo}>
            Add
          </Button>
        </Space.Compact>

        {loading ? (
          <div className="w-full flex items-center justify-center py-12">
            <Spin />
          </div>
        ) : (
          <List
            rowKey="id"
            dataSource={visibleTodos.filter(Boolean)}
            bordered
            className="bg-white"
            renderItem={(todo) => (
              <List.Item
                key={todo.id}
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo.id)}
                  />
                ]}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                >
                  <span style={{ 
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1
                  }}>
                    {todo.title}
                  </span>
                </Checkbox>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default TodoList

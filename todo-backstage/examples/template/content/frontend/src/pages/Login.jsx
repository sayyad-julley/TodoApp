import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, App as AntApp } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../utils/api'

const { Title, Text } = Typography

const Login = () => {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { message } = AntApp.useApp()

  const onFinish = async (values) => {
    setSubmitting(true)
    try {
      const data = await authAPI.login(values.emailOrUsername, values.password)
      login(data.token, data.user)
      message.success(`Welcome back, ${data.user.firstName || data.user.username}!`)
      window.location.replace('/')
    } catch (err) {
      message.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm shadow-sm dark:bg-[#1e293b] dark:border-gray-700 dark:shadow-lg">
        <Title level={3} style={{ textAlign: 'center', marginBottom: 16 }} className="dark:text-gray-50">Sign in</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label={<span className="dark:text-gray-200">Email or Username</span>} 
            name="emailOrUsername" 
            rules={[{ required: true, message: 'Email or username is required' }]}
          >
            <Input 
              placeholder="you@example.com or username" 
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
            />
          </Form.Item>
          <Form.Item 
            label={<span className="dark:text-gray-200">Password</span>} 
            name="password" 
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password 
              placeholder="Your password" 
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Sign in
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="dark:text-gray-400">
          Don't have an account? <Link to="/register" className="dark:text-blue-400 hover:dark:text-blue-300">Create one</Link>
        </Text>
      </Card>
    </div>
  )
}

export default Login



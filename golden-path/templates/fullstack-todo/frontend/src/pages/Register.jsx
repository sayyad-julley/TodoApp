import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, App as AntApp } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../utils/api'

const { Title, Text } = Typography

const Register = () => {
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()
  const { message } = AntApp.useApp()

  const onFinish = async (values) => {
    setSubmitting(true)
    try {
      const data = await authAPI.register(
        values.username,
        values.email,
        values.password,
        values.firstName,
        values.lastName
      )
      register(data.token, data.user)
      message.success(`Welcome to the app, ${data.user.firstName || data.user.username}!`)
      window.location.replace('/')
    } catch (err) {
      message.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <Title level={3} style={{ textAlign: 'center', marginBottom: 16 }} className="dark:text-gray-100">Create account</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }, { min: 3, message: 'Minimum 3 characters' }]}>
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}>
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'First name is required' }]}>
            <Input placeholder="Your first name" />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName">
            <Input placeholder="Your last name (optional)" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Minimum 6 characters' }]} hasFeedback>
            <Input.Password placeholder="Create a password" />
          </Form.Item>
          <Form.Item label="Confirm password" name="confirm" dependencies={["password"]} hasFeedback rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              }
            })
          ]}>
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Create account
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="dark:text-gray-400">
          Already have an account? <Link to="/login" className="dark:text-blue-400">Sign in</Link>
        </Text>
      </Card>
    </div>
  )
}

export default Register



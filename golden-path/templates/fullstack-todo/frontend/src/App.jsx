import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Layout, theme, App as AntApp } from 'antd'
import EnhancedTodoList from './components/EnhancedTodoList'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function HeaderRight() {
  const { isAuthenticated, logout, getDisplayName } = useAuth()
  if (!isAuthenticated) return null
  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-sm text-gray-600">{getDisplayName()}</span>
      <button className="text-sm text-blue-600" onClick={logout}>Logout</button>
    </div>
  )
}

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        }
      }}
    >
      <AuthProvider>
        <AntApp>
          <Router>
            <Layout className="min-h-screen bg-gray-50">
            <Layout.Header className="bg-white shadow-sm border-b px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex items-center h-16 w-full">
                <h1 className="text-xl font-semibold text-gray-900">To‑Do App</h1>
                <HeaderRight />
              </div>
            </Layout.Header>

              <Layout.Content className="max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><EnhancedTodoList /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout.Content>
            </Layout>
          </Router>
        </AntApp>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App

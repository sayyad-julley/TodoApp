import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Layout, theme, App as AntApp, Button } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import EnhancedTodoList from './components/EnhancedTodoList'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import './App.css'

function HeaderRight() {
  const { isAuthenticated, logout, getDisplayName } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  
  return (
    <div className="ml-auto flex items-center gap-3">
      <Button
        type="text"
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        className="flex items-center justify-center"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      />
      {isAuthenticated && (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-300">{getDisplayName()}</span>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={logout}>Logout</button>
        </>
      )}
    </div>
  )
}

function AppContent() {
  const { isDarkMode } = useTheme()
  
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        }
      }}
    >
      <AuthProvider>
        <AntApp>
          <Router>
            <Layout className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Layout.Header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
              <div className="max-w-7xl mx-auto flex items-center h-16 w-full">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">To‑Do App</h1>
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App

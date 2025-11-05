import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = window.localStorage.getItem('token')
      const savedUserRaw = window.localStorage.getItem('user')

      if (savedToken) {
        setToken(savedToken)
      }

      if (savedUserRaw) {
        try {
          const parsed = JSON.parse(savedUserRaw)
          if (parsed && typeof parsed === 'object') {
            setUser(parsed)
          }
        } catch {
          // Clean up bad persisted value (e.g., string "undefined")
          window.localStorage.removeItem('user')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (newToken, newUser) => {
    window.localStorage.setItem('token', newToken)
    window.localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const register = (newToken, newUser) => {
    login(newToken, newUser)
  }

  const logout = () => {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
    // Helper functions
    getDisplayName: () => {
      if (!user) return '';
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.username || '';
    },
    getUserStats: () => user?.statistics || { todosCreated: 0, todosCompleted: 0 },
    getCompletionRate: () => {
      const stats = user?.statistics || {};
      if (stats.todosCreated === 0) return 0;
      return Math.round((stats.todosCompleted / stats.todosCreated) * 100);
    }
  }), [user, token, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}



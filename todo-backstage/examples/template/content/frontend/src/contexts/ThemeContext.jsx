import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(undefined)

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      return saved === 'dark'
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true
    }
    return false
  })

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    
    // Update document class for Tailwind dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const saved = localStorage.getItem('theme')
      if (!saved) {
        setIsDarkMode(e.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }), [isDarkMode])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


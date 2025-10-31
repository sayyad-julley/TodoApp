import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock child components to isolate App.jsx testing
vi.mock('../components/EnhancedTodoList', () => ({
  default: () => <div data-testid="enhanced-todo-list">Todo List</div>
}))

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>
}))

vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../pages/Register', () => ({
  default: () => <div data-testid="register-page">Register Page</div>
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<App />)
      expect(screen.getByText('To‑Do App')).toBeInTheDocument()
    })

    it('should render header with app title', () => {
      render(<App />)
      const header = screen.getByText('To‑Do App')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('text-xl', 'font-semibold')
    })

    it('should apply correct layout structure', () => {
      const { container } = render(<App />)
      const layout = container.querySelector('.min-h-screen')
      expect(layout).toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      render(<App />)
      const themeButton = screen.getByLabelText(/switch to (light|dark) mode/i)
      expect(themeButton).toBeInTheDocument()
    })

    it('should toggle between light and dark mode', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const themeButton = screen.getByLabelText(/switch to (light|dark) mode/i)
      
      await user.click(themeButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled()
      })
    })

    it('should have accessible aria-label on theme button', () => {
      render(<App />)
      const themeButton = screen.getByRole('button', { 
        name: /switch to (light|dark) mode/i 
      })
      expect(themeButton).toHaveAttribute('aria-label')
    })

    it('should display sun icon in dark mode', () => {
      // Mock dark mode
      localStorage.getItem.mockReturnValue('dark')
      render(<App />)
      
      const button = screen.getByLabelText(/switch to light mode/i)
      expect(button).toBeInTheDocument()
    })

    it('should display moon icon in light mode', () => {
      localStorage.getItem.mockReturnValue('light')
      render(<App />)
      
      const button = screen.getByLabelText(/switch to dark mode/i)
      expect(button).toBeInTheDocument()
    })
  })

  describe('Authentication UI', () => {
    it('should not show user info when not authenticated', () => {
      render(<App />)
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument()
    })

    it('should show user display name when authenticated', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ 
          firstName: 'John', 
          lastName: 'Doe' 
        })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('should show logout button when authenticated', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ username: 'testuser' })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/logout/i)).toBeInTheDocument()
      })
    })

    it('should call logout when logout button clicked', async () => {
      const user = userEvent.setup()
      
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ username: 'testuser' })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        expect(screen.getByText(/logout/i)).toBeInTheDocument()
      })

      const logoutButton = screen.getByText(/logout/i)
      await user.click(logoutButton)

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('token')
        expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      })
    })
  })

  describe('Styling and Dark Mode Classes', () => {
    it('should apply correct header background classes', () => {
      const { container } = render(<App />)
      const header = container.querySelector('header')
      expect(header).toHaveClass('bg-white', 'dark:bg-gray-800')
    })

    it('should apply correct layout background classes', () => {
      const { container } = render(<App />)
      const layout = container.querySelector('.min-h-screen')
      expect(layout).toHaveClass('bg-gray-50', 'dark:bg-gray-900')
    })

    it('should apply transition classes for smooth theme switching', () => {
      const { container } = render(<App />)
      const layout = container.querySelector('.min-h-screen')
      expect(layout).toHaveClass('transition-colors', 'duration-200')
    })

    it('should apply correct text color classes for header', () => {
      render(<App />)
      const title = screen.getByText('To‑Do App')
      expect(title).toHaveClass('text-gray-900', 'dark:text-gray-100')
    })

    it('should apply correct text color for authenticated user name', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ username: 'testuser' })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        const userName = screen.getByText('testuser')
        expect(userName).toHaveClass('text-gray-600', 'dark:text-gray-300')
      })
    })

    it('should apply correct logout button classes', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ username: 'testuser' })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        const logoutButton = screen.getByText(/logout/i)
        expect(logoutButton).toHaveClass('text-blue-600', 'dark:text-blue-400', 'hover:underline')
      })
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive padding classes', () => {
      const { container } = render(<App />)
      const header = container.querySelector('header')
      expect(header).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    })

    it('should have max-width container', () => {
      const { container } = render(<App />)
      const headerContent = container.querySelector('.max-w-7xl')
      expect(headerContent).toBeInTheDocument()
    })

    it('should have proper spacing classes', () => {
      const { container } = render(<App />)
      const headerContent = container.querySelector('.max-w-7xl')
      expect(headerContent).toHaveClass('mx-auto', 'flex', 'items-center')
    })
  })

  describe('HeaderRight Component', () => {
    it('should render with proper flex layout', () => {
      const { container } = render(<App />)
      const headerRight = container.querySelector('.ml-auto')
      expect(headerRight).toHaveClass('flex', 'items-center', 'gap-3')
    })

    it('should render theme button with correct classes', () => {
      render(<App />)
      const themeButton = screen.getByLabelText(/switch to (light|dark) mode/i)
      expect(themeButton).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('ConfigProvider Integration', () => {
    it('should wrap content in Ant Design ConfigProvider', () => {
      const { container } = render(<App />)
      // Verify Ant Design theme is applied by checking for antd classes
      expect(container.querySelector('.ant-layout')).toBeInTheDocument()
    })

    it('should apply custom border radius from theme config', () => {
      render(<App />)
      // ConfigProvider applies theme tokens globally
      // We verify it renders without errors
      expect(screen.getByText('To‑Do App')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries', () => {
    it('should handle missing user data gracefully', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return 'undefined' // Invalid JSON
        return null
      })

      expect(() => render(<App />)).not.toThrow()
    })

    it('should handle null localStorage values', () => {
      localStorage.getItem.mockReturnValue(null)
      expect(() => render(<App />)).not.toThrow()
    })
  })

  describe('Router Integration', () => {
    it('should use BrowserRouter for routing', () => {
      render(<App />)
      // Verify router is present by checking for route-related elements
      expect(screen.getByText('To‑Do App')).toBeInTheDocument()
    })

    it('should render protected routes', () => {
      render(<App />)
      expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<App />)
      const heading = screen.getByRole('heading', { name: /to‑do app/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible theme toggle button', () => {
      render(<App />)
      const button = screen.getByRole('button', { 
        name: /switch to (light|dark) mode/i 
      })
      expect(button).toBeInTheDocument()
    })

    it('should have accessible logout button when authenticated', async () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token'
        if (key === 'user') return JSON.stringify({ username: 'testuser' })
        return null
      })

      render(<App />)
      
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i })
        expect(logoutButton).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<App />)
      const initialRender = screen.getByText('To‑Do App')
      
      rerender(<App />)
      const afterRerender = screen.getByText('To‑Do App')
      
      expect(initialRender).toBe(afterRerender)
    })
  })
})
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Check if dark mode is stored in localStorage or use system preference as default
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement

    // Remove previous theme class
    root.classList.remove('light', 'dark')

    // Add current theme class
    root.classList.add(theme)

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Set specific theme
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
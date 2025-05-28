import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const userData = await authService.validateToken(token)
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('authToken')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      if (response.success) {
        setUser(response.user)
        localStorage.setItem('authToken', response.token)
        
        if (rememberMe) {
          localStorage.setItem('rememberUser', email)
        } else {
          localStorage.removeItem('rememberUser')
        }
        
        // Log the login action
        await authService.logAction('LOGIN', `User ${email} logged in`)
        
        toast.success('Login realizado com sucesso!')
        return { success: true }
      } else {
        toast.error(response.message || 'Credenciais inválidas')
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Erro ao fazer login. Tente novamente.')
      return { success: false, message: 'Erro interno do servidor' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logAction('LOGOUT', `User ${user?.email} logged out`)
      setUser(null)
      localStorage.removeItem('authToken')
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const resetPassword = async (email) => {
    try {
      const response = await authService.resetPassword(email)
      if (response.success) {
        toast.success('E-mail de recuperação enviado!')
        return { success: true }
      } else {
        toast.error(response.message || 'Erro ao enviar e-mail')
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Erro ao enviar e-mail de recuperação')
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      if (response.success) {
        setUser(response.user)
        toast.success('Perfil atualizado com sucesso!')
        return { success: true }
      } else {
        toast.error(response.message || 'Erro ao atualizar perfil')
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Erro ao atualizar perfil')
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission) || user.role === 'admin'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    resetPassword,
    updateProfile,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
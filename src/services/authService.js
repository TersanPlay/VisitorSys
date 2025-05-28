import { apiClient } from './apiClient'
import CryptoJS from 'crypto-js'

class AuthService {
  constructor() {
    this.baseURL = '/api/auth'
    this.secretKey = 'visitor-system-secret-key' // In production, use environment variable
  }

  // Encrypt sensitive data
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString()
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey)
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Decryption error:', error)
      return null
    }
  }

  // Mock login function (replace with real API call)
  async login(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user database
      const mockUsers = [
        {
          id: 1,
          email: 'admin@sistema.com',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin',
          permissions: ['all']
        },
        {
          id: 2,
          email: 'recepcao@sistema.com',
          password: 'recepcao123',
          name: 'Recepcionista',
          role: 'receptionist',
          permissions: ['visitor_register', 'visitor_entry', 'visitor_list']
        },
        {
          id: 3,
          email: 'gestor@sistema.com',
          password: 'gestor123',
          name: 'Gestor',
          role: 'manager',
          permissions: ['visitor_register', 'visitor_entry', 'visitor_list', 'reports']
        }
      ]

      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user
        const token = this.generateToken(userWithoutPassword)
        
        return {
          success: true,
          user: userWithoutPassword,
          token
        }
      } else {
        return {
          success: false,
          message: 'E-mail ou senha inválidos'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Erro interno do servidor')
    }
  }

  // Generate JWT-like token (mock)
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    return this.encrypt(payload)
  }

  // Validate token
  async validateToken(token) {
    try {
      const payload = this.decrypt(token)
      
      if (!payload || payload.exp < Date.now()) {
        throw new Error('Token expired')
      }

      // Mock user lookup
      const mockUsers = [
        {
          id: 1,
          email: 'admin@sistema.com',
          name: 'Administrador',
          role: 'admin',
          permissions: ['all']
        },
        {
          id: 2,
          email: 'recepcao@sistema.com',
          name: 'Recepcionista',
          role: 'receptionist',
          permissions: ['visitor_register', 'visitor_entry', 'visitor_list']
        },
        {
          id: 3,
          email: 'gestor@sistema.com',
          name: 'Gestor',
          role: 'manager',
          permissions: ['visitor_register', 'visitor_entry', 'visitor_list', 'reports']
        }
      ]

      const user = mockUsers.find(u => u.id === payload.userId)
      return user
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock email validation
      const validEmails = ['admin@sistema.com', 'recepcao@sistema.com', 'gestor@sistema.com']
      
      if (validEmails.includes(email)) {
        // In real implementation, send email here
        console.log(`Password reset email sent to: ${email}`)
        return {
          success: true,
          message: 'E-mail de recuperação enviado com sucesso'
        }
      } else {
        return {
          success: false,
          message: 'E-mail não encontrado no sistema'
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error('Erro interno do servidor')
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock profile update
      return {
        success: true,
        user: {
          ...profileData,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error('Erro interno do servidor')
    }
  }

  // Log user actions for audit
  async logAction(action, description, metadata = {}) {
    try {
      const logEntry = {
        action,
        description,
        metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'localhost' // In real implementation, get from server
      }
      
      // Store in localStorage for demo (use real database in production)
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('auditLogs', JSON.stringify(logs.slice(-1000))) // Keep last 1000 logs
      
      console.log('Action logged:', logEntry)
    } catch (error) {
      console.error('Log action error:', error)
    }
  }

  // Get audit logs
  async getAuditLogs(filters = {}) {
    try {
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
      
      // Apply filters
      let filteredLogs = logs
      
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= new Date(filters.startDate)
        )
      }
      
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= new Date(filters.endDate)
        )
      }
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action.toLowerCase())
        )
      }
      
      return filteredLogs.reverse() // Most recent first
    } catch (error) {
      console.error('Get audit logs error:', error)
      return []
    }
  }
}

export const authService = new AuthService()
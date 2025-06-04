import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  Shield
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Login = () => {
  const { user, login, loading: authLoading } = useAuth()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Redirect if already authenticated
  if (user && !authLoading) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const result = await login(formData.email, formData.password, formData.rememberMe)
      
      if (result.success) {
        // A notificação de sucesso já é tratada no AuthContext
        // const from = location.state?.from?.pathname || '/dashboard'
        // toast.success('Login realizado com sucesso!')
        // A navegação será tratada pelo AuthContext e pelo redirecionamento no topo do componente
      } else {
        // A notificação de erro já é tratada no AuthContext
        // toast.error(result.message || 'Erro ao fazer login')
      }
    } catch (error) {
      console.error('Login error:', error)
      // A notificação de erro genérico já é tratada no AuthContext
      // toast.error(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@sistema.com', password: 'admin123' },
    { role: 'Recepcionista', email: 'recepcao@sistema.com', password: 'recepcao123' },
    { role: 'Gestor', email: 'gestor@sistema.com', password: 'gestor123' }
  ]

  const fillDemoCredentials = (email, password) => {
    setFormData(prev => ({
      ...prev,
      email,
      password
    }))
    setErrors({})
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Verificando autenticação..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sistema de Visitantes
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Credenciais de Demonstração</span>
          </div>
          <div className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                type="button"
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                className="w-full text-left text-xs bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium text-blue-800">{cred.role}:</span>
                <span className="text-blue-600 ml-1">{cred.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Digite seu email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Lembrar de mim
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Lock className="h-5 w-5 text-primary-500 group-hover:text-primary-400 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema de Registro de Visitantes v1.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Desenvolvido com React + Vite
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
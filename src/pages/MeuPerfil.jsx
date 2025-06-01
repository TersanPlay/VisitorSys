import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-hot-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Camera,
  Save,
  X,
  Edit3,
  Key,
  Bell,
  Globe,
  Clock,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  Briefcase,
  Building,
  Users,
  Monitor,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/UI/card'
import { Input } from '../components/UI/input'

const MeuPerfil = () => {
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme, setThemeMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('perfil')
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    bio: '',
    avatar: null
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: 'pt-BR',
    theme: 'light',
    accessibility: {
      highContrast: false,
      largeText: false
    }
  })
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90
  })

  // Mock activity logs
  const [activityLogs] = useState([
    {
      id: 1,
      action: 'LOGIN',
      description: 'Login realizado com sucesso',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      ip: '192.168.1.1',
      device: 'Chrome em Windows'
    },
    {
      id: 2,
      action: 'PROFILE_UPDATE',
      description: 'Perfil atualizado',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      ip: '192.168.1.1',
      device: 'Chrome em Windows'
    },
    {
      id: 3,
      action: 'PASSWORD_CHANGE',
      description: 'Senha alterada',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      ip: '192.168.1.1',
      device: 'Firefox em Windows'
    },
    {
      id: 4,
      action: 'LOGIN',
      description: 'Login realizado com sucesso',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      ip: '192.168.1.1',
      device: 'Chrome em Windows'
    },
    {
      id: 5,
      action: 'LOGOUT',
      description: 'Logout realizado',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      ip: '192.168.1.1',
      device: 'Chrome em Windows'
    }
  ])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        position: user.position || '',
        bio: user.bio || '',
        avatar: user.avatar || null
      })
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? true,
        language: user.preferences?.language || 'pt-BR',
        theme: user.preferences?.theme || theme,
        accessibility: user.preferences?.accessibility || {
          highContrast: false,
          largeText: false
        }
      })
      setSecuritySettings({
        twoFactorAuth: user.securitySettings?.twoFactorAuth || false,
        sessionTimeout: user.securitySettings?.sessionTimeout || 30,
        passwordExpiry: user.securitySettings?.passwordExpiry || 90
      })
    }
  }, [user, theme])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [field]: value
      }

      // Atualizar tema do sistema quando a preferência de tema mudar
      if (field === 'theme') {
        setThemeMode(value)
      }

      return newPreferences
    })
  }

  const handleAccessibilityChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [field]: value
      }
    }))
  }

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange('avatar', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await updateProfile({
        ...formData,
        preferences,
        securitySettings
      })
      setEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setLoading(true)
      // Mock password change - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Senha alterada com sucesso!')
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: user.department || '',
        position: user.position || '',
        bio: user.bio || '',
        avatar: user.avatar || null
      })
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        pushNotifications: user.preferences?.pushNotifications ?? true,
        language: user.preferences?.language || 'pt-BR',
        theme: user.preferences?.theme || theme,
        accessibility: user.preferences?.accessibility || {
          highContrast: false,
          largeText: false
        }
      })
    }
  }

  const handleSaveSecuritySettings = async () => {
    try {
      setLoading(true)
      // Mock security settings update - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações de segurança atualizadas com sucesso!')
      setShowSecurityModal(false)
    } catch (error) {
      console.error('Error updating security settings:', error)
      toast.error('Erro ao atualizar configurações de segurança')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'LOGOUT':
        return <LogOut className="h-5 w-5 text-blue-500" />
      case 'PROFILE_UPDATE':
        return <Edit3 className="h-5 w-5 text-yellow-500" />
      case 'PASSWORD_CHANGE':
        return <Key className="h-5 w-5 text-purple-500" />
      case 'SECURITY_CHANGE':
        return <Shield className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando perfil..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e preferências</p>
          </div>
          <div className="flex space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'perfil'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('preferencias')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'preferencias'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Preferências
          </button>
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'seguranca'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Segurança
          </button>
          <button
            onClick={() => setActiveTab('atividade')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'atividade'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Atividade
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - always visible */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-32 w-32 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
                      <Camera className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{user.position || 'Cargo não informado'}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{user.department || 'Departamento não informado'}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                  Membro desde {format(new Date(user.createdAt || new Date()), 'MMMM yyyy', { locale: ptBR })}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Shield className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                  {user.role === 'admin' ? 'Administrador' :
                    user.role === 'manager' ? 'Gestor' :
                      user.role === 'receptionist' ? 'Recepcionista' : 'Usuário'}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - changes based on active tab */}
        <div className="lg:col-span-2 space-y-6">
          {/* Perfil Tab */}
          {activeTab === 'perfil' && (
            <>
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Seus dados pessoais e profissionais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Nome Completo
                      </label>
                      {editing ? (
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </label>
                      {editing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Telefone
                      </label>
                      {editing ? (
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full"
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.phone || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Endereço
                      </label>
                      {editing ? (
                        <Input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full"
                          placeholder="Endereço completo"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.address || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Profissionais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Profissionais</CardTitle>
                  <CardDescription>Seus dados de trabalho e função</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building className="h-4 w-4 inline mr-2" />
                        Departamento
                      </label>
                      {editing ? (
                        <Input
                          type="text"
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.department || 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Cargo
                      </label>
                      {editing ? (
                        <Input
                          type="text"
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100">{user.position || 'Não informado'}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Biografia
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Conte um pouco sobre você..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100">{user.bio || 'Nenhuma biografia adicionada'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Preferências Tab */}
          {activeTab === 'preferencias' && (
            <>
              {/* Notificações */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Configure como deseja receber notificações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificações por Email</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações importantes por email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                          disabled={!editing}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificações Push</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações no navegador</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                          className="sr-only peer"
                          disabled={!editing}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aparência */}
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>Configure a aparência do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {theme === 'dark' ? (
                          <Moon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        ) : (
                          <Sun className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tema</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Escolha entre tema claro ou escuro</p>
                        </div>
                      </div>
                      <select
                        value={preferences.theme}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        disabled={!editing}
                        className="block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Idioma</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Idioma da interface</p>
                        </div>
                      </div>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        disabled={!editing}
                        className="block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800"
                      >
                        <option value="pt-BR">Português</option>
                        <option value="en-US">English</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acessibilidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Acessibilidade</CardTitle>
                  <CardDescription>Opções para melhorar a acessibilidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Monitor className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Alto Contraste</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Aumenta o contraste para melhor visualização</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.accessibility.highContrast}
                          onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                          className="sr-only peer"
                          disabled={!editing}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Monitor className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Texto Grande</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Aumenta o tamanho do texto para melhor leitura</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.accessibility.largeText}
                          onChange={(e) => handleAccessibilityChange('largeText', e.target.checked)}
                          className="sr-only peer"
                          disabled={!editing}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Segurança Tab */}
          {activeTab === 'seguranca' && (
            <>
              {/* Segurança da Conta */}
              <Card>
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription>Configurações para proteger sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Autenticação de Dois Fatores</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Adiciona uma camada extra de segurança</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSecurityModal(true)}
                        className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        Configurar
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Key className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Senha</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Altere sua senha regularmente</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        Alterar
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dispositivos Conectados</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie dispositivos com acesso à sua conta</p>
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissões */}
              <Card>
                <CardHeader>
                  <CardTitle>Permissões</CardTitle>
                  <CardDescription>Suas permissões no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Função</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                        {user.role === 'admin' ? 'Administrador' :
                          user.role === 'manager' ? 'Gestor' :
                            user.role === 'receptionist' ? 'Recepcionista' : 'Usuário'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Permissões Concedidas</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {user.permissions?.map((permission, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {permission === 'all' ? 'Acesso Total' :
                                permission === 'visitor_register' ? 'Registro de Visitantes' :
                                  permission === 'visitor_entry' ? 'Entrada de Visitantes' :
                                    permission === 'visitor_list' ? 'Listagem de Visitantes' :
                                      permission === 'reports' ? 'Relatórios' : permission}
                            </span>
                          </div>
                        )) || (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Nenhuma permissão específica
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Atividade Tab */}
          {activeTab === 'atividade' && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
                <CardDescription>Registro das suas ações recentes no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.description}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-2">{log.device}</span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                  Ver histórico completo
                </button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Alterar Senha</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha Atual
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configurações de Segurança</h3>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Autenticação de Dois Fatores</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Adiciona uma camada extra de segurança</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tempo de Expiração da Sessão (minutos)
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiração de Senha (dias)
                  </label>
                  <Input
                    type="number"
                    min="30"
                    max="180"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSecuritySettings}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeuPerfil
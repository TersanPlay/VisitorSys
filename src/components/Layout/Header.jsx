import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mock notifications (replace with real data)
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'warning',
        title: 'Visitante suspeito detectado',
        message: 'Tentativa de acesso a múltiplos setores',
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: 'Novo visitante registrado',
        message: 'João Silva foi registrado com sucesso',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: 3,
        type: 'success',
        title: 'Backup realizado',
        message: 'Backup automático concluído com sucesso',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        read: true
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  // Mobile menu configuration
  const mobileMenuOpen = isMobileMenuOpen

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`Busca por: ${searchQuery}`)
      // Implement search functionality here
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  const formatNotificationTime = (time) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`
    } else {
      return format(time, 'dd/MM/yyyy', { locale: ptBR })
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onMenuToggle}
          >
            <span className="sr-only">Abrir menu</span>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Page title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Sistema de Registro de Visitantes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar visitantes..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </form>
          </div>

          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificações</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatNotificationTime(notification.time)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Nenhuma notificação</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        Ver todas as notificações
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm dark:text-gray-200">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrador' :
                    user?.role === 'manager' ? 'Gestor' :
                      user?.role === 'receptionist' ? 'Recepcionista' : user?.role}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Configurações
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  LogIn,
  BarChart3,
  Settings,
  Shield,
  Monitor,
  Building2,
  FileText,
  Activity
} from 'lucide-react'

const Sidebar = ({ onNavigate }) => {
  const { user, hasPermission } = useAuth()
  const location = useLocation()
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (itemName) => {
    setOpenSubmenus(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: null // Available to all authenticated users
    },
    {
      name: 'Cadastrar Visitante',
      href: '/visitors/register',
      icon: UserPlus,
      permission: 'visitor_register'
    },
    {
      name: 'Lista de Visitantes',
      href: '/visitors/list',
      icon: Users,
      permission: 'visitor_list'
    },
    {
      name: 'Entrada/Saída',
      href: '/visitors/entry',
      icon: LogIn,
      permission: 'visitor_entry'
    },
    {
      name: 'Setores',
      href: '/sectors',
      icon: Building2,
      permission: 'sectors_manage',
      submenu: [
        {
          name: 'Listar Setores',
          href: '/sectors',
          permission: 'sectors_manage'
        },
        {
          name: 'Adicionar Setor',
          href: '/sectors/add',
          permission: 'sectors_manage'
        },
        {
          name: 'Criar Setores em Lote',
          href: '/sectors/seeder',
          permission: 'sectors_manage' // Ou uma permissão mais específica se necessário
        }
      ]
    },
    {
      name: 'Departamentos',
      href: '/departments',
      icon: Building2,
      permission: 'sectors_manage'
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
      permission: 'reports'
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
      permission: 'settings'
    }
  ]

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  const isActive = (href) => {
    return location.pathname === href
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">VisitorSys</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Visitantes</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-300 font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role === 'admin' ? 'Administrador' :
                user?.role === 'manager' ? 'Gestor' :
                  user?.role === 'receptionist' ? 'Recepcionista' : user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isSubmenuOpen = openSubmenus[item.name];

          if (item.submenu) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.href) || item.submenu.some(subItem => isActive(subItem.href))
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200
                        ${isActive(item.href) || item.submenu.some(subItem => isActive(subItem.href))
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                        }`}
                    />
                    {item.name}
                  </div>
                  {/* Chevron Icon */}
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isSubmenuOpen && (
                  <div className="pl-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        onClick={onNavigate}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                          ${isActive(subItem.href)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600 dark:border-primary-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                      >
                        {/* Subitem Icon can be added here if needed */}
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${isActive(item.href)
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                  }`}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin tools */}
      {hasPermission('all') && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Shield className="mr-2 h-4 w-4" />
              Administração
            </div>
            <NavLink
              to="/audit-logs"
              onClick={onNavigate}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <Activity className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
              Logs de Auditoria
            </NavLink>
            <NavLink
              to="/totem"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              <Monitor className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
              Totem (Nova Aba)
            </NavLink>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>© 2024 VisitorSys</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
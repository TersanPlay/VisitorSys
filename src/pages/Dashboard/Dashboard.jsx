import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Building2,
  Eye,
  Settings
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisits: 0,
    todayVisits: 0,
    pendingAlerts: 0
  })
  const [recentVisits, setRecentVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Mock data - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get visitors and visits from localStorage
      const visitors = JSON.parse(localStorage.getItem('visitors') || '[]')
      const visits = JSON.parse(localStorage.getItem('visits') || '[]')

      // Calculate stats
      const today = new Date()
      const todayStart = startOfDay(today)
      const todayEnd = endOfDay(today)

      const todayVisits = visits.filter(visit => {
        const visitDate = new Date(visit.entryTime)
        return visitDate >= todayStart && visitDate <= todayEnd
      })

      const activeVisits = visits.filter(visit => visit.status === 'in_progress')

      setStats({
        totalVisitors: visitors.length,
        activeVisits: activeVisits.length,
        todayVisits: todayVisits.length,
        pendingAlerts: 3 // Mock alerts
      })

      // Get recent visits with visitor details
      const recentVisitsWithDetails = visits
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
        .slice(0, 10)
        .map(visit => {
          const visitor = visitors.find(v => v.id === visit.visitorId)
          return {
            ...visit,
            visitor: visitor || { name: 'Visitante não encontrado' }
          }
        })

      setRecentVisits(recentVisitsWithDetails)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in_progress': { label: 'Em andamento', color: 'bg-green-100 text-green-800' },
      'completed': { label: 'Finalizada', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status] || statusConfig['completed']

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatVisitTime = (timeString) => {
    return format(new Date(timeString), 'HH:mm', { locale: ptBR })
  }

  const formatVisitDate = (timeString) => {
    return format(new Date(timeString), 'dd/MM/yyyy', { locale: ptBR })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Carregando dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Visitantes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalVisitors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500"> vs. mês anterior</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Visitas Ativas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeVisits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">Visitantes no prédio</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Visitas Hoje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.todayVisits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">+5</span>
              <span className="text-gray-500"> vs. ontem</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Alertas Pendentes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingAlerts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600 font-medium">Requer atenção</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visits */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Visitas Recentes</h3>
        </div>
        <div className="overflow-hidden">
          {recentVisits.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentVisits.map((visit) => (
                <li key={visit.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {visit.visitor?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {visit.visitor?.name || 'Nome não disponível'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {visit.visitor?.company || 'Empresa não informada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {formatVisitDate(visit.entryTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatVisitTime(visit.entryTime)}
                        </p>
                      </div>
                      {getStatusBadge(visit.status)}
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma visita registrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                As visitas aparecerão aqui quando forem registradas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/visitors/register')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <UserCheck className="h-5 w-5 mr-2 text-green-600" />
              Registrar Visitante
            </button>
            <button
              onClick={() => navigate('/visitors/entry')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Entrada/Saída
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              Relatórios
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="h-5 w-5 mr-2 text-orange-600" />
              Meu Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
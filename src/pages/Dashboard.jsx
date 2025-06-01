import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import MapaBairrosParauapebas from '../components/MapaBairrosParauapebas'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Activity,
  User,
  MapPin
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisits: 0,
    todayVisits: 0,
    weeklyVisits: 0
  })
  const [recentVisitors, setRecentVisitors] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load visitors and visits data
      const visitors = await visitorService.getAllVisitors()
      const visits = await visitorService.getAllVisits()

      // Calculate statistics
      const today = new Date()
      const weekAgo = subDays(today, 7)

      const todayVisits = visits.filter(visit =>
        isToday(new Date(visit.startTime))
      )

      const weeklyVisits = visits.filter(visit =>
        new Date(visit.startTime) >= weekAgo
      )

      const activeVisits = visits.filter(visit =>
        visit.status === 'active'
      )

      setStats({
        totalVisitors: visitors.length,
        activeVisits: activeVisits.length,
        todayVisits: todayVisits.length,
        weeklyVisits: weeklyVisits.length
      })

      // Get recent visitors (last 10)
      const sortedVisitors = visitors
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
      setRecentVisitors(sortedVisitors)

      // Get recent activity (last 15 visits)
      const sortedVisits = visits
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 15)
      setRecentActivity(sortedVisits)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Erro ao carregar dados do dashboard')
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
    const badges = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    const labels = {
      active: 'Ativo',
      completed: 'Finalizado',
      cancelled: 'Cancelado'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'
        }`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatVisitDuration = (startTime, endTime) => {
    if (!endTime) return 'Em andamento'

    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffInMinutes = Math.floor((end - start) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      return `${hours}h ${minutes}min`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-primary-100 mt-1">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="hidden sm:block">
            <Activity className="h-12 w-12 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Visitantes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalVisitors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Visitas Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Visitas Hoje</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Visitas na Semana</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.weeklyVisits}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Visitantes Recentes</h2>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentVisitors.length > 0 ? (
              recentVisitors.map((visitor) => (
                <div key={visitor.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {visitor.photo ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={visitor.photo}
                          alt={visitor.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {visitor.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {visitor.company || 'Visitante individual'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(visitor.createdAt), 'dd/MM HH:mm')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Nenhum visitante cadastrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((visit) => {
                const visitor = recentVisitors.find(v => v.id === visit.visitorId)
                return (
                  <div key={visit.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {visit.status === 'active' ? (
                            <UserCheck className="h-5 w-5 text-green-600" />
                          ) : visit.status === 'completed' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <UserX className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {visitor?.name || 'Visitante não encontrado'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {visit.purpose || 'Sem propósito definido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getStatusBadge(visit.status)}
                        <span className="text-xs text-gray-500">
                          {format(new Date(visit.startTime), 'dd/MM HH:mm')}
                        </span>
                        {visit.status !== 'active' && (
                          <span className="text-xs text-gray-400">
                            {formatVisitDuration(visit.startTime, visit.endTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa de Bairros de Parauapebas */}
      <div className="mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800">Mapa de Visitas por Bairro</h2>
        </div>
        <MapaBairrosParauapebas />
      </div>
    </div>
  )
}

export default Dashboard
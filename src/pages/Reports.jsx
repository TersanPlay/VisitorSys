import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Building,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Reports = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [visitors, setVisitors] = useState([])
  const [visits, setVisits] = useState([])
  const [filteredData, setFilteredData] = useState({ visitors: [], visits: [] })
  const [filters, setFilters] = useState({
    dateRange: '7days',
    startDate: '',
    endDate: '',
    status: 'all',
    company: ''
  })
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalVisits: 0,
    averageVisitDuration: 0,
    topCompanies: [],
    visitsByDay: [],
    visitsByHour: []
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [visitors, visits, filters])

  useEffect(() => {
    calculateStats()
  }, [filteredData])

  const loadData = async () => {
    try {
      setLoading(true)
      const [visitorsData, visitsData] = await Promise.all([
        visitorService.getAllVisitors(),
        visitorService.getAllVisits()
      ])
      setVisitors(visitorsData)
      setVisits(visitsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados dos relatórios')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filteredVisitors = [...visitors]
    let filteredVisits = [...visits]

    // Date range filter
    let startDate, endDate
    const now = new Date()

    switch (filters.dateRange) {
      case '1day':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case '7days':
        startDate = startOfDay(subDays(now, 7))
        endDate = endOfDay(now)
        break
      case '30days':
        startDate = startOfDay(subDays(now, 30))
        endDate = endOfDay(now)
        break
      case '90days':
        startDate = startOfDay(subDays(now, 90))
        endDate = endOfDay(now)
        break
      case 'custom':
        if (filters.startDate && filters.endDate) {
          startDate = startOfDay(new Date(filters.startDate))
          endDate = endOfDay(new Date(filters.endDate))
        } else {
          startDate = startOfDay(subDays(now, 7))
          endDate = endOfDay(now)
        }
        break
      default:
        startDate = startOfDay(subDays(now, 7))
        endDate = endOfDay(now)
    }

    // Filter visits by date range
    filteredVisits = filteredVisits.filter(visit => {
      const visitDate = new Date(visit.startTime)
      return isWithinInterval(visitDate, { start: startDate, end: endDate })
    })

    // Filter visitors by visits in date range
    const visitorIdsInRange = new Set(filteredVisits.map(visit => visit.visitorId))
    filteredVisitors = filteredVisitors.filter(visitor => visitorIdsInRange.has(visitor.id))

    // Status filter
    if (filters.status !== 'all') {
      filteredVisits = filteredVisits.filter(visit => visit.status === filters.status)
    }

    // Company filter
    if (filters.company) {
      const companyVisitorIds = visitors
        .filter(visitor => visitor.company?.toLowerCase().includes(filters.company.toLowerCase()))
        .map(visitor => visitor.id)
      filteredVisits = filteredVisits.filter(visit => companyVisitorIds.includes(visit.visitorId))
      filteredVisitors = filteredVisitors.filter(visitor => 
        visitor.company?.toLowerCase().includes(filters.company.toLowerCase())
      )
    }

    setFilteredData({ visitors: filteredVisitors, visits: filteredVisits })
  }

  const calculateStats = () => {
    const { visitors: filteredVisitors, visits: filteredVisits } = filteredData

    // Basic stats
    const totalVisitors = filteredVisitors.length
    const totalVisits = filteredVisits.length

    // Average visit duration
    const completedVisits = filteredVisits.filter(visit => visit.endTime)
    const totalDuration = completedVisits.reduce((sum, visit) => {
      const duration = new Date(visit.endTime) - new Date(visit.startTime)
      return sum + duration
    }, 0)
    const averageVisitDuration = completedVisits.length > 0 
      ? Math.round(totalDuration / completedVisits.length / (1000 * 60)) // in minutes
      : 0

    // Top companies
    const companyCount = {}
    filteredVisitors.forEach(visitor => {
      if (visitor.company) {
        companyCount[visitor.company] = (companyCount[visitor.company] || 0) + 1
      }
    })
    const topCompanies = Object.entries(companyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }))

    // Visits by day (last 7 days)
    const visitsByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      const dayVisits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.startTime)
        return isWithinInterval(visitDate, { start: dayStart, end: dayEnd })
      })
      visitsByDay.push({
        date: format(date, 'dd/MM'),
        count: dayVisits.length
      })
    }

    // Visits by hour
    const visitsByHour = Array.from({ length: 24 }, (_, hour) => {
      const hourVisits = filteredVisits.filter(visit => {
        const visitHour = new Date(visit.startTime).getHours()
        return visitHour === hour
      })
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: hourVisits.length
      }
    })

    setStats({
      totalVisitors,
      totalVisits,
      averageVisitDuration,
      topCompanies,
      visitsByDay,
      visitsByHour
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const exportReport = (format) => {
    try {
      const { visitors: filteredVisitors, visits: filteredVisits } = filteredData
      
      if (format === 'csv') {
        // Export visits CSV
        const csvContent = [
          ['Data/Hora Entrada', 'Data/Hora Saída', 'Visitante', 'Empresa', 'Propósito', 'Status', 'Duração (min)'],
          ...filteredVisits.map(visit => {
            const visitor = visitors.find(v => v.id === visit.visitorId)
            const duration = visit.endTime 
              ? Math.round((new Date(visit.endTime) - new Date(visit.startTime)) / (1000 * 60))
              : 'Em andamento'
            return [
              format(new Date(visit.startTime), 'dd/MM/yyyy HH:mm'),
              visit.endTime ? format(new Date(visit.endTime), 'dd/MM/yyyy HH:mm') : '',
              visitor?.name || 'N/A',
              visitor?.company || '',
              visit.purpose || '',
              visit.status === 'active' ? 'Ativo' : visit.status === 'completed' ? 'Finalizado' : 'Cancelado',
              duration
            ]
          })
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `relatorio_visitas_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Relatório exportado com sucesso!')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Erro ao exportar relatório')
    }
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}min`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando relatórios..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análise e estatísticas dos visitantes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="1day">Hoje</option>
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="90days">Últimos 90 dias</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="completed">Finalizados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                placeholder="Filtrar por empresa"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Visitas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Duração Média</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.averageVisitDuration > 0 ? formatDuration(stats.averageVisitDuration) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Empresas Únicas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.topCompanies.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits by Day Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Visitas por Dia</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar 
              data={{
                labels: stats.visitsByDay.map(day => day.date),
                datasets: [
                  {
                    label: 'Número de Visitas',
                    data: stats.visitsByDay.map(day => day.count),
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                      size: 14,
                    },
                    bodyFont: {
                      size: 13,
                    },
                    callbacks: {
                      label: function(context) {
                        return `Visitas: ${context.raw}`;
                      }
                    }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                    title: {
                      display: true,
                      text: 'Número de Visitas',
                      font: {
                        size: 12,
                      },
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Data',
                      font: {
                        size: 12,
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Empresas</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-64 flex items-center justify-center">
              {stats.topCompanies.length > 0 ? (
                <Doughnut
                  data={{
                    labels: stats.topCompanies.map(company => company.company),
                    datasets: [
                      {
                        data: stats.topCompanies.map(company => company.count),
                        backgroundColor: [
                          'rgba(79, 70, 229, 0.8)',  // primary-600
                          'rgba(59, 130, 246, 0.8)', // blue-500
                          'rgba(16, 185, 129, 0.8)', // green-500
                          'rgba(245, 158, 11, 0.8)', // amber-500
                          'rgba(239, 68, 68, 0.8)',  // red-500
                        ],
                        borderColor: [
                          'rgba(79, 70, 229, 1)',
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(245, 158, 11, 1)',
                          'rgba(239, 68, 68, 1)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw} visitantes`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="text-center">
                  <Building className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Nenhuma empresa encontrada</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <div className="space-y-3">
                {stats.topCompanies.length > 0 ? (
                  stats.topCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{
                          backgroundColor: [
                            'rgba(79, 70, 229, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                          ][index % 5]
                        }}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {company.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{company.count} visitantes</span>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visits by Hour */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Distribuição por Horário</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-64">
          <Bar
            data={{
              labels: stats.visitsByHour.map(hour => hour.hour),
              datasets: [
                {
                  label: 'Número de Visitas',
                  data: stats.visitsByHour.map(hour => hour.count),
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1,
                  barThickness: 8,
                  borderRadius: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  callbacks: {
                    label: function(context) {
                      return `Visitas: ${context.raw}`;
                    }
                  }
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                  title: {
                    display: true,
                    text: 'Número de Visitas',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Hora',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Visitas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saída
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.visits.slice(0, 10).map((visit) => {
                const visitor = visitors.find(v => v.id === visit.visitorId)
                const duration = visit.endTime 
                  ? Math.round((new Date(visit.endTime) - new Date(visit.startTime)) / (1000 * 60))
                  : null
                
                return (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {visitor?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor?.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(visit.startTime), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visit.endTime ? format(new Date(visit.endTime), 'dd/MM/yyyy HH:mm') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        visit.status === 'active' ? 'bg-green-100 text-green-800' :
                        visit.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {visit.status === 'active' ? 'Ativo' :
                         visit.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {duration ? formatDuration(duration) : 'Em andamento'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredData.visits.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma visita encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Ajuste os filtros para ver mais resultados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
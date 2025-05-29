import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Shield,
  FileText,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info,
  Check,
  X
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

// Componentes UI
import { Button } from '../components/UI/button'
import { Input } from '../components/UI/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/UI/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/UI/table'
import { Badge } from '../components/UI/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/UI/tabs'

const AuditLogs = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: '7days',
    startDate: '',
    endDate: '',
    action: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await authService.getAuditLogs()
      setLogs(data)
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Filtro de busca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        JSON.stringify(log.metadata).toLowerCase().includes(term)
      )
    }

    // Filtro de ação
    if (filters.action) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      )
    }

    // Filtro de data
    if (filters.dateRange !== 'custom') {
      let startDate = new Date()

      switch (filters.dateRange) {
        case 'today':
          startDate = startOfDay(new Date())
          break
        case 'yesterday':
          startDate = startOfDay(subDays(new Date(), 1))
          break
        case '7days':
          startDate = startOfDay(subDays(new Date(), 7))
          break
        case '30days':
          startDate = startOfDay(subDays(new Date(), 30))
          break
        case '90days':
          startDate = startOfDay(subDays(new Date(), 90))
          break
        default:
          break
      }

      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate)
    } else {
      if (filters.startDate) {
        const startDate = startOfDay(new Date(filters.startDate))
        filtered = filtered.filter(log => new Date(log.timestamp) >= startDate)
      }

      if (filters.endDate) {
        const endDate = endOfDay(new Date(filters.endDate))
        filtered = filtered.filter(log => new Date(log.timestamp) <= endDate)
      }
    }

    setFilteredLogs(filtered)
  }

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      startDate: '',
      endDate: ''
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRefresh = () => {
    loadLogs()
    toast.success('Logs atualizados')
  }

  const exportToCSV = () => {
    try {
      if (filteredLogs.length === 0) {
        toast.error('Não há dados para exportar')
        return
      }

      // Preparar os dados para CSV
      const headers = ['Data/Hora', 'Ação', 'Descrição', 'Detalhes', 'Navegador', 'IP']

      const csvData = filteredLogs.map(log => [
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        log.action,
        log.description,
        JSON.stringify(log.metadata),
        log.userAgent,
        log.ip
      ])

      // Adicionar cabeçalhos
      csvData.unshift(headers)

      // Converter para formato CSV
      const csvContent = csvData.map(row => row.join(',')).join('\n')

      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `logs_auditoria_${format(new Date(), 'dd-MM-yyyy')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Logs exportados com sucesso')
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      toast.error('Erro ao exportar logs')
    }
  }

  // Função para renderizar o ícone baseado na ação
  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return <Shield className="h-4 w-4 text-blue-500" />
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Plus className="h-4 w-4 text-green-500" />
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Edit className="h-4 w-4 text-orange-500" />
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Trash2 className="h-4 w-4 text-red-500" />
    } else if (actionLower.includes('view') || actionLower.includes('read')) {
      return <Eye className="h-4 w-4 text-purple-500" />
    } else if (actionLower.includes('error') || actionLower.includes('fail')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (actionLower.includes('success') || actionLower.includes('complete')) {
      return <Check className="h-4 w-4 text-green-500" />
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  // Função para renderizar o badge de status baseado na ação
  const getActionBadge = (action) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">Autenticação</Badge>
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">Criação</Badge>
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">Atualização</Badge>
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">Exclusão</Badge>
    } else if (actionLower.includes('view') || actionLower.includes('read')) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">Visualização</Badge>
    } else if (actionLower.includes('error') || actionLower.includes('fail')) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">Erro</Badge>
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800">Outro</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Logs de Auditoria</h1>
            <p className="text-gray-500 dark:text-gray-400">Visualize e analise as atividades do sistema</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <CardDescription>Refine os resultados usando os filtros abaixo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                  <select
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <option value="today">Hoje</option>
                    <option value="yesterday">Ontem</option>
                    <option value="7days">Últimos 7 dias</option>
                    <option value="30days">Últimos 30 dias</option>
                    <option value="90days">Últimos 90 dias</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {filters.dateRange === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Inicial</label>
                      <Input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Final</label>
                      <Input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Ação</label>
                  <Input
                    type="text"
                    name="action"
                    placeholder="Ex: login, create, update"
                    value={filters.action}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Busca</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="searchTerm"
                      className="pl-9"
                      placeholder="Buscar em todos os campos"
                      value={filters.searchTerm}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conteúdo Principal */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Registros de Atividades</CardTitle>
              <Badge variant="outline">{filteredLogs.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead className="hidden md:table-cell">Descrição</TableHead>
                      <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
                      <TableHead className="hidden xl:table-cell">Navegador</TableHead>
                      <TableHead className="hidden xl:table-cell">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(log.timestamp), 'HH:mm:ss')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(log.action)}
                              <span>{log.action}</span>
                            </div>
                            <div>
                              {getActionBadge(log.action)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {log.description}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="max-w-xs truncate">
                            {Object.keys(log.metadata).length > 0 ? (
                              <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs italic">Sem detalhes</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-gray-500 dark:text-gray-400">
                          <div className="max-w-[150px] truncate" title={log.userAgent}>
                            {log.userAgent}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-gray-500 dark:text-gray-400">
                          {log.ip}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum log encontrado</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Não foram encontrados logs de auditoria com os filtros aplicados. Tente ajustar os filtros ou verificar mais tarde.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuditLogs
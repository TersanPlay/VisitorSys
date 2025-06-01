import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Camera,
  FileText,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const Visitors = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [visitors, setVisitors] = useState([])
  const [filteredVisitors, setFilteredVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit', 'delete'

  useEffect(() => {
    loadVisitors()
  }, [])

  useEffect(() => {
    filterVisitors()
  }, [visitors, searchTerm, filterStatus])

  const loadVisitors = async () => {
    try {
      setLoading(true)
      const data = await visitorService.getAllVisitors()
      setVisitors(data)
    } catch (error) {
      console.error('Error loading visitors:', error)
      toast.error('Erro ao carregar visitantes')
    } finally {
      setLoading(false)
    }
  }

  const filterVisitors = () => {
    let filtered = [...visitors]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(term) ||
        visitor.email?.toLowerCase().includes(term) ||
        visitor.phone?.includes(term) ||
        visitor.company?.toLowerCase().includes(term) ||
        visitor.cpf?.includes(term)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visitor => {
        const hasActiveVisit = visitor.visits?.some(visit => visit.status === 'active')
        if (filterStatus === 'active') return hasActiveVisit
        if (filterStatus === 'inactive') return !hasActiveVisit
        return true
      })
    }

    setFilteredVisitors(filtered)
  }

  const handleViewVisitor = (visitor) => {
    try {
      console.log('Viewing visitor:', visitor)
      setSelectedVisitor(visitor)
      setModalType('view')
      setShowModal(true)
    } catch (error) {
      console.error('Error viewing visitor:', error)
      toast.error('Erro ao visualizar visitante')
    }
  }

  const handleEditVisitor = (visitor) => {
    setSelectedVisitor(visitor)
    setModalType('edit')
    setShowModal(true)
  }

  const handleDeleteVisitor = (visitor) => {
    setSelectedVisitor(visitor)
    setModalType('delete')
    setShowModal(true)
  }

  const confirmDelete = async () => {
    try {
      await visitorService.deleteVisitor(selectedVisitor.id)
      toast.success('Visitante excluído com sucesso')
      setShowModal(false)
      setSelectedVisitor(null)
      loadVisitors()
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast.error('Erro ao excluir visitante')
    }
  }

  const exportVisitors = () => {
    try {
      const csvContent = [
        ['Nome', 'Email', 'Telefone', 'Empresa', 'CPF', 'Data de Cadastro'],
        ...filteredVisitors.map(visitor => [
          visitor.name,
          visitor.email || '',
          visitor.phone || '',
          visitor.company || '',
          visitor.cpf || '',
          format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm')
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `visitantes_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Lista de visitantes exportada com sucesso')
    } catch (error) {
      console.error('Error exporting visitors:', error)
      toast.error('Erro ao exportar lista de visitantes')
    }
  }

  const getVisitorStatus = (visitor) => {
    const hasActiveVisit = visitor.visits?.some(visit => visit.status === 'active')
    return hasActiveVisit ? 'active' : 'inactive'
  }

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Ativo
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <UserX className="w-3 h-3 mr-1" />
        Inativo
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando visitantes..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitantes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os visitantes cadastrados no sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportVisitors}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={() => navigate('/visitors/register')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Visitante
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Buscar por nome, email, telefone, empresa ou CPF..."
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{filteredVisitors.length}</span> de{' '}
            <span className="font-medium">{visitors.length}</span> visitantes
          </p>
        </div>
      </div>

      {/* Visitors List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredVisitors.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredVisitors.map((visitor) => (
              <li key={visitor.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        {visitor.photo ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={visitor.photo}
                            alt={visitor.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {visitor.name}
                          </p>
                          {getStatusBadge(getVisitorStatus(visitor))}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          {visitor.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {visitor.email}
                            </div>
                          )}
                          {visitor.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {visitor.phone}
                            </div>
                          )}
                          {visitor.company && (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {visitor.company}
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          Cadastrado em {visitor.createdAt ? format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm') : 'Data não disponível'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewVisitor(visitor)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {user?.permissions?.includes('visitors.delete') && (
                        <button
                          onClick={() => handleDeleteVisitor(visitor)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {user?.permissions?.includes('visitors.edit') && (
                        <button
                          onClick={() => handleEditVisitor(visitor)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filterStatus !== 'all' ? 'Nenhum visitante encontrado' : 'Nenhum visitante cadastrado'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando um novo visitante.'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/visitors/register'}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Visitante
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedVisitor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 max-w-6xl shadow-2xl rounded-lg bg-transparent">
            <div className="mt-3">
              {!selectedVisitor ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Erro ao carregar dados do visitante</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                modalType === 'view' && selectedVisitor ? (
                  <div className="max-w-4xl mx-auto">
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-lg p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white bg-opacity-20 rounded-full">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">Perfil do Visitante</h3>
                            <p className="text-blue-100 text-sm">Informações detalhadas</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo do perfil - usando Card e CardContent */}
                    <div className="bg-gradient-to-b from-white to-blue-50 rounded-b-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Coluna da esquerda - Foto e informações básicas */}
                        <div className="md:col-span-1">
                          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="text-center">
                              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto overflow-hidden mb-4">
                                {selectedVisitor.photo ? (
                                  <img
                                    src={selectedVisitor.photo}
                                    alt={selectedVisitor.name}
                                    className="h-32 w-32 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-16 w-16 text-primary-600" />
                                )}
                              </div>
                              <h3 className="text-xl font-medium text-gray-900">{selectedVisitor.name}</h3>
                              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {selectedVisitor.status === 'active' ? 'Ativo' : 'Inativo'}
                              </div>
                              {selectedVisitor.company && (
                                <p className="mt-1 text-sm text-gray-500">{selectedVisitor.company}</p>
                              )}
                            </div>

                            <div className="mt-6 space-y-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                                {selectedVisitor.email || 'Email não informado'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                                {selectedVisitor.phone || 'Telefone não informado'}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                                Registrado em {selectedVisitor.createdAt ? format(new Date(selectedVisitor.createdAt), 'dd/MM/yyyy') : 'Data desconhecida'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Coluna da direita - Informações detalhadas */}
                        <div className="md:col-span-2 space-y-6">
                          {/* Dados Pessoais */}
                          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-primary-600" />
                              Dados Pessoais
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">CPF</label>
                                <p className="text-gray-900">{selectedVisitor.cpf || 'Não informado'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Data de Registro</label>
                                <p className="text-gray-900">{selectedVisitor.createdAt ? format(new Date(selectedVisitor.createdAt), 'dd/MM/yyyy') : 'Não disponível'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Histórico de Visitas */}
                          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <Clock className="h-5 w-5 mr-2 text-primary-600" />
                              Histórico de Visitas
                            </h4>
                            {selectedVisitor.visits && selectedVisitor.visits.length > 0 ? (
                              <div className="space-y-3">
                                {selectedVisitor.visits.slice(0, 3).map((visit, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-blue-100 p-2 rounded-full">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {visit.purpose || 'Visita'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {visit.createdAt ? format(new Date(visit.createdAt), 'dd/MM/yyyy HH:mm') : 'Data não disponível'}
                                        </p>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${visit.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                      }`}>
                                      {visit.status === 'active' ? 'Ativa' : 'Finalizada'}
                                    </span>
                                  </div>
                                ))}
                                {selectedVisitor.visits.length > 3 && (
                                  <p className="text-sm text-gray-500 text-center pt-2">
                                    +{selectedVisitor.visits.length - 3} visitas anteriores
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-3 opacity-50" />
                                <p className="text-gray-500 text-sm">Nenhuma visita registrada</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                          onClick={() => {
                            setModalType('edit')
                          }}
                          className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Visitante
                        </button>
                        <button
                          onClick={() => setShowModal(false)}
                          className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm hover:shadow-md"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : modalType === 'edit' ? (
                  <div className="max-w-4xl mx-auto">
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-lg p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white bg-opacity-20 rounded-full">
                            <Edit className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">Editar Visitante</h3>
                            <p className="text-blue-100 text-sm">Atualize as informações do visitante</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Formulário de edição */}
                    <div className="bg-gradient-to-b from-white to-blue-50 rounded-b-lg p-6">
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        // Aqui você pode implementar a lógica de atualização
                        toast.success('Visitante atualizado com sucesso!')
                        setShowModal(false)
                        loadVisitors()
                      }} className="space-y-6">
                        {/* Seção de informações básicas */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600" />
                            Informações Básicas
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Nome Completo *
                              </label>
                              <input
                                type="text"
                                defaultValue={selectedVisitor.name}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Empresa
                              </label>
                              <input
                                type="text"
                                defaultValue={selectedVisitor.company || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Seção de contato */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Phone className="h-5 w-5 mr-2 text-green-600" />
                            Informações de Contato
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                defaultValue={selectedVisitor.email || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                Telefone
                              </label>
                              <input
                                type="tel"
                                defaultValue={selectedVisitor.phone || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Seção de documentos */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-purple-600" />
                            Documentos
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500 mb-1">
                                CPF
                              </label>
                              <input
                                type="text"
                                defaultValue={selectedVisitor.cpf || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="000.000.000-00"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md hover:shadow-lg"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalType('view')}
                            className="flex-1 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : modalType === 'delete' ? (
                  <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white bg-opacity-20 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold">Confirmar Exclusão</h3>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-6 bg-red-50 p-4 rounded-lg border border-red-100">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
                        <div>
                          <p className="text-gray-700 font-medium mb-1">Tem certeza que deseja excluir o visitante?</p>
                          <p className="text-gray-500 text-sm">Esta ação não pode ser desfeita e removerá permanentemente <strong className="text-red-600">{selectedVisitor.name}</strong> do sistema.</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4 mr-2 inline-block" />
                          Excluir Visitante
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Visitors
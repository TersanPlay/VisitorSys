import React, { useState, useEffect } from 'react'
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
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const Visitors = () => {
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
    setSelectedVisitor(visitor)
    setModalType('view')
    setShowModal(true)
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
            onClick={() => window.location.href = '/visitors/register'}
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
                          Cadastrado em {format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm')}
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
                      {user?.permissions?.includes('visitors.edit') && (
                        <button
                          onClick={() => handleEditVisitor(visitor)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {user?.permissions?.includes('visitors.delete') && (
                        <button
                          onClick={() => handleDeleteVisitor(visitor)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {modalType === 'view' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Detalhes do Visitante</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {selectedVisitor.photo ? (
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src={selectedVisitor.photo}
                          alt={selectedVisitor.name}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-semibold">{selectedVisitor.name}</h4>
                        {getStatusBadge(getVisitorStatus(selectedVisitor))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVisitor.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedVisitor.email}</p>
                        </div>
                      )}
                      {selectedVisitor.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Telefone</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedVisitor.phone}</p>
                        </div>
                      )}
                      {selectedVisitor.company && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Empresa</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedVisitor.company}</p>
                        </div>
                      )}
                      {selectedVisitor.cpf && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">CPF</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedVisitor.cpf}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Cadastro</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(new Date(selectedVisitor.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'delete' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Tem certeza que deseja excluir o visitante <strong>{selectedVisitor.name}</strong>?
                    Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Visitors
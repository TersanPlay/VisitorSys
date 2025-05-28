import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { sectorService } from '../services/sectorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Image
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

const Sectors = () => {
  const { user } = useAuth()
  const [sectors, setSectors] = useState([])
  const [filteredSectors, setFilteredSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSector, setSelectedSector] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('view') // 'view', 'edit', 'delete'

  useEffect(() => {
    loadSectors()
  }, [])

  useEffect(() => {
    filterSectors()
  }, [sectors, searchTerm, filterStatus])

  const loadSectors = async () => {
    try {
      setLoading(true)
      const data = await sectorService.getAllSectors()
      setSectors(data)
    } catch (error) {
      console.error('Erro ao carregar setores:', error)
      toast.error('Erro ao carregar setores')
    } finally {
      setLoading(false)
    }
  }

  const filterSectors = () => {
    let filtered = [...sectors]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(sector =>
        sector.name.toLowerCase().includes(term) ||
        sector.acronym?.toLowerCase().includes(term) ||
        sector.description?.toLowerCase().includes(term) ||
        sector.responsibleName?.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sector => sector.status === filterStatus)
    }

    setFilteredSectors(filtered)
  }

  const handleViewSector = (sector) => {
    setSelectedSector(sector)
    setModalType('view')
    setShowModal(true)
  }

  const handleEditSector = (sector) => {
    setSelectedSector(sector)
    setModalType('edit')
    setShowModal(true)
  }

  const handleDeleteSector = (sector) => {
    setSelectedSector(sector)
    setModalType('delete')
    setShowModal(true)
  }

  const confirmDeleteSector = async () => {
    try {
      setLoading(true)
      await sectorService.deleteSector(selectedSector.id)
      toast.success('Setor excluído com sucesso')
      loadSectors()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao excluir setor:', error)
      toast.error('Erro ao excluir setor')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSector(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setores</h1>
        <Link
          to="/sectors/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Setor
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Buscar setores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Setores */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredSectors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum setor encontrado</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Nenhum setor corresponde aos filtros aplicados. Tente ajustar seus critérios de busca.'
              : 'Não há setores cadastrados no sistema. Clique no botão "Novo Setor" para adicionar.'}
          </p>
          {searchTerm || filterStatus !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Limpar filtros
            </button>
          ) : (
            <Link
              to="/sectors/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Setor
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Coluna de ícone/imagem */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Ícone
                  </th>
                  {/* Informações principais */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Setor
                  </th>
                  {/* Localização */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Localização
                  </th>
                  {/* Responsável */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Responsável
                  </th>
                  {/* Status */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* Ações */}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSectors.map((sector) => (
                  <tr key={sector.id} className="hover:bg-gray-50">
                    {/* Ícone/Imagem */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        {sector.iconUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={sector.iconUrl}
                            alt={`Ícone do setor ${sector.name}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Informações principais */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {sector.name}
                          {sector.acronym && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 py-1 px-2 rounded">
                              {sector.acronym}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {sector.description}
                        </div>
                      </div>
                    </td>
                    {/* Localização */}
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {sector.location || 'Não informado'}
                      </div>
                    </td>
                    {/* Responsável */}
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{sector.responsibleName || 'Não informado'}</div>
                      {sector.responsibleEmail && (
                        <div className="text-sm text-gray-500">{sector.responsibleEmail}</div>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sector.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {sector.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewSector(sector)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Visualizar"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditSector(sector)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSector(sector)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showModal && modalType === 'view' && selectedSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Detalhes do Setor</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Cabeçalho com ícone e nome */}
                <div className="flex items-center space-x-4">
                  {selectedSector.iconUrl ? (
                    <img
                      src={selectedSector.iconUrl}
                      alt={`Ícone do setor ${selectedSector.name}`}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedSector.name}</h3>
                    {selectedSector.acronym && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                        {selectedSector.acronym}
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className="border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <FileText className="h-4 w-4 mr-1" /> Descrição
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.description || 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" /> Localização
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.location || 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Horário de Funcionamento
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.workingHours || 'Não informado'}
                      </dd>
                    </div>

                    <div className="sm:col-span-2 border-t border-gray-200 pt-4">
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" /> Responsável
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.responsibleName || 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-1" /> E-mail
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.responsibleEmail || 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" /> Telefone/Ramal
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.responsiblePhone || 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> Data de Cadastro
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedSector.createdAt ? formatDate(selectedSector.createdAt) : 'Não informado'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedSector.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {selectedSector.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    closeModal()
                    handleEditSector(selectedSector)
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showModal && modalType === 'delete' && selectedSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja excluir o setor <strong>{selectedSector.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteSector}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição - Redirecionamento */}
      {showModal && modalType === 'edit' && selectedSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Editar Setor</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Você será redirecionado para a página de edição do setor <strong>{selectedSector.name}</strong>.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <Link
                  to={`/sectors/${selectedSector.id}/edit`}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 inline-flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Ir para Edição
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sectors
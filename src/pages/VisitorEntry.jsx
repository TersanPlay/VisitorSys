import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import { departmentService } from '../services/departmentService'
import { sectorService } from '../services/sectorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Plus,
  Search,
  Download,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Briefcase,
  FileText,
  X,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

const VisitorEntry = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visitors, setVisitors] = useState([])
  const [filteredVisitors, setFilteredVisitors] = useState([])
  const [activeVisits, setActiveVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados para o modal de registro de visita
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('')
  const [filteredVisitorResults, setFilteredVisitorResults] = useState([])
  const [selectionType, setSelectionType] = useState('departments') // 'departments' ou 'sectors'
  const [availableDepartments, setAvailableDepartments] = useState([])
  const [availableSectors, setAvailableSectors] = useState([])

  // Estado para o modal de confirmação de saída
  const [showExitModal, setShowExitModal] = useState(false)
  const [exitVisitId, setExitVisitId] = useState(null)
  const [exitVisit, setExitVisit] = useState(null)

  // Dados da visita
  const [visitData, setVisitData] = useState({
    purpose: '',
    description: '',
    departments: [],
    sectors: []
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadVisitors()
    loadActiveVisits()
    loadSectorsAndDepartments()
  }, [])

  useEffect(() => {
    filterVisitors()
  }, [visitors, searchTerm])

  useEffect(() => {
    if (visitorSearchTerm.length >= 2) {
      searchVisitors()
    } else {
      setFilteredVisitorResults([])
    }
  }, [visitorSearchTerm])

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

  const loadActiveVisits = async () => {
    try {
      const data = await visitorService.getActiveVisits()
      setActiveVisits(data)
    } catch (error) {
      console.error('Error loading active visits:', error)
      toast.error('Erro ao carregar visitas ativas')
    }
  }

  const loadSectorsAndDepartments = async () => {
    try {
      const sectors = await sectorService.getAllSectors()
      const departments = await departmentService.getAllDepartments()
      setAvailableSectors(sectors)
      setAvailableDepartments(departments)
    } catch (error) {
      console.error('Error loading sectors and departments:', error)
      toast.error('Erro ao carregar setores e departamentos')
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

    setFilteredVisitors(filtered)
  }

  const searchVisitors = () => {
    const term = visitorSearchTerm.toLowerCase()
    const results = visitors.filter(visitor =>
      visitor.name.toLowerCase().includes(term) ||
      visitor.email?.toLowerCase().includes(term) ||
      visitor.cpf?.includes(term) ||
      visitor.rg?.includes(term)
    )
    setFilteredVisitorResults(results)
  }

  const handleSelectVisitor = (visitor) => {
    setSelectedVisitor(visitor)
    setFilteredVisitorResults([])
    setVisitorSearchTerm('')
  }

  const handleVisitDataChange = (e) => {
    const { name, value } = e.target
    setVisitData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro quando o campo é preenchido
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value)

    setVisitData(prev => ({
      ...prev,
      [name]: selectedValues
    }))

    // Limpar erro quando o campo é preenchido
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateVisitData = () => {
    const newErrors = {}

    if (!visitData.purpose) {
      newErrors.purpose = 'Propósito da visita é obrigatório'
    }

    if (selectionType === 'departments' && (!visitData.departments || visitData.departments.length === 0)) {
      newErrors.departments = 'Selecione pelo menos um departamento'
    }

    if (selectionType === 'sectors' && (!visitData.sectors || visitData.sectors.length === 0)) {
      newErrors.sectors = 'Selecione pelo menos um setor'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegisterVisit = async () => {
    try {
      if (!selectedVisitor) {
        toast.error('Selecione um visitante')
        return
      }

      if (!validateVisitData()) {
        return
      }

      const entryData = {
        entryPoint: 'main_entrance',
        authorizedBy: user?.name || 'Sistema',
        notes: visitData.description || '',
        purpose: visitData.purpose,
        departments: selectionType === 'departments' ? visitData.departments : [],
        sectors: selectionType === 'sectors' ? visitData.sectors : []
      }

      await visitorService.startVisit(selectedVisitor.id, entryData)
      toast.success('Visita registrada com sucesso')
      setShowRegisterModal(false)
      setSelectedVisitor(null)
      setVisitData({
        purpose: '',
        description: '',
        departments: [],
        sectors: []
      })
      loadActiveVisits()
    } catch (error) {
      console.error('Error registering visit:', error)
      toast.error(`Erro ao registrar visita: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const handleEndVisit = (visitId) => {
    // Encontrar a visita pelo ID
    const visit = activeVisits.find(v => v.id === visitId);
    if (visit) {
      setExitVisit(visit);
      setExitVisitId(visitId);
      setShowExitModal(true);
    } else {
      toast.error('Visita não encontrada');
    }
  }

  const confirmEndVisit = async () => {
    try {
      await visitorService.endVisit(exitVisitId);
      toast.success('Saída registrada com sucesso');
      setShowExitModal(false);
      setExitVisitId(null);
      setExitVisit(null);
      loadActiveVisits(); // Recarregar a lista de visitas ativas
    } catch (error) {
      console.error('Error ending visit:', error);
      toast.error(`Erro ao registrar saída: ${error.message || 'Erro desconhecido'}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Entrada e Saída de Visitantes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie a entrada e saída de visitantes no sistema
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
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Visita
          </button>
        </div>
      </div>

      {/* Search */}
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
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{activeVisits.length}</span> visitas ativas
          </p>
        </div>
      </div>

      {/* Active Visits List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {activeVisits.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {activeVisits.map((visit) => (
              <li key={visit.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        {visit.visitor?.photo ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={visit.visitor.photo}
                            alt={visit.visitor.name}
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
                            {visit.visitor?.name || 'Visitante não identificado'}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Visita em andamento
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          {visit.visitor?.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {visit.visitor.email}
                            </div>
                          )}
                          {visit.visitor?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {visit.visitor.phone}
                            </div>
                          )}
                          {visit.visitor?.company && (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {visit.visitor.company}
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Entrada: {visit.entryTime ? format(new Date(visit.entryTime), 'dd/MM/yyyy HH:mm') : 'Horário não disponível'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEndVisit(visit.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Registrar Saída
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma visita ativa no momento
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Registre a entrada de um visitante para iniciar uma visita.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Visita
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register Visit Modal */}
      {showRegisterModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-5 sm:p-8 sm:pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-2xl leading-6 font-medium text-gray-900">
                      Registrar Visita
                    </h3>
                    <div className="mt-5 space-y-5">
                      {/* Visitor Search */}
                      <div>
                        <label htmlFor="visitorSearch" className="block text-base font-medium text-gray-700">
                          Buscar Visitante
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="visitorSearch"
                            value={visitorSearchTerm}
                            onChange={(e) => setVisitorSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-base"
                            placeholder="Buscar por nome, email ou documento..."
                          />
                        </div>

                        {/* Search Results */}
                        {filteredVisitorResults.length > 0 && (
                          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                            <ul className="divide-y divide-gray-200">
                              {filteredVisitorResults.map((visitor) => (
                                <li
                                  key={visitor.id}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleSelectVisitor(visitor)}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                      {visitor.photo ? (
                                        <img
                                          className="h-8 w-8 rounded-full object-cover"
                                          src={visitor.photo}
                                          alt={visitor.name}
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                          <User className="h-4 w-4 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-base font-medium text-gray-900">{visitor.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {visitor.cpf || visitor.rg || visitor.email || visitor.company || ''}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Selected Visitor */}
                        {selectedVisitor && (
                          <div className="mt-2 p-3 border border-green-200 bg-green-50 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  {selectedVisitor.photo ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={selectedVisitor.photo}
                                      alt={selectedVisitor.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <p className="text-base font-medium text-gray-900">{selectedVisitor.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {selectedVisitor.cpf || selectedVisitor.rg || selectedVisitor.email || ''}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedVisitor(null)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedVisitor && (
                        <>
                          {/* Selection Type */}
                          <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">
                              Tipo de Seleção
                            </label>
                            <div className="flex space-x-4">
                              <div className="flex items-center">
                                <input
                                  id="departments-radio"
                                  name="selection-type"
                                  type="radio"
                                  checked={selectionType === 'departments'}
                                  onChange={() => setSelectionType('departments')}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                />
                                <label htmlFor="departments-radio" className="ml-2 block text-base text-gray-700">
                                  Departamentos
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="sectors-radio"
                                  name="selection-type"
                                  type="radio"
                                  checked={selectionType === 'sectors'}
                                  onChange={() => setSelectionType('sectors')}
                                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                                />
                                <label htmlFor="sectors-radio" className="ml-2 block text-base text-gray-700">
                                  Setores
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Purpose */}
                          <div>
                            <label htmlFor="purpose" className="block text-base font-medium text-gray-700">
                              Propósito da Visita *
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                id="purpose"
                                name="purpose"
                                value={visitData.purpose}
                                onChange={handleVisitDataChange}
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-base ${errors.purpose
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                              >
                                <option value="">Selecione o propósito</option>
                                <option value="Reunião">Reunião</option>
                                <option value="Entrevista">Entrevista</option>
                                <option value="Entrega">Entrega</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Visita Social">Visita Social</option>
                                <option value="Outro">Outro</option>
                              </select>
                            </div>
                            {errors.purpose && (
                              <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                            )}
                          </div>

                          {/* Departments or Sectors */}
                          {selectionType === 'departments' ? (
                            <div>
                              <label htmlFor="departments" className="block text-base font-medium text-gray-700">
                                Departamentos a visitar *
                              </label>
                              <div className="mt-1">
                                <select
                                  id="departments"
                                  name="departments"
                                  multiple
                                  value={visitData.departments}
                                  onChange={handleMultiSelectChange}
                                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-base ${errors.departments
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                                  size="5"
                                >
                                  {availableDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                      {department.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {visitData.departments.length > 0 && (
                                <p className="mt-1 text-sm text-gray-600">Selecionados: {visitData.departments.length}</p>
                              )}
                              {errors.departments && (
                                <p className="mt-1 text-sm text-red-600">{errors.departments}</p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <label htmlFor="sectors" className="block text-base font-medium text-gray-700">
                                Setores a visitar *
                              </label>
                              <div className="mt-1">
                                <select
                                  id="sectors"
                                  name="sectors"
                                  multiple
                                  value={visitData.sectors}
                                  onChange={handleMultiSelectChange}
                                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-base ${errors.sectors
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                                  size="5"
                                >
                                  {availableSectors.map((sector) => (
                                    <option key={sector.id} value={sector.id}>
                                      {sector.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {visitData.sectors.length > 0 && (
                                <p className="mt-1 text-sm text-gray-600">Selecionados: {visitData.sectors.length}</p>
                              )}
                              {errors.sectors && (
                                <p className="mt-1 text-sm text-red-600">{errors.sectors}</p>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          <div>
                            <label htmlFor="description" className="block text-base font-medium text-gray-700">
                              Descrição
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                name="description"
                                rows={5}
                                value={visitData.description}
                                onChange={handleVisitDataChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-base"
                                placeholder="Informações adicionais (opcional)..."
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRegisterVisit}
                  disabled={!selectedVisitor}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 text-lg font-medium text-white sm:ml-3 sm:w-auto ${!selectedVisitor
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
                >
                  <Check className="h-6 w-6 mr-2" />
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false)
                    setSelectedVisitor(null)
                    setVisitorSearchTerm('')
                    setFilteredVisitorResults([])
                    setVisitData({
                      purpose: '',
                      description: '',
                      departments: [],
                      sectors: []
                    })
                    setErrors({})
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-6 py-3 bg-white text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && exitVisit && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar Saída de Visitante
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Você está registrando a saída de <span className="font-medium">{exitVisit.visitor?.name || 'Visitante'}</span>.
                        Esta ação não pode ser desfeita.
                      </p>
                      <div className="mt-3 bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Entrada:</span> {exitVisit.entryTime ? format(new Date(exitVisit.entryTime), 'dd/MM/yyyy HH:mm') : 'Horário não disponível'}
                        </p>
                        {exitVisit.purpose && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Propósito:</span> {exitVisit.purpose}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmEndVisit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirmar Saída
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    setExitVisitId(null);
                    setExitVisit(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitorEntry
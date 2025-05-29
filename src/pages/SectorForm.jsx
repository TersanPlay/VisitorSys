import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sectorService } from '../services/sectorService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import {
  Building,
  Save,
  X,
  ArrowLeft,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  User,
  Hash,
  MapPin,
  Clock,
  Mail,
  Phone,
  Smartphone,
  FileText,
  Activity
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const SectorForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditMode)
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    description: '',
    location: '',
    responsibleName: '',
    responsibleEmail: '',
    responsiblePhone: '',
    responsibleMobile: '',
    workingHours: {
      startTime: '08:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    status: 'active'
  })
  const [errors, setErrors] = useState({})
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)

  useEffect(() => {
    if (isEditMode) {
      loadSectorData()
    }
  }, [id])

  const loadSectorData = async () => {
    try {
      setLoadingData(true)
      const sector = await sectorService.getSectorById(id)

      if (!sector) {
        toast.error('Setor não encontrado')
        navigate('/sectors')
        return
      }

      // Parse working hours if it's a string (legacy format)
      let parsedWorkingHours = {
        startTime: '08:00',
        endTime: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }

      if (sector.workingHours) {
        if (typeof sector.workingHours === 'string') {
          // Keep the string for display but use default object for editing
          parsedWorkingHours = {
            startTime: '08:00',
            endTime: '17:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        } else {
          parsedWorkingHours = sector.workingHours
        }
      }

      setFormData({
        name: sector.name || '',
        acronym: sector.acronym || '',
        description: sector.description || '',
        location: sector.location || '',
        responsibleName: sector.responsibleName || '',
        responsibleEmail: sector.responsibleEmail || '',
        responsiblePhone: sector.responsiblePhone || '',
        responsibleMobile: sector.responsibleMobile || '',
        workingHours: parsedWorkingHours,
        status: sector.status || 'active'
      })

      if (sector.iconUrl) {
        setIconPreview(sector.iconUrl)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do setor:', error)
      toast.error('Erro ao carregar dados do setor')
      navigate('/sectors')
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleWorkingHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }))
  }

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const currentDays = prev.workingHours.days
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day]

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          days: newDays
        }
      }
    })
  }

  const formatWorkingHoursForBackend = (workingHours) => {
    const dayNames = {
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',
      sunday: 'Domingo'
    }

    const selectedDays = workingHours.days.map(day => dayNames[day]).join(', ')
    return `${selectedDays}, das ${workingHours.startTime} às ${workingHours.endTime}`
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Verificar tipo de arquivo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Verificar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O tamanho máximo do arquivo é 2MB')
      return
    }

    setIconFile(file)

    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = () => {
      setIconPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeIcon = () => {
    setIconFile(null)
    setIconPreview(null)
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar campos obrigatórios
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do setor é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória'
    }

    if (!formData.responsibleName.trim()) {
      newErrors.responsibleName = 'Nome do responsável é obrigatório'
    }

    // Validar e-mail se preenchido
    if (formData.responsibleEmail.trim() && !validateEmail(formData.responsibleEmail)) {
      newErrors.responsibleEmail = 'E-mail inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)

      // Format working hours for backend
      const formDataToSend = {
        ...formData,
        workingHours: formatWorkingHoursForBackend(formData.workingHours)
      }

      if (isEditMode) {
        await sectorService.updateSector(id, formDataToSend, iconFile)
        toast.success('Setor atualizado com sucesso')
      } else {
        await sectorService.createSector(formDataToSend, iconFile)
        toast.success('Setor criado com sucesso')
      }

      navigate('/sectors')
    } catch (error) {
      console.error('Erro ao salvar setor:', error)
      toast.error(error.message || 'Erro ao salvar setor')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/sectors')}
          className="mr-4 text-gray-600 hover:text-gray-900"
          title="Voltar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Setor' : 'Novo Setor'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seção de ícone/imagem */}
            <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              {iconPreview ? (
                <div className="relative">
                  <img
                    src={iconPreview}
                    alt="Preview do ícone"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeIcon}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="mt-4 flex flex-col items-center">
                <label
                  htmlFor="icon-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {iconPreview ? 'Trocar imagem' : 'Carregar ícone'}
                </label>
                <input
                  id="icon-upload"
                  name="icon"
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="sr-only"
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG ou GIF (máx. 2MB)
                </p>
              </div>
            </div>

            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Nome do Setor *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px] ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ex: Recursos Humanos"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="acronym" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Sigla (opcional)
                </label>
                <input
                  type="text"
                  id="acronym"
                  name="acronym"
                  value={formData.acronym}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px]"
                  placeholder="Ex: RH"
                  maxLength={10}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Localização *
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px] ${errors.location ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione a localização</option>
                  <option value="Térreo">Térreo</option>
                  <option value="1° Piso">1° Piso</option>
                  <option value="2° Piso">2° Piso</option>
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center mb-3">
                  <Clock className="h-4 w-4 mr-2" />
                  Horário de Funcionamento
                </label>
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {/* Horários */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Início
                      </label>
                      <input
                        type="time"
                        value={formData.workingHours.startTime}
                        onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fim
                      </label>
                      <input
                        type="time"
                        value={formData.workingHours.endTime}
                        onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Dias da semana */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Dias da semana
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'monday', label: 'Seg' },
                        { key: 'tuesday', label: 'Ter' },
                        { key: 'wednesday', label: 'Qua' },
                        { key: 'thursday', label: 'Qui' },
                        { key: 'friday', label: 'Sex' },
                        { key: 'saturday', label: 'Sáb' },
                        { key: 'sunday', label: 'Dom' }
                      ].map(day => (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleDayToggle(day.key)}
                          className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${formData.workingHours.days.includes(day.key)
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do responsável e descrição */}
            <div className="space-y-4">
              <div>
                <label htmlFor="responsibleName" className="block text-sm font-medium text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Responsável pelo Setor *
                </label>
                <input
                  type="text"
                  id="responsibleName"
                  name="responsibleName"
                  value={formData.responsibleName}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px] ${errors.responsibleName ? 'border-red-500' : ''}`}
                  placeholder="Nome completo do responsável"
                />
                {errors.responsibleName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.responsibleName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="responsibleEmail" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail do Responsável
                </label>
                <input
                  type="email"
                  id="responsibleEmail"
                  name="responsibleEmail"
                  value={formData.responsibleEmail}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px] ${errors.responsibleEmail ? 'border-red-500' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {errors.responsibleEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.responsibleEmail}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="responsiblePhone" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Telefone/Ramal (opcional)
                  </label>
                  <input
                    type="text"
                    id="responsiblePhone"
                    name="responsiblePhone"
                    value={formData.responsiblePhone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px]"
                    placeholder="Ex: (00) 0000-0000"
                  />
                </div>

                <div>
                  <label htmlFor="responsibleMobile" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Celular (opcional)
                  </label>
                  <input
                    type="text"
                    id="responsibleMobile"
                    name="responsibleMobile"
                    value={formData.responsibleMobile}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px]"
                    placeholder="Ex: (00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[50px]"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            {/* Descrição (ocupa toda a largura) */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Descrição/Finalidade *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-4 text-lg min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Descreva a finalidade e as principais atividades deste setor"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Campos obrigatórios */}
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Campos marcados com * são obrigatórios
          </div>

          {/* Botões de ação */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/sectors')}
              className="px-6 py-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center min-h-[50px]"
            >
              <X className="h-5 w-5 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed min-h-[50px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SectorForm
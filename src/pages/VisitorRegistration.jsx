import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import { faceRecognitionService } from '../services/faceRecognitionService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Webcam from 'react-webcam'
import {
  Camera,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Save,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const VisitorRegistration = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [faceLoading, setFaceLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cnh: '',
    company: '',
    purpose: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [showCpf, setShowCpf] = useState(false)
  const [showRg, setShowRg] = useState(false)

  const initializeFaceRecognition = async () => {
    try {
      await faceRecognitionService.initialize()
    } catch (error) {
      console.error('Error initializing face recognition:', error)
      toast.error('Erro ao inicializar reconhecimento facial')
    }
  }

  // Adicionando a função handleShowCamera dentro do componente
  const handleShowCamera = async () => {
    try {
      // Inicializa o reconhecimento facial apenas quando o usuário quer usar a câmera
      await initializeFaceRecognition()
      // Se a inicialização for bem-sucedida, mostra a câmera
      setShowCamera(true)
    } catch (error) {
      console.error('Error initializing camera:', error)
      toast.error('Erro ao inicializar câmera')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.phone && !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido'
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (formData.cnh && !validateCNH(formData.cnh)) {
      newErrors.cnh = 'CNH inválida'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Propósito da visita é obrigatório'
    }

    if (!capturedImage) {
      newErrors.photo = 'Foto é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCPF = (cpf) => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return false

    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false

    // Validate check digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }
    let checkDigit = 11 - (sum % 11)
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
    if (checkDigit !== parseInt(cleanCpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }
    checkDigit = 11 - (sum % 11)
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0
    if (checkDigit !== parseInt(cleanCpf.charAt(10))) return false

    return true
  }

  const validateCNH = (cnh) => {
    const cleanCnh = cnh.replace(/\D/g, '')
    if (cleanCnh.length !== 11) return false

    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCnh)) return false

    // CNH validation algorithm
    let sum = 0
    let seq = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCnh.charAt(i)) * (9 - i)
    }
    let dv1 = sum % 11
    if (dv1 >= 10) {
      dv1 = 0
      seq = 1
    }

    sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCnh.charAt(i)) * (1 + i)
    }
    let dv2 = sum % 11
    if (dv2 >= 10) {
      dv2 = 0
    } else if (dv2 < 2) {
      dv2 = 0
    }

    return (parseInt(cleanCnh.charAt(9)) === dv1 && parseInt(cleanCnh.charAt(10)) === dv2)
  }

  const formatCPF = (value) => {
    const cleanValue = value.replace(/\D/g, '')
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const formatCNH = (value) => {
    const cleanValue = value.replace(/\D/g, '')
    return cleanValue.replace(/(\d{11})/, '$1')
  }

  const formatPhone = (value) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 10) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cpf') {
      formattedValue = formatCPF(value)
    } else if (name === 'cnh') {
      formattedValue = formatCNH(value)
    } else if (name === 'phone') {
      formattedValue = formatPhone(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const capturePhoto = async () => {
    if (!webcamRef.current) return

    try {
      setFaceLoading(true)
      const imageSrc = webcamRef.current.getScreenshot()

      if (!imageSrc) {
        toast.error('Erro ao capturar imagem')
        return
      }

      // Validate face in the captured image
      const img = new Image()
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const isValid = await faceRecognitionService.validateImageQuality(canvas)

          if (isValid) {
            setCapturedImage(imageSrc)
            setFaceDetected(true)
            setShowCamera(false)
            toast.success('Foto capturada com sucesso!')

            // Clear photo error if it exists
            if (errors.photo) {
              setErrors(prev => ({ ...prev, photo: '' }))
            }
          } else {
            toast.error('Nenhum rosto detectado na imagem. Tente novamente.')
          }
        } catch (error) {
          console.error('Error validating face:', error)
          toast.error('Erro ao validar rosto na imagem')
        }
      }
      img.src = imageSrc
    } catch (error) {
      console.error('Error capturing photo:', error)
      toast.error('Erro ao capturar foto')
    } finally {
      setFaceLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setFaceDetected(false)
    setShowCamera(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      setLoading(true)

      // Register visitor with photo
      const visitorData = {
        ...formData,
        photo: capturedImage,
        registeredBy: user.id,
        registeredAt: new Date().toISOString()
      }

      const result = await visitorService.registerVisitor(visitorData)

      if (result.success) {
        toast.success('Visitante cadastrado com sucesso!')
        navigate('/visitors')
      } else {
        toast.error(result.message || 'Erro ao cadastrar visitante')
      }
    } catch (error) {
      console.error('Error registering visitor:', error)
      toast.error('Erro ao cadastrar visitante')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      rg: '',
      cnh: '',
      company: '',
      purpose: '',
      notes: ''
    })
    setCapturedImage(null)
    setFaceDetected(false)
    setShowCamera(false)
    setErrors({})
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro de Visitante</h1>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados do visitante e capture uma foto
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Foto do Visitante</h3>

              {!showCamera && !capturedImage && (
                <div className="text-center">
                  <div className="mx-auto h-32 w-32 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-12 w-12 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    onClick={handleShowCamera} // Usando a nova função que inicializa o reconhecimento facial
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capturar Foto
                  </button>
                </div>
              )}

              {showCamera && (
                <div className="space-y-4">
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-lg"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                      }}
                    />
                    <div className="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={faceLoading}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {faceLoading ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full rounded-lg"
                    />
                    {faceDetected && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Capturar Novamente
                  </button>
                </div>
              )}

              {errors.photo && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.photo}
                </p>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Dados do Visitante</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome Completo *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.name
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.phone
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* CPF */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                    CPF
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      maxLength={14}
                      className={`block w-full pl-3 pr-10 py-4 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.cpf
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="000.000.000-00"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCpf(!showCpf)}
                    >
                      {showCpf ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                  )}
                </div>

                {/* RG */}
                <div>
                  <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
                    RG
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      id="rg"
                      name="rg"
                      value={formData.rg}
                      onChange={handleChange}
                      className="block w-full pl-3 pr-10 py-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-lg min-h-[50px]"
                      placeholder="00.000.000-0"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowRg(!showRg)}
                    >
                      {showRg ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* CNH */}
                <div>
                  <label htmlFor="cnh" className="block text-sm font-medium text-gray-700">
                    CNH (opcional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="cnh"
                      name="cnh"
                      value={formData.cnh}
                      onChange={handleChange}
                      maxLength={11}
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.cnh
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="00000000000"
                    />
                  </div>
                  {errors.cnh && (
                    <p className="mt-1 text-sm text-red-600">{errors.cnh}</p>
                  )}
                </div>

                {/* Company */}
                <div className="md:col-span-2">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Empresa/Organização (opcional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-lg min-h-[50px]"
                      placeholder="Nome da empresa ou organização"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Propósito da Visita *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-lg min-h-[50px] ${errors.purpose
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                    >
                      <option value="">Selecione o propósito da visita</option>
                      <option value="Solicitar informações públicas (transparência e acesso à informação)">Solicitar informações públicas (transparência e acesso à informação)</option>
                      <option value="Protocolar documentos (requerimentos, ofícios, sugestões, denúncias)">Protocolar documentos (requerimentos, ofícios, sugestões, denúncias)</option>
                      <option value="Participar de audiências públicas">Participar de audiências públicas</option>
                      <option value="Consultar documentos oficiais (leis, atas, projetos, contratos, etc.)">Consultar documentos oficiais (leis, atas, projetos, contratos, etc.)</option>
                      <option value="Buscar orientação sobre serviços legislativos">Buscar orientação sobre serviços legislativos</option>
                      <option value="Participar de visitas guiadas ou eventos educativos">Participar de visitas guiadas ou eventos educativos</option>
                      <option value="Falar com vereadores (agendamento ou atendimento direto)">Falar com vereadores (agendamento ou atendimento direto)</option>
                      <option value="Utilizar a biblioteca legislativa ou arquivo histórico">Utilizar a biblioteca legislativa ou arquivo histórico</option>
                      <option value="Participar de reuniões de comissões temáticas">Participar de reuniões de comissões temáticas</option>
                      <option value="Reivindicar melhorias para o bairro ou comunidade">Reivindicar melhorias para o bairro ou comunidade</option>
                      <option value="Trabalhar (servidores públicos, estagiários, terceirizados)">Trabalhar (servidores públicos, estagiários, terceirizados)</option>
                      <option value="Realizar cobertura jornalística ou acadêmica">Realizar cobertura jornalística ou acadêmica</option>
                      <option value="Participar de solenidades e homenagens">Participar de solenidades e homenagens</option>
                      <option value="Conversar com um vereador (agendar reunião ou atendimento direto)">Conversar com um vereador (agendar reunião ou atendimento direto)</option>
                      <option value="Entregar demandas da comunidade (reivindicações, abaixo-assinados, denúncias)">Entregar demandas da comunidade (reivindicações, abaixo-assinados, denúncias)</option>
                      <option value="Solicitar apoio">Solicitar apoio</option>
                      <option value="Participar de encontros com vereadores em eventos públicos internos">Participar de encontros com vereadores em eventos públicos internos</option>
                      <option value="Registrar denúncias sobre omissão ou conduta de vereadores">Registrar denúncias sobre omissão ou conduta de vereadores</option>
                      <option value="Entregar convites oficiais ou comunicados da comunidade">Entregar convites oficiais ou comunicados da comunidade</option>
                      <option value="Solicitar homenagens, moções ou títulos honoríficos">Solicitar homenagens, moções ou títulos honoríficos</option>
                      <option value="Apresentar projetos sociais ou culturais ao gabinete de um vereador">Apresentar projetos sociais ou culturais ao gabinete de um vereador</option>
                      <option value="Reivindicar melhorias para bairros, escolas, ruas, saúde, transporte etc.">Reivindicar melhorias para bairros, escolas, ruas, saúde, transporte etc.</option>
                      <option value="Buscar apoio político para iniciativas comunitárias ou associações">Buscar apoio político para iniciativas comunitárias ou associações</option>
                      <option value="Discutir pautas relacionadas ao orçamento municipal com vereadores">Discutir pautas relacionadas ao orçamento municipal com vereadores</option>
                      <option value="Participar de reuniões organizadas por gabinetes parlamentares">Participar de reuniões organizadas por gabinetes parlamentares</option>
                    </select>
                    />
                  </div>
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="block w-full px-3 py-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-lg min-h-[80px]"
                      placeholder="Informações adicionais (opcional)..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/visitors')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cadastrar Visitante
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default VisitorRegistration
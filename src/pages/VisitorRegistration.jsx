import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Webcam from 'react-webcam'
import { RefreshCw, Save, Building, Mail, Phone, FileText, Briefcase, MessageSquare, MapPin, Hash, Home, Map, User } from 'lucide-react'
import PhotoCaptureSection from '../components/VisitorRegistration/PhotoCaptureSection';
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import { faceRecognitionService } from '../services/faceRecognitionService'
import { cameraService } from '../services/cameraService'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const VisitorRegistration = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [faceLoading, setFaceLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraPermissions, setCameraPermissions] = useState(null)
  const [selectedCameraId, setSelectedCameraId] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [availableCameras, setAvailableCameras] = useState([])
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    name: '',
    nomeSocial: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cnh: '',
    company: '',
    notes: '',
    photo: null,
    visitReason: '',
    // Novos campos de endereço
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  })
  const [errors, setErrors] = useState({})
  const [showCpf, setShowCpf] = useState(false)
  const [showRg, setShowRg] = useState(false)
  const [primaryDocument, setPrimaryDocument] = useState('')
  const [showOptionalDocuments, setShowOptionalDocuments] = useState(false)
  // Removido: const [availableDepartments, setAvailableDepartments] = useState([])

  useEffect(() => {
    // Removido: loadDepartments()
    checkCameraPermissions()
    loadCameras()
  }, [])

  const checkCameraPermissions = async () => {
    try {
      const permissions = await cameraService.checkPermissions()
      setCameraPermissions(permissions)
    } catch (error) {
      console.error('Erro ao verificar permissões da câmera:', error)
      setCameraPermissions(false)
    }
  }

  const loadCameras = async () => {
    try {
      // Verifica se o navegador suporta mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('Este navegador não suporta a API de câmera');
        setAvailableCameras([]);
        return;
      }

      const cameras = await cameraService.enumerateDevices();
      setAvailableCameras(cameras);
      if (cameras.length > 0) {
        setSelectedCameraId(cameras[0].deviceId);
      }
    } catch (error) {
      console.error('Erro ao carregar câmeras:', error);
      setAvailableCameras([]);
      // Não exibe erro para o usuário já que a foto é opcional
    }
  }

  // Removido: const loadDepartments = async () => { ... }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const openCamera = async () => {
    // Verifica se o navegador suporta a API de câmera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPhotoError('Este navegador não suporta acesso à câmera. Como a foto é opcional, você pode continuar o cadastro sem ela.');
      return;
    }

    if (!cameraPermissions) {
      try {
        const granted = await cameraService.requestPermissions();
        setCameraPermissions(granted);
        if (!granted) {
          setPhotoError('Permissão para câmera negada. Como a foto é opcional, você pode continuar o cadastro sem ela.');
          return;
        }
      } catch (error) {
        console.error('Erro ao solicitar permissões da câmera:', error);
        setPhotoError('Erro ao acessar a câmera. Como a foto é opcional, você pode continuar o cadastro sem ela.');
        return;
      }
    }

    setCameraLoading(true);
    setShowCamera(true);
    setPhotoError(null);

    setTimeout(() => {
      setCameraLoading(false);
      setCameraReady(true);
    }, 1000);
  }

  const capturePhoto = async () => {
    if (!webcamRef.current) {
      setPhotoError('Câmera não inicializada. Por favor, tente novamente.')
      return
    }

    setIsCapturing(true)
    setFaceLoading(true)

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) {
        throw new Error('Falha ao capturar imagem')
      }

      setCapturedImage(imageSrc)
      setFormData({ ...formData, photo: imageSrc })
      setShowCamera(false)

      // Detecta face na imagem capturada
      const hasFace = await faceRecognitionService.detectFace(imageSrc)
      setFaceDetected(hasFace)

      if (!hasFace) {
        setPhotoError('Nenhum rosto detectado na imagem. Por favor, capture uma foto com o rosto visível.')
      } else {
        setPhotoError(null)
      }
    } catch (error) {
      console.error('Erro ao capturar foto:', error)
      setPhotoError('Erro ao capturar foto. Por favor, tente novamente.')
    } finally {
      setIsCapturing(false)
      setFaceLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setFormData({ ...formData, photo: null })
    setFaceDetected(false)
    setPhotoError(null)
    openCamera()
  }

  const validateForm = () => {
    const newErrors = {}

    // Validação de campos obrigatórios
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    if (!formData.company.trim()) newErrors.company = 'Empresa é obrigatória'
    if (!formData.visitReason.trim()) newErrors.visitReason = 'Motivo da visita é obrigatório'

    // Validação de campos de endereço obrigatórios
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório'
    if (!formData.rua.trim()) newErrors.rua = 'Rua/Avenida é obrigatório'
    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório'
    if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório'
    if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória'
    if (!formData.uf.trim()) newErrors.uf = 'UF é obrigatório'

    // Validação de documento principal
    if (!primaryDocument) {
      newErrors.document = 'Selecione um documento principal'
    } else if (primaryDocument === 'cpf' && !formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (primaryDocument === 'cnh' && !formData.cnh.trim()) {
      newErrors.cnh = 'CNH é obrigatória'
    }


    // Validação da foto - agora opcional
    if (formData.photo && !faceDetected) {
      newErrors.photo = 'A foto deve conter um rosto visível'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)

    try {
      // Prepara os dados do visitante
      const visitorData = {
        name: formData.name,
        nomeSocial: formData.nomeSocial,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        visitReason: formData.visitReason,
        notes: formData.notes,
        photo: formData.photo,
        // Dados de endereço
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf
        },
        // Removido: departments: formData.departments,
        documents: {}
      }

      // Adiciona o documento principal
      if (primaryDocument === 'cpf') {
        visitorData.documents.cpf = formData.cpf
      } else if (primaryDocument === 'cnh') {
        visitorData.documents.cnh = formData.cnh
      }

      // Adiciona documentos opcionais
      if (showOptionalDocuments && formData.rg) {
        visitorData.documents.rg = formData.rg
      }

      // Adiciona informações do usuário que registrou o visitante
      visitorData.registeredBy = {
        id: user.id,
        name: user.name,
        email: user.email
      }

      // Salva o visitante
      const result = await visitorService.registerVisitor(visitorData)

      toast.success('Visitante registrado com sucesso!')
      resetForm()

      // Redireciona para a página de entrada do visitante
      navigate(`/visitors/entry/${result.id}`)
    } catch (error) {
      console.error('Erro ao registrar visitante:', error)
      toast.error('Erro ao registrar visitante. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nomeSocial: '',
      email: '',
      phone: '',
      cpf: '',
      rg: '',
      cnh: '',
      company: '',
      notes: '',
      photo: null,
      visitReason: '',
      // Novos campos de endereço
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
      // Removido: departments: []
    })
    setPrimaryDocument('')
    setShowOptionalDocuments(false)
    setCapturedImage(null)
    setFaceDetected(false)
    setShowCamera(false)
    setErrors({})
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Visitor Information with Photo */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastro de Visitante</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Preencha os dados do visitante e capture uma foto
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Photo Section */}
              <div className="lg:col-span-1">
                <PhotoCaptureSection
                  capturedImage={capturedImage}
                  setCapturedImage={setCapturedImage}
                  showCamera={showCamera}
                  setShowCamera={setShowCamera}
                  openCamera={openCamera}
                  webcamRef={webcamRef}
                  selectedCameraId={selectedCameraId}
                  setSelectedCameraId={setSelectedCameraId}
                  availableCameras={availableCameras}
                  capturePhoto={capturePhoto}
                  isCapturing={isCapturing}
                  cameraLoading={cameraLoading}
                  setPhotoError={setPhotoError}
                  retakePhoto={retakePhoto}
                  faceDetected={faceDetected}
                  photoError={photoError}
                  errors={errors}
                />
              </div>

              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Informações Pessoais</h3>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome Completo *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.name
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                          }`}
                        placeholder="Nome completo do visitante"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Nome Social (opcional) */}
                  <div>
                    <label htmlFor="nomeSocial" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nome Social (opcional)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="nomeSocial"
                        id="nomeSocial"
                        value={formData.nomeSocial}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Nome social do visitante (se aplicável)"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                          }`}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Telefone *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.phone
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                          }`}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Empresa *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.company
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                          }`}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.company}</p>
                    )}
                  </div>

                  {/* Visit Reason */}
                  <div>
                    <label htmlFor="visitReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Motivo da Visita *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="visitReason"
                        id="visitReason"
                        value={formData.visitReason}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.visitReason
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                          }`}
                        placeholder="Motivo da visita"
                      />
                    </div>
                    {errors.visitReason && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.visitReason}</p>
                    )}
                  </div>

                  {/* Primary Document Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Documento Principal *
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            id="cpf"
                            name="primaryDocument"
                            type="radio"
                            value="cpf"
                            checked={primaryDocument === 'cpf'}
                            onChange={() => {
                              setPrimaryDocument('cpf')
                              setShowCpf(true)
                              setShowRg(false)
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label htmlFor="cpf" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            CPF
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="cnh"
                            name="primaryDocument"
                            type="radio"
                            value="cnh"
                            checked={primaryDocument === 'cnh'}
                            onChange={() => {
                              setPrimaryDocument('cnh')
                              setShowCpf(false)
                              setShowRg(true)
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label htmlFor="cnh" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            CNH
                          </label>
                        </div>
                      </div>
                      {errors.document && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.document}</p>
                      )}
                    </div>

                    {/* CPF Field */}
                    {primaryDocument === 'cpf' && (
                      <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          CPF *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="cpf"
                            id="cpf-input"
                            value={formData.cpf}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.cpf
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="000.000.000-00"
                            maxLength={14}
                          />
                        </div>
                        {errors.cpf && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.cpf}</p>
                        )}
                      </div>
                    )}

                    {/* CNH Field */}
                    {primaryDocument === 'cnh' && (
                      <div>
                        <label htmlFor="cnh" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          CNH *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="cnh"
                            id="cnh-input"
                            value={formData.cnh}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.cnh
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="00000000000"
                            maxLength={11}
                          />
                        </div>
                        {errors.cnh && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.cnh}</p>
                        )}
                      </div>
                    )}

                    {/* Optional Documents Toggle */}
                    <div className="flex items-center">
                      <input
                        id="show-optional-documents"
                        name="showOptionalDocuments"
                        type="checkbox"
                        checked={showOptionalDocuments}
                        onChange={() => setShowOptionalDocuments(!showOptionalDocuments)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                      />
                      <label htmlFor="show-optional-documents" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Adicionar documentos opcionais
                      </label>
                    </div>

                    {/* Optional Documents */}
                    {showOptionalDocuments && (
                      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* RG Field */}
                        <div>
                          <label htmlFor="rg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            RG
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="rg"
                              id="rg"
                              value={formData.rg}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="00.000.000-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Observações
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="notes"
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Informações adicionais sobre o visitante"
                      />
                    </div>
                  </div>

                  {/* Endereço Section */}
                  <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Endereço</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CEP */}
                      <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          CEP *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="cep"
                            id="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.cep
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                        </div>
                        {errors.cep && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.cep}</p>
                        )}
                      </div>

                      {/* Rua/Avenida */}
                      <div className="md:col-span-2">
                        <label htmlFor="rua" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rua / Avenida *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="rua"
                            id="rua"
                            value={formData.rua}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.rua
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="Nome da rua ou avenida"
                          />
                        </div>
                        {errors.rua && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.rua}</p>
                        )}
                      </div>

                      {/* Número */}
                      <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Número *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="numero"
                            id="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.numero
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="Número"
                          />
                        </div>
                        {errors.numero && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.numero}</p>
                        )}
                      </div>

                      {/* Complemento */}
                      <div>
                        <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Complemento (opcional)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="complemento"
                            id="complemento"
                            value={formData.complemento}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            placeholder="Apartamento, sala, etc."
                          />
                        </div>
                      </div>

                      {/* Bairro */}
                      <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bairro *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="bairro"
                            id="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.bairro
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="Bairro"
                          />
                        </div>
                        {errors.bairro && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.bairro}</p>
                        )}
                      </div>

                      {/* Cidade */}
                      <div>
                        <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cidade *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="cidade"
                            id="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.cidade
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="Cidade"
                          />
                        </div>
                        {errors.cidade && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.cidade}</p>
                        )}
                      </div>

                      {/* UF */}
                      <div>
                        <label htmlFor="uf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          UF (estado) *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Map className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="uf"
                            id="uf"
                            value={formData.uf}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${errors.uf
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:focus:ring-red-500 dark:focus:border-red-700'
                              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              }`}
                            placeholder="UF"
                            maxLength={2}
                          />
                        </div>
                        {errors.uf && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.uf}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Salvar Visitante
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VisitorRegistration;
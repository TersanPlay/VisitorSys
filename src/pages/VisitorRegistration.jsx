import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import Webcam from 'react-webcam'
import { Camera, RefreshCw, Check, X, Save, Building, User, Mail, Phone, FileText, Briefcase, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { visitorService } from '../services/visitorService'
import { faceRecognitionService } from '../services/faceRecognitionService'
import { cameraService } from '../services/cameraService'
import { sectorService } from '../services/sectorService'
import { departmentService } from '../services/departmentService'
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cnh: '',
    company: '',
    purpose: '',
    notes: '',
    sectors: [],      // Array para múltiplos setores
    departments: []   // Array para múltiplos departamentos
  })
  const [errors, setErrors] = useState({})
  const [showCpf, setShowCpf] = useState(false)
  const [showRg, setShowRg] = useState(false)
  const [primaryDocument, setPrimaryDocument] = useState('')
  const [availableSectors, setAvailableSectors] = useState([])
  const [availableDepartments, setAvailableDepartments] = useState([])

  const initializeFaceRecognition = async () => {
    try {
      console.log('Inicializando serviço de reconhecimento facial...')
      await faceRecognitionService.initialize()
      console.log('Serviço de reconhecimento facial inicializado com sucesso')
    } catch (error) {
      console.error('Error initializing face recognition:', error)
      toast.error('Erro ao inicializar reconhecimento facial')
    }
  }

  // Inicializar serviços quando o componente montar
  useEffect(() => {
    console.log('Componente VisitorRegistration montado, inicializando serviços...')
    initializeFaceRecognition()
    loadSectors()
    loadDepartments()

    // Cleanup quando o componente desmontar
    return () => {
      console.log('Componente VisitorRegistration desmontado, limpando recursos...')
      // Parar qualquer stream de câmera ativo
      if (webcamRef.current && webcamRef.current.stream) {
        console.log('Parando stream de câmera...')
        webcamRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Carregar setores disponíveis
  const loadSectors = async () => {
    try {
      const sectors = await sectorService.getAllSectors()
      setAvailableSectors(sectors)
    } catch (error) {
      console.error('Erro ao carregar setores:', error)
      toast.error('Erro ao carregar setores')
    }
  }

  // Carregar departamentos disponíveis
  const loadDepartments = async () => {
    try {
      const departments = await departmentService.getAllDepartments()
      setAvailableDepartments(departments)
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error)
      toast.error('Erro ao carregar departamentos')
    }
  }

  const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    if (cleanCPF.length !== 11) return false

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCPF)) return false

    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false

    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false

    return true
  }

  const validateCNH = (cnh) => {
    const cleanCNH = cnh.replace(/[^\d]/g, '')
    return cleanCNH.length === 11
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
    } else if (name === 'sectors' || name === 'departments') {
      // Para campos de seleção múltipla
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)

      // Limitar a 3 seleções
      const limitedSelections = selectedOptions.slice(0, 3)

      setFormData(prev => ({
        ...prev,
        [name]: limitedSelections
      }))

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }))
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const isImageEmptyOrBlack = async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        let totalBrightness = 0
        let pixelCount = 0
        let brightPixels = 0

        // Analyze image brightness and content
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3

          totalBrightness += brightness
          pixelCount++

          // Count pixels that are not completely black
          if (brightness > 5) {
            brightPixels++
          }
        }

        // Check average brightness and percentage of non-black pixels
        const avgBrightness = totalBrightness / pixelCount
        const brightPixelRatio = brightPixels / pixelCount

        // Image is considered empty/black if:
        // - Average brightness is very low (< 3) OR
        // - Less than 10% of pixels have any brightness
        const isEmpty = avgBrightness < 3 || brightPixelRatio < 0.1

        console.log('Image analysis:', {
          avgBrightness: avgBrightness.toFixed(2),
          brightPixelRatio: (brightPixelRatio * 100).toFixed(2) + '%',
          isEmpty
        })

        resolve(isEmpty)
      }
      img.onerror = () => {
        console.error('Erro ao carregar imagem para análise')
        resolve(true) // Consider as empty if can't load
      }
      img.src = dataUrl
    })
  }

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const createImageElement = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = dataUrl
    })
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

    // Validar documento principal obrigatório
    if (!primaryDocument) {
      newErrors.primaryDocument = 'Selecione um documento principal'
    } else {
      // Validar o documento principal selecionado
      if (primaryDocument === 'cpf') {
        if (!formData.cpf.trim()) {
          newErrors.cpf = 'CPF é obrigatório'
        } else if (!validateCPF(formData.cpf)) {
          newErrors.cpf = 'CPF inválido'
        }
      } else if (primaryDocument === 'rg') {
        if (!formData.rg.trim()) {
          newErrors.rg = 'RG é obrigatório'
        }
      } else if (primaryDocument === 'cnh') {
        if (!formData.cnh.trim()) {
          newErrors.cnh = 'CNH é obrigatória'
        } else if (!validateCNH(formData.cnh)) {
          newErrors.cnh = 'CNH inválida'
        }
      }
    }

    // Validar documentos opcionais apenas se preenchidos
    if (formData.cpf && primaryDocument !== 'cpf' && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (formData.cnh && primaryDocument !== 'cnh' && !validateCNH(formData.cnh)) {
      newErrors.cnh = 'CNH inválida'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Propósito da visita é obrigatório'
    }

    // Company é opcional agora

    // Pelo menos um setor ou departamento deve ser selecionado
    if (formData.sectors.length === 0 && formData.departments.length === 0) {
      newErrors.sectors = 'Selecione pelo menos um setor ou departamento'
      newErrors.departments = 'Selecione pelo menos um setor ou departamento'
    }

    if (!capturedImage) {
      newErrors.photo = 'Foto é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const openCamera = async () => {
    try {
      console.log('🎥 [CAMERA] Iniciando abertura da câmera...')
      setCameraLoading(true)
      setPhotoError(null)
      setCameraReady(false)

      // Verificar suporte do navegador
      const systemInfo = cameraService.getSystemInfo()
      console.log('🔧 [SYSTEM] Informações do sistema:', systemInfo)

      if (!systemInfo.hasMediaDevices) {
        throw new Error('Seu navegador não suporta acesso à câmera')
      }

      if (!systemInfo.hasGetUserMedia) {
        throw new Error('Seu navegador não suporta getUserMedia')
      }

      // Verificar permissões da câmera
      console.log('🔐 [PERMISSIONS] Verificando permissões da câmera...')
      const permissions = await cameraService.checkPermissions()
      setCameraPermissions(permissions)
      console.log('🔐 [PERMISSIONS] Estado das permissões:', permissions)

      if (permissions.state !== 'granted') {
        if (permissions.state === 'prompt') {
          console.log('🔐 [PERMISSIONS] Solicitando permissão da câmera...')
          // Tentar solicitar permissão
          const granted = await cameraService.requestPermission()
          console.log('🔐 [PERMISSIONS] Permissão concedida:', granted)
          if (!granted) {
            toast.error('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.')
            setCameraLoading(false)
            return
          }
        } else {
          console.log('🔐 [PERMISSIONS] Permissão negada permanentemente')
          toast.error('Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.')
          setCameraLoading(false)
          return
        }
      }

      // Listar dispositivos de câmera disponíveis
      console.log('📋 [DEVICES] Listando câmeras disponíveis...')
      const devices = await cameraService.listCameras()
      console.log('📋 [DEVICES] Câmeras encontradas:', devices.length, devices)

      if (devices.length === 0) {
        console.error('📋 [DEVICES] Nenhuma câmera encontrada')
        toast.error('Nenhuma câmera encontrada. Verifique se há uma câmera conectada ao seu dispositivo.')
        setCameraLoading(false)
        return
      }

      // Filtrar câmeras físicas (não virtuais)
      const physicalCameras = devices.filter(device => !device.isVirtual)
      console.log('📋 [DEVICES] Câmeras físicas:', physicalCameras.length, physicalCameras)

      if (physicalCameras.length === 0) {
        console.warn('📋 [DEVICES] Apenas câmeras virtuais encontradas')
        toast.error('Apenas câmeras virtuais foram encontradas. Por favor, conecte uma câmera física.')
        setCameraLoading(false)
        return
      }

      // Usar a primeira câmera física disponível ou a selecionada pelo usuário
      const cameraId = selectedCameraId || physicalCameras[0].deviceId
      const selectedCamera = devices.find(d => d.deviceId === cameraId) || physicalCameras[0]
      console.log('🎯 [CAMERA] Câmera selecionada:', selectedCamera)
      setSelectedCameraId(selectedCamera.deviceId)

      // Testar a câmera antes de ativar
      console.log('🧪 [TEST] Testando câmera selecionada...')
      const testResult = await cameraService.testCamera(selectedCamera.deviceId)
      console.log('🧪 [TEST] Resultado do teste:', testResult)

      if (!testResult.working) {
        throw new Error(`Câmera não está funcionando: ${testResult.error || 'Erro desconhecido'}`)
      }

      // Mostrar a câmera
      console.log('✅ [CAMERA] Ativando interface da câmera...')
      setShowCamera(true)

      // Timeout para garantir que não ficará carregando indefinidamente
      setTimeout(() => {
        if (cameraLoading) {
          console.warn('⏰ [TIMEOUT] Timeout na ativação da câmera')
          setCameraLoading(false)
          if (!cameraReady) {
            toast.error('Timeout na ativação da câmera. Tente novamente.')
            setShowCamera(false)
          }
        }
      }, 15000) // 15 segundos

    } catch (error) {
      console.error('❌ [ERROR] Erro ao abrir câmera:', error)
      setCameraLoading(false)
      setShowCamera(false)
      toast.error('Erro ao abrir câmera: ' + error.message)
    }
  }

  const capturePhoto = async () => {
    try {
      setIsCapturing(true)
      setPhotoError(null)

      if (!webcamRef.current) {
        throw new Error('Câmera não inicializada')
      }

      // Verificar se a câmera está pronta
      if (!webcamRef.current.video || !webcamRef.current.video.readyState === 4) {
        throw new Error('Câmera não está pronta')
      }

      // Verificar se é uma câmera virtual
      const stream = webcamRef.current.stream
      if (!stream) {
        throw new Error('Stream de câmera não disponível')
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) {
        throw new Error('Track de vídeo não disponível')
      }

      // Tentar detectar se é uma câmera virtual com mais precisão
      const settings = videoTrack.getSettings()
      const label = (settings.label || videoTrack.label || '').toLowerCase()

      console.log('=== DETECÇÃO DE CÂMERA ===');
      console.log('Label original:', videoTrack.label);
      console.log('Label processado:', label);
      console.log('Settings completos:', settings);
      console.log('DeviceId:', settings.deviceId);

      // Detecção mais específica de câmeras virtuais
      const virtualKeywords = [
        'obs virtual camera',
        'obs-camera',
        'snap camera',
        'manycam',
        'xsplit vcam',
        'virtual camera',
        'droidcam',
        'iriun webcam'
      ];

      const isVirtual = virtualKeywords.some(keyword => label.includes(keyword));

      console.log('Câmera classificada como:', isVirtual ? 'VIRTUAL' : 'FÍSICA');
      console.log('Keywords testadas:', virtualKeywords);
      console.log('========================');

      // Bloquear câmeras virtuais em produção
      const isDev = process.env.NODE_ENV === 'development';
      const allowVirtualCameras = false; // Não permitir câmeras virtuais

      if (isVirtual && !allowVirtualCameras) {
        console.error('BLOQUEIO: Câmera virtual detectada e bloqueada');
        toast.error('Câmeras virtuais não são permitidas para cadastro de visitantes. Use uma câmera física.');
        throw new Error('Câmeras virtuais não são permitidas');
      }

      if (!isVirtual) {
        console.log('✅ Câmera física aprovada para uso');
      }

      // Capturar screenshot
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        throw new Error('Não foi possível capturar a foto');
      }

      // Verificar se a imagem não está vazia ou preta
      const isEmptyOrBlack = await isImageEmptyOrBlack(screenshot);
      if (isEmptyOrBlack) {
        throw new Error('A imagem capturada está vazia ou muito escura');
      }

      // Converter screenshot para File
      const file = dataURLtoFile(screenshot, 'visitor-photo.jpg');

      // Verificar qualidade da imagem
      const imageElement = await createImageElement(screenshot);
      const validation = await faceRecognitionService.validateImageQuality(imageElement, {
        minFaceRatio: 0.02, // Valor mais baixo para permitir rostos menores
        maxCenterDistance: 0.3 // Mais tolerante com posicionamento do rosto
      });

      if (!validation.valid) {
        throw new Error(`Problema na foto: ${validation.reason}`);
      }

      // Definir a foto capturada
      setCapturedImage(screenshot);
      setFormData(prev => ({ ...prev, photo: file }));
      setShowCamera(false);
      toast.success('Foto capturada com sucesso!');
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      setPhotoError(error.message);
      toast.error(`Erro ao capturar foto: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null)
    setFormData(prev => ({ ...prev, photo: null }))
    setFaceDetected(false)
    setShowCamera(true)
    setPhotoError(null)
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
        visitReason: formData.purpose, // Mapeando purpose para visitReason
        photo: capturedImage,
        registeredBy: user.id,
        registeredAt: new Date().toISOString()
      }

      const result = await visitorService.registerVisitor(visitorData)

      if (result.success) {
        toast.success('Visitante cadastrado com sucesso!')
        navigate('/visitors')
      } else {
        toast.error(`Erro ao cadastrar visitante: ${result.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao cadastrar visitante:', error)
      toast.error(`Erro ao cadastrar visitante: ${error.message || 'Erro desconhecido'}`)
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
      notes: '',
      sectors: [],
      departments: []
    })
    setPrimaryDocument('')
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
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Foto</h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {!showCamera && !capturedImage && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="h-24 w-24 text-gray-300" />
                      </div>
                      <button
                        type="button"
                        onClick={openCamera}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Abrir Câmera
                      </button>
                    </div>
                  )}

                  {showCamera && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            ...(selectedCameraId && { deviceId: { exact: selectedCameraId } }),
                            width: { ideal: 1280, min: 640 },
                            height: { ideal: 720, min: 480 },
                            facingMode: selectedCameraId ? undefined : 'user'
                          }}
                          onUserMedia={(stream) => {
                            console.log('✅ [WEBCAM] Câmera ativada com sucesso!')
                            console.log('✅ [WEBCAM] Stream details:', {
                              id: stream.id,
                              active: stream.active,
                              videoTracks: stream.getVideoTracks().length,
                              audioTracks: stream.getAudioTracks().length
                            })

                            const videoTrack = stream.getVideoTracks()[0]
                            if (videoTrack) {
                              console.log('✅ [WEBCAM] Video track:', {
                                label: videoTrack.label,
                                kind: videoTrack.kind,
                                readyState: videoTrack.readyState,
                                enabled: videoTrack.enabled,
                                settings: videoTrack.getSettings()
                              })
                            }

                            setCameraReady(true)
                            setCameraLoading(false)
                            toast.success('Câmera ativada com sucesso!')
                          }}
                          onUserMediaError={(error) => {
                            console.error('❌ [WEBCAM] Erro na ativação da câmera:', error)
                            console.error('❌ [WEBCAM] Error details:', {
                              name: error.name,
                              message: error.message,
                              constraint: error.constraint
                            })
                            setCameraLoading(false)
                            setShowCamera(false)

                            let errorMessage = 'Erro desconhecido'
                            if (error.name === 'NotAllowedError') {
                              errorMessage = 'Permissão de câmera negada'
                            } else if (error.name === 'NotFoundError') {
                              errorMessage = 'Nenhuma câmera encontrada'
                            } else if (error.name === 'NotReadableError') {
                              errorMessage = 'Câmera está sendo usada por outro aplicativo'
                            } else if (error.name === 'OverconstrainedError') {
                              errorMessage = 'Configurações de câmera não suportadas'
                            } else {
                              errorMessage = error.message || 'Erro desconhecido'
                            }

                            toast.error(`Erro na câmera: ${errorMessage}`)
                          }}
                          className="w-full rounded-lg"
                        />
                        {cameraLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <LoadingSpinner size="lg" color="white" />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCapturing || cameraLoading}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCapturing ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Capturar Foto
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
                        Tirar nova foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Dados do Visitante</h2>

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
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.name
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="Nome completo do visitante"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-1">
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
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.email
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
                <div className="md:col-span-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.phone
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Primary Document Selection */}
                <div className="md:col-span-2">
                  <label htmlFor="primaryDocument" className="block text-sm font-medium text-gray-700">
                    Documento Principal * (obrigatório)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="primaryDocument"
                      name="primaryDocument"
                      value={primaryDocument}
                      onChange={(e) => setPrimaryDocument(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.primaryDocument
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                    >
                      <option value="">Selecione o documento principal</option>
                      <option value="cpf">CPF</option>
                      <option value="rg">RG</option>
                      <option value="cnh">CNH</option>
                    </select>
                  </div>
                  {errors.primaryDocument && (
                    <p className="mt-1 text-sm text-red-600">{errors.primaryDocument}</p>
                  )}
                </div>

                {/* CPF Field - Conditional */}
                {primaryDocument === 'cpf' && (
                  <div className="md:col-span-1">
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                      CPF *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.cpf
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    {errors.cpf && (
                      <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>
                    )}
                  </div>
                )}

                {/* RG Field - Conditional */}
                {primaryDocument === 'rg' && (
                  <div className="md:col-span-1">
                    <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
                      RG *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="rg"
                        name="rg"
                        value={formData.rg}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.rg
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                          }`}
                        placeholder="00.000.000-0"
                      />
                    </div>
                    {errors.rg && (
                      <p className="mt-1 text-sm text-red-600">{errors.rg}</p>
                    )}
                  </div>
                )}

                {/* CNH Field - Conditional */}
                {primaryDocument === 'cnh' && (
                  <div className="md:col-span-1">
                    <label htmlFor="cnh" className="block text-sm font-medium text-gray-700">
                      CNH *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="cnh"
                        name="cnh"
                        value={formData.cnh}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.cnh
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
                )}

                {/* Optional Documents Section */}
                {primaryDocument && (
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Documentos Adicionais (Opcionais)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Optional CPF */}
                        {primaryDocument !== 'cpf' && (
                          <div>
                            <label htmlFor="cpf_optional" className="block text-sm font-medium text-gray-600">
                              CPF (opcional)
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                id="cpf_optional"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className={`block w-full pl-9 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm ${errors.cpf
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                                  }`}
                                placeholder="000.000.000-00"
                              />
                            </div>
                            {errors.cpf && (
                              <p className="mt-1 text-xs text-red-600">{errors.cpf}</p>
                            )}
                          </div>
                        )}

                        {/* Optional RG */}
                        {primaryDocument !== 'rg' && (
                          <div>
                            <label htmlFor="rg_optional" className="block text-sm font-medium text-gray-600">
                              RG (opcional)
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                id="rg_optional"
                                name="rg"
                                value={formData.rg}
                                onChange={handleChange}
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                placeholder="00.000.000-0"
                              />
                            </div>
                          </div>
                        )}

                        {/* Optional CNH */}
                        {primaryDocument !== 'cnh' && (
                          <div>
                            <label htmlFor="cnh_optional" className="block text-sm font-medium text-gray-600">
                              CNH (opcional)
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                id="cnh_optional"
                                name="cnh"
                                value={formData.cnh}
                                onChange={handleChange}
                                className={`block w-full pl-9 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm ${errors.cnh
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                                  }`}
                                placeholder="00000000000"
                              />
                            </div>
                            {errors.cnh && (
                              <p className="mt-1 text-xs text-red-600">{errors.cnh}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Company */}
                <div className="md:col-span-2">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Empresa/Organização (opcional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.company
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                      placeholder="Nome da empresa ou organização"
                    />
                  </div>
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Propósito da Visita *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${errors.purpose
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                    >
                      <option value="">Selecione o propósito da visita</option>
                      <option value="Visita de cortesia ou apresentação pessoal">Visita de cortesia ou apresentação pessoal</option>
                      <option value="Acompanhar sessão plenária ou reunião de comissão">Acompanhar sessão plenária ou reunião de comissão</option>
                      <option value="Participar de audiência pública">Participar de audiência pública</option>
                      <option value="Entregar documentos ou correspondências">Entregar documentos ou correspondências</option>
                      <option value="Solicitar informações sobre projetos de lei ou processos legislativos">Solicitar informações sobre projetos de lei ou processos legislativos</option>
                      <option value="Entregar convites oficiais ou comunicados da comunidade">Entregar convites oficiais ou comunicados da comunidade</option>
                      <option value="Solicitar homenagens, moções ou títulos honoríficos">Solicitar homenagens, moções ou títulos honoríficos</option>
                      <option value="Apresentar projetos sociais ou culturais ao gabinete de um vereador">Apresentar projetos sociais ou culturais ao gabinete de um vereador</option>
                      <option value="Reivindicar melhorias para bairros, escolas, ruas, saúde, transporte etc.">Reivindicar melhorias para bairros, escolas, ruas, saúde, transporte etc.</option>
                      <option value="Buscar apoio político para iniciativas comunitárias ou associações">Buscar apoio político para iniciativas comunitárias ou associações</option>
                      <option value="Discutir pautas relacionadas ao orçamento municipal com vereadores">Discutir pautas relacionadas ao orçamento municipal com vereadores</option>
                      <option value="Participar de reuniões organizadas por gabinetes parlamentares">Participar de reuniões organizadas por gabinetes parlamentares</option>
                    </select>
                  </div>
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                  )}
                </div>

                {/* Info message */}
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          <strong>Informação:</strong> Selecione pelo menos um setor OU um departamento. Os demais campos são opcionais e podem ser preenchidos conforme sua necessidade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sectors - Multiple Selection */}
                <div className="md:col-span-1">
                  <label htmlFor="sectors" className="block text-sm font-medium text-gray-700">
                    Setores a visitar (máx. 3) - Opcional
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="sectors"
                      name="sectors"
                      value={formData.sectors}
                      onChange={handleChange}
                      multiple
                      size="4"
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-lg min-h-[120px] ${errors.sectors
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                    >
                      {availableSectors.map(sector => (
                        <option key={sector.id} value={sector.id}>{sector.name}</option>
                      ))}
                    </select>
                  </div>
                  {formData.sectors.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">Selecionados: {formData.sectors.length}/3</p>
                  )}
                  {errors.sectors && (
                    <p className="mt-1 text-sm text-red-600">{errors.sectors}</p>
                  )}
                </div>

                {/* Departments - Multiple Selection */}
                <div className="md:col-span-1">
                  <label htmlFor="departments" className="block text-sm font-medium text-gray-700">
                    Departamentos a visitar (máx. 3) - Opcional
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="departments"
                      name="departments"
                      value={formData.departments}
                      onChange={handleChange}
                      multiple
                      size="4"
                      className={`block w-full pl-10 pr-3 py-4 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-lg min-h-[120px] ${errors.departments
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                    >
                      {availableDepartments.map(department => (
                        <option key={department.id} value={department.id}>{department.name}</option>
                      ))}
                    </select>
                  </div>
                  {formData.departments.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">Selecionados: {formData.departments.length}/3</p>
                  )}
                  {errors.departments && (
                    <p className="mt-1 text-sm text-red-600">{errors.departments}</p>
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
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Informações adicionais sobre a visita"
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
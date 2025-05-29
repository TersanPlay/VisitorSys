import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, User, Building, FileText, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { faceRecognitionService } from '../services/faceRecognitionService';
import { visitorService } from '../services/visitorService';
import { departmentService } from '../services/departmentService';
import { sectorService } from '../services/sectorService';
import { cameraService } from '../services/cameraService';

const TotemPage = () => {
  const webcamRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    company: '',
    purpose: '',
    notes: '',
    department: '',
    sector: ''
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraPermissions, setCameraPermissions] = useState(null);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [faceDetection, setFaceDetection] = useState({
    detected: false,
    box: null,
    distance: 'unknown', // 'close', 'far', 'good', 'unknown'
    confidence: 0
  });
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [existingVisitor, setExistingVisitor] = useState(null);
  const [showVisitorConfirmation, setShowVisitorConfirmation] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando aplicação...');

        // Check system capabilities first
        const systemInfo = cameraService.getSystemInfo();
        console.log('Informações do sistema:', systemInfo);

        if (!systemInfo.hasMediaDevices || !systemInfo.hasGetUserMedia) {
          setErrors(prev => ({ ...prev, camera: 'Seu navegador não suporta acesso à câmera. Use um navegador mais recente.' }));
          return;
        }

        // Initialize face recognition service
        await faceRecognitionService.initialize();

        // Load departments and sectors
        loadDepartments();
        loadSectors();

        // Select physical camera first
        await selectPhysicalCamera();

        // Initialize camera detection
        await initializeCameras();

        console.log('Aplicação inicializada com sucesso');
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setErrors(prev => ({ ...prev, camera: 'Erro na inicialização: ' + error.message }));
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      stopFaceDetection();
    };
  }, []);

  // Stop face detection when leaving photo step
  useEffect(() => {
    if (currentStep !== 1) {
      stopFaceDetection();
    }
  }, [currentStep]);

  const initializeCameras = async () => {
    try {
      // Check if browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Check camera permissions
      const permissions = await cameraService.checkPermissions();
      setCameraPermissions(permissions);

      // Request permission if needed
      if (permissions.state === 'prompt' || permissions.state === 'denied') {
        const granted = await cameraService.requestPermission();
        if (granted) {
          setCameraPermissions({ state: 'granted', canRequest: false });
        } else {
          setErrors(prev => ({ ...prev, camera: 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.' }));
        }
      }

      // Test if camera is working and filter physical cameras
      const allCameras = await cameraService.enumerateDevices();
      if (allCameras.length === 0) {
        throw new Error('Nenhuma câmera encontrada no sistema');
      }

      // Filter out virtual cameras (common virtual camera names)
      const virtualCameraKeywords = [
        'virtual', 'obs', 'streamlabs', 'xsplit', 'manycam',
        'webcamoid', 'snap camera', 'nvidia broadcast',
        'droidcam', 'iriun', 'epoccam', 'camo'
      ];

      const physicalCameras = allCameras.filter(camera => {
        const labelLower = camera.label.toLowerCase();
        return !virtualCameraKeywords.some(keyword => labelLower.includes(keyword));
      });

      console.log('Todas as câmeras:', allCameras);
      console.log('Câmeras físicas detectadas:', physicalCameras);

      if (physicalCameras.length === 0) {
        console.warn('Apenas câmeras virtuais detectadas. Usando primeira câmera disponível.');
      }
    } catch (error) {
      console.error('Error initializing cameras:', error);
      setErrors(prev => ({ ...prev, camera: 'Erro ao acessar câmera: ' + error.message }));
    }
  };

  const requestCameraPermission = async () => {
    try {
      setErrors(prev => ({ ...prev, camera: '' }));
      const granted = await cameraService.requestPermission();
      if (granted) {
        setCameraPermissions({ state: 'granted', canRequest: false });
        setCameraReady(false); // Reset camera ready state to trigger re-initialization
      } else {
        setErrors(prev => ({ ...prev, camera: 'Permissão de câmera negada. Verifique as configurações do seu navegador.' }));
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setErrors(prev => ({ ...prev, camera: 'Erro ao solicitar permissão da câmera: ' + error.message }));
    }
  };

  const selectPhysicalCamera = async () => {
    try {
      const allCameras = await cameraService.enumerateDevices();

      // Filter out virtual cameras
      const virtualCameraKeywords = [
        'virtual', 'obs', 'streamlabs', 'xsplit', 'manycam',
        'webcamoid', 'snap camera', 'nvidia broadcast',
        'droidcam', 'iriun', 'epoccam', 'camo'
      ];

      const physicalCameras = allCameras.filter(camera => {
        const labelLower = camera.label.toLowerCase();
        return !virtualCameraKeywords.some(keyword => labelLower.includes(keyword));
      });

      // Return the first physical camera, or first available if no physical found
      const selectedCamera = physicalCameras.length > 0 ? physicalCameras[0] : allCameras[0];
      if (selectedCamera) {
        setSelectedCameraId(selectedCamera.deviceId);
      }
      return selectedCamera;
    } catch (error) {
      console.error('Error selecting physical camera:', error);
      return null;
    }
  };

  const retryCamera = async () => {
    try {
      setErrors(prev => ({ ...prev, camera: '' }));
      setCameraReady(false);

      // Stop any existing streams
      cameraService.stopStream();

      // Select preferred physical camera
      const selectedCamera = await selectPhysicalCamera();
      if (selectedCamera) {
        console.log('Câmera selecionada:', selectedCamera);
      }

      // Test if camera is working
      const testResult = await cameraService.testCamera(selectedCamera?.deviceId);
      if (!testResult.working) {
        throw new Error(testResult.error || 'Câmera não está funcionando');
      }

      // Re-initialize cameras
      await initializeCameras();

      console.log('Câmera reinicializada com sucesso');
    } catch (error) {
      console.error('Error retrying camera:', error);
      setErrors(prev => ({ ...prev, camera: 'Erro ao reinicializar câmera: ' + error.message }));
    }
  };



  const drawEnhancedFaceOverlay = (ctx, detection, canvas) => {
    const { box, distance, confidence } = detection;

    // Configurações de cores modernas com gradientes
    const colors = {
      good: {
        primary: '#10B981',
        secondary: '#059669',
        glow: 'rgba(16, 185, 129, 0.3)',
        gradient: ['#10B981', '#059669']
      },
      close: {
        primary: '#F59E0B',
        secondary: '#D97706',
        glow: 'rgba(245, 158, 11, 0.3)',
        gradient: ['#F59E0B', '#D97706']
      },
      far: {
        primary: '#EF4444',
        secondary: '#DC2626',
        glow: 'rgba(239, 68, 68, 0.3)',
        gradient: ['#EF4444', '#DC2626']
      }
    };

    const color = colors[distance] || colors.far;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular centro e raios para forma oval
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const radiusX = box.width / 2 + 20;
    const radiusY = box.height / 2 + 30;

    // Criar gradiente radial para efeito glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(radiusX, radiusY)
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, color.glow);
    gradient.addColorStop(1, 'transparent');

    // Desenhar efeito glow
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX + 15, radiusY + 15, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Desenhar borda principal oval com animação de pulso
    const pulseOffset = Math.sin(Date.now() * 0.005) * 2;
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX + pulseOffset, radiusY + pulseOffset, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Desenhar cantos arredondados modernos
    const cornerSize = 25;
    const cornerRadius = 8;

    ctx.fillStyle = color.primary;

    // Função para desenhar canto arredondado
    const drawRoundedCorner = (x, y, width, height) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, cornerRadius);
      ctx.fill();
    };

    // Cantos com posicionamento aprimorado
    const offset = 8;
    drawRoundedCorner(box.x - offset, box.y - offset, cornerSize, 6);
    drawRoundedCorner(box.x - offset, box.y - offset, 6, cornerSize);
    drawRoundedCorner(box.x + box.width - cornerSize + offset, box.y - offset, cornerSize, 6);
    drawRoundedCorner(box.x + box.width + offset - 6, box.y - offset, 6, cornerSize);
    drawRoundedCorner(box.x - offset, box.y + box.height + offset - 6, cornerSize, 6);
    drawRoundedCorner(box.x - offset, box.y + box.height - cornerSize + offset, 6, cornerSize);
    drawRoundedCorner(box.x + box.width - cornerSize + offset, box.y + box.height + offset - 6, cornerSize, 6);
    drawRoundedCorner(box.x + box.width + offset - 6, box.y + box.height - cornerSize + offset, 6, cornerSize);

    // Barra de qualidade moderna
    const barWidth = box.width * 0.8;
    const barHeight = 8;
    const barX = centerX - barWidth / 2;
    const barY = box.y + box.height + 25;

    // Fundo da barra com gradiente
    const bgGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();

    // Preenchimento da barra com gradiente animado
    const fillWidth = barWidth * confidence;
    const barGradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    barGradient.addColorStop(0, color.gradient[0]);
    barGradient.addColorStop(1, color.gradient[1]);

    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 4);
    ctx.fill();

    // Texto de confiança com sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = color.primary;
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.round(confidence * 100)}%`,
      centerX,
      barY + barHeight + 25
    );

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Indicadores direcionais para ajuste de posição
    if (distance !== 'good') {
      ctx.fillStyle = color.primary;
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';

      if (distance === 'close') {
        // Setas para afastar
        ctx.fillText('←', centerX - 60, centerY);
        ctx.fillText('→', centerX + 60, centerY);
      } else if (distance === 'far') {
        // Setas para aproximar
        ctx.fillText('→', centerX - 30, centerY);
        ctx.fillText('←', centerX + 30, centerY);
      }
    }
  };

  const startFaceDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        try {
          // Detect faces using face-api.js
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks();

          if (detections.length > 0) {
            const detection = detections[0]; // Use first detected face
            const box = detection.detection.box;
            const confidence = detection.detection.score;

            // Calculate distance based on face size
            const faceWidth = box.width;
            const faceHeight = box.height;
            const faceArea = faceWidth * faceHeight;
            const videoArea = canvas.width * canvas.height;
            const faceRatio = faceArea / videoArea;

            let distance = 'unknown';
            if (faceRatio > 0.15) {
              distance = 'close'; // Too close
            } else if (faceRatio < 0.05) {
              distance = 'far'; // Too far
            } else {
              distance = 'good'; // Good distance
            }

            // Usar nova função de desenho aprimorada
            drawEnhancedFaceOverlay(ctx, { box, distance, confidence }, canvas);

            setFaceDetection({
              detected: true,
              box: box,
              distance: distance,
              confidence: confidence
            });
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setFaceDetection({
              detected: false,
              box: null,
              distance: 'unknown',
              confidence: 0
            });
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }, 100); // Run detection every 100ms

    setDetectionInterval(interval);
  };

  const stopFaceDetection = () => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    setFaceDetection({
      detected: false,
      box: null,
      distance: 'unknown',
      confidence: 0
    });
  };

  // retryCamera function is already declared above with full implementation

  const loadDepartments = async () => {
    try {
      const departmentData = await departmentService.getAllDepartments();
      setDepartments(departmentData);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadSectors = async () => {
    try {
      const sectorData = await sectorService.getAllSectors();
      setSectors(sectorData);
    } catch (error) {
      console.error('Error loading sectors:', error);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Photo capture
        if (!photo) {
          newErrors.photo = 'Foto é obrigatória';
        }
        break;
      case 2: // Personal info
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
        if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
        break;
      case 3: // Visit info
        if (!formData.company.trim()) newErrors.company = 'Empresa é obrigatória';
        if (!formData.purpose.trim()) newErrors.purpose = 'Motivo da visita é obrigatório';
        if (!formData.department) newErrors.department = 'Departamento é obrigatório';
        if (!formData.sector) newErrors.sector = 'Setor é obrigatório';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const confirmExistingVisitor = () => {
    if (existingVisitor) {
      // Preencher dados do visitante existente
      setFormData({
        name: existingVisitor.name || '',
        email: existingVisitor.email || '',
        phone: existingVisitor.phone || '',
        cpf: existingVisitor.cpf || '',
        rg: existingVisitor.rg || '',
        company: existingVisitor.company || '',
        purpose: '',
        notes: '',
        department: '',
        sector: ''
      });

      // Pular para etapa de informações da visita
      setCurrentStep(3);
      setShowVisitorConfirmation(false);
    }
  };

  const proceedWithNewRegistration = () => {
    setExistingVisitor(null);
    setShowVisitorConfirmation(false);
    // Prosseguir para próxima etapa normalmente
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const capturePhoto = async () => {
    if (!webcamRef.current) return;

    setIsLoading(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        setErrors(prev => ({ ...prev, photo: 'Erro ao capturar imagem' }));
        return;
      }

      // Validate face in the captured image
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const validation = await faceRecognitionService.validateImageQuality(canvas);

          if (validation.valid) {
            setPhoto(imageSrc);
            setErrors(prev => ({ ...prev, photo: '' }));

            // Buscar visitante existente por reconhecimento facial
            try {
              console.log('Buscando visitante existente...');
              const searchResult = await visitorService.searchVisitorByFace(imageSrc);

              if (searchResult.success && searchResult.visitor) {
                console.log('Visitante existente encontrado:', searchResult.visitor);
                setExistingVisitor({
                  ...searchResult.visitor,
                  confidence: searchResult.confidence,
                  similarity: searchResult.similarity
                });
                setShowVisitorConfirmation(true);
              } else {
                console.log('Nenhum visitante existente encontrado. Prosseguindo com novo registro.');
                setExistingVisitor(null);
                setShowVisitorConfirmation(false);
              }
            } catch (error) {
              console.error('Erro na busca por visitante existente:', error);
              // Em caso de erro na busca, prosseguir com novo registro
              setExistingVisitor(null);
              setShowVisitorConfirmation(false);
            }
          } else {
            setErrors(prev => ({ ...prev, photo: validation.reason || 'Imagem não atende aos critérios de qualidade' }));
          }
        } catch (error) {
          console.error('Face validation error:', error);
          setErrors(prev => ({ ...prev, photo: 'Erro na validação da imagem' }));
        } finally {
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        setErrors(prev => ({ ...prev, photo: 'Erro ao processar imagem capturada' }));
        setIsLoading(false);
      };

      img.src = imageSrc;
    } catch (error) {
      console.error('Photo capture error:', error);
      setErrors(prev => ({ ...prev, photo: 'Erro ao capturar foto' }));
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const submitForm = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const visitorData = {
        ...formData,
        photo: photo
      };

      await visitorService.registerVisitor(visitorData);
      setCurrentStep(4); // Success step
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      rg: '',
      company: '',
      purpose: '',
      notes: '',
      department: '',
      sector: ''
    });
    setPhoto(null);
    setErrors({});
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Capturar Foto', icon: Camera, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
      { number: 2, title: 'Dados Pessoais', icon: User, color: 'purple', gradient: 'from-purple-500 to-purple-600' },
      { number: 3, title: 'Informações da Visita', icon: Building, color: 'indigo', gradient: 'from-indigo-500 to-indigo-600' },
      { number: 4, title: 'Registro Concluído', icon: CheckCircle, color: 'green', gradient: 'from-green-500 to-green-600' }
    ];

    const currentStepData = steps[currentStep - 1];
    const Icon = currentStepData.icon;

    return (
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-4xl">
          {/* Background decorativo com gradiente da etapa atual */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentStepData.gradient} rounded-2xl blur-2xl opacity-20 transform scale-110 animate-pulse`}></div>

          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/30">
            {/* Layout unificado para tablet */}
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">

              {/* Seção da câmera - apenas no step 1 */}
              {currentStep === 1 && (
                <div className="flex-1 max-w-lg">
                  {errors.camera && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6">
                      <p className="text-base">{errors.camera}</p>
                      <button
                        onClick={requestCameraPermission}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}

                  {/* Descrição posicionada acima da câmera */}
                  <div className="text-center mb-7">
                    <p className="text-xl text-gray-700 leading-relaxed font-medium">
                      Posicione seu rosto no centro da câmera e aguarde a captura automática
                    </p>
                  </div>

                  {/* Container da câmera integrado - agora maior */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-20 animate-pulse transform scale-105"></div>

                    <div className="relative w-84 h-84 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                      {!photo ? (
                        <>
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{
                              width: { ideal: 640, min: 320 },
                              height: { ideal: 480, min: 240 },
                              facingMode: 'user',
                              frameRate: { ideal: 30, min: 15 },
                              // Use selected physical camera if available
                              deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
                              // Avoid virtual cameras by requiring specific capabilities
                              advanced: [
                                { focusMode: 'continuous' },
                                { exposureMode: 'continuous' },
                                { whiteBalanceMode: 'continuous' }
                              ]
                            }}
                            onUserMedia={(stream) => {
                              console.log('Camera activated successfully:', {
                                streamId: stream.id,
                                tracks: stream.getVideoTracks().map(track => ({
                                  id: track.id,
                                  label: track.label,
                                  enabled: track.enabled,
                                  readyState: track.readyState,
                                  settings: track.getSettings()
                                }))
                              });
                              setCameraReady(true);
                              setErrors(prev => ({ ...prev, camera: '' }));
                              setTimeout(() => {
                                startFaceDetection();
                              }, 1000);
                            }}
                            onUserMediaError={(error) => {
                              console.error('Webcam error details:', {
                                name: error.name,
                                message: error.message,
                                constraint: error.constraint,
                                stack: error.stack
                              });
                              setCameraReady(false);

                              let errorMessage = 'Erro ao acessar a câmera.';
                              if (error.name === 'NotAllowedError') {
                                errorMessage = 'Permissão de câmera negada. Clique em "Tentar Novamente" e permita o acesso.';
                              } else if (error.name === 'NotFoundError') {
                                errorMessage = 'Nenhuma câmera encontrada. Verifique se há uma câmera conectada.';
                              } else if (error.name === 'NotReadableError') {
                                errorMessage = 'Câmera está sendo usada por outro aplicativo. Feche outros programas que possam estar usando a câmera.';
                              } else if (error.name === 'OverconstrainedError') {
                                errorMessage = 'Configurações de câmera não suportadas. Tentando com configurações diferentes...';
                              }

                              setErrors(prev => ({ ...prev, camera: errorMessage }));
                            }}
                          />
                          <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                        </>
                      ) : (
                        <>
                          <img src={photo} alt="Foto capturada" className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
                            <span className="text-lg">✓</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status de detecção facial - agora maior */}
                  {!photo && (
                    <div className="mt-7">
                      {faceDetection.detected ? (
                        <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${faceDetection.distance === 'good'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-800'
                          : faceDetection.distance === 'close'
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-800'
                            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800'
                          }`}>
                          <div className="flex items-center justify-center space-x-4">
                            {faceDetection.distance === 'good' && (
                              <>
                                <span className="text-3xl">✅</span>
                                <span className="font-bold text-xl">Posição Perfeita!</span>
                              </>
                            )}
                            {faceDetection.distance === 'close' && (
                              <>
                                <span className="text-3xl">⚠️</span>
                                <span className="font-bold text-xl">Afaste-se um pouco</span>
                              </>
                            )}
                            {faceDetection.distance === 'far' && (
                              <>
                                <span className="text-3xl">📏</span>
                                <span className="font-bold text-xl">Aproxime-se mais</span>
                              </>
                            )}
                          </div>
                          <div className="text-base mt-2 text-center font-medium">
                            Confiança: {Math.round(faceDetection.confidence * 100)}%
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 text-gray-700">
                          <div className="flex items-center justify-center space-x-4">
                            <span className="text-3xl animate-pulse">👤</span>
                            <span className="font-bold text-xl">Procurando rosto...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botão de captura integrado - agora maior */}
                  {!photo && (
                    <div className="flex justify-center mt-7">
                      <button
                        onClick={capturePhoto}
                        disabled={isLoading || errors.camera || !faceDetection.detected || faceDetection.distance !== 'good'}
                        className={`px-9 py-5 rounded-xl font-bold text-xl transition-all duration-300 transform ${faceDetection.detected && faceDetection.distance === 'good' && !isLoading && !errors.camera
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-xl hover:scale-105 active:scale-95'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
                          }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-4">
                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                            <span>Capturando...</span>
                          </div>
                        ) : faceDetection.detected && faceDetection.distance === 'good' ? (
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">📸</span>
                            <span>Capturar</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span>⏳</span>
                            <span>Aguarde...</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Botões para foto capturada - agora maiores */}
                  {photo && (
                    <div className="flex justify-center space-x-5 mt-7">
                      <button
                        onClick={retakePhoto}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-7 py-4 rounded-xl font-semibold text-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-3"
                      >
                        <span>🔄</span>
                        <span>Refazer</span>
                      </button>
                      <button
                        onClick={showVisitorConfirmation ? () => { } : nextStep}
                        disabled={showVisitorConfirmation}
                        className={`px-7 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-3 ${showVisitorConfirmation
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                          }`}
                      >
                        <span>Continuar</span>
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {errors.photo && (
                    <div className="text-center mt-4">
                      <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">{errors.photo}</p>
                    </div>
                  )}

                  {/* Modal de confirmação de visitante existente */}
                  {showVisitorConfirmation && existingVisitor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Visitante Reconhecido!</h3>
                          <p className="text-gray-600 mb-6">
                            Encontramos um registro existente com {Math.round(existingVisitor.confidence * 100)}% de confiança.
                          </p>

                          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <h4 className="font-semibold text-gray-900 mb-2">Dados do Visitante:</h4>
                            <p className="text-sm text-gray-700"><strong>Nome:</strong> {existingVisitor.name}</p>
                            <p className="text-sm text-gray-700"><strong>Email:</strong> {existingVisitor.email}</p>
                            <p className="text-sm text-gray-700"><strong>Empresa:</strong> {existingVisitor.company}</p>
                          </div>

                          <div className="flex space-x-4">
                            <button
                              onClick={confirmExistingVisitor}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                            >
                              Confirmar Visitante
                            </button>
                            <button
                              onClick={proceedWithNewRegistration}
                              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                            >
                              Novo Registro
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seção do indicador de progresso */}
              <div className={`flex-1 ${currentStep === 1 ? 'max-w-md' : 'max-w-2xl'}`}>
                {/* Etapa atual em destaque */}
                <div className="flex flex-col items-center space-y-6">
                  {/* Ícone principal da etapa atual */}
                  <div className="relative">
                    {/* Múltiplos efeitos glow */}
                    <div className={`absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r ${currentStepData.gradient} opacity-30 animate-ping`}></div>
                    <div className={`absolute inset-0 w-18 h-18 rounded-full bg-gradient-to-r ${currentStepData.gradient} opacity-50 animate-pulse blur-sm`}></div>

                    {/* Container do ícone */}
                    <div className={`
                      relative flex items-center justify-center w-16 h-16 rounded-full 
                      bg-gradient-to-br ${currentStepData.gradient} 
                      text-white shadow-2xl transform transition-all duration-500
                      hover:scale-110 hover:rotate-3
                    `}>
                      <Icon className="w-8 h-8 animate-pulse" />

                      {/* Indicador de progresso circular */}
                      <div className="absolute inset-0 w-16 h-16 rounded-full">
                        <svg className="w-16 h-16 transform -rotate-90 animate-spin" style={{ animationDuration: '4s' }}>
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="188"
                            strokeDashoffset="94"
                            className="text-white/40"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Número da etapa */}
                    <div className={`
                      absolute -bottom-2 -right-2 w-6 h-6 rounded-full 
                      bg-white shadow-lg flex items-center justify-center
                      text-sm font-bold text-${currentStepData.color}-600
                      animate-bounce
                    `}>
                      {currentStep}
                    </div>
                  </div>

                  {/* Título da etapa atual */}
                  <div className="text-center space-y-2">
                    <h2 className={`
                      text-2xl font-bold transition-all duration-300
                      text-transparent bg-clip-text bg-gradient-to-r ${currentStepData.gradient}
                      animate-pulse
                    `}>
                      {currentStepData.title}
                    </h2>

                    {/* Status da etapa */}
                    <div className={`
                      inline-flex items-center px-4 py-2 rounded-full
                      bg-gradient-to-r ${currentStepData.gradient} bg-opacity-10
                      text-${currentStepData.color}-700 text-sm font-medium
                      border border-${currentStepData.color}-200
                      animate-pulse
                    `}>
                      <div className={`w-2 h-2 rounded-full bg-${currentStepData.color}-500 mr-2 animate-ping`}></div>
                      Em andamento...
                    </div>
                  </div>

                  {/* Barra de progresso geral */}
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Progresso</span>
                      <span>{Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 bg-gradient-to-r ${currentStepData.gradient} rounded-full transition-all duration-1000 ease-out shadow-lg relative`}
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      >
                        {/* Efeito de brilho na barra */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>

                        {/* Partículas na barra de progresso */}
                        <div className="absolute top-0 right-0 w-1 h-3 bg-white/60 animate-ping"></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>Etapa {currentStep}</span>
                      <span>de {steps.length}</span>
                    </div>
                  </div>

                  {/* Indicadores de etapas em miniatura */}
                  <div className="flex space-x-3">
                    {steps.map((step, index) => {
                      const isActive = currentStep === step.number;
                      const isCompleted = currentStep > step.number;
                      const isPending = currentStep < step.number;

                      return (
                        <div key={step.number} className="relative">
                          <div className={`
                            w-3 h-3 rounded-full transition-all duration-300
                            ${isActive
                              ? `bg-gradient-to-r ${step.gradient} shadow-lg scale-125 animate-pulse`
                              : isCompleted
                                ? 'bg-green-500 shadow-md'
                                : 'bg-gray-300'
                            }
                          `}></div>

                          {/* Linha conectora */}
                          {index < steps.length - 1 && (
                            <div className={`
                              absolute top-1.5 left-3 w-6 h-0.5 transition-all duration-500
                              ${isCompleted
                                ? 'bg-green-500'
                                : isActive && index === currentStep - 1
                                  ? `bg-gradient-to-r ${step.gradient} animate-pulse`
                                  : 'bg-gray-300'
                              }
                            `}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dica visual */}
                  <div className="text-center text-sm text-gray-500 max-w-md">
                    <p className="leading-relaxed">
                      {currentStep === 1 && "Posicione seu rosto no centro da câmera e aguarde a captura automática"}
                      {currentStep === 2 && "Preencha seus dados pessoais para identificação"}
                      {currentStep === 3 && "Informe o motivo da sua visita e pessoa/setor a ser visitado"}
                      {currentStep === 4 && "Seu registro foi concluído com sucesso!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // renderPhotoStep function removed - functionality integrated into renderStepIndicator

  const renderPersonalInfoStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Dados Pessoais</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Digite seu nome completo"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Digite seu email"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.cpf ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <p className="text-red-600 text-sm mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG
          </label>
          <input
            type="text"
            value={formData.rg}
            onChange={(e) => handleInputChange('rg', e.target.value)}
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg"
            placeholder="Digite seu RG"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={prevStep}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>

        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderVisitInfoStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Informações da Visita</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Empresa *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.company ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Digite o nome da empresa"
          />
          {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo da Visita *
          </label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.purpose ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Ex: Reunião, Entrevista, Visita técnica"
          />
          {errors.purpose && <p className="text-red-600 text-sm mt-1">{errors.purpose}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento *
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Selecione um departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Setor *
          </label>
          <select
            value={formData.sector}
            onChange={(e) => handleInputChange('sector', e.target.value)}
            className={`w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-lg ${errors.sector ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Selecione um setor</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
          {errors.sector && <p className="text-red-600 text-sm mt-1">{errors.sector}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] text-lg"
            placeholder="Informações adicionais (opcional)"
          />
        </div>
      </div>

      {errors.submit && (
        <div className="text-center mt-4">
          <p className="text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={prevStep}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>

        <button
          onClick={submitForm}
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? 'Registrando...' : 'Finalizar Cadastro'}
          <CheckCircle className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-green-600 mb-4">Cadastro Realizado com Sucesso!</h2>

      <p className="text-gray-600 mb-8 text-lg">
        Seu cadastro foi realizado com sucesso. Aguarde a impressão do seu crachá.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
        <h3 className="font-semibold mb-4">Resumo do Cadastro:</h3>
        <div className="text-left space-y-2">
          <p><strong>Nome:</strong> {formData.name}</p>
          <p><strong>Empresa:</strong> {formData.company}</p>
          <p><strong>Motivo:</strong> {formData.purpose}</p>
          <p><strong>Departamento:</strong> {departments.find(d => d.id === formData.department)?.name}</p>
          <p><strong>Setor:</strong> {sectors.find(s => s.id === formData.sector)?.name}</p>
        </div>
      </div>

      <button
        onClick={resetForm}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
      >
        Novo Cadastro
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Totem de Cadastro</h1>
          <p className="text-gray-600">Sistema de cadastro de visitantes</p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 2 && renderPersonalInfoStep()}
          {currentStep === 3 && renderVisitInfoStep()}
          {currentStep === 4 && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default TotemPage;
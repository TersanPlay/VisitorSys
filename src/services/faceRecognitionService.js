import * as faceapi from 'face-api.js'
import toast from 'react-hot-toast'

class FaceRecognitionService {
  constructor() {
    this.isInitialized = false
    this.modelsLoaded = false
    this.defaultTolerance = 0.6
    this.minConfidence = 0.5
    this.descriptorCache = new Map() // Cache para descritores faciais
    this.modelLoadPromise = null // Promessa para carregamento de modelos
  }

  // Initialize face-api.js models
  async initialize() {
    // Se já estiver inicializado, retorne imediatamente
    if (this.isInitialized) return true

    // Se já estiver carregando, retorne a promessa existente
    if (this.modelLoadPromise) return this.modelLoadPromise

    try {
      console.log('Loading face recognition models...')
      const startTime = performance.now()

      // Load models from public/models directory
      const MODEL_URL = '/models'

      // Armazena a promessa de carregamento para evitar múltiplas inicializações
      // e permitir o reuso da promessa em caso de chamadas concorrentes
      this.modelLoadPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ])

      await this.modelLoadPromise

      // Tenta configurar o backend para WebGL para melhor desempenho
      if (window.tf) {
        try {
          await window.tf.setBackend('webgl')
          console.log('Using TensorFlow.js backend:', window.tf.getBackend())
        } catch (e) {
          console.warn('Failed to set WebGL backend:', e)
        }
      }

      // Inicializar o cache de descritores
      this.descriptorCache.clear()

      // Marcar como inicializado
      this.modelsLoaded = true
      this.isInitialized = true

      const loadTime = (performance.now() - startTime) / 1000
      console.log(`Face recognition models loaded successfully in ${loadTime.toFixed(2)}s`)

      // Pré-aquecer os modelos para melhorar o desempenho inicial
      this.warmupModels()

      return true
    } catch (error) {
      console.error('Error loading face recognition models:', error)
      toast.error('Erro ao carregar modelos de reconhecimento facial')
      this.modelLoadPromise = null // Reseta a promessa em caso de erro
      return false
    }
  }

  // Pré-aquecer os modelos para melhorar o desempenho inicial
  async warmupModels() {
    try {
      console.log('Warming up face detection models...')
      const startTime = performance.now()

      // Criar uma imagem em branco para detecção
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Executar uma detecção inicial para pré-aquecer os modelos
      // Isso carrega os pesos na GPU e prepara o pipeline de inferência
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160, // Tamanho menor para aquecimento mais rápido
        scoreThreshold: 0.1
      })

      await faceapi.detectAllFaces(canvas, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors()

      const warmupTime = (performance.now() - startTime) / 1000
      console.log(`Models warmed up in ${warmupTime.toFixed(2)}s`)
    } catch (error) {
      console.warn('Model warmup failed:', error)
      // Falha no aquecimento não é crítica, apenas um aviso
    }
  }

  // Detect faces in an image
  async detectFaces(imageElement, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Otimização: Redimensionar a imagem antes do processamento se for muito grande
      let processElement = imageElement;
      const maxDimension = options.maxDimension || 640; // Limite máximo de dimensão para processamento

      // Se for um elemento de imagem ou vídeo e for muito grande, redimensione
      if ((imageElement instanceof HTMLImageElement || imageElement instanceof HTMLVideoElement) &&
        (imageElement.width > maxDimension || imageElement.height > maxDimension)) {

        // Criar um canvas temporário para redimensionar
        const canvas = document.createElement('canvas');
        const scale = maxDimension / Math.max(imageElement.width, imageElement.height);
        canvas.width = Math.round(imageElement.width * scale);
        canvas.height = Math.round(imageElement.height * scale);

        // Desenhar a imagem redimensionada no canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        processElement = canvas;
        console.log(`Resized image from ${imageElement.width}x${imageElement.height} to ${canvas.width}x${canvas.height}`);
      }

      // Otimização: Ajustar inputSize para melhor equilíbrio entre velocidade e precisão
      // Valores menores = mais rápido, valores maiores = mais preciso
      const detectionOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: options.inputSize || 320, // Reduzido de 416 para 320 para melhor desempenho
        scoreThreshold: options.scoreThreshold || this.minConfidence
      })

      // Otimização: Usar o modelo mais rápido (TinyFaceDetector)
      const detections = await faceapi
        .detectAllFaces(processElement, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors()

      return detections
    } catch (error) {
      console.error('Face detection error:', error)
      throw new Error('Erro na detecção facial')
    }
  }

  // Extract face encoding from image
  async extractFaceEncoding(imageElement, options = {}) {
    try {
      // Verificar se temos um cache para esta imagem
      if (options.useCache !== false && imageElement.src) {
        const cachedResult = this.descriptorCache.get(imageElement.src);
        if (cachedResult) {
          console.log('Using cached face descriptor');
          return cachedResult;
        }
      }

      // Otimização: Passar opções de detecção otimizadas
      const detectionOptions = {
        ...options,
        // Usar tamanho de entrada menor para detecção mais rápida
        inputSize: options.inputSize || 320,
        // Usar dimensão máxima para redimensionamento
        maxDimension: options.maxDimension || 640
      };

      const detections = await this.detectFaces(imageElement, detectionOptions)

      if (detections.length === 0) {
        throw new Error('Nenhum rosto detectado na imagem')
      }

      if (detections.length > 1) {
        throw new Error('Múltiplos rostos detectados. Use uma imagem com apenas um rosto')
      }

      const detection = detections[0]

      // Validação de qualidade aprimorada
      if (detection.detection.score < this.minConfidence) {
        throw new Error('Qualidade da imagem insuficiente. Tente uma foto mais nítida')
      }

      // Verificar tamanho do rosto em relação à imagem
      const faceBox = detection.detection.box;
      let imageWidth, imageHeight;

      if (imageElement instanceof HTMLImageElement || imageElement instanceof HTMLVideoElement) {
        imageWidth = imageElement.width;
        imageHeight = imageElement.height;
      } else if (imageElement instanceof HTMLCanvasElement) {
        imageWidth = imageElement.width;
        imageHeight = imageElement.height;
      } else {
        // Caso seja um elemento desconhecido, usar dimensões do box como fallback
        imageWidth = faceBox.width * 3;
        imageHeight = faceBox.height * 3;
      }

      const imageArea = imageWidth * imageHeight;
      const faceArea = faceBox.width * faceBox.height;
      const faceRatio = faceArea / imageArea;

      // Verificação adicional de qualidade baseada no tamanho do rosto
      if (faceRatio < 0.05) {
        console.warn('Face is too small in the image, detection may be unreliable');
      }

      const result = {
        encoding: Array.from(detection.descriptor),
        confidence: detection.detection.score,
        landmarks: detection.landmarks,
        box: detection.detection.box,
        faceRatio: faceRatio
      }

      // Armazenar no cache se a imagem tiver uma URL
      if (options.useCache !== false && imageElement.src) {
        this.descriptorCache.set(imageElement.src, result);

        // Limitar o tamanho do cache (manter apenas os últimos 50 descritores)
        if (this.descriptorCache.size > 50) {
          const firstKey = this.descriptorCache.keys().next().value;
          this.descriptorCache.delete(firstKey);
        }
      }

      return result;
    } catch (error) {
      console.error('Face encoding extraction error:', error)
      throw error
    }
  }

  // Compare two face encodings
  compareFaces(encoding1, encoding2, tolerance = null) {
    if (!encoding1 || !encoding2) {
      throw new Error('Encodings inválidos para comparação')
    }

    if (!Array.isArray(encoding1) || !Array.isArray(encoding2)) {
      throw new Error('Encodings devem ser arrays')
    }

    if (encoding1.length !== encoding2.length) {
      throw new Error('Encodings com tamanhos diferentes')
    }

    // Otimização: Usar o valor de tolerância adequado
    const actualTolerance = tolerance !== null ? tolerance : this.defaultTolerance

    // Otimização: Usar distância euclidiana para comparação de rostos
    // Implementação mais eficiente para cálculo de distância
    let distance = 0;
    const length = encoding1.length;

    // Calcular distância euclidiana manualmente para melhor desempenho
    for (let i = 0; i < length; i++) {
      const diff = encoding1[i] - encoding2[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);

    const isMatch = distance <= actualTolerance

    // Calcular pontuação de similaridade (intervalo 0-1, maior é mais similar)
    // Limitar a similaridade a 1.0 para evitar valores inválidos
    const similarity = Math.max(0, Math.min(1, 1 - distance));

    // Calcular confiança baseada na distância em relação à tolerância
    // Quanto mais próximo de 0 a distância, maior a confiança
    const confidence = Math.max(0, Math.min(1, 1 - (distance / actualTolerance)));

    return {
      isMatch,
      distance,
      similarity,
      confidence,
      // Adicionar informações adicionais para depuração
      tolerance: actualTolerance
    }
  }

  // Find the best match for a face encoding among a list of known faces
  findBestMatch(faceEncoding, knownFaces, tolerance = null) {
    if (!faceEncoding || !knownFaces || !Array.isArray(knownFaces) || knownFaces.length === 0) {
      throw new Error('Parâmetros inválidos para findBestMatch')
    }

    let bestMatch = null
    let bestDistance = Infinity
    let matches = []
    const actualTolerance = tolerance !== null ? tolerance : this.defaultTolerance

    // Otimização: Pré-verificar se o encoding é válido
    if (!Array.isArray(faceEncoding) || faceEncoding.length !== 128) {
      throw new Error('Face encoding inválido. Deve ser um array de 128 elementos')
    }

    // Otimização: Usar um limite para interromper a busca antecipadamente
    // se encontrarmos uma correspondência muito boa
    const earlyStopThreshold = actualTolerance * 0.5

    for (const knownFace of knownFaces) {
      if (!knownFace.encoding) {
        console.warn('Known face without encoding, skipping')
        continue
      }

      // Otimização: Verificar se o encoding conhecido é válido
      if (!Array.isArray(knownFace.encoding) || knownFace.encoding.length !== 128) {
        console.warn('Invalid known face encoding, skipping')
        continue
      }

      const comparison = this.compareFaces(faceEncoding, knownFace.encoding, actualTolerance)

      // Armazenar todos os matches para análise posterior
      if (comparison.isMatch) {
        matches.push({
          person: knownFace.person || knownFace.label || 'Unknown',
          ...comparison
        })
      }

      if (comparison.distance < bestDistance) {
        bestDistance = comparison.distance
        bestMatch = {
          person: knownFace.person || knownFace.label || 'Unknown',
          ...comparison
        }

        // Otimização: Parar antecipadamente se encontrarmos uma correspondência muito boa
        if (bestDistance < earlyStopThreshold) {
          console.log('Found very good match, stopping early')
          break
        }
      }
    }

    if (!bestMatch) {
      return {
        person: 'Unknown',
        isMatch: false,
        distance: Infinity,
        similarity: 0,
        confidence: 0,
        matches: [] // Incluir array vazio de matches
      }
    }

    // Adicionar todos os matches encontrados ao resultado
    bestMatch.matches = matches

    // Adicionar informação sobre a confiabilidade do match
    // Se houver vários matches próximos, a confiabilidade é menor
    if (matches.length > 1) {
      // Ordenar matches por distância (menor primeiro)
      matches.sort((a, b) => a.distance - b.distance)

      // Se houver mais de um match e a diferença entre os dois melhores for pequena,
      // reduzir a confiança para indicar ambiguidade
      if (matches.length >= 2) {
        const distanceDiff = matches[1].distance - matches[0].distance
        if (distanceDiff < 0.1) {
          bestMatch.ambiguityScore = 1 - (distanceDiff / 0.1)
          console.log(`Possible ambiguity between ${matches[0].person} and ${matches[1].person}`,
            `(diff: ${distanceDiff.toFixed(4)}, ambiguity: ${bestMatch.ambiguityScore.toFixed(2)})`)
        }
      }
    }

    return bestMatch
  }

  // Validate image quality for face recognition
  async validateImageQuality(imageElement, options = {}) {
    try {
      // Otimização: Usar opções otimizadas para detecção
      const detectionOptions = {
        ...options,
        // Usar tamanho de entrada menor para detecção mais rápida
        inputSize: options.inputSize || 320,
        // Usar dimensão máxima para redimensionamento
        maxDimension: options.maxDimension || 640,
        // Usar limiar de confiança personalizado se fornecido
        scoreThreshold: options.minConfidence || this.minConfidence
      };

      const detections = await this.detectFaces(imageElement, detectionOptions)

      // Check if at least one face is detected
      if (detections.length === 0) {
        return {
          valid: false,
          reason: 'Nenhum rosto detectado na imagem',
          detections
        }
      }

      // Check if only one face is detected
      if (detections.length > 1) {
        return {
          valid: false,
          reason: 'Múltiplos rostos detectados. Use uma imagem com apenas um rosto',
          detections
        }
      }

      const detection = detections[0]

      // Check if detection confidence is high enough
      const minConfidence = options.minConfidence || this.minConfidence
      if (detection.detection.score < minConfidence) {
        return {
          valid: false,
          reason: 'Qualidade da imagem insuficiente. Tente uma foto mais nítida',
          confidence: detection.detection.score,
          threshold: minConfidence,
          detections
        }
      }

      // Obter dimensões da imagem de forma mais robusta
      let imageWidth, imageHeight;

      if (imageElement instanceof HTMLImageElement) {
        imageWidth = imageElement.naturalWidth || imageElement.width;
        imageHeight = imageElement.naturalHeight || imageElement.height;
      } else if (imageElement instanceof HTMLVideoElement) {
        imageWidth = imageElement.videoWidth || imageElement.width;
        imageHeight = imageElement.videoHeight || imageElement.height;
      } else if (imageElement instanceof HTMLCanvasElement) {
        imageWidth = imageElement.width;
        imageHeight = imageElement.height;
      } else {
        // Caso seja um elemento desconhecido
        imageWidth = imageElement.width;
        imageHeight = imageElement.height;
      }

      if (!imageWidth || !imageHeight) {
        return {
          valid: false,
          reason: 'Não foi possível determinar as dimensões da imagem',
          detections
        }
      }

      // Check if face is large enough in the image
      const box = detection.detection.box
      const faceArea = box.width * box.height
      const imageArea = imageWidth * imageHeight
      const faceRatio = faceArea / imageArea

      // Verificação mais rigorosa do tamanho do rosto
      const minFaceRatio = options.minFaceRatio || 0.05;
      if (faceRatio < minFaceRatio) {
        return {
          valid: false,
          reason: 'Rosto muito pequeno na imagem. Aproxime-se mais da câmera',
          faceRatio,
          minFaceRatio,
          detections
        }
      }

      // Verificar se o rosto está centralizado na imagem
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const imageCenterX = imageWidth / 2;
      const imageCenterY = imageHeight / 2;

      // Calcular distância do centro (normalizada para 0-1)
      const centerDistanceX = Math.abs(centerX - imageCenterX) / imageWidth;
      const centerDistanceY = Math.abs(centerY - imageCenterY) / imageHeight;
      const centerDistance = Math.sqrt(centerDistanceX * centerDistanceX + centerDistanceY * centerDistanceY);

      // Verificar se o rosto está muito descentrado
      const maxCenterDistance = options.maxCenterDistance || 0.25; // 25% da distância máxima do centro
      if (centerDistance > maxCenterDistance) {
        return {
          valid: false,
          reason: 'Rosto não está centralizado na imagem',
          centerDistance,
          maxCenterDistance,
          detections
        }
      }

      // Verificar se o rosto está muito inclinado usando landmarks
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      if (leftEye.length > 0 && rightEye.length > 0) {
        // Calcular o centro de cada olho
        const leftEyeCenter = leftEye.reduce((acc, point) => {
          return { x: acc.x + point.x / leftEye.length, y: acc.y + point.y / leftEye.length };
        }, { x: 0, y: 0 });

        const rightEyeCenter = rightEye.reduce((acc, point) => {
          return { x: acc.x + point.x / rightEye.length, y: acc.y + point.y / rightEye.length };
        }, { x: 0, y: 0 });

        // Calcular ângulo de inclinação
        const deltaY = rightEyeCenter.y - leftEyeCenter.y;
        const deltaX = rightEyeCenter.x - leftEyeCenter.x;
        const angleRadians = Math.atan2(deltaY, deltaX);
        const angleDegrees = angleRadians * (180 / Math.PI);

        // Verificar se o ângulo está dentro do limite aceitável
        const maxAngle = options.maxFaceAngle || 15; // 15 graus de inclinação máxima
        if (Math.abs(angleDegrees) > maxAngle) {
          return {
            valid: false,
            reason: 'Rosto está muito inclinado. Mantenha a cabeça nivelada',
            angle: angleDegrees,
            maxAngle,
            detections
          }
        }
      }

      // All checks passed
      return {
        valid: true,
        confidence: detection.detection.score,
        faceRatio,
        centerDistance,
        detections
      }
    } catch (error) {
      console.error('Image quality validation error:', error)
      return {
        valid: false,
        reason: 'Erro na validação da imagem',
        error: error.message,
        detections: []
      }
    }
  }

  // Draw face detection overlay on canvas
  drawFaceDetection(canvas, detections, options = {}) {
    try {
      if (!canvas || !detections || detections.length === 0) return;

      const ctx = canvas.getContext('2d')

      // Otimização: Configurações de desenho mais flexíveis
      const {
        showBox = true,
        showLandmarks = false,
        showConfidence = true,
        boxColor = '#00ff00',
        textColor = '#00ff00',
        lineWidth = 2,
        fontSize = 16,
        labelPadding = 5,
        landmarkSize = 2,
        landmarkColor = boxColor,
        matchColor = 'rgba(0, 255, 0, 0.8)',
        noMatchColor = 'rgba(255, 0, 0, 0.8)',
        useMatchColors = false,
        matchThreshold = 0.6,
        showLabels = false,
        clearCanvas = true,
        landmarkMode = 'full' // 'full', 'minimal', 'eyes'
      } = options

      // Limpar o canvas antes de desenhar, se solicitado
      if (clearCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      // Otimização: Usar requestAnimationFrame para renderização mais suave
      // Isso é especialmente útil quando chamado repetidamente (como em um stream de vídeo)
      requestAnimationFrame(() => {
        // Draw each detection
        detections.forEach(detection => {
          const { box } = detection.detection
          const score = detection.detection.score

          // Determinar cor com base no score se useMatchColors estiver ativado
          let currentBoxColor = boxColor;
          if (useMatchColors) {
            currentBoxColor = score >= matchThreshold ? matchColor : noMatchColor;
          }

          // Draw bounding box
          if (showBox) {
            ctx.strokeStyle = currentBoxColor
            ctx.lineWidth = lineWidth
            ctx.strokeRect(box.x, box.y, box.width, box.height)
          }

          // Draw confidence score and/or label
          if (showConfidence || (showLabels && detection.label)) {
            // Preparar texto a ser exibido
            let displayText = '';

            if (showConfidence) {
              const confidence = Math.round(score * 100)
              displayText += `${confidence}%`;
            }

            if (showLabels && detection.label) {
              if (displayText) displayText += ' - ';
              displayText += detection.label;
            }

            if (displayText) {
              // Calcular tamanho do texto para o fundo
              ctx.font = `${fontSize}px Arial`;
              const textWidth = ctx.measureText(displayText).width + (labelPadding * 2);

              // Desenhar fundo para o texto (opcional)
              if (options.showTextBackground !== false) {
                ctx.fillStyle = currentBoxColor;
                ctx.fillRect(
                  box.x,
                  box.y - fontSize - (labelPadding * 2),
                  textWidth,
                  fontSize + (labelPadding * 2)
                );
                ctx.fillStyle = textColor;
              } else {
                ctx.fillStyle = currentBoxColor;
              }

              // Desenhar texto
              ctx.font = `${fontSize}px Arial`;
              ctx.fillText(
                displayText,
                box.x + labelPadding,
                box.y - labelPadding
              );
            }
          }

          // Draw landmarks with optimization
          if (showLandmarks && detection.landmarks) {
            ctx.fillStyle = landmarkColor || currentBoxColor;

            // Função auxiliar para desenhar landmarks
            const drawLandmark = (points) => {
              if (!points || points.length === 0) return;

              points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, landmarkSize, 0, 2 * Math.PI);
                ctx.fill();
              });
            };

            // Desenhar landmarks com base no modo selecionado
            if (landmarkMode === 'minimal') {
              // Modo mínimo: apenas olhos e boca
              drawLandmark(detection.landmarks.getLeftEye());
              drawLandmark(detection.landmarks.getRightEye());
              drawLandmark(detection.landmarks.getMouth());
            } else if (landmarkMode === 'eyes') {
              // Modo olhos: apenas olhos
              drawLandmark(detection.landmarks.getLeftEye());
              drawLandmark(detection.landmarks.getRightEye());
            } else {
              // Modo completo: todos os landmarks (padrão)
              drawLandmark(detection.landmarks.positions);
            }
          }
        });
      });
    } catch (error) {
      console.error('Draw face detection error:', error)
    }
  }

  // Get optimal camera settings for face recognition
  getOptimalCameraSettings() {
    return {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
        frameRate: { ideal: 30 }
      },
      audio: false
    }
  }

  // Set tolerance for face matching
  setTolerance(tolerance) {
    if (tolerance >= 0 && tolerance <= 1) {
      this.defaultTolerance = tolerance
    } else {
      throw new Error('Tolerance must be between 0 and 1')
    }
  }

  // Get current tolerance
  getTolerance() {
    return this.defaultTolerance
  }
}

export const faceRecognitionService = new FaceRecognitionService()
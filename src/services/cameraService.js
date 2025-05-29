class CameraService {
  constructor() {
    this.availableCameras = []
    this.currentCamera = null
    this.stream = null
  }

  // Enumerar todas as câmeras disponíveis no sistema
  async enumerateDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('enumerateDevices não é suportado neste navegador')
      }

      const devices = await navigator.mediaDevices.enumerateDevices()

      // Filtrar apenas dispositivos de vídeo (câmeras)
      this.availableCameras = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Câmera ${device.deviceId.substring(0, 8)}`,
          groupId: device.groupId
        }))

      console.log('Câmeras disponíveis:', this.availableCameras)
      return this.availableCameras
    } catch (error) {
      console.error('Erro ao enumerar dispositivos:', error)
      throw error
    }
  }

  // Obter informações detalhadas sobre uma câmera específica
  async getCameraCapabilities(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      })

      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      const settings = track.getSettings()

      // Parar o stream após obter as informações
      stream.getTracks().forEach(track => track.stop())

      return {
        deviceId,
        capabilities,
        settings,
        label: track.label
      }
    } catch (error) {
      console.error('Erro ao obter capacidades da câmera:', error)
      throw error
    }
  }

  // Verificar se uma câmera específica está disponível
  async isCameraAvailable(deviceId) {
    try {
      const cameras = await this.enumerateDevices()
      return cameras.some(camera => camera.deviceId === deviceId)
    } catch (error) {
      console.error('Erro ao verificar disponibilidade da câmera:', error)
      return false
    }
  }

  // Obter a câmera padrão (primeira disponível)
  async getDefaultCamera() {
    try {
      const cameras = await this.enumerateDevices()
      return cameras.length > 0 ? cameras[0] : null
    } catch (error) {
      console.error('Erro ao obter câmera padrão:', error)
      return null
    }
  }

  // Testar se uma câmera funciona corretamente
  async testCamera(deviceId) {
    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Verificar se o stream tem tracks de vídeo ativos
      const videoTracks = stream.getVideoTracks()
      const isWorking = videoTracks.length > 0 && videoTracks[0].readyState === 'live'

      // Parar o stream após o teste
      stream.getTracks().forEach(track => track.stop())

      return {
        working: isWorking,
        deviceId: videoTracks[0]?.getSettings()?.deviceId,
        label: videoTracks[0]?.label
      }
    } catch (error) {
      console.error('Erro ao testar câmera:', error)
      return {
        working: false,
        error: error.message
      }
    }
  }

  // Obter stream de uma câmera específica
  async getStream(deviceId, constraints = {}) {
    try {
      const defaultConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      }

      const finalConstraints = {
        ...defaultConstraints,
        ...constraints,
        video: {
          ...defaultConstraints.video,
          ...constraints.video
        }
      }

      this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints)
      this.currentCamera = deviceId

      return this.stream
    } catch (error) {
      console.error('Erro ao obter stream da câmera:', error)
      throw error
    }
  }

  // Parar o stream atual
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
      this.currentCamera = null
    }
  }

  // Verificar se há permissão para acessar câmeras
  async checkPermissions() {
    try {
      const result = await navigator.permissions.query({ name: 'camera' })
      return {
        state: result.state, // 'granted', 'denied', 'prompt'
        canRequest: result.state === 'prompt'
      }
    } catch (error) {
      // Fallback para navegadores que não suportam permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        return { state: 'granted', canRequest: false }
      } catch (e) {
        return { state: 'denied', canRequest: true }
      }
    }
  }

  // Solicitar permissão para acessar câmeras
  async requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Permissão de câmera negada:', error)
      return false
    }
  }

  // Obter informações do sistema sobre suporte a câmeras
  getSystemInfo() {
    return {
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasEnumerateDevices: !!navigator.mediaDevices?.enumerateDevices,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    }
  }

  // Detectar mudanças nos dispositivos (câmeras conectadas/desconectadas)
  onDeviceChange(callback) {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', async () => {
        try {
          const newCameras = await this.enumerateDevices()
          callback(newCameras)
        } catch (error) {
          console.error('Erro ao detectar mudança de dispositivos:', error)
        }
      })
    }
  }
}

export const cameraService = new CameraService()
export default cameraService
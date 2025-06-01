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
          groupId: device.groupId,
          isVirtual: this.isVirtualCamera(device.label)
        }))

      console.log('Câmeras disponíveis:', this.availableCameras)
      return this.availableCameras
    } catch (error) {
      console.error('Erro ao enumerar dispositivos:', error)
      throw error
    }
  }

  // Verificar se uma câmera é virtual com base no nome
  isVirtualCamera(label) {
    if (!label) return false;

    const virtualCameraKeywords = [
      'virtual', 'animaze', 'obs', 'snap', 'droid', 'vcam', 'cam link',
      'screen', 'capture', 'manycam', 'camtwist', 'epoccam', 'iriun',
      'ndi', 'streamlabs', 'xsplit', 'elgato', 'avermedia', 'webcamoid',
      'webcam studio', 'prism', 'splitcam', 'ecamm', 'mmhmm', 'camo',
      'droidcam', 'iriun', 'ivccam', 'e2esdk', 'newtek', 'logitech capture',
      'camera emulador', 'emulated', 'emulator', 'dummy', 'fake'
    ];

    const labelLower = label.toLowerCase();
    return virtualCameraKeywords.some(keyword => labelLower.includes(keyword));
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
    console.log('📷 [WEBCAM] Verificando permissões da câmera...');
    try {
      // Verificar se o navegador suporta a API de permissões
      if (navigator.permissions && navigator.permissions.query) {
        console.log('📷 [WEBCAM] Navegador suporta API de permissões');
        try {
          const result = await navigator.permissions.query({ name: 'camera' });
          console.log('📷 [WEBCAM] Estado da permissão via API:', result.state);
          return {
            state: result.state, // 'granted', 'denied', 'prompt'
            canRequest: result.state === 'prompt'
          };
        } catch (permError) {
          console.log('📷 [WEBCAM] Erro ao consultar permissões via API:', permError);
          // Alguns navegadores podem não suportar a consulta de permissão 'camera'
          // Continuar com o fallback para getUserMedia
        }
      }

      console.log('📷 [WEBCAM] Navegador NÃO suporta API de permissões ou consulta falhou, usando fallback');
      // Fallback para navegadores que não suportam permissions API
      try {
        console.log('📷 [WEBCAM] Tentando acessar câmera via getUserMedia...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('📷 [WEBCAM] Acesso à câmera concedido via getUserMedia');
        stream.getTracks().forEach(track => track.stop());
        return { state: 'granted', canRequest: false };
      } catch (e) {
        console.error('📷 [WEBCAM] Erro ao acessar câmera via getUserMedia:', e.name, e.message);
        // Verificar o tipo de erro para determinar se é permissão negada ou outro problema
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          // Tentar determinar se é uma negação definitiva ou apenas um prompt não respondido
          // Em alguns navegadores, não há como diferenciar com certeza
          return { state: 'denied', canRequest: true };
        } else if (e.name === 'NotFoundError') {
          console.error('📷 [WEBCAM] Nenhuma câmera encontrada no dispositivo');
          return { state: 'unavailable', canRequest: false, error: 'no_camera' };
        } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
          console.error('📷 [WEBCAM] Câmera em uso por outro aplicativo');
          return { state: 'unavailable', canRequest: false, error: 'camera_in_use' };
        } else if (e.name === 'AbortError') {
          console.error('📷 [WEBCAM] Usuário fechou o diálogo de permissão');
          return { state: 'prompt', canRequest: true, error: 'dialog_closed' };
        } else if (e.name === 'OverconstrainedError') {
          console.error('📷 [WEBCAM] Restrições de câmera não podem ser satisfeitas');
          return { state: 'error', canRequest: true, error: 'overconstrained' };
        } else {
          console.error('📷 [WEBCAM] Erro desconhecido ao acessar câmera:', e);
          return { state: 'error', canRequest: true, error: e.name };
        }
      }
    } catch (error) {
      console.error('📷 [WEBCAM] Erro ao verificar permissões:', error);
      return { state: 'error', canRequest: true, error: error.message };
    }
  }

  // Verificar se a câmera está em uso por outro aplicativo
  async isCameraInUse(deviceId) {
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Se conseguimos obter o stream, a câmera não está em uso
      stream.getTracks().forEach(track => track.stop());
      return false;
    } catch (error) {
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        console.error(`📷 [WEBCAM] Câmera ${deviceId || 'padrão'} está em uso por outro aplicativo:`, error);
        return true;
      }
      // Outros erros não indicam que a câmera está em uso
      return false;
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

  // Listar câmeras disponíveis (alias para enumerateDevices)
  async listCameras() {
    return await this.enumerateDevices()
  }

  // Listar apenas câmeras físicas (excluindo câmeras virtuais)
  async listPhysicalCameras() {
    const allCameras = await this.enumerateDevices()
    const physicalCameras = allCameras.filter(camera => !camera.isVirtual)
    console.log('Câmeras físicas disponíveis:', physicalCameras)
    return physicalCameras
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

  // Testar especificamente câmeras USB
  async testUsbCameras() {
    console.log('📷 [WEBCAM] Testando câmeras USB...');
    try {
      // Primeiro verificar permissões
      const permissions = await this.checkPermissions();
      if (permissions.state !== 'granted') {
        console.error('📷 [WEBCAM] Permissões não concedidas para testar câmeras USB:', permissions);
        return {
          success: false,
          error: 'permissions_denied',
          permissions,
          errorType: permissions.state === 'denied' ? 'permission_denied' :
            permissions.state === 'prompt' ? 'permission_prompt' :
              permissions.state === 'unavailable' ? 'camera_unavailable' : 'unknown_error',
          errorMessage: permissions.state === 'denied' ? 'Permissão de câmera negada pelo usuário' :
            permissions.state === 'prompt' ? 'Aguardando permissão do usuário' :
              permissions.state === 'unavailable' && permissions.error === 'camera_in_use' ? 'Câmera em uso por outro aplicativo' :
                permissions.state === 'unavailable' && permissions.error === 'no_camera' ? 'Nenhuma câmera encontrada no dispositivo' :
                  'Erro desconhecido ao verificar permissões'
        };
      }

      // Listar todos os dispositivos
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCameras = devices.filter(device => device.kind === 'videoinput');

      console.log('📷 [WEBCAM] Dispositivos de vídeo encontrados:', videoCameras.length);

      if (videoCameras.length === 0) {
        console.error('📷 [WEBCAM] Nenhuma câmera encontrada');
        return {
          success: false,
          error: 'no_cameras_found',
          devices
        };
      }

      // Testar cada câmera
      const results = [];
      for (const camera of videoCameras) {
        try {
          console.log(`📷 [WEBCAM] Testando câmera: ${camera.label || 'Sem nome'} (${camera.deviceId.substring(0, 8)}...)`);

          // Verificar se a câmera está em uso
          const inUse = await this.isCameraInUse(camera.deviceId);
          if (inUse) {
            results.push({
              deviceId: camera.deviceId,
              label: camera.label || `Câmera ${camera.deviceId.substring(0, 8)}`,
              working: false,
              error: 'camera_in_use',
              errorMessage: 'Câmera em uso por outro aplicativo'
            });
            continue;
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: camera.deviceId }
            }
          });

          const videoTracks = stream.getVideoTracks();
          const trackInfo = videoTracks[0]?.getSettings() || {};

          results.push({
            deviceId: camera.deviceId,
            label: camera.label || `Câmera ${camera.deviceId.substring(0, 8)}`,
            working: videoTracks.length > 0,
            trackInfo
          });

          // Liberar recursos
          stream.getTracks().forEach(track => track.stop());

        } catch (err) {
          console.error(`📷 [WEBCAM] Erro ao testar câmera ${camera.label || camera.deviceId}:`, err);
          results.push({
            deviceId: camera.deviceId,
            label: camera.label || `Câmera ${camera.deviceId.substring(0, 8)}`,
            working: false,
            error: err.name,
            errorMessage: this.getErrorMessage(err.name, err.message)
          });
        }
      }

      console.log('📷 [WEBCAM] Resultados dos testes de câmera:', results);
      return {
        success: true,
        cameras: results,
        workingCameras: results.filter(r => r.working)
      };

    } catch (error) {
      console.error('📷 [WEBCAM] Erro ao testar câmeras USB:', error);
      return {
        success: false,
        error: error.name,
        errorMessage: this.getErrorMessage(error.name, error.message)
      };
    }
  }

  // Obter mensagem de erro amigável com base no nome do erro
  getErrorMessage(errorName, errorMessage) {
    switch (errorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Permissão de câmera negada pelo usuário';
      case 'NotFoundError':
        return 'Nenhuma câmera encontrada no dispositivo';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Câmera em uso por outro aplicativo ou hardware com problema';
      case 'OverconstrainedError':
        return 'As configurações solicitadas não são suportadas pela câmera';
      case 'AbortError':
        return 'Operação cancelada pelo usuário ou pelo sistema';
      case 'TypeError':
        return 'Parâmetros inválidos ao acessar a câmera';
      default:
        return errorMessage || 'Erro desconhecido ao acessar a câmera';
    }
  }
}

export const cameraService = new CameraService()
export default cameraService
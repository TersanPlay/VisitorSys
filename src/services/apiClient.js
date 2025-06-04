import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
          toast.error('Sessão expirada. Faça login novamente.')
          break
        case 403:
          toast.error('Acesso negado. Você não tem permissão para esta ação.')
          break
        case 404:
          toast.error('Recurso não encontrado.')
          break
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).forEach(errorArray => {
              errorArray.forEach(errorMsg => toast.error(errorMsg))
            })
          } else {
            toast.error(data.message || 'Dados inválidos.')
          }
          break
        case 429:
          toast.error('Muitas tentativas. Tente novamente em alguns minutos.')
          break
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.')
          break
        default:
          toast.error(data.message || 'Erro inesperado. Tente novamente.')
      }
    } else if (error.request) {
      // Network error
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      // Other error
      toast.error('Erro inesperado. Tente novamente.')
    }

    return Promise.reject(error)
  }
)

// Helper functions for common HTTP methods
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
}

// File upload helper
export const uploadFile = async (url, file, onProgress = null) => {
  const formData = new FormData()
  formData.append('file', file)

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }

  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      onProgress(percentCompleted)
    }
  }

  return apiClient.post(url, formData, config)
}

// Download file helper
export const downloadFile = async (url, filename) => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Erro ao baixar arquivo')
  }
}

export { apiClient }
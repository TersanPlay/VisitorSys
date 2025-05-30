import { api } from './apiClient'
import { faceRecognitionService } from './faceRecognitionService'
import CryptoJS from 'crypto-js'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

class VisitorService {
  constructor() {
    this.baseURL = '/api/visitors'
    this.secretKey = 'visitor-data-encryption-key'
  }

  // Encrypt sensitive visitor data
  encryptSensitiveData(data) {
    const sensitiveFields = ['cpf', 'rg', 'phone', 'email']
    const encrypted = { ...data }

    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = CryptoJS.AES.encrypt(
          encrypted[field].toString(),
          this.secretKey
        ).toString()
      }
    })

    return encrypted
  }

  // Decrypt sensitive visitor data
  decryptSensitiveData(data) {
    const sensitiveFields = ['cpf', 'rg', 'phone', 'email']
    const decrypted = { ...data }

    sensitiveFields.forEach(field => {
      if (decrypted[field]) {
        try {
          const bytes = CryptoJS.AES.decrypt(decrypted[field], this.secretKey)
          decrypted[field] = bytes.toString(CryptoJS.enc.Utf8)
        } catch (error) {
          console.error(`Error decrypting ${field}:`, error)
        }
      }
    })

    return decrypted
  }

  // Register new visitor
  async registerVisitor(visitorData, photoFile = null) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'visitReason']
      const missingFields = requiredFields.filter(field => !visitorData[field])

      // Validar documento principal (pelo menos um deve estar preenchido)
      const hasDocument = visitorData.cpf || visitorData.rg || visitorData.cnh
      if (!hasDocument) {
        missingFields.push('documento (CPF, RG ou CNH)')
      }

      // Validar se pelo menos um setor ou departamento foi selecionado
      const hasSectorOrDepartment = (visitorData.sectors && visitorData.sectors.length > 0) ||
        (visitorData.departments && visitorData.departments.length > 0)
      if (!hasSectorOrDepartment) {
        missingFields.push('setor ou departamento')
      }

      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      }

      // Validate CPF format (only if provided)
      if (visitorData.cpf && !this.validateCPF(visitorData.cpf)) {
        throw new Error('CPF inválido')
      }

      // Validate email format (only if provided)
      if (visitorData.email && !this.validateEmail(visitorData.email)) {
        throw new Error('E-mail inválido')
      }

      // Process photo and extract face encoding if provided
      let faceEncoding = null
      let photoUrl = null

      if (photoFile) {
        const photoResult = await this.processVisitorPhoto(photoFile)
        faceEncoding = photoResult.encoding
        photoUrl = photoResult.url
      }

      // Encrypt sensitive data
      const encryptedData = this.encryptSensitiveData(visitorData)

      // Prepare visitor record
      const visitorRecord = {
        ...encryptedData,
        faceEncoding,
        photoUrl,
        registeredAt: new Date().toISOString(),
        status: 'registered',
        visits: []
      }

      // Mock API call (replace with real API)
      const response = await this.mockRegisterVisitor(visitorRecord)

      return {
        success: true,
        visitor: response.visitor,
        message: 'Visitante registrado com sucesso'
      }
    } catch (error) {
      console.error('Register visitor error:', error)
      throw error
    }
  }

  // Process visitor photo and extract face encoding
  async processVisitorPhoto(photoFile) {
    try {
      // Validate file type
      if (!photoFile.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem')
      }

      // Validate file size (max 5MB)
      if (photoFile.size > 5 * 1024 * 1024) {
        throw new Error('Imagem muito grande. Máximo 5MB')
      }

      // Create image element for processing
      const imageElement = await this.createImageElement(photoFile)

      // Validate image quality
      const validation = await faceRecognitionService.validateImageQuality(imageElement)
      if (!validation.isValid) {
        throw new Error(`Qualidade da imagem inadequada: ${validation.issues.join(', ')}`)
      }

      // Extract face encoding
      const faceData = await faceRecognitionService.extractFaceEncoding(imageElement)

      // Mock photo upload (replace with real upload service)
      const photoUrl = await this.mockUploadPhoto(photoFile)

      return {
        encoding: faceData.encoding,
        confidence: faceData.confidence,
        url: photoUrl
      }
    } catch (error) {
      console.error('Process photo error:', error)
      throw error
    }
  }

  // Create image element from file
  createImageElement(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Erro ao carregar imagem'))
      }

      img.src = url
    })
  }

  // Search visitors by face recognition
  async searchVisitorByFace(photoFile, tolerance = null) {
    try {
      // Process the search photo
      const imageElement = await this.createImageElement(photoFile)
      const searchEncoding = await faceRecognitionService.extractFaceEncoding(imageElement)

      // Get all registered visitors with face encodings
      const visitors = await this.getAllVisitors()
      const visitorsWithFaces = visitors.filter(v => v.faceEncoding)

      // Find best match
      const bestMatch = faceRecognitionService.findBestMatch(
        searchEncoding.encoding,
        visitorsWithFaces.map(v => ({ ...v, encoding: v.faceEncoding })),
        tolerance
      )

      if (bestMatch) {
        return {
          success: true,
          visitor: this.decryptSensitiveData(bestMatch),
          confidence: bestMatch.confidence,
          similarity: bestMatch.similarity
        }
      } else {
        return {
          success: false,
          message: 'Nenhum visitante encontrado com essa face'
        }
      }
    } catch (error) {
      console.error('Search visitor by face error:', error)
      throw error
    }
  }

  // Start visitor entry
  async startVisit(visitorId, entryData = {}) {
    try {
      const visit = {
        id: Date.now().toString(),
        visitorId,
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'in_progress',
        entryPoint: entryData.entryPoint || 'main_entrance',
        authorizedBy: entryData.authorizedBy,
        notes: entryData.notes || '',
        createdAt: new Date().toISOString()
      }

      // Mock API call
      const response = await this.mockStartVisit(visit)

      return {
        success: true,
        visit: response.visit,
        message: 'Visita iniciada com sucesso'
      }
    } catch (error) {
      console.error('Start visit error:', error)
      throw error
    }
  }

  // End visitor exit
  async endVisit(visitId, exitData = {}) {
    try {
      const exitTime = new Date().toISOString()

      // Mock API call
      const response = await this.mockEndVisit(visitId, {
        exitTime,
        exitPoint: exitData.exitPoint || 'main_entrance',
        exitNotes: exitData.notes || ''
      })

      return {
        success: true,
        visit: response.visit,
        message: 'Visita finalizada com sucesso'
      }
    } catch (error) {
      console.error('End visit error:', error)
      throw error
    }
  }

  // Get visitor history
  async getVisitorHistory(visitorId) {
    try {
      const visits = JSON.parse(localStorage.getItem('visits') || '[]')
      const visitorVisits = visits.filter(v => v.visitorId === visitorId)

      return visitorVisits.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
    } catch (error) {
      console.error('Get visitor history error:', error)
      return []
    }
  }

  // Get all visitors
  async getAllVisitors(filters = {}) {
    try {
      let visitors = JSON.parse(localStorage.getItem('visitors') || '[]')

      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        visitors = visitors.filter(v => {
          const decrypted = this.decryptSensitiveData(v)
          return (
            decrypted.name.toLowerCase().includes(searchTerm) ||
            decrypted.company.toLowerCase().includes(searchTerm) ||
            decrypted.email.toLowerCase().includes(searchTerm)
          )
        })
      }

      if (filters.company) {
        visitors = visitors.filter(v => v.company === filters.company)
      }

      if (filters.status) {
        visitors = visitors.filter(v => v.status === filters.status)
      }

      // Decrypt sensitive data for display
      return visitors.map(v => this.decryptSensitiveData(v))
    } catch (error) {
      console.error('Get all visitors error:', error)
      return []
    }
  }

  // Get active visits
  async getActiveVisits() {
    try {
      const visits = JSON.parse(localStorage.getItem('visits') || '[]')
      const activeVisits = visits.filter(v => v.status === 'in_progress')

      // Get visitor details for each active visit
      const visitors = await this.getAllVisitors()

      return activeVisits.map(visit => {
        const visitor = visitors.find(v => v.id === visit.visitorId)
        return {
          ...visit,
          visitor: visitor || null
        }
      })
    } catch (error) {
      console.error('Get active visits error:', error)
      return []
    }
  }

  // Validate CPF
  validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '')

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false
    }

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }

    let remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }

    remainder = 11 - (sum % 11)
    if (remainder === 10 || remainder === 11) remainder = 0

    return remainder === parseInt(cpf.charAt(10))
  }

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Mock functions (replace with real API calls)
  async mockRegisterVisitor(visitorData) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]')
    const newVisitor = {
      ...visitorData,
      id: Date.now().toString()
    }

    visitors.push(newVisitor)
    localStorage.setItem('visitors', JSON.stringify(visitors))

    return { visitor: newVisitor }
  }

  async mockUploadPhoto(file) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return `https://example.com/photos/${Date.now()}.jpg`
  }

  async mockStartVisit(visit) {
    await new Promise(resolve => setTimeout(resolve, 500))

    const visits = JSON.parse(localStorage.getItem('visits') || '[]')
    visits.push(visit)
    localStorage.setItem('visits', JSON.stringify(visits))

    return { visit }
  }

  async mockEndVisit(visitId, exitData) {
    await new Promise(resolve => setTimeout(resolve, 500))

    const visits = JSON.parse(localStorage.getItem('visits') || '[]')
    const visitIndex = visits.findIndex(v => v.id === visitId)

    if (visitIndex !== -1) {
      visits[visitIndex] = {
        ...visits[visitIndex],
        ...exitData,
        status: 'completed'
      }
      localStorage.setItem('visits', JSON.stringify(visits))
      return { visit: visits[visitIndex] }
    }

    throw new Error('Visita não encontrada')
  }
}

export const visitorService = new VisitorService()
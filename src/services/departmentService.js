import { api } from './apiClient'
import { toast } from 'react-hot-toast'

class DepartmentService {
  constructor() {
    this.baseURL = '/api/departments'
  }

  // Validar campos obrigatórios do departamento
  validateDepartmentData(departmentData) {
    const requiredFields = ['name', 'description', 'location', 'responsibleName', 'responsiblePosition', 'responsibleEmail']
    const missingFields = requiredFields.filter(field => !departmentData[field])

    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
    }

    // Validar formato de e-mail
    if (departmentData.responsibleEmail && !this.validateEmail(departmentData.responsibleEmail)) {
      throw new Error('E-mail do responsável inválido')
    }

    return true
  }

  // Validar formato de e-mail
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Obter todos os departamentos
  async getAllDepartments() {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockGetAllDepartments()
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error)
      throw error
    }
  }

  // Obter departamento por ID
  async getDepartmentById(id) {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockGetDepartmentById(id)
    } catch (error) {
      console.error(`Erro ao buscar departamento com ID ${id}:`, error)
      throw error
    }
  }

  // Criar novo departamento
  async createDepartment(departmentData, imageFile = null) {
    try {
      // Validar dados do departamento
      this.validateDepartmentData(departmentData)

      // Processar imagem se fornecida
      let imageUrl = null
      if (imageFile) {
        imageUrl = await this.processImageFile(imageFile)
      }

      // Preparar registro do departamento
      const departmentRecord = {
        ...departmentData,
        imageUrl,
        createdAt: new Date().toISOString(),
        status: departmentData.status || 'active'
      }

      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockCreateDepartment(departmentRecord)

      return {
        success: true,
        department: response.department,
        message: 'Departamento criado com sucesso'
      }
    } catch (error) {
      console.error('Erro ao criar departamento:', error)
      throw error
    }
  }

  // Atualizar departamento existente
  async updateDepartment(id, departmentData, imageFile = null) {
    try {
      // Validar dados do departamento
      this.validateDepartmentData(departmentData)

      // Buscar departamento existente
      const existingDepartment = await this.getDepartmentById(id)
      if (!existingDepartment) {
        throw new Error('Departamento não encontrado')
      }

      // Processar imagem se fornecida
      let imageUrl = existingDepartment.imageUrl
      if (imageFile) {
        imageUrl = await this.processImageFile(imageFile)
      }

      // Preparar dados atualizados
      const updatedDepartment = {
        ...existingDepartment,
        ...departmentData,
        imageUrl,
        updatedAt: new Date().toISOString()
      }

      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockUpdateDepartment(id, updatedDepartment)

      return {
        success: true,
        department: response.department,
        message: 'Departamento atualizado com sucesso'
      }
    } catch (error) {
      console.error(`Erro ao atualizar departamento com ID ${id}:`, error)
      throw error
    }
  }

  // Excluir departamento
  async deleteDepartment(id) {
    try {
      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockDeleteDepartment(id)

      return {
        success: true,
        message: 'Departamento excluído com sucesso'
      }
    } catch (error) {
      console.error(`Erro ao excluir departamento com ID ${id}:`, error)
      throw error
    }
  }

  // Obter setores vinculados a um departamento
  async getLinkedSectors(departmentId) {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockGetLinkedSectors(departmentId)
    } catch (error) {
      console.error(`Erro ao buscar setores vinculados ao departamento ${departmentId}:`, error)
      throw error
    }
  }

  // Vincular setor a um departamento
  async linkSector(departmentId, sectorId) {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockLinkSector(departmentId, sectorId)
    } catch (error) {
      console.error(`Erro ao vincular setor ao departamento:`, error)
      throw error
    }
  }

  // Desvincular setor de um departamento
  async unlinkSector(departmentId, sectorId) {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockUnlinkSector(departmentId, sectorId)
    } catch (error) {
      console.error(`Erro ao desvincular setor do departamento:`, error)
      throw error
    }
  }

  // Processar arquivo de imagem (simulado)
  async processImageFile(file) {
    // Simulação de upload de arquivo
    // Em uma implementação real, isso enviaria o arquivo para o servidor
    return URL.createObjectURL(file)
  }

  // Métodos de simulação de API (substituir por chamadas reais à API)
  // ===================================================================

  // Simulação: Obter todos os departamentos
  mockGetAllDepartments() {
    const departments = JSON.parse(localStorage.getItem('departments')) || []
    return Promise.resolve(departments)
  }

  // Simulação: Obter departamento por ID
  mockGetDepartmentById(id) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []
    const department = departments.find(d => d.id === id)
    return Promise.resolve(department || null)
  }

  // Simulação: Criar departamento
  mockCreateDepartment(departmentData) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []

    // Gerar ID único
    const newId = Date.now().toString()

    // Criar novo departamento
    const newDepartment = {
      id: newId,
      ...departmentData,
      linkedSectors: []
    }

    // Adicionar à lista
    departments.push(newDepartment)

    // Salvar no localStorage
    localStorage.setItem('departments', JSON.stringify(departments))

    return Promise.resolve({ department: newDepartment })
  }

  // Simulação: Atualizar departamento
  mockUpdateDepartment(id, departmentData) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []

    // Encontrar índice do departamento
    const index = departments.findIndex(d => d.id === id)

    if (index === -1) {
      return Promise.reject(new Error('Departamento não encontrado'))
    }

    // Preservar setores vinculados
    const linkedSectors = departments[index].linkedSectors || []

    // Atualizar departamento
    departments[index] = {
      ...departments[index],
      ...departmentData,
      linkedSectors
    }

    // Salvar no localStorage
    localStorage.setItem('departments', JSON.stringify(departments))

    return Promise.resolve({ department: departments[index] })
  }

  // Simulação: Excluir departamento
  mockDeleteDepartment(id) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []

    // Filtrar departamento a ser excluído
    const updatedDepartments = departments.filter(d => d.id !== id)

    // Salvar no localStorage
    localStorage.setItem('departments', JSON.stringify(updatedDepartments))

    return Promise.resolve({ success: true })
  }

  // Simulação: Obter setores vinculados a um departamento
  mockGetLinkedSectors(departmentId) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []
    const department = departments.find(d => d.id === departmentId)

    if (!department) {
      return Promise.reject(new Error('Departamento não encontrado'))
    }

    // Obter IDs dos setores vinculados
    const linkedSectorIds = department.linkedSectors || []

    // Buscar informações completas dos setores
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []
    const linkedSectors = sectors.filter(s => linkedSectorIds.includes(s.id))

    return Promise.resolve(linkedSectors)
  }

  // Simulação: Vincular setor a um departamento
  mockLinkSector(departmentId, sectorId) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []
    const departmentIndex = departments.findIndex(d => d.id === departmentId)

    if (departmentIndex === -1) {
      return Promise.reject(new Error('Departamento não encontrado'))
    }

    // Verificar se o setor existe
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []
    const sectorExists = sectors.some(s => s.id === sectorId)

    if (!sectorExists) {
      return Promise.reject(new Error('Setor não encontrado'))
    }

    // Inicializar array de setores vinculados se não existir
    if (!departments[departmentIndex].linkedSectors) {
      departments[departmentIndex].linkedSectors = []
    }

    // Verificar se o setor já está vinculado
    if (departments[departmentIndex].linkedSectors.includes(sectorId)) {
      return Promise.resolve({ success: true, message: 'Setor já vinculado a este departamento' })
    }

    // Adicionar setor à lista de vinculados
    departments[departmentIndex].linkedSectors.push(sectorId)

    // Salvar no localStorage
    localStorage.setItem('departments', JSON.stringify(departments))

    return Promise.resolve({ success: true, message: 'Setor vinculado com sucesso' })
  }

  // Simulação: Desvincular setor de um departamento
  mockUnlinkSector(departmentId, sectorId) {
    const departments = JSON.parse(localStorage.getItem('departments')) || []
    const departmentIndex = departments.findIndex(d => d.id === departmentId)

    if (departmentIndex === -1) {
      return Promise.reject(new Error('Departamento não encontrado'))
    }

    // Verificar se o departamento tem setores vinculados
    if (!departments[departmentIndex].linkedSectors) {
      return Promise.resolve({ success: true, message: 'Nenhum setor vinculado a este departamento' })
    }

    // Remover setor da lista de vinculados
    departments[departmentIndex].linkedSectors = departments[departmentIndex].linkedSectors.filter(
      id => id !== sectorId
    )

    // Salvar no localStorage
    localStorage.setItem('departments', JSON.stringify(departments))

    return Promise.resolve({ success: true, message: 'Setor desvinculado com sucesso' })
  }
}

export const departmentService = new DepartmentService()
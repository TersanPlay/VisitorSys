import { api } from './apiClient'
import { toast } from 'react-hot-toast'

class SectorService {
  constructor() {
    this.baseURL = '/api/sectors'
  }

  // Validar campos obrigatórios do setor
  validateSectorData(sectorData) {
    const requiredFields = ['name', 'description', 'location', 'responsibleName', 'responsibleEmail']
    const missingFields = requiredFields.filter(field => !sectorData[field])

    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
    }

    // Validar formato de e-mail
    if (sectorData.responsibleEmail && !this.validateEmail(sectorData.responsibleEmail)) {
      throw new Error('E-mail do responsável inválido')
    }

    return true
  }

  // Validar formato de e-mail
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Obter todos os setores
  async getAllSectors() {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockGetAllSectors()
    } catch (error) {
      console.error('Erro ao buscar setores:', error)
      throw error
    }
  }

  // Obter setor por ID
  async getSectorById(id) {
    try {
      // Simulação de API (substituir por chamada real à API)
      return this.mockGetSectorById(id)
    } catch (error) {
      console.error(`Erro ao buscar setor com ID ${id}:`, error)
      throw error
    }
  }

  // Criar novo setor
  async createSector(sectorData, iconFile = null) {
    try {
      // Validar dados do setor
      this.validateSectorData(sectorData)

      // Processar ícone/imagem se fornecido
      let iconUrl = null
      if (iconFile) {
        iconUrl = await this.processIconFile(iconFile)
      }

      // Preparar registro do setor
      const sectorRecord = {
        ...sectorData,
        iconUrl,
        createdAt: new Date().toISOString(),
        status: sectorData.status || 'active'
      }

      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockCreateSector(sectorRecord)

      return {
        success: true,
        sector: response.sector,
        message: 'Setor criado com sucesso'
      }
    } catch (error) {
      console.error('Erro ao criar setor:', error)
      throw error
    }
  }

  // Atualizar setor existente
  async updateSector(id, sectorData, iconFile = null) {
    try {
      // Validar dados do setor
      this.validateSectorData(sectorData)

      // Buscar setor existente
      const existingSector = await this.getSectorById(id)
      if (!existingSector) {
        throw new Error('Setor não encontrado')
      }

      // Processar ícone/imagem se fornecido
      let iconUrl = existingSector.iconUrl
      if (iconFile) {
        iconUrl = await this.processIconFile(iconFile)
      }

      // Preparar dados atualizados
      const updatedSector = {
        ...existingSector,
        ...sectorData,
        iconUrl,
        updatedAt: new Date().toISOString()
      }

      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockUpdateSector(id, updatedSector)

      return {
        success: true,
        sector: response.sector,
        message: 'Setor atualizado com sucesso'
      }
    } catch (error) {
      console.error(`Erro ao atualizar setor com ID ${id}:`, error)
      throw error
    }
  }

  // Excluir setor
  async deleteSector(id) {
    try {
      // Simulação de API (substituir por chamada real à API)
      const response = await this.mockDeleteSector(id)

      return {
        success: true,
        message: 'Setor excluído com sucesso'
      }
    } catch (error) {
      console.error(`Erro ao excluir setor com ID ${id}:`, error)
      throw error
    }
  }

  // Processar arquivo de ícone (simulado)
  async processIconFile(file) {
    // Simulação de upload de arquivo
    // Em uma implementação real, isso enviaria o arquivo para o servidor
    return URL.createObjectURL(file)
  }

  // Métodos de simulação de API (substituir por chamadas reais à API)
  // ===================================================================

  // Simulação: Obter todos os setores
  mockGetAllSectors() {
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []
    return Promise.resolve(sectors)
  }

  // Simulação: Obter setor por ID
  mockGetSectorById(id) {
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []
    const sector = sectors.find(s => s.id === id)
    return Promise.resolve(sector || null)
  }

  // Simulação: Criar setor
  mockCreateSector(sectorData) {
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []

    // Gerar ID único
    const newId = Date.now().toString()

    // Criar novo setor
    const newSector = {
      id: newId,
      ...sectorData
    }

    // Adicionar à lista
    sectors.push(newSector)

    // Salvar no localStorage
    localStorage.setItem('sectors', JSON.stringify(sectors))

    return Promise.resolve({ sector: newSector })
  }

  // Simulação: Atualizar setor
  mockUpdateSector(id, sectorData) {
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []

    // Encontrar índice do setor
    const index = sectors.findIndex(s => s.id === id)

    if (index === -1) {
      return Promise.reject(new Error('Setor não encontrado'))
    }

    // Atualizar setor
    sectors[index] = {
      ...sectors[index],
      ...sectorData
    }

    // Salvar no localStorage
    localStorage.setItem('sectors', JSON.stringify(sectors))

    return Promise.resolve({ sector: sectors[index] })
  }

  // Simulação: Excluir setor
  mockDeleteSector(id) {
    const sectors = JSON.parse(localStorage.getItem('sectors')) || []

    // Filtrar setor a ser excluído
    const updatedSectors = sectors.filter(s => s.id !== id)

    // Salvar no localStorage
    localStorage.setItem('sectors', JSON.stringify(updatedSectors))

    return Promise.resolve({ success: true })
  }
}

export const sectorService = new SectorService()
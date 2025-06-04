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
      const response = await api.get(this.baseURL)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error)
      toast.error(error.response?.data?.message || 'Erro ao buscar departamentos.')
      throw error
    }
  }

  // Obter departamento por ID
  async getDepartmentById(id) {
    try {
      const response = await api.get(`${this.baseURL}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar departamento com ID ${id}:`, error)
      toast.error(error.response?.data?.message || `Erro ao buscar departamento com ID ${id}.`)
      throw error
    }
  }

  // Criar novo departamento
  async createDepartment(departmentData, imageFile = null) {
    try {
      this.validateDepartmentData(departmentData)

      let imageUrl = departmentData.imageUrl || null // Usar a URL existente ou null
      if (imageFile) {
        const uploadResponse = await this.processImageFile(imageFile);
        if (uploadResponse && uploadResponse.filePath) {
          imageUrl = uploadResponse.filePath; // Usa o caminho do arquivo retornado pelo backend
        } else {
          // Tratar falha no upload, talvez lançar um erro ou usar uma imagem padrão
          console.error('Falha no upload da imagem, usando imagem anterior ou nula.');
          toast.error('Falha no upload da imagem.');
        }
      }

      const departmentPayload = {
        ...departmentData,
        imageUrl,
        // createdAt e status são geralmente definidos pelo backend
      }

      const response = await api.post(this.baseURL, departmentPayload)
      toast.success(response.data.message || 'Departamento criado com sucesso!')
      return response.data // Espera-se { success: true, department: newDepartment, message: '...' }
    } catch (error) {
      console.error('Erro ao criar departamento:', error)
      toast.error(error.response?.data?.message || 'Ocorreu um erro ao criar o departamento.')
      throw error
    }
  }

  // Atualizar departamento existente
  async updateDepartment(id, departmentData, imageFile = null) {
    try {
      this.validateDepartmentData(departmentData)

      let imageUrl = departmentData.imageUrl // Manter a imagem existente se não for fornecida uma nova
      if (imageFile) {
        const uploadResponse = await this.processImageFile(imageFile);
        if (uploadResponse && uploadResponse.filePath) {
          imageUrl = uploadResponse.filePath; // Usa o caminho do arquivo retornado pelo backend
        } else {
          // Tratar falha no upload, talvez lançar um erro ou usar uma imagem padrão
          console.error('Falha no upload da imagem, usando imagem anterior ou nula.');
          toast.error('Falha no upload da imagem.');
        }
      }

      const departmentPayload = {
        ...departmentData,
        imageUrl,
        // updatedAt é geralmente definido pelo backend
      }

      const response = await api.put(`${this.baseURL}/${id}`, departmentPayload)
      toast.success(response.data.message || 'Departamento atualizado com sucesso!')
      return response.data // Espera-se { success: true, department: updatedDepartment, message: '...' }
    } catch (error) {
      console.error(`Erro ao atualizar departamento com ID ${id}:`, error)
      toast.error(error.response?.data?.message || `Erro ao atualizar departamento com ID ${id}.`)
      throw error
    }
  }

  // Excluir departamento
  async deleteDepartment(id) {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`)
      toast.success(response.data.message || 'Departamento excluído com sucesso!')
      return response.data // Espera-se { success: true, message: '...' }
    } catch (error) {
      console.error(`Erro ao excluir departamento com ID ${id}:`, error)
      toast.error(error.response?.data?.message || `Erro ao excluir departamento com ID ${id}.`)
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

  // Processar arquivo de imagem (envia para o backend)
  async processImageFile(file) {
    const formData = new FormData();
    formData.append('image', file); // 'image' deve corresponder ao nome do campo esperado pelo backend (upload.single('image'))

    try {
      const response = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Imagem enviada com sucesso!');
      return response.data; // Espera-se { message: '...', filePath: '...', fileName: '...' }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar imagem.');
      // Retornar null ou lançar o erro para que a função chamadora possa tratar
      // dependendo da lógica de negócios desejada.
      return null;
    }
  }

  // As funções de vincular/desvincular setores (getLinkedSectors, linkSector, unlinkSector)
  // e a lógica de localStorage foram removidas, pois a gestão de dados agora é feita pelo backend.
  // A função createDirectoryStructure também foi removida pois essa lógica está no backend.

  // Simulação de busca de servidores por departamento e mês/ano
  async getServidoresByDepartment(departmentId, month, year) {
    console.log(`Simulando busca de servidores para o departamento ${departmentId} no mês ${month}/${year}`);
    // Retorna dados mockados para simular a resposta da API
    return [
      {
        id: 'servidor1',
        nome: 'João Silva',
        matricula: '12345',
        cpf: '111.222.333-44',
        cargo: 'Analista',
        lotacao: 'Gabinete',
        vinculo: 'Efetivo'
      },
      {
        id: 'servidor2',
        nome: 'Maria Oliveira',
        matricula: '67890',
        cpf: '555.666.777-88',
        cargo: 'Técnico',
        lotacao: 'Gabinete',
        vinculo: 'Contratado'
      }
    ];
  }
}

export const departmentService = new DepartmentService()
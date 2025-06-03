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

  // Obter servidores de um setor por mês e ano
  async getServidoresBySector(sectorId, month, year) {
    try {
      // Em um ambiente de produção, isso seria uma chamada à API
      // return await api.get(`${this.baseURL}/${sectorId}/servidores?month=${month}&year=${year}`)

      // Por enquanto, vamos usar uma simulação que busca do localStorage
      const sectorName = await this.getSectorNameForPath(sectorId);
      const storageKey = `servidores_${sectorName}_${year}_${month}`;

      // Tentar buscar dados do localStorage
      const servidoresData = localStorage.getItem(storageKey);

      if (servidoresData) {
        return JSON.parse(servidoresData);
      }

      // Se não houver dados no localStorage, retorna array vazio
      return [];
    } catch (error) {
      console.error(`Erro ao buscar servidores do setor ${sectorId} para ${month}/${year}:`, error)
      throw error
    }
  }

  // Obter nome do setor formatado para uso em caminhos de arquivo
  async getSectorNameForPath(sectorId) {
    try {
      const sector = await this.getSectorById(sectorId);
      if (!sector) {
        throw new Error('Setor não encontrado');
      }

      // Formatar nome do setor para uso em caminhos (remover caracteres especiais)
      return sector.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    } catch (error) {
      console.error(`Erro ao obter nome formatado do setor ${sectorId}:`, error);
      throw error;
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

      // Criar estrutura de diretórios após criação bem-sucedida
      await this.createDirectoryStructure(response.sector)

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

  // Criar estrutura de diretórios
  async createDirectoryStructure(sectorRecord) {
    try {
      const currentYear = new Date().getFullYear();
      const months = [
        '01-Janeiro',
        '02-Fevereiro',
        '03-Março',
        '04-Abril',
        '05-Maio',
        '06-Junho',
        '07-Julho',
        '08-Agosto',
        '09-Setembro',
        '10-Outubro',
        '11-Novembro',
        '12-Dezembro'
      ];

      // Obter o nome do setor para criar a pasta específica
      const sectorName = sectorRecord?.name || 'setor_sem_nome';
      const safeSectorName = sectorName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      // Usar sempre o caminho base 'dadosplanilha' na raiz do projeto
      const basePath = 'dadosplanilha';

      console.log(`Criando estrutura de diretórios para o setor "${sectorName}" no ano ${currentYear}:`);
      console.log(`- ${basePath}/`);
      console.log(`  └── ${safeSectorName}/`);
      console.log(`      └── ${currentYear}/`);

      for (const month of months) {
        console.log(`          ├── ${month}/`);
      }

      try {
        // Importar o módulo de criação de diretórios
        const fs = require('fs');
        const path = require('path');

        // Caminho base no sistema de arquivos (na raiz do projeto)
        const baseDir = path.resolve(basePath);

        // Criar diretório base se não existir
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
          console.log(`Diretório base criado: ${baseDir}`);
        }

        // Criar diretório do setor
        const sectorDir = path.join(baseDir, safeSectorName);
        if (!fs.existsSync(sectorDir)) {
          fs.mkdirSync(sectorDir, { recursive: true });
          console.log(`Diretório do setor criado: ${sectorDir}`);
        }

        // Criar diretório do ano
        const yearDir = path.join(sectorDir, currentYear.toString());
        if (!fs.existsSync(yearDir)) {
          fs.mkdirSync(yearDir, { recursive: true });
          console.log(`Diretório do ano criado: ${yearDir}`);
        }

        // Criar diretórios dos meses
        for (const month of months) {
          const monthDir = path.join(yearDir, month);
          if (!fs.existsSync(monthDir)) {
            fs.mkdirSync(monthDir, { recursive: true });
            console.log(`Diretório do mês criado: ${monthDir}`);
          }
        }

        toast.success(`Estrutura de diretórios criada com sucesso para o setor "${sectorName}"!`);
      } catch (fsError) {
        console.error('Erro ao criar diretórios no sistema de arquivos:', fsError);
        toast.error('Não foi possível criar a estrutura de diretórios no sistema de arquivos');
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar estrutura de diretórios:', error);
      toast.error('Não foi possível criar a estrutura de diretórios');
      return false;
    }
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
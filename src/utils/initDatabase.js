import { dbService } from '../services/dbService.js';

// Função para verificar se o banco de dados local está vazio
async function isDatabaseEmpty() {
  try {
    const departments = dbService.getDepartments();
    return !departments || departments.length === 0;
  } catch (error) {
    console.error('Erro ao verificar se o banco de dados está vazio:', error);
    return true;
  }
}

// Função para inicializar o banco de dados local
export async function initDatabase() {
  try {
    console.log('Inicializando banco de dados local...');

    // Verificar se o banco de dados está vazio
    const empty = await isDatabaseEmpty();

    if (empty) {
      console.log('Banco de dados vazio. Inicializando com dados padrão...');

      // Inicializar com dados padrão se necessário
      dbService.setItem('departments', []);
      dbService.setItem('visitors', []);
      dbService.setItem('visits', []);

      console.log('Inicialização concluída com sucesso!');
    } else {
      console.log('Banco de dados já contém dados.');
    }

    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}
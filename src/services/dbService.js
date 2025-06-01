class DbService {
  constructor() {
    this.storage = window.localStorage;
    console.log('Serviço de armazenamento local inicializado');
  }

  // Métodos para manipulação de dados
  setItem(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  // Métodos específicos para entidades
  getDepartments() {
    return this.getItem('departments') || [];
  }

  saveDepartment(department) {
    const departments = this.getDepartments();
    departments.push(department);
    return this.setItem('departments', departments);
  }

  getSectors() {
    return this.getItem('sectors') || [];
  }

  saveSector(sector) {
    const sectors = this.getSectors();
    sectors.push(sector);
    return this.setItem('sectors', sectors);
  }

  getVisitors() {
    return this.getItem('visitors') || [];
  }

  saveVisitor(visitor) {
    const visitors = this.getVisitors();
    visitors.push(visitor);
    return this.setItem('visitors', visitors);
  }
}





getVisits()
{
  return this.getItem('visits') || [];
}

saveVisit(visit)
{
  const visits = this.getVisits();
  visits.push(visit);
  return this.setItem('visits', visits);
}

updateVisit(visitId, updatedVisit)
{
  const visits = this.getVisits();
  const index = visits.findIndex(v => v.id === visitId);
  if (index !== -1) {
    visits[index] = { ...visits[index], ...updatedVisit };
    return this.setItem('visits', visits);
  }
  return false;
}

updateDepartment(departmentId, updatedDepartment)
{
  const departments = this.getDepartments();
  const index = departments.findIndex(d => d.id === departmentId);
  if (index !== -1) {
    departments[index] = { ...departments[index], ...updatedDepartment };
    return this.setItem('departments', departments);
  }
  return false;
}

updateSector(sectorId, updatedSector)
{
  const sectors = this.getSectors();
  const index = sectors.findIndex(s => s.id === sectorId);
  if (index !== -1) {
    sectors[index] = { ...sectors[index], ...updatedSector };
    return this.setItem('sectors', sectors);
  }
  return false;
}

// Criar uma instância única do serviço de banco de dados
export const dbService = new DbService();
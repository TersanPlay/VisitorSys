// Script para criar os 17 departamentos - versão para console do navegador

// Lista de departamentos a serem criados
const departments = [
  {
    name: 'Departamento de Recursos Humanos',
    code: 'RH',
    description: 'Responsável pela gestão de pessoal, folha de pagamento, benefícios, férias e processos administrativos dos servidores.',
    location: '1º Andar – Bloco Administrativo',
    responsibleName: 'Maria Helena Costa',
    responsibleEmail: 'maria.helena@camara.gov.br',
    phone: '(94) 3356-1001',
    cellphone: '(94) 98123-0001',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento Legislativo',
    code: 'DL',
    description: 'Coordena os trabalhos legislativos, organização de sessões, tramitação de proposições e apoio aos vereadores.',
    location: 'Plenário – Ala Central',
    responsibleName: 'Pedro Luiz Andrade',
    responsibleEmail: 'pedro.andrade@camara.gov.br',
    phone: '(94) 3356-1002',
    cellphone: '(94) 98123-0002',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Contabilidade',
    code: 'CONTAB',
    description: 'Responsável pela escrituração contábil, elaboração de balancetes e prestação de contas da Câmara Municipal.',
    location: '2º Andar – Bloco Financeiro',
    responsibleName: 'Juliana Ribeiro Nunes',
    responsibleEmail: 'juliana.nunes@camara.gov.br',
    phone: '(94) 3356-1003',
    cellphone: '(94) 98123-0003',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento Financeiro',
    code: 'FIN',
    description: 'Atua no planejamento financeiro, controle orçamentário e execução de pagamentos da instituição.',
    location: '2º Andar – Bloco Financeiro',
    responsibleName: 'Cláudio Mesquita',
    responsibleEmail: 'claudio.mesquita@camara.gov.br',
    phone: '(94) 3356-1004',
    cellphone: '(94) 98123-0004',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento Jurídico',
    code: 'DJ',
    description: 'Emite pareceres jurídicos, analisa projetos de lei e presta assessoria legal à Câmara.',
    location: 'Térreo – Ala Jurídica',
    responsibleName: 'Fernanda Lopes Barreto',
    responsibleEmail: 'fernanda.lopes@camara.gov.br',
    phone: '(94) 3356-1005',
    cellphone: '(94) 98123-0005',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Licitações e Compras',
    code: 'DLC',
    description: 'Realiza processos licitatórios e gerencia aquisições de bens e serviços.',
    location: '2º Andar – Bloco Administrativo',
    responsibleName: 'Antônio Sérgio Lima',
    responsibleEmail: 'antonio.lima@camara.gov.br',
    phone: '(94) 3356-1006',
    cellphone: '(94) 98123-0006',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Tecnologia da Informação',
    code: 'TI',
    description: 'Suporte técnico, manutenção de sistemas e infraestrutura de rede da Câmara.',
    location: 'Subsolo – Sala de Servidores',
    responsibleName: 'Rafael Moura Rocha',
    responsibleEmail: 'rafael.moura@camara.gov.br',
    phone: '(94) 3356-1007',
    cellphone: '(94) 98123-0007',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Comunicação',
    code: 'COM',
    description: 'Produz conteúdos institucionais, gerencia redes sociais e assessora imprensa.',
    location: 'Térreo – Sala de Imprensa',
    responsibleName: 'Renata Silva Mourão',
    responsibleEmail: 'renata.mourao@camara.gov.br',
    phone: '(94) 3356-1008',
    cellphone: '(94) 98123-0008',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Patrimônio',
    code: 'DPAT',
    description: 'Gerencia o patrimônio público, inventário e controle de bens móveis.',
    location: '1º Andar – Sala 102',
    responsibleName: 'Hélio Santos',
    responsibleEmail: 'helio.santos@camara.gov.br',
    phone: '(94) 3356-1009',
    cellphone: '(94) 98123-0009',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Protocolo',
    code: 'DPROT',
    description: 'Recebe, registra e encaminha documentos e correspondências.',
    location: 'Térreo – Balcão de Atendimento',
    responsibleName: 'Ana Beatriz Ferreira',
    responsibleEmail: 'ana.ferreira@camara.gov.br',
    phone: '(94) 3356-1010',
    cellphone: '(94) 98123-0010',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Almoxarifado',
    code: 'ALM',
    description: 'Controla o estoque e distribuição de materiais e suprimentos.',
    location: 'Subsolo – Galpão A',
    responsibleName: 'Carlos Mendes',
    responsibleEmail: 'carlos.mendes@camara.gov.br',
    phone: '(94) 3356-1011',
    cellphone: '(94) 98123-0011',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Biblioteca',
    code: 'BIB',
    description: 'Organiza o acervo bibliográfico, auxilia pesquisas legislativas e públicas.',
    location: '3º Andar – Sala de Leitura',
    responsibleName: 'Eliane Torres',
    responsibleEmail: 'eliane.torres@camara.gov.br',
    phone: '(94) 3356-1012',
    cellphone: '(94) 98123-0012',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Arquivo',
    code: 'ARQ',
    description: 'Responsável pela guarda, digitalização e preservação de documentos.',
    location: '3º Andar – Ala Documental',
    responsibleName: 'Bruno Alves Lima',
    responsibleEmail: 'bruno.lima@camara.gov.br',
    phone: '(94) 3356-1013',
    cellphone: '(94) 98123-0013',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Segurança Institucional',
    code: 'SEG',
    description: 'Realiza controle de acesso, segurança patrimonial e apoio às sessões.',
    location: 'Portaria Principal',
    responsibleName: 'Marcos F. Duarte',
    responsibleEmail: 'marcos.duarte@camara.gov.br',
    phone: '(94) 3356-1014',
    cellphone: '(94) 98123-0014',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Controle Interno',
    code: 'DCI',
    description: 'Avalia a conformidade legal e financeira dos atos administrativos da Casa.',
    location: '2º Andar – Sala 205',
    responsibleName: 'Lígia Marques',
    responsibleEmail: 'ligia.marques@camara.gov.br',
    phone: '(94) 3356-1015',
    cellphone: '(94) 98123-0015',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Ouvidoria',
    code: 'OUV',
    description: 'Recebe, analisa e encaminha sugestões, reclamações e denúncias dos cidadãos.',
    location: 'Térreo – Sala de Atendimento ao Cidadão',
    responsibleName: 'Mariana Oliveira Santos',
    responsibleEmail: 'mariana.santos@camara.gov.br',
    phone: '(94) 3356-1016',
    cellphone: '(94) 98123-0016',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  },
  {
    name: 'Departamento de Cerimonial',
    code: 'CER',
    description: 'Organiza eventos oficiais, solenidades e recepção de autoridades.',
    location: '1º Andar – Sala de Eventos',
    responsibleName: 'Patrícia Mendes Albuquerque',
    responsibleEmail: 'patricia.mendes@camara.gov.br',
    phone: '(94) 3356-1017',
    cellphone: '(94) 98123-0017',
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      startTime: '08:00',
      endTime: '17:00'
    },
    status: 'active'
  }
];

// Função para criar departamentos sequencialmente
async function createDepartmentsSequentially() {
  const departmentService = new DepartmentService();

  console.log(`Iniciando a criação de ${departments.length} departamentos...`);

  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    try {
      console.log(`Criando departamento ${i + 1}/${departments.length}: ${dept.name}`);
      await departmentService.createDepartment(dept);
      console.log(`✅ Departamento ${dept.name} criado com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao criar departamento ${dept.name}:`, error);
    }
  }

  console.log('Processo de criação de departamentos concluído!');
}

// Para executar este script, cole-o no console do navegador e execute:
// createDepartmentsSequentially();
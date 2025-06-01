// Utility to add mock data to localStorage for testing

export const addMockDataToLocalStorage = () => {
  // Mock visitors data
  const visitors = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '(11) 98765-4321',
      company: 'Empresa ABC',
      document: '123.456.789-00',
      photo: null,
      createdAt: new Date('2023-05-10T10:00:00').toISOString(),
      updatedAt: new Date('2023-05-10T10:00:00').toISOString()
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      phone: '(11) 91234-5678',
      company: 'Empresa XYZ',
      document: '987.654.321-00',
      photo: null,
      createdAt: new Date('2023-05-11T09:30:00').toISOString(),
      updatedAt: new Date('2023-05-11T09:30:00').toISOString()
    },
    {
      id: '3',
      name: 'Carlos Santos',
      email: 'carlos.santos@example.com',
      phone: '(11) 92345-6789',
      company: 'Empresa ABC',
      document: '456.789.123-00',
      photo: null,
      createdAt: new Date('2023-05-12T14:15:00').toISOString(),
      updatedAt: new Date('2023-05-12T14:15:00').toISOString()
    }
  ];

  // Mock visits data
  const visits = [
    {
      id: '1',
      visitorId: '1',
      purpose: 'Reunião com Departamento de Marketing',
      hostName: 'Ana Pereira',
      startTime: new Date('2023-05-10T10:30:00').toISOString(),
      endTime: new Date('2023-05-10T11:45:00').toISOString(),
      status: 'completed',
      notes: 'Reunião sobre nova campanha',
      createdAt: new Date('2023-05-10T10:00:00').toISOString(),
      updatedAt: new Date('2023-05-10T11:45:00').toISOString()
    },
    {
      id: '2',
      visitorId: '2',
      purpose: 'Entrevista de Emprego',
      hostName: 'Roberto Almeida',
      startTime: new Date('2023-05-11T10:00:00').toISOString(),
      endTime: new Date('2023-05-11T11:30:00').toISOString(),
      status: 'completed',
      notes: 'Candidato para vaga de desenvolvedor',
      createdAt: new Date('2023-05-11T09:30:00').toISOString(),
      updatedAt: new Date('2023-05-11T11:30:00').toISOString()
    },
    {
      id: '3',
      visitorId: '3',
      purpose: 'Manutenção de Equipamentos',
      hostName: 'Fernanda Costa',
      startTime: new Date('2023-05-12T14:30:00').toISOString(),
      endTime: null,
      status: 'active',
      notes: 'Manutenção programada dos servidores',
      createdAt: new Date('2023-05-12T14:15:00').toISOString(),
      updatedAt: new Date('2023-05-12T14:30:00').toISOString()
    },
    {
      id: '4',
      visitorId: '1',
      purpose: 'Reunião de Acompanhamento',
      hostName: 'Ana Pereira',
      startTime: new Date('2023-05-15T09:00:00').toISOString(),
      endTime: new Date('2023-05-15T10:15:00').toISOString(),
      status: 'completed',
      notes: 'Acompanhamento da campanha de marketing',
      createdAt: new Date('2023-05-15T08:45:00').toISOString(),
      updatedAt: new Date('2023-05-15T10:15:00').toISOString()
    }
  ];

  // Save to localStorage
  localStorage.setItem('visitors', JSON.stringify(visitors));
  localStorage.setItem('visits', JSON.stringify(visits));

  console.log('Mock data added to localStorage');
  return { visitors, visits };
};

// Function to check if data exists in localStorage
export const checkLocalStorageData = () => {
  const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
  const visits = JSON.parse(localStorage.getItem('visits') || '[]');

  console.log(`Found ${visitors.length} visitors and ${visits.length} visits in localStorage`);
  return { visitors, visits };
};
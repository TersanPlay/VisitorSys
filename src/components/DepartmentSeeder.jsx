import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { toast } from 'react-hot-toast';
import { Button } from './UI/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './UI/card';
import { Badge } from './UI/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const DepartmentSeeder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departmentStatus, setDepartmentStatus] = useState([]);
  const [existingDepartments, setExistingDepartments] = useState([]);

  // Lista de departamentos a serem criados
  const departments = [
    {
      name: 'Departamento de Recursos Humanos',
      code: 'RH',
      description: 'Responsável pela gestão de pessoal, folha de pagamento, benefícios, férias e processos administrativos dos servidores.',
      location: '1º Andar – Bloco Administrativo',
      responsibleName: 'Maria Helena Costa',
      responsiblePosition: 'Diretora de RH',
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
      responsiblePosition: 'Diretor Legislativo',
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
      responsiblePosition: 'Contadora Chefe',
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
      responsiblePosition: 'Diretor Financeiro',
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
      responsiblePosition: 'Procuradora Jurídica',
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
      responsiblePosition: 'Diretor de Licitações',
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
      responsiblePosition: 'Diretor de TI',
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
      responsiblePosition: 'Diretora de Comunicação',
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
      responsiblePosition: 'Diretor de Patrimônio',
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
      responsiblePosition: 'Diretora de Protocolo',
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
      responsiblePosition: 'Diretor de Almoxarifado',
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
      responsiblePosition: 'Bibliotecária Chefe',
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
      responsiblePosition: 'Arquivista Chefe',
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
      responsiblePosition: 'Diretor de Segurança',
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
      responsiblePosition: 'Controladora Interna',
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
      responsiblePosition: 'Ouvidora',
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
      responsiblePosition: 'Diretora de Cerimonial',
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

  // Carregar departamentos existentes ao montar o componente
  useEffect(() => {
    const loadExistingDepartments = async () => {
      try {
        const allDepartments = await departmentService.getAllDepartments();
        setExistingDepartments(allDepartments);

        // Inicializar o status de cada departamento
        const initialStatus = departments.map(dept => {
          const exists = allDepartments.some(existingDept => existingDept.code === dept.code);
          return {
            name: dept.name,
            code: dept.code,
            status: exists ? 'exists' : 'pending',
            message: exists ? 'Já existe no sistema' : 'Pendente'
          };
        });

        setDepartmentStatus(initialStatus);
      } catch (error) {
        toast.error('Erro ao carregar departamentos existentes');
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    loadExistingDepartments();
  }, []);

  // Função para criar todos os departamentos (otimizada)
  const createAllDepartments = async () => {
    if (isLoading) return;

    setIsLoading(true);
    toast.loading('Iniciando criação de departamentos...');

    try {
      // Usar o método de criação em lote
      const result = await departmentService.batchCreateDepartments(departments);

      // Atualizar o status de todos os departamentos de uma vez
      const updatedStatus = departments.map((dept, index) => {
        const resultItem = result.results.find(r => r.code === dept.code);
        return {
          name: dept.name,
          code: dept.code,
          status: resultItem ? resultItem.status : 'pending',
          message: resultItem ? resultItem.message : 'Pendente'
        };
      });

      setDepartmentStatus(updatedStatus);

      // Atualizar a lista de departamentos existentes
      const allDepartments = await departmentService.getAllDepartments();
      setExistingDepartments(allDepartments);

      // Calcular estatísticas
      const successCount = result.results.filter(r => r.status === 'success').length;
      const errorCount = result.results.filter(r => r.status === 'error').length;
      const skippedCount = result.results.filter(r => r.status === 'exists').length;

      toast.dismiss();
      toast.success(`Processo concluído: ${successCount} criados, ${skippedCount} já existiam, ${errorCount} erros`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Erro ao criar departamentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar um departamento específico (otimizada)
  const handleCreateSingle = async (index) => {
    if (isLoading) return;

    const department = departments[index];
    const deptName = department.name;

    setIsLoading(true);
    toast.loading(`Criando departamento: ${deptName}`);

    try {
      // Usar o método de criação em lote com um único departamento
      const result = await departmentService.batchCreateDepartments([department]);
      const resultItem = result.results[0];

      // Atualizar apenas o status deste departamento
      const updatedStatus = [...departmentStatus];
      updatedStatus[index] = {
        name: department.name,
        code: department.code,
        status: resultItem.status,
        message: resultItem.message
      };
      setDepartmentStatus(updatedStatus);

      // Atualizar a lista de departamentos existentes
      const allDepartments = await departmentService.getAllDepartments();
      setExistingDepartments(allDepartments);

      toast.dismiss();
      toast.success(`Processo para ${deptName} concluído: ${resultItem.message}`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Erro ao criar departamento ${deptName}: ${error.message}`);

      // Atualizar status para erro
      const updatedStatus = [...departmentStatus];
      updatedStatus[index] = {
        name: department.name,
        code: department.code,
        status: 'error',
        message: `Erro: ${error.message || 'Desconhecido'}`
      };
      setDepartmentStatus(updatedStatus);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar o status com ícone apropriado
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Criado</Badge>;
      case 'error':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Erro</Badge>;
      case 'exists':
        return <Badge className="bg-blue-500"><AlertCircle className="h-3 w-3 mr-1" /> Existente</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processando</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendente</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Criação de Departamentos</CardTitle>
        <CardDescription>
          Esta ferramenta permite criar os 17 departamentos padrão no sistema.
          Departamentos já existentes serão ignorados.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Button
              onClick={createAllDepartments}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Todos os Departamentos
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Total: {departments.length} |
            Existentes: {departmentStatus.filter(d => d.status === 'exists').length} |
            Criados: {departmentStatus.filter(d => d.status === 'success').length} |
            Erros: {departmentStatus.filter(d => d.status === 'error').length}
          </div>
        </div>

        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {departmentStatus.map((dept, index) => (
                <tr key={dept.code} className="border-t">
                  <td className="px-4 py-2">{dept.code}</td>
                  <td className="px-4 py-2">{dept.name}</td>
                  <td className="px-4 py-2">
                    {renderStatusBadge(dept.status)}
                    {dept.status === 'error' && (
                      <div className="text-xs text-red-500 mt-1">{dept.message}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateSingle(index)}
                      disabled={isLoading || dept.status === 'success' || dept.status === 'exists' || dept.status === 'processing'}
                    >
                      Criar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Os departamentos são armazenados no localStorage do navegador.
        </div>
      </CardFooter>
    </Card>
  );
};

export default DepartmentSeeder;
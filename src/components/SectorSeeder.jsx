import React, { useState, useEffect } from 'react';
import { sectorService } from '../services/sectorService';
import { toast } from 'react-hot-toast';
import { Button } from './UI/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './UI/card';
import { Badge } from './UI/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const SectorSeeder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [sectorStatus, setSectorStatus] = useState([]);
    const [existingSectors, setExistingSectors] = useState([]);

    // Lista de setores (vereadores) a serem criados
    const sectors = [
        {
            name: 'Michel Carteiro',
            description: 'Vereador do partido PV',
            location: 'Câmara Municipal',
            responsibleName: 'Michel Carteiro',
            responsibleEmail: 'michel.carteiro@camara.gov.br',
            phone: '(94) 3356-2001',
            cellphone: '(94) 98123-2001',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Léo Márcio',
            description: 'Vereador do partido Solidariedade',
            location: 'Câmara Municipal',
            responsibleName: 'Léo Márcio',
            responsibleEmail: 'leo.marcio@camara.gov.br',
            phone: '(94) 3356-2002',
            cellphone: '(94) 98123-2002',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Laecio da ACT',
            description: 'Vereador do partido PDT',
            location: 'Câmara Municipal',
            responsibleName: 'Laecio da ACT',
            responsibleEmail: 'laecio.act@camara.gov.br',
            phone: '(94) 3356-2003',
            cellphone: '(94) 98123-2003',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Maquivalda',
            description: 'Vereadora do partido PDT',
            location: 'Câmara Municipal',
            responsibleName: 'Maquivalda',
            responsibleEmail: 'maquivalda@camara.gov.br',
            phone: '(94) 3356-2004',
            cellphone: '(94) 98123-2004',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Anderson Moratorio',
            description: 'Vereador do partido PRD',
            location: 'Câmara Municipal',
            responsibleName: 'Anderson Moratorio',
            responsibleEmail: 'anderson.moratorio@camara.gov.br',
            phone: '(94) 3356-2005',
            cellphone: '(94) 98123-2005',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Graciele Brito',
            description: 'Vereadora do partido União Brasil',
            location: 'Câmara Municipal',
            responsibleName: 'Graciele Brito',
            responsibleEmail: 'graciele.brito@camara.gov.br',
            phone: '(94) 3356-2006',
            cellphone: '(94) 98123-2006',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Leandro Chiquito',
            description: 'Vereador do partido Solidariedade',
            location: 'Câmara Municipal',
            responsibleName: 'Leandro Chiquito',
            responsibleEmail: 'leandro.chiquito@camara.gov.br',
            phone: '(94) 3356-2007',
            cellphone: '(94) 98123-2007',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Érica Ribeiro',
            description: 'Vereadora do partido PSDB',
            location: 'Câmara Municipal',
            responsibleName: 'Érica Ribeiro',
            responsibleEmail: 'erica.ribeiro@camara.gov.br',
            phone: '(94) 3356-2008',
            cellphone: '(94) 98123-2008',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Francisco Eloecio',
            description: 'Vereador do partido PSDB',
            location: 'Câmara Municipal',
            responsibleName: 'Francisco Eloecio',
            responsibleEmail: 'francisco.eloecio@camara.gov.br',
            phone: '(94) 3356-2009',
            cellphone: '(94) 98123-2009',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Sargento Nogueira',
            description: 'Vereador do partido Avante',
            location: 'Câmara Municipal',
            responsibleName: 'Sargento Nogueira',
            responsibleEmail: 'sargento.nogueira@camara.gov.br',
            phone: '(94) 3356-2010',
            cellphone: '(94) 98123-2010',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Zé do Bode',
            description: 'Vereador do partido União Brasil',
            location: 'Câmara Municipal',
            responsibleName: 'Zé do Bode',
            responsibleEmail: 'ze.bode@camara.gov.br',
            phone: '(94) 3356-2011',
            cellphone: '(94) 98123-2011',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Tito do MST',
            description: 'Vereador do partido PT',
            location: 'Câmara Municipal',
            responsibleName: 'Tito do MST',
            responsibleEmail: 'tito.mst@camara.gov.br',
            phone: '(94) 3356-2012',
            cellphone: '(94) 98123-2012',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Elias da Construforte',
            description: 'Vereador do partido PV',
            location: 'Câmara Municipal',
            responsibleName: 'Elias da Construforte',
            responsibleEmail: 'elias.construforte@camara.gov.br',
            phone: '(94) 3356-2013',
            cellphone: '(94) 98123-2013',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Alex Ohana',
            description: 'Vereador do partido PDT',
            location: 'Câmara Municipal',
            responsibleName: 'Alex Ohana',
            responsibleEmail: 'alex.ohana@camara.gov.br',
            phone: '(94) 3356-2014',
            cellphone: '(94) 98123-2014',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Zé da Lata',
            description: 'Vereador do partido Avante',
            location: 'Câmara Municipal',
            responsibleName: 'Zé da Lata',
            responsibleEmail: 'ze.lata@camara.gov.br',
            phone: '(94) 3356-2015',
            cellphone: '(94) 98123-2015',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Sadisvan',
            description: 'Vereador do partido PRD',
            location: 'Câmara Municipal',
            responsibleName: 'Sadisvan',
            responsibleEmail: 'sadisvan@camara.gov.br',
            phone: '(94) 3356-2016',
            cellphone: '(94) 98123-2016',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        },
        {
            name: 'Fred Sanção',
            description: 'Vereador do partido PL',
            location: 'Câmara Municipal',
            responsibleName: 'Fred Sanção',
            responsibleEmail: 'fred.sancao@camara.gov.br',
            phone: '(94) 3356-2017',
            cellphone: '(94) 98123-2017',
            workingHours: {
                days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
                startTime: '08:00',
                endTime: '17:00'
            },
            status: 'active'
        }
    ];

    // Carregar setores existentes ao montar o componente
    useEffect(() => {
        const loadExistingSectors = async () => {
            try {
                const allSectors = await sectorService.getAllSectors();
                setExistingSectors(allSectors);

                // Inicializar o status de cada setor
                const initialStatus = sectors.map(sector => {
                    const exists = allSectors.some(existingSector => existingSector.name === sector.name);
                    return {
                        name: sector.name,
                        status: exists ? 'exists' : 'pending',
                        message: exists ? 'Já existe no sistema' : 'Pendente'
                    };
                });

                setSectorStatus(initialStatus);
            } catch (error) {
                toast.error('Erro ao carregar setores existentes');
                console.error('Erro ao carregar setores:', error);
            }
        };

        loadExistingSectors();
    }, []);

    // Função para criar todos os setores
    const createAllSectors = async () => {
        if (isLoading) return;

        setIsLoading(true);
        toast.loading('Iniciando criação de setores...');

        try {
            // Criar setores um por um
            const results = [];

            for (let i = 0; i < sectors.length; i++) {
                const sector = sectors[i];

                // Verificar se o setor já existe
                const exists = existingSectors.some(existingSector => existingSector.name === sector.name);

                if (exists) {
                    results.push({
                        name: sector.name,
                        status: 'exists',
                        message: 'Já existe no sistema'
                    });
                    continue;
                }

                // Atualizar status para processando
                const updatedStatus = [...sectorStatus];
                updatedStatus[i] = {
                    name: sector.name,
                    status: 'processing',
                    message: 'Processando...'
                };
                setSectorStatus(updatedStatus);

                try {
                    // Criar setor
                    await sectorService.createSector(sector);

                    results.push({
                        name: sector.name,
                        status: 'success',
                        message: 'Criado com sucesso'
                    });
                } catch (error) {
                    results.push({
                        name: sector.name,
                        status: 'error',
                        message: `Erro: ${error.message || 'Desconhecido'}`
                    });
                }
            }

            // Atualizar o status de todos os setores
            const updatedStatus = sectors.map((sector, index) => {
                const resultItem = results.find(r => r.name === sector.name);
                return resultItem || {
                    name: sector.name,
                    status: 'pending',
                    message: 'Pendente'
                };
            });

            setSectorStatus(updatedStatus);

            // Atualizar a lista de setores existentes
            const allSectors = await sectorService.getAllSectors();
            setExistingSectors(allSectors);

            // Calcular estatísticas
            const successCount = results.filter(r => r.status === 'success').length;
            const errorCount = results.filter(r => r.status === 'error').length;
            const skippedCount = results.filter(r => r.status === 'exists').length;

            toast.dismiss();
            toast.success(`Processo concluído: ${successCount} criados, ${skippedCount} já existiam, ${errorCount} erros`);
        } catch (error) {
            toast.dismiss();
            toast.error(`Erro ao criar setores: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para criar um setor específico
    const handleCreateSingle = async (index) => {
        if (isLoading) return;

        const sector = sectors[index];
        const sectorName = sector.name;

        setIsLoading(true);
        toast.loading(`Criando setor: ${sectorName}`);

        try {
            // Verificar se o setor já existe
            const exists = existingSectors.some(existingSector => existingSector.name === sector.name);

            if (exists) {
                // Atualizar apenas o status deste setor
                const updatedStatus = [...sectorStatus];
                updatedStatus[index] = {
                    name: sector.name,
                    status: 'exists',
                    message: 'Já existe no sistema'
                };
                setSectorStatus(updatedStatus);

                toast.dismiss();
                toast.info(`Setor ${sectorName} já existe no sistema`);
                setIsLoading(false);
                return;
            }

            // Atualizar status para processando
            const processingStatus = [...sectorStatus];
            processingStatus[index] = {
                name: sector.name,
                status: 'processing',
                message: 'Processando...'
            };
            setSectorStatus(processingStatus);

            // Criar setor
            await sectorService.createSector(sector);

            // Atualizar status para sucesso
            const updatedStatus = [...sectorStatus];
            updatedStatus[index] = {
                name: sector.name,
                status: 'success',
                message: 'Criado com sucesso'
            };
            setSectorStatus(updatedStatus);

            // Atualizar a lista de setores existentes
            const allSectors = await sectorService.getAllSectors();
            setExistingSectors(allSectors);

            toast.dismiss();
            toast.success(`Setor ${sectorName} criado com sucesso`);
        } catch (error) {
            toast.dismiss();
            toast.error(`Erro ao criar setor ${sectorName}: ${error.message}`);

            // Atualizar status para erro
            const updatedStatus = [...sectorStatus];
            updatedStatus[index] = {
                name: sector.name,
                status: 'error',
                message: `Erro: ${error.message || 'Desconhecido'}`
            };
            setSectorStatus(updatedStatus);
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
                <CardTitle>Criação de Setores (Vereadores)</CardTitle>
                <CardDescription>
                    Esta ferramenta permite criar os setores de vereadores no sistema.
                    Setores já existentes serão ignorados.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <Button
                            onClick={createAllSectors}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Todos os Setores
                        </Button>
                    </div>

                    <div className="text-sm text-gray-500">
                        Total: {sectors.length} |
                        Existentes: {sectorStatus.filter(d => d.status === 'exists').length} |
                        Criados: {sectorStatus.filter(d => d.status === 'success').length} |
                        Erros: {sectorStatus.filter(d => d.status === 'error').length}
                    </div>
                </div>

                <div className="border rounded-md">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Nome</th>
                                <th className="px-4 py-2 text-left">Partido</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectors.map((sector, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{sector.name}</td>
                                    <td className="px-4 py-2">{sector.description.replace('Vereador do partido ', '').replace('Vereadora do partido ', '')}</td>
                                    <td className="px-4 py-2">
                                        {renderStatusBadge(sectorStatus[index]?.status || 'pending')}
                                        {sectorStatus[index]?.status === 'error' && (
                                            <div className="text-xs text-red-500 mt-1">{sectorStatus[index]?.message}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCreateSingle(index)}
                                            disabled={isLoading || sectorStatus[index]?.status === 'success' || sectorStatus[index]?.status === 'exists' || sectorStatus[index]?.status === 'processing'}
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
                    Os setores são armazenados no localStorage do navegador.
                </div>
            </CardFooter>
        </Card>
    );
};

export default SectorSeeder;
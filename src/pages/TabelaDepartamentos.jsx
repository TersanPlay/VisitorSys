import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { departmentService } from '../services/departmentService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/UI/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/UI/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/UI/tabs'
import { Button } from '../components/UI/button'
import { Input } from '../components/UI/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/UI/select'
import { Badge } from '../components/UI/badge'
import { Search, FileText, Download, Calendar, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const TabelaDepartamentos = () => {
  const { id } = useParams()
  const [department, setDepartment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [servidores, setServidores] = useState([])
  const [filteredServidores, setFilteredServidores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [availableMonths, setAvailableMonths] = useState([])
  const [compareMode, setCompareMode] = useState(false)
  const [compareMonth, setCompareMonth] = useState('')
  const [comparisonResults, setComparisonResults] = useState({
    novos: [],
    desligados: [],
    alterados: []
  })

  // Carregar dados do departamento
  useEffect(() => {
    const loadDepartment = async () => {
      try {
        setLoading(true)
        const departmentData = await departmentService.getDepartmentById(id)
        setDepartment(departmentData)

        // Simular carregamento de meses disponíveis
        // Em produção, isso viria de uma API que verificaria as pastas existentes
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1

        const months = [
          { value: '01', label: 'Janeiro' },
          { value: '02', label: 'Fevereiro' },
          { value: '03', label: 'Março' },
          { value: '04', label: 'Abril' },
          { value: '05', label: 'Maio' },
          { value: '06', label: 'Junho' },
          { value: '07', label: 'Julho' },
          { value: '08', label: 'Agosto' },
          { value: '09', label: 'Setembro' },
          { value: '10', label: 'Outubro' },
          { value: '11', label: 'Novembro' },
          { value: '12', label: 'Dezembro' }
        ].filter(month => parseInt(month.value) <= currentMonth)

        setAvailableMonths(months)
        setSelectedMonth(String(currentMonth).padStart(2, '0'))

        // Carregar dados simulados de servidores
        loadServidores(String(currentMonth).padStart(2, '0'))
      } catch (error) {
        console.error('Erro ao carregar dados do departamento:', error)
        toast.error('Não foi possível carregar os dados do departamento')
      } finally {
        setLoading(false)
      }
    }

    loadDepartment()
  }, [id])

  // Filtrar servidores quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServidores(servidores)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = servidores.filter(servidor =>
      servidor.nome.toLowerCase().includes(term) ||
      servidor.matricula.toLowerCase().includes(term) ||
      servidor.cpf.toLowerCase().includes(term) ||
      servidor.cargo.toLowerCase().includes(term)
    )

    setFilteredServidores(filtered)
  }, [searchTerm, servidores])

  // Carregar servidores para o mês selecionado
  const loadServidores = (month) => {
    // Simulação de dados - em produção, isso viria de uma API
    const mockServidores = [
      {
        id: '1',
        matricula: '12345',
        cpf: '123.456.789-00',
        nome: 'João Silva',
        cargo: 'Analista Administrativo / 40h',
        lotacao: 'Departamento de Administração',
        vinculo: 'Efetivo',
        dataAdmissao: '15/01/2020',
        dataDesligamento: null
      },
      {
        id: '2',
        matricula: '23456',
        cpf: '234.567.890-11',
        nome: 'Maria Oliveira',
        cargo: 'Assessor Técnico / 30h',
        lotacao: 'Departamento Jurídico',
        vinculo: 'Comissionado',
        dataAdmissao: '03/03/2021',
        dataDesligamento: null
      },
      {
        id: '3',
        matricula: '34567',
        cpf: '345.678.901-22',
        nome: 'Pedro Santos',
        cargo: 'Assistente Administrativo / 40h',
        lotacao: 'Departamento de Protocolo',
        vinculo: 'Efetivo',
        dataAdmissao: '10/06/2019',
        dataDesligamento: null
      }
    ]

    setServidores(mockServidores)
    setFilteredServidores(mockServidores)
  }

  // Comparar servidores entre meses
  const compararMeses = () => {
    if (!compareMonth || compareMonth === selectedMonth) {
      toast.error('Selecione um mês diferente para comparação')
      return
    }

    // Simulação de dados para comparação - em produção, isso viria de uma API
    const mesAnteriorServidores = [
      {
        id: '1',
        matricula: '12345',
        cpf: '123.456.789-00',
        nome: 'João Silva',
        cargo: 'Analista Administrativo / 30h', // Alteração na carga horária
        lotacao: 'Departamento de Administração',
        vinculo: 'Efetivo',
        dataAdmissao: '15/01/2020',
        dataDesligamento: null
      },
      {
        id: '4',
        matricula: '45678',
        cpf: '456.789.012-33',
        nome: 'Ana Souza',
        cargo: 'Recepcionista / 40h',
        lotacao: 'Departamento de Recepção',
        vinculo: 'Contratado',
        dataAdmissao: '05/02/2022',
        dataDesligamento: '28/02/2023'
      }
    ]

    // Identificar novos servidores (presentes no mês atual, ausentes no mês anterior)
    const novos = servidores.filter(atual =>
      !mesAnteriorServidores.some(anterior => anterior.id === atual.id)
    )

    // Identificar servidores desligados (ausentes no mês atual, presentes no mês anterior)
    const desligados = mesAnteriorServidores.filter(anterior =>
      !servidores.some(atual => atual.id === anterior.id)
    )

    // Identificar servidores com alterações (presentes em ambos, mas com diferenças)
    const alterados = servidores.filter(atual => {
      const anterior = mesAnteriorServidores.find(s => s.id === atual.id)
      if (!anterior) return false

      return (
        atual.cargo !== anterior.cargo ||
        atual.lotacao !== anterior.lotacao ||
        atual.vinculo !== anterior.vinculo
      )
    })

    setComparisonResults({ novos, desligados, alterados })
    setCompareMode(true)
  }

  // Exportar para Excel
  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredServidores.map(s => ({
      'Mês/Ano': `${selectedMonth}/${new Date().getFullYear()}`,
      'Matrícula': s.matricula,
      'CPF': s.cpf,
      'Nome': s.nome,
      'Cargo/Função/Carga Horária': s.cargo,
      'Lotação': s.lotacao,
      'Vínculo': s.vinculo,
      'Data de Admissão': s.dataAdmissao,
      'Data de Desligamento': s.dataDesligamento || 'N/A'
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Servidores')

    const fileName = `servidores_${department?.name.replace(/\s+/g, '_').toLowerCase()}_${selectedMonth}-${new Date().getFullYear()}.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast.success('Arquivo Excel exportado com sucesso')
  }

  // Exportar para PDF
  const exportarPDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Servidores - ${department?.name}`, 14, 22)

    doc.setFontSize(12)
    doc.text(`Mês/Ano: ${selectedMonth}/${new Date().getFullYear()}`, 14, 30)

    // Tabela
    const tableColumn = ['Matrícula', 'CPF', 'Nome', 'Cargo', 'Lotação', 'Vínculo', 'Admissão']
    const tableRows = filteredServidores.map(s => [
      s.matricula,
      s.cpf,
      s.nome,
      s.cargo,
      s.lotacao,
      s.vinculo,
      s.dataAdmissao
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    })

    const fileName = `servidores_${department?.name.replace(/\s+/g, '_').toLowerCase()}_${selectedMonth}-${new Date().getFullYear()}.pdf`
    doc.save(fileName)

    toast.success('Arquivo PDF exportado com sucesso')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Card de Boas-Vindas / Transparência */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo à consulta pública de servidores</h2>
              <p className="opacity-90">
                Em cumprimento aos princípios da <strong>transparência</strong> e da <strong>publicidade dos atos administrativos</strong>,
                esta seção permite o acesso facilitado aos dados de pessoal do departamento selecionado, conforme registros oficiais.
              </p>
              <p className="mt-2 opacity-90">
                Os dados são atualizados mensalmente e refletem a composição atual de servidores ativos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium text-lg">{department?.name}</div>
            <div className="text-sm text-muted-foreground">{department?.description}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={(value) => {
              setSelectedMonth(value)
              loadServidores(value)
              setCompareMode(false)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label} / {new Date().getFullYear()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Comparação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={compareMonth} onValueChange={setCompareMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione mês para comparar" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths
                  .filter(month => month.value !== selectedMonth)
                  .map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label} / {new Date().getFullYear()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={compararMeses}
              disabled={!compareMonth || compareMonth === selectedMonth}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Comparar Meses
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa e botões de exportação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar por nome, CPF, cargo ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={exportarExcel}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={exportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <Tabs defaultValue={compareMode ? "comparativo" : "tabela"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tabela" onClick={() => setCompareMode(false)}>Tabela de Servidores</TabsTrigger>
          <TabsTrigger value="comparativo" disabled={!compareMode}>Comparativo entre Meses</TabsTrigger>
        </TabsList>

        {/* Aba de Tabela */}
        <TabsContent value="tabela" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servidores - {department?.name}</CardTitle>
              <CardDescription>
                Mês de referência: {availableMonths.find(m => m.value === selectedMonth)?.label} / {new Date().getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredServidores.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês/Ano</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo/Função/Carga Horária</TableHead>
                        <TableHead>Lotação</TableHead>
                        <TableHead>Vínculo</TableHead>
                        <TableHead>Data de Admissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServidores.map((servidor) => (
                        <TableRow key={servidor.id}>
                          <TableCell>{selectedMonth}/{new Date().getFullYear()}</TableCell>
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell>{servidor.cpf}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.vinculo}</TableCell>
                          <TableCell>{servidor.dataAdmissao}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum servidor encontrado para os critérios selecionados.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Comparativo */}
        <TabsContent value="comparativo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Servidores</CardTitle>
              <CardDescription>
                Comparando {availableMonths.find(m => m.value === selectedMonth)?.label} com {availableMonths.find(m => m.value === compareMonth)?.label} de {new Date().getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Novos Servidores */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Badge variant="success" className="mr-2">Novos</Badge>
                  Servidores Adicionados
                </h3>
                {comparisonResults.novos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Lotação</TableHead>
                        <TableHead>Data de Admissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResults.novos.map((servidor) => (
                        <TableRow key={servidor.id} className="bg-green-50">
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.dataAdmissao}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">Nenhum novo servidor no período.</div>
                )}
              </div>

              {/* Servidores Desligados */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Badge variant="destructive" className="mr-2">Desligados</Badge>
                  Servidores Removidos
                </h3>
                {comparisonResults.desligados.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Lotação</TableHead>
                        <TableHead>Data de Desligamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResults.desligados.map((servidor) => (
                        <TableRow key={servidor.id} className="bg-red-50">
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.dataDesligamento || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">Nenhum servidor desligado no período.</div>
                )}
              </div>

              {/* Servidores com Alterações */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Badge variant="warning" className="mr-2">Alterados</Badge>
                  Servidores com Alterações
                </h3>
                {comparisonResults.alterados.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Lotação</TableHead>
                        <TableHead>Vínculo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResults.alterados.map((servidor) => (
                        <TableRow key={servidor.id} className="bg-yellow-50">
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.vinculo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">Nenhum servidor com alterações no período.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dicas Rápidas */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium">Dicas Rápidas</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Utilize os filtros antes de exportar para gerar relatórios personalizados.
                A navegação entre meses mantém o departamento fixo, facilitando a análise.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TabelaDepartamentos
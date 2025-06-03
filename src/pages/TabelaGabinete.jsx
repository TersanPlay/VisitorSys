import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { sectorService } from '../services/sectorService'
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

const TabelaGabinete = () => {
  const { id } = useParams()
  const [sector, setSector] = useState(null)
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

  // Carregar dados do setor
  useEffect(() => {
    const loadSector = async () => {
      try {
        setLoading(true)
        const sectorData = await sectorService.getSectorById(id)
        setSector(sectorData)

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

        // Carregar dados de servidores para o mês atual
        const currentMonthStr = String(currentMonth).padStart(2, '0')
        loadServidores(currentMonthStr, currentYear)
      } catch (error) {
        console.error('Erro ao carregar dados do setor:', error)
        toast.error('Não foi possível carregar os dados do setor')
      } finally {
        setLoading(false)
      }
    }

    loadSector()
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
  const loadServidores = async (month, year = new Date().getFullYear()) => {
    try {
      setLoading(true)
      // Usar o novo método para buscar servidores reais
      const servidoresData = await sectorService.getServidoresBySector(id, month, year)

      if (servidoresData && servidoresData.length > 0) {
        setServidores(servidoresData)
        setFilteredServidores(servidoresData)
      } else {
        toast.error(`Não foram encontrados dados de servidores para ${month}/${year}`)
        setServidores([])
        setFilteredServidores([])
      }
    } catch (error) {
      console.error(`Erro ao carregar servidores para ${month}/${year}:`, error)
      toast.error('Não foi possível carregar os dados dos servidores')
      setServidores([])
      setFilteredServidores([])
    } finally {
      setLoading(false)
    }
  }

  // Comparar servidores entre meses
  const compararMeses = async () => {
    if (!compareMonth || compareMonth === selectedMonth) {
      toast.error('Selecione um mês diferente para comparação')
      return
    }

    try {
      setLoading(true)
      const currentYear = new Date().getFullYear()

      // Buscar servidores do mês de comparação
      const mesAnteriorServidores = await sectorService.getServidoresBySector(id, compareMonth, currentYear)

      if (!mesAnteriorServidores || mesAnteriorServidores.length === 0) {
        toast.error(`Não foram encontrados dados para o mês ${compareMonth}/${currentYear}`)
        return
      }

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
    } catch (error) {
      console.error('Erro ao comparar meses:', error)
      toast.error('Não foi possível realizar a comparação entre os meses')
    } finally {
      setLoading(false)
    }
  }

  // Exportar para Excel
  const exportarExcel = () => {
    // Resto do código permanece igual
  }

  // Exportar para PDF
  const exportarPDF = () => {
    // Resto do código permanece igual
  }

  // Manipulador de mudança de mês
  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    setCompareMode(false)
    loadServidores(month)
  }

  // Manipulador de mudança de mês para comparação
  const handleCompareMonthChange = (month) => {
    setCompareMonth(month)
  }

  if (loading && !sector) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{sector?.name || 'Setor'}</h1>
        <div className="flex space-x-2">
          <Button onClick={exportarExcel} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={exportarPDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servidores do Gabinete</CardTitle>
          <CardDescription>
            Visualize e gerencie os servidores lotados neste setor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, matrícula ou CPF..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-1/2">
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-1/3">
              <Select value={compareMonth} onValueChange={handleCompareMonthChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mês para comparação" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths
                    .filter(month => month.value !== selectedMonth)
                    .map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={compararMeses} variant="outline">
                Comparar
              </Button>
            </div>
          </div>

          {compareMode ? (
            <Tabs defaultValue="novos">
              <TabsList className="mb-4">
                <TabsTrigger value="novos" className="flex items-center gap-2">
                  Novos
                  <Badge variant="secondary">{comparisonResults.novos.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="desligados" className="flex items-center gap-2">
                  Desligados
                  <Badge variant="secondary">{comparisonResults.desligados.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="alterados" className="flex items-center gap-2">
                  Alterados
                  <Badge variant="secondary">{comparisonResults.alterados.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="novos">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Lotação</TableHead>
                      <TableHead>Vínculo</TableHead>
                      <TableHead>Data Admissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResults.novos.length > 0 ? (
                      comparisonResults.novos.map((servidor) => (
                        <TableRow key={servidor.id}>
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.vinculo}</TableCell>
                          <TableCell>{servidor.dataAdmissao}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhum novo servidor encontrado na comparação.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="desligados">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Lotação</TableHead>
                      <TableHead>Vínculo</TableHead>
                      <TableHead>Data Desligamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResults.desligados.length > 0 ? (
                      comparisonResults.desligados.map((servidor) => (
                        <TableRow key={servidor.id}>
                          <TableCell>{servidor.matricula}</TableCell>
                          <TableCell className="font-medium">{servidor.nome}</TableCell>
                          <TableCell>{servidor.cargo}</TableCell>
                          <TableCell>{servidor.lotacao}</TableCell>
                          <TableCell>{servidor.vinculo}</TableCell>
                          <TableCell>{servidor.dataDesligamento || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhum servidor desligado encontrado na comparação.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="alterados">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo Anterior</TableHead>
                      <TableHead>Cargo Atual</TableHead>
                      <TableHead>Lotação Anterior</TableHead>
                      <TableHead>Lotação Atual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonResults.alterados.length > 0 ? (
                      comparisonResults.alterados.map((servidor) => {
                        const anterior = comparisonResults.desligados.find(s => s.id === servidor.id) || {}
                        return (
                          <TableRow key={servidor.id}>
                            <TableCell>{servidor.matricula}</TableCell>
                            <TableCell className="font-medium">{servidor.nome}</TableCell>
                            <TableCell>{anterior.cargo || 'N/A'}</TableCell>
                            <TableCell>{servidor.cargo}</TableCell>
                            <TableCell>{anterior.lotacao || 'N/A'}</TableCell>
                            <TableCell>{servidor.lotacao}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Nenhum servidor com alterações encontrado na comparação.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          ) : (
            <>
              {filteredServidores.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Lotação</TableHead>
                      <TableHead>Vínculo</TableHead>
                      <TableHead>Data Admissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServidores.map((servidor) => (
                      <TableRow key={servidor.id}>
                        <TableCell>{servidor.matricula}</TableCell>
                        <TableCell className="font-medium">{servidor.nome}</TableCell>
                        <TableCell>{servidor.cargo}</TableCell>
                        <TableCell>{servidor.lotacao}</TableCell>
                        <TableCell>{servidor.vinculo}</TableCell>
                        <TableCell>{servidor.dataAdmissao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum servidor encontrado</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm ? 'Tente ajustar sua busca.' : 'Não há servidores cadastrados para este mês.'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TabelaGabinete
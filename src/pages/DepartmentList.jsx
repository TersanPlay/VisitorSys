import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { departmentService } from '../services/departmentService'
import DepartmentForm from '../components/DepartmentForm'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Plus, Edit, Trash2, Eye, Search, Building2, Users, Calendar, MapPin, Phone } from 'lucide-react'
import { toast } from 'react-hot-toast'

const DepartmentList = () => {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [filteredDepartments, setFilteredDepartments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [linkedSectors, setLinkedSectors] = useState([])

  // Carregar departamentos
  useEffect(() => {
    loadDepartments()
  }, [])

  // Filtrar departamentos quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDepartments(departments)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = departments.filter(department =>
        department.name.toLowerCase().includes(lowercasedSearch) ||
        department.code?.toLowerCase().includes(lowercasedSearch) ||
        department.responsibleName.toLowerCase().includes(lowercasedSearch) ||
        department.location.toLowerCase().includes(lowercasedSearch)
      )
      setFilteredDepartments(filtered)
    }
  }, [searchTerm, departments])

  // Carregar todos os departamentos
  const loadDepartments = async () => {
    setIsLoading(true)
    try {
      const data = await departmentService.getAllDepartments()
      setDepartments(data)
      setFilteredDepartments(data)
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error)
      toast.error('Não foi possível carregar a lista de departamentos')
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar setores vinculados a um departamento
  const loadLinkedSectors = async (departmentId) => {
    try {
      const sectors = await departmentService.getLinkedSectors(departmentId)
      setLinkedSectors(sectors)
    } catch (error) {
      console.error('Erro ao carregar setores vinculados:', error)
      toast.error('Não foi possível carregar os setores vinculados')
      setLinkedSectors([])
    }
  }

  // Abrir diálogo de detalhes do departamento
  const handleViewDetails = async (department) => {
    setCurrentDepartment(department)
    await loadLinkedSectors(department.id)
    setShowDetailsDialog(true)
  }

  // Abrir formulário de edição
  const handleEdit = (department) => {
    setCurrentDepartment(department)
    setShowEditForm(true)
  }

  // Abrir diálogo de confirmação de exclusão
  const handleDeleteClick = (department) => {
    setCurrentDepartment(department)
    setShowDeleteDialog(true)
  }

  // Excluir departamento
  const handleDelete = async () => {
    try {
      await departmentService.deleteDepartment(currentDepartment.id)
      toast.success('Departamento excluído com sucesso')
      loadDepartments()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao excluir departamento:', error)
      toast.error('Não foi possível excluir o departamento')
    }
  }

  // Salvar departamento (novo ou editado)
  const handleSave = () => {
    loadDepartments()
    setShowAddForm(false)
    setShowEditForm(false)
  }

  // Renderizar badge de status
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <Badge variant="success">Ativo</Badge>
    } else {
      return <Badge variant="secondary">Inativo</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Departamentos</h1>
        <Button onClick={() => navigate('/departments/add')}>
          <Plus className="h-4 w-4 mr-2" /> Novo Departamento
        </Button>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Pesquisar departamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela de departamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            {filteredDepartments.length} departamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDepartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.code || '-'}</TableCell>
                    <TableCell>{department.responsibleName}</TableCell>
                    <TableCell>{department.location}</TableCell>
                    <TableCell>{renderStatusBadge(department.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(department)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/departments/${department.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(department)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum departamento encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para adicionar departamento */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Adicionar Departamento</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onSave={handleSave}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar departamento */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
          </DialogHeader>
          {currentDepartment && (
            <DepartmentForm
              department={currentDepartment}
              onSave={handleSave}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para visualizar detalhes do departamento */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Departamento</DialogTitle>
          </DialogHeader>
          {currentDepartment && (
            <div className="space-y-6 py-4">
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="sectors">Setores</TabsTrigger>
                </TabsList>

                {/* Aba de Informações */}
                <TabsContent value="info" className="space-y-4 pt-4">
                  <div className="flex items-center space-x-4">
                    {currentDepartment.imageUrl && (
                      <img
                        src={currentDepartment.imageUrl}
                        alt={currentDepartment.name}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{currentDepartment.name}</h3>
                      {currentDepartment.code && (
                        <p className="text-sm text-muted-foreground">Código: {currentDepartment.code}</p>
                      )}
                      <div className="mt-1">{renderStatusBadge(currentDepartment.status)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Descrição</span>
                      </div>
                      <p className="text-sm">{currentDepartment.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Localização</span>
                      </div>
                      <p className="text-sm">{currentDepartment.location}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Horário de Funcionamento</span>
                      </div>
                      <p className="text-sm">{currentDepartment.workingHours || 'Não informado'}</p>
                    </div>

                    {currentDepartment.creationDate && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Data de Criação</span>
                        </div>
                        <p className="text-sm">{currentDepartment.creationDate}</p>
                      </div>
                    )}

                    {currentDepartment.parentDepartment && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Vínculo Superior</span>
                        </div>
                        <p className="text-sm">{currentDepartment.parentDepartment}</p>
                      </div>
                    )}
                  </div>

                  {currentDepartment.observations && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Observações</h4>
                      <p className="text-sm">{currentDepartment.observations}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Aba de Contato */}
                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Responsável</span>
                      </div>
                      <p className="text-sm">
                        {currentDepartment.responsibleName}
                        {currentDepartment.responsiblePosition && (
                          <span className="text-muted-foreground"> - {currentDepartment.responsiblePosition}</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                            <path d="m3 7 9 6 9-6" />
                          </svg>
                          <span className="font-medium">E-mail</span>
                        </div>
                        <p className="text-sm">{currentDepartment.responsibleEmail}</p>
                      </div>

                      {currentDepartment.phone && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Telefone/Ramal</span>
                          </div>
                          <p className="text-sm">{currentDepartment.phone}</p>
                        </div>
                      )}

                      {currentDepartment.cellphone && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Celular Funcional</span>
                          </div>
                          <p className="text-sm">{currentDepartment.cellphone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Aba de Setores */}
                <TabsContent value="sectors" className="space-y-4 pt-4">
                  {linkedSectors.length > 0 ? (
                    <div className="space-y-2">
                      {linkedSectors.map(sector => (
                        <Card key={sector.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{sector.name}</h4>
                                {sector.code && <p className="text-sm text-muted-foreground">Código: {sector.code}</p>}
                              </div>
                              {sector.status && (
                                <Badge variant={sector.status === 'active' ? 'success' : 'secondary'}>
                                  {sector.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                              )}
                            </div>
                            {sector.description && (
                              <p className="text-sm mt-2">{sector.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum setor vinculado a este departamento.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o departamento "{currentDepartment?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DepartmentList
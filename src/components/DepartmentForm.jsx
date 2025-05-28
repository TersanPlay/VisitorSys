import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { departmentService } from '../services/departmentService'
import { sectorService } from '../services/sectorService'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const DepartmentForm = ({ department = null, onSave, onCancel }) => {
  const isEditing = !!department
  const [loading, setLoading] = useState(false)
  const [sectors, setSectors] = useState([])
  const [linkedSectors, setLinkedSectors] = useState([])
  const [showSectorDialog, setShowSectorDialog] = useState(false)
  const [selectedSector, setSelectedSector] = useState('')

  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    responsibleName: '',
    responsiblePosition: '',
    responsibleEmail: '',
    phone: '',
    cellphone: '',
    location: '',
    workingHours: '',
    status: 'active',
    observations: '',
    creationDate: '',
    parentDepartment: '',
    imageFile: null,
    imagePreview: null
  })

  // Carregar dados do departamento se estiver editando
  useEffect(() => {
    if (isEditing && department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        responsibleName: department.responsibleName || '',
        responsiblePosition: department.responsiblePosition || '',
        responsibleEmail: department.responsibleEmail || '',
        phone: department.phone || '',
        cellphone: department.cellphone || '',
        location: department.location || '',
        workingHours: department.workingHours || '',
        status: department.status || 'active',
        observations: department.observations || '',
        creationDate: department.creationDate || '',
        parentDepartment: department.parentDepartment || '',
        imageFile: null,
        imagePreview: department.imageUrl || null
      })

      // Carregar setores vinculados
      loadLinkedSectors(department.id)
    }
  }, [department, isEditing])

  // Carregar lista de setores
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const allSectors = await sectorService.getAllSectors()
        setSectors(allSectors)
      } catch (error) {
        console.error('Erro ao carregar setores:', error)
        toast.error('Não foi possível carregar a lista de setores')
      }
    }

    loadSectors()
  }, [])

  // Carregar setores vinculados ao departamento
  const loadLinkedSectors = async (departmentId) => {
    try {
      const linked = await departmentService.getLinkedSectors(departmentId)
      setLinkedSectors(linked)
    } catch (error) {
      console.error('Erro ao carregar setores vinculados:', error)
      toast.error('Não foi possível carregar os setores vinculados')
    }
  }

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manipular mudança no status (ativo/inativo)
  const handleStatusChange = (checked) => {
    setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))
  }

  // Manipular seleção de imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  // Vincular setor ao departamento
  const handleLinkSector = async () => {
    if (!selectedSector) return

    try {
      if (isEditing) {
        await departmentService.linkSector(department.id, selectedSector)
        await loadLinkedSectors(department.id)
        toast.success('Setor vinculado com sucesso')
      } else {
        // Para novo departamento, apenas adiciona à lista temporária
        const sectorToAdd = sectors.find(s => s.id === selectedSector)
        if (sectorToAdd && !linkedSectors.some(s => s.id === selectedSector)) {
          setLinkedSectors(prev => [...prev, sectorToAdd])
        }
      }
      setSelectedSector('')
      setShowSectorDialog(false)
    } catch (error) {
      console.error('Erro ao vincular setor:', error)
      toast.error('Não foi possível vincular o setor')
    }
  }

  // Desvincular setor do departamento
  const handleUnlinkSector = async (sectorId) => {
    try {
      if (isEditing) {
        await departmentService.unlinkSector(department.id, sectorId)
        await loadLinkedSectors(department.id)
        toast.success('Setor desvinculado com sucesso')
      } else {
        // Para novo departamento, apenas remove da lista temporária
        setLinkedSectors(prev => prev.filter(s => s.id !== sectorId))
      }
    } catch (error) {
      console.error('Erro ao desvincular setor:', error)
      toast.error('Não foi possível desvincular o setor')
    }
  }

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result

      if (isEditing) {
        // Atualizar departamento existente
        result = await departmentService.updateDepartment(
          department.id,
          formData,
          formData.imageFile
        )
      } else {
        // Criar novo departamento
        result = await departmentService.createDepartment(
          formData,
          formData.imageFile
        )

        // Vincular setores para novo departamento
        if (result.success && linkedSectors.length > 0) {
          for (const sector of linkedSectors) {
            await departmentService.linkSector(result.department.id, sector.id)
          }
        }
      }

      toast.success(result.message)
      if (onSave) onSave(result.department)
    } catch (error) {
      console.error('Erro ao salvar departamento:', error)
      toast.error(error.message || 'Erro ao salvar departamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Departamento' : 'Novo Departamento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção de informações básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Departamento */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Departamento *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Sigla/Código */}
              <div className="space-y-2">
                <Label htmlFor="code">Sigla/Código</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ex: DRH, DJUR"
                />
              </div>
            </div>

            {/* Descrição/Finalidade */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição/Finalidade *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Seção de responsável */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Responsável</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Responsável */}
              <div className="space-y-2">
                <Label htmlFor="responsibleName">Nome do Responsável *</Label>
                <Input
                  id="responsibleName"
                  name="responsibleName"
                  value={formData.responsibleName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Cargo do Responsável */}
              <div className="space-y-2">
                <Label htmlFor="responsiblePosition">Cargo do Responsável *</Label>
                <Input
                  id="responsiblePosition"
                  name="responsiblePosition"
                  value={formData.responsiblePosition}
                  onChange={handleChange}
                  placeholder="Ex: Diretor, Coordenador"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* E-mail do Responsável */}
              <div className="space-y-2">
                <Label htmlFor="responsibleEmail">E-mail do Responsável *</Label>
                <Input
                  id="responsibleEmail"
                  name="responsibleEmail"
                  type="email"
                  value={formData.responsibleEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone/Ramal</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: (00) 0000-0000"
                />
              </div>
            </div>

            {/* Celular */}
            <div className="space-y-2">
              <Label htmlFor="cellphone">Celular Funcional</Label>
              <Input
                id="cellphone"
                name="cellphone"
                value={formData.cellphone}
                onChange={handleChange}
                placeholder="Ex: (00) 00000-0000"
              />
            </div>
          </div>

          {/* Seção de localização e funcionamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Localização e Funcionamento</h3>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Bloco A, 2º andar, Sala 201"
                required
              />
            </div>

            {/* Horário de Funcionamento */}
            <div className="space-y-2">
              <Label htmlFor="workingHours">Horário de Funcionamento</Label>
              <Input
                id="workingHours"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                placeholder="Ex: Segunda a sexta, das 8h às 14h"
              />
            </div>
          </div>

          {/* Seção de informações complementares */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Complementares</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={handleStatusChange}
                  />
                  <span>{formData.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>

              {/* Data de Criação */}
              <div className="space-y-2">
                <Label htmlFor="creationDate">Data de Criação</Label>
                <Input
                  id="creationDate"
                  name="creationDate"
                  type="date"
                  value={formData.creationDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Departamento Superior */}
            <div className="space-y-2">
              <Label htmlFor="parentDepartment">Vínculo com Departamento Superior</Label>
              <Input
                id="parentDepartment"
                name="parentDepartment"
                value={formData.parentDepartment}
                onChange={handleChange}
                placeholder="Ex: Secretaria de Administração"
              />
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={3}
                placeholder="Informações adicionais sobre o departamento"
              />
            </div>

            {/* Imagem/Brasão */}
            <div className="space-y-2">
              <Label htmlFor="imageFile">Imagem/Brasão</Label>
              <Input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.imagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.imagePreview}
                    alt="Prévia da imagem"
                    className="max-h-40 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seção de setores vinculados */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Setores Vinculados</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSectorDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Setor
              </Button>
            </div>

            {linkedSectors.length > 0 ? (
              <div className="space-y-2">
                {linkedSectors.map(sector => (
                  <div key={sector.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div>
                      <span className="font-medium">{sector.name}</span>
                      {sector.code && <span className="ml-2 text-sm text-muted-foreground">({sector.code})</span>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlinkSector(sector.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum setor vinculado a este departamento.</p>
            )}
          </div>

          {/* Botões de ação */}
          <CardFooter className="px-0 pt-6 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>

      {/* Diálogo para adicionar setor */}
      <Dialog open={showSectorDialog} onOpenChange={setShowSectorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Setor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sectorSelect">Selecione um Setor</Label>
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors
                    .filter(sector => !linkedSectors.some(s => s.id === sector.id))
                    .map(sector => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name} {sector.code && `(${sector.code})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSectorDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleLinkSector}
                disabled={!selectedSector}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default DepartmentForm
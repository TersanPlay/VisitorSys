import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DepartmentFormComponent from '../components/DepartmentForm'
import { ArrowLeft } from 'lucide-react'

const DepartmentForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const handleSave = () => {
    navigate('/departments')
  }

  const handleCancel = () => {
    navigate('/departments')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/departments')}
          className="mr-4 text-gray-600 hover:text-gray-900"
          title="Voltar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Departamento' : 'Novo Departamento'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <DepartmentFormComponent
          department={isEditMode ? { id } : null}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

export default DepartmentForm
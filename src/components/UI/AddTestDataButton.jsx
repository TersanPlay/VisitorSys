import React from 'react';
import { Database } from 'lucide-react';
import { addMockDataToLocalStorage, checkLocalStorageData } from '../../utils/mockData';
import { toast } from 'react-hot-toast';

const AddTestDataButton = ({ onDataAdded }) => {
  const handleAddTestData = () => {
    try {
      // Check current data
      const before = checkLocalStorageData();

      // Add mock data
      const { visitors, visits } = addMockDataToLocalStorage();

      toast.success(`Dados de teste adicionados: ${visitors.length} visitantes e ${visits.length} visitas`);

      // Call callback if provided
      if (onDataAdded && typeof onDataAdded === 'function') {
        onDataAdded();
      }
    } catch (error) {
      console.error('Error adding test data:', error);
      toast.error('Erro ao adicionar dados de teste');
    }
  };

  return (
    <button
      onClick={handleAddTestData}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Database className="h-4 w-4 mr-2" />
      Adicionar Dados de Teste
    </button>
  );
};

export default AddTestDataButton;
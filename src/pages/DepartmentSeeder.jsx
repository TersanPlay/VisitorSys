import React from 'react';
import DepartmentSeederComponent from '../components/DepartmentSeeder';
import { Helmet } from 'react-helmet-async';

const DepartmentSeederPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Criação de Departamentos | Sistema de Gestão</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ferramenta de Criação de Departamentos</h1>
        <p className="text-gray-600 mt-2">
          Use esta ferramenta para criar rapidamente os 17 departamentos padrão no sistema.
        </p>
      </div>

      <DepartmentSeederComponent />
    </div>
  );
};

export default DepartmentSeederPage;
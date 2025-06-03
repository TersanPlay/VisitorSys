import React from 'react';
import SectorSeeder from '../components/SectorSeeder';
import { Helmet } from 'react-helmet-async';

const SectorSeederPage = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Helmet>
        <title>Criação de Setores | Sistema de Visitantes</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Criação de Setores (Vereadores)</h1>
        <p className="text-gray-600 mt-1">
          Utilize esta ferramenta para criar os setores de vereadores no sistema.
        </p>
      </div>

      <SectorSeeder />
    </div>
  );
};

export default SectorSeederPage;
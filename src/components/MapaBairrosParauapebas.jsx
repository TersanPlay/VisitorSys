import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Activity, Info, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

// Corrigindo o problema de ícones no Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Dados dos bairros de Parauapebas
const bairros = [
  { nome: 'Cidade Nova', coordenadas: [-6.0715, -49.9032], visitas: Math.floor(Math.random() * 50) + 5, percentual: 86 },
  { nome: 'Rio Verde', coordenadas: [-6.0748, -49.9056], visitas: Math.floor(Math.random() * 50) + 5, percentual: 69 },
  { nome: 'Liberdade I', coordenadas: [-6.0689, -49.8994], visitas: Math.floor(Math.random() * 50) + 5, percentual: 47 },
  { nome: 'União', coordenadas: [-6.0652, -49.9021], visitas: Math.floor(Math.random() * 50) + 5, percentual: 72 },
  { nome: 'Beira Rio', coordenadas: [-6.0680, -49.8950], visitas: Math.floor(Math.random() * 50) + 5, percentual: 58 },
  { nome: 'Primavera', coordenadas: [-6.0730, -49.8980], visitas: Math.floor(Math.random() * 50) + 5, percentual: 63 },
  { nome: 'Da Paz', coordenadas: [-6.0770, -49.9010], visitas: Math.floor(Math.random() * 50) + 5, percentual: 51 },
  { nome: 'Altamira', coordenadas: [-6.0800, -49.9040], visitas: Math.floor(Math.random() * 50) + 5, percentual: 44 },
  { nome: 'Novo Brasil', coordenadas: [-6.0650, -49.9080], visitas: Math.floor(Math.random() * 50) + 5, percentual: 78 },
  { nome: 'Maranhão', coordenadas: [-6.0620, -49.9000], visitas: Math.floor(Math.random() * 50) + 5, percentual: 65 },
];

// Componente de marcador circular personalizado
const createCircularMarker = (percentual) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-circle">
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="white" stroke="#e6e6e6" stroke-width="2"/>
          <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" stroke-width="3"
            stroke-dasharray="${2 * Math.PI * 15}" 
            stroke-dashoffset="${2 * Math.PI * 15 - (percentual / 100) * 2 * Math.PI * 15}"
            transform="rotate(-90 18 18)" stroke-linecap="round"/>
          <text x="18" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">${percentual}%</text>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Estilo personalizado para os popups
const popupCustomStyle = {
  className: 'custom-popup',
};

// Componente de indicador circular para percentuais
const CircularIndicator = ({ percentual, label }) => {
  const circumference = 2 * Math.PI * 40; // r = 40
  const strokeDashoffset = circumference - (percentual / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentual}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-gray-500">{label}</span>
    </div>
  );
};

// Componente para controles de zoom personalizados
const ZoomControl = () => {
  const map = useMap();

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col space-y-2">
      <button
        className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-emerald-200 transition-colors"
        onClick={() => map.zoomIn()}
      >
        <Plus className="h-4 w-4 text-gray-500" />
      </button>
      <button
        className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-emerald-200 transition-colors"
        onClick={() => map.zoomOut()}
      >
        <Minus className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export default function MapaBairrosParauapebas() {
  const [selectedBairro, setSelectedBairro] = useState(null);

  const handleMarkerClick = (bairro) => {
    setSelectedBairro(bairro);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl overflow-hidden p-8 mt-6 animate-fade-in relative shadow-sm border border-gray-50">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none z-0">
        <div className="w-full h-full bg-[url('/world-map-bg.svg')] bg-no-repeat bg-center bg-contain"></div>
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <MapPin className="h-6 w-6 text-emerald-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Bairros de Parauapebas - PA</h2>
        </div>
        <div className="flex space-x-2">
          <span className="text-sm text-gray-500">2023</span>
          <span className="text-sm text-gray-300">|</span>
          <span className="text-sm text-gray-500">Visitas por Região</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div className="lg:w-2/3">
          <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white">
            <MapContainer
              center={[-6.0694, -49.9037]}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {bairros.map((bairro, index) => (
                <Marker
                  key={index}
                  position={bairro.coordenadas}
                  icon={createCircularMarker(bairro.percentual)}
                  eventHandlers={{
                    click: () => handleMarkerClick(bairro),
                  }}
                >
                  <Popup {...popupCustomStyle}>
                    <div className="p-3">
                      <h3 className="font-semibold text-emerald-700">{bairro.nome}</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                        <p className="text-sm text-gray-600">Visitas: {bairro.visitas}</p>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-300 mr-2"></div>
                        <p className="text-sm text-gray-600">Percentual: {bairro.percentual}%</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <ZoomControl />

              {/* Controles de navegação */}
              <div className="absolute right-4 bottom-20 z-[1000] flex flex-col space-y-2 leaflet-control">
                <button className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-emerald-200 transition-colors">
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                </button>
                <button className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 hover:border-emerald-200 transition-colors">
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </MapContainer>
          </div>
        </div>

        <div className="lg:w-1/3">
          {selectedBairro ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedBairro.nome}</h3>
                <Info className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="flex justify-center my-6">
                <CircularIndicator percentual={selectedBairro.percentual} label="Cobertura" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total de visitas</span>
                  <span className="font-medium text-gray-800">{selectedBairro.visitas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Última visita</span>
                  <span className="font-medium text-gray-800">23/05/2023</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Próxima visita</span>
                  <span className="font-medium text-gray-800">15/06/2023</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Atividade recente</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-gray-500">10/05/2023 - Visita técnica</div>
                  <div className="text-xs text-gray-500">28/04/2023 - Manutenção preventiva</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500">Selecione um bairro no mapa para ver detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-emerald-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Estatísticas por Bairro</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-slide-up">
          {bairros.slice(0, 5).map((bairro, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer"
              onClick={() => handleMarkerClick(bairro)}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-2">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e6e6e6" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 - (bairro.percentual / 100) * 2 * Math.PI * 40}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-800">{bairro.percentual}%</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-800 text-center">{bairro.nome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Adicionar estilos CSS para o popup personalizado e marcadores circulares
document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
    .custom-popup .leaflet-popup-content-wrapper {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #d1fae5;
    }
    .custom-popup .leaflet-popup-tip {
      background-color: white;
      border: 1px solid #d1fae5;
    }
    .leaflet-container {
      font-family: 'Inter', sans-serif;
    }
    .custom-div-icon {
      background: none;
      border: none;
    }
    .marker-circle {
      width: 36px;
      height: 36px;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }
  </style>`
);
# Documentação do Componente MapaBairrosParauapebas

## Visão Geral

Este documento descreve a implementação e personalização do componente `MapaBairrosParauapebas.jsx`, que exibe um mapa interativo dos bairros de Parauapebas com estatísticas de visitas. O componente foi desenvolvido utilizando React e a biblioteca Leaflet para visualização de mapas.

## Tecnologias Utilizadas

- **React**: Framework JavaScript para construção da interface
- **React Leaflet**: Wrapper React para a biblioteca Leaflet
- **Leaflet**: Biblioteca JavaScript para mapas interativos
- **Tailwind CSS**: Framework CSS para estilização
- **Lucide React**: Biblioteca de ícones

## Estrutura do Componente

O componente `MapaBairrosParauapebas.jsx` é composto por:

1. **Mapa interativo**: Exibe os bairros de Parauapebas com marcadores personalizados
2. **Painel de detalhes**: Mostra informações detalhadas do bairro selecionado
3. **Seção de estatísticas**: Exibe indicadores circulares para os principais bairros

## Como Implementar o Componente

### 1. Instalação das Dependências

```bash
npm install leaflet react-leaflet lucide-react
```

### 2. Importação do Componente

```jsx
import MapaBairrosParauapebas from '../components/MapaBairrosParauapebas';

// No seu componente ou página
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <MapaBairrosParauapebas />
    </div>
  );
}
```

## Como Adicionar Dados ao Gráfico

### Estrutura dos Dados

Os dados dos bairros são definidos como um array de objetos com a seguinte estrutura:

```jsx
const bairros = [
  { 
    nome: 'Nome do Bairro', 
    coordenadas: [latitude, longitude], 
    visitas: numeroDeVisitas, 
    percentual: percentualDeCobertura 
  },
  // Mais bairros...
];
```

### Integração com API ou Serviço de Dados

Para integrar com uma API real, você pode modificar o componente para buscar dados dinamicamente:

```jsx
import { useEffect, useState } from 'react';
import { visitorService } from '../services/visitorService';

export default function MapaBairrosParauapebas() {
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBairro, setSelectedBairro] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await visitorService.getBairrosData();
        setBairros(data);
      } catch (error) {
        console.error('Erro ao buscar dados dos bairros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Resto do componente...
}
```

### Personalização dos Indicadores Circulares

Os indicadores circulares são criados usando SVG. Para personalizar:

```jsx
// Componente de indicador circular para percentuais
const CircularIndicator = ({ percentual, label, size = 'md', color = '#10b981' }) => {
  // Tamanhos disponíveis
  const sizes = {
    sm: { width: 16, height: 16, strokeWidth: 4, fontSize: 'text-xs' },
    md: { width: 24, height: 24, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 32, height: 32, strokeWidth: 10, fontSize: 'text-3xl' }
  };
  
  const { width, height, strokeWidth, fontSize } = sizes[size] || sizes.md;
  const radius = width / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentual / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative w-${width} h-${height} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox={`0 0 ${width * 2} ${height * 2}`}>
          <circle 
            cx={width} 
            cy={height} 
            r={radius} 
            fill="none" 
            stroke="#e6e6e6" 
            strokeWidth={strokeWidth}
          />
          <circle 
            cx={width} 
            cy={height} 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${width} ${height})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-bold text-gray-800`}>{percentual}%</span>
        </div>
      </div>
      {label && <span className="mt-2 text-sm text-gray-500">{label}</span>}
    </div>
  );
};
```

## Principais Modificações Realizadas

### 1. Estilo Visual Atualizado

- **Mapa Base**: Substituição do OpenStreetMap padrão pelo CartoDB Positron para um visual mais minimalista
  ```jsx
  <TileLayer
    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  />
  ```

- **Paleta de Cores**: Mudança para tons de verde/turquesa (emerald-500, emerald-300) para alinhamento com o design do sistema

- **Fundo Decorativo**: Adição de um mapa mundial em marca d'água como elemento decorativo
  ```jsx
  <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none z-0">
    <div className="w-full h-full bg-[url('/world-map-bg.svg')] bg-no-repeat bg-center bg-contain"></div>
  </div>
  ```

### 2. Marcadores Personalizados

- **Indicadores Circulares**: Substituição dos marcadores padrão por indicadores circulares com percentuais
  ```jsx
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
  ```

### 3. Interatividade Aprimorada

- **Seleção de Bairros**: Implementação de estado para rastrear o bairro selecionado
  ```jsx
  const [selectedBairro, setSelectedBairro] = useState(null);

  const handleMarkerClick = (bairro) => {
    setSelectedBairro(bairro);
  };
  ```

- **Controles Personalizados**: Adição de controles de zoom e navegação personalizados
  ```jsx
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
  ```

### 4. Estilização de Popups

- **Popups Personalizados**: Estilização dos popups do Leaflet para se alinharem com o design geral
  ```jsx
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
  ```

## Boas Práticas e Recomendações

1. **Desempenho**: Para mapas com muitos marcadores, considere usar clustering para melhorar o desempenho

2. **Responsividade**: O componente já é responsivo, mas teste em diferentes tamanhos de tela

3. **Acessibilidade**: Adicione atributos ARIA para melhorar a acessibilidade

4. **Testes**: Implemente testes unitários e de integração para garantir o funcionamento correto

5. **Dados Reais**: Substitua os dados mockados por dados reais da API quando disponível

## Próximos Passos

1. Implementar clustering para melhor desempenho com muitos marcadores
2. Adicionar filtros para visualizar diferentes métricas
3. Integrar com a API de dados geográficos para obter limites reais dos bairros
4. Implementar visualização de calor (heatmap) para análise de densidade

## Solução de Problemas

### Problema: Ícones não aparecem no mapa

**Solução**: Verifique se as importações do Leaflet estão corretas e se o CSS do Leaflet foi importado:

```jsx
import 'leaflet/dist/leaflet.css';
```

### Problema: Marcadores personalizados não funcionam

**Solução**: Certifique-se de que o CSS para os marcadores personalizados está sendo injetado corretamente e que os caminhos para as imagens SVG estão corretos.

---

## Conclusão

O componente `MapaBairrosParauapebas.jsx` oferece uma visualização interativa e esteticamente agradável dos dados geográficos de Parauapebas. Com as modificações implementadas, o componente agora apresenta um visual moderno, minimalista e profissional, alinhado com o design geral do sistema.
# Sistema de Registro de Visitantes

## Visão Geral

O Sistema de Registro de Visitantes é uma aplicação web moderna desenvolvida para gerenciar o fluxo de visitantes em empresas, condomínios ou instituições. A aplicação permite o registro de visitantes, controle de entrada e saída, geração de relatórios, reconhecimento facial e muito mais.

## Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS
- **Bibliotecas principais**:
  - React Router DOM para navegação
  - Chart.js e React-Chartjs-2 para visualizações e gráficos
  - Face-api.js para reconhecimento facial
  - React Webcam para captura de fotos
  - React Hook Form para gerenciamento de formulários
  - React Hot Toast para notificações
  - Lucide React para ícones
  - Date-fns para manipulação de datas
  - Crypto-JS para criptografia de dados sensíveis
  - JSPDF e XLSX para exportação de dados

## Funcionalidades

### Funcionalidades Principais

- **Autenticação e Autorização**
  - Login com diferentes níveis de acesso (Administrador, Recepcionista, Gestor)
  - Proteção de rotas baseada em autenticação

- **Perfil de Usuário**
  - Interface completa para gerenciamento de informações pessoais
  - Preferências do sistema (tema, notificações, acessibilidade)
  - Configurações de segurança (alteração de senha, autenticação de dois fatores)
  - Histórico de atividades do usuário
  - Documentação detalhada em docs/perfil-usuario.md

- **Registro de Visitantes**
  - Formulário completo para cadastro de visitantes com interface moderna
  - Captura de foto via webcam com detecção automática de câmeras físicas
  - Reconhecimento facial automático para visitantes existentes
  - Validação de qualidade de imagem em tempo real
  - Confirmação inteligente de visitantes recorrentes
  - Pré-preenchimento automático de dados para visitantes reconhecidos
  - Validação de dados (CPF, email, telefone, CNH)
  - Campo CNH opcional com validação específica
  - Campo "Empresa/Organização" opcional
  - Dropdown para "Propósito da Visita" com opções predefinidas
  - Ícones visuais para melhor identificação dos campos

- **Gestão de Departamentos e Setores**
  - Formulários modernos com ícones visuais intuitivos
  - Dropdown padronizado para localização (Térreo, 1° Piso, 2° Piso)
  - Seletor avançado de horário de funcionamento com:
    - Campos separados para horário de início e fim
    - Toggles interativos para dias da semana
    - Validação automática de horários
  - Conversão automática de formatos para compatibilidade com backend
  - Campos opcionais para maior flexibilidade (telefone/ramal)
  - Tratamento de dados legados de horários de funcionamento

- **Controle de Visitas**
  - Registro de entrada e saída
  - Visualização de visitas ativas
  - Histórico de visitas

- **Dashboard**
  - Estatísticas em tempo real
  - Visitas do dia
  - Visitantes ativos
  - Alertas pendentes

- **Relatórios**
  - Visualizações gráficas (gráficos de barras, pizza)
  - Exportação de dados (PDF, Excel)
  - Filtros por data, empresa, setor

### Funcionalidades em Desenvolvimento

- **Sistema de Notificações**
  - Alertas em tempo real para novos visitantes
  - Notificações para o anfitrião quando um visitante chega

- **Agendamento de Visitas**
  - Pré-registro de visitantes esperados
  - Confirmação automática na chegada

- **Modo Escuro**
  - Interface adaptável com tema escuro em tons de cinza

- **Modo Totem**
  - Interface simplificada para auto-atendimento
  - Registro de visitantes sem intervenção da recepção

- **Internacionalização**
  - Suporte para múltiplos idiomas

- **Auditoria de Logs**
  - Registro detalhado de ações no sistema
  - Interface dedicada para visualização e análise de logs
  - Sistema de filtros avançados (período, tipo de ação, busca textual)
  - Categorização visual com ícones e badges coloridos
  - Exportação de logs para formato CSV
  - Suporte a tema escuro
  - Documentação detalhada em docs/auditoria-logs.md

### Funcionalidades de Reconhecimento Facial

- **Detecção Inteligente de Câmeras**
  - Priorização automática de câmeras físicas sobre virtuais
  - Filtragem de câmeras virtuais (OBS, ManyCam, etc.)
  - Configurações avançadas de qualidade de vídeo

- **Reconhecimento de Visitantes Existentes**
  - Busca automática por visitantes já cadastrados durante captura de foto
  - Modal de confirmação com dados do visitante e porcentagem de confiança
  - Opção de confirmar visitante existente ou proceder com novo registro
  - Pré-preenchimento automático do formulário para visitantes reconhecidos
  - Pulo automático para etapa de finalização quando visitante é confirmado

- **Validação de Qualidade de Imagem**
  - Análise em tempo real da qualidade da foto capturada
  - Detecção de múltiplas faces ou ausência de face
  - Validação de confiança mínima para reconhecimento
  - Feedback visual durante o processo de captura

## Estrutura do Projeto

```
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── Layout/       # Componentes de layout (Sidebar, Header)
│   │   └── UI/           # Componentes de interface (botões, inputs)
│   ├── contexts/         # Contextos React (AuthContext)
│   ├── pages/            # Páginas da aplicação
│   │   ├── Auth/         # Páginas de autenticação
│   │   ├── Dashboard/    # Dashboard e componentes relacionados
│   │   └── ...           # Outras páginas
│   ├── services/         # Serviços e APIs
│   ├── App.jsx           # Componente principal e rotas
│   └── main.jsx          # Ponto de entrada da aplicação
└── ...                   # Arquivos de configuração
```

## Instalação e Uso

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório
   ```bash
   git clone [url-do-repositorio]
   cd sistema-registro-visitantes
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn
   ```

3. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse a aplicação em `http://localhost:3000`

### Credenciais de Demonstração

- **Administrador**:
  - Email: admin@exemplo.com
  - Senha: admin123

- **Recepcionista**:
  - Email: recepcao@exemplo.com
  - Senha: recepcao123

- **Gestor**:
  - Email: gestor@exemplo.com
  - Senha: gestor123

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Changelog

Para ver o histórico detalhado de mudanças e novas funcionalidades, consulte o [CHANGELOG.md](./CHANGELOG.md).

## Contato

Para sugestões, dúvidas ou contribuições, entre em contato através do email: [seu-email@exemplo.com]
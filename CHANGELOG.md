# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.4.0] - 2024-12-25

### ✨ Novas Funcionalidades

#### Sistema de Auditoria de Logs
- **Registro Completo de Ações**: Implementação de sistema para registrar todas as ações dos usuários
- **Interface de Visualização**: Página dedicada para visualização e análise de logs
- **Filtros Avançados**: Sistema de filtros por período, tipo de ação e busca textual
- **Categorização Visual**: Ícones e badges coloridos para diferentes tipos de ação
- **Exportação de Dados**: Funcionalidade para exportar logs filtrados em formato CSV

#### Melhorias na Segurança
- **Trilha de Auditoria**: Registro detalhado de ações para fins de segurança e conformidade
- **Monitoramento de Atividades**: Visualização de ações por tipo, data e usuário
- **Detecção de Anomalias**: Base para identificação de padrões suspeitos de uso

### 🎨 Melhorias de Interface

#### Página de Auditoria
- **Layout Responsivo**: Interface adaptável a diferentes tamanhos de tela
- **Tema Escuro**: Suporte completo ao modo escuro do sistema
- **Tabela Interativa**: Visualização organizada com colunas para data/hora, ação, descrição, detalhes
- **Feedback Visual**: Spinners de carregamento e notificações toast

### 🔧 Melhorias Técnicas

#### Serviço de Auditoria
- **Função `logAction`**: Registro de ações no `authService.js`
- **Função `getAuditLogs`**: Recuperação e filtragem de logs com múltiplos critérios
- **Armazenamento Local**: Implementação inicial com localStorage (limite de 1000 entradas)
- **Filtros Eficientes**: Algoritmos otimizados para filtragem de grandes volumes de logs

#### Documentação
- **docs/auditoria-logs.md**: Documentação detalhada do sistema de auditoria
- **Atualização do README**: Inclusão das novas funcionalidades na documentação principal

---

## [1.3.0] - 2024-12-24

### ✨ Novas Funcionalidades

#### Melhorias nos Formulários de Departamentos
- **Ícones Visuais**: Adicionados ícones intuitivos para todos os campos do formulário
- **Dropdown de Localização**: Campo "Localização" convertido para dropdown com opções "Térreo", "1° Piso", "2° Piso"
- **Seletor de Horário Avançado**: Substituição do campo de texto por interface intuitiva com:
  - Seletores de horário de início e fim
  - Toggles para dias da semana
  - Validação automática de horários
- **Compatibilidade Backend**: Conversão automática do objeto `workingHours` para formato string compatível

#### Melhorias nos Formulários de Setores
- **Ícones Informativos**: Implementação de ícones para melhor identificação visual dos campos
- **Localização Padronizada**: Dropdown consistente com opções de andares
- **Horário de Funcionamento Intuitivo**: Mesmo sistema avançado de seleção de horários dos departamentos
- **Campo Telefone Opcional**: Campo "Telefone/Ramal" do responsável agora é opcional
- **Validação Aprimorada**: Tratamento de formatos legados de horários de funcionamento

#### Melhorias no Registro de Visitantes
- **Campo CNH Opcional**: Adicionado campo para Carteira Nacional de Habilitação com validação
- **Empresa/Organização Opcional**: Campo "Empresa/Organização" agora é opcional
- **Dropdown de Propósito**: Campo "Propósito da Visita" convertido para dropdown com opções:
  - Reunião de Negócios
  - Entrevista de Emprego
  - Visita Técnica
  - Manutenção/Reparo
  - Entrega/Coleta
  - Consultoria
  - Treinamento
  - Auditoria
  - Visita Institucional
  - Evento/Palestra
  - Outros

### 🎨 Melhorias de Interface

#### Ícones Implementados
- **Departamentos**: Building2, Hash, MapPin, Clock, User, Mail, Phone, FileText, Activity
- **Setores**: User, Hash, MapPin, Clock, Mail, Phone, Smartphone, FileText, Activity
- **Visitantes**: User, Mail, Phone, CreditCard, IdCard, Building2, Target, FileText

#### Componentes de Formulário
- **Seletor de Horário**: Componente reutilizável para seleção de horários de funcionamento
- **Toggles de Dias**: Interface intuitiva para seleção de dias da semana
- **Dropdowns Padronizados**: Consistência visual entre todos os formulários

### 🔧 Melhorias Técnicas

#### Gestão de Estado
- **Objeto workingHours**: Estrutura padronizada para horários de funcionamento
- **Conversão de Formatos**: Funções para compatibilidade com backend existente
- **Validação de CNH**: Implementação de validação para carteira de habilitação

#### Funções Utilitárias
- `formatWorkingHoursForBackend()`: Converte objeto para string compatível
- `parseWorkingHoursFromString()`: Converte string legada para objeto
- `validateCNH()`: Validação de formato de CNH

### 📱 Experiência do Usuário

#### Fluxo Otimizado
- **Formulários Mais Intuitivos**: Redução de campos de texto livre
- **Validação em Tempo Real**: Feedback imediato para campos obrigatórios
- **Consistência Visual**: Padronização de ícones e layouts
- **Campos Opcionais**: Flexibilidade para informações não essenciais

#### Acessibilidade
- **Ícones Descritivos**: Melhor identificação visual dos campos
- **Labels Claras**: Textos explicativos para todos os campos
- **Validação Amigável**: Mensagens de erro compreensíveis

---

## [1.2.0] - 2024-12-24

### ✨ Novas Funcionalidades

#### Reconhecimento Inteligente de Visitantes Existentes
- **Busca Automática**: O sistema agora busca automaticamente por visitantes já cadastrados durante a captura de foto
- **Modal de Confirmação**: Interface elegante que exibe dados do visitante reconhecido com porcentagem de confiança
- **Fluxo Otimizado**: Visitantes reconhecidos podem ter seus dados pré-preenchidos automaticamente
- **Dupla Opção**: Possibilidade de confirmar visitante existente ou proceder com novo registro

#### Detecção Avançada de Câmeras
- **Priorização de Câmeras Físicas**: Sistema detecta e prioriza câmeras físicas sobre virtuais
- **Filtragem Inteligente**: Filtra automaticamente câmeras virtuais (OBS, ManyCam, XSplit, etc.)
- **Configurações Avançadas**: Implementação de configurações de qualidade de vídeo otimizadas
- **Logs Informativos**: Sistema de logs detalhado para debugging de câmeras

#### Melhorias na Validação de Imagem
- **Threshold Configurável**: Confiança mínima de 80% para reconhecimento facial
- **Validação em Tempo Real**: Análise contínua da qualidade da imagem capturada
- **Feedback Visual**: Indicadores visuais durante o processo de captura

### 🔧 Melhorias Técnicas

#### Estados de Controle
- Adicionados novos estados: `existingVisitor` e `showVisitorConfirmation`
- Gerenciamento aprimorado do fluxo de captura de foto
- Controle condicional de botões e interface

#### Funções de Fluxo
- `confirmExistingVisitor()`: Pré-preenche formulário e avança para etapa final
- `proceedWithNewRegistration()`: Limpa dados e continua com novo registro
- `selectPhysicalCamera()`: Filtra e seleciona câmeras físicas

#### Integração de Serviços
- Integração aprimorada com `faceRecognitionService`
- Uso otimizado do `visitorService.searchVisitorByFace()`
- Tratamento robusto de erros durante busca facial

### 🎨 Melhorias de Interface

#### Modal de Confirmação
- Design moderno e responsivo
- Exibição clara de dados do visitante
- Indicador de confiança do reconhecimento
- Botões de ação intuitivos

#### Controles de Câmera
- Botão "Continuar" desabilitado durante confirmação
- Estados visuais aprimorados
- Feedback visual para diferentes estados

### 📚 Documentação

#### README.md
- Seção dedicada às funcionalidades de reconhecimento facial
- Detalhamento das capacidades de detecção de câmeras
- Documentação do fluxo de visitantes existentes

#### desenvolvimento-projeto.md
- Atualização do status de implementação
- Detalhamento técnico das novas funcionalidades
- Roadmap atualizado

### 🔄 Fluxo de Funcionamento Atualizado

1. **Captura de Foto** → Validação de qualidade
2. **Busca Facial** → Extração de encoding e comparação automática
3. **Se Visitante Encontrado**:
   - Modal com dados e porcentagem de confiança
   - Opção de confirmar ou registrar como novo
4. **Se Confirmado**: Pula para etapa 3 com dados pré-preenchidos
5. **Se Novo Registro**: Continua fluxo normal de cadastro

### 🛠️ Configurações Técnicas

- **Threshold de Confiança**: 80% para reconhecimento facial
- **Câmeras Virtuais Filtradas**: OBS, ManyCam, XSplit, Virtual, Snap, etc.
- **Configurações de Vídeo**: focusMode, exposureMode, whiteBalanceMode contínuos
- **Tratamento de Erros**: Logs detalhados e fallbacks robustos

---

## [1.1.0] - 2024-12-23

### Funcionalidades Anteriores
- Sistema básico de reconhecimento facial
- Cadastro de visitantes
- Dashboard e relatórios
- Gestão de departamentos e setores
- Autenticação e autorização

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**
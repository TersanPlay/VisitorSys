# Documentação: Sistema de Auditoria de Logs

## Visão Geral

O Sistema de Auditoria de Logs é um componente essencial para segurança e monitoramento do Sistema de Registro de Visitantes. Ele permite o registro, armazenamento e visualização de ações realizadas pelos usuários dentro da aplicação, fornecendo uma trilha de auditoria completa para fins de segurança, conformidade e resolução de problemas.

## Funcionalidades Implementadas

- ✅ Função `logAction` para registro de ações no `authService.js`
- ✅ Função `getAuditLogs` para recuperação e filtragem de logs
- ✅ Interface de usuário para visualização de logs com categorização visual
- ✅ Sistema de filtros avançados (período, tipo de ação, busca textual)
- ✅ Exportação de logs para formato CSV
- ✅ Suporte a tema escuro
- ❌ Relatórios de segurança baseados em logs (não implementado)
- ❌ Visualizações gráficas (não implementado)

## Arquitetura e Implementação

### Serviço de Autenticação (`authService.js`)

O sistema de logs está integrado ao serviço de autenticação, que contém duas funções principais:

#### 1. `logAction`

Esta função registra ações realizadas pelos usuários no sistema.

```javascript
async logAction(action, description, metadata = {}) {
  try {
    const logEntry = {
      action,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'localhost' // Em implementação real, obter do servidor
    }
    
    // Armazena no localStorage para demonstração (usar banco de dados real em produção)
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
    logs.push(logEntry)
    localStorage.setItem('auditLogs', JSON.stringify(logs.slice(-1000))) // Mantém os últimos 1000 logs
    
    console.log('Action logged:', logEntry)
  } catch (error) {
    console.error('Log action error:', error)
  }
}
```

**Parâmetros:**
- `action`: String que identifica o tipo de ação (ex: "login", "create_visitor", "update_profile")
- `description`: Descrição textual da ação realizada
- `metadata`: Objeto com dados adicionais relevantes para a ação (opcional)

**Informações registradas:**
- Tipo de ação
- Descrição da ação
- Metadados associados
- Data e hora (timestamp)
- User-Agent do navegador
- Endereço IP (simulado como 'localhost' na versão atual)

#### 2. `getAuditLogs`

Esta função recupera e filtra os logs armazenados.

```javascript
async getAuditLogs(filters = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
    
    // Aplica filtros
    let filteredLogs = logs
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startDate)
      )
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endDate)
      )
    }
    
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      )
    }
    
    return filteredLogs.reverse() // Mais recentes primeiro
  } catch (error) {
    console.error('Get audit logs error:', error)
    return []
  }
}
```

**Parâmetros:**
- `filters`: Objeto com opções de filtragem (opcional)
  - `startDate`: Data inicial para filtrar logs
  - `endDate`: Data final para filtrar logs
  - `action`: Filtrar por tipo de ação

### Interface de Usuário (`AuditLogs.jsx`)

A interface de usuário para visualização de logs oferece uma experiência completa para visualizar, filtrar e exportar os logs de auditoria.

#### Principais características:

1. **Visualização em tabela**
   - Exibição organizada dos logs com colunas para data/hora, ação, descrição, detalhes, navegador e IP
   - Layout responsivo que adapta as colunas visíveis conforme o tamanho da tela
   - Tratamento para exibição quando não há logs encontrados

2. **Sistema de filtros avançados**
   - Filtro por período predefinido (hoje, ontem, últimos 7/30/90 dias)
   - Filtro por período personalizado (data inicial e final)
   - Filtro por tipo de ação
   - Busca textual em todos os campos (ação, descrição, metadados)
   - Atualização automática dos resultados ao aplicar filtros

3. **Categorização visual**
   - Ícones coloridos para diferentes tipos de ação:
     - 🔵 Azul: Autenticação (login/logout)
     - 🟢 Verde: Criação (create/add)
     - 🟠 Laranja: Atualização (update/edit)
     - 🔴 Vermelho: Exclusão (delete/remove)
     - 🟣 Roxo: Visualização (view/read)
     - 🔴 Vermelho: Erros (error/fail)
     - ⚪ Cinza: Outros tipos de ação
   - Badges coloridos para categorizar ações (Autenticação, Criação, Atualização, Exclusão, etc.)
   - Formatação especial para data/hora com ícones de calendário e relógio

4. **Exportação de dados**
   - Exportação dos logs filtrados para formato CSV
   - Nome do arquivo inclui a data atual
   - Validação para evitar exportação quando não há dados

5. **Atualização em tempo real**
   - Botão para atualizar os logs manualmente
   - Feedback visual durante o carregamento com spinner
   - Notificações toast para confirmação de ações

6. **Suporte a tema escuro**
   - Interface totalmente compatível com o modo escuro do sistema
   - Cores adaptativas para melhor legibilidade em ambos os temas

## Como Utilizar

### Registrando Ações

Para registrar ações no sistema de logs, utilize a função `logAction` do `authService`:

```javascript
import { authService } from '../services/authService'

// Exemplo de registro de login
authService.logAction(
  'login',
  'Usuário realizou login no sistema',
  { userId: 1, email: 'usuario@exemplo.com' }
)

// Exemplo de registro de criação de visitante
authService.logAction(
  'create_visitor',
  'Novo visitante registrado no sistema',
  { visitorId: 123, name: 'João Silva' }
)
```

### Acessando a Interface de Logs

A interface de logs está disponível para usuários com permissões adequadas (geralmente administradores) através da rota `/audit-logs`.

### Filtrando Logs

1. Clique no botão "Mostrar Filtros" para exibir as opções de filtragem
2. Selecione um período predefinido ou escolha datas personalizadas
3. Opcionalmente, filtre por tipo de ação ou use a busca textual
4. Os resultados são atualizados automaticamente conforme os filtros são aplicados

### Exportando Logs

1. Aplique os filtros desejados para selecionar os logs que deseja exportar
2. Clique no botão "Exportar CSV"
3. Um arquivo CSV será gerado e baixado automaticamente

## Armazenamento de Dados

Na implementação atual, os logs são armazenados no `localStorage` do navegador, com um limite de 1000 entradas mais recentes. Em um ambiente de produção, recomenda-se substituir por:

- Banco de dados dedicado para logs
- Implementação de rotação de logs
- Backup regular dos dados de auditoria

## Melhorias Futuras

- **Relatórios de segurança**: Implementar análise e geração de relatórios baseados nos logs de auditoria
- **Alertas de segurança**: Configurar alertas para ações suspeitas ou padrões anômalos
- **Exportação em outros formatos**: Adicionar suporte para exportação em PDF e Excel
- **Visualizações gráficas**: Implementar gráficos e dashboards para análise visual dos logs
- **Armazenamento em banco de dados**: Migrar do localStorage para um banco de dados persistente
- **Filtragem por usuário**: Adicionar filtro específico por usuário que realizou a ação
- **Detalhes expandidos**: Adicionar visualização expandida para detalhes de logs específicos
- **Agrupamento de logs**: Permitir agrupamento por tipo de ação, data ou usuário
- **Histórico de filtros**: Salvar configurações de filtros recentes para reutilização
- **Logs em tempo real**: Implementar atualização automática de logs em tempo real
- **Exportação programada**: Permitir agendamento de exportações automáticas de logs

## Considerações de Segurança

- Os logs de auditoria são uma parte crítica da segurança do sistema e devem ser protegidos contra acesso não autorizado
- Em um ambiente de produção, considere a criptografia dos dados de log
- Implemente políticas de retenção de logs de acordo com requisitos legais e de conformidade
- Garanta que o acesso à interface de logs seja restrito apenas a usuários autorizados

## Conclusão

O Sistema de Auditoria de Logs fornece uma base sólida para o monitoramento e rastreamento de ações no Sistema de Registro de Visitantes. Embora a implementação atual utilize armazenamento local para fins de demonstração, a arquitetura foi projetada para ser facilmente adaptável a um ambiente de produção com armazenamento persistente e recursos avançados de segurança.
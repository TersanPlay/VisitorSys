# Documentação: Página de Perfil do Usuário (Meu Perfil)

## Visão Geral

A página "Meu Perfil" é uma interface completa para gerenciamento de informações do usuário, preferências do sistema e configurações de segurança. Esta página foi implementada para proporcionar aos usuários controle sobre seus dados pessoais, personalização da experiência e gerenciamento de configurações de segurança, tudo em uma interface moderna e responsiva.

## Funcionalidades Implementadas

### Gerenciamento de Perfil

- **Visualização de Dados Pessoais**: Exibição de informações como nome, email, telefone, endereço e cargo
- **Edição de Informações**: Interface intuitiva para atualização de dados pessoais
- **Avatar do Usuário**: Exibição da foto do perfil com opção de atualização
- **Biografia**: Campo para descrição pessoal ou profissional
- **Informações Profissionais**: Visualização de departamento, cargo e data de ingresso

### Preferências do Sistema

- **Configurações de Notificações**:
  - Controle de notificações por email
  - Controle de notificações push no navegador

- **Aparência**:
  - Seleção de tema (claro, escuro ou sistema)
  - Integração com o sistema de tema global da aplicação

- **Idioma**:
  - Seleção de idioma da interface (Português, Inglês, Espanhol)

- **Acessibilidade**:
  - Opção de alto contraste para melhor visualização
  - Opção de texto grande para facilitar a leitura

### Segurança da Conta

- **Autenticação de Dois Fatores**: Configuração de 2FA para maior segurança
- **Gerenciamento de Senha**: Interface para alteração de senha com validação
- **Monitoramento de Dispositivos**: Visualização de dispositivos conectados à conta
- **Configurações Avançadas de Segurança**:
  - Tempo de expiração da sessão
  - Política de expiração de senha

### Histórico de Atividades

- **Registro de Ações**: Visualização cronológica das atividades do usuário no sistema
- **Detalhes de Acesso**: Informações sobre dispositivo e endereço IP de cada atividade
- **Categorização Visual**: Ícones diferentes para cada tipo de ação (login, alteração de perfil, etc.)

## Estrutura da Interface

### Navegação por Abas

A interface é organizada em abas para facilitar a navegação:

1. **Perfil**: Informações pessoais e profissionais
2. **Preferências**: Configurações de aparência, notificações e acessibilidade
3. **Segurança**: Configurações de segurança da conta
4. **Atividade**: Histórico de ações do usuário

### Componentes Principais

- **Card de Perfil**: Exibe avatar, nome, cargo e informações básicas
- **Formulários Interativos**: Campos editáveis quando o modo de edição está ativo
- **Toggles de Preferências**: Controles visuais para ativar/desativar funcionalidades
- **Modais de Configuração**: Interfaces dedicadas para alteração de senha e configurações de segurança
- **Timeline de Atividades**: Visualização cronológica das ações do usuário

## Integração com o Sistema

### Contextos Utilizados

- **AuthContext**: Gerencia dados do usuário autenticado e funções de atualização
- **ThemeContext**: Controla o tema da aplicação (claro/escuro)

### Serviços Relacionados

- **authService**: Responsável pela autenticação e atualização de dados do usuário
- **logService**: Registra ações do usuário para o histórico de atividades

## Implementação Técnica

### Componente Principal

- **MeuPerfil.jsx**: Componente React que implementa toda a interface e lógica da página

### Estados Principais

- **formData**: Armazena dados do formulário durante edição
- **preferences**: Gerencia preferências do usuário (tema, notificações, etc.)
- **securitySettings**: Controla configurações de segurança
- **activityLogs**: Armazena o histórico de atividades do usuário

### Funções Importantes

- **handleSaveProfile()**: Salva alterações no perfil do usuário
- **handleInputChange()**: Atualiza o estado do formulário durante edição
- **handlePreferenceChange()**: Atualiza preferências do usuário
- **handleSecurityChange()**: Atualiza configurações de segurança
- **handleChangePassword()**: Processa a alteração de senha

## Como Utilizar

### Acessando a Página

1. Faça login no sistema
2. Clique no avatar/nome do usuário no canto superior direito
3. Selecione "Meu Perfil" no menu dropdown

### Editando Informações Pessoais

1. Na aba "Perfil", clique no botão "Editar"
2. Atualize os campos desejados
3. Clique em "Salvar" para confirmar as alterações

### Alterando Preferências

1. Acesse a aba "Preferências"
2. Ative o modo de edição clicando em "Editar"
3. Ajuste as configurações conforme desejado
4. Salve as alterações

### Gerenciando Segurança

1. Navegue até a aba "Segurança"
2. Para alterar a senha, clique em "Alterar" ao lado de "Senha"
3. Para configurar a autenticação de dois fatores, clique em "Configurar"
4. Para visualizar dispositivos conectados, clique em "Visualizar"

### Consultando Histórico de Atividades

1. Acesse a aba "Atividade"
2. Visualize o registro cronológico de suas ações no sistema
3. Para ver o histórico completo, clique em "Ver histórico completo"

## Considerações de Segurança

- As senhas são validadas quanto à força e complexidade
- A autenticação de dois fatores adiciona uma camada extra de segurança
- O histórico de atividades permite identificar acessos não autorizados
- As configurações de expiração de sessão ajudam a prevenir acessos indevidos

## Próximas Melhorias Planejadas

- Integração com sistemas de autenticação externos (Google, Microsoft)
- Opções avançadas de backup de dados pessoais
- Personalização adicional da interface do usuário
- Notificações de segurança para atividades suspeitas
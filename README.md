# 🎮 PokéChat - Chatbot Interativo de Pokémon

Um chatbot inteligente que permite aos usuários interagir com informações detalhadas sobre Pokémon através de uma interface conversacional amigável. O sistema utiliza a PokéAPI para fornecer dados precisos e atualizados sobre o universo Pokémon.

## 📋 Resumo da Aplicação

O **PokéChat** é uma aplicação full-stack que combina:
- **Backend**: API REST em Node.js com Express, integração com PokéAPI e sistema de monitoramento
- **Frontend**: Interface React moderna com Tailwind CSS para uma experiência visual atrativa
- **Chatbot**: Sistema conversacional inteligente usando LangGraph para gerenciar fluxos de conversa
- **Monitoramento**: Métricas detalhadas com Prometheus e dashboards em tempo real

### 🚀 Principais Funcionalidades

- 💬 **Chat Interativo**: Interface conversacional intuitiva para busca de informações sobre Pokémon
- 🔍 **Busca Avançada**: Pesquisa por nome, tipo, características e evoluções
- 📊 **Comparações**: Tabelas comparativas entre diferentes Pokémon
- 🌟 **Evoluções**: Visualização completa das cadeias evolutivas
- 📈 **Monitoramento**: Dashboard de métricas e estatísticas do sistema
- 🎨 **Design Responsivo**: Interface moderna e adaptável a diferentes dispositivos

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** (>=18.0.0) - Runtime JavaScript
- **Express.js** - Framework web
- **LangGraph** - Sistema de fluxo conversacional
- **Prometheus** - Métricas e monitoramento
- **Winston** - Sistema de logging
- **Jest** - Framework de testes

### Frontend
- **React 19** - Biblioteca de interface
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **ESLint** - Linting de código

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js >= 18.0.0
- Docker e Docker Compose (opcional)
- npm ou yarn

### 📦 Opção 1: Executando com Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd PokeChat
```

2. **Execute com Docker Compose:**
```bash
docker-compose up --build
```

3. **Acesse a aplicação:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Monitoramento: http://localhost:3000/status

### 🖥️ Opção 2: Executando Localmente

#### Backend

1. **Navegue para o diretório do backend:**
```bash
cd backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor:**
```bash
npm start
```

O backend estará disponível em: http://localhost:3000

#### Frontend

1. **Navegue para o diretório do frontend:**
```bash
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

O frontend estará disponível em: http://localhost:5173

## 🧪 Executando os Testes

### Backend

```bash
cd backend

# Executar todos os testes
npm test

# Executar com watch mode (re-executa ao salvar arquivos)
npm run test:watch

# Executar com cobertura de código
npm run test:coverage

# Executar teste manual (integração com PokéAPI real)
npm run test:manual
```

### Visualizar Relatório de Cobertura

Após executar `npm run test:coverage`, abra o arquivo:
```
backend/coverage/lcov-report/index.html
```

## 📊 URLs de Monitoramento do Backend

O sistema possui várias URLs para monitoramento e métricas:

### 🔍 Dashboards e Monitoramento

- **Dashboard Principal**: http://localhost:3000/status
  - Monitoramento em tempo real do sistema
  - Métricas de CPU, memória, requests, etc.
  - Gráficos interativos de performance

### 📈 Métricas e Estatísticas

- **Métricas JSON**: http://localhost:3000/api/monitoring/metrics/json
  - Métricas detalhadas em formato JSON
  - Dados para integração com Prometheus

- **Estatísticas do Sistema**: http://localhost:3000/api/monitoring/stats
  - Estatísticas consolidadas do sistema
  - Contadores de sessões, mensagens, requisições da API

- **Health Check Detalhado**: http://localhost:3000/api/monitoring/health/detailed
  - Status detalhado da aplicação
  - Informações de uptime, memória, versão

### 🔧 Health Check Básico

- **Health Check**: http://localhost:3000/health
  - Status básico da aplicação

## 📡 API Endpoints

### Chat
- `POST /api/chat/start` - Iniciar nova sessão
- `POST /api/chat/message` - Enviar mensagem
- `GET /api/chat/history/:sessionId` - Histórico da sessão
- `GET /api/chat/stats/:sessionId` - Estatísticas da sessão
- `POST /api/chat/reset/:sessionId` - Resetar conversa
- `DELETE /api/chat/session/:sessionId` - Encerrar sessão
- `GET /api/chat/sessions` - Listar sessões ativas

### Monitoramento
- `GET /api/monitoring/metrics/json` - Métricas em JSON
- `GET /api/monitoring/stats` - Estatísticas do sistema
- `GET /api/monitoring/health/detailed` - Health check detalhado

## 🏗️ Estrutura do Projeto

```
PokeChat/
├── backend/                 # API Backend
│   ├── controllers/         # Controladores da API
│   ├── services/           # Serviços (PokéAPI)
│   ├── graph/              # Sistema conversacional
│   ├── routes/             # Definição de rotas
│   ├── config/             # Configurações (logging, monitoring)
│   ├── constants/          # Constantes da aplicação
│   ├── tests/              # Testes unitários
│   └── logs/               # Arquivos de log
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Context API
│   │   ├── hooks/          # Custom hooks
│   │   └── api/            # Serviços de API
│   └── public/             # Arquivos estáticos
└── docker-compose.yaml     # Configuração Docker
```

## 🐳 Docker

### Comandos Docker Úteis

```bash
# Construir e executar todos os serviços
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs dos serviços
docker-compose logs -f

# Reconstruir apenas o backend
docker-compose build backend

# Executar comandos dentro do container
docker-compose exec backend npm test
```

## 📝 Logs

Os logs são salvos na pasta `backend/logs/`:
- `combined.log` - Todos os logs
- `error.log` - Apenas erros
- `http.log` - Requisições HTTP

## 👨‍💻 Autor

**João Espanha** - Desenvolvedor do projeto

---

🎮 **Divirta-se explorando o mundo Pokémon com o PokéChat!**

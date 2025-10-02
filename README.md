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
- **Node.js** (Node 20 LTS) - Runtime JavaScript
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

- Node.js 20 LTS
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

#### ⚙️ Configuração de Variáveis de Ambiente

Antes de executar a aplicação localmente, você precisará criar arquivos `.env` em ambos os diretórios (backend e frontend) seguindo os exemplos abaixo:

**Backend** - Crie o arquivo `backend/.env`:
```env
# Backend Environment Variables
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# PokeAPI Configuration
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# Logging Configuration
LOG_LEVEL=debug

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_HOST=localhost

```

**Frontend** - Crie o arquivo `frontend/.env`:
```env
# URL da API do backend (opcional, padrão: http://localhost:3000/api/chat)
VITE_API_URL=http://localhost:3000/api/chat
# Development/Production Environment
VITE_NODE_ENV=development
```

#### Backend

1. **Navegue para o diretório do backend:**
```bash
cd backend
```

2. **Crie o arquivo `.env`** com as variáveis de ambiente conforme mostrado acima

3. **Instale as dependências:**
```bash
npm install
```

4. **Execute o servidor:**
```bash
npm start
```

O backend estará disponível em: http://localhost:3000

#### Frontend

1. **Navegue para o diretório do frontend:**
```bash
cd frontend
```

2. **Crie o arquivo `.env`** com as variáveis de ambiente conforme mostrado acima

3. **Instale as dependências:**
```bash
npm install
```

4. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

O frontend estará disponível em: http://localhost:5173

## 🧪 Executando os Testes

### 📦 Opção 1: Testes em Docker (Recomendado)

#### Executando Testes em Container Fresco (Recomendado)

```bash
# Executar todos os testes em um novo container (inicia, testa, para)
docker-compose run --rm backend npm test

# Executar testes com cobertura de código em container fresco
docker-compose run --rm backend npm run test:coverage

# Executar teste manual de integração com PokéAPI em container fresco
docker-compose run --rm backend npm run test:manual

# Executar testes específicos
docker-compose run --rm backend npm test -- --testNamePattern="specific test name"
```

#### Executando Testes no Container em Execução (Alternativo)

```bash
# Executar todos os testes no container já em execução
docker-compose exec backend npm test

# Executar testes com cobertura de código no container em execução
docker-compose exec backend npm run test:coverage

# Executar testes em modo watch (re-executa ao salvar arquivos) - apenas em container em execução
docker-compose exec backend npm run test:watch

# Executar teste manual de integração com PokéAPI no container em execução
docker-compose exec backend npm run test:manual
```

#### 🚀 Por que Usar Containers Frescos para Testes?

**Vantagens dos containers frescos (`docker-compose run --rm`):**
- ✅ **Ambiente limpo**: Cada teste roda em um container completamente novo
- ✅ **Isolamento total**: Não há interferência de execuções anteriores
- ✅ **Ideal para CI/CD**: Comportamento consistente em pipelines
- ✅ **Limpeza automática**: Container é removido automaticamente após os testes
- ✅ **Recursos otimizados**: Não mantém containers desnecessários rodando

**Quando usar containers em execução (`docker-compose exec`):**
- 🔄 **Desenvolvimento ativo**: Quando você está desenvolvendo e testando frequentemente
- ⚡ **Modo watch**: Para execução contínua de testes durante desenvolvimento
- 🐛 **Debugging**: Para investigar problemas dentro do container

#### 🐳 Configuração Docker para Testes

Para otimizar o ambiente Docker para testes, você pode criar um Dockerfile específico para desenvolvimento que inclui as dependências de teste:

**backend/Dockerfile.dev** (opcional):
```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for testing)
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 9229

# Default command for development
CMD ["npm", "start"]
```

**Para usar o Dockerfile de desenvolvimento:**
```bash
# Build com Dockerfile de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Ou modificar o docker-compose.yaml para usar o Dockerfile.dev
```

#### 📊 Acessando Relatórios de Cobertura em Docker

**Para containers frescos (docker-compose run):**
```bash
# Executar testes com cobertura e manter relatórios
docker-compose run --rm -v $(pwd)/backend/coverage:/usr/src/app/coverage backend npm run test:coverage

# Os relatórios serão salvos automaticamente em ./backend/coverage/
# Abrir relatório no navegador
open backend/coverage/lcov-report/index.html
```

**Para containers em execução (docker-compose exec):**
```bash
# Após executar testes no container em execução
docker-compose exec backend npm run test:coverage

# Copiar relatório de cobertura do container para o host
docker cp pokechat-backend:/usr/src/app/coverage/lcov-report ./backend/coverage/

# Ou acessar diretamente no container
docker-compose exec backend sh
# Dentro do container: cat /usr/src/app/coverage/lcov-report/index.html
```

#### 🔧 Volume Mounting para Testes (Configuração Avançada)

Para melhor integração com testes, adicione volumes ao `docker-compose.yaml`:

```yaml
services:
  backend:
    build: ./backend
    container_name: pokechat-backend
    ports:
      - "3000:3000"
      - "9229:9229"
    volumes:
      - ./backend/logs:/usr/src/app/logs
      - ./backend/coverage:/usr/src/app/coverage  # Mount coverage reports
      - ./backend/tests:/usr/src/app/tests        # Mount tests for watch mode
    environment:
      - NODE_ENV=development
      - FRONTEND_URL=http://localhost:5173
      - PORT=3000
```

### 🖥️ Opção 2: Testes Locais

#### Backend

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

### 📈 Visualizar Relatórios de Cobertura

#### Em Docker (Container Fresco):
```bash
# Executar testes com cobertura em container fresco e salvar relatórios
docker-compose run --rm -v $(pwd)/backend/coverage:/usr/src/app/coverage backend npm run test:coverage

# Abrir relatório no navegador (relatórios salvos automaticamente)
open backend/coverage/lcov-report/index.html
```

#### Em Docker (Container em Execução):
```bash
# Após executar testes com cobertura no Docker
docker-compose exec backend npm run test:coverage

# Copiar relatório para o host
docker cp pokechat-backend:/usr/src/app/coverage/lcov-report ./backend/coverage/

# Abrir relatório no navegador
open backend/coverage/lcov-report/index.html
```

#### Localmente:
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

# Executar testes com cobertura
docker-compose exec backend npm run test:coverage

# Acessar shell do container para debugging
docker-compose exec backend sh

# Ver logs específicos do backend
docker-compose logs -f backend

# Reiniciar apenas o backend
docker-compose restart backend
```

### 🧪 Comandos Específicos para Testes em Docker

#### Containers Frescos (Recomendado para CI/CD)
```bash
# Executar todos os testes em container fresco (inicia, testa, para)
docker-compose run --rm backend npm test

# Executar testes com cobertura e salvar relatórios automaticamente
docker-compose run --rm -v $(pwd)/backend/coverage:/usr/src/app/coverage backend npm run test:coverage

# Executar teste manual de integração em container fresco
docker-compose run --rm backend npm run test:manual

# Executar testes específicos com padrão de nome
docker-compose run --rm backend npm test -- --testNamePattern="pokeapi"

# Executar apenas testes de um arquivo específico
docker-compose run --rm backend npm test tests/services/pokeapi.test.js

# Verificar se as dependências de teste estão instaladas
docker-compose run --rm backend npm list --depth=0
```

#### Containers em Execução (Para Desenvolvimento)
```bash
# Executar todos os testes no container em execução
docker-compose exec backend npm test

# Executar testes em modo watch (re-executa ao salvar arquivos)
docker-compose exec backend npm run test:watch

# Executar testes com cobertura no container em execução
docker-compose exec backend npm run test:coverage

# Copiar relatório de cobertura para o host
docker cp pokechat-backend:/usr/src/app/coverage ./backend/

# Executar teste manual de integração no container em execução
docker-compose exec backend npm run test:manual

# Acessar shell do container para debugging
docker-compose exec backend sh
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

/**
 * Configuração de Monitoramento
 * Configuração de monitoramento com Prometheus e express-status-monitor
 */

const client = require('prom-client');
const logger = require('./logger');

// Criar um Registry para registrar as métricas
const register = new client.Registry();

// Adicionar um rótulo padrão que é adicionado a todas as métricas
register.setDefaultLabels({
  app: 'pokechat-backend',
  version: '1.0.0'
});

// Habilitar a coleta de métricas padrão
client.collectDefaultMetrics({ register });

// ============================================
// MÉTRICAS PERSONALIZADAS
// ============================================

// Métricas de Sessão de Chat
const chatSessionsTotal = new client.Counter({
  name: 'chat_sessions_total',
  help: 'Total number of chat sessions created',
  labelNames: ['status']
});

const activeChatSessions = new client.Gauge({
  name: 'active_chat_sessions',
  help: 'Number of currently active chat sessions'
});

const chatMessagesTotal = new client.Counter({
  name: 'chat_messages_total',
  help: 'Total number of chat messages processed',
  labelNames: ['session_id', 'node_type']
});

// Métricas da API Pokémon
const pokemonApiRequestsTotal = new client.Counter({
  name: 'pokemon_api_requests_total',
  help: 'Total number of Pokemon API requests',
  labelNames: ['endpoint', 'status']
});

const pokemonApiRequestDuration = new client.Histogram({
  name: 'pokemon_api_request_duration_seconds',
  help: 'Duration of Pokemon API requests in seconds',
  labelNames: ['endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const pokemonCacheHits = new client.Counter({
  name: 'pokemon_cache_hits_total',
  help: 'Total number of Pokemon API cache hits'
});

const pokemonCacheMisses = new client.Counter({
  name: 'pokemon_cache_misses_total',
  help: 'Total number of Pokemon API cache misses'
});

// Métricas de Erro
const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'component']
});

// Métricas de Tempo de Resposta
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// ============================================
// REGISTRAR MÉTRICAS
// ============================================

register.registerMetric(chatSessionsTotal);
register.registerMetric(activeChatSessions);
register.registerMetric(chatMessagesTotal);
register.registerMetric(pokemonApiRequestsTotal);
register.registerMetric(pokemonApiRequestDuration);
register.registerMetric(pokemonCacheHits);
register.registerMetric(pokemonCacheMisses);
register.registerMetric(errorsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

// ============================================
// AUXILIARES DE MÉTRICAS
// ============================================

const metrics = {
  // Métricas de chat
  incrementChatSessions: (status = 'created') => {
    chatSessionsTotal.inc({ status });
    logger.debug(`Chat session metric incremented: ${status}`);
  },
  
  setActiveChatSessions: (count) => {
    activeChatSessions.set(count);
    logger.debug(`Active chat sessions metric set: ${count}`);
  },
  
  incrementChatMessages: (sessionId, nodeType) => {
    chatMessagesTotal.inc({ session_id: sessionId, node_type: nodeType });
    logger.debug(`Chat message metric incremented: ${sessionId} - ${nodeType}`);
  },
  
  // Métricas da API Pokémon
  incrementPokemonApiRequests: (endpoint, status = 'success') => {
    pokemonApiRequestsTotal.inc({ endpoint, status });
    logger.debug(`Pokemon API request metric incremented: ${endpoint} - ${status}`);
  },
  
  recordPokemonApiDuration: (endpoint, duration) => {
    pokemonApiRequestDuration.observe({ endpoint }, duration);
    logger.debug(`Pokemon API duration recorded: ${endpoint} - ${duration}s`);
  },
  
  incrementCacheHits: () => {
    pokemonCacheHits.inc();
    logger.debug('Pokemon cache hit metric incremented');
  },
  
  incrementCacheMisses: () => {
    pokemonCacheMisses.inc();
    logger.debug('Pokemon cache miss metric incremented');
  },
  
  // Métricas de erro
  incrementErrors: (type, component) => {
    errorsTotal.inc({ type, component });
    logger.warn(`Error metric incremented: ${type} - ${component}`);
  },
  
  // Métricas HTTP
  recordHttpRequest: (method, route, statusCode, duration) => {
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    logger.debug(`HTTP request metric recorded: ${method} ${route} - ${statusCode} - ${duration}s`);
  }
};

// ============================================
// CONFIGURAÇÃO DO EXPRESS STATUS MONITOR
// ============================================

const statusMonitorConfig = {
  title: 'PokéChat Backend Monitor',
  path: '/status',
  spans: [
    {
      interval: 1,     // Every second
      retention: 60    // Keep 60 data points
    },
    {
      interval: 5,     // Every 5 seconds
      retention: 60    // Keep 60 data points
    },
    {
      interval: 15,    // Every 15 seconds
      retention: 60    // Keep 60 data points
    }
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    eventLoop: true,
    heap: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: [
    {
      protocol: 'http',
      host: process.env.MONITORING_HOST || 'localhost',
      path: '/health',
      port: process.env.PORT || 3000
    }
  ],
  ignoreStartsWith: '/status'
};

module.exports = {
  register,
  metrics,
  statusMonitorConfig,
  client
};

/**
 * Configuração da aplicação Express do PokéChat
 */

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const logger = require('./config/logger');
const { register, metrics, statusMonitorConfig } = require('./config/monitoring');
const { HTTP_STATUS_CODES, ERROR_MESSAGES } = require('./constants');

const app = express();

// ============================================
// CONFIGURAÇÃO CORS
// ============================================

// Middleware CORS - permite requisições do frontend
app.use(cors({
  origin: true, // Permite todas as origens em desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cabeçalhos CORS adicionais para todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Tratar requisições preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(HTTP_STATUS_CODES.OK);
  } else {
    next();
  }
});

// ============================================
// MIDDLEWARE
// ============================================

// Middleware para parse de JSON
app.use(express.json());

// ============================================
// MIDDLEWARE DE MONITORAMENTO
// ============================================

// Express Status Monitor
const expressStatusMonitor = require('express-status-monitor')(statusMonitorConfig);
app.use(expressStatusMonitor);
logger.info('Express Status Monitor configurado');

// Middleware de tempo de requisição
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    metrics.recordHttpRequest(req.method, route, res.statusCode, duration);
  });
  
  next();
});
logger.info('Middleware de monitoramento de requisições HTTP configurado');

// ============================================
// ROUTES
// ============================================

// Rota de Verificação de Saúde
app.get('/health', (req, res) => {
  logger.http(`Health check requested from ${req.ip}`);
  res.status(HTTP_STATUS_CODES.OK).json({ status: 'ok', timestamp: new Date() });
});

// ============================================
// ENDPOINTS DE MONITORAMENTO
// ============================================

// Endpoint de métricas Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metricsData = await register.metrics();
    res.end(metricsData);
    logger.http('Métricas Prometheus solicitadas');
  } catch (error) {
    logger.error('Falha ao gerar métricas', { error: error.message });
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.METRICS_GENERATION_FAILED });
  }
});

// Rotas do Chatbot
app.use('/api/chat', chatRoutes);

// Rotas de Monitoramento
app.use('/api/monitoring', monitoringRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Tratamento de rotas não encontradas
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.ROUTE_NOT_FOUND });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { 
    stack: err.stack, 
    url: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  });
  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
});

module.exports = app;

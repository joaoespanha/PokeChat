/**
 * Ponto de entrada do servidor da API do PokéChat
 */

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const logger = require('./config/logger');
const { register, metrics, statusMonitorConfig } = require('./config/monitoring');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - permite requisições do frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend Vite
  credentials: true
}));

// Middleware para parse de JSON
app.use(express.json());

// ============================================
// MONITORING MIDDLEWARE
// ============================================

// Express Status Monitor
const expressStatusMonitor = require('express-status-monitor')(statusMonitorConfig);
app.use(expressStatusMonitor);
logger.info('Express Status Monitor configured');

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    metrics.recordHttpRequest(req.method, route, res.statusCode, duration);
  });
  
  next();
});
logger.info('HTTP request monitoring middleware configured');

// Rota de Health Check
app.get('/health', (req, res) => {
  logger.http(`Health check requested from ${req.ip}`);
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// ============================================
// MONITORING ENDPOINTS
// ============================================

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metricsData = await register.metrics();
    res.end(metricsData);
    logger.http('Prometheus metrics requested');
  } catch (error) {
    logger.error('Failed to generate metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

// Rotas do Chatbot
app.use('/api/chat', chatRoutes);

// Rotas de Monitoramento
app.use('/api/monitoring', monitoringRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { 
    stack: err.stack, 
    url: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  });
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor do PokéChat iniciado na porta ${PORT}`);
  logger.info(`Acesse http://localhost:${PORT}`);
  logger.info(`Monitoramento: http://localhost:${PORT}/status`);
  logger.info(`Métricas Prometheus: http://localhost:${PORT}/metrics`);
  logger.info(`Estatísticas JSON: http://localhost:${PORT}/api/monitoring/stats`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
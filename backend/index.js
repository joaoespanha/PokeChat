/**
 * Ponto de entrada do servidor da API do PokéChat
 * Entry point for the PokéChat API server
 */


require('dotenv').config();

const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor do PokéChat iniciado na porta ${PORT}`);
  logger.info(`Acesse http://localhost:${PORT}`);
  logger.info(`Monitoramento: http://localhost:${PORT}/status`);
  logger.info(`Métricas Prometheus: http://localhost:${PORT}/metrics`);
  logger.info(`Estatísticas JSON: http://localhost:${PORT}/api/monitoring/stats`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
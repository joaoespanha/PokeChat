/**
 * Monitoring Routes
 * Rotas para monitoramento e métricas do sistema
 */

const express = require('express');
const { register, metrics } = require('../config/monitoring');
const logger = require('../config/logger');

const router = express.Router();

/**
 * Endpoint para obter métricas em formato JSON
 */
router.get('/metrics/json', async (req, res) => {
  try {
    const metricsData = await register.getMetricsAsJSON();
    res.json({
      timestamp: new Date().toISOString(),
      metrics: metricsData
    });
    logger.http('JSON metrics requested');
  } catch (error) {
    logger.error('Failed to get JSON metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * Endpoint para obter estatísticas do sistema
 */
router.get('/stats', async (req, res) => {
  try {
    const metricsData = await register.getMetricsAsJSON();
    
    // Extrair métricas específicas
    const chatSessions = metricsData.find(m => m.name === 'chat_sessions_total');
    const activeSessions = metricsData.find(m => m.name === 'active_chat_sessions');
    const chatMessages = metricsData.find(m => m.name === 'chat_messages_total');
    const pokemonApiRequests = metricsData.find(m => m.name === 'pokemon_api_requests_total');
    const errors = metricsData.find(m => m.name === 'errors_total');
    const httpRequests = metricsData.find(m => m.name === 'http_requests_total');
    
    const stats = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      chat: {
        totalSessions: chatSessions?.values?.reduce((sum, v) => sum + v.value, 0) || 0,
        activeSessions: activeSessions?.values?.[0]?.value || 0,
        totalMessages: chatMessages?.values?.reduce((sum, v) => sum + v.value, 0) || 0
      },
      pokemonApi: {
        totalRequests: pokemonApiRequests?.values?.reduce((sum, v) => sum + v.value, 0) || 0,
        successRate: calculateSuccessRate(pokemonApiRequests?.values || [])
      },
      errors: {
        total: errors?.values?.reduce((sum, v) => sum + v.value, 0) || 0,
        byType: errors?.values?.reduce((acc, v) => {
          acc[v.labels.type] = (acc[v.labels.type] || 0) + v.value;
          return acc;
        }, {}) || {}
      },
      http: {
        totalRequests: httpRequests?.values?.reduce((sum, v) => sum + v.value, 0) || 0,
        statusCodes: httpRequests?.values?.reduce((acc, v) => {
          acc[v.labels.status_code] = (acc[v.labels.status_code] || 0) + v.value;
          return acc;
        }, {}) || {}
      }
    };
    
    res.json(stats);
    logger.http('System stats requested');
  } catch (error) {
    logger.error('Failed to get system stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

/**
 * Endpoint para obter health check detalhado
 */
router.get('/health/detailed', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform,
    pid: process.pid
  };
  
  res.json(health);
  logger.http('Detailed health check requested');
});

/**
 * Helper function para calcular taxa de sucesso
 */
function calculateSuccessRate(values) {
  if (!values || values.length === 0) return 0;
  
  const success = values.find(v => v.labels.status === 'success')?.value || 0;
  const total = values.reduce((sum, v) => sum + v.value, 0);
  
  return total > 0 ? (success / total) * 100 : 0;
}

module.exports = router;

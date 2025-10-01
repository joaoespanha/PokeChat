/**
 * Ponto de entrada do servidor da API do PokéChat
 */

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - permite requisições do frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend Vite
  credentials: true
}));

// Middleware para parse de JSON
app.use(express.json());

// Rota de Health Check
app.get('/health', (req, res) => {
  logger.http(`Health check requested from ${req.ip}`);
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Rotas do Chatbot
app.use('/api/chat', chatRoutes);

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
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
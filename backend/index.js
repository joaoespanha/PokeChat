/**
 * Ponto de entrada do servidor da API do PokéChat
 */

const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

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
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Rotas do Chatbot
app.use('/api/chat', chatRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor do PokéChat rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT}`);
});
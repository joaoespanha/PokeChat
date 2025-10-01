/**
 * Definição das rotas da API do Chatbot
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/start - Iniciar uma nova sessão
router.post('/start', chatController.startSession);

// POST /api/chat/message - Enviar uma mensagem para a sessão
router.post('/message', chatController.postMessage);

// GET /api/chat/history/:sessionId - Obter histórico da sessão
router.get('/history/:sessionId', chatController.getHistory);

// GET /api/chat/stats/:sessionId - Obter estatísticas da sessão
router.get('/stats/:sessionId', chatController.getStats);

// POST /api/chat/reset/:sessionId - Resetar a conversa
router.post('/reset/:sessionId', chatController.resetSession);

// DELETE /api/chat/session/:sessionId - Encerrar uma sessão
router.delete('/session/:sessionId', chatController.deleteSession);

// GET /api/chat/sessions - Listar todas as sessões ativas
router.get('/sessions', chatController.listSessions);

module.exports = router;
/**
 * Controller para gerenciar as sessões e interações do Chatbot
 */

const PokemonChatbot = require('../graph/chatGraph');

// Armazena as instâncias ativas do chatbot em memória
// Em um ambiente de produção, considere usar um banco de dados como Redis
const activeSessions = new Map();

/**
 * Cria uma nova sessão de chatbot
 */
const startSession = async (req, res) => {
  try {
    const chatbot = new PokemonChatbot();
    const welcomeMessage = await chatbot.start();
    const sessionId = chatbot.currentState.sessionId;

    activeSessions.set(sessionId, chatbot);

    res.status(201).json({
      sessionId,
      message: welcomeMessage
    });
  } catch (error) {
    console.error('[ERROR] startSession:', error);
    res.status(500).json({ error: 'Não foi possível iniciar a sessão.' });
  }
};

/**
 * Envia uma mensagem para uma sessão existente
 */
const postMessage = async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId e message são obrigatórios.' });
  }

  const chatbot = activeSessions.get(sessionId);
  if (!chatbot) {
    return res.status(404).json({ error: 'Sessão não encontrada.' });
  }

  try {
    const response = await chatbot.processMessage(message);
    res.status(200).json({ response });
  } catch (error) {
    console.error('[ERROR] postMessage:', error);
    res.status(500).json({ error: 'Erro ao processar a mensagem.' });
  }
};

/**
 * Obtém o histórico de mensagens de uma sessão
 */
const getHistory = (req, res) => {
  const { sessionId } = req.params;
  const chatbot = activeSessions.get(sessionId);

  if (!chatbot) {
    return res.status(404).json({ error: 'Sessão não encontrada.' });
  }

  res.status(200).json(chatbot.getMessageHistory());
};

/**
 * Obtém as estatísticas de uma sessão
 */
const getStats = (req, res) => {
  const { sessionId } = req.params;
  const chatbot = activeSessions.get(sessionId);

  if (!chatbot) {
    return res.status(404).json({ error: 'Sessão não encontrada.' });
  }

  res.status(200).json(chatbot.getSessionStats());
};

/**
 * Reseta uma sessão, mantendo o mesmo sessionId
 */
const resetSession = async (req, res) => {
    const { sessionId } = req.params;
    const chatbot = activeSessions.get(sessionId);

    if (!chatbot) {
        return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    try {
        const welcomeMessage = await chatbot.reset();
        res.status(200).json({
            sessionId,
            message: welcomeMessage
        });
    } catch (error) {
        console.error('[ERROR] resetSession:', error);
        res.status(500).json({ error: 'Não foi possível resetar a sessão.' });
    }
};


/**
 * Encerra e remove uma sessão
 */
const deleteSession = (req, res) => {
  const { sessionId } = req.params;

  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    res.status(200).json({ message: 'Sessão encerrada com sucesso.' });
  } else {
    res.status(404).json({ error: 'Sessão não encontrada.' });
  }
};

/**
 * Lista todas as sessões ativas
 */
const listSessions = (req, res) => {
  const sessions = Array.from(activeSessions.keys()).map(sessionId => {
    const bot = activeSessions.get(sessionId);
    return bot.getSessionStats();
  });
  res.status(200).json({ sessions });
};


module.exports = {
  startSession,
  postMessage,
  getHistory,
  getStats,
  resetSession,
  deleteSession,
  listSessions
};
/**
 * Controller para gerenciar as sessões e interações do Chatbot
 */

const PokemonChatbot = require('../graph/chatGraph');
const logger = require('../config/logger');
const { metrics } = require('../config/monitoring');
const { HTTP_STATUS_CODES, ERROR_MESSAGES } = require('../constants');

// Armazena as instâncias ativas do chatbot em memória
// Em um ambiente de produção, considere usar um banco de dados como Redis
const activeSessions = new Map();

/**
 * Cria uma nova sessão de chatbot
 */
const startSession = async (req, res) => {
  try {
    logger.info('Starting new chat session', { ip: req.ip });
    
    const chatbot = new PokemonChatbot();
    const welcomeMessage = await chatbot.start();
    const sessionId = chatbot.currentState.sessionId;
    const currentState = chatbot.getCurrentState();

    activeSessions.set(sessionId, chatbot);
    
    // Update monitoring metrics
    metrics.incrementChatSessions('created');
    metrics.setActiveChatSessions(activeSessions.size);
    
    logger.info('Chat session created successfully', { 
      sessionId, 
      currentNode: currentState.currentNode,
      ip: req.ip 
    });

    res.status(HTTP_STATUS_CODES.CREATED).json({
      sessionId,
      message: welcomeMessage,
      currentState: {
        node: currentState.currentNode,
        waitingFor: currentState.waitingFor
      }
    });
  } catch (error) {
    // Update monitoring metrics
    metrics.incrementChatSessions('error');
    metrics.incrementErrors('session_creation', 'chat_controller');
    
    logger.error('Failed to start chat session', { 
      error: error.message, 
      stack: error.stack,
      ip: req.ip 
    });
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.SESSION_CREATION_FAILED });
  }
};

/**
 * Envia uma mensagem para uma sessão existente
 */
const postMessage = async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    logger.warn('Invalid message request - missing sessionId or message', { 
      sessionId: !!sessionId, 
      message: !!message,
      ip: req.ip 
    });
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ error: ERROR_MESSAGES.INVALID_MESSAGE_REQUEST });
  }

  const chatbot = activeSessions.get(sessionId);
  if (!chatbot) {
    logger.warn('Message sent to non-existent session', { sessionId, ip: req.ip });
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
  }

  try {
    logger.info('Processing chat message', { 
      sessionId, 
      messageLength: message.length,
      ip: req.ip 
    });
    
    const response = await chatbot.processMessage(message);
    const currentState = chatbot.getCurrentState();
    
    // Update monitoring metrics
    metrics.incrementChatMessages(sessionId, currentState.currentNode);
    
    logger.info('Message processed successfully', { 
      sessionId, 
      currentNode: currentState.currentNode,
      responseLength: response.length,
      ip: req.ip 
    });
    
    res.status(HTTP_STATUS_CODES.OK).json({ 
      response,
      currentState: {
        node: currentState.currentNode,
        waitingFor: currentState.waitingFor
      }
    });
  } catch (error) {
    // Update monitoring metrics
    metrics.incrementErrors('message_processing', 'chat_controller');
    
    logger.error('Failed to process message', { 
      sessionId,
      error: error.message, 
      stack: error.stack,
      ip: req.ip 
    });
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.MESSAGE_PROCESSING_FAILED });
  }
};

/**
 * Obtém o histórico de mensagens de uma sessão
 */
const getHistory = (req, res) => {
  const { sessionId } = req.params;
  const chatbot = activeSessions.get(sessionId);

  if (!chatbot) {
    logger.warn('History requested for non-existent session', { sessionId, ip: req.ip });
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
  }

  logger.http('Chat history requested', { sessionId, ip: req.ip });
  res.status(HTTP_STATUS_CODES.OK).json(chatbot.getMessageHistory());
};

/**
 * Obtém as estatísticas de uma sessão
 */
const getStats = (req, res) => {
  const { sessionId } = req.params;
  const chatbot = activeSessions.get(sessionId);

  if (!chatbot) {
    logger.warn('Stats requested for non-existent session', { sessionId, ip: req.ip });
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
  }

  logger.http('Session stats requested', { sessionId, ip: req.ip });
  res.status(HTTP_STATUS_CODES.OK).json(chatbot.getSessionStats());
};

/**
 * Reseta uma sessão, mantendo o mesmo sessionId
 */
const resetSession = async (req, res) => {
    const { sessionId } = req.params;
    const chatbot = activeSessions.get(sessionId);

    if (!chatbot) {
        logger.warn('Reset requested for non-existent session', { sessionId, ip: req.ip });
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
    }

    try {
        logger.info('Resetting chat session', { sessionId, ip: req.ip });
        const welcomeMessage = await chatbot.reset();
        
        logger.info('Session reset successfully', { sessionId, ip: req.ip });
        res.status(HTTP_STATUS_CODES.OK).json({
            sessionId,
            message: welcomeMessage
        });
    } catch (error) {
        logger.error('Failed to reset session', { 
            sessionId,
            error: error.message, 
            stack: error.stack,
            ip: req.ip 
        });
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.SESSION_RESET_FAILED });
    }
};


/**
 * Encerra e remove uma sessão
 */
const deleteSession = (req, res) => {
  const { sessionId } = req.params;

  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    
    // Update monitoring metrics
    metrics.incrementChatSessions('deleted');
    metrics.setActiveChatSessions(activeSessions.size);
    
    logger.info('Session deleted successfully', { sessionId, ip: req.ip });
    res.status(HTTP_STATUS_CODES.OK).json({ message: ERROR_MESSAGES.SESSION_DELETED });
  } else {
    logger.warn('Delete requested for non-existent session', { sessionId, ip: req.ip });
    res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
  }
};

/**
 * Lista todas as sessões ativas
 */
const listSessions = (req, res) => {
  logger.http('Active sessions list requested', { ip: req.ip });
  const sessions = Array.from(activeSessions.keys()).map(sessionId => {
    const bot = activeSessions.get(sessionId);
    return bot.getSessionStats();
  });
  res.status(HTTP_STATUS_CODES.OK).json({ sessions });
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
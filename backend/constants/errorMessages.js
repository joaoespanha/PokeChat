/**
 * Error Messages Constants
 * Centralized error messages for DRY principles
 */

const ERROR_MESSAGES = {
  // Session related errors
  SESSION_NOT_FOUND: 'Sessão não encontrada.',
  SESSION_CREATION_FAILED: 'Não foi possível iniciar a sessão.',
  SESSION_RESET_FAILED: 'Não foi possível resetar a sessão.',
  SESSION_DELETED: 'Sessão encerrada com sucesso.',

  // Message related errors
  MESSAGE_PROCESSING_FAILED: 'Erro ao processar a mensagem.',
  INVALID_MESSAGE_REQUEST: 'sessionId e message são obrigatórios.',

  // General errors
  ROUTE_NOT_FOUND: 'Rota não encontrada',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro interno no servidor',
  METRICS_GENERATION_FAILED: 'Failed to generate metrics',

  // API related errors
  POKEMON_NOT_FOUND: 'Pokémon não encontrado',
  INVALID_POKEMON_ID: 'ID do Pokémon inválido',
  API_REQUEST_FAILED: 'Falha na requisição à API'
};

module.exports = ERROR_MESSAGES;

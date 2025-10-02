/**
 * Constantes de Mensagens de Erro
 * Mensagens de erro centralizadas para princípios DRY
 */

const ERROR_MESSAGES = {
  // Erros relacionados à sessão
  SESSION_NOT_FOUND: 'Sessão não encontrada.',
  SESSION_CREATION_FAILED: 'Não foi possível iniciar a sessão.',
  SESSION_RESET_FAILED: 'Não foi possível resetar a sessão.',
  SESSION_DELETED: 'Sessão encerrada com sucesso.',

  // Erros relacionados à mensagem
  MESSAGE_PROCESSING_FAILED: 'Erro ao processar a mensagem.',
  INVALID_MESSAGE_REQUEST: 'sessionId e message são obrigatórios.',

  // Erros gerais
  ROUTE_NOT_FOUND: 'Rota não encontrada',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro interno no servidor',
  METRICS_GENERATION_FAILED: 'Falha ao gerar métricas',

  // Erros relacionados à API
  POKEMON_NOT_FOUND: 'Pokémon não encontrado',
  INVALID_POKEMON_ID: 'ID do Pokémon inválido',
  API_REQUEST_FAILED: 'Falha na requisição à API'
};

module.exports = ERROR_MESSAGES;

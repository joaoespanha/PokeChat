/**
 * State Schema Simplificado para o Chatbot Pokémon
 * Mantém o necessário, remove o desnecessário
 */

// ============================================
// CONSTANTES
// ============================================

const NODE_TYPES = Object.freeze({
    START: 'start',
    MENU: 'menu',
    SEARCH: 'search',
    COMPARE: 'compare',
    EVOLUTION: 'evolution',
    TYPE_SEARCH: 'type_search',
    END: 'end'
  });
  
  const MESSAGE_ROLES = Object.freeze({
    USER: 'user',
    ASSISTANT: 'assistant'
  });
  
  const WAITING_FOR = Object.freeze({
    MENU_CHOICE: 'menu_choice',
    POKEMON_INPUT: 'pokemon_input',
    NEXT_ACTION: 'next_action',
    NONE: 'none'
  });
  
  // ============================================
  // ESTADO INICIAL
  // ============================================
  
  /**
   * Cria o estado inicial do chatbot
   */
  function createInitialState(sessionId = null) {
    return {
      // Identificação
      sessionId: sessionId || generateSessionId(),
      
      // Mensagens
      messages: [],
      
      // Input atual
      userInput: '',
      
      // Nó atual
      currentNode: NODE_TYPES.START,
      
      // Contexto
      context: {
        pokemonData: null,
        comparisonData: [],
        evolutionChain: null,
        waitingFor: WAITING_FOR.MENU_CHOICE,
        lastError: null
      },
      
      // Metadados
      metadata: {
        startTime: Date.now(),
        interactionCount: 0
      }
    };
  }
  
  /**
   * Gera ID único de sessão
   */
  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ============================================
  // HELPERS (Utilitários)
  // ============================================
  
  /**
   * Adiciona mensagem ao histórico
   */
  function addMessage(state, role, content, data = null) {
    return {
      ...state,
      messages: [
        ...state.messages,
        {
          role,
          content,
          data,
          timestamp: Date.now()
        }
      ]
    };
  }
  
  /**
   * Atualiza contexto
   */
  function updateContext(state, updates) {
    return {
      ...state,
      context: {
        ...state.context,
        ...updates
      }
    };
  }
  
  /**
   * Incrementa contador de interações
   */
  function incrementInteraction(state) {
    return {
      ...state,
      metadata: {
        ...state.metadata,
        interactionCount: state.metadata.interactionCount + 1
      }
    };
  }
  
  /**
   * Atualiza input do usuário
   */
  function setUserInput(state, input) {
    return {
      ...state,
      userInput: input
    };
  }
  
  /**
   * Transiciona para novo nó
   */
  function transitionTo(state, newNode) {
    return {
      ...state,
      currentNode: newNode
    };
  }
  
  /**
   * Define erro
   */
  function setError(state, error) {
    return updateContext(state, { lastError: error });
  }
  
  /**
   * Limpa erro
   */
  function clearError(state) {
    return updateContext(state, { lastError: null });
  }
  
  /**
   * Calcula duração da sessão
   */
  function getSessionDuration(state) {
    return Date.now() - state.metadata.startTime;
  }
  
  /**
   * Obtém estatísticas
   */
  function getStats(state) {
    return {
      sessionId: state.sessionId,
      duration: getSessionDuration(state),
      interactions: state.metadata.interactionCount,
      messages: state.messages.length,
      currentNode: state.currentNode
    };
  }
  
  /**
   * Valida estado
   */
  function validateState(state) {
    if (!state.sessionId) {
      throw new Error('Session ID is required');
    }
    if (!Object.values(NODE_TYPES).includes(state.currentNode)) {
      throw new Error(`Invalid node: ${state.currentNode}`);
    }
    return true;
  }
  
  // ============================================
  // EXPORTS
  // ============================================
  
  module.exports = {
    // Factory
    createInitialState,
    
    // Constantes
    NODE_TYPES,
    MESSAGE_ROLES,
    WAITING_FOR,
    
    // Helpers
    addMessage,
    updateContext,
    incrementInteraction,
    setUserInput,
    transitionTo,
    setError,
    clearError,
    getSessionDuration,
    getStats,
    validateState
  };
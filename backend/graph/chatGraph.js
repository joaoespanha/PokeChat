/**
 * Configuração do Grafo LangGraph - Pokémon Chatbot
 * Define a máquina de estados e as transições condicionais
 */

const { StateGraph, END } = require("@langchain/langgraph");
const { nodes } = require('./nodes');
const { createInitialState, NODE_TYPES } = require('./stateSchema');
const logger = require('../config/logger');
const { metrics } = require('../config/monitoring');

/**
 * Classe principal do Chatbot com LangGraph
 */
class PokemonChatbot {
  constructor() {
    this.graph = null;
    this.compiledGraph = null;
    this.currentState = createInitialState();
    this.setupGraph();
  }

  /**
   * Configura o grafo com todos os nós e transições
   */
  setupGraph() {
    logger.info('Setting up chatbot graph...');

    // Criar o grafo com estado inicial
    this.graph = new StateGraph({
      channels: createInitialState()
    });

    // ============================================
    // ADICIONAR NÓS
    // ============================================
    this.graph.addNode(NODE_TYPES.START, nodes.start);
    this.graph.addNode(NODE_TYPES.MENU, nodes.menu);
    this.graph.addNode(NODE_TYPES.SEARCH, nodes.search);
    this.graph.addNode(NODE_TYPES.COMPARE, nodes.compare);
    this.graph.addNode(NODE_TYPES.EVOLUTION, nodes.evolution);
    this.graph.addNode(NODE_TYPES.TYPE_SEARCH, nodes.type_search);
    this.graph.addNode(NODE_TYPES.END, nodes.end);

    // ============================================
    // DEFINIR TRANSIÇÕES
    // ============================================

    // START → MENU (sempre)
    this.graph.addEdge(NODE_TYPES.START, NODE_TYPES.MENU);

    // MENU → Transições condicionais baseadas na escolha
    this.graph.addConditionalEdges(
      NODE_TYPES.MENU,
      this.routeFromMenu.bind(this),
      {
        [NODE_TYPES.SEARCH]: NODE_TYPES.SEARCH,
        [NODE_TYPES.COMPARE]: NODE_TYPES.COMPARE,
        [NODE_TYPES.EVOLUTION]: NODE_TYPES.EVOLUTION,
        [NODE_TYPES.TYPE_SEARCH]: NODE_TYPES.TYPE_SEARCH,
        [NODE_TYPES.MENU]: NODE_TYPES.MENU,
        [NODE_TYPES.END]: NODE_TYPES.END,
        __end__: END
      }
    );

    // SEARCH → Transições condicionais
    this.graph.addConditionalEdges(
      NODE_TYPES.SEARCH,
      this.routeFromSearch.bind(this),
      {
        [NODE_TYPES.SEARCH]: NODE_TYPES.SEARCH,
        [NODE_TYPES.EVOLUTION]: NODE_TYPES.EVOLUTION,
        [NODE_TYPES.MENU]: NODE_TYPES.MENU,
        [NODE_TYPES.END]: NODE_TYPES.END,
        __end__: END
      }
    );

    // COMPARE → Transições condicionais
    this.graph.addConditionalEdges(
      NODE_TYPES.COMPARE,
      this.routeFromCompare.bind(this),
      {
        [NODE_TYPES.COMPARE]: NODE_TYPES.COMPARE,
        [NODE_TYPES.MENU]: NODE_TYPES.MENU,
        [NODE_TYPES.END]: NODE_TYPES.END,
        __end__: END
      }
    );

    // EVOLUTION → Transições condicionais
    this.graph.addConditionalEdges(
      NODE_TYPES.EVOLUTION,
      this.routeFromEvolution.bind(this),
      {
        [NODE_TYPES.EVOLUTION]: NODE_TYPES.EVOLUTION,
        [NODE_TYPES.SEARCH]: NODE_TYPES.SEARCH,
        [NODE_TYPES.MENU]: NODE_TYPES.MENU,
        [NODE_TYPES.END]: NODE_TYPES.END,
        __end__: END
      }
    );

    // TYPE_SEARCH → Transições condicionais
    this.graph.addConditionalEdges(
      NODE_TYPES.TYPE_SEARCH,
      this.routeFromTypeSearch.bind(this),
      {
        [NODE_TYPES.TYPE_SEARCH]: NODE_TYPES.TYPE_SEARCH,
        [NODE_TYPES.SEARCH]: NODE_TYPES.SEARCH,
        [NODE_TYPES.MENU]: NODE_TYPES.MENU,
        [NODE_TYPES.END]: NODE_TYPES.END,
        __end__: END
      }
    );

    // END → Conectar ao END especial do LangGraph
    this.graph.addEdge(NODE_TYPES.END, END);

    // Definir ponto de entrada
    this.graph.setEntryPoint(NODE_TYPES.START);

    // Compilar o grafo
    this.compiledGraph = this.graph.compile();
    logger.info('Chatbot graph compiled successfully');
  }

  // ============================================
  // FUNÇÕES DE ROTEAMENTO (Decidem próximo nó)
  // ============================================

  routeFromMenu(state) {
    const nextNode = state.currentNode;
    if ((!state.userInput || !state.userInput.trim()) && nextNode === NODE_TYPES.MENU) {
      return '__end__';
    }
    return nextNode;
  }

  routeFromSearch(state) {
    const input = state.userInput.toLowerCase().trim();
    if (!input) return '__end__';
    if (input.includes('menu')) return NODE_TYPES.MENU;
    if (input.includes('evol')) return NODE_TYPES.EVOLUTION;
    if (input.includes('sair') || input.includes('tchau')) return NODE_TYPES.END;
    return NODE_TYPES.SEARCH;
  }

  routeFromCompare(state) {
    const input = state.userInput.toLowerCase().trim();
    if (!input) return '__end__';
    if (input.includes('menu')) return NODE_TYPES.MENU;
    if (input.includes('sair') || input.includes('tchau')) return NODE_TYPES.END;
    return NODE_TYPES.COMPARE;
  }

  routeFromEvolution(state) {
    const input = state.userInput.toLowerCase().trim();
    if (!input) return '__end__';
    if (input.includes('menu')) return NODE_TYPES.MENU;
    if (input.includes('sair') || input.includes('tchau')) return NODE_TYPES.END;
    if (input.length > 2 && !input.includes('evol')) return NODE_TYPES.SEARCH;
    return NODE_TYPES.EVOLUTION;
  }

  routeFromTypeSearch(state) {
    const input = state.userInput.toLowerCase().trim();
    if (!input) return '__end__';
    if (input.includes('menu')) return NODE_TYPES.MENU;
    if (input.includes('sair') || input.includes('tchau')) return NODE_TYPES.END;
    if (input.length > 3 && !this.isPokemonType(input)) return NODE_TYPES.SEARCH;
    return NODE_TYPES.TYPE_SEARCH;
  }
  
  isPokemonType(input) {
    const validTypes = [
      'normal', 'fire', 'water', 'grass', 'electric', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic',
      'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];
    return validTypes.includes(input.toLowerCase());
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  async start() {
    const sessionId = this.generateSessionId();
    logger.info('Starting new chat conversation', { sessionId });
    this.currentState = createInitialState(sessionId);
    this.currentState = await this.compiledGraph.invoke(this.currentState);
    logger.info('Chat conversation started successfully', { sessionId });
    return this.getLastMessage();
  }

  async processMessage(userInput) {
    logger.debug(`Processing user message: "${userInput}"`, {
      sessionId: this.currentState.sessionId
    });

    if (!userInput || userInput.trim() === '') {
      return {
        role: 'assistant',
        content: '❓ Por favor, digite alguma coisa!',
        timestamp: Date.now()
      };
    }

    this.currentState = {
      ...this.currentState,
      userInput: userInput.trim()
    };

    try {
        logger.debug(`Processing message in node: ${this.currentState.currentNode}`, {
          sessionId: this.currentState.sessionId,
          messageLength: userInput.length
        });
        
        // This logic correctly invokes the specific node for the current state,
        // which is a reliable pattern for this library version.
        const currentNodeName = this.currentState.currentNode;
        if (nodes[currentNodeName]) {
            this.currentState = await nodes[currentNodeName](this.currentState);
        } else {
            this.currentState = await this.compiledGraph.invoke(this.currentState);
        }
        
        logger.debug(`Message processed successfully`, {
          sessionId: this.currentState.sessionId,
          newNode: this.currentState.currentNode
        });
        
        return this.getLastMessage();
    } catch (error) {
      // Update monitoring metrics
      metrics.incrementErrors('message_processing', 'chat_graph');
      
      logger.error('Error processing chat message', {
        sessionId: this.currentState.sessionId,
        currentNode: this.currentState.currentNode,
        error: error.message,
        stack: error.stack
      });
      return {
        role: 'assistant',
        content: `❌ Erro ao processar mensagem: ${error.message}\n\nTente "menu" para voltar ao menu principal.`,
        timestamp: Date.now()
      };
    }
  }

  getLastMessage() {
    const messages = this.currentState.messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  getMessageHistory() {
    return this.currentState.messages;
  }

  getCurrentState() {
    return {
      currentNode: this.currentState.currentNode,
      waitingFor: this.currentState.context.waitingFor,
      interactionCount: this.currentState.metadata.interactionCount,
      sessionDuration: Date.now() - this.currentState.metadata.startTime
    };
  }

  getSessionStats() {
    return {
      sessionId: this.currentState.sessionId,
      startTime: this.currentState.metadata.startTime,
      interactionCount: this.currentState.metadata.interactionCount,
      currentNode: this.currentState.currentNode,
      totalMessages: this.currentState.messages.length
    };
  }

  async reset() {
    logger.info('Resetting chat conversation', { 
      sessionId: this.currentState.sessionId 
    });
    return this.start();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  visualizeGraph() {
    // Graph visualization removed to reduce test output noise
  }
}

module.exports = PokemonChatbot;
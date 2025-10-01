/**
 * Configuração do Grafo LangGraph - Pokémon Chatbot
 * Define a máquina de estados e as transições condicionais
 */

const { StateGraph, END } = require("@langchain/langgraph");
const { nodes } = require('./nodes');
const { createInitialState, NODE_TYPES } = require('./stateSchema');

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
    console.log('[GRAPH] Configurando grafo do chatbot...');

    // Criar o grafo com estado inicial
    this.graph = new StateGraph({
      channels: createInitialState()
    });

    // ============================================
    // ADICIONAR NÓS
    // ============================================
    this.graph.addNode("start", nodes.start);
    this.graph.addNode("menu", nodes.menu);
    this.graph.addNode("search", nodes.search);
    this.graph.addNode("compare", nodes.compare);
    this.graph.addNode("evolution", nodes.evolution);
    this.graph.addNode("type_search", nodes.type_search);
    this.graph.addNode("end", nodes.end);

    // ============================================
    // DEFINIR TRANSIÇÕES
    // ============================================

    // START → MENU (sempre)
    this.graph.addEdge("start", "menu");

    // MENU → Transições condicionais baseadas na escolha
    this.graph.addConditionalEdges(
      "menu",
      this.routeFromMenu.bind(this),
      {
        search: "search",
        compare: "compare",
        evolution: "evolution",
        type_search: "type_search",
        menu: "menu",
        end: "end",  // Mapeia para o nó "end"
        __end__: END  // Mapeia para END especial (termina sem executar nó)
      }
    );

    // SEARCH → Transições condicionais
    this.graph.addConditionalEdges(
      "search",
      this.routeFromSearch.bind(this),
      {
        search: "search",
        evolution: "evolution",
        menu: "menu",
        end: "end",
        __end__: END
      }
    );

    // COMPARE → Transições condicionais
    this.graph.addConditionalEdges(
      "compare",
      this.routeFromCompare.bind(this),
      {
        compare: "compare",
        menu: "menu",
        end: "end",
        __end__: END
      }
    );

    // EVOLUTION → Transições condicionais
    this.graph.addConditionalEdges(
      "evolution",
      this.routeFromEvolution.bind(this),
      {
        evolution: "evolution",
        search: "search",
        menu: "menu",
        end: "end",
        __end__: END
      }
    );

    // TYPE_SEARCH → Transições condicionais
    this.graph.addConditionalEdges(
      "type_search",
      this.routeFromTypeSearch.bind(this),
      {
        type_search: "type_search",
        search: "search",
        menu: "menu",
        end: "end",
        __end__: END
      }
    );

    // END → Conectar ao END especial do LangGraph
    this.graph.addEdge("end", END);

    // Definir ponto de entrada
    this.graph.setEntryPoint("start");

    // Compilar o grafo
    this.compiledGraph = this.graph.compile();
    console.log('[GRAPH] Grafo compilado com sucesso!');
  }

  // ============================================
  // FUNÇÕES DE ROTEAMENTO (Decidem próximo nó)
  // ============================================

  /**
   * Roteamento do nó MENU
   */
  routeFromMenu(state) {
    const nextNode = state.currentNode;
    
    // Se não há input e está tentando voltar ao menu, aguarda (termina sem executar end node)
    if ((!state.userInput || !state.userInput.trim()) && nextNode === 'menu') {
      console.log(`[ROUTER] menu → END (aguardando input)`);
      return '__end__';
    }
    
    console.log(`[ROUTER] menu → ${nextNode}`);
    return nextNode;
  }

  /**
   * Roteamento do nó SEARCH
   */
  routeFromSearch(state) {
    const input = state.userInput.toLowerCase().trim();
    
    // Se não há input (foi processado), aguarda próxima mensagem
    if (!input) {
      console.log('[ROUTER] search → END (aguardando input)');
      return '__end__';
    }
    
    if (input.includes('menu')) {
      console.log('[ROUTER] search → menu');
      return 'menu';
    }
    if (input.includes('evol')) {
      console.log('[ROUTER] search → evolution');
      return 'evolution';
    }
    if (input.includes('sair') || input.includes('tchau')) {
      console.log('[ROUTER] search → end');
      return 'end';
    }
    
    console.log('[ROUTER] search → search');
    return 'search';
  }

  /**
   * Roteamento do nó COMPARE
   */
  routeFromCompare(state) {
    const input = state.userInput.toLowerCase().trim();
    
    // Se não há input (foi processado), aguarda próxima mensagem
    if (!input) {
      console.log('[ROUTER] compare → END (aguardando input)');
      return '__end__';
    }
    
    if (input.includes('menu')) {
      console.log('[ROUTER] compare → menu');
      return 'menu';
    }
    if (input.includes('sair') || input.includes('tchau')) {
      console.log('[ROUTER] compare → end');
      return 'end';
    }
    
    console.log('[ROUTER] compare → compare');
    return 'compare';
  }

  /**
   * Roteamento do nó EVOLUTION
   */
  routeFromEvolution(state) {
    const input = state.userInput.toLowerCase().trim();
    
    // Se não há input (foi processado), aguarda próxima mensagem
    if (!input) {
      console.log('[ROUTER] evolution → END (aguardando input)');
      return '__end__';
    }
    
    if (input.includes('menu')) {
      console.log('[ROUTER] evolution → menu');
      return 'menu';
    }
    if (input.includes('sair') || input.includes('tchau')) {
      console.log('[ROUTER] evolution → end');
      return 'end';
    }
    // Se digitar um nome de Pokémon, vai para search
    if (input.length > 2 && !input.includes('evol')) {
      console.log('[ROUTER] evolution → search');
      return 'search';
    }
    
    console.log('[ROUTER] evolution → evolution');
    return 'evolution';
  }

  /**
   * Roteamento do nó TYPE_SEARCH
   */
  routeFromTypeSearch(state) {
    const input = state.userInput.toLowerCase().trim();
    
    // Se não há input (foi processado), aguarda próxima mensagem
    if (!input) {
      console.log('[ROUTER] type_search → END (aguardando input)');
      return '__end__';
    }
    
    if (input.includes('menu')) {
      console.log('[ROUTER] type_search → menu');
      return 'menu';
    }
    if (input.includes('sair') || input.includes('tchau')) {
      console.log('[ROUTER] type_search → end');
      return 'end';
    }
    // Se parecer um nome de Pokémon específico, vai para search
    if (input.length > 3 && !this.isPokemonType(input)) {
      console.log('[ROUTER] type_search → search');
      return 'search';
    }
    
    console.log('[ROUTER] type_search → type_search');
    return 'type_search';
  }

  /**
   * Verifica se entrada é um tipo válido de Pokémon
   */
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

  /**
   * Inicia uma nova conversa
   */
  async start() {
    console.log('[CHATBOT] Iniciando nova conversa...');
    
    // Criar novo estado
    this.currentState = createInitialState(this.generateSessionId());

    // Processar nó inicial
    this.currentState = await this.compiledGraph.invoke(this.currentState);
    
    return this.getLastMessage();
  }

  /**
   * Processa mensagem do usuário
   */
  async processMessage(userInput) {
    console.log(`[CHATBOT] Processando: "${userInput}"`);

    if (!userInput || userInput.trim() === '') {
      return {
        role: 'assistant',
        content: '❓ Por favor, digite alguma coisa!',
        timestamp: Date.now()
      };
    }

    // Atualizar estado com input do usuário
    this.currentState = {
      ...this.currentState,
      userInput: userInput.trim()
    };

    try {
      // Processar manualmente nó por nó (para ter controle fino)
      const currentNode = this.currentState.currentNode;
      
      if (currentNode && currentNode !== 'start' && nodes[currentNode]) {
        console.log(`[CHATBOT] Processando no nó atual: ${currentNode}`);
        
        // Processar apenas o nó atual
        this.currentState = await nodes[currentNode](this.currentState);
      } else {
        // Primeira mensagem ou estado inicial: usar o grafo compilado
        this.currentState = await this.compiledGraph.invoke(this.currentState);
      }
      
      return this.getLastMessage();
    } catch (error) {
      console.error('[CHATBOT ERROR]:', error);
      
      return {
        role: 'assistant',
        content: `❌ Erro ao processar mensagem: ${error.message}\n\nDigite "menu" para voltar ao menu principal.`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obtém última mensagem do assistente
   */
  getLastMessage() {
    const messages = this.currentState.messages;
    return messages[messages.length - 1] || null;
  }

  /**
   * Obtém histórico completo de mensagens
   */
  getMessageHistory() {
    return this.currentState.messages;
  }

  /**
   * Obtém estado atual
   */
  getCurrentState() {
    return {
      currentNode: this.currentState.currentNode,
      waitingFor: this.currentState.context.waitingFor,
      interactionCount: this.currentState.metadata.interactionCount,
      sessionDuration: Date.now() - this.currentState.metadata.startTime
    };
  }

  /**
   * Obtém estatísticas da sessão
   */
  getSessionStats() {
    return {
      sessionId: this.currentState.sessionId,
      startTime: this.currentState.metadata.startTime,
      interactionCount: this.currentState.metadata.interactionCount,
      currentNode: this.currentState.currentNode,
      totalMessages: this.currentState.messages.length
    };
  }

  /**
   * Reseta a conversa
   */
  async reset() {
    console.log('[CHATBOT] Resetando conversa...');
    return this.start();
  }

  /**
   * Gera ID único para sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Visualiza estrutura do grafo (útil para debug)
   */
  visualizeGraph() {
    console.log('\n=== ESTRUTURA DO GRAFO ===\n');
    console.log('Nós:', Object.keys(this.graph.nodes));
    console.log('\nTransições:');
    console.log('start → menu');
    console.log('menu → [search, compare, evolution, type_search, menu, END]');
    console.log('search → [search, evolution, menu, END]');
    console.log('compare → [compare, menu, END]');
    console.log('evolution → [evolution, search, menu, END]');
    console.log('type_search → [type_search, search, menu, END]');
    console.log('end → END');
    console.log('\n=========================\n');
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = PokemonChatbot;

// ============================================
// EXEMPLO DE USO
// ============================================
/*
const chatbot = new PokemonChatbot();

// Iniciar conversa
const welcome = await chatbot.start();
console.log(welcome.content);

// Processar mensagens
let response = await chatbot.processMessage('1');
console.log(response.content);

response = await chatbot.processMessage('pikachu');
console.log(response.content);

// Ver estatísticas
console.log(chatbot.getSessionStats());

// Visualizar grafo
chatbot.visualizeGraph();
*/
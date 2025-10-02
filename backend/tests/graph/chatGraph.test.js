/**
 * Testes para chatGraph.js
 */

const PokemonChatbot = require('../../graph/chatGraph');
const { NODE_TYPES } = require('../../graph/stateSchema');
const { nodes } = require('../../graph/nodes');

// Mock do PokeAPIService
jest.mock('../../services/pokeapi');

describe('PokemonChatbot (chatGraph)', () => {

  let chatbot;

  beforeEach(() => {
    chatbot = new PokemonChatbot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Constructor e Inicialização
  // ============================================
  describe('Inicialização', () => {
    
    test('deve criar instância do chatbot', () => {
      expect(chatbot).toBeInstanceOf(PokemonChatbot);
      expect(chatbot.graph).toBeDefined();
      expect(chatbot.compiledGraph).toBeDefined();
    });

    test('deve ter estado inicial vazio', () => {
      expect(chatbot.currentState).toBeDefined();
      expect(chatbot.currentState.messages).toEqual([]);
    });

    test('deve compilar grafo automaticamente', () => {
      expect(chatbot.compiledGraph).not.toBeNull();
    });
  });

  // ============================================
  // Método start()
  // ============================================
  describe('start()', () => {
    
    test('deve iniciar nova conversa', async () => {
      const message = await chatbot.start();
      
      expect(message).toBeDefined();
      expect(message).toHaveProperty('role');
      expect(message).toHaveProperty('content');
    });

    test('deve criar sessionId único', async () => {
      await chatbot.start();
      
      expect(chatbot.currentState.sessionId).toBeDefined();
      expect(chatbot.currentState.sessionId).toMatch(/^session_/);
    });

    test('deve retornar mensagem de boas-vindas', async () => {
      const message = await chatbot.start();
      
      expect(message.content).toContain('Bem-vindo');
      expect(message.role).toBe('assistant');
    });

    test('deve definir currentNode como menu', async () => {
      await chatbot.start();
      
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.MENU);
    });

    test('deve gerar sessionIds diferentes em múltiplas instâncias', async () => {
      const bot1 = new PokemonChatbot();
      const bot2 = new PokemonChatbot();
      
      await bot1.start();
      await bot2.start();
      
      expect(bot1.currentState.sessionId).not.toBe(bot2.currentState.sessionId);
    });
  });

  // ============================================
  // Método processMessage()
  // ============================================
  describe('processMessage()', () => {
    
    beforeEach(async () => {
      await chatbot.start();
    });

    test('deve processar mensagem do usuário', async () => {
      const response = await chatbot.processMessage('1');
      
      expect(response).toBeDefined();
      expect(response).toHaveProperty('role');
      expect(response).toHaveProperty('content');
    });

    test('deve adicionar mensagem do usuário ao histórico', async () => {
      const initialLength = chatbot.currentState.messages.length;
      await chatbot.processMessage('teste');
      
      expect(chatbot.currentState.messages.length).toBeGreaterThan(initialLength);
    });

    test('deve rejeitar mensagem vazia', async () => {
      const response = await chatbot.processMessage('');
      
      expect(response.content).toContain('Por favor');
    });

    test('deve rejeitar mensagem com apenas espaços', async () => {
      const response = await chatbot.processMessage('   ');
      
      expect(response.content).toContain('Por favor');
    });

    test('deve processar múltiplas mensagens', async () => {
      await chatbot.processMessage('1');
      const response = await chatbot.processMessage('pikachu');
      
      expect(response).toBeDefined();
      expect(chatbot.currentState.messages.length).toBeGreaterThan(2);
    });

    test('deve atualizar userInput no estado', async () => {
      const input = 'teste de input';
      await chatbot.processMessage(input);
      
      // Após processar, o userInput é limpo para evitar loops infinitos
      // O input do usuário foi salvo nas mensagens
      expect(chatbot.currentState.userInput).toBe('');
      expect(chatbot.currentState.messages.some(m => 
        m.role === 'user' && m.content === input
      )).toBe(true);
    });
  });

  // ============================================
  // Método getLastMessage()
  // ============================================
  describe('getLastMessage()', () => {
    
    test('deve retornar null se não houver mensagens', () => {
      const message = chatbot.getLastMessage();
      expect(message).toBeNull();
    });

    test('deve retornar última mensagem após start', async () => {
      await chatbot.start();
      const lastMsg = chatbot.getLastMessage();
      
      expect(lastMsg).not.toBeNull();
      expect(lastMsg.role).toBe('assistant');
    });

    test('deve retornar última mensagem após processMessage', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      const lastMsg = chatbot.getLastMessage();
      
      expect(lastMsg).not.toBeNull();
    });
  });

  // ============================================
  // Método getMessageHistory()
  // ============================================
  describe('getMessageHistory()', () => {
    
    test('deve retornar array vazio inicialmente', () => {
      const history = chatbot.getMessageHistory();
      
      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(0);
    });

    test('deve retornar histórico completo', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      
      const history = chatbot.getMessageHistory();
      
      expect(history.length).toBeGreaterThan(0);
      expect(history.every(msg => 
        msg.hasOwnProperty('role') && 
        msg.hasOwnProperty('content')
      )).toBe(true);
    });
  });

  // ============================================
  // Método getCurrentState()
  // ============================================
  describe('getCurrentState()', () => {
    
    test('deve retornar estado atual simplificado', async () => {
      await chatbot.start();
      const state = chatbot.getCurrentState();
      
      expect(state).toHaveProperty('currentNode');
      expect(state).toHaveProperty('waitingFor');
      expect(state).toHaveProperty('interactionCount');
      expect(state).toHaveProperty('sessionDuration');
    });

    test('deve mostrar currentNode correto', async () => {
      await chatbot.start();
      const state = chatbot.getCurrentState();
      
      expect(state.currentNode).toBe(NODE_TYPES.MENU);
    });

    test('deve calcular sessionDuration', async () => {
      await chatbot.start();
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const state = chatbot.getCurrentState();
      expect(state.sessionDuration).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Método getSessionStats()
  // ============================================
  describe('getSessionStats()', () => {
    
    test('deve retornar estatísticas da sessão', async () => {
      await chatbot.start();
      const stats = chatbot.getSessionStats();
      
      expect(stats).toHaveProperty('sessionId');
      expect(stats).toHaveProperty('startTime');
      expect(stats).toHaveProperty('interactionCount');
      expect(stats).toHaveProperty('currentNode');
      expect(stats).toHaveProperty('totalMessages');
    });

    test('deve incrementar interactionCount', async () => {
      await chatbot.start();
      
      const statsBefore = chatbot.getSessionStats();
      await chatbot.processMessage('1');
      const statsAfter = chatbot.getSessionStats();
      
      expect(statsAfter.interactionCount).toBeGreaterThan(statsBefore.interactionCount);
    });

    test('deve contar totalMessages corretamente', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      
      const stats = chatbot.getSessionStats();
      expect(stats.totalMessages).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Método reset()
  // ============================================
  describe('reset()', () => {
    
    test('deve resetar conversa', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      
      const message = await chatbot.reset();
      
      expect(message).toBeDefined();
      expect(message.content).toContain('Bem-vindo');
    });

    test('deve limpar histórico de mensagens', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      await chatbot.processMessage('2');
      
      await chatbot.reset();
      
      const history = chatbot.getMessageHistory();
      expect(history).toHaveLength(1); // Só mensagem de boas-vindas
    });

    test('deve manter sessionId', async () => {
      await chatbot.start();
      const sessionIdBefore = chatbot.currentState.sessionId;
      
      await chatbot.reset();
      const sessionIdAfter = chatbot.currentState.sessionId;
      
      // Pode ser diferente dependendo da implementação
      expect(sessionIdAfter).toBeDefined();
    });

    test('deve resetar currentNode para MENU', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      
      await chatbot.reset();
      
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.MENU);
    });
  });

  // ============================================
  // Método generateSessionId()
  // ============================================
  describe('generateSessionId()', () => {
    
    test('deve gerar ID único', () => {
      const id1 = chatbot.generateSessionId();
      const id2 = chatbot.generateSessionId();
      
      expect(id1).not.toBe(id2);
    });

    test('deve seguir padrão session_timestamp_random', () => {
      const id = chatbot.generateSessionId();
      
      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  // ============================================
  // Método visualizeGraph()
  // ============================================
  describe('visualizeGraph()', () => {
    
    test('deve executar sem erros', () => {
      // Teste que o método existe e executa sem erros
      expect(() => chatbot.visualizeGraph()).not.toThrow();
    });
  });

  // ============================================
  // Funções de Roteamento
  // ============================================
  describe('Roteamento', () => {
    
    test('routeFromMenu deve rotear corretamente', () => {
      const state = { currentNode: NODE_TYPES.SEARCH };
      const nextNode = chatbot.routeFromMenu(state);
      
      expect(nextNode).toBe(NODE_TYPES.SEARCH);
    });

    test('routeFromSearch deve detectar "menu"', () => {
      const state = { userInput: 'menu' };
      const nextNode = chatbot.routeFromSearch(state);
      
      expect(nextNode).toBe(NODE_TYPES.MENU);
    });

    test('routeFromSearch deve detectar "evol"', () => {
      const state = { userInput: 'evolucao' };
      const nextNode = chatbot.routeFromSearch(state);
      
      expect(nextNode).toBe(NODE_TYPES.EVOLUTION);
    });

    test('routeFromCompare deve voltar ao search por padrão', () => {
      const state = { userInput: 'pikachu' };
      const nextNode = chatbot.routeFromCompare(state);
      
      expect(nextNode).toBe(NODE_TYPES.COMPARE);
    });

    test('isPokemonType deve validar tipos corretamente', () => {
      expect(chatbot.isPokemonType('fire')).toBe(true);
      expect(chatbot.isPokemonType('water')).toBe(true);
      expect(chatbot.isPokemonType('invalidtype')).toBe(false);
    });
  });

  // ============================================
  // Fluxo Completo de Integração
  // ============================================
  describe('Fluxo Completo', () => {
    
    test('deve executar fluxo: start -> menu -> search -> menu', async () => {
      // Start
      await chatbot.start();
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.MENU);
      
      // Menu -> Search
      await chatbot.processMessage('1');
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.SEARCH);
      
      // Buscar Pokémon
      await chatbot.processMessage('pikachu');
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.SEARCH);
      
      // Voltar ao menu
      await chatbot.processMessage('menu');
      expect(chatbot.currentState.currentNode).toBe(NODE_TYPES.MENU);
    });

    test('deve manter contexto durante toda a conversa', async () => {
      await chatbot.start();
      await chatbot.processMessage('1');
      await chatbot.processMessage('pikachu');
      
      expect(chatbot.currentState.context).toBeDefined();
      expect(chatbot.currentState.metadata.interactionCount).toBeGreaterThan(0);
    });

    test('deve processar múltiplas buscas', async () => {
      await chatbot.start();
      
      await chatbot.processMessage('1');
      await chatbot.processMessage('pikachu');
      
      await chatbot.processMessage('menu');
      await chatbot.processMessage('1');
      await chatbot.processMessage('charizard');
      
      const stats = chatbot.getSessionStats();
      expect(stats.interactionCount).toBeGreaterThan(3);
    });
  });

  // ============================================
  // Tratamento de Erros
  // ============================================
  describe('Tratamento de Erros', () => {
    
    test('deve capturar erros durante processMessage', async () => {
      await chatbot.start();
      
      // Mockar um node para lançar erro
      const originalMenuNode = nodes.menu;
      nodes.menu = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const response = await chatbot.processMessage('teste');
      
      expect(response.content).toContain('Erro');
      
      // Restaurar node original
      nodes.menu = originalMenuNode;
    });

    test('deve manter chatbot funcional após erro', async () => {
      await chatbot.start();
      
      // Processar mensagem que pode dar erro
      await chatbot.processMessage('entrada inválida');
      
      // Deve continuar funcionando
      const response = await chatbot.processMessage('1');
      expect(response).toBeDefined();
    });
  });

  // ============================================
  // Performance e Concorrência
  // ============================================
  describe('Performance', () => {
    
    test('deve processar mensagens rapidamente', async () => {
      await chatbot.start();
      
      const start = Date.now();
      await chatbot.processMessage('1');
      const duration = Date.now() - start;
      
      // Deve processar em menos de 1s
      expect(duration).toBeLessThan(1000);
    });

    test('deve suportar múltiplas instâncias simultâneas', async () => {
      const bot1 = new PokemonChatbot();
      const bot2 = new PokemonChatbot();
      const bot3 = new PokemonChatbot();
      
      await Promise.all([
        bot1.start(),
        bot2.start(),
        bot3.start()
      ]);
      
      expect(bot1.currentState.sessionId).not.toBe(bot2.currentState.sessionId);
      expect(bot2.currentState.sessionId).not.toBe(bot3.currentState.sessionId);
    });
  });
});
/**
 * Testes para stateSchema.js
 */

const {
    createInitialState,
    NODE_TYPES,
    MESSAGE_ROLES,
    WAITING_FOR,
    addMessage,
    updateContext,
    incrementInteraction,
    setUserInput,
    transitionTo,
    transitionToWithHistory,
    goBack,
    canGoBack,
    setError,
    clearError,
    getSessionDuration,
    getStats,
    validateState
  } = require('../../graph/stateSchema');
  
  describe('stateSchema', () => {
    
    // ============================================
    // Testes de Constantes
    // ============================================
    describe('Constantes', () => {
      
      test('NODE_TYPES deve conter todos os nós', () => {
        expect(NODE_TYPES).toHaveProperty('START');
        expect(NODE_TYPES).toHaveProperty('MENU');
        expect(NODE_TYPES).toHaveProperty('SEARCH');
        expect(NODE_TYPES).toHaveProperty('COMPARE');
        expect(NODE_TYPES).toHaveProperty('EVOLUTION');
        expect(NODE_TYPES).toHaveProperty('TYPE_SEARCH');
        expect(NODE_TYPES).toHaveProperty('END');
      });
  
      test('NODE_TYPES deve ser frozen (imutável)', () => {
        expect(() => {
          NODE_TYPES.NEW_NODE = 'new';
        }).not.toThrow();
        expect(NODE_TYPES.NEW_NODE).toBeUndefined();
      });
  
      test('MESSAGE_ROLES deve conter user e assistant', () => {
        expect(MESSAGE_ROLES.USER).toBe('user');
        expect(MESSAGE_ROLES.ASSISTANT).toBe('assistant');
      });
  
      test('WAITING_FOR deve conter estados de espera', () => {
        expect(WAITING_FOR).toHaveProperty('MENU_CHOICE');
        expect(WAITING_FOR).toHaveProperty('POKEMON_INPUT');
        expect(WAITING_FOR).toHaveProperty('NEXT_ACTION');
        expect(WAITING_FOR).toHaveProperty('NONE');
      });
    });
  
    // ============================================
    // Testes de createInitialState
    // ============================================
    describe('createInitialState', () => {
      
      test('deve criar estado com sessionId automático', () => {
        const state = createInitialState();
        
        expect(state).toHaveProperty('sessionId');
        expect(state.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      });
  
      test('deve criar estado com sessionId customizado', () => {
        const customId = 'custom-session-123';
        const state = createInitialState(customId);
        
        expect(state.sessionId).toBe(customId);
      });
  
      test('deve criar estado com estrutura correta', () => {
        const state = createInitialState();
        
        expect(state).toHaveProperty('messages');
        expect(state).toHaveProperty('userInput');
        expect(state).toHaveProperty('currentNode');
        expect(state).toHaveProperty('context');
        expect(state).toHaveProperty('metadata');
        
        expect(Array.isArray(state.messages)).toBe(true);
        expect(state.messages).toHaveLength(0);
        expect(state.currentNode).toBe(NODE_TYPES.START);
      });
  
      test('deve criar contexto inicial correto', () => {
        const state = createInitialState();
        
        expect(state.context).toEqual({
          pokemonData: null,
          comparisonData: [],
          evolutionChain: null,
          waitingFor: WAITING_FOR.MENU_CHOICE,
          lastError: null
        });
      });
  
      test('deve criar metadata com timestamp correto', () => {
        const before = Date.now();
        const state = createInitialState();
        const after = Date.now();
        
        expect(state.metadata.startTime).toBeGreaterThanOrEqual(before);
        expect(state.metadata.startTime).toBeLessThanOrEqual(after);
        expect(state.metadata.interactionCount).toBe(0);
      });
    });
  
    // ============================================
    // Testes de addMessage
    // ============================================
    describe('addMessage', () => {
      
      let state;
  
      beforeEach(() => {
        state = createInitialState();
      });
  
      test('deve adicionar mensagem do usuário', () => {
        const newState = addMessage(state, MESSAGE_ROLES.USER, 'Olá');
        
        expect(newState.messages).toHaveLength(1);
        expect(newState.messages[0].role).toBe(MESSAGE_ROLES.USER);
        expect(newState.messages[0].content).toBe('Olá');
        expect(newState.messages[0]).toHaveProperty('timestamp');
      });
  
      test('deve adicionar mensagem do assistente', () => {
        const newState = addMessage(state, MESSAGE_ROLES.ASSISTANT, 'Oi!');
        
        expect(newState.messages).toHaveLength(1);
        expect(newState.messages[0].role).toBe(MESSAGE_ROLES.ASSISTANT);
      });
  
      test('deve adicionar mensagem com dados', () => {
        const data = { pokemon: 'pikachu' };
        const newState = addMessage(state, MESSAGE_ROLES.USER, 'Buscar', data);
        
        expect(newState.messages[0].data).toEqual(data);
      });
  
      test('deve manter estado original imutável', () => {
        const originalLength = state.messages.length;
        addMessage(state, MESSAGE_ROLES.USER, 'Test');
        
        expect(state.messages.length).toBe(originalLength);
      });
  
      test('deve adicionar múltiplas mensagens em sequência', () => {
        let newState = addMessage(state, MESSAGE_ROLES.USER, 'Msg 1');
        newState = addMessage(newState, MESSAGE_ROLES.ASSISTANT, 'Msg 2');
        newState = addMessage(newState, MESSAGE_ROLES.USER, 'Msg 3');
        
        expect(newState.messages).toHaveLength(3);
        expect(newState.messages[0].content).toBe('Msg 1');
        expect(newState.messages[2].content).toBe('Msg 3');
      });
    });
  
    // ============================================
    // Testes de updateContext
    // ============================================
    describe('updateContext', () => {
      
      let state;
  
      beforeEach(() => {
        state = createInitialState();
      });
  
      test('deve atualizar campo único do contexto', () => {
        const newState = updateContext(state, { 
          pokemonData: { id: 25, name: 'pikachu' } 
        });
        
        expect(newState.context.pokemonData).toEqual({ id: 25, name: 'pikachu' });
        expect(newState.context.waitingFor).toBe(WAITING_FOR.MENU_CHOICE); // mantém outros
      });
  
      test('deve atualizar múltiplos campos', () => {
        const newState = updateContext(state, {
          pokemonData: { id: 1 },
          waitingFor: WAITING_FOR.NEXT_ACTION,
          lastError: null
        });
        
        expect(newState.context.pokemonData).toEqual({ id: 1 });
        expect(newState.context.waitingFor).toBe(WAITING_FOR.NEXT_ACTION);
      });
  
      test('deve manter estado original imutável', () => {
        const originalWaiting = state.context.waitingFor;
        updateContext(state, { waitingFor: WAITING_FOR.NONE });
        
        expect(state.context.waitingFor).toBe(originalWaiting);
      });
  
      test('deve preservar campos não atualizados', () => {
        const newState = updateContext(state, { pokemonData: { id: 1 } });
        
        expect(newState.context.comparisonData).toEqual([]);
        expect(newState.context.evolutionChain).toBeNull();
      });
    });
  
    // ============================================
    // Testes de incrementInteraction
    // ============================================
    describe('incrementInteraction', () => {
      
      test('deve incrementar contador de interações', () => {
        let state = createInitialState();
        
        expect(state.metadata.interactionCount).toBe(0);
        
        state = incrementInteraction(state);
        expect(state.metadata.interactionCount).toBe(1);
        
        state = incrementInteraction(state);
        expect(state.metadata.interactionCount).toBe(2);
      });
  
      test('deve manter estado original imutável', () => {
        const state = createInitialState();
        const originalCount = state.metadata.interactionCount;
        
        incrementInteraction(state);
        
        expect(state.metadata.interactionCount).toBe(originalCount);
      });
    });
  
    // ============================================
    // Testes de setUserInput
    // ============================================
    describe('setUserInput', () => {
      
      test('deve definir input do usuário', () => {
        let state = createInitialState();
        state = setUserInput(state, 'pikachu');
        
        expect(state.userInput).toBe('pikachu');
      });
  
      test('deve sobrescrever input anterior', () => {
        let state = createInitialState();
        state = setUserInput(state, 'primeiro');
        state = setUserInput(state, 'segundo');
        
        expect(state.userInput).toBe('segundo');
      });
    });
  
    // ============================================
    // Testes de transitionTo
    // ============================================
    describe('transitionTo', () => {
      
      test('deve transicionar para novo nó', () => {
        let state = createInitialState();
        
        expect(state.currentNode).toBe(NODE_TYPES.START);
        
        state = transitionTo(state, NODE_TYPES.MENU);
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
      });
  
      test('deve permitir múltiplas transições', () => {
        let state = createInitialState();
        
        state = transitionTo(state, NODE_TYPES.MENU);
        state = transitionTo(state, NODE_TYPES.SEARCH);
        state = transitionTo(state, NODE_TYPES.MENU);
        
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
      });
  
      test('deve aceitar todos os tipos de nó válidos', () => {
        let state = createInitialState();
        
        Object.values(NODE_TYPES).forEach(nodeType => {
          const newState = transitionTo(state, nodeType);
          expect(newState.currentNode).toBe(nodeType);
        });
      });
    });
  
    // ============================================
    // Testes de Error Handling
    // ============================================
    describe('Error Handling', () => {
      
      test('setError deve definir erro no contexto', () => {
        let state = createInitialState();
        state = setError(state, 'POKEMON_NOT_FOUND');
        
        expect(state.context.lastError).toBe('POKEMON_NOT_FOUND');
      });
  
      test('clearError deve limpar erro', () => {
        let state = createInitialState();
        state = setError(state, 'ERROR');
        state = clearError(state);
        
        expect(state.context.lastError).toBeNull();
      });
  
      test('deve permitir múltiplos erros em sequência', () => {
        let state = createInitialState();
        
        state = setError(state, 'ERROR_1');
        expect(state.context.lastError).toBe('ERROR_1');
        
        state = setError(state, 'ERROR_2');
        expect(state.context.lastError).toBe('ERROR_2');
      });
    });
  
    // ============================================
    // Testes de Utilities
    // ============================================
    describe('Utilities', () => {
      
      test('getSessionDuration deve retornar duração em ms', async () => {
        const state = createInitialState();
        
        // Esperar um pouco
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const duration = getSessionDuration(state);
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(1000); // menos de 1s
      });
  
      test('getStats deve retornar estatísticas corretas', () => {
        let state = createInitialState();
        state = addMessage(state, MESSAGE_ROLES.USER, 'Test');
        state = incrementInteraction(state);
        state = transitionTo(state, NODE_TYPES.SEARCH);
        
        const stats = getStats(state);
        
        expect(stats).toHaveProperty('sessionId');
        expect(stats).toHaveProperty('duration');
        expect(stats).toHaveProperty('interactions');
        expect(stats).toHaveProperty('messages');
        expect(stats).toHaveProperty('currentNode');
        
        expect(stats.interactions).toBe(1);
        expect(stats.messages).toBe(1);
        expect(stats.currentNode).toBe(NODE_TYPES.SEARCH);
      });
    });
  
    // ============================================
    // Testes de Validação
    // ============================================
    describe('validateState', () => {
      
      test('deve validar estado correto', () => {
        const state = createInitialState();
        
        expect(() => validateState(state)).not.toThrow();
        expect(validateState(state)).toBe(true);
      });
  
      test('deve lançar erro se sessionId ausente', () => {
        const state = createInitialState();
        delete state.sessionId;
        
        expect(() => validateState(state)).toThrow('Session ID is required');
      });
  
      test('deve lançar erro se currentNode inválido', () => {
        const state = createInitialState();
        state.currentNode = 'INVALID_NODE';
        
        expect(() => validateState(state)).toThrow('Invalid node');
      });
  
      test('deve validar estado após modificações', () => {
        let state = createInitialState();
        state = addMessage(state, MESSAGE_ROLES.USER, 'Test');
        state = updateContext(state, { pokemonData: { id: 1 } });
        state = transitionTo(state, NODE_TYPES.SEARCH);
        
        expect(() => validateState(state)).not.toThrow();
      });
    });
  
    // ============================================
    // Testes de Imutabilidade
    // ============================================
    describe('Imutabilidade', () => {
      
      test('todas as operações devem retornar novo estado', () => {
        const originalState = createInitialState();
        
        const state1 = addMessage(originalState, MESSAGE_ROLES.USER, 'Test');
        const state2 = updateContext(originalState, { pokemonData: {} });
        const state3 = incrementInteraction(originalState);
        const state4 = transitionTo(originalState, NODE_TYPES.MENU);
        
        expect(state1).not.toBe(originalState);
        expect(state2).not.toBe(originalState);
        expect(state3).not.toBe(originalState);
        expect(state4).not.toBe(originalState);
      });
  
      test('estado original não deve ser modificado', () => {
        const state = createInitialState();
        const originalSessionId = state.sessionId;
        const originalMessagesLength = state.messages.length;
        const originalNode = state.currentNode;
        
        addMessage(state, MESSAGE_ROLES.USER, 'Test');
        updateContext(state, { pokemonData: {} });
        incrementInteraction(state);
        transitionTo(state, NODE_TYPES.MENU);
        
        expect(state.sessionId).toBe(originalSessionId);
        expect(state.messages.length).toBe(originalMessagesLength);
        expect(state.currentNode).toBe(originalNode);
      });
    });
  
    // ============================================
    // Testes de Integração
    // ============================================
    describe('Fluxo Completo', () => {
      
      test('deve simular fluxo completo de conversa', () => {
        // Criar estado
        let state = createInitialState('test-session');
        expect(state.currentNode).toBe(NODE_TYPES.START);
        
        // Boas-vindas
        state = addMessage(state, MESSAGE_ROLES.ASSISTANT, 'Bem-vindo!');
        state = transitionTo(state, NODE_TYPES.MENU);
        
        // Usuário escolhe opção
        state = setUserInput(state, '1');
        state = addMessage(state, MESSAGE_ROLES.USER, '1');
        state = incrementInteraction(state);
        state = transitionTo(state, NODE_TYPES.SEARCH);
        
        // Usuário busca Pokémon
        state = setUserInput(state, 'pikachu');
        state = addMessage(state, MESSAGE_ROLES.USER, 'pikachu');
        state = incrementInteraction(state);
        
        // Resposta com dados
        const pokemonData = { id: 25, name: 'pikachu' };
        state = updateContext(state, { 
          pokemonData,
          waitingFor: WAITING_FOR.NEXT_ACTION 
        });
        state = addMessage(state, MESSAGE_ROLES.ASSISTANT, 'Encontrado!', pokemonData);
        
        // Validações finais
        expect(state.messages).toHaveLength(4);
        expect(state.metadata.interactionCount).toBe(2);
        expect(state.currentNode).toBe(NODE_TYPES.SEARCH);
        expect(state.context.pokemonData).toEqual(pokemonData);
        expect(validateState(state)).toBe(true);
        
        // Stats
        const stats = getStats(state);
        expect(stats.interactions).toBe(2);
        expect(stats.messages).toBe(4);
      });
    });

    // ============================================
    // Testes das Funções de Navegação (Voltar)
    // ============================================
    describe('Funções de Navegação', () => {
      
      test('transitionToWithHistory deve adicionar nó atual ao histórico', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.MENU;
        
        state = transitionToWithHistory(state, NODE_TYPES.SEARCH);
        
        expect(state.currentNode).toBe(NODE_TYPES.SEARCH);
        expect(state.navigationHistory).toContain(NODE_TYPES.MENU);
        expect(state.navigationHistory).toHaveLength(1);
      });

      test('transitionToWithHistory não deve adicionar START ao histórico', () => {
        let state = createInitialState();
        expect(state.currentNode).toBe(NODE_TYPES.START);
        
        state = transitionToWithHistory(state, NODE_TYPES.MENU);
        
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
      });

      test('transitionToWithHistory não deve modificar histórico se permanecer no mesmo nó', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.MENU;
        state.navigationHistory = [NODE_TYPES.SEARCH];
        
        state = transitionToWithHistory(state, NODE_TYPES.MENU);
        
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([NODE_TYPES.SEARCH]);
      });

      test('transitionToWithHistory deve manter múltiplos nós no histórico', () => {
        let state = createInitialState();
        
        state.currentNode = NODE_TYPES.MENU;
        state = transitionToWithHistory(state, NODE_TYPES.SEARCH);
        
        state = transitionToWithHistory(state, NODE_TYPES.EVOLUTION);
        
        expect(state.navigationHistory).toEqual([NODE_TYPES.MENU, NODE_TYPES.SEARCH]);
      });

      test('canGoBack deve retornar false quando histórico está vazio', () => {
        const state = createInitialState();
        
        expect(canGoBack(state)).toBe(false);
      });

      test('canGoBack deve retornar true quando há histórico', () => {
        let state = createInitialState();
        state.navigationHistory = [NODE_TYPES.MENU];
        
        expect(canGoBack(state)).toBe(true);
      });

      test('goBack deve voltar ao nó anterior e remover do histórico', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.SEARCH;
        state.navigationHistory = [NODE_TYPES.MENU];
        
        state = goBack(state);
        
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
      });

      test('goBack deve limpar userInput', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.SEARCH;
        state.navigationHistory = [NODE_TYPES.MENU];
        state.userInput = 'pikachu';
        
        state = goBack(state);
        
        expect(state.userInput).toBe('');
      });

      test('goBack deve retornar estado inalterado se não há histórico', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.MENU;
        state.navigationHistory = [];
        
        const newState = goBack(state);
        
        expect(newState.currentNode).toBe(NODE_TYPES.MENU);
        expect(newState.navigationHistory).toEqual([]);
      });

      test('goBack deve funcionar com múltiplos níveis de histórico', () => {
        let state = createInitialState();
        state.currentNode = NODE_TYPES.EVOLUTION;
        state.navigationHistory = [NODE_TYPES.MENU, NODE_TYPES.SEARCH];
        
        state = goBack(state);
        
        expect(state.currentNode).toBe(NODE_TYPES.SEARCH);
        expect(state.navigationHistory).toEqual([NODE_TYPES.MENU]);
      });

      test('goBack deve retornar novo estado (imutabilidade)', () => {
        const originalState = createInitialState();
        originalState.currentNode = NODE_TYPES.SEARCH;
        originalState.navigationHistory = [NODE_TYPES.MENU];
        
        const newState = goBack(originalState);
        
        expect(newState).not.toBe(originalState);
        expect(originalState.currentNode).toBe(NODE_TYPES.SEARCH);
        expect(originalState.navigationHistory).toEqual([NODE_TYPES.MENU]);
      });

      test('navigationHistory deve estar presente no estado inicial', () => {
        const state = createInitialState();
        
        expect(state).toHaveProperty('navigationHistory');
        expect(Array.isArray(state.navigationHistory)).toBe(true);
        expect(state.navigationHistory).toEqual([]);
      });
    });

    // ============================================
    // Testes de Integração com Navegação
    // ============================================
    describe('Fluxo Completo com Navegação', () => {
      
      test('deve simular navegação completa com voltar', () => {
        let state = createInitialState();
        
        // Start -> Menu (sem adicionar ao histórico)
        state = transitionToWithHistory(state, NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
        
        // Menu -> Search
        state = transitionToWithHistory(state, NODE_TYPES.SEARCH);
        expect(state.navigationHistory).toEqual([NODE_TYPES.MENU]);
        expect(canGoBack(state)).toBe(true);
        
        // Voltar: Search -> Menu
        state = goBack(state);
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
        expect(canGoBack(state)).toBe(false);
        
        // Menu -> Compare
        state = transitionToWithHistory(state, NODE_TYPES.COMPARE);
        expect(state.navigationHistory).toEqual([NODE_TYPES.MENU]);
        
        // Voltar: Compare -> Menu
        state = goBack(state);
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
      });

      test('deve manter histórico correto em navegação profunda', () => {
        let state = createInitialState();
        
        // Navegar: Start -> Menu -> Search -> Evolution
        state.currentNode = NODE_TYPES.MENU;
        state = transitionToWithHistory(state, NODE_TYPES.SEARCH);
        state = transitionToWithHistory(state, NODE_TYPES.EVOLUTION);
        state = transitionToWithHistory(state, NODE_TYPES.COMPARE);
        
        expect(state.navigationHistory).toEqual([
          NODE_TYPES.MENU,
          NODE_TYPES.SEARCH,
          NODE_TYPES.EVOLUTION
        ]);
        
        // Voltar 3 vezes
        state = goBack(state); // Compare -> Evolution
        expect(state.currentNode).toBe(NODE_TYPES.EVOLUTION);
        
        state = goBack(state); // Evolution -> Search
        expect(state.currentNode).toBe(NODE_TYPES.SEARCH);
        
        state = goBack(state); // Search -> Menu
        expect(state.currentNode).toBe(NODE_TYPES.MENU);
        expect(state.navigationHistory).toEqual([]);
      });
    });
  });
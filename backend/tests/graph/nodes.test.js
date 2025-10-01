/**
 * Testes para nodes.js
 */

const { nodes } = require('../../graph/nodes');
const { createInitialState, NODE_TYPES, MESSAGE_ROLES } = require('../../graph/stateSchema');

// Mock do PokeAPIService
jest.mock('../../services/pokeapi', () => {
  return class MockPokeAPIService {
    async getPokemon(identifier) {
      if (identifier === 'pikachu' || identifier === 25) {
        return {
          id: 25,
          name: 'pikachu',
          nameCapitalized: 'Pikachu',
          types: ['electric'],
          stats: {
            hp: 35,
            attack: 55,
            defense: 40,
            specialAttack: 50,
            specialDefense: 50,
            speed: 90,
            total: 320
          },
          abilities: [{ name: 'static', isHidden: false }],
          sprites: {
            front: 'url',
            frontShiny: 'url',
            official: 'url'
          },
          height: 0.4,
          weight: 6.0,
          speciesId: 25
        };
      }
      throw new Error('POKEMON_NOT_FOUND');
    }

    async getMultiplePokemon(identifiers) {
      return Promise.all(identifiers.map(id => this.getPokemon(id)));
    }

    async getSpecies(speciesId) {
      return {
        id: speciesId,
        name: 'pikachu',
        description: 'When several of these Pokémon gather...',
        evolutionChainId: 10,
        generation: 'generation-i',
        isLegendary: false,
        isMythical: false
      };
    }

    async getEvolutionChain(chainId) {
      return [
        { name: 'pichu', nameCapitalized: 'Pichu' },
        { name: 'pikachu', nameCapitalized: 'Pikachu' },
        { name: 'raichu', nameCapitalized: 'Raichu' }
      ];
    }

    async getPokemonByType(type) {
      return [
        { name: 'pikachu', url: 'url' },
        { name: 'raichu', url: 'url' }
      ];
    }

    async searchPokemon(partial) {
      return ['pikachu', 'pidgey', 'pidgeotto'];
    }
  };
});

describe('Nodes', () => {

  // ============================================
  // startNode
  // ============================================
  describe('startNode', () => {
    
    test('deve retornar mensagem de boas-vindas', async () => {
      const state = createInitialState();
      const newState = await nodes.start(state);
      
      expect(newState.messages).toHaveLength(1);
      expect(newState.messages[0].role).toBe(MESSAGE_ROLES.ASSISTANT);
      expect(newState.messages[0].content).toContain('Bem-vindo');
    });

    test('deve transicionar para menu', async () => {
      const state = createInitialState();
      const newState = await nodes.start(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.MENU);
    });

    test('deve definir waitingFor como menu_choice', async () => {
      const state = createInitialState();
      const newState = await nodes.start(state);
      
      expect(newState.context.waitingFor).toBe('menu_choice');
    });
  });

  // ============================================
  // menuNode
  // ============================================
  describe('menuNode', () => {
    
    test('deve rotear para search quando usuário digita 1', async () => {
      let state = createInitialState();
      state.userInput = '1';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.SEARCH);
      expect(newState.messages.some(m => 
        m.content.includes('Buscar')
      )).toBe(true);
    });

    test('deve rotear para compare quando usuário digita 2', async () => {
      let state = createInitialState();
      state.userInput = '2';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.COMPARE);
    });

    test('deve rotear para evolution quando usuário digita 3', async () => {
      let state = createInitialState();
      state.userInput = '3';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.EVOLUTION);
    });

    test('deve rotear para type_search quando usuário digita 4', async () => {
      let state = createInitialState();
      state.userInput = '4';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.TYPE_SEARCH);
    });

    test('deve rotear para end quando usuário digita sair', async () => {
      let state = createInitialState();
      state.userInput = 'sair';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.END);
    });

    test('deve permanecer no menu com entrada inválida', async () => {
      let state = createInitialState();
      state.userInput = 'entrada inválida';
      
      const newState = await nodes.menu(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.MENU);
      expect(newState.messages.some(m => 
        m.content.includes('não entendi')
      )).toBe(true);
    });

    test('deve adicionar mensagem do usuário ao histórico', async () => {
      let state = createInitialState();
      state.userInput = '1';
      
      const newState = await nodes.menu(state);
      
      const userMessages = newState.messages.filter(
        m => m.role === MESSAGE_ROLES.USER
      );
      expect(userMessages).toHaveLength(1);
      expect(userMessages[0].content).toBe('1');
    });

    test('deve incrementar contador de interações', async () => {
      let state = createInitialState();
      state.userInput = '1';
      
      const newState = await nodes.menu(state);
      
      expect(newState.metadata.interactionCount).toBe(1);
    });
  });

  // ============================================
  // searchNode
  // ============================================
  describe('searchNode', () => {
    
    test('deve buscar Pokémon com sucesso', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu';
      
      const newState = await nodes.search(state);
      
      expect(newState.context.pokemonData).not.toBeNull();
      expect(newState.context.pokemonData.name).toBe('pikachu');
      expect(newState.messages.some(m => 
        m.content.includes('Pikachu')
      )).toBe(true);
    });

    test('deve adicionar dados do Pokémon na mensagem', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu';
      
      const newState = await nodes.search(state);
      
      const assistantMsg = newState.messages.find(
        m => m.role === MESSAGE_ROLES.ASSISTANT && m.data
      );
      
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg.data.id).toBe(25);
    });

    test('deve tratar Pokémon não encontrado', async () => {
      let state = createInitialState();
      state.userInput = 'pokemonInexistente';
      
      const newState = await nodes.search(state);
      
      expect(newState.context.lastError).toBe('POKEMON_NOT_FOUND');
      expect(newState.messages.some(m => 
        m.content.includes('não encontrado')
      )).toBe(true);
    });

    test('deve aceitar busca por ID', async () => {
      let state = createInitialState();
      state.userInput = '25';
      
      const newState = await nodes.search(state);
      
      expect(newState.context.pokemonData).not.toBeNull();
      expect(newState.context.pokemonData.id).toBe(25);
    });

    test('deve limpar erro anterior em busca bem-sucedida', async () => {
      let state = createInitialState();
      state.context.lastError = 'PREVIOUS_ERROR';
      state.userInput = 'pikachu';
      
      const newState = await nodes.search(state);
      
      expect(newState.context.lastError).toBeNull();
    });
  });

  // ============================================
  // compareNode
  // ============================================
  describe('compareNode', () => {
    
    test('deve comparar dois Pokémon', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu, pikachu';
      
      const newState = await nodes.compare(state);
      
      expect(newState.context.comparisonData).toHaveLength(2);
      expect(newState.messages.some(m => 
        m.content.includes('Comparação')
      )).toBe(true);
    });

    test('deve rejeitar entrada sem vírgula', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu pikachu';
      
      const newState = await nodes.compare(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('dois Pokémon separados por vírgula')
      )).toBe(true);
    });

    test('deve rejeitar entrada com menos de 2 Pokémon', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu,';
      
      const newState = await nodes.compare(state);
      
      expect(newState.context.comparisonData).toHaveLength(0);
    });

    test('deve incluir dados na mensagem de comparação', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu, pikachu';
      
      const newState = await nodes.compare(state);
      
      const compareMsg = newState.messages.find(
        m => m.role === MESSAGE_ROLES.ASSISTANT && m.data
      );
      
      expect(compareMsg).toBeDefined();
      expect(compareMsg.data).toHaveProperty('pokemon1');
      expect(compareMsg.data).toHaveProperty('pokemon2');
    });
  });

  // ============================================
  // evolutionNode
  // ============================================
  describe('evolutionNode', () => {
    
    test('deve buscar cadeia de evolução', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu';
      
      const newState = await nodes.evolution(state);
      
      expect(newState.context.evolutionChain).not.toBeNull();
      expect(Array.isArray(newState.context.evolutionChain)).toBe(true);
      expect(newState.context.evolutionChain.length).toBeGreaterThan(0);
    });

    test('deve mostrar todas as evoluções', async () => {
      let state = createInitialState();
      state.userInput = 'pikachu';
      
      const newState = await nodes.evolution(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('Pichu') &&
        m.content.includes('Pikachu') &&
        m.content.includes('Raichu')
      )).toBe(true);
    });

    test('deve tratar erro de Pokémon não encontrado', async () => {
      let state = createInitialState();
      state.userInput = 'inexistente';
      
      const newState = await nodes.evolution(state);
      
      expect(newState.context.lastError).toBeTruthy();
      expect(newState.messages.some(m => 
        m.content.includes('Erro')
      )).toBe(true);
    });
  });

  // ============================================
  // typeSearchNode
  // ============================================
  describe('typeSearchNode', () => {
    
    test('deve buscar Pokémon por tipo', async () => {
      let state = createInitialState();
      state.userInput = 'electric';
      
      const newState = await nodes.type_search(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('ELECTRIC')
      )).toBe(true);
    });

    test('deve listar Pokémon encontrados', async () => {
      let state = createInitialState();
      state.userInput = 'electric';
      
      const newState = await nodes.type_search(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('pikachu')
      )).toBe(true);
    });

    test('deve tratar tipo inválido', async () => {
      let state = createInitialState();
      state.userInput = 'tipoinvalido';
      
      const newState = await nodes.type_search(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('não encontrado') ||
        m.content.includes('Erro')
      )).toBe(true);
    });
  });

  // ============================================
  // endNode
  // ============================================
  describe('endNode', () => {
    
    test('deve mostrar mensagem de despedida', async () => {
      let state = createInitialState();
      state.metadata.interactionCount = 5;
      
      const newState = await nodes.end(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('Até logo')
      )).toBe(true);
    });

    test('deve incluir resumo da sessão', async () => {
      let state = createInitialState();
      state.metadata.interactionCount = 5;
      
      const newState = await nodes.end(state);
      
      expect(newState.messages.some(m => 
        m.content.includes('Interações')
      )).toBe(true);
    });

    test('deve definir currentNode como end', async () => {
      let state = createInitialState();
      
      const newState = await nodes.end(state);
      
      expect(newState.currentNode).toBe(NODE_TYPES.END);
    });
  });

  // ============================================
  // Teste de Integração dos Nós
  // ============================================
  describe('Fluxo Completo entre Nós', () => {
    
    test('deve executar fluxo: start -> menu -> search', async () => {
      // Start
      let state = createInitialState();
      state = await nodes.start(state);
      expect(state.currentNode).toBe(NODE_TYPES.MENU);
      
      // Menu
      state.userInput = '1';
      state = await nodes.menu(state);
      expect(state.currentNode).toBe(NODE_TYPES.SEARCH);
      
      // Search
      state.userInput = 'pikachu';
      state = await nodes.search(state);
      expect(state.context.pokemonData).not.toBeNull();
      expect(state.metadata.interactionCount).toBeGreaterThan(0);
    });

    test('deve manter histórico correto de mensagens', async () => {
      let state = createInitialState();
      
      // Múltiplas interações
      state = await nodes.start(state);
      state.userInput = '1';
      state = await nodes.menu(state);
      state.userInput = 'pikachu';
      state = await nodes.search(state);
      
      // Verificar histórico
      const userMsgs = state.messages.filter(m => m.role === MESSAGE_ROLES.USER);
      const assistantMsgs = state.messages.filter(m => m.role === MESSAGE_ROLES.ASSISTANT);
      
      expect(userMsgs.length).toBeGreaterThan(0);
      expect(assistantMsgs.length).toBeGreaterThan(0);
      expect(state.messages.length).toBeGreaterThan(3);
    });
  });
});
/**
 * Nós da Máquina de Estados do Chatbot Pokémon
 * Cada nó representa um estado e contém a lógica de processamento
 */

const PokeAPIService = require('../services/pokeapi');
const botMessages = require('./botMessages');
const { canGoBack, goBack } = require('./stateSchema');

// Inicializar serviço
const pokeService = new PokeAPIService();

// ============================================
// ESTADO COMPARTILHADO (State Schema)
// ============================================
const initialState = {
  messages: [],           // Histórico de mensagens
  userInput: '',          // Última entrada do usuário
  currentNode: 'start',   // Nó atual
  navigationHistory: [],  // Histórico de navegação para "voltar"
  context: {              // Contexto da conversa
    pokemonData: null,
    comparisonData: [],
    waitingFor: null,     // O que estamos esperando do usuário
    evolutionChain: null,
    lastError: null
  },
  sessionId: null,
  metadata: {
    startTime: Date.now(),
    interactionCount: 0
  }
};

// ============================================
// UTILITÁRIOS
// ============================================
const utils = {
  /**
   * Adiciona mensagem ao histórico
   */
  addMessage(state, role, content, data = null) {
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
  },

  /**
   * Atualiza contexto
   */
  updateContext(state, updates) {
    return {
      ...state,
      context: {
        ...state.context,
        ...updates
      }
    };
  },

  /**
   * Incrementa contador de interações
   */
  incrementInteraction(state) {
    return {
      ...state,
      metadata: {
        ...state.metadata,
        interactionCount: state.metadata.interactionCount + 1
      }
    };
  },

  /**
   * Formata stats para exibição
   */
  formatStats(stats) {
    return `
📊 **Estatísticas:**
❤️  HP: ${stats.hp}
⚔️  Ataque: ${stats.attack}
🛡️  Defesa: ${stats.defense}
✨ Atq. Especial: ${stats.specialAttack}
🌟 Def. Especial: ${stats.specialDefense}
⚡ Velocidade: ${stats.speed}
💪 **Total: ${stats.total}**`;
  },

  /**
   * Valida se entrada é um número válido de Pokémon
   */
  isValidPokemonId(input) {
    const num = parseInt(input);
    return !isNaN(num) && num > 0 && num <= 1010; // Total de Pokémon até Gen 9
  },

  /**
   * Verifica se o usuário digitou "voltar" e trata a navegação
   * Retorna o estado atualizado e um flag indicando se foi processado
   */
  handleVoltarCommand(state, input) {
    const lowerInput = input.toLowerCase().trim();
    
    // Verifica se o usuário digitou "voltar"
    if (lowerInput === 'voltar') {
      // Verifica se pode voltar (tem histórico)
      if (canGoBack(state)) {
        // Adiciona mensagem do usuário
        let newState = this.addMessage(state, 'user', input);
        // Volta ao nó anterior (remove do histórico e muda currentNode)
        newState = goBack(newState);
        newState = this.incrementInteraction(newState);
        // Marca para re-executar o nó anterior
        return { state: newState, handled: true, shouldReExecute: true };
      } else {
        // Está no início, não pode voltar
        let newState = this.addMessage(state, 'user', input);
        newState = this.addMessage(newState, 'assistant', botMessages.VOLTAR_AT_START);
        newState = this.incrementInteraction(newState);
        // Limpa o input para não processar novamente
        newState.userInput = '';
        return { state: newState, handled: true, shouldReExecute: false };
      }
    }
    
    // Não é comando "voltar"
    return { state, handled: false, shouldReExecute: false };
  }
};

// ============================================
// NÓ 1: START (Boas-vindas)
// ============================================
const startNode = async (state) => {
  console.log('[NODE] startNode - Iniciando conversa');

  let newState = utils.addMessage(state, 'assistant', botMessages.WELCOME_MESSAGE);
  newState = utils.updateContext(newState, { 
    waitingFor: 'menu_choice',
    lastError: null 
  });
  newState = utils.incrementInteraction(newState);
  newState.currentNode = 'menu';

  return newState;
};

// ============================================
// NÓ 2: MENU (Roteamento)
// ============================================
const menuNode = async (state) => {
  console.log('[NODE] menuNode - Processando escolha do menu');

  const input = state.userInput.toLowerCase().trim();
  
  // Se não há input (acabou de entrar do start ou de outro nó), apenas mantém o estado
  if (!input) {
    console.log('[NODE] menuNode - Sem input, aguardando escolha do usuário');
    return {
      ...state,
      currentNode: 'menu'
    };
  }

  // Verificar comando "voltar"
  const voltarResult = utils.handleVoltarCommand(state, input);
  if (voltarResult.handled) {
    // Se deve re-executar, mostrar mensagem de boas-vindas novamente
    if (voltarResult.shouldReExecute) {
      const welcomeState = utils.addMessage(voltarResult.state, 'assistant', botMessages.WELCOME_MESSAGE);
      welcomeState.userInput = '';
      return welcomeState;
    }
    return voltarResult.state;
  }

  // Detectar intenção do usuário
  let nextNode = 'menu';
  let responseMessage = '';

  // Opção 1: Buscar Pokémon
  if (input.includes('1') || input.includes('buscar') || input.includes('procurar') || input.includes('informação')) {
    nextNode = 'search';
    responseMessage = botMessages.MENU_SEARCH_OPTION;
  }
  // Opção 2: Comparar
  else if (input.includes('2') || input.includes('comparar') || input.includes('comparação')) {
    nextNode = 'compare';
    responseMessage = botMessages.MENU_COMPARE_OPTION;
  }
  // Opção 3: Evolução
  else if (input.includes('3') || input.includes('evolução') || input.includes('evoluir')) {
    nextNode = 'evolution';
    responseMessage = botMessages.MENU_EVOLUTION_OPTION;
  }
  // Opção 4: Por tipo
  else if (input.includes('4') || input.includes('tipo') || input.includes('type')) {
    nextNode = 'type_search';
    responseMessage = botMessages.MENU_TYPE_OPTION;
  }
  // Opção de sair
  else if (input.includes('sair') || input.includes('tchau') || input.includes('bye')) {
    nextNode = 'end';
    responseMessage = botMessages.MENU_EXIT_MESSAGE;
  }
  // Entrada inválida
  else {
    responseMessage = botMessages.MENU_INVALID_CHOICE;
  }

  let newState = utils.addMessage(state, 'user', state.userInput);
  newState = utils.addMessage(newState, 'assistant', responseMessage);
  newState = utils.updateContext(newState, { 
    waitingFor: nextNode === 'menu' ? 'menu_choice' : 'pokemon_input' 
  });
  newState = utils.incrementInteraction(newState);
  
  // Limpa o input após processar a escolha do menu
  newState.userInput = '';
  
  // Adiciona ao histórico se estiver mudando de nó
  if (nextNode !== 'menu' && nextNode !== state.currentNode) {
    newState.navigationHistory = [...newState.navigationHistory, state.currentNode];
  }
  newState.currentNode = nextNode;

  return newState;
};

// ============================================
// NÓ 3: SEARCH (Buscar Pokémon)
// ============================================
const searchNode = async (state) => {
  console.log('[NODE] searchNode - Buscando Pokémon');

  const input = state.userInput.trim().toLowerCase();
  
  // Verificar comando "voltar" antes de processar
  const voltarResult = utils.handleVoltarCommand(state, input);
  if (voltarResult.handled) {
    // Se deve re-executar, mostrar mensagem do nó de destino
    if (voltarResult.shouldReExecute) {
      // Se voltou para o menu, mostrar boas-vindas
      if (voltarResult.state.currentNode === 'menu') {
        const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.WELCOME_MESSAGE);
        messageState.userInput = '';
        return messageState;
      }
      // Outros nós mostram suas mensagens específicas
      const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.MENU_SEARCH_OPTION);
      messageState.userInput = '';
      return messageState;
    }
    return voltarResult.state;
  }

  let newState = utils.addMessage(state, 'user', input);

  // Verificar comandos especiais antes de buscar Pokémon
  if (input.includes('menu')) {
    newState = utils.addMessage(newState, 'assistant', botMessages.WELCOME_MESSAGE);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }
  
  if (input.includes('evol')) {
    newState = utils.addMessage(newState, 'assistant', botMessages.GOING_TO_EVOLUTION);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'evolution';
    return newState;
  }

  try {
    // Buscar Pokémon
    const pokemon = await pokeService.getPokemon(input);
    
    // Buscar informações da espécie
    const species = await pokeService.getSpecies(pokemon.speciesId);

    const response = botMessages.createPokemonInfoMessage(pokemon, species);

    newState = utils.addMessage(newState, 'assistant', response, pokemon);
    newState = utils.updateContext(newState, {
      pokemonData: pokemon,
      waitingFor: 'next_action',
      lastError: null
    });
    newState = utils.incrementInteraction(newState);
    
    // Marca que o input foi processado e aguarda próxima ação
    newState.userInput = '';
    newState.currentNode = 'search';

  } catch (error) {
    console.error('[ERROR] searchNode:', error.message);

    let errorMessage = '';
    
    if (error.message === 'POKEMON_NOT_FOUND') {
      // Tentar sugestões
      try {
        const suggestions = await pokeService.searchPokemon(input, 5);
        if (suggestions.length > 0) {
          errorMessage = botMessages.createPokemonNotFoundWithSuggestions(input, suggestions);
        } else {
          errorMessage = botMessages.createPokemonNotFound(input);
        }
      } catch (e) {
        errorMessage = botMessages.createPokemonNotFound(input);
      }
    } else {
      errorMessage = botMessages.createGenericError(error.message);
    }

    newState = utils.addMessage(newState, 'assistant', errorMessage);
    newState = utils.updateContext(newState, {
      lastError: error.message,
      waitingFor: 'pokemon_input'
    });
    
    // Marca que o input foi processado (mesmo com erro)
    newState.userInput = '';
    newState.currentNode = 'search';
  }

  return newState;
};

// ============================================
// NÓ 4: COMPARE (Comparar Pokémon)
// ============================================
const compareNode = async (state) => {
  console.log('[NODE] compareNode - Comparando Pokémon');

  const input = state.userInput.trim();
  
  // Verificar comando "voltar" antes de processar
  const voltarResult = utils.handleVoltarCommand(state, input);
  if (voltarResult.handled) {
    // Se deve re-executar, mostrar mensagem do nó de destino
    if (voltarResult.shouldReExecute) {
      // Se voltou para o menu, mostrar boas-vindas
      if (voltarResult.state.currentNode === 'menu') {
        const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.WELCOME_MESSAGE);
        messageState.userInput = '';
        return messageState;
      }
      const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.MENU_COMPARE_OPTION);
      messageState.userInput = '';
      return messageState;
    }
    return voltarResult.state;
  }

  let newState = utils.addMessage(state, 'user', input);

  // Verificar comando "menu"
  if (input.includes('menu')) {
    newState = utils.addMessage(newState, 'assistant', botMessages.WELCOME_MESSAGE);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }

  try {
    // Parse entrada (espera "pokemon1, pokemon2")
    const parts = input.split(',').map(p => p.trim()).filter(p => p);

    if (parts.length !== 2) {
      throw new Error(botMessages.createCompareInstructionError());
    }

    // Buscar ambos os Pokémon
    const [pokemon1, pokemon2] = await pokeService.getMultiplePokemon(parts);

    const response = botMessages.createComparisonMessage(pokemon1, pokemon2);

    newState = utils.addMessage(newState, 'assistant', response, { pokemon1, pokemon2 });
    newState = utils.updateContext(newState, {
      comparisonData: [pokemon1, pokemon2],
      waitingFor: 'next_action',
      lastError: null
    });
    newState = utils.incrementInteraction(newState);
    
    // Marca que o input foi processado e aguarda próxima ação
    newState.userInput = '';
    newState.currentNode = 'compare';

  } catch (error) {
    console.error('[ERROR] compareNode:', error.message);

    const errorMessage = botMessages.createCompareError(error.message);
    
    newState = utils.addMessage(newState, 'assistant', errorMessage);
    newState = utils.updateContext(newState, {
      lastError: error.message,
      waitingFor: 'pokemon_input'
    });
    
    // Marca que o input foi processado (mesmo com erro)
    newState.userInput = '';
    newState.currentNode = 'compare';
  }

  return newState;
};

// ============================================
// NÓ 5: EVOLUTION (Cadeia de Evolução)
// ============================================
const evolutionNode = async (state) => {
  console.log('[NODE] evolutionNode - Buscando evolução');

  const input = state.userInput.trim();
  
  // Verificar comando "voltar" antes de processar
  const voltarResult = utils.handleVoltarCommand(state, input);
  if (voltarResult.handled) {
    // Se deve re-executar, mostrar mensagem do nó de destino
    if (voltarResult.shouldReExecute) {
      // Se voltou para o menu, mostrar boas-vindas
      if (voltarResult.state.currentNode === 'menu') {
        const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.WELCOME_MESSAGE);
        messageState.userInput = '';
        return messageState;
      }
      const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.MENU_EVOLUTION_OPTION);
      messageState.userInput = '';
      return messageState;
    }
    return voltarResult.state;
  }

  let newState = utils.addMessage(state, 'user', input);

  // Verificar comando "menu"
  if (input.includes('menu')) {
    newState = utils.addMessage(newState, 'assistant', botMessages.WELCOME_MESSAGE);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }

  try {
    // Buscar Pokémon
    const pokemon = await pokeService.getPokemon(input);
    const species = await pokeService.getSpecies(pokemon.speciesId);
    const evolutionChain = await pokeService.getEvolutionChain(species.evolutionChainId);

    const response = botMessages.createEvolutionMessage(pokemon, evolutionChain);

    newState = utils.addMessage(newState, 'assistant', response, evolutionChain);
    newState = utils.updateContext(newState, {
      evolutionChain,
      waitingFor: 'next_action',
      lastError: null
    });
    newState = utils.incrementInteraction(newState);
    
    // Marca que o input foi processado e aguarda próxima ação
    newState.userInput = '';
    newState.currentNode = 'evolution';

  } catch (error) {
    console.error('[ERROR] evolutionNode:', error.message);

    const errorMessage = botMessages.createEvolutionError(error.message);
    
    newState = utils.addMessage(newState, 'assistant', errorMessage);
    newState = utils.updateContext(newState, {
      lastError: error.message
    });
    
    // Marca que o input foi processado (mesmo com erro)
    newState.userInput = '';
    newState.currentNode = 'evolution';
  }

  return newState;
};

// ============================================
// NÓ 6: TYPE_SEARCH (Buscar por Tipo)
// ============================================
const typeSearchNode = async (state) => {
  console.log('[NODE] typeSearchNode - Buscando por tipo');

  const input = state.userInput.trim().toLowerCase();
  
  // Verificar comando "voltar" antes de processar
  const voltarResult = utils.handleVoltarCommand(state, input);
  if (voltarResult.handled) {
    // Se deve re-executar, mostrar mensagem do nó de destino
    if (voltarResult.shouldReExecute) {
      // Se voltou para o menu, mostrar boas-vindas
      if (voltarResult.state.currentNode === 'menu') {
        const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.WELCOME_MESSAGE);
        messageState.userInput = '';
        return messageState;
      }
      const messageState = utils.addMessage(voltarResult.state, 'assistant', botMessages.MENU_TYPE_OPTION);
      messageState.userInput = '';
      return messageState;
    }
    return voltarResult.state;
  }

  let newState = utils.addMessage(state, 'user', input);

  // Verificar comandos especiais antes de buscar por tipo
  if (input.includes('menu')) {
    newState = utils.addMessage(newState, 'assistant', botMessages.WELCOME_MESSAGE);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }

  // Lista de tipos válidos de Pokémon
  const validTypes = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Verificar se já mostrou uma lista de tipo anteriormente
  const hasShownTypeList = state.context.lastTypeSearched;

  // Se não for um tipo válido
  if (!validTypes.includes(input)) {
    // Se já mostrou lista de tipo, tentar buscar como Pokémon
    if (hasShownTypeList) {
      console.log('[NODE] typeSearchNode - Tentando buscar Pokémon após lista de tipo');
      
      try {
        const pokemon = await pokeService.getPokemon(input);
        const species = await pokeService.getSpecies(pokemon.speciesId);

        const response = botMessages.createPokemonInfoMessage(pokemon, species);

        newState = utils.addMessage(newState, 'assistant', response, pokemon);
        newState = utils.updateContext(newState, {
          pokemonData: pokemon,
          waitingFor: 'next_action',
          lastError: null,
          lastTypeSearched: null // Limpa o contexto de tipo
        });
        newState = utils.incrementInteraction(newState);
        newState.userInput = '';
        newState.currentNode = 'type_search'; // Permanece em type_search
        return newState;
      } catch (error) {
        console.error('[ERROR] typeSearchNode - Erro ao buscar Pokémon:', error.message);
        
        let errorMessage = '';
        if (error.message === 'POKEMON_NOT_FOUND') {
          try {
            const suggestions = await pokeService.searchPokemon(input, 5);
            if (suggestions.length > 0) {
              errorMessage = botMessages.createPokemonNotFoundWithSuggestions(input, suggestions);
            } else {
              errorMessage = botMessages.createPokemonNotFound(input);
            }
          } catch (e) {
            errorMessage = botMessages.createPokemonNotFound(input);
          }
        } else {
          errorMessage = botMessages.createGenericError(error.message);
        }

        newState = utils.addMessage(newState, 'assistant', errorMessage);
        newState = utils.updateContext(newState, {
          lastError: error.message,
          waitingFor: 'pokemon_input'
        });
        newState.userInput = '';
        newState.currentNode = 'type_search';
        return newState;
      }
    }
    
    // Se não mostrou lista ainda, exigir tipo válido
    console.log('[NODE] typeSearchNode - Input não é tipo válido');
    
    const errorMessage = botMessages.TYPE_SEARCH_INVALID_INPUT(input);

    newState = utils.addMessage(newState, 'assistant', errorMessage);
    newState = utils.updateContext(newState, {
      lastError: 'INVALID_TYPE',
      waitingFor: 'pokemon_input'
    });
    newState.userInput = '';
    newState.currentNode = 'type_search';
    return newState;
  }

  // Se chegou aqui, é um tipo válido - buscar Pokémon desse tipo
  try {
    const pokemonList = await pokeService.getPokemonByType(input);

    const response = botMessages.createTypeSearchMessage(input, pokemonList);

    newState = utils.addMessage(newState, 'assistant', response, pokemonList);
    newState = utils.updateContext(newState, {
      waitingFor: 'next_action',
      lastError: null,
      lastTypeSearched: input // Marca que mostrou lista de tipo
    });
    newState = utils.incrementInteraction(newState);
    
    // Marca que o input foi processado e aguarda próxima ação
    newState.userInput = '';
    newState.currentNode = 'type_search';

  } catch (error) {
    console.error('[ERROR] typeSearchNode:', error.message);

    const errorMessage = botMessages.TYPE_SEARCH_INVALID(input);
    
    newState = utils.addMessage(newState, 'assistant', errorMessage);
    newState = utils.updateContext(newState, {
      lastError: error.message
    });
    
    // Marca que o input foi processado (mesmo com erro)
    newState.userInput = '';
    newState.currentNode = 'type_search';
  }

  return newState;
};

// ============================================
// NÓ 7: END (Finalizar)
// ============================================
const endNode = async (state) => {
  console.log('[NODE] endNode - Finalizando conversa');

  const sessionDuration = Date.now() - state.metadata.startTime;
  const minutes = Math.floor(sessionDuration / 60000);
  const seconds = Math.floor((sessionDuration % 60000) / 1000);

  const response = botMessages.createEndMessage(state.metadata.interactionCount, minutes, seconds);

  let newState = utils.addMessage(state, 'assistant', response);
  newState.currentNode = 'end';

  return newState;
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  initialState,
  nodes: {
    start: startNode,
    menu: menuNode,
    search: searchNode,
    compare: compareNode,
    evolution: evolutionNode,
    type_search: typeSearchNode,
    end: endNode
  },
  utils
};
/**
 * Nós da Máquina de Estados do Chatbot Pokémon
 * Cada nó representa um estado e contém a lógica de processamento
 */

const PokeAPIService = require('../services/pokeapi');

// Inicializar serviço
const pokeService = new PokeAPIService();

// ============================================
// ESTADO COMPARTILHADO (State Schema)
// ============================================
const initialState = {
  messages: [],           // Histórico de mensagens
  userInput: '',          // Última entrada do usuário
  currentNode: 'start',   // Nó atual
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
  }
};

// ============================================
// NÓ 1: START (Boas-vindas)
// ============================================
const startNode = async (state) => {
  console.log('[NODE] startNode - Iniciando conversa');

  const welcomeMessage = `
🎮 **Bem-vindo ao PokéDex Assistant!**

Olá, Treinador! Eu sou seu assistente pessoal do mundo Pokémon. 

Posso te ajudar a:
1️⃣ Buscar informações de qualquer Pokémon
2️⃣ Comparar dois Pokémon lado a lado
3️⃣ Ver cadeias de evolução
4️⃣ Buscar Pokémon por tipo

Digite o **número da opção** ou me diga o que você quer fazer!`;

  let newState = utils.addMessage(state, 'assistant', welcomeMessage);
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

  // Detectar intenção do usuário
  let nextNode = 'menu';
  let responseMessage = '';

  // Opção 1: Buscar Pokémon
  if (input.includes('1') || input.includes('buscar') || input.includes('procurar') || input.includes('informação')) {
    nextNode = 'search';
    responseMessage = '🔍 **Buscar Pokémon**\n\nDigite o nome ou número do Pokémon que você quer conhecer!\nExemplo: "Pikachu" ou "25"';
  }
  // Opção 2: Comparar
  else if (input.includes('2') || input.includes('comparar') || input.includes('comparação')) {
    nextNode = 'compare';
    responseMessage = '⚖️ **Comparar Pokémon**\n\nDigite o nome ou número de dois Pokémon separados por vírgula.\nExemplo: "Charizard, Blastoise" ou "6, 9"';
  }
  // Opção 3: Evolução
  else if (input.includes('3') || input.includes('evolução') || input.includes('evoluir')) {
    nextNode = 'evolution';
    responseMessage = '🔄 **Cadeia de Evolução**\n\nDigite o nome ou número do Pokémon para ver sua linha evolutiva completa!';
  }
  // Opção 4: Por tipo
  else if (input.includes('4') || input.includes('tipo') || input.includes('type')) {
    nextNode = 'type_search';
    responseMessage = '🏷️ **Buscar por Tipo**\n\nDigite o tipo de Pokémon que procura:\n(fire, water, grass, electric, psychic, dragon, etc.)';
  }
  // Opção de sair
  else if (input.includes('sair') || input.includes('tchau') || input.includes('bye')) {
    nextNode = 'end';
    responseMessage = '👋 Até logo, Treinador! Foi ótimo te ajudar na sua jornada Pokémon!';
  }
  // Entrada inválida
  else {
    responseMessage = `
❌ Desculpe, não entendi sua escolha.

Por favor, escolha uma das opções:
1️⃣ Buscar Pokémon
2️⃣ Comparar Pokémon
3️⃣ Ver Evolução
4️⃣ Buscar por Tipo

Ou digite "sair" para encerrar.`;
  }

  let newState = utils.addMessage(state, 'user', state.userInput);
  newState = utils.addMessage(newState, 'assistant', responseMessage);
  newState = utils.updateContext(newState, { 
    waitingFor: nextNode === 'menu' ? 'menu_choice' : 'pokemon_input' 
  });
  newState = utils.incrementInteraction(newState);
  
  // Limpa o input após processar a escolha do menu
  newState.userInput = '';
  newState.currentNode = nextNode;

  return newState;
};

// ============================================
// NÓ 3: SEARCH (Buscar Pokémon)
// ============================================
const searchNode = async (state) => {
  console.log('[NODE] searchNode - Buscando Pokémon');

  const input = state.userInput.trim().toLowerCase();
  let newState = utils.addMessage(state, 'user', input);

  // Verificar comandos especiais antes de buscar Pokémon
  if (input.includes('menu')) {
    const response = '📋 Voltando ao menu principal...';
    newState = utils.addMessage(newState, 'assistant', response);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }
  
  if (input.includes('evol')) {
    const response = '🔄 Indo para visualização de evolução...';
    newState = utils.addMessage(newState, 'assistant', response);
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

    const response = `
✨ **${pokemon.nameCapitalized}** #${pokemon.id}

📝 ${species.description}

🏷️ **Tipo(s):** ${pokemon.types.map(t => t.toUpperCase()).join(', ')}
📏 **Altura:** ${pokemon.height}m
⚖️ **Peso:** ${pokemon.weight}kg

${utils.formatStats(pokemon.stats)}

💫 **Habilidades:**
${pokemon.abilities.map(a => `• ${a.name}${a.isHidden ? ' (oculta)' : ''}`).join('\n')}

${species.isLegendary ? '👑 **Pokémon Lendário!**' : ''}
${species.isMythical ? '✨ **Pokémon Mítico!**' : ''}

---
O que você quer fazer agora?
• Digite outro Pokémon para buscar
• Digite "evoluir" para ver a cadeia evolutiva
• Digite "menu" para voltar ao menu principal`;

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
          errorMessage = `
❌ Pokémon "${input}" não encontrado.

🤔 Você quis dizer:
${suggestions.map(s => `• ${s}`).join('\n')}

Tente novamente ou digite "menu" para voltar.`;
        } else {
          errorMessage = `❌ Pokémon "${input}" não encontrado.\n\nTente outro nome ou número, ou digite "menu" para voltar.`;
        }
      } catch (e) {
        errorMessage = `❌ Pokémon "${input}" não encontrado.\n\nTente outro nome ou número, ou digite "menu" para voltar.`;
      }
    } else {
      errorMessage = `❌ Erro ao buscar Pokémon: ${error.message}\n\nTente novamente ou digite "menu" para voltar.`;
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
  let newState = utils.addMessage(state, 'user', input);

  try {
    // Parse entrada (espera "pokemon1, pokemon2")
    const parts = input.split(',').map(p => p.trim()).filter(p => p);

    if (parts.length !== 2) {
      throw new Error('Por favor, forneça dois Pokémon separados por vírgula.\nExemplo: "Pikachu, Raichu"');
    }

    // Buscar ambos os Pokémon
    const [pokemon1, pokemon2] = await pokeService.getMultiplePokemon(parts);

    const response = `
⚖️ **Comparação: ${pokemon1.nameCapitalized} vs ${pokemon2.nameCapitalized}**

╔════════════════╦══════════╦══════════╗
║ **Estatística**    ║ **${pokemon1.nameCapitalized}** ║ **${pokemon2.nameCapitalized}** ║
╠════════════════╬══════════╬══════════╣
║ HP             ║ ${String(pokemon1.stats.hp).padEnd(8)} ║ ${String(pokemon2.stats.hp).padEnd(8)} ║
║ Ataque         ║ ${String(pokemon1.stats.attack).padEnd(8)} ║ ${String(pokemon2.stats.attack).padEnd(8)} ║
║ Defesa         ║ ${String(pokemon1.stats.defense).padEnd(8)} ║ ${String(pokemon2.stats.defense).padEnd(8)} ║
║ Atq. Especial  ║ ${String(pokemon1.stats.specialAttack).padEnd(8)} ║ ${String(pokemon2.stats.specialAttack).padEnd(8)} ║
║ Def. Especial  ║ ${String(pokemon1.stats.specialDefense).padEnd(8)} ║ ${String(pokemon2.stats.specialDefense).padEnd(8)} ║
║ Velocidade     ║ ${String(pokemon1.stats.speed).padEnd(8)} ║ ${String(pokemon2.stats.speed).padEnd(8)} ║
╠════════════════╬══════════╬══════════╣
║ **TOTAL**          ║ **${String(pokemon1.stats.total).padEnd(8)}** ║ **${String(pokemon2.stats.total).padEnd(8)}** ║
╚════════════════╩══════════╩══════════╝

🏷️ **Tipos:**
• ${pokemon1.nameCapitalized}: ${pokemon1.types.join(', ')}
• ${pokemon2.nameCapitalized}: ${pokemon2.types.join(', ')}

${pokemon1.stats.total > pokemon2.stats.total 
  ? `🏆 ${pokemon1.nameCapitalized} tem stats totais superiores!` 
  : pokemon1.stats.total < pokemon2.stats.total 
    ? `🏆 ${pokemon2.nameCapitalized} tem stats totais superiores!`
    : `⚖️ Ambos têm stats totais iguais!`}

---
Digite "menu" para voltar ou compare outros Pokémon!`;

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

    const errorMessage = `❌ ${error.message}\n\nTente novamente ou digite "menu" para voltar.`;
    
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
  let newState = utils.addMessage(state, 'user', input);

  try {
    // Buscar Pokémon
    const pokemon = await pokeService.getPokemon(input);
    const species = await pokeService.getSpecies(pokemon.speciesId);
    const evolutionChain = await pokeService.getEvolutionChain(species.evolutionChainId);

    const response = `
🔄 **Cadeia Evolutiva de ${pokemon.nameCapitalized}**

${evolutionChain.map((evo, index) => {
  const arrow = index < evolutionChain.length - 1 ? ' ➡️ ' : '';
  return `**${evo.nameCapitalized}**${arrow}`;
}).join('')}

📊 Total de formas: ${evolutionChain.length}

---
Digite outro Pokémon ou "menu" para voltar.`;

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

    const errorMessage = `❌ Erro ao buscar evolução: ${error.message}\n\nTente novamente ou digite "menu" para voltar.`;
    
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
  let newState = utils.addMessage(state, 'user', input);

  // Verificar comandos especiais antes de buscar por tipo
  if (input.includes('menu')) {
    const response = '📋 Voltando ao menu principal...';
    newState = utils.addMessage(newState, 'assistant', response);
    newState = utils.incrementInteraction(newState);
    newState.userInput = '';
    newState.currentNode = 'menu';
    return newState;
  }

  try {
    const pokemonList = await pokeService.getPokemonByType(input);

    const response = `
🏷️ **Pokémon do tipo ${input.toUpperCase()}**

${pokemonList.slice(0, 15).map((p, i) => `${i + 1}. ${p.name}`).join('\n')}

${pokemonList.length > 15 ? `\n... e mais ${pokemonList.length - 15} Pokémon!` : ''}

---
Digite o nome de um Pokémon para mais detalhes ou "menu" para voltar.`;

    newState = utils.addMessage(newState, 'assistant', response, pokemonList);
    newState = utils.updateContext(newState, {
      waitingFor: 'next_action',
      lastError: null
    });
    newState = utils.incrementInteraction(newState);
    
    // Marca que o input foi processado e aguarda próxima ação
    newState.userInput = '';
    newState.currentNode = 'type_search';

  } catch (error) {
    console.error('[ERROR] typeSearchNode:', error.message);

    const errorMessage = `
❌ Tipo "${input}" não encontrado.

Tipos válidos incluem:
• normal, fire, water, grass, electric
• ice, fighting, poison, ground, flying
• psychic, bug, rock, ghost, dragon
• dark, steel, fairy

Tente novamente ou digite "menu" para voltar.`;
    
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

  const response = `
👋 **Até logo, Treinador!**

📊 **Resumo da sessão:**
• Interações: ${state.metadata.interactionCount}
• Duração: ${minutes}m ${seconds}s

Obrigado por usar o PokéDex Assistant! 
Volte sempre que precisar de ajuda na sua jornada Pokémon! 🎮✨`;

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
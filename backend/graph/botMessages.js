/**
 * Mensagens do Bot - Constantes reutilizáveis
 * Todas as mensagens do chatbot centralizadas para fácil manutenção
 */

// ============================================
// MENSAGENS DO MENU PRINCIPAL
// ============================================
const WELCOME_MESSAGE = `
🎮 **Bem-vindo ao PokéDex Assistant!**

Olá, Treinador! Eu sou seu assistente pessoal do mundo Pokémon. 

Posso te ajudar a:
1️⃣ Buscar informações de qualquer Pokémon
2️⃣ Comparar dois Pokémon lado a lado
3️⃣ Ver cadeias de evolução
4️⃣ Buscar Pokémon por tipo

Digite o **número da opção** ou me diga o que você quer fazer!`;

const MENU_SEARCH_OPTION = '🔍 **Buscar Pokémon**\n\nDigite o nome ou número do Pokémon que você quer conhecer!\nExemplo: "Pikachu" ou "25"';

const MENU_COMPARE_OPTION = '⚖️ **Comparar Pokémon**\n\nDigite o nome ou número de dois Pokémon separados por vírgula.\nExemplo: "Charizard, Blastoise" ou "6, 9"';

const MENU_EVOLUTION_OPTION = '🔄 **Cadeia de Evolução**\n\nDigite o nome ou número do Pokémon para ver sua linha evolutiva completa!';

const MENU_TYPE_OPTION = '🏷️ **Buscar por Tipo**\n\nDigite o tipo de Pokémon que procura:\n(fire, water, grass, electric, psychic, dragon, etc.)';

const MENU_EXIT_MESSAGE = '👋 Até logo, Treinador! Foi ótimo te ajudar na sua jornada Pokémon!';

const MENU_INVALID_CHOICE = `
❌ Desculpe, não entendi sua escolha.

Por favor, escolha uma das opções:
1️⃣ Buscar Pokémon
2️⃣ Comparar Pokémon
3️⃣ Ver Evolução
4️⃣ Buscar por Tipo

Ou digite "sair" para encerrar.`;

// ============================================
// MENSAGENS DE NAVEGAÇÃO
// ============================================
const BACK_TO_MENU = '📋 Voltando ao menu principal...';

const GOING_TO_EVOLUTION = '🔄 Indo para visualização de evolução...';

const VOLTAR_SUCCESS = '⬅️ Voltando à etapa anterior...';

const VOLTAR_AT_START = 'ℹ️ Você já está no início da conversa.';

// ============================================
// MENSAGENS DE BUSCA DE POKÉMON
// ============================================
const createPokemonInfoMessage = (pokemon, species) => `
✨ **${pokemon.nameCapitalized}** #${pokemon.id}

📝 ${species.description}

🏷️ **Tipo(s):** ${pokemon.types.map(t => t.toUpperCase()).join(', ')}
📏 **Altura:** ${pokemon.height}m
⚖️ **Peso:** ${pokemon.weight}kg

📊 **Estatísticas:**
❤️  HP: ${pokemon.stats.hp}
⚔️  Ataque: ${pokemon.stats.attack}
🛡️  Defesa: ${pokemon.stats.defense}
✨ Atq. Especial: ${pokemon.stats.specialAttack}
🌟 Def. Especial: ${pokemon.stats.specialDefense}
⚡ Velocidade: ${pokemon.stats.speed}
💪 **Total: ${pokemon.stats.total}**

💫 **Habilidades:**
${pokemon.abilities.map(a => `• ${a.name}${a.isHidden ? ' (oculta)' : ''}`).join('\n')}

${species.isLegendary ? '👑 **Pokémon Lendário!**' : ''}
${species.isMythical ? '✨ **Pokémon Mítico!**' : ''}

---
O que você quer fazer agora?
• Digite outro Pokémon para buscar
• Digite "evoluir" para ver a cadeia evolutiva
• Digite "menu" para voltar ao menu principal`;

const createPokemonNotFoundWithSuggestions = (input, suggestions) => `
❌ Pokémon "${input}" não encontrado.

🤔 Você quis dizer:
${suggestions.map(s => `• ${s}`).join('\n')}

Tente novamente ou digite "menu" para voltar.`;

const createPokemonNotFound = (input) => 
  `❌ Pokémon "${input}" não encontrado.\n\nTente outro nome ou número, ou digite "menu" para voltar.`;

const createGenericError = (errorMessage) => 
  `❌ Erro ao buscar Pokémon: ${errorMessage}\n\nTente novamente ou digite "menu" para voltar.`;

// ============================================
// MENSAGENS DE COMPARAÇÃO
// ============================================
const createCompareInstructionError = () => 
  'Por favor, forneça dois Pokémon separados por vírgula.\nExemplo: "Pikachu, Raichu"';

const createComparisonMessage = (pokemon1, pokemon2) => {
  const winner = pokemon1.stats.total > pokemon2.stats.total 
    ? `🏆 ${pokemon1.nameCapitalized} tem stats totais superiores!` 
    : pokemon1.stats.total < pokemon2.stats.total 
      ? `🏆 ${pokemon2.nameCapitalized} tem stats totais superiores!`
      : `⚖️ Ambos têm stats totais iguais!`;

  return `
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

${winner}

---
Digite "menu" para voltar ou compare outros Pokémon!`;
};

const createCompareError = (errorMessage) => 
  `❌ ${errorMessage}\n\nTente novamente ou digite "menu" para voltar.`;

// ============================================
// MENSAGENS DE EVOLUÇÃO
// ============================================
const createEvolutionMessage = (pokemon, evolutionChain) => `
🔄 **Cadeia Evolutiva de ${pokemon.nameCapitalized}**

${evolutionChain.map((evo, index) => {
  const arrow = index < evolutionChain.length - 1 ? ' ➡️ ' : '';
  return `**${evo.nameCapitalized}**${arrow}`;
}).join('')}

📊 Total de formas: ${evolutionChain.length}

---
Digite outro Pokémon ou "menu" para voltar.`;

const createEvolutionError = (errorMessage) => 
  `❌ Erro ao buscar evolução: ${errorMessage}\n\nTente novamente ou digite "menu" para voltar.`;

// ============================================
// MENSAGENS DE BUSCA POR TIPO
// ============================================
const createTypeSearchMessage = (type, pokemonList) => `
🏷️ **Pokémon do tipo ${type.toUpperCase()}**

${pokemonList.slice(0, 15).map((p, i) => `${i + 1}. ${p.name}`).join('\n')}

${pokemonList.length > 15 ? `\n... e mais ${pokemonList.length - 15} Pokémon!` : ''}

---
Digite o nome de um Pokémon para mais detalhes ou "menu" para voltar.`;

const TYPE_SEARCH_INVALID = (input) => `
❌ Tipo "${input}" não encontrado.

Tipos válidos incluem:
• normal, fire, water, grass, electric
• ice, fighting, poison, ground, flying
• psychic, bug, rock, ghost, dragon
• dark, steel, fairy

Tente novamente ou digite "menu" para voltar.`;

// ============================================
// MENSAGENS DE FINALIZAÇÃO
// ============================================
const createEndMessage = (interactionCount, minutes, seconds) => `
👋 **Até logo, Treinador!**

📊 **Resumo da sessão:**
• Interações: ${interactionCount}
• Duração: ${minutes}m ${seconds}s

Obrigado por usar o PokéDex Assistant! 
Volte sempre que precisar de ajuda na sua jornada Pokémon! 🎮✨`;

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Menu
  WELCOME_MESSAGE,
  MENU_SEARCH_OPTION,
  MENU_COMPARE_OPTION,
  MENU_EVOLUTION_OPTION,
  MENU_TYPE_OPTION,
  MENU_EXIT_MESSAGE,
  MENU_INVALID_CHOICE,
  
  // Navegação
  BACK_TO_MENU,
  GOING_TO_EVOLUTION,
  VOLTAR_SUCCESS,
  VOLTAR_AT_START,
  
  // Busca
  createPokemonInfoMessage,
  createPokemonNotFoundWithSuggestions,
  createPokemonNotFound,
  createGenericError,
  
  // Comparação
  createCompareInstructionError,
  createComparisonMessage,
  createCompareError,
  
  // Evolução
  createEvolutionMessage,
  createEvolutionError,
  
  // Tipo
  createTypeSearchMessage,
  TYPE_SEARCH_INVALID,
  
  // Finalização
  createEndMessage
};


import React from 'react';
import { useChat } from '../hooks/useChat';

const SuggestionButtons = () => {
  const { postMessage, messages, isLoading, currentState } = useChat();
  

  // Determinar sugestões baseadas no estado atual do nó
  const getSuggestions = () => {
    const currentNode = currentState?.node;
    const waitingFor = currentState?.waitingFor;


    // Sugestões baseadas no nó atual
    switch (currentNode) {
      case 'menu':
        return [
          { text: "Buscar Pokémon", icon: "🔍", action: "1" },
          { text: "Comparar Pokémon", icon: "⚔️", action: "2" },
          { text: "Ver Evolução", icon: "🔄", action: "3" },
          { text: "Buscar por Tipo", icon: "🏷️", action: "4" }
        ];

      case 'search':
        if (waitingFor === 'pokemon_input') {
          return [
            { text: "Pikachu", icon: "⚡", action: "Pikachu" },
            { text: "Charizard", icon: "🔥", action: "Charizard" },
            { text: "Blastoise", icon: "💧", action: "Blastoise" },
            { text: "Venusaur", icon: "🌱", action: "Venusaur" },
            { text: "Mewtwo", icon: "🧠", action: "Mewtwo" },
            { text: "Mew", icon: "✨", action: "Mew" },
            { text: "Voltar ao Menu", icon: "📋", action: "menu" }
          ];
        }
        return [
          { text: "Voltar ao Menu", icon: "📋", action: "menu" },
          { text: "Buscar Outro", icon: "🔍", action: "Pikachu" }
        ];

      case 'compare':
        if (waitingFor === 'pokemon_input') {
          return [
            { text: "Pikachu vs Raichu", icon: "⚡", action: "Pikachu, Raichu" },
            { text: "Charizard vs Blastoise", icon: "🔥", action: "Charizard, Blastoise" },
            { text: "Mewtwo vs Mew", icon: "🧠", action: "Mewtwo, Mew" },
            { text: "Gengar vs Alakazam", icon: "👻", action: "Gengar, Alakazam" },
            { text: "Voltar ao Menu", icon: "📋", action: "menu" }
          ];
        }
        return [
          { text: "Comparar Outros", icon: "⚔️", action: "Pikachu, Raichu" },
          { text: "Voltar ao Menu", icon: "📋", action: "menu" }
        ];

      case 'evolution':
        if (waitingFor === 'pokemon_input') {
          return [
            { text: "Pikachu", icon: "⚡", action: "Pikachu" },
            { text: "Charmander", icon: "🔥", action: "Charmander" },
            { text: "Squirtle", icon: "💧", action: "Squirtle" },
            { text: "Bulbasaur", icon: "🌱", action: "Bulbasaur" },
            { text: "Eevee", icon: "⭐", action: "Eevee" },
            { text: "Voltar ao Menu", icon: "📋", action: "menu" }
          ];
        }
        return [
          { text: "Ver Outra Evolução", icon: "🔄", action: "Pikachu" },
          { text: "Voltar ao Menu", icon: "📋", action: "menu" }
        ];

      case 'type_search':
        if (waitingFor === 'pokemon_input') {
          return [
            { text: "Fire", icon: "🔥", action: "fire" },
            { text: "Water", icon: "💧", action: "water" },
            { text: "Grass", icon: "🌱", action: "grass" },
            { text: "Electric", icon: "⚡", action: "electric" },
            { text: "Psychic", icon: "🧠", action: "psychic" },
            { text: "Dragon", icon: "🐉", action: "dragon" },
            { text: "Voltar ao Menu", icon: "📋", action: "menu" }
          ];
        }
        return [
          { text: "Buscar Outro Tipo", icon: "🏷️", action: "fire" },
          { text: "Voltar ao Menu", icon: "📋", action: "menu" }
        ];

      default:
        // Fallback para sugestões genéricas
        return [
          { text: "Buscar Pokémon", icon: "🔍", action: "1" },
          { text: "Comparar Pokémon", icon: "⚔️", action: "2" },
          { text: "Ver Evolução", icon: "🔄", action: "3" },
          { text: "Buscar por Tipo", icon: "🏷️", action: "4" }
        ];
    }
  };

  const suggestions = getSuggestions();

  const handleSuggestion = (action) => {
    if (!isLoading) {
      postMessage(action);
    }
  };

  // Não mostrar sugestões se estiver carregando
  if (isLoading) {
    return null;
  }

  return (
    <div className="px-3 sm:px-6 pb-3 sm:pb-4 animate-fade-in">
      <div className="max-w-full mx-auto">
        <p className="text-xs text-blue-500 font-sans mb-2 sm:mb-3 text-center hidden sm:block">
          💡 Sugestões rápidas:
        </p>
        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion.action)}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-white border-2 border-yellow-200 
                       rounded-full text-blue-700 font-sans text-xs font-medium
                       hover:border-yellow-400 hover:bg-yellow-50
                       transition-all duration-200 hover:scale-105 active:scale-95
                       shadow-lg hover:shadow-xl cursor-pointer"
              disabled={isLoading}
            >
              <span className="flex items-center space-x-1">
                <span className="text-xs sm:text-sm">{suggestion.icon}</span>
                <span className="hidden sm:inline">{suggestion.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionButtons;

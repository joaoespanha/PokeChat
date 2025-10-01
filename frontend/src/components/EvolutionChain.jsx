// frontend/src/components/EvolutionChain.jsx
import React from 'react';

const EvolutionChain = ({ evolutionChain }) => {
  // Função para obter cores baseadas no tipo
  const getTypeColor = (type) => {
    const typeColors = {
      fire: 'from-red-500 to-red-600',
      water: 'from-blue-500 to-blue-600',
      grass: 'from-green-500 to-green-600',
      electric: 'from-yellow-400 to-yellow-500',
      psychic: 'from-purple-500 to-purple-600',
      ice: 'from-cyan-300 to-cyan-400',
      dragon: 'from-purple-600 to-purple-700',
      dark: 'from-gray-700 to-gray-800',
      fairy: 'from-pink-400 to-pink-500',
      fighting: 'from-orange-500 to-orange-600',
      poison: 'from-purple-400 to-purple-500',
      ground: 'from-yellow-500 to-yellow-600',
      flying: 'from-blue-300 to-blue-400',
      bug: 'from-green-400 to-green-500',
      rock: 'from-gray-500 to-gray-600',
      ghost: 'from-purple-500 to-purple-600',
      steel: 'from-gray-400 to-gray-500',
      normal: 'from-gray-300 to-gray-400'
    };
    return typeColors[type.toLowerCase()] || 'from-gray-400 to-gray-600';
  };

  // Função para obter a cor de fundo baseada no tipo principal
  const getPrimaryTypeColor = (pokemon) => {
    if (pokemon.types && pokemon.types.length > 0) {
      return getTypeColor(pokemon.types[0]);
    }
    return 'from-gray-400 to-gray-600';
  };

  // Função para formatar o nome do Pokémon
  const formatPokemonName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl animate-fade-in">
      {/* Cabeçalho com gradiente */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          }}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold mb-2">
            🔄 Cadeia Evolutiva 🔄
          </h3>
          <p className="text-sm sm:text-base opacity-90">
            Descubra todas as formas evolutivas desta linha Pokémon
          </p>
        </div>
      </div>

      {/* Cadeia de evolução */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-purple-50 to-white">
        <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 overflow-x-auto w-full">
          {evolutionChain.map((pokemon, index) => {
            const isLast = index === evolutionChain.length - 1;
            const primaryType = pokemon.types?.[0] || 'normal';
            const gradientColor = getPrimaryTypeColor(pokemon);
            
            return (
              <React.Fragment key={pokemon.id}>
                {/* Card do Pokémon */}
                <div className="relative group">
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200">
                    {/* Imagem do Pokémon */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-2 shadow-inner">
                        <img 
                          src={(function() {
                            const official = pokemon.sprites?.official;
                            const front = pokemon.sprites?.front;
                            if (official) return official;
                            if (front) return front;
                            if (pokemon.id) {
                              return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
                            }
                            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI1MiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qb2vDqW1vbjwvdGV4dD4KPC9zdmc+';
                          })()}
                          alt={formatPokemonName(pokemon.name)}
                          className="w-full h-full object-contain hover:animate-pulse transition-all duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI1MiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qb2vDqW1vbjwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                      </div>
                      
                      {/* Badge de número */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        #{pokemon.id}
                      </div>
                      
                      {/* Efeito de brilho */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Nome do Pokémon */}
                    <div className="text-center mb-3">
                      <h4 className="text-lg sm:text-xl font-sans font-bold text-blue-900 mb-1">
                        {formatPokemonName(pokemon.name)}
                      </h4>
                      
                      {/* Tipos */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {pokemon.types?.map((type, typeIndex) => (
                          <span 
                            key={type} 
                            className={`px-2 py-1 rounded-full text-xs font-sans font-bold text-white shadow-sm
                                      bg-gradient-to-r ${getTypeColor(type)} uppercase tracking-wide`}
                            style={{animationDelay: `${typeIndex * 100}ms`}}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats básicas */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-blue-600 font-sans text-xs font-medium">HP</p>
                          <p className="text-blue-900 font-sans font-bold text-sm">{pokemon.stats?.hp ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-sans text-xs font-medium">Attack</p>
                          <p className="text-blue-900 font-sans font-bold text-sm">{pokemon.stats?.attack ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seta de evolução */}
                {!isLast && (
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-2xl sm:text-3xl animate-pulse">⬇️</div>
                      <div className="text-xs font-sans font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        Evolui
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Informações da cadeia */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200">
          <div className="text-center">
            <h4 className="font-sans font-bold text-orange-800 mb-2">
              📊 Informações da Cadeia
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-orange-600 font-sans font-medium">Total de Formas</p>
                <p className="text-orange-900 font-sans font-bold text-lg">{evolutionChain.length}</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-orange-600 font-sans font-medium">Primeira Forma</p>
                <p className="text-orange-900 font-sans font-bold">{formatPokemonName(evolutionChain[0].name)}</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-orange-600 font-sans font-medium">Forma Final</p>
                <p className="text-orange-900 font-sans font-bold">{formatPokemonName(evolutionChain[evolutionChain.length - 1].name)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionChain;

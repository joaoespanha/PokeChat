// frontend/src/components/PokemonCard.jsx
import React from 'react';

const PokemonCard = ({ pokemon }) => {
  const { nameCapitalized, id, sprites, types, stats, height, weight } = pokemon;

  // Função para obter cores baseadas no tipo
  const getTypeColor = (type) => {
    const typeColors = {
      fire: 'from-pokemon-fire to-red-600',
      water: 'from-pokemon-water to-blue-600',
      grass: 'from-pokemon-grass to-green-600',
      electric: 'from-pokemon-electric to-yellow-500',
      psychic: 'from-pokemon-psychic to-purple-600',
      ice: 'from-pokemon-ice to-cyan-400',
      dragon: 'from-pokemon-dragon to-purple-700',
      dark: 'from-pokemon-dark to-gray-800',
      fairy: 'from-pokemon-fairy to-pink-500',
      fighting: 'from-pokemon-fighting to-orange-600',
      poison: 'from-pokemon-poison to-purple-500',
      ground: 'from-pokemon-ground to-yellow-600',
      flying: 'from-pokemon-flying to-blue-400',
      bug: 'from-pokemon-bug to-green-500',
      rock: 'from-pokemon-rock to-gray-600',
      ghost: 'from-pokemon-ghost to-purple-600',
      steel: 'from-pokemon-steel to-gray-500',
      normal: 'from-gray-400 to-gray-600'
    };
    return typeColors[type.toLowerCase()] || 'from-gray-400 to-gray-600';
  };

  // Função para obter cores de fundo baseadas no tipo principal
  const primaryType = types[0]?.toLowerCase();
  const bgGradient = getTypeColor(primaryType);

  return (
    <div className="relative bg-white rounded-3xl p-6 max-w-sm shadow-2xl overflow-hidden animate-fade-in">
      {/* Fundo gradiente baseado no tipo */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-5`}></div>
      
      {/* Padrão de fundo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fef2f2" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
        }}></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-sans font-bold text-blue-900 mb-1">
            {nameCapitalized}
          </h2>
          <p className="text-blue-600 font-mono text-sm">#{id.toString().padStart(3, '0')}</p>
        </div>

        {/* Imagem do Pokémon com efeito */}
        <div className="relative mb-4">
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-4 shadow-inner">
            <img 
              src={sprites.official} 
              alt={nameCapitalized} 
              className="w-full h-full object-contain hover:animate-pulse transition-all duration-300"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qb2vDqW1vbjwvdGV4dD4KPC9zdmc+';
              }}
            />
          </div>
          
          {/* Efeito de brilho */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Tipos */}
        <div className="text-center mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {types.map((type, index) => (
              <span 
                key={type} 
                className={`px-4 py-2 rounded-full text-xs font-sans font-bold text-white shadow-lg
                          bg-gradient-to-r ${getTypeColor(type)} uppercase tracking-wide
                          transform transition-all duration-300 hover:scale-105`}
                style={{animationDelay: `${index * 100}ms`}}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Informações básicas */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-blue-600 font-sans text-sm font-medium">Altura</p>
              <p className="text-blue-900 font-sans font-bold">{height}m</p>
            </div>
            <div>
              <p className="text-blue-600 font-sans text-sm font-medium">Peso</p>
              <p className="text-blue-900 font-sans font-bold">{weight}kg</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="font-sans font-bold text-blue-900 mb-3 text-center">
            📊 Estatísticas Base
          </h3>
          <div className="space-y-2">
            {Object.entries(stats).map(([statName, statValue]) => {
              const statDisplayName = statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const statPercentage = Math.min((statValue / 255) * 100, 100); // Normalizar para 255 como máximo
              
              return (
                <div key={statName} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-sans text-sm font-medium">
                      {statDisplayName}
                    </span>
                    <span className="text-blue-900 font-sans font-bold text-sm">
                      {statValue}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(primaryType)} transition-all duration-1000 ease-out`}
                      style={{ width: `${statPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
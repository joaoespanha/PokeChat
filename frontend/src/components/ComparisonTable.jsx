// frontend/src/components/ComparisonTable.jsx
import React from 'react';

const ComparisonTable = ({ data }) => {
  const { pokemon1, pokemon2 } = data;

  const statsOrder = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'total'];
  
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

  // Função para obter ícones das stats
  const getStatIcon = (stat) => {
    const icons = {
      hp: '❤️',
      attack: '⚔️',
      defense: '🛡️',
      specialAttack: '✨',
      specialDefense: '🌟',
      speed: '⚡',
      total: '💪'
    };
    return icons[stat] || '📊';
  };

  // Função para obter cores das stats
  const getStatColor = (stat) => {
    const colors = {
      hp: 'text-red-600',
      attack: 'text-orange-600',
      defense: 'text-blue-600',
      specialAttack: 'text-purple-600',
      specialDefense: 'text-green-600',
      speed: 'text-yellow-600',
      total: 'text-indigo-600'
    };
    return colors[stat] || 'text-gray-600';
  };

  // Determinar vencedor
  const getWinner = (stat) => {
    const val1 = pokemon1.stats[stat];
    const val2 = pokemon2.stats[stat];
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0; // empate
  };

  // Cores baseadas nos tipos principais
  const pokemon1Type = pokemon1.types[0]?.toLowerCase();
  const pokemon2Type = pokemon2.types[0]?.toLowerCase();
  const pokemon1Gradient = getTypeColor(pokemon1Type);
  const pokemon2Gradient = getTypeColor(pokemon2Type);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Cabeçalho com gradiente */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          }}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold mb-2">
            ⚔️ Batalha Pokémon ⚔️
          </h3>
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-sans font-bold">{pokemon1.nameCapitalized}</div>
              <div className="text-xs sm:text-sm opacity-90">#{pokemon1.id}</div>
            </div>
            <div className="text-2xl sm:text-3xl">VS</div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-sans font-bold">{pokemon2.nameCapitalized}</div>
              <div className="text-xs sm:text-sm opacity-90">#{pokemon2.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações dos Pokémon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-gradient-to-b from-blue-50 to-white">
        {/* Pokémon 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={pokemon1.sprites.official} 
              alt={pokemon1.nameCapitalized}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBva8OpbW9uPC90ZXh0Pgo8L3N2Zz4=';
              }}
            />
            <div>
              <h4 className="font-sans font-bold text-blue-900">{pokemon1.nameCapitalized}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {pokemon1.types.map((type, index) => (
                  <span 
                    key={type} 
                    className={`px-2 py-1 rounded-full text-xs font-sans font-bold text-white bg-gradient-to-r ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pokémon 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={pokemon2.sprites.official} 
              alt={pokemon2.nameCapitalized}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBva8OpbW9uPC90ZXh0Pgo8L3N2Zz4=';
              }}
            />
            <div>
              <h4 className="font-sans font-bold text-blue-900">{pokemon2.nameCapitalized}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {pokemon2.types.map((type, index) => (
                  <span 
                    key={type} 
                    className={`px-2 py-1 rounded-full text-xs font-sans font-bold text-white bg-gradient-to-r ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de comparação */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
              <th className="py-4 px-4 sm:px-6 text-left font-sans font-bold text-blue-900">
                📊 Estatística
              </th>
              <th className="py-4 px-4 sm:px-6 text-center font-sans font-bold text-blue-900">
                {pokemon1.nameCapitalized}
              </th>
              <th className="py-4 px-4 sm:px-6 text-center font-sans font-bold text-blue-900">
                {pokemon2.nameCapitalized}
              </th>
            </tr>
          </thead>
          <tbody>
            {statsOrder.map((stat, index) => {
              const winner = getWinner(stat);
              const statDisplayName = stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const statIcon = getStatIcon(stat);
              const statColor = getStatColor(stat);
              
              return (
                <tr key={stat} className={`border-b border-blue-100 hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}>
                  <th className="py-4 px-4 sm:px-6 font-sans font-medium text-blue-900 whitespace-nowrap">
                    <span className="flex items-center space-x-2">
                      <span className="text-lg">{statIcon}</span>
                      <span>{statDisplayName}</span>
                    </span>
                  </th>
                  <td className={`py-4 px-4 sm:px-6 text-center font-sans font-bold ${statColor} ${winner === 1 ? 'bg-green-100 rounded-lg' : ''}`}>
                    <span className="flex items-center justify-center space-x-2">
                      <span>{pokemon1.stats[stat]}</span>
                      {winner === 1 && <span className="text-green-600">🏆</span>}
                    </span>
                  </td>
                  <td className={`py-4 px-4 sm:px-6 text-center font-sans font-bold ${statColor} ${winner === 2 ? 'bg-green-100 rounded-lg' : ''}`}>
                    <span className="flex items-center justify-center space-x-2">
                      <span>{pokemon2.stats[stat]}</span>
                      {winner === 2 && <span className="text-green-600">🏆</span>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resultado final */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-t-2 border-yellow-200">
        <div className="text-center">
          {pokemon1.stats.total > pokemon2.stats.total ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🏆</span>
              <span className="text-lg sm:text-xl font-sans font-bold text-orange-800">
                {pokemon1.nameCapitalized} é o vencedor!
              </span>
              <span className="text-2xl">🏆</span>
            </div>
          ) : pokemon2.stats.total > pokemon1.stats.total ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🏆</span>
              <span className="text-lg sm:text-xl font-sans font-bold text-orange-800">
                {pokemon2.nameCapitalized} é o vencedor!
              </span>
              <span className="text-2xl">🏆</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">⚖️</span>
              <span className="text-lg sm:text-xl font-sans font-bold text-orange-800">
                Empate! Ambos têm stats totais iguais
              </span>
              <span className="text-2xl">⚖️</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
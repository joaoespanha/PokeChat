// frontend/src/components/PokemonCard.jsx
import React from 'react';

const PokemonCard = ({ pokemon }) => {
  const { nameCapitalized, id, sprites, types, stats, height, weight } = pokemon;

  return (
    <div className="bg-white rounded-lg p-4 max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-2">{nameCapitalized} #{id}</h2>
        <img src={sprites.official} alt={nameCapitalized} className="mx-auto h-40 w-40" />
        <div className="text-center my-2">
            {types.map(type => (
                <span key={type} className="bg-gray-300 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{type.toUpperCase()}</span>
            ))}
        </div>
        <p className="text-center text-sm text-gray-600">Height: {height}m | Weight: {weight}kg</p>
        <div className="mt-4">
            <h3 className="font-bold mb-2">Base Stats:</h3>
            <ul>
                {Object.entries(stats).map(([statName, statValue]) => (
                    <li key={statName} className="flex justify-between">
                        <span>{statName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <strong>{statValue}</strong>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default PokemonCard;
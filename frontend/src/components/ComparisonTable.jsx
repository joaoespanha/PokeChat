// frontend/src/components/ComparisonTable.jsx
import React from 'react';

const ComparisonTable = ({ data }) => {
  const { pokemon1, pokemon2 } = data;

  const statsOrder = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'total'];

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-2 text-center">
        {pokemon1.nameCapitalized} vs {pokemon2.nameCapitalized}
      </h3>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">Stat</th>
            <th scope="col" className="py-3 px-6">{pokemon1.nameCapitalized}</th>
            <th scope="col" className="py-3 px-6">{pokemon2.nameCapitalized}</th>
          </tr>
        </thead>
        <tbody>
          {statsOrder.map(stat => (
            <tr key={stat} className="bg-white border-b">
              <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                {stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </th>
              <td className="py-4 px-6">{pokemon1.stats[stat]}</td>
              <td className="py-4 px-6">{pokemon2.stats[stat]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
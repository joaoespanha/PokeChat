import React from 'react';
import { useChat } from '../hooks/useChat';

const TypeResults = ({ results }) => {
  const { postMessage } = useChat();

  const handleSelect = (name) => {
    postMessage(name);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white border-2 border-green-200 rounded-2xl p-4 shadow-md">
        <h4 className="text-green-700 font-sans font-bold mb-3 text-center">Pokémon do tipo selecionado</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {results.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelect(p.name)}
              className="px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-sans hover:bg-green-100 hover:border-green-300 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeResults;



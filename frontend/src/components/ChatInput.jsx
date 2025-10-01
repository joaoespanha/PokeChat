// frontend/src/components/ChatInput.jsx
import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import SuggestionButtons from './SuggestionButtons';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const { postMessage, isLoading } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      postMessage(input);
      setInput('');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-blue-50 to-yellow-50 border-t-2 border-blue-200 flex-shrink-0">
      <form onSubmit={handleSubmit} className="max-w-full mx-auto">
        <div className="relative flex items-center space-x-2 sm:space-x-3">
          {/* Input field com estilo Pokémon */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre Pokémon..."
              className="w-full px-3 py-2 sm:px-6 sm:py-4 bg-white border-2 border-blue-200 rounded-xl sm:rounded-2xl 
                       focus:outline-none focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100
                       font-sans text-sm sm:text-base text-blue-900 placeholder-blue-400
                       shadow-lg transition-all duration-300
                       disabled:bg-blue-50 disabled:border-blue-100 disabled:text-blue-400"
              disabled={isLoading}
            />
            
            {/* Ícone de Pokébola no input */}
            <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full border border-white animate-pulse">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-4 sm:h-4 bg-white rounded-full border border-blue-600">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de envio estilizado */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="group relative px-4 py-2 sm:px-8 sm:py-4 bg-gradient-to-br from-red-500 to-red-600 
                     text-white rounded-xl sm:rounded-2xl font-sans font-bold text-xs sm:text-sm uppercase tracking-wide
                     shadow-lg hover:shadow-xl
                     transform transition-all duration-300 hover:scale-105 active:scale-95
                     disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed
                     disabled:transform-none disabled:shadow-none"
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                          transition-transform duration-700"></div>
            
            <span className="relative flex items-center space-x-1 sm:space-x-2">
              {isLoading ? (
                <>
                  {/* Spinner simples quando carregando */}
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Enviando...</span>
                </>
              ) : (
                <>
                  {/* Ícone de envio simples */}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="hidden sm:inline">Enviar</span>
                </>
              )}
            </span>
          </button>
        </div>
        
        {/* Dica contextual */}
        <div className="mt-2 sm:mt-3 text-center">
          <p className="text-xs text-blue-500 font-sans hidden sm:block">
            💡 Dica: Pergunte sobre Pokémon, compare stats ou descubra informações interessantes!
          </p>
        </div>
      </form>
      
      {/* Botões de sugestão */}
      <SuggestionButtons />
    </div>
  );
};

export default ChatInput;
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in px-2 sm:px-0">
      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
        {/* Pokébola animada */}
        <div className="relative">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-blue-600 animate-bounce">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border border-red-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Pontos animados */}
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
        
        <span className="text-blue-700 font-sans text-xs sm:text-sm ml-1 sm:ml-2 hidden sm:inline">PokéChat está pensando...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;

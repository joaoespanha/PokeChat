// frontend/src/components/ChatWindow.jsx
import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatWindow = () => {
  return (
    <div className="flex flex-col h-full w-full max-w-full bg-white shadow-2xl overflow-hidden animate-fade-in">
      {/* Header temático */}
      <header className="relative bg-gradient-to-r from-red-500 to-red-600 p-3 sm:p-4 md:p-6 text-white shadow-lg overflow-hidden flex-shrink-0">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          }}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-4">
          {/* Pokébola animada */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border-2 sm:border-4 border-yellow-300 animate-bounce">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-red-500 rounded-full border border-red-600">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="font-sans font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">
              PokéChat Assistant
            </h1>
            <p className="font-sans text-xs sm:text-sm md:text-base opacity-90 mt-1 hidden sm:block">
              Seu assistente Pokémon inteligente
            </p>
          </div>
          
          {/* Pokébola espelhada */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border-2 sm:border-4 border-yellow-300 animate-bounce" style={{animationDelay: '0.5s'}}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-500 rounded-full border border-blue-600">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
      </header>
      
      {/* Área de mensagens */}
      <MessageList />
      
      {/* Input com sugestões */}
      <ChatInput />
    </div>
  );
};

export default ChatWindow;
// frontend/src/components/Message.jsx
import React from 'react';
import PokemonCard from './PokemonCard';
import ComparisonTable from './ComparisonTable';
import EvolutionChain from './EvolutionChain';
import TypeResults from './TypeResults';

// Simple markdown-to-HTML converter
const toHtml = (text) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/•/g, '<br />•');
    return { __html: html };
};

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const { content, data } = message;

  const renderContent = () => {
    if (data?.pokemon1 && data?.pokemon2) {
      return <ComparisonTable data={data} />;
    }
    if (data && data.id) {
      return <PokemonCard pokemon={data} />;
    }
    if (data && Array.isArray(data) && data.length > 0 && data[0].name) {
      // Decidir entre cadeia de evolução (objetos com stats/sprites) e lista de tipo (objetos com url)
      const looksLikeTypeList = Object.prototype.hasOwnProperty.call(data[0], 'url') && !data[0].stats;
      if (looksLikeTypeList) {
        return <TypeResults results={data} />;
      }
      return <EvolutionChain evolutionChain={data} />;
    }
    // Default: render text content with simple markdown
    return <p dangerouslySetInnerHTML={toHtml(content)} />;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 animate-fade-in px-2 sm:px-0`}>
      <div className={`relative max-w-[85%] sm:max-w-2xl ${isUser ? 'ml-8 sm:ml-12' : 'mr-8 sm:mr-12'}`}>
        {/* Avatar */}
        <div className={`absolute ${isUser ? '-right-6 sm:-right-10 top-0' : '-left-6 sm:-left-10 top-0'} w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg`}>
          {isUser ? (
            // Avatar do usuário - Pokébola azul
            <div className="w-full h-full bg-blue-500 rounded-full border border-white flex items-center justify-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full border border-blue-600">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          ) : (
            // Avatar do bot - Pokébola vermelha
            <div className="w-full h-full bg-red-500 rounded-full border border-white flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full border border-red-600">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Balão de mensagem */}
        <div className={`
          relative rounded-xl sm:rounded-2xl px-3 py-2 sm:px-6 sm:py-4 shadow-lg
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : isError
            ? 'bg-red-50 border-2 border-red-200 text-red-800'
            : 'bg-white border-2 border-blue-100 text-blue-900'
          }
        `}>
          {/* Seta do balão */}
          <div className={`
            absolute top-2 sm:top-3 w-0 h-0
            ${isUser 
              ? 'right-0 transform translate-x-full border-l-[8px] sm:border-l-[12px] border-l-blue-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent' 
              : isError
              ? 'left-0 transform -translate-x-full border-r-[8px] sm:border-r-[12px] border-r-red-200 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent'
              : 'left-0 transform -translate-x-full border-r-[8px] sm:border-r-[12px] border-r-blue-100 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent'
            }
          `}></div>

          {/* Conteúdo da mensagem */}
          <div className="relative z-10">
            {isUser ? (
              <p className="font-sans text-xs sm:text-sm leading-relaxed">{content}</p>
            ) : (
              <div className="font-sans text-xs sm:text-sm leading-relaxed">
                {renderContent()}
              </div>
            )}
          </div>

          {/* Efeito de brilho sutil */}
          {!isUser && (
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-blue-400 mt-1 ${isUser ? 'text-right' : 'text-left'} hidden sm:block`}>
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default Message;
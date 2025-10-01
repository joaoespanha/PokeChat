import React from 'react';

const ErrorState = ({ message = "Ops! Algo deu errado. Tente novamente!", onRetry }) => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-center space-x-3 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 shadow-pokemon max-w-lg">
        {/* Ícone de erro temático */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Mensagem de erro */}
        <div className="flex-1">
          <p className="text-red-700 font-pokemon text-sm">
            {message}
          </p>
        </div>
        
        {/* Botão de retry */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-pokemon font-medium
                     hover:bg-red-600 transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

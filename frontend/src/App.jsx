// frontend/src/App.jsx
import React from 'react';
import { ChatProvider } from './context/chatContext.jsx';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <ChatProvider>
      <div className="h-screen w-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-green-100 
                      flex items-center justify-center relative overflow-hidden">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fef2f2" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          }}></div>
        </div>
        
        {/* Elementos decorativos - ocultos em telas pequenas */}
        <div className="hidden md:block absolute top-10 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="hidden md:block absolute top-20 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="hidden md:block absolute bottom-20 left-20 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="hidden md:block absolute bottom-10 right-10 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10 w-full h-full max-w-none max-h-none">
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;
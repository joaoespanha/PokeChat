// frontend/src/components/ChatWindow.jsx
import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatWindow = () => {
  return (
    <div className="flex flex-col h-[90vh] w-[80vw] max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
      <header className="bg-red-600 p-4 text-white text-center font-bold text-lg shadow-md">
        PokéChat Assistant
      </header>
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatWindow;
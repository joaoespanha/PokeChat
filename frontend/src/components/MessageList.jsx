// frontend/src/components/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';

const MessageList = () => {
  const { messages, isLoading } = useChat();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      {isLoading && <div className="text-center text-gray-500">PokéChat is thinking...</div>}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
// frontend/src/components/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ErrorState from './ErrorState';

const MessageList = () => {
  const { messages, isLoading, error, retryInitialization } = useChat();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      {error && (
        <ErrorState 
          message={error} 
          onRetry={retryInitialization}
        />
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
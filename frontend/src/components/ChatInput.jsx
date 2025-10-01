// frontend/src/components/ChatInput.jsx
import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';

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
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about Pokémon..."
          className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
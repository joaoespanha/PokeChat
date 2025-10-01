// frontend/src/components/Message.jsx
import React from 'react';
import PokemonCard from './PokemonCard';
import ComparisonTable from './ComparisonTable';

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
  const { content, data } = message;

  const renderContent = () => {
    if (data?.pokemon1 && data?.pokemon2) {
      return <ComparisonTable data={data} />;
    }
    if (data && data.id) {
      return <PokemonCard pokemon={data} />;
    }
    // Default: render text content with simple markdown
    return <p dangerouslySetInnerHTML={toHtml(content)} />;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`rounded-lg px-4 py-2 max-w-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        {isUser ? <p>{content}</p> : renderContent()}
      </div>
    </div>
  );
};

export default Message;
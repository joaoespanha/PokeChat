// frontend/src/App.jsx
import React from 'react';
import { ChatProvider } from './context/chatContext.jsx';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <ChatProvider>
      <div className="bg-gray-100 h-screen flex items-center justify-center">
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

export default App;
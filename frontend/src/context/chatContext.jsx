// frontend/src/context/ChatContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { startSession, postMessage as postMessageApi } from '../api/chatService';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        const data = await startSession();
        setSessionId(data.sessionId);
        setMessages([data.message]);
      } catch (error) {
        console.error("Initialization Error:", error);
        // You can add a specific error message to the chat
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, []);

  const postMessage = async (message) => {
    if (!sessionId) return;

    // Add user message immediately for better UX
    const userMessage = { role: 'user', content: message, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await postMessageApi(sessionId, message);
      setMessages(prev => [...prev, data.response]);
    } catch (error) {
      console.error("Send Message Error:", error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, postMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
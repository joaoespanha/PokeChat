// frontend/src/context/ChatContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { startSession, postMessage as postMessageApi } from '../api/chatService';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentState, setCurrentState] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await startSession();
        setSessionId(data.sessionId);
        setMessages([data.message]);
        setCurrentState(data.currentState);
      } catch (error) {
        console.error("Initialization Error:", error);
        setError("Falha ao inicializar o chat. Verifique sua conexão e tente novamente.");
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
    setError(null);

    try {
      const data = await postMessageApi(sessionId, message);
      setMessages(prev => [...prev, data.response]);
      if (data.currentState) {
        setCurrentState(data.currentState);
      }
    } catch (error) {
      console.error("Send Message Error:", error);
      setError("Falha ao enviar mensagem. Tente novamente.");
      const errorMessage = { 
        role: 'assistant', 
        content: 'Desculpe, encontrei um erro. Por favor, tente novamente.', 
        timestamp: Date.now(),
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const retryInitialization = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await startSession();
      setSessionId(data.sessionId);
      setMessages([data.message]);
    } catch (error) {
      console.error("Retry Initialization Error:", error);
      setError("Falha ao reinicializar o chat. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      error, 
      currentState,
      postMessage, 
      clearError, 
      retryInitialization 
    }}>
      {children}
    </ChatContext.Provider>
  );
};
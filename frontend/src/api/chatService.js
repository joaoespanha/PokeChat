// frontend/src/api/chatService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/chat';

export const startSession = async () => {
  const response = await fetch(`${API_URL}/start`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to start session');
  }
  return response.json();
};

export const postMessage = async (sessionId, message) => {
  const response = await fetch(`${API_URL}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};
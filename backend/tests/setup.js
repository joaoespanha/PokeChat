/**
 * Setup global para os testes
 */

// Aumentar timeout se necessário
jest.setTimeout(10000);

// Mock de console para testes limpos (opcional)
global.console = {
  ...console,
  log: jest.fn(), // Mock console.log nos testes
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Helper: Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Matchers customizados
expect.extend({
  toBeValidState(received) {
    const hasSessionId = received.sessionId && typeof received.sessionId === 'string';
    const hasMessages = Array.isArray(received.messages);
    const hasCurrentNode = typeof received.currentNode === 'string';
    const hasContext = received.context && typeof received.context === 'object';
    
    const pass = hasSessionId && hasMessages && hasCurrentNode && hasContext;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid state`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid state`,
        pass: false,
      };
    }
  },
  
  toHaveMessage(received, role, content) {
    const hasMessage = received.messages.some(
      msg => msg.role === role && msg.content.includes(content)
    );
    
    if (hasMessage) {
      return {
        message: () => `expected state not to have message with role "${role}" and content "${content}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected state to have message with role "${role}" and content "${content}"`,
        pass: false,
      };
    }
  }
});
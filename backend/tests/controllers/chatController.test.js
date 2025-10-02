/**
 * Testes unitários para o chatController
 */

const rewire = require('rewire');

// Criamos o mock da classe PokemonChatbot
const MockPokemonChatbot = jest.fn().mockImplementation(() => {
  const mockSessionId = `session_${Date.now()}`;
  return {
    start: jest.fn().mockResolvedValue({ role: 'assistant', content: 'Bem-vindo' }),
    processMessage: jest.fn().mockResolvedValue({ role: 'assistant', content: 'Mensagem processada' }),
    getMessageHistory: jest.fn().mockReturnValue([{ role: 'user', content: 'Histórico' }]),
    getSessionStats: jest.fn().mockReturnValue({ sessionId: mockSessionId, interactionCount: 1 }),
    getCurrentState: jest.fn().mockReturnValue({ 
      currentNode: 'menu', 
      waitingFor: 'menu_choice' 
    }),
    reset: jest.fn().mockResolvedValue({ role: 'assistant', content: 'Sessão resetada' }),
    currentState: {
      sessionId: mockSessionId,
    },
  };
});

// Carregamos o módulo com rewire
const chatControllerModule = rewire('../../controllers/chatController');

// Injetamos o mock no módulo
chatControllerModule.__set__('PokemonChatbot', MockPokemonChatbot);

const {
    startSession,
    postMessage,
    getHistory,
    getStats,
    resetSession,
    deleteSession,
    listSessions,
  } = chatControllerModule;
  
  // Mock do Map de sessões ativas para ter controle total nos testes
  const mockActiveSessions = chatControllerModule.__get__('activeSessions');
  
  describe('Chat Controller', () => {
    let req, res;
  
    // Recria os mocks de req e res antes de cada teste
    beforeEach(() => {
      jest.clearAllMocks(); // Limpa chamadas de mocks anteriores
      mockActiveSessions.clear(); // Limpa as sessões ativas
  
      req = {
        body: {},
        params: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });
  
    // Testes para startSession
    describe('startSession', () => {
      it('deve criar uma nova sessão e retornar 201', async () => {
        await startSession(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            sessionId: expect.any(String),
            message: { role: 'assistant', content: 'Bem-vindo' },
          })
        );
        expect(mockActiveSessions.size).toBe(1);
      });
    });
  
    // Testes para postMessage
    describe('postMessage', () => {
      it('deve processar uma mensagem com sucesso e retornar 200', async () => {
        // Simula uma sessão existente
        const chatbotMock = { 
          processMessage: jest.fn().mockResolvedValue('OK'),
          getCurrentState: jest.fn().mockReturnValue({ 
            currentNode: 'search', 
            waitingFor: 'pokemon_input' 
          })
        };
        mockActiveSessions.set('test-session', chatbotMock);
  
        req.body = { sessionId: 'test-session', message: 'Olá' };
  
        await postMessage(req, res);
  
        expect(chatbotMock.processMessage).toHaveBeenCalledWith('Olá');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ 
          response: 'OK',
          currentState: {
            node: 'search',
            waitingFor: 'pokemon_input'
          }
        });
      });
  
      it('deve retornar 400 se faltar sessionId ou message', async () => {
        req.body = { sessionId: 'test-session' }; // Faltando a mensagem
        await postMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'sessionId e message são obrigatórios.' });
      });
  
      it('deve retornar 404 se a sessão não for encontrada', async () => {
        req.body = { sessionId: 'not-found-session', message: 'Olá' };
        await postMessage(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Sessão não encontrada.' });
      });
    });
  
    // Testes para getHistory
    describe('getHistory', () => {
      it('deve retornar o histórico de uma sessão e status 200', () => {
        const chatbotMock = { getMessageHistory: jest.fn().mockReturnValue(['histórico']) };
        mockActiveSessions.set('test-session', chatbotMock);
  
        req.params.sessionId = 'test-session';
  
        getHistory(req, res);
  
        expect(chatbotMock.getMessageHistory).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(['histórico']);
      });
    });
  
      // Testes para getStats
    describe('getStats', () => {
      it('deve retornar as estatísticas de uma sessão e status 200', () => {
          const chatbotMock = { getSessionStats: jest.fn().mockReturnValue({ interactions: 5 }) };
          mockActiveSessions.set('test-session', chatbotMock);
  
          req.params.sessionId = 'test-session';
  
          getStats(req, res);
  
          expect(chatbotMock.getSessionStats).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({ interactions: 5 });
      });
    });
  
  
    // Testes para deleteSession
    describe('deleteSession', () => {
      it('deve deletar uma sessão existente e retornar 200', () => {
        mockActiveSessions.set('test-session', {});
        req.params.sessionId = 'test-session';
  
        deleteSession(req, res);
  
        expect(mockActiveSessions.has('test-session')).toBe(false);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Sessão encerrada com sucesso.' });
      });
  
      it('deve retornar 404 ao tentar deletar uma sessão inexistente', () => {
        req.params.sessionId = 'not-found-session';
        deleteSession(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
      });
    });
  
    // Testes para listSessions
    describe('listSessions', () => {
      it('deve retornar uma lista com as estatísticas de todas as sessões ativas', () => {
        // Adiciona duas sessões mock
        mockActiveSessions.set('session1', { getSessionStats: () => ({ sessionId: 'session1' }) });
        mockActiveSessions.set('session2', { getSessionStats: () => ({ sessionId: 'session2' }) });
  
        listSessions(req, res);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          sessions: expect.arrayContaining([
            expect.objectContaining({ sessionId: 'session1' }),
            expect.objectContaining({ sessionId: 'session2' }),
          ]),
        });
        expect(res.json.mock.calls[0][0].sessions).toHaveLength(2);
      });
    });
  });
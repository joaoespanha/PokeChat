/**
 * Configuração do Jest para testes do Pokémon Chatbot
 */

module.exports = {
    // Ambiente de teste
    testEnvironment: 'node',
  
    // Padrão de arquivos de teste
    testMatch: [
      '**/tests/**/*.test.js',
      '**/__tests__/**/*.js',
      '**/?(*.)+(spec|test).js'
    ],
  
    // Cobertura de código
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Arquivos para cobertura
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/**/*.test.js',
      '!src/**/__tests__/**',
      '!**/node_modules/**'
    ],
  
    // Thresholds de cobertura
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
  
    // Setup antes dos testes
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
    // Transformações
    transform: {
      '^.+\\.js$': 'babel-jest'
    },
  
    // Verbose output
    verbose: true,
  
    // Timeout padrão (10s)
    testTimeout: 10000,
  
    // Limpar mocks automaticamente
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
  };
# Testes Unitários - Backend

Este diretório contém os testes unitários do backend usando Jest.

## 📦 Instalação

Primeiro, instale as dependências:

```bash
cd backend
npm install
```

## 🧪 Executando os Testes

### Executar todos os testes
```bash
npm test
```

### Executar com watch mode (re-executa ao salvar)
```bash
npm run test:watch
```

### Executar com cobertura de código
```bash
npm run test:coverage
```

### Executar teste manual (teste de integração real com API)
```bash
npm run test:manual
```

## 📊 Cobertura de Testes

O relatório de cobertura é gerado na pasta `coverage/` quando você executa:
```bash
npm run test:coverage
```

Abra `coverage/lcov-report/index.html` no navegador para ver o relatório visual.

## 📝 Estrutura dos Testes

### `pokeapi.test.js`
Testes unitários completos para o `PokeAPIService`:

- ✅ **Constructor**: Inicialização do serviço
- ✅ **getPokemon**: Busca de Pokémon por nome/ID
- ✅ **getMultiplePokemon**: Busca múltipla
- ✅ **getSpecies**: Informações de espécie
- ✅ **getEvolutionChain**: Cadeia de evolução
- ✅ **getPokemonByType**: Busca por tipo
- ✅ **listPokemon**: Listagem com paginação
- ✅ **searchPokemon**: Busca por string parcial
- ✅ **Cache**: Sistema de cache
- ✅ **Métodos utilitários**: Helpers e formatação
- ✅ **Tratamento de erros**: Erros de rede e API

## 🎯 Boas Práticas

1. **Mocks**: Usamos mocks do `fetch` para não fazer requisições reais durante os testes
2. **Isolamento**: Cada teste é independente (usamos `beforeEach` para limpar estado)
3. **Cobertura**: Buscamos 100% de cobertura de código
4. **Nomenclatura**: Usamos descrições claras em português para os testes

## 🔍 Exemplo de Output

```bash
PASS  tests/pokeapi.test.js
  PokeAPIService
    Constructor
      ✓ deve inicializar com configurações corretas (2 ms)
    getPokemon
      ✓ deve buscar um Pokémon pelo nome (5 ms)
      ✓ deve buscar um Pokémon pelo ID (3 ms)
      ...
    
Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Coverage: 100%
```

## 🐛 Debug

Para debugar um teste específico:

```bash
# Executar apenas um arquivo
npx jest pokeapi.test.js

# Executar apenas um teste específico (use .only)
test.only('deve buscar um Pokémon pelo nome', async () => {
  // ...
});
```


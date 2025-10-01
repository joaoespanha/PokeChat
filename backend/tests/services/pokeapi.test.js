/**
 * Testes unitários para o PokeAPIService
 * Execute com: npm test
 */

const PokeAPIService = require('../../services/pokeapi');

// Mock do fetch global
global.fetch = jest.fn();

describe('PokeAPIService', () => {
  let service;

  beforeEach(() => {
    // Criar uma nova instância antes de cada teste
    service = new PokeAPIService();
    // Limpar todos os mocks
    jest.clearAllMocks();
    // Limpar o cache
    service.clearCache();
  });

  describe('Constructor', () => {
    test('deve inicializar com configurações corretas', () => {
      expect(service.baseURL).toBe('https://pokeapi.co/api/v2');
      expect(service.cache).toBeInstanceOf(Map);
      expect(service.cacheExpiry).toBe(1000 * 60 * 30); // 30 minutos
    });
  });

  describe('getPokemon', () => {
    const mockPokemonData = {
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 35 },
        { stat: { name: 'attack' }, base_stat: 55 },
        { stat: { name: 'defense' }, base_stat: 40 },
        { stat: { name: 'special-attack' }, base_stat: 50 },
        { stat: { name: 'special-defense' }, base_stat: 50 },
        { stat: { name: 'speed' }, base_stat: 90 }
      ],
      abilities: [
        { ability: { name: 'static' }, is_hidden: false },
        { ability: { name: 'lightning-rod' }, is_hidden: true }
      ],
      sprites: {
        front_default: 'sprite.png',
        front_shiny: 'shiny.png',
        other: { 'official-artwork': { front_default: 'official.png' } }
      },
      height: 40,
      weight: 60,
      species: { url: 'https://pokeapi.co/api/v2/pokemon-species/25/' }
    };

    test('deve buscar um Pokémon pelo nome', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await service.getPokemon('pikachu');

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
      expect(result.id).toBe(25);
      expect(result.name).toBe('pikachu');
      expect(result.nameCapitalized).toBe('Pikachu');
      expect(result.types).toEqual(['electric']);
    });

    test('deve buscar um Pokémon pelo ID', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await service.getPokemon(25);

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25');
      expect(result.id).toBe(25);
    });

    test('deve normalizar o nome (lowercase e trim)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      await service.getPokemon('  PIKACHU  ');

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    });

    test('deve formatar corretamente as stats', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await service.getPokemon('pikachu');

      expect(result.stats).toEqual({
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
        total: 320
      });
    });

    test('deve formatar corretamente as abilities', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await service.getPokemon('pikachu');

      expect(result.abilities).toEqual([
        { name: 'static', isHidden: false },
        { name: 'lightning-rod', isHidden: true }
      ]);
    });

    test('deve converter altura e peso corretamente', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonData
      });

      const result = await service.getPokemon('pikachu');

      expect(result.height).toBe(4); // 40 decímetros = 4 metros
      expect(result.weight).toBe(6); // 60 hectogramas = 6 kg
    });

    test('deve lançar erro se identifier for inválido', async () => {
      await expect(service.getPokemon('')).rejects.toThrow('INVALID_IDENTIFIER');
      await expect(service.getPokemon(null)).rejects.toThrow('INVALID_IDENTIFIER');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('deve lançar erro POKEMON_NOT_FOUND para status 404', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.getPokemon('fakemon')).rejects.toThrow('POKEMON_NOT_FOUND');
    });

    test('deve lançar erro para outros status de erro', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      // O código transforma erros de API em NETWORK_ERROR no catch
      await expect(service.getPokemon('pikachu')).rejects.toThrow('NETWORK_ERROR');
    });
  });

  describe('getMultiplePokemon', () => {
    const mockData = {
      id: 1,
      name: 'bulbasaur',
      types: [{ type: { name: 'grass' } }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
        { stat: { name: 'defense' }, base_stat: 49 },
        { stat: { name: 'special-attack' }, base_stat: 65 },
        { stat: { name: 'special-defense' }, base_stat: 65 },
        { stat: { name: 'speed' }, base_stat: 45 }
      ],
      abilities: [],
      sprites: {
        front_default: 'sprite.png',
        front_shiny: 'shiny.png',
        other: { 'official-artwork': { front_default: 'official.png' } }
      },
      height: 7,
      weight: 69,
      species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' }
    };

    test('deve buscar múltiplos Pokémon', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const result = await service.getMultiplePokemon(['bulbasaur', 'charmander', 'squirtle']);

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('bulbasaur');
    });

    test('deve lançar erro se identifiers não for um array', async () => {
      await expect(service.getMultiplePokemon('not-an-array')).rejects.toThrow('INVALID_IDENTIFIERS');
    });

    test('deve lançar erro se array estiver vazio', async () => {
      await expect(service.getMultiplePokemon([])).rejects.toThrow('INVALID_IDENTIFIERS');
    });
  });

  describe('getSpecies', () => {
    const mockSpeciesData = {
      id: 25,
      name: 'pikachu',
      flavor_text_entries: [
        {
          language: { name: 'pt-BR' },
          flavor_text: 'Um Pokémon com\nhabilidades'
        },
        {
          language: { name: 'en' },
          flavor_text: 'A Pokémon that\nhas abilities'
        }
      ],
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
      generation: { name: 'generation-i' },
      is_legendary: false,
      is_mythical: false
    };

    test('deve buscar informações da espécie', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpeciesData
      });

      const result = await service.getSpecies(25);

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/25');
      expect(result.id).toBe(25);
      expect(result.name).toBe('pikachu');
      expect(result.generation).toBe('generation-i');
      expect(result.isLegendary).toBe(false);
      expect(result.isMythical).toBe(false);
    });

    test('deve preferir descrição em português', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpeciesData
      });

      const result = await service.getSpecies(25);

      expect(result.description).toBe('Um Pokémon com habilidades');
    });

    test('deve remover quebras de linha da descrição', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpeciesData
      });

      const result = await service.getSpecies(25);

      expect(result.description).not.toContain('\n');
      expect(result.description).not.toContain('\f');
    });

    test('deve extrair ID da cadeia de evolução', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpeciesData
      });

      const result = await service.getSpecies(25);

      expect(result.evolutionChainId).toBe(10);
    });
  });

  describe('getEvolutionChain', () => {
    const mockEvolutionData = {
      chain: {
        species: { name: 'bulbasaur' },
        evolves_to: [
          {
            species: { name: 'ivysaur' },
            evolves_to: [
              {
                species: { name: 'venusaur' },
                evolves_to: []
              }
            ]
          }
        ]
      }
    };

    test('deve buscar cadeia de evolução', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvolutionData
      });

      const result = await service.getEvolutionChain(1);

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/1');
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('bulbasaur');
      expect(result[1].name).toBe('ivysaur');
      expect(result[2].name).toBe('venusaur');
    });

    test('deve capitalizar nomes das evoluções', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvolutionData
      });

      const result = await service.getEvolutionChain(1);

      expect(result[0].nameCapitalized).toBe('Bulbasaur');
      expect(result[1].nameCapitalized).toBe('Ivysaur');
      expect(result[2].nameCapitalized).toBe('Venusaur');
    });

    test('deve funcionar com Pokémon sem evolução', async () => {
      const mockSingleEvolution = {
        chain: {
          species: { name: 'ditto' },
          evolves_to: []
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSingleEvolution
      });

      const result = await service.getEvolutionChain(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('ditto');
    });
  });

  describe('getPokemonByType', () => {
    const mockTypeData = {
      pokemon: Array.from({ length: 30 }, (_, i) => ({
        pokemon: {
          name: `pokemon-${i}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`
        }
      }))
    };

    test('deve buscar Pokémon por tipo', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTypeData
      });

      const result = await service.getPokemonByType('fire');

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type/fire');
      expect(result).toHaveLength(20); // Limita a 20
    });

    test('deve normalizar o tipo para lowercase', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTypeData
      });

      await service.getPokemonByType('FIRE');

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/type/fire');
    });

    test('deve retornar no máximo 20 Pokémon', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTypeData
      });

      const result = await service.getPokemonByType('water');

      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  describe('listPokemon', () => {
    const mockListData = {
      count: 1292,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' }
      ]
    };

    test('deve listar Pokémon com paginação padrão', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockListData
      });

      const result = await service.listPokemon();

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
      expect(result.count).toBe(1292);
      expect(result.results).toHaveLength(3);
    });

    test('deve aceitar limit e offset customizados', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockListData
      });

      await service.listPokemon(50, 100);

      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=50&offset=100');
    });

    test('deve extrair IDs das URLs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockListData
      });

      const result = await service.listPokemon();

      expect(result.results[0].id).toBe(1);
      expect(result.results[1].id).toBe(2);
      expect(result.results[2].id).toBe(3);
    });
  });

  describe('searchPokemon', () => {
    const mockSearchData = {
      count: 1292,
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
        { name: 'pikablu', url: 'https://pokeapi.co/api/v2/pokemon/999/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' }
      ]
    };

    test('deve buscar Pokémon por string parcial', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData
      });

      const result = await service.searchPokemon('pika');

      expect(result).toContain('pikachu');
      expect(result).toContain('pikablu');
      expect(result).not.toContain('charmander');
    });

    test('deve respeitar o limite de resultados', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData
      });

      const result = await service.searchPokemon('pika', 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    test('deve buscar case-insensitive', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchData
      });

      const result = await service.searchPokemon('PIKA');

      expect(result).toContain('pikachu');
    });
  });

  describe('Cache', () => {
    const mockData = {
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 35 },
        { stat: { name: 'attack' }, base_stat: 55 },
        { stat: { name: 'defense' }, base_stat: 40 },
        { stat: { name: 'special-attack' }, base_stat: 50 },
        { stat: { name: 'special-defense' }, base_stat: 50 },
        { stat: { name: 'speed' }, base_stat: 90 }
      ],
      abilities: [],
      sprites: {
        front_default: 'sprite.png',
        front_shiny: 'shiny.png',
        other: { 'official-artwork': { front_default: 'official.png' } }
      },
      height: 40,
      weight: 60,
      species: { url: 'https://pokeapi.co/api/v2/pokemon-species/25/' }
    };

    test('deve usar cache para requisições repetidas', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await service.getPokemon('pikachu');
      await service.getPokemon('pikachu');

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('deve ignorar cache quando useCache é false', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await service._fetch('/pokemon/pikachu', true);
      await service._fetch('/pokemon/pikachu', false);

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('clearCache deve limpar o cache', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await service.getPokemon('pikachu');
      service.clearCache();
      await service.getPokemon('pikachu');

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    test('getCacheStats deve retornar estatísticas', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      await service.getPokemon('pikachu');
      const stats = service.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.entries).toContain('https://pokeapi.co/api/v2/pokemon/pikachu');
    });

    test('deve expirar cache após tempo determinado', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      // Fazer primeira requisição
      await service.getPokemon('pikachu');
      
      // Modificar o timestamp do cache para simular expiração
      const cacheKey = 'https://pokeapi.co/api/v2/pokemon/pikachu';
      const cached = service.cache.get(cacheKey);
      cached.timestamp = Date.now() - (service.cacheExpiry + 1000);
      service.cache.set(cacheKey, cached);

      // Fazer segunda requisição (deve buscar novamente)
      await service.getPokemon('pikachu');

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Métodos utilitários', () => {
    test('_capitalize deve capitalizar strings', () => {
      expect(service._capitalize('pikachu')).toBe('Pikachu');
      expect(service._capitalize('BULBASAUR')).toBe('BULBASAUR');
      expect(service._capitalize('a')).toBe('A');
    });

    test('_extractIdFromUrl deve extrair ID de URLs', () => {
      expect(service._extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
      expect(service._extractIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/1/')).toBe(1);
      expect(service._extractIdFromUrl('https://pokeapi.co/api/v2/evolution-chain/10/')).toBe(10);
    });
  });

  describe('Tratamento de erros de rede', () => {
    test('deve lançar NETWORK_ERROR para erros de rede', async () => {
      fetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(service.getPokemon('pikachu')).rejects.toThrow('NETWORK_ERROR');
    });

    test('deve propagar erro POKEMON_NOT_FOUND', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.getPokemon('fakemon')).rejects.toThrow('POKEMON_NOT_FOUND');
    });
  });
});


/**
 * Serviço para interação com a PokéAPI
 * @see https://pokeapi.co/docs/v2
 */

class PokeAPIService {
    constructor() {
      this.baseURL = 'https://pokeapi.co/api/v2';
      this.cache = new Map(); // Cache simples em memória
      this.cacheExpiry = 1000 * 60 * 30; // 30 minutos
    }
  
    /**
     * Método genérico para fazer requisições à API
     * @param {string} endpoint - Endpoint da API
     * @param {boolean} useCache - Se deve usar cache
     * @returns {Promise<Object>}
     */
    async _fetch(endpoint, useCache = true) {
      const url = `${this.baseURL}${endpoint}`;
      const cacheKey = url;
  
      // Verificar cache
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log(`[CACHE HIT] ${endpoint}`);
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }
  
      try {
        console.log(`[API REQUEST] ${url}`);
        const response = await fetch(url);
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('POKEMON_NOT_FOUND');
          }
          throw new Error(`API_ERROR: ${response.status}`);
        }
  
        const data = await response.json();
  
        // Armazenar no cache
        if (useCache) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
  
        return data;
      } catch (error) {
        if (error.message === 'POKEMON_NOT_FOUND') {
          throw error;
        }
        console.error(`[API ERROR] ${endpoint}:`, error.message);
        throw new Error('NETWORK_ERROR');
      }
    }
  
    /**
     * Busca um Pokémon por nome ou ID
     * @param {string|number} identifier - Nome ou ID do Pokémon
     * @returns {Promise<Object>} Dados formatados do Pokémon
     */
    async getPokemon(identifier) {
      if (!identifier) {
        throw new Error('INVALID_IDENTIFIER');
      }
  
      // Normalizar entrada (lowercase, trim)
      const normalized = typeof identifier === 'string' 
        ? identifier.toLowerCase().trim() 
        : identifier;
  
      const data = await this._fetch(`/pokemon/${normalized}`);
      return this._formatPokemonData(data);
    }
  
    /**
     * Busca múltiplos Pokémon (para comparação)
     * @param {Array<string|number>} identifiers - Array de nomes ou IDs
     * @returns {Promise<Array<Object>>}
     */
    async getMultiplePokemon(identifiers) {
      if (!Array.isArray(identifiers) || identifiers.length === 0) {
        throw new Error('INVALID_IDENTIFIERS');
      }
  
      const promises = identifiers.map(id => this.getPokemon(id));
      return Promise.all(promises);
    }
  
    /**
     * Busca informações da espécie (para evoluções, descrições, etc)
     * @param {number} speciesId - ID da espécie
     * @returns {Promise<Object>}
     */
    async getSpecies(speciesId) {
      const data = await this._fetch(`/pokemon-species/${speciesId}`);
      return this._formatSpeciesData(data);
    }
  
    /**
     * Busca cadeia de evolução
     * @param {number} chainId - ID da cadeia de evolução
     * @returns {Promise<Array<string>>} Array com nomes dos Pokémon na cadeia
     */
    async getEvolutionChain(chainId) {
      const data = await this._fetch(`/evolution-chain/${chainId}`);
      return this._formatEvolutionChain(data.chain);
    }
  
    /**
     * Busca Pokémon por tipo
     * @param {string} type - Tipo do Pokémon (fire, water, etc)
     * @returns {Promise<Array<Object>>}
     */
    async getPokemonByType(type) {
      const data = await this._fetch(`/type/${type.toLowerCase()}`);
      // Retorna apenas os primeiros 20 para não sobrecarregar
      return data.pokemon.slice(0, 20).map(p => ({
        name: p.pokemon.name,
        url: p.pokemon.url
      }));
    }
  
    /**
     * Busca lista de Pokémon com paginação
     * @param {number} limit - Quantidade de Pokémon
     * @param {number} offset - Offset para paginação
     * @returns {Promise<Object>}
     */
    async listPokemon(limit = 20, offset = 0) {
      const data = await this._fetch(`/pokemon?limit=${limit}&offset=${offset}`);
      return {
        count: data.count,
        results: data.results.map(p => ({
          name: p.name,
          id: this._extractIdFromUrl(p.url)
        }))
      };
    }
  
    /**
     * Busca sugestões de Pokémon baseado em string parcial
     * @param {string} partial - String parcial para buscar
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array<string>>}
     */
    async searchPokemon(partial, limit = 5) {
      // Buscar lista grande e filtrar localmente
      const data = await this.listPokemon(1000, 0);
      const query = partial.toLowerCase();
      
      return data.results
        .filter(p => p.name.includes(query))
        .slice(0, limit)
        .map(p => p.name);
    }
  
    /**
     * Formata os dados do Pokémon para um formato mais amigável
     * @private
     */
    _formatPokemonData(data) {
      return {
        id: data.id,
        name: data.name,
        nameCapitalized: this._capitalize(data.name),
        types: data.types.map(t => t.type.name),
        stats: {
          hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
          attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
          defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
          specialAttack: data.stats.find(s => s.stat.name === 'special-attack').base_stat,
          specialDefense: data.stats.find(s => s.stat.name === 'special-defense').base_stat,
          speed: data.stats.find(s => s.stat.name === 'speed').base_stat,
          total: data.stats.reduce((sum, s) => sum + s.base_stat, 0)
        },
        abilities: data.abilities.map(a => ({
          name: a.ability.name,
          isHidden: a.is_hidden
        })),
        sprites: {
          front: data.sprites.front_default,
          frontShiny: data.sprites.front_shiny,
          official: data.sprites.other['official-artwork'].front_default
        },
        height: data.height / 10, // decímetros para metros
        weight: data.weight / 10, // hectogramas para kg
        speciesUrl: data.species.url,
        speciesId: this._extractIdFromUrl(data.species.url)
      };
    }
  
    /**
     * Formata dados da espécie
     * @private
     */
    _formatSpeciesData(data) {
      // Pegar descrição em português ou inglês
      const flavorText = data.flavor_text_entries.find(
        entry => entry.language.name === 'pt-BR' || entry.language.name === 'en'
      );
  
      return {
        id: data.id,
        name: data.name,
        description: flavorText ? flavorText.flavor_text.replace(/\n|\f/g, ' ') : '',
        evolutionChainId: this._extractIdFromUrl(data.evolution_chain.url),
        generation: data.generation.name,
        isLegendary: data.is_legendary,
        isMythical: data.is_mythical
      };
    }
  
    /**
     * Formata cadeia de evolução recursivamente
     * @private
     */
    _formatEvolutionChain(chain) {
      const evolutions = [];
      
      const traverse = (node) => {
        evolutions.push({
          name: node.species.name,
          nameCapitalized: this._capitalize(node.species.name)
        });
        
        if (node.evolves_to.length > 0) {
          node.evolves_to.forEach(evolution => traverse(evolution));
        }
      };
      
      traverse(chain);
      return evolutions;
    }
  
    /**
     * Utilitários
     */
    _capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    _extractIdFromUrl(url) {
      const parts = url.split('/').filter(Boolean);
      return parseInt(parts[parts.length - 1]);
    }
  
    /**
     * Limpa o cache
     */
    clearCache() {
      this.cache.clear();
      console.log('[CACHE] Cache limpo');
    }
  
    /**
     * Retorna estatísticas do cache
     */
    getCacheStats() {
      return {
        size: this.cache.size,
        entries: Array.from(this.cache.keys())
      };
    }
  }
  
  // Export para uso em Node.js ou browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PokeAPIService;
  }

import { defineConfig } from 'tailwindcss'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de cores inspirada nos jogos Pokémon
        pokemon: {
          // Cores especiais para tipos Pokémon
          electric: '#fbbf24',
          fire: '#f87171',
          water: '#60a5fa',
          grass: '#34d399',
          psychic: '#a78bfa',
          ice: '#7dd3fc',
          dragon: '#c084fc',
          dark: '#6b7280',
          fairy: '#f472b6',
          fighting: '#f97316',
          poison: '#a855f7',
          ground: '#d97706',
          flying: '#93c5fd',
          bug: '#84cc16',
          rock: '#78716c',
          ghost: '#8b5cf6',
          steel: '#94a3b8',
        }
      },
      animation: {
        // Animações temáticas
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
})

import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Deep dark background palette
        void: {
          950: '#080b11',
          900: '#0d1117',
          800: '#111827',
          700: '#161d2e',
          600: '#1e2940',
        },
        // Sidebar + card surfaces
        surface: {
          DEFAULT: '#141922',
          light: '#1a2233',
          border: '#252f45',
          hover: '#1f2d44',
        },
        // Lua gold/amber accent
        lua: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Status colors
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        // Text hierarchy
        muted: '#6b7fa3',
        soft: '#94a3b8',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245,158,11,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(245,158,11,0.2)' },
        },
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(245,158,11,0.25)',
        'glow-sm': '0 0 8px rgba(245,158,11,0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'modal': '0 25px 60px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 20% 25%, rgba(245,158,11,0.08) 0px, transparent 50%), radial-gradient(at 80% 75%, rgba(16,185,129,0.05) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
} satisfies Config

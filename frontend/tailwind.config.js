/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        slate: {
          925: '#0b1220',
          850: '#131c2e',
          875: '#0f1929',
        },
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          400: '#5b8def',
          500: '#3568d4',
          600: '#2650ab',
          700: '#1e3f87',
        },
        accent: '#e08e45',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse_ring: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px 0 rgba(53,104,212,0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(53,104,212,0.6)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pulse-ring': 'pulse_ring 1.5s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
      },
      backgroundSize: {
        '200%': '200% 100%',
      },
    },
  },
  plugins: [],
};

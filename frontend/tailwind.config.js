/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        slate: {
          925: '#0b1220',
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
    },
  },
  plugins: [],
};

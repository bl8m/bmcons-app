/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Colore principale del brand
        primary: {
          DEFAULT: '#e11117',
          50: '#fdecec',
          100: '#fbd4d5',
          200: '#f5a5a7',
          300: '#ef7679',
          400: '#e9474b',
          500: '#e11117',
          600: '#b90e13',
          700: '#8c0a0f',
          800: '#5f070a',
          900: '#330305',
        },
        // Grigio per il testo standard dell'applicazione
        text: {
          DEFAULT: '#707374',
          light: '#9a9c9d',
          dark: '#4d4f50',
        },
      },
    },
  },
  plugins: [],
};

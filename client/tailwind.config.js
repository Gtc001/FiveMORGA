/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0f1117',
          700: '#12141f',
          600: '#1a1d2e',
          500: '#242838',
          400: '#2a2d3e',
        },
        fivem: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};

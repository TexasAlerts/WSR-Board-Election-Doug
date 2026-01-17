/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      colors: {
        // From yard sign - deep navy blue (DOUG, FOR TOWN COUNCIL)
        navy: {
          DEFAULT: '#1B3A5D',
          light: '#2B4A6D',
          dark: '#0F2840',
        },
        // From yard sign - bold red (CHARLES, bottom banner)
        'prosper-red': {
          DEFAULT: '#BF1E2E',
          light: '#CF3040',
          dark: '#9F1020',
        },
        red: {
          DEFAULT: '#BF1E2E',
          light: '#CF3040',
          dark: '#9F1020',
        },
        // Light cream/white background from sign
        cream: {
          DEFAULT: '#F5F5F0'
        },
        charcoal: {
          DEFAULT: '#333333'
        },
        'off-white': '#FAFAFA',
        'gray-100': '#F5F5F5',
        'gray-600': '#666666',
      }
    },
  },
  plugins: [],
};
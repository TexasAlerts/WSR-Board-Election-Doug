/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E3A5F', // campaign navy blue
          light: '#2D5A8A',   // lighter navy for hover states
          dark: '#152C47',    // darker navy for emphasis
        },
        prosper: {
          red: '#C41E3A',     // campaign red
          'red-light': '#D94A5E', // lighter red for hover
          'red-dark': '#A01830',  // darker red for emphasis
        },
        cream: {
          DEFAULT: '#F8F6F3'  // soft neutral background
        },
        charcoal: {
          DEFAULT: '#333333'  // dark text for accessibility
        }
      }
    },
  },
  plugins: [],
};
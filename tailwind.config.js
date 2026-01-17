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
        navy: {
          DEFAULT: '#1A3A5C', // campaign navy blue (from design doc)
          light: '#2A4A6C',   // lighter navy for hover states
          dark: '#142D47',    // darker navy for emphasis
        },
        'prosper-red': {
          DEFAULT: '#C41E3A',     // campaign red
          light: '#D43250',       // lighter red for hover
          dark: '#A3182F',        // darker red for emphasis
        },
        red: {
          DEFAULT: '#C41E3A',     // alias for prosper-red
          dark: '#A3182F',
          light: '#D43250',
        },
        cream: {
          DEFAULT: '#F8F6F3'  // soft neutral background
        },
        charcoal: {
          DEFAULT: '#333333'  // dark text for accessibility
        },
        'off-white': '#F8F9FA',
        'gray-100': '#F5F5F5',
        'gray-600': '#666666',
      }
    },
  },
  plugins: [],
};
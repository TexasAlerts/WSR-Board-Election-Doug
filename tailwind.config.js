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
        lagoon: {
          DEFAULT: '#005A7A', // deep lagoon blue for trust and stability
          light: '#4FB0C6',   // sky blue accent for optimism
        },
        coral: {
          DEFAULT: '#E04F39', // warm coral red for energy and advocacy
        },
        sand: {
          DEFAULT: '#F5F2EB'  // soft sand neutral for backgrounds
        },
        charcoal: {
          DEFAULT: '#333333'  // dark text colour for accessibility
        }
      }
    },
  },
  plugins: [],
};
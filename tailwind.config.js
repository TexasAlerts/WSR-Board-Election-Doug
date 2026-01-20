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
      },
      // Gradient backgrounds
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0F2840 0%, #1B3A5D 50%, #2B4A6D 100%)',
        'gradient-hero': 'linear-gradient(180deg, #F8F8F5 0%, #FFFFFF 50%, #F8F8F5 100%)',
        'gradient-cta': 'linear-gradient(135deg, #1B3A5D 0%, #0F2840 100%)',
        'gradient-red': 'linear-gradient(135deg, #9F1020 0%, #BF1E2E 50%, #CF3040 100%)',
      },
      // Enhanced shadows with navy tint
      boxShadow: {
        'navy-sm': '0 1px 3px rgba(27, 58, 93, 0.12)',
        'navy-md': '0 4px 12px rgba(27, 58, 93, 0.15)',
        'navy-lg': '0 10px 25px rgba(27, 58, 93, 0.2)',
        'navy-xl': '0 20px 40px rgba(27, 58, 93, 0.25)',
        'glow-navy': '0 0 20px rgba(27, 58, 93, 0.3)',
        'glow-red': '0 0 20px rgba(191, 30, 46, 0.3)',
        'card': '0 2px 8px rgba(27, 58, 93, 0.06)',
        'card-hover': '0 12px 24px rgba(27, 58, 93, 0.12)',
      },
      // Animation keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

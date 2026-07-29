/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html" // good practice for Vite projects
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3f7a62',
          dark: '#2d5346',
          light: '#5f9a82',
        },
        cream: {
          DEFAULT: '#f8f4ec',
          deep: '#ede5d6',
        },
        emerald: {
          deep: '#2d5346',
          DEFAULT: '#3f7a62',
          soft: '#5f9a82',
        },
        gold: {
          DEFAULT: '#d4a84b',
          soft: '#e4c47a',
        },
        ink: {
          DEFAULT: '#38342e',
          soft: '#5c5852',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [] // line-clamp no longer needed here
}

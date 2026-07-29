/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Primary actions — maps to Clarity emerald */
        brand: {
          DEFAULT: '#3f7a62',
          dark: '#2d5346',
          light: '#5f9a82',
        },
        /** Clarity-inspired palette */
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
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

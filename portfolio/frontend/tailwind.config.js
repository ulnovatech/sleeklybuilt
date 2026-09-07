import foundationPreset from '@sleeklybuilt/design-foundation/tailwind-preset'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [foundationPreset],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sleeklybuilt/design-foundation/src/**/*.{js,jsx}',
    './node_modules/@sleeklybuilt/attendant/src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
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
        },
      },
    },
  },
  plugins: [],
}

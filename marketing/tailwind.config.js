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
    extend: {},
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3f7a62',
          dark: '#2d5346',
          light: '#5f9a82',
        },
        cream: {
          DEFAULT: '#f4f3ef',
          deep: '#e6e4de',
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
          DEFAULT: '#2f2d2a',
          soft: '#5a5752',
        },
        obsidian: {
          DEFAULT: '#0a0b0a',
          raised: '#131614',
          line: '#232823',
        },
        surface: {
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
          inverse: 'var(--color-surface-inverse)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          inverse: 'var(--color-content-inverse)',
          link: 'var(--color-content-link)',
        },
        action: {
          primary: 'var(--color-action-primary)',
          'primary-hover': 'var(--color-action-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        status: {
          danger: 'var(--color-status-danger)',
          'danger-surface': 'var(--color-status-danger-surface)',
          success: 'var(--color-status-success)',
          'success-surface': 'var(--color-status-success-surface)',
          warning: 'var(--color-status-warning)',
          'warning-surface': 'var(--color-status-warning-surface)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
        },
      },
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Work Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-hero': [
          'clamp(2.25rem, 4.5vw, 3.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '600' },
        ],
        'display-section': [
          'clamp(1.75rem, 3vw, 2.25rem)',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'display-card': ['1.25rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6' }],
        meta: ['0.875rem', { lineHeight: '1.55' }],
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],
        lead: ['1.125rem', { lineHeight: '1.55' }],
      },
      maxWidth: {
        content: '75rem',
        measure: '65ch',
      },
      ringColor: {
        dos: 'var(--color-focus-ring)',
        'dos-inverse': 'var(--color-focus-ring-inverse)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        normal: 'var(--motion-normal)',
      },
      transitionTimingFunction: {
        dos: 'var(--ease-default)',
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
        },
      },
    },
  },
  plugins: [],
}

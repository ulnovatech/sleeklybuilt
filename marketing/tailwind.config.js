/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /** Primary actions — maps to Clarity emerald (legacy; prefer action.*) */
        brand: {
          DEFAULT: '#3f7a62',
          dark: '#2d5346',
          light: '#5f9a82',
        },
        /** Brand primitives — prefer semantic roles in new UI */
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
        /**
         * Dark tier. Green-warm biased near-black so it sits with cream and gold
         * instead of fighting them. Reserved for the hero, one emphasis band, and
         * the footer — see DESIGN.md.
         */
        obsidian: {
          DEFAULT: '#0a0b0a',
          raised: '#131614',
          line: '#232823',
        },
        /**
         * Design OS semantic roles — prefer these in new components.
         * Values resolve to brand primitives via CSS variables in index.css.
         */
        surface: {
          base: 'var(--color-surface-base)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
          overlay: 'var(--color-surface-overlay)',
          inverse: 'var(--color-surface-inverse)',
          'inverse-raised': 'var(--color-surface-inverse-raised)',
        },
        content: {
          primary: 'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          muted: 'var(--color-content-muted)',
          disabled: 'var(--color-content-disabled)',
          inverse: 'var(--color-content-inverse)',
          link: 'var(--color-content-link)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
          'on-inverse': 'var(--color-border-on-inverse)',
        },
        action: {
          primary: 'var(--color-action-primary)',
          'primary-hover': 'var(--color-action-primary-hover)',
          'primary-active': 'var(--color-action-primary-active)',
          soft: 'var(--color-action-primary-soft)',
          secondary: 'var(--color-action-secondary)',
          'secondary-hover': 'var(--color-action-secondary-hover)',
          danger: 'var(--color-action-danger)',
          'danger-hover': 'var(--color-action-danger-hover)',
          disabled: 'var(--color-action-disabled)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        status: {
          success: 'var(--color-status-success)',
          'success-surface': 'var(--color-status-success-surface)',
          warning: 'var(--color-status-warning)',
          'warning-surface': 'var(--color-status-warning-surface)',
          danger: 'var(--color-status-danger)',
          'danger-surface': 'var(--color-status-danger-surface)',
          info: 'var(--color-status-info)',
          'info-surface': 'var(--color-status-info-surface)',
        },
      },
      spacing: {
        'dos-xs': 'var(--space-xs)',
        'dos-sm': 'var(--space-sm)',
        'dos-md': 'var(--space-md)',
        'dos-lg': 'var(--space-lg)',
        'dos-xl': 'var(--space-xl)',
        'dos-2xl': 'var(--space-2xl)',
        'dos-3xl': 'var(--space-3xl)',
        'dos-4xl': 'var(--space-4xl)',
      },
      borderRadius: {
        'dos-none': 'var(--radius-none)',
        'dos-xs': 'var(--radius-xs)',
        'dos-sm': 'var(--radius-sm)',
        'dos-md': 'var(--radius-md)',
        'dos-lg': 'var(--radius-lg)',
        'dos-xl': 'var(--radius-xl)',
        'dos-2xl': 'var(--radius-2xl)',
        'dos-full': 'var(--radius-full)',
        /**
         * Reconcile Tailwind defaults onto Design OS scale.
         * Legacy `rounded-2xl` (was 16px, off-scale) → radius-xl 20px.
         * True 32px radius uses `rounded-dos-2xl`.
         */
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-xl)',
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'dos-xs': 'var(--shadow-xs)',
        'dos-sm': 'var(--shadow-sm)',
        'dos-md': 'var(--shadow-md)',
        'dos-lg': 'var(--shadow-lg)',
        'dos-xl': 'var(--shadow-xl)',
      },
      transitionDuration: {
        instant: 'var(--motion-instant)',
        fast: 'var(--motion-fast)',
        normal: 'var(--motion-normal)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        'dos-out': 'var(--ease-out)',
        'dos-in': 'var(--ease-in)',
        'dos-in-out': 'var(--ease-in-out)',
        dos: 'var(--ease-default)',
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        notification: 'var(--z-notification)',
      },
      ringColor: {
        dos: 'var(--color-focus-ring)',
        focus: 'var(--color-focus-ring)',
        'dos-inverse': 'var(--color-focus-ring-inverse)',
      },
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        /** Wave 9 display — Plus Jakarta Sans (neo-grotesk). Replaces Instrument Serif. */
        display: ['"Plus Jakarta Sans"', '"Work Sans"', 'system-ui', 'sans-serif'],
        /** @deprecated Alias — use font-display. Kept so stray font-serif classes do not regress. */
        serif: ['"Plus Jakarta Sans"', '"Work Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        /**
         * Display scale — Plus Jakarta Sans, weight 600 via .display-* roles.
         * Restrained: calm systems-studio hierarchy, not theatrical brochure type.
         */
        'display-hero': [
          'clamp(2.25rem, 4.5vw, 3.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '600' },
        ],
        'display-section': [
          'clamp(1.75rem, 3vw, 2.25rem)',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'display-card': ['1.25rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        /** Text scale — Work Sans */
        lead: ['1.125rem', { lineHeight: '1.55' }],
        'lead-lg': ['1.25rem', { lineHeight: '1.55' }],
        body: ['1rem', { lineHeight: '1.6' }],
        meta: ['0.875rem', { lineHeight: '1.55' }],
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      maxWidth: {
        /** Reading measures — body 45–75ch; leads shorter for scan */
        measure: '65ch',
        'measure-lead': '42ch',
        /** Page content rail — ~1152–1280px band */
        content: '75rem',
      },
    },
  },
  plugins: [],
}

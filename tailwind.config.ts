import type { Config } from 'tailwindcss';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background'),
        surface: {
          DEFAULT: withOpacity('--surface'),
          hover: withOpacity('--surface-hover')
        },
        border: {
          DEFAULT: withOpacity('--border'),
          strong: withOpacity('--border-strong')
        },
        foreground: withOpacity('--foreground'),
        'muted-foreground': withOpacity('--muted-foreground'),
        primary: {
          DEFAULT: withOpacity('--primary'),
          hover: withOpacity('--primary-hover'),
          foreground: withOpacity('--primary-foreground')
        },
        accent: {
          DEFAULT: withOpacity('--accent'),
          foreground: withOpacity('--accent-foreground')
        },
        success: {
          DEFAULT: withOpacity('--success'),
          bg: withOpacity('--success-bg')
        },
        warning: {
          DEFAULT: withOpacity('--warning'),
          bg: withOpacity('--warning-bg')
        },
        danger: {
          DEFAULT: withOpacity('--danger'),
          bg: withOpacity('--danger-bg')
        },
        info: {
          DEFAULT: withOpacity('--info'),
          bg: withOpacity('--info-bg')
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 4px 16px -4px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
        popover: '0 12px 32px -8px rgb(0 0 0 / 0.18)'
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem'
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } }
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        shimmer: 'shimmer 1.6s infinite'
      }
    }
  },
  plugins: []
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/lib/**/*.{js,ts}',
    '../../packages/ui/index.ts',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))', // keep generic mapping
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#13ec5b', // Green Primary
          foreground: '#FFFFFF',
        },
        'background-light': '#f6f8f6',
        'background-dark': '#102216',
        'surface-dark': '#152e1e',
        'surface-darker': '#0d1c12',
        'primary-dark': '#0ea640',
        'strain-high': '#ef4444',
        'strain-med': '#f59e0b',
        'input-bg': '#0d1c12', // Dark input background
        'card-dark': '#152e1e', // Dark card background
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'], // Override default sans
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'topo-pattern': "url('https://www.transparenttextures.com/patterns/black-scales.png')",
      },
      boxShadow: {
        glow: '0 0 15px -3px rgba(255, 107, 53, 0.3)',
      },
    },
  },
  plugins: [],
}

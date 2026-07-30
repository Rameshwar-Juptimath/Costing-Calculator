import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#4648d4',
          container: '#6063ee',
          fixed: '#e1e0ff',
          dim: '#c0c1ff',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          lowest: '#ffffff',
          low: '#eff4ff',
          container: '#e5eeff',
          high: '#dce9ff',
          highest: '#d3e4fe',
          variant: '#d3e4fe',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#464554',
        },
        outline: {
          DEFAULT: '#767586',
          variant: '#c7c4d7',
        },
        secondary: {
          DEFAULT: '#565e74',
          container: '#dae2fd',
        },
        tertiary: {
          DEFAULT: '#595c5e',
          container: '#727577',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        }
      },
      spacing: {
        'unit': '4px',
        'cell-y': '8px',
        'cell-x': '12px',
        'gutter': '16px',
        'container-margin': '24px',
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.375rem',
        'xl': '0.5rem',
        '2xl': '0.75rem',
        'full': '9999px',
      }
    }
  },
  plugins: [],
}

export default config


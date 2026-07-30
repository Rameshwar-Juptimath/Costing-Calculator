import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        slate: { 950: '#0f172a' }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #3b82f6, #6366f1)',
      }
    }
  },
  plugins: [],
}
export default config

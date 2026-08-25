/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          bg: '#0B120F',
          panel: '#121C18',
          elevated: '#17241F',
          border: '#25352E',
          text: '#EAF1EC',
          muted: '#8FA79B',
          accent: '#4ADE9A',
          subtle: '#1C2C24',
          highlight: '#2A4337'
        },
        risk: {
          high: '#E8543E',
          medium: '#E8A63E',
          low: '#3FA37D',
          highMuted: 'rgba(232, 84, 62, 0.15)',
          medMuted: 'rgba(232, 166, 62, 0.15)',
          lowMuted: 'rgba(63, 163, 125, 0.15)'
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Space Grotesk', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        'hero-glow': '0 0 25px rgba(74, 222, 154, 0.18)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        }
      }
    },
  },
  plugins: [],
}

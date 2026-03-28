/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'space':  '#050510',
        'panel':  '#0A0A1A',
        'cyan':   '#00F5FF',
        'purple': '#BF5FFF',
        'pink':   '#FF2D78',
        'gold':   '#FFD700',
        'green':  '#00FF88',
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body:    ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '4px', sm: '8px', md: '16px',
        lg: '24px', xl: '40px',
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(0,245,255,0.35)',
        'glow-purple': '0 0 20px rgba(191,95,255,0.35)',
        'glow-pink':   '0 0 20px rgba(255,45,120,0.35)',
        'card':        '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow':  'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'count-up':    'countUp 1.2s ease-out',
        'fade-up':     'fadeUp 0.4s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

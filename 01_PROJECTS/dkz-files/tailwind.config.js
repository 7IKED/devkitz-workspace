/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00ff88',
          'green-dim': '#00cc6a',
          'green-glow': 'rgba(0, 255, 136, 0.3)',
          'green-subtle': 'rgba(0, 255, 136, 0.08)',
        },
        accent: {
          DEFAULT: '#fa1e4e',
          glow: 'rgba(250, 30, 78, 0.3)',
          dim: '#c41840',
        },
        matrix: {
          black: '#000000',
          dark: '#060608',
          card: '#0a0a0f',
          surface: '#111118',
          border: '#1a1a25',
          hover: '#1e1e2a',
        },
        dkz: {
          yellow: '#ffb800',
          blue: '#55acee',
          red: '#ff3b5c',
          muted: '#555570',
          text: '#e8e8f0',
          'text-dim': '#8888aa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'neon-lg': '0 0 20px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.15)',
        'neon-accent': '0 0 10px rgba(250, 30, 78, 0.3), 0 0 40px rgba(250, 30, 78, 0.1)',
        'neu-raised': '8px 8px 16px rgba(0,0,0,0.6), -4px -4px 12px rgba(30,30,50,0.08)',
        'neu-inset': 'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(30,30,50,0.06)',
        'neu-float': '12px 12px 24px rgba(0,0,0,0.7), -6px -6px 18px rgba(30,30,50,0.1)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 1.5s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 255, 136, 0.5), 0 0 50px rgba(0, 255, 136, 0.2)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
          '55%': { opacity: '1' },
          '70%': { opacity: '0.9' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};

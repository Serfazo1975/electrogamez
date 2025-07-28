/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          900: '#1e3a8a',
        },
        electric: {
          blue: '#0066FF',
          cyan: '#00D9FF',
          purple: '#6366f1',
        }
      },
      fontFamily: {
        'tech': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-electric': 'pulseElectric 2s infinite',
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
        pulseElectric: {
          '0%, 100%': { boxShadow: '0 0 20px #0066FF' },
          '50%': { boxShadow: '0 0 40px #0066FF, 0 0 60px #00D9FF' },
        },
      },
    },
  },
  plugins: [],
}

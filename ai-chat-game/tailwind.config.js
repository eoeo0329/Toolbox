/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sf: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ios: {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          card2: '#F9F9FB',
          label: '#1C1C1E',
          label2: '#3C3C43',
          label3: '#8E8E93',
          label4: '#AEAEB2',
          separator: '#E5E5EA',
          blue: '#007AFF',
          purple: '#5E5CE6',
          pink: '#FF375F',
          red: '#FF3B30',
          green: '#34C759',
          orange: '#FF9500',
          yellow: '#FFCC00',
          teal: '#30B0C7',
          indigo: '#5856D6',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,24,39,.04), 0 8px 24px rgba(17,24,39,.06)',
        pop: '0 10px 40px rgba(17,24,39,.12)',
        inner2: 'inset 0 0 0 0.5px rgba(60,60,67,.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.4s infinite both',
        'fade-up': 'fadeUp .5s cubic-bezier(.2,.8,.2,1) both',
        'pop-in': 'popIn .35s cubic-bezier(.2,.8,.2,1) both',
        'slide-up': 'slideUp .35s cubic-bezier(.2,.8,.2,1) both',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '.4' },
          '10%, 30%': { transform: 'translateY(-10px)', opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

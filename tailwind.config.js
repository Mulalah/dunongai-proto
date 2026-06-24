/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          50: '#E6E9EE',
          100: '#C7CDD7',
          200: '#9099A8',
          300: '#5A6679',
          400: '#2A3848',
          500: '#0A1628',
          600: '#081222',
          700: '#060E1B',
          800: '#040A14',
          900: '#02060C'
        },
        teal: {
          DEFAULT: '#0D9488',
          50: '#E6F7F6',
          100: '#B6E8E4',
          200: '#86D8D2',
          300: '#56C9C0',
          400: '#2EB7AC',
          500: '#0D9488',
          600: '#0B8079',
          700: '#096B65',
          800: '#075751',
          900: '#04332E'
        },
        gold: {
          DEFAULT: '#F59E0B',
          50: '#FEF7E6',
          100: '#FDEAB8',
          200: '#FBDA8A',
          300: '#F9CA5C',
          400: '#F7B82D',
          500: '#F59E0B',
          600: '#D08509',
          700: '#A56A07',
          800: '#7A4F05',
          900: '#4F3303'
        },
        success: '#10B981',
        danger: '#EF4444'
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        reading: ['Lora', 'Georgia', 'serif']
      },
      boxShadow: {
        'glow-teal': '0 8px 24px -8px rgba(13, 148, 136, 0.5)',
        'glow-gold': '0 8px 24px -8px rgba(245, 158, 11, 0.5)',
        xs: '0 1px 2px 0 rgba(10, 22, 40, 0.05)',
        card: '0 1px 2px rgba(10, 22, 40, 0.04), 0 6px 20px -8px rgba(10, 22, 40, 0.12)',
        'card-hover':
          '0 2px 4px rgba(10, 22, 40, 0.05), 0 16px 36px -12px rgba(10, 22, 40, 0.2)'
      },
      animation: {
        fadeSlideUp: 'fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        scoreReveal: 'scoreReveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        levelUp: 'levelUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        bounce: 'bounce 1.2s infinite',
        floatConfetti: 'floatConfetti 6s ease-in infinite',
        typingDot: 'typingDot 1.2s ease-in-out infinite'
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        },
        scoreReveal: {
          '0%': { opacity: 0, transform: 'scale(0.5)' },
          '60%': { opacity: 1, transform: 'scale(1.15)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        levelUp: {
          '0%': { transform: 'scale(0.4) rotate(-12deg)', opacity: 0 },
          '60%': { transform: 'scale(1.15) rotate(4deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(0)', opacity: 1 }
        },
        floatConfetti: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 }
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
          '30%': { transform: 'translateY(-6px)', opacity: 1 }
        }
      }
    }
  },
  plugins: []
};

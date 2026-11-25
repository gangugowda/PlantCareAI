/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F1F7F3',
          100: '#DFEEE4',
          200: '#C2DFCC',
          300: '#95C7A8',
          400: '#61A77D',
          500: '#3D8960',
          600: '#2A6E4B',
          700: '#23583E',
          800: '#1B4733',
          900: '#0E3D2E',
          950: '#07291E',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        lime: {
          50: '#F7FEE9',
          100: '#ECFCCB',
          200: '#DAF7A5',
          300: '#C9F27B',
          400: '#B2E84C',
          500: '#97D32A',
          600: '#77AC1D',
        },
        charcoal: {
          50: '#F5F7F5',
          100: '#E8ECE8',
          200: '#D3DAD4',
          300: '#AFBBB1',
          400: '#839387',
          500: '#647467',
          600: '#4D5D51',
          700: '#3B4A3F',
          800: '#28352C',
          900: '#17211B',
          950: '#0C1510',
        },
        cream: '#F6F8F3',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      lineHeight: {
        '4.5': '1.125rem',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,61,46,.04), 0 18px 40px -24px rgba(14,61,46,.18)',
        float: '0 24px 70px -30px rgba(8,44,32,.38)',
        soft: '0 10px 30px -18px rgba(14,61,46,.22)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      maxWidth: {
        wrap: '1240px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        wave: {
          '0%': { transform: 'translateX(-50%) rotate(0deg)' },
          '100%': { transform: 'translateX(-50%) rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .55s cubic-bezier(.2,.8,.2,1) both',
        fadeIn: 'fadeIn .4s ease both',
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
        wave: 'wave 9s linear infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
}

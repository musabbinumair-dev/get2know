/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EA',
        ink: '#1A1C22',
        'muted-gray': '#8A8A93',
        pink: {
          DEFAULT: '#F4A7D3',
          blob: '#F8A6BE',
          heart: '#F7A7C8'
        },
        yellow: {
          DEFAULT: '#F8D56B',
          crescent: '#F9D76A',
          star: '#FAD768'
        },
        blue: {
          DEFAULT: '#A9B8F2',
          periwinkle: '#A9B8F2',
          blob: '#93ADF9',
          star: '#AABEF5'
        },
        green: {
          DEFAULT: '#9DAA5F',
          olive: '#A4B571'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        nunito: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        body: '400',
        medium: '500',
        label: '600',
        bold: '700',
        question: '800',
        hero: '900',
      },
      borderRadius: {
        'card': '30px',
        'card-lg': '32px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

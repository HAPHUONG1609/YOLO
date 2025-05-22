/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Quét tất cả file trong src có đuôi .js, .jsx, .ts, .tsx
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#dcf3ff',
          200: '#b3e7ff',
          300: '#66d7ff',
          400: '#1ac0ff',
          500: '#00a5cf',
          600: '#0084af',
          700: '#00698d',
          800: '#005875',
          900: '#004a63',
        },
        secondary: {
          50: '#f0fdf7',
          100: '#dafcea',
          200: '#b5f7d3',
          300: '#7cefb0',
          400: '#3ddb83',
          500: '#1eb464',
          600: '#15944f',
          700: '#157541',
          800: '#165d39',
          900: '#144d30',
        },
        accent: {
          50: '#fff9eb',
          100: '#ffefc9',
          200: '#ffd988',
          300: '#ffbf47',
          400: '#ffa524',
          500: '#f98207',
          600: '#dd5f03',
          700: '#b53f05',
          800: '#93300c',
          900: '#7a280d',
        },
        neutral: {
          50: '#f7f9fb',
          100: '#e9eef5',
          200: '#d5deea',
          300: '#b4c4d9',
          400: '#8fa0c0',
          500: '#7182a8',
          600: '#596a8c',
          700: '#475571',
          800: '#3b475d',
          900: '#343c4d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      scale: {
        '102': '1.02',
        '98': '0.98',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [],
} 
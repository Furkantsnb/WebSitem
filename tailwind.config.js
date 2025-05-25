/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6',
          dark: '#2563EB',
        },
        background: {
          light: '#F9FAFB',
          dark: '#111827',
        },
        text: {
          light: '#1F2937',
          dark: '#F9FAFB',
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'background-color, border-color, color, fill, stroke',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
} 
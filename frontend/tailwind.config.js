/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8F3',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F5F1',
        },
        krishi: {
          text: '#17211B',
          'text-secondary': '#5F6B63',
          muted: '#89938C',
          green: '#2F6B4F',
          'green-light': '#3D8B66',
          'green-dark': '#23533D',
          accent: '#16A878',
          earth: '#9A6B3F',
          'earth-light': '#B38152',
          gold: '#D9A441',
          blue: '#2E86AB',
          warning: '#D99A2B',
          danger: '#C94C4C',
          border: '#E1E7E1',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Devanagari"',
          '"Noto Sans Gujarati"',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 33, 27, 0.05), 0 1px 2px 0 rgba(23, 33, 27, 0.03)',
        'card': '0 4px 12px 0 rgba(23, 33, 27, 0.05), 0 1px 3px 0 rgba(23, 33, 27, 0.02)',
        'card-hover': '0 10px 25px -3px rgba(47, 107, 79, 0.1), 0 4px 6px -2px rgba(23, 33, 27, 0.04)',
      }
    },
  },
  plugins: [],
}

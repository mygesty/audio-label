/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#10B981',
        },
        secondary: '#10B981',
        accent: '#F97316',
        background: '#ECFDF5',
        text: '#064E3B',
      },
      fontFamily: {
        sans: ['Poppins', 'Open Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
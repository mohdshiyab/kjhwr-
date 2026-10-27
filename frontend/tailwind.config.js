/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wind: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1'
        },
        thermal: {
          light: '#f59e0b',
          DEFAULT: '#d97706',
          dark: '#b45309'
        },
        clean: {
          light: '#34d399',
          DEFAULT: '#059669',
          dark: '#047857'
        }
      }
    },
  },
  plugins: [],
}

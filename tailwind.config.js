/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#e0e7f0',
          200: '#c2d0e0',
          300: '#a0b8d0',
          400: '#7a9cc0',
          500: '#1e3a5f',
          600: '#1a2d4a',
          700: '#152038',
          800: '#0f1520',
          900: '#0a0d14',
        },
        blue: {
          accent: '#3b82f6',
          accentHover: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}

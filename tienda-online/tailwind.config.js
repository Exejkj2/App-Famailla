/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand:         '#FF2A75', // Rosa vibrante / Candy Pink
        'brand-dark':   '#E01A60',
        accent:        '#FFD600', // Amarillo brillante
        'accent-dark': '#E6C200',
        purple:        '#7C3AED', // Violeta dulce
        ink:           '#2D1540', // Morado oscuro/negro suave
        'ink-muted':   '#7E6C8E',
        surface:       '#FFFFFF',
        bg:            '#FFF8FA',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

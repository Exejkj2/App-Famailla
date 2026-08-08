/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand:         '#14B8A6', // Turquesa / Verde Agua
        'brand-dark':  '#0D9488',
        accent:        '#F97316', // Naranja
        'accent-dark': '#EA580C',
        purple:        '#8B5CF6', 
        ink:           '#1E293B', // Gris oscuro
        'ink-muted':   '#64748B',
        surface:       '#FFFFFF',
        bg:            '#F8FAFC', // Gris muy suave
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

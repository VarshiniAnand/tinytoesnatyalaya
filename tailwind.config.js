/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: '#800000',
        gold: '#d4af37',
        'deep-gold': '#b8860b',
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        lora: ['var(--font-lora)', 'serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paciWhite': '#F7F7F7',
        'paciBlack': '#0d0f13',
        'paciGreen': '#079164',
      }
    },
  },
  plugins: [],
}


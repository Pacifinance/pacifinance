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
        'paciGray': '#222831',
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
      },
      width: {
        '400': '400px',
        '350': '350px',
        '300': '300px',
      },
      height: {
        '400': '400px',
        '350': '350px',
        '300': '300px',
        '250': '250px',
        '200': '200px',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.5s ease-out forwards',
      },
    },
  },
  variants: {
    extend: {
      fontSize: ['placeholder']
    }
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3399E5',
        secondary: '#4DCC99',
        gray: {
          400: '#999999',
          500: '#666666',
          600: '#808080',
        }
      }
    },
  },
  plugins: [],
}

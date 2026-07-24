/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0B6623',
          primaryDark: '#074C19',
          primaryLight: '#E8F5E9',
          saffron: '#FF9933',
          green: '#138808',
          ashoka: '#000080'
        }
      }
    },
  },
  plugins: [],
}

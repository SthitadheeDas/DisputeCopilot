/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: '#0070ba',
          darkBlue: '#003087',
          lightBlue: '#0079C1',
          navy: '#001c40',
        }
      }
    },
  },
  plugins: [],
}

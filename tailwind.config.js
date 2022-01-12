const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    screens: {
      "xs": "320px",
      ...defaultTheme.screens
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

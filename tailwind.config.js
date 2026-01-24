/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["BebasNeue_400Regular"],
        montserrat: ["Montserrat_400Regular"],
        "montserrat-medium": ["Montserrat_500Medium"],
        "montserrat-semibold": ["Montserrat_600SemiBold"],
        "montserrat-bold": ["Montserrat_700Bold"],
        mono: ["Menlo", "monospace"],
      },
      colors: {
        primary: "#D6F31F",
        secondary: "#3CFFD0",
        dark: "#0E0E0E",
        lightgray: "#BDBDBD",
        gray: "#919191",
        dangerous: "#E84545",
      },
    },
  },
  plugins: [],
};

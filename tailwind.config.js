/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        nb: {
          bg: "#FFFBF0",
          card: "#FFFFFF",
          yellow: "#FFE500",
          pink: "#FF4DAD",
          blue: "#4DCDFF",
          green: "#3DFF93",
          red: "#FF4444",
          dark: "#1A1A1A",
          gray: "#F0EDDE",
        },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #1A1A1A",
        "brutal-sm": "2px 2px 0px 0px #1A1A1A",
        "brutal-lg": "6px 6px 0px 0px #1A1A1A",
        "brutal-yellow": "4px 4px 0px 0px #FFE500",
        "brutal-pink": "4px 4px 0px 0px #FF4DAD",
        "brutal-blue": "4px 4px 0px 0px #4DCDFF",
        "brutal-green": "4px 4px 0px 0px #3DFF93",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        floaty: "floaty 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

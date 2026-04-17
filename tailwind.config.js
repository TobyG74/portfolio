/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        quest: {
          bg: "#060816",
          card: "#0e1630",
          line: "#1c2c55",
          glow: "#f4c95d",
          accent: "#5dd9c1",
          danger: "#ff6b6b",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "cursive"],
        retro: ["var(--font-retro)", "monospace"],
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

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#04060a",
          800: "#080b12",
          700: "#0c111c",
          600: "#121826",
        },
        aqua: {
          DEFAULT: "#5ffbf1",
          dim: "#2fd9cf",
          deep: "#0a3d3a",
        },
        violet: {
          DEFAULT: "#9d7bff",
          dim: "#7c5cff",
        },
        ghost: "#aeb9d4",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-sora)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 -800px" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "41%": { opacity: "1" },
          "42%": { opacity: "0.4" },
          "43%": { opacity: "1" },
          "45%": { opacity: "0.7" },
          "46%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "grid-pan": "grid-pan 24s linear infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        flicker: "flicker 6s linear infinite",
        marquee: "marquee 40s linear infinite",
        scan: "scan 7s linear infinite",
      },
    },
  },
  plugins: [],
};

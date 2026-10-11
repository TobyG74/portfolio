/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BUILD.md tokens; raw channels retain existing opacity modifiers.
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        primary: "#FDC800",
        secondary: "#432DD7",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        surface: "#FBFBF9",
        text: "#1C293C",

        // Existing game class names share the same design tokens.
        void: {
          DEFAULT: "#1C293C",
          800: "#162234",
          700: "#25344B",
          600: "#30415A",
        },
        aqua: {
          DEFAULT: "#FDC800",
          dim: "#D97706",
          deep: "#1C293C",
        },
        violet: {
          DEFAULT: "#432DD7",
          dim: "#432DD7",
        },
        xp: "#16A34A",
        gold: "#FDC800",
        hp: "#DC2626",
        ghost: "#FBFBF9",
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        pixel: ["var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        xs: ["13px", "1.5"],
        sm: ["15px", "1.6"],
        base: ["17px", "1.6"],
        lg: ["21px", "1.5"],
        xl: ["27px", "1.3"],
        "2xl": ["35px", "1.2"],
      },
      borderRadius: {
        DEFAULT: "4px",
        lg: "4px",
        xl: "4px",
        "2xl": "4px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.15" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "hurt-flash": {
          "0%": { opacity: "0.9" },
          "100%": { opacity: "0" },
        },
        "scroll-cue": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "40%, 60%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "marquee-rev": "marquee-rev 38s linear infinite",
        blink: "blink 1.1s steps(1) infinite",
        bob: "bob 2.6s ease-in-out infinite",
        "hurt-flash": "hurt-flash 0.55s ease-out forwards",
        "scroll-cue": "scroll-cue 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in-left":
          "fade-in-left 0.7s cubic-bezier(0.390, 0.575, 0.565, 1.000) 0.5s  both",
        "fade-in-right":
          "fade-in-right 0.7s cubic-bezier(0.390, 0.575, 0.565, 1.000) 0.5s  both",
        fadeIn: "fadeIn 2s ease-in forwards",
      },
      keyframes: {
        "fade-in-left": {
          "0%": {
            transform: "translateX(-50px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "fade-in-right": {
          "0%": {
            transform: "translateX(50px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
    variants: {
      animation: ["motion-safe"],
    },
  },
};
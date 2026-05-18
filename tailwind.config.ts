import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: "#020d1a",
          900: "#041525",
          800: "#062035",
          700: "#0a3050",
        },
      },
      animation: {
        "bubble": "bubble linear infinite",
        "wave": "wave 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        bubble: {
          "0%": { transform: "translateY(110vh) scale(0.5)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "90%": { opacity: "0.2" },
          "100%": { transform: "translateY(-10vh) scale(1)", opacity: "0" },
        },
        wave: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(-10px) translateY(-8px)" },
          "66%": { transform: "translateX(10px) translateY(5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

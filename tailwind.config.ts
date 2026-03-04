import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6B21A8",
          pink: "#EC4899",
          lavender: "#E9D5FF",
          blue: "#3B82F6",
        },
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 25%, #FCE7F3 50%, #DBEAFE 100%)",
      },
      keyframes: {
        "title-underline": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "title-underline": "title-underline 0.6s ease-out forwards",
        blink: "blink 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        brand: { blue: "#1A3A8F", "blue-light": "#2563EB", green: "#22C55E", "green-dark": "#16A34A" },
      },
    },
  },
  plugins: [],
};
export default config;

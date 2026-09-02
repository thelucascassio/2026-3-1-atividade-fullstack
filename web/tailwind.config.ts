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
        diatinf: {
          dark: "#0C3453",
          primary: "#CE701B",
          secondary: "#F1881D",
          accent: "#FDC616",
          light: "#F9EBC2",
          gray: "#A4BCCC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
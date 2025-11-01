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
        primary: {
          DEFAULT: "#075e54",
          dark: "#075e54",
          light: "#dcf8c6",
        },
        secondary: {
          DEFAULT: "#00c307",
        },
      },
    },
  },
  plugins: [],
};
export default config;


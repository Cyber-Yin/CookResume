import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          DEFAULT: "var(--color-theme-primary)",
          primary: "var(--color-theme-primary)",
          secondary: "var(--color-theme-secondary)",
        },
      },
      backgroundColor: {
        custom: {
          DEFAULT: "var(--color-background-primary)",
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
        },
      },
      textColor: {
        custom: {
          DEFAULT: "var(--color-font-primary)",
          primary: "var(--color-font-primary)",
          secondary: "var(--color-font-secondary)",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui(), require("tailwindcss-animate")],
} satisfies Config;

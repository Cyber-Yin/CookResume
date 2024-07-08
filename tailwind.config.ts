import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary-normal)",
          light: "var(--color-primary-light)",
          normal: "var(--color-primary-normal)",
        },
        danger: {
          DEFAULT: "var(--color-danger-normal)",
          light: "var(--color-danger-light)",
          normal: "var(--color-danger-normal)",
        },
        warning: {
          DEFAULT: "var(--color-warning-normal)",
          light: "var(--color-warning-light)",
          normal: "var(--color-warning-normal)",
        },
        success: {
          DEFAULT: "var(--color-success-normal)",
          light: "var(--color-success-light)",
          normal: "var(--color-success-normal)",
        },
      },
      borderColor: {
        custom: {
          DEFAULT: "var(--color-border-primary)",
          primary: "var(--color-border-primary)",
          secondary: "var(--color-border-secondary)",
        },
      },
      backgroundColor: {
        custom: {
          DEFAULT: "var(--color-background-primary)",
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
          hover: "var(--color-background-hover)",
        },
      },
      textColor: {
        custom: {
          DEFAULT: "var(--color-font-primary)",
          primary: "var(--color-font-primary)",
          secondary: "var(--color-font-secondary)",
          tertiary: "var(--color-font-tertiary)",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

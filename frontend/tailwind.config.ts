import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "#F8F9FA",
        surface: "#FFFFFF",
        border: "#E2E5E9",
        // Judicial Blue — primary brand color, used for authority & trust
        judicial: {
          50: "#EAF0F6",
          100: "#CBDBE9",
          300: "#5C87AC",
          500: "#0F4C81",
          600: "#0D3E68",
          700: "#0A2F4F",
          900: "#071E33",
        },
        // Muted Gold — reserved for accents, seals, dividers only
        gold: {
          100: "#F1E7D6",
          300: "#D9BE8F",
          500: "#B08D57",
          600: "#8F7145",
        },
        slate: {
          50: "#F5F6F7",
          200: "#DDE1E5",
          400: "#8A93A0",
          500: "#5B6472",
          600: "#414A57",
          700: "#2B323C",
          900: "#161A20",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "IBM Plex Sans", "system-ui", "sans-serif"],
        plex: ["var(--font-plex)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 10px rgba(15, 23, 42, 0.06), 0 16px 36px rgba(15, 23, 42, 0.10)",
      },
      letterSpacing: {
        wide2: "0.08em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;

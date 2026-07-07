/** Surya Center design tokens — dark-first, "sunrise over deep space" palette. */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0C10",
        surface: {
          DEFAULT: "#15161C",
          elevated: "#1E1F27",
        },
        border: "#2A2B35",
        foreground: {
          DEFAULT: "#F5F5F7",
          muted: "#9497A6",
          subtle: "#6B6E7D",
        },
        sun: {
          DEFAULT: "#F2A93B",
          soft: "#F7C36B",
          dim: "#8A5E22",
        },
        dawn: {
          DEFAULT: "#7C6FE8",
          soft: "#A79CF2",
        },
        success: "#34D399",
        danger: "#F26161",
        warning: "#F2A93B",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 24px -4px rgba(242,169,59,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

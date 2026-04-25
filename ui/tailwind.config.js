/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f17",
        panel: "#121826",
        border: "#1f2937",
        muted: "#94a3b8",
        accent: "#3b82f6",
        porter: {
          yellow: "#FFCD11",
          yellowDark: "#E6B800",
          ink: "#111418",
          slate: "#2A2F36",
          cloud: "#F4F5F7",
          line: "#E5E7EB",
          mute: "#6B7280",
          good: "#12B76A",
          warn: "#F79009",
          bad: "#F04438",
        },
      },
    },
  },
  plugins: [],
};

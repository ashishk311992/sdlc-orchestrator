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
      },
    },
  },
  plugins: [],
};

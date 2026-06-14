import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Background colors
    'bg-primary-500', 'bg-primary-600',
    'bg-green-500', 'bg-green-600',
    'bg-orange-500', 'bg-orange-600', 'bg-orange-700',
    'bg-yellow-500', 'bg-yellow-600',
    'bg-red-500', 'bg-red-600',
    'bg-purple-500', 'bg-purple-600',
    'bg-cyan-500', 'bg-cyan-600',
    'bg-pink-500', 'bg-pink-600',
    'bg-indigo-500', 'bg-indigo-600',
    'bg-gray-500', 'bg-gray-600',
    'bg-emerald-500', 'bg-emerald-600',
    'bg-amber-500', 'bg-amber-600',
    'bg-teal-500', 'bg-teal-600',
    'bg-rose-500', 'bg-rose-600',
    'bg-violet-500', 'bg-violet-600',
    'bg-lime-500', 'bg-lime-600',
    // Text colors
    'text-white',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Community blue — fresh, friendly, and trustworthy
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // PRIMARY_LIGHT
          600: "#2563eb", // PRIMARY (main)
          700: "#1d4ed8", // PRIMARY_DARK
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Secondary: Blue accent — matches community blue theme
        secondary: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
export default config;

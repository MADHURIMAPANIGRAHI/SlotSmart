

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
      // Your Custom "Galactic Night" Theme
        'dark-bg': '#1a202c',       // Main background
        'card-bg': '#2d3748',       // Card or secondary background
        'primary': '#00f5d4',       // Primary accent (teal)
        'primary-hover': '#98f5e1', // Lighter teal for hover
        'text-main': '#e2e8f0',     // Main text color
        'text-secondary': '#a0aec0' // For notifications/success
    },
    fontFamily: {
      sans: ['var(--font-inter)'], // Connects to the font in layout.js
    },
    keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};


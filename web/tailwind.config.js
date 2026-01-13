/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Annotation type colors
        concern: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309'
        },
        question: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8'
        },
        suggestion: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#15803d'
        },
        blocker: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}

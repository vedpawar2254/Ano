/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Warm neutral base
        surface: {
          DEFAULT: '#1a1a1a',
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Muted annotation colors
        blocker: {
          light: 'rgba(220, 120, 100, 0.12)',
          DEFAULT: '#c9766a',
          text: '#e8a99e',
        },
        concern: {
          light: 'rgba(210, 160, 90, 0.12)',
          DEFAULT: '#c9a05a',
          text: '#e8c98f',
        },
        question: {
          light: 'rgba(130, 160, 190, 0.12)',
          DEFAULT: '#7a9bb8',
          text: '#a8c4dc',
        },
        suggestion: {
          light: 'rgba(120, 170, 140, 0.12)',
          DEFAULT: '#6b9e7a',
          text: '#9ec9ab',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}

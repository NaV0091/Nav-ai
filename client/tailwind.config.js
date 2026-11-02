/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FFF7E8',
          200: '#FDF0D5',
          300: '#F8E7C0',
        },
        primary: {
          DEFAULT: '#006c4d',
          dark: '#004e37',
          light: '#34c795',
          tint: '#72fbc5',
          soft: '#e6f8ee',
        },
        secondary: {
          DEFAULT: '#225eaa',
          light: '#79acfd',
          soft: '#ebf3fe',
        },
        tertiary: {
          DEFAULT: '#754f8a',
          light: '#cda1e2',
          soft: '#f5d9ff',
        },
        peach: {
          DEFAULT: '#ea580c',
          light: '#fdba8c',
          soft: '#fff2eb',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          cream: '#FFF7E8',
          sage: '#ecfef4',
          muted: '#F8F5EF',
          dim: '#cdded5',
          container: '#e0f2e8',
          'container-low': '#e6f8ee',
          'container-high': '#dbece3',
        },
        forest: {
          DEFAULT: '#101e19',
          slate: '#1b2a24',
          muted: '#6c7a72',
          border: '#d5e7dd',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 14px -2px rgba(16, 30, 25, 0.05), 0 1px 4px -1px rgba(16, 30, 25, 0.03)',
        'soft-lg': '0 8px 30px -4px rgba(16, 30, 25, 0.07), 0 2px 8px -2px rgba(16, 30, 25, 0.04)',
        'glow-primary': '0 8px 24px -4px rgba(52, 199, 149, 0.35)',
      },
    },
  },
  plugins: [],
}


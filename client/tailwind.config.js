/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pakistan: {
          green: '#006400',
          light: '#228B22',
          dark: '#004d00',
        },
        emergency: '#DC2626',
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', 'serif'],
      },
    },
  },
  plugins: [],
};

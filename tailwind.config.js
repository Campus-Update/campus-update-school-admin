/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Ojuju', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        logo: ['"Clash Grotesk"', 'Archivo', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#4F46E5',
          deep: '#201C5C',
          soft: '#EEEDFD',
          mid: '#726BEA',
          ink: '#0E0C0E',
          charcoal: '#1F1F1F',
        },
      },
      boxShadow: {
        'nav-pill':
          '0 0 20px rgba(146,154,164,0.14), 0 4px 10px rgba(146,154,164,0.05), 0 4px 10px rgba(0,0,0,0.02)',
        'cta':
          '0 25px 52px rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.05)',
        'input':
          '0 25px 52px rgba(0,0,0,0.05), 0 10px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03)',
        chip:
          '0 1px 1px rgba(0,0,0,0.10), 0 3px 6px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.01)',
        badge:
          '0 0 1px rgba(0,0,0,0.10), 0 2px 2px rgba(0,0,0,0.09), 0 4px 3px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}

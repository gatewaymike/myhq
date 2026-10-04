/** @type {import('tailwindcss').Config} */
// Colors read CSS variables from src/index.css, so the palette is changed in one place (R-366).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), 'surface-2': v('surface-2'), line: v('border'), track: v('track'),
        text: v('text'), body: v('body'), muted: v('muted'),
        water: v('water'), inhalation: v('inhalation'), gold: v('gold'), mint: v('mint'), danger: v('danger'),
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', '"Segoe UI"', '"Noto Sans TC"', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: { card: '14px' },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
    },
  },
  plugins: [],
};

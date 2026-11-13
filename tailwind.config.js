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
        water: v('water'), inhalation: v('inhalation'), action: v('action'), 'on-action': v('on-action'), ref: v('ref'), gold: v('gold'), mint: v('mint'), 'gold-bright': v('gold-bright'), 'mint-bright': v('mint-bright'), danger: v('danger'),
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', '"Segoe UI"', '"Noto Sans TC"', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      // Type steps (design direction section 3). No bold above 600.
      fontSize: {
        readout: ['60px', { lineHeight: '60px' }],
        'figure-l': ['34px', { lineHeight: '34px' }],
        'figure-m': ['24px', { lineHeight: '26px' }],
        title: ['28px', { lineHeight: '32px' }],
        copy: ['16px', { lineHeight: '24px' }],
        row: ['15px', { lineHeight: '22px' }],
        small: ['13px', { lineHeight: '19px' }],
        arith: ['11.5px', { lineHeight: '17px' }],
        label: ['11px', { lineHeight: '13px' }],
      },
      fontWeight: { bold: '600' },
      borderRadius: { card: '14px' },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
    },
  },
  plugins: [],
};

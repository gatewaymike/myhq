// Local copies of the app's Google Fonts for screenshot fidelity in tests (the sandbox cannot reach Google).
import { readFileSync } from 'node:fs';
const f = (pkg, file) => readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`).toString('base64');
const face = (family, weight, style, data) =>
  `@font-face{font-family:"${family}";font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${data}) format("woff2");}`;
export const fontCSS = [
  face('DM Mono', 400, 'normal', f('dm-mono', 'dm-mono-latin-400-normal.woff2')),
  face('DM Mono', 500, 'normal', f('dm-mono', 'dm-mono-latin-500-normal.woff2')),
  face('Playfair Display', 600, 'italic', f('playfair-display', 'playfair-display-latin-600-italic.woff2')),
  face('DM Sans', 400, 'normal', f('dm-sans', 'dm-sans-latin-400-normal.woff2')),
  face('DM Sans', 500, 'normal', f('dm-sans', 'dm-sans-latin-500-normal.woff2')),
  face('DM Sans', 700, 'normal', f('dm-sans', 'dm-sans-latin-700-normal.woff2')),
].join('\n');

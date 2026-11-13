import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled, never fetched from Google (finding B18): DM Sans for figures and sentences,
// DM Mono for labels, units and the arithmetic line, Playfair Display italic for the wordmark.
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/dm-mono/latin-400.css'
import '@fontsource/dm-mono/latin-500.css'
import '@fontsource/playfair-display/latin-600-italic.css'
import './index.css'
import './lib/install' // catches the browser's install event at startup
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

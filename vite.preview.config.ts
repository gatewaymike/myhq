import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file preview build for the parity gate (example data, no network calls).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  define: { 'import.meta.env.VITE_PREVIEW': JSON.stringify('1') },
  resolve: { alias: { 'virtual:pwa-register/react': fileURLToPath(new URL('./src/app/pwaPreviewStub.ts', import.meta.url)) } },
  build: { outDir: 'dist-preview', emptyOutDir: true },
});

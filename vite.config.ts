/**
 * Vite config for the notes plugin's federated UI (remote).
 *
 * Runs its own dev server on port 5178. The host (Sero on 5173)
 * declares this as a remote and imports components via MF.
 *
 * `server.origin` ensures all chunk URLs are absolute so the host
 * can load them cross-origin.
 *
 * IMPORTANT: @sero-ai/app-runtime must NOT be aliased here — the MF
 * plugin must intercept that import so the host's singleton is used
 * at runtime. Resolution happens via node_modules symlink chain.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Keep Vite's root at the package root: @module-federation/vite writes physical
  // virtual modules under node_modules, and `root: 'ui'` makes clean installs
  // look for the generated host-init entry in the wrong place.
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'sero_notes',
      filename: 'remoteEntry.js',
      dts: false,
      manifest: true,
      exposes: {
        './NotesApp': './ui/NotesApp.tsx',
        './NotesWidget': './ui/widgets/NotesWidget.tsx'
      },
      shared: {
        react: { singleton: true },
        'react/': { singleton: true },
        'react-dom': { singleton: true },
        'react-dom/': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5178,
    strictPort: true,
    origin: 'http://localhost:5178',
  },
  optimizeDeps: {
    exclude: ['@sero-ai/app-runtime'],
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist/ui',
    emptyOutDir: true,
    rollupOptions: {
      input: 'ui/index.html',
    },
  },
});

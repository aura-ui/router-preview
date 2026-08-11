import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  base: '/',
  resolve: {
    // `prebuild` emits the real package entry here. The alias keeps demo builds
    // working from the repository root even before `demo/node_modules` exists.
    alias: {
      '@auraui/router': resolve(import.meta.dirname, '../dist/index.js'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
        migration: resolve(import.meta.dirname, 'migration/index.html'),
        workspace: resolve(import.meta.dirname, 'workspace/index.html'),
        workspaceSettings: resolve(import.meta.dirname, 'workspace/settings/index.html'),
      },
    },
  },
});

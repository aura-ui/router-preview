import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  base: '/router-preview/',
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

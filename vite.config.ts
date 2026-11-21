import { defineConfig } from 'vitest/config';

// gallery.html is a dev-only page: the dev server serves it, the build leaves it out.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rolldownOptions: { input: { main: 'index.html' } },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});

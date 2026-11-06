import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const stub = (file: string) => fileURLToPath(new URL(`./tests/minecraft/${file}`, import.meta.url));

export default defineConfig({
  resolve: {
    // These packages hold only type definitions; tests replace them with vi.mock.
    alias: {
      '@minecraft/server-ui': stub('script-api-ui-stub.ts'),
      '@minecraft/server': stub('script-api-stub.ts'),
    },
  },
});

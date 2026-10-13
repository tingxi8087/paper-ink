import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', include: ['packages/**/*.test.tsx', 'apps/website/src/**/*.test.tsx'], setupFiles: ['./tests/setup.ts'] } });

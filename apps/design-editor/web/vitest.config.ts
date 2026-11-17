import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the CRDT (clock, log, registers, document state). They are pure TypeScript, so
 * no DOM is involved; `vite.config.ts` stays untouched because the app build and the test run
 * have different needs (this file wins when Vitest is the one reading the config).
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts']
    }
});

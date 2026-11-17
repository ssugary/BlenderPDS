import { defineConfig } from 'vitest/config';

/**
 * Unit tests for the CRDT (clock, log, registers, document state) and for the framework
 * integration tests. They are pure TypeScript, so no DOM is involved; `vite.config.ts` stays
 * untouched because the app build and the test run have different needs (this file wins when
 * Vitest is the one reading the config).
 */
export default defineConfig({
    resolve: {
        alias: {
            '@collab3d/core': new URL('../../../framework/core/src/index.ts', import.meta.url).pathname
        }
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts']
    }
});

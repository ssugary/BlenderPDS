import { defineConfig } from 'vite';

/**
 * Library build: one ES bundle, with three.js (and anything else a host application owns)
 * left external. The declarations come from `tsc -p tsconfig.build.json`, which runs after
 * this in the package `build` script.
 */
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'Collab3DCore',
            fileName: () => 'collab3d-core.js',
            formats: ['es']
        },
        rollupOptions: {
            external: ['three', /^three\//]
        },
        sourcemap: true,
        emptyOutDir: true
    }
});

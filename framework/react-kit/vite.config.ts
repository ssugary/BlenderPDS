import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Only the kit's own code is bundled: React and the core stay with the host application. */
export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'Collab3DReactKit',
            fileName: () => 'collab3d-react-kit.js',
            formats: ['es']
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router-dom', '@collab3d/core']
        },
        sourcemap: true,
        emptyOutDir: true
    }
});

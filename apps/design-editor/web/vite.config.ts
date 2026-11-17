import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Spring Boot runs on 8080 by default. Override with BACKEND_URL when the API is elsewhere. */
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            // Source alias + workspace link: the editor always compiles the same core source the
            // core package builds on its own, so a change never needs a dist rebuild to show up.
            '@collab3d/core': new URL('../../../framework/core/src/index.ts', import.meta.url).pathname
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            // REST: the front always calls /api/... and the prefix is stripped here, so the
            // controller paths stay plain (/sessions, /users) on the backend and the browser
            // still sees a single origin — which is also what makes the session cookie work.
            '/api': {
                target: backendUrl,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // Signalling and collaboration socket. `ws: true` upgrades instead of proxying as HTTP.
            '/ws': {
                target: backendUrl,
                changeOrigin: true,
                ws: true
            }
        }
    }
});

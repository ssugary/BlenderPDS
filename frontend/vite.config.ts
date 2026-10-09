import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Spring Boot runs on 8080 by default. Override with BACKEND_URL when the API is elsewhere. */
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // REST: /api/** reaches Spring untouched, so the browser sees a single origin during dev.
            '/api': {
                target: backendUrl,
                changeOrigin: true
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

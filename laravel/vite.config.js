import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        {
            name: 'clean-hot-file',
            buildStart() {
                const hotFile = path.resolve(import.meta.dirname, 'public/hot');
                if (fs.existsSync(hotFile)) {
                    try {
                        fs.unlinkSync(hotFile);
                    } catch (_) {}
                }
            },
        },
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        emptyOutDir: true,
        manifest: 'manifest.json',
        sourcemap: false,
    },
});

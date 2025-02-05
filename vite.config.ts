import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path'

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        minify: false,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                nested: resolve(__dirname, 'src/photos.html'),
            }
        }
    },
    plugins: [
        tailwindcss(),
    ],
});

// vite.config.js
import 'dotenv/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            vue(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            },
        },
        test: {
            globals: true,
            environment: 'happy-dom',
            setupFiles: './tests/vitest.setup.ts',
        },
    }
})

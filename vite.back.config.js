// vite.config.js
import 'dotenv/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import markdownRawPlugin from 'vite-raw-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePluginRadar } from 'vite-plugin-radar'

export default defineConfig(({ mode }) => {
    return {
        plugins: [
            vue(),
            markdownRawPlugin({
                fileRegex: /\.md$/
            }),
            tsconfigPaths(),
            VitePluginRadar({
                analytics: {
                    id: 'G-MC3V0FB8RH',
                }
            })
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
        build: {
            rollupOptions: {
                output: {
                    entryFileNames: `assets/[name].js`,
                    chunkFileNames: `assets/[name].js`,
                    assetFileNames: `assets/[name].[ext]`,
                },
            },
        }
    }
})

import { defineNuxtConfig } from "nuxt/config";
import path from "path";

import 'dotenv/config'
import markdownRawPlugin from "vite-raw-plugin";
import VitePluginRadar from "vite-plugin-radar";

export default defineNuxtConfig({
    alias: {
        "@": 'src/'
    },
    dir: {
        pages: 'src/pages'
    },
    modules: [
        '@pinia/nuxt',
    ],
    plugins: [
        '~/plugins/app',
        { src: 'plugins/oruga.ts' }
    ],
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            },
        },
        plugins: [
            markdownRawPlugin({
                fileRegex: /\.md$/
            }),
            VitePluginRadar({
                analytics: {
                    id: 'G-MC3V0FB8RH',
                }
            })
        ],
        // test: {
        //     globals: true,
        //     environment: 'happy-dom',
        //     setupFiles: './tests/vitest.setup.ts',
        // },
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

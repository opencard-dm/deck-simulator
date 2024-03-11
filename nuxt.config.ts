import { defineNuxtConfig } from "nuxt/config";
import path from "path";

import 'dotenv/config'
import markdownRawPlugin from "vite-raw-plugin";
import VitePluginRadar from "vite-plugin-radar";

export default defineNuxtConfig({
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'DECK SIMULATOR | デュエマのデッキの一人回しができる！',
            link: [
              { rel: 'icon', href: '/favicon.svg' }
            ],
            htmlAttrs: {
              lang: 'ja',
            },
        },
    },
    alias: {
        "@": 'src/'
    },
    modules: [
        '@pinia/nuxt',
        // '@nuxtjs/eslint-module',
    ],
    plugins: [
        '~/plugins/app',
        { src: 'plugins/oruga.ts' }
    ],
    runtimeConfig: {
        public: {
            dev: process.env.NODE_ENV === 'development',
        },
    },
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
        }
    }
})

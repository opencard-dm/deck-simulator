import { defineNuxtConfig } from "nuxt/config";
import path from "path";

import 'dotenv/config'
import markdownRawPlugin from "vite-raw-plugin";

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
        "@": 'src/',
        "@@": "/<rootDir>",
    },
    modules: [
        '@pinia/nuxt',
        '@pinia-plugin-persistedstate/nuxt',
        '@nuxt/content',
        'nuxt-gtag',
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
    gtag: {
      id: 'G-MC3V0FB8RH'
    },
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@@': path.resolve(__dirname, '.')
            },
        },
        plugins: [
            markdownRawPlugin({
                fileRegex: /\.md$/
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

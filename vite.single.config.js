// vite.config.js
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import markdownRawPlugin from 'vite-raw-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteSingleFile } from "vite-plugin-singlefile"
import 'dotenv/config'

const imagePlugin = {
    enforce: 'post',
    apply: 'build',
    transform: (code, id) => {
      return {
        code: code.replace(/\/images\/(.*)\.(svg|png|jpg)/, './images/$1.$2'),
        map: null,
      }
    },
}

export default defineConfig(({ mode }) => {
    return {
        base: './',
        build: {
          outDir: 'dist-single',
        },
        plugins: [
            vue(),
            markdownRawPlugin({
                fileRegex: /\.md$/
            }),
            tsconfigPaths(),
            viteSingleFile(),
            // imagePlugin,
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

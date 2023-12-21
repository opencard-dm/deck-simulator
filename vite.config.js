// vite.config.js
import vue from '@vitejs/plugin-vue'
import path from 'path'
import markdownRawPlugin from 'vite-raw-plugin'

export default {
    plugins: [
        vue(),
        markdownRawPlugin({
            fileRegex: /\.md$/
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    }
}

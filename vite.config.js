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
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  }
}

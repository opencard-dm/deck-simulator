
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  devServer: {
    port: 8081,
    // https://rurukblog.com/post/vue-invalid-err/
    client: {
      // webSocketURL: `ws://0.0.0.0:${process.env.PORT}/ws`,
    },
    allowedHosts: 'all',
  },
  // options...
  "pages": {
    "index": {
      "entry": "src/main.js"
    }
  },
  "pluginOptions": {
    "express": {
      "shouldServeApp": true,
      "serverDir": "./srv"
    }
  }
}
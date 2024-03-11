module.exports = {
    root: true,
  
    env: {
      browser: true,
      node: true,
    },
  
    // https://zenn.dev/bs_kansai/articles/nuxt3-eslint-module
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/vue3-recommended",
    ],
    rules: {},
}

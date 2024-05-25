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
    // https://stackoverflow.com/a/66598327/20308611
    parser: "vue-eslint-parser",
    parserOptions: { 
      parser: "@typescript-eslint/parser" 
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "vue/multi-word-component-names": "off",
      "no-unused-vars": "off",
    },
}

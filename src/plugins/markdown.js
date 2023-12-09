import MarkdownIt from 'vue3-markdown-it'

export default {
  install: (app) => {
    app.component('MarkdownIt', MarkdownIt)
  }
}

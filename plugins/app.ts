import '../src/assets/scss/reset.css'
import '../src/assets/scss/layout.scss'
import { useAuthStore } from '../src/stores/auth'
import MarkdownIt from 'vue3-markdown-it'

export default defineNuxtPlugin(nuxtApp => {
    const vueApp = nuxtApp.vueApp

    const authStore = useAuthStore()
    authStore.listenAuthStateChange()

    vueApp.component('MarkdownIt', MarkdownIt)
})
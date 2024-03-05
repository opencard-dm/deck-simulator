import { createApp } from 'vue'
import App from './app.vue'

import './assets/scss/reset.css'
import './assets/scss/layout.scss'

const vueApp = createApp(App)

// vue router
import router from './router'
vueApp.use(router)

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
vueApp.use(pinia)

//
// useConfig
import useConfig from './plugins/useConfig'
vueApp.use(useConfig)

//
// axios
import axios from 'axios'

//
// oruga ui
import { useOruga } from './plugins/oruga'
useOruga(vueApp)

//
// global components
// import Dropdown from './components/dropdown/Dropdown'
import { ODropdown } from '@oruga-ui/oruga-next'
vueApp.component('Dropdown', ODropdown)

//
// markdown
import Markdown from './plugins/markdown'
vueApp.use(Markdown)

//
// マウント
vueApp.mount('#app')

import { createApp } from 'vue'
import App from './app.vue'

import './assets/scss/reset.css'
import './assets/scss/layout.scss'

const vueApp = createApp(App)

// vue router
import router from './router'
vueApp.use(router)

// vuex
import store from './store'
vueApp.use(store)

//
// useConfig
import useConfig from './plugins/useConfig'
vueApp.use(useConfig)

//
// socket io
import socket from './plugins/socket'
vueApp.use(socket)

//
// axios
import axios from 'axios'
if (process.env.VUE_APP_WS_HOST) {
  axios.defaults.baseURL = process.env.VUE_APP_WS_HOST
}

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

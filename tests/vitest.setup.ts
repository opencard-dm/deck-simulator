import { config, RouterLinkStub } from '@vue/test-utils'

// @ts-nocheck
import { createApp } from 'vue'
import App from '@/app.vue'

const vueApp = createApp(App)

//
// useConfig
import useConfig from '@/plugins/useConfig'
vueApp.use(useConfig)

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
vueApp.use(pinia)

// import ClientOnlyStub from './stub/ClientOnlyStub.vue'
// // Mock Router components
// config.global.stubs['router-link'] = RouterLinkStub
// config.global.stubs['client-noly'] = ClientOnlyStub
// config.global.stubs['dropdown'] = ClientOnlyStub
// config.global.stubs['o-icon'] = ClientOnlyStub

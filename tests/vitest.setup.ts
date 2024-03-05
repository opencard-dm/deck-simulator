import { config, RouterLinkStub } from '@vue/test-utils'

// @ts-nocheck
import { createApp } from 'vue'
import App from '@/app.vue'

const vueApp = createApp(App)

// vue router
import router from '@/router'
vueApp.use(router)

//
// useConfig
import useConfig from '@/plugins/useConfig'
vueApp.use(useConfig)

//
// oruga ui
import { useOruga } from '@/plugins/oruga'
useOruga(vueApp)

// import ClientOnlyStub from './stub/ClientOnlyStub.vue'
// // Mock Router components
// config.global.stubs['router-link'] = RouterLinkStub
// config.global.stubs['client-noly'] = ClientOnlyStub
// config.global.stubs['dropdown'] = ClientOnlyStub
// config.global.stubs['o-icon'] = ClientOnlyStub

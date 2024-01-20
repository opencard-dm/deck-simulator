import { createRouter, createWebHashHistory } from 'vue-router'
import index from '../pages/index.vue'
import room from '../pages/room.vue'
import single from '../pages/single.vue'
import about from '../pages/about.vue'
import battle from '../pages/battle.vue'
import adminTestScrapte from '../pages/admin/test-scrape.vue'
import adminTestFirebase from '../pages/admin/test-firebase.vue'
import { Features } from '@/features'

const routes = [
  { path: '', name: 'index', component: index },
  { path: '/room', name: 'room', component: room },
  { path: '/single', name: 'single', component: single },
  { path: '/about', name: 'about', component: about },
]
if (Features.battle) {
  routes.push({ path: '/battle', component: battle })
}
if (import.meta.env.NODE_ENV === 'development') {
  routes.push({ path: '/admin/test-scrape', component: adminTestScrapte })
  routes.push({ path: '/admin/test-firebase', component: adminTestFirebase })
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

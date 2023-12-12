import { createRouter, createWebHistory } from 'vue-router'
import index from '../pages/index.vue'
import room from '../pages/room.vue'
import builder from '../pages/builder.vue'
import single from '../pages/single.vue'
import about from '../pages/about.vue'
import adminTestScrapte from '../pages/admin/test-scrape.vue'
import adminTestFirebase from '../pages/admin/test-firebase.vue'

const routes = [
  { path: '', name: 'index', component: index },
  { path: '/room', name: 'room', component: room },
  // { path: '/builder', name: 'builder', component: builder },
  { path: '/single', name: 'single', component: single },
  { path: '/about', name: 'about', component: about },
]
if (process.env.NODE_ENV === 'development') {
  routes.push({ path: '/admin/test-scrape', component: adminTestScrapte })
  routes.push({ path: '/admin/test-firebase', component: adminTestFirebase })
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

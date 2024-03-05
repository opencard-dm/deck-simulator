import { createRouter, createWebHistory } from 'vue-router'
import index from '../pages/index.vue'
import room from '../pages/room.vue'
import single from '../pages/single.vue'
import about from '../pages/about.vue'
import battle from '../pages/battle.vue'
import decks_edit from '../pages/decks/edit.vue'
import logs from '../pages/logs.vue'
import adminTestScrapte from '../pages/admin/test-scrape.vue'
import { Features } from '@/features'

const routes = [
  { path: '', name: 'index', component: index },
  { path: '/room', name: 'room', component: room },
  { path: '/single', name: 'single', component: single },
  { path: '/about', name: 'about', component: about },
  { path: '/decks/edit', component: decks_edit },
  { path: '/logs/:log_id', component: logs },
]
if (Features.battle) {
  routes.push({ path: '/battle', component: battle })
}
if (import.meta.env.NODE_ENV === 'development') {
  routes.push({ path: '/admin/test-scrape', component: adminTestScrapte })
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

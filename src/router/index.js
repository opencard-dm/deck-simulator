import { createRouter, createWebHistory } from 'vue-router'
import index from '../pages/index.vue'
import login from '../pages/login.vue'
import room from '../pages/room.vue'
import single from '../pages/single.vue'
import about from '../pages/about.vue'
import battle from '../pages/battle.vue'
import adminTestScrapte from '../pages/admin/test-scrape.vue'
import adminTestFirebase from '../pages/admin/test-firebase.vue'
import { Features } from '@/features'
import { Firebase } from '@/helpers/firebase'
import { getAuth } from "firebase/auth";

const routes = [
  { path: '', name: 'index', component: index },
  { path: '/login', name: 'login', component: login },
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
  history: createWebHistory(),
  routes,
})

// ローカル以外ではアクセス制限
if (import.meta.env.PROD) {
  getAuth(Firebase.app).onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      router.push('/')
    } else {
      router.push('/login')
    }
  });
}

export default router

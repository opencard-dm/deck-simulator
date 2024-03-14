import { getAuth } from "firebase/auth"

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.server) {
    return
  }
  const auth = getAuth()
  console.log(auth)
  if (!auth.currentUser) {
    return abortNavigation()
  }
})

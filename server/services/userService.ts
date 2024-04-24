
import { FireStore } from '../firestore'

type User = {
  logIds: string[]
}

export async function getUser(userId: string) {
  const userDoc = await FireStore.db.doc(`/users/${userId}`).get()
  if (!userDoc.exists) {
    return null
  }
  return userDoc.data() as User
}

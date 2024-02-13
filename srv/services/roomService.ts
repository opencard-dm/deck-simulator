
import { GameHistory } from '@/entities/History'
import { FireStore } from '../server/firestore'

export async function createRoom(roomId: string, cookie: string) {
  const roomDoc = await FireStore.db.doc(`/envs/${FireStore.env}/rooms/${roomId}`).get()
  await FireStore.db.doc(`/envs/${FireStore.env}/rooms/${roomId}`).set({
    histories: [],
    cookie,
    ttl: FireStore.Timestamp.fromMillis(Date.now() + (1 * 60 * 60 * 1000)),
  })
  return roomDoc
}

export async function deleteRoom(roomId: string) {
  await FireStore.db.doc(`/envs/${FireStore.env}/rooms/${roomId}`).set({
    histories: [],
    ttl: FireStore.Timestamp.fromMillis(Date.now() + (1 * 60 * 60 * 1000)),
  }, { merge: true })
}

export async function createLog(name: string, histories: GameHistory[]) {
  const doc = await FireStore.db.collection('logs').add({
    name,
    histories,
  })
  return doc
}

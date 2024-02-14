
import { GameHistory } from '@/entities/History'
import { FireStore } from '../server/firestore'
import { SourceDeck } from '@/entities/Deck'
import { FieldPath } from 'firebase-admin/firestore'

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

export async function createLog(name: string, deck: SourceDeck, histories: GameHistory[]) {
  const doc = await FireStore.db.collection('logs').add({
    name,
    deck,
    histories,
    createdAt: (new Date()).toISOString()
  })
  return doc
}

export async function getLog(logId: string) {
  const logDoc = await FireStore.db.doc(`/logs/${logId}`).get()
  return logDoc
}

export async function getCardsByIds(ids: string[]) {
  // https://stackoverflow.com/a/48423626/20308611
  const cardDocs = await FireStore.db.collection('cards')
    .where(FieldPath.documentId(), 'in', ids)
    .get()
  // https://firebase.google.com/docs/firestore/query-data/get-data?hl=ja&_gl=1*53bh8s*_up*MQ..*_ga*NzkzOTgzNDg5LjE3MDc4MjIwNzU.*_ga_CW55HF8NVT*MTcwNzgyMjA3NS4xLjAuMTcwNzgyMjA3NS4wLjAuMA..#get_multiple_documents_from_a_collection
  return cardDocs
}

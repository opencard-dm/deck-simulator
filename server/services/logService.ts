
import { GameHistory } from '@/entities/History'
import { FireStore } from '../firestore'
import { SourceDeck } from '@/entities/Deck'
import { FieldPath, FieldValue } from 'firebase-admin/firestore'

export async function createLog(
  name: string,
  deck: SourceDeck,
  histories: GameHistory[],
  userId: string
) {
  const doc = await FireStore.db.collection('logs').add({
    name,
    deck,
    histories,
    userId,
    createdAt: (new Date()).toISOString()
  })
  await FireStore.db.doc(`users/${userId}`).update({
    logIds: FieldValue.arrayUnion(doc.id)
  })
  return doc
}

export async function getLog(logId: string) {
  const logDoc = await FireStore.db.doc(`/logs/${logId}`).get()
  return logDoc
}

export async function getLogs(userId: string) {
  const logIds = (await FireStore.db.doc(`/users/${userId}`).get()).get('logIds')
  if (!logIds) {
    return []
  }
  const logDocs = await FireStore.db.collection('logs')
    .where(FieldPath.documentId(), 'in', logIds)
    .get()
  const logs = []
  logDocs.forEach((doc) => {
    logs.push({
      id: doc.id,
      ...doc.data(),
    })
  })
  return logs
}

export async function deleteLog(logId: string) {
  await FireStore.db.doc(`/logs/${logId}`).delete()
}

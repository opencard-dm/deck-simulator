
import { GameHistory } from '@/entities/History'
import { FireStore } from '../firestore'
import { SourceDeck } from '@/entities/Deck'
import { FieldPath, FieldValue } from 'firebase-admin/firestore'

export async function createLog(
  name: string,
  deck: SourceDeck,
  histories: GameHistory[],
  userId: string,
  options: {
    deckb: SourceDeck | null
  }
) {
  const logData = {
    name,
    deck,
    histories,
    userId,
    createdAt: (new Date()).toISOString()
  }
  if (options.deckb) {
    logData.deckb = options.deckb
  }
  const doc = await FireStore.db.collection('logs').add(logData)
  await FireStore.db.doc(`users/${userId}`).set({
    logIds: FieldValue.arrayUnion(doc.id)
  }, {
    merge: true
  })
  return doc
}

export async function getLog(logId: string) {
  const logDoc = await FireStore.db.doc(`/logs/${logId}`).get()
  if (!logDoc.exists) {
    return null
  }
  return logDoc.data()
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
  const logDoc = await FireStore.db.doc(`/logs/${logId}`).get()
  const userId = logDoc.get('userId')
  await FireStore.db.doc(`users/${userId}`).update({
    logIds: FieldValue.arrayRemove(logId)
  })
  await FireStore.db.doc(`/logs/${logId}`).delete()
}

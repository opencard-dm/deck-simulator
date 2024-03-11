import { Router } from 'express'
import { deckList } from '../../src/helpers/data.js'
import sampleDeckList from '../../src/helpers/data-sample.js'
import { RoomData } from './roomData.js'
import { FireStore } from './firestore.js'
import { Deck } from '../../src/helpers/Deck'
import { getDeckData } from '../gm-deck-maker/index.js'
import { createLog, createRoom, deleteRoom, getCardsByIds, getLog } from '../services/roomService'
import axios from 'axios'

const router = Router()

router.get('/api/rooms/:roomId', async function (req, res) {
  const roomId = req.params.roomId
  if (!roomId) {
    return res.json({})
  }
  // const room = (await RoomData.getRoomCache(roomId)) || {}
  let room = {}
  const roomDoc = await FireStore.db.doc(`/envs/${FireStore.env}/rooms/${roomId}`).get()
  if (roomDoc.exists) {
    room = roomDoc.data()
  } else {
    const cookie = req.body.cookie || ''
    await createRoom(roomId, cookie)
  }
  res.json(room)
})

router.put('/api/rooms/:roomId', async function (req, res) {
  const roomId = req.params.roomId
  if (!roomId) {
    return res.json({})
  }
  const cookie = req.body.cookie || ''
  await createRoom(roomId, cookie)
  res.json({})
})

router.delete('/api/rooms/:roomId', async function (req, res) {
  const roomId = req.params.roomId
  await deleteRoom(roomId)
  res.json({})
})


router.get('/api/decks', async function (req, res) {
  return res.json(deckList)
  // return res.json(sampleDeckList)
})

export {
  router as apiRouter,
}

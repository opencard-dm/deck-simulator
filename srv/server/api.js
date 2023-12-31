import { Router } from 'express'
import { deckList } from '../../src/helpers/data.js'
import sampleDeckList from '../../src/helpers/data-sample.js'
import { RoomData } from './roomData.js'
import { FireStore } from './firestore.js'
import { Deck } from '../../src/helpers/Deck'
import { getDeckData } from '../gm-deck-maker/index.js'
import { createRoom, deleteRoom } from '../services/roomService'
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

router.get('/api/cards', async (req, res) => {
  const apiRes = await axios.get(`https://d23r8jlqp3e2gc.cloudfront.net/api/v1/dm/cards?main-card-ids=${req.query.cardIds}`)
  if (apiRes.data) {
    const map = {}
    apiRes.data.forEach(c => {
      map[c.main_card_id] = c
    })
    return res.json(map)
  }
  return res.json({})
})

router.get('/api/scrape', async (req, res) => {
  const deckData = await getDeckData(req.query.deckId)
  if (!deckData) {
    return res.sendStatus(404);
    // throw new Error('failed_fetch_data');
  }
  //
  // 取得したデータを処理する。
  const deck = Deck.convertGmFormat(deckData)
  // レスポンス
  res.json(deck)
})

export {
  router as apiRouter,
}

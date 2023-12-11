import { Router } from 'express'
import { deckList } from '../../src/helpers/data.js'
import sampleDeckList from '../../src/helpers/data-sample.js'
import { RoomData } from './roomData.js'
import { FireStore } from './firestore.js'
import { Deck } from '../../src/helpers/Deck.js'
import { getDeckData } from '../../src/gm-deck-maker'

const router = Router()

router.get('/api/rooms/:roomId', async function (req, res) {
  const roomId = req.params.roomId
  if (!roomId) {
    return res.json({})
  }
  const room = (await RoomData.getRoomCache(roomId)) || {}
  const roomDoc = await FireStore.db.doc(`/envs/${FireStore.env}/rooms/${roomId}`).get()
  if (roomDoc.exists) {
    room.cookie = roomDoc.get('cookie')
  }
  res.json(room)
})

import axios from 'axios'
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
  const deck = {
    name: deckData.name,
    dmDeckId: deckData.dm_deck_id,
  }
  deck.cards = Deck.groupByCardId(deckData.main_cards.map((c) => {
    return {
      imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
      mainCardId: c.main_card_id,
    }
  }))
  deck.chojigenCards = Deck.groupByCardId(deckData.hyper_spatial_cards.map((c) => {
    return {
      imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
      mainCardId: c.main_card_id,
    }
  }))
  deck.grCards = Deck.groupByCardId(deckData.gr_cards.map((c) => {
    return {
      imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
      mainCardId: c.main_card_id,
    }
  }))
  // レスポンス
  res.json(deck)
})

export {
  router as apiRouter,
}

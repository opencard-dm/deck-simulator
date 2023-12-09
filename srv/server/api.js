import { Router } from 'express'
import { deckList } from '../../src/helpers/data.js'
import sampleDeckList from '../../src/helpers/data-sample.js'
import { useConfig } from '../../src/plugins/useConfig.js'
import { RoomData } from './roomData.js'

const router = Router()

router.get('/api/rooms/:roomId', async function (req, res) {
  if (!req.params.roomId) {
    return res.json({})
  }
  const room = (await RoomData.getRoomCache(req.params.roomId)) || {}
  res.json(room)
})

import axios from 'axios'
router.get('/api/decks', async function (req, res) {
  // サンプルモードの場合は、サンプルのデッキのみを返す。
  if (true) {
    return res.json(deckList)
    // return res.json(sampleDeckList)
  }
  let response
  try {
    response = await axios.get(process.env.DECK_URL)
    res.json([...deckList, ...response.data])
  } catch (error) {
    // ex: Request failed with status code 404
    console.log(error.message)
    res.json(deckList)
  }
})

import { Deck } from '../../src/helpers/Deck.js'
import { getPage } from './helpers.js'

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
  const page = await getPage();
  const pageRes = await page.goto(req.query.url);
  //
  if (![200].includes(pageRes.status())) {
    // throw new Error('invalid_url');
    return res.sendStatus(404);
  }
  await page.waitForFunction(() => {
    return typeof getCategoryId !== 'undefined'
  })
  const deckData = await page.evaluate(async () => {
    // カテゴリーIDを取得
    const categoryId = getCategoryId(`dm`)
    // デッキIDを取得
    const params = new URLSearchParams(window.location.search)
    const deckId = params.get('tcgrevo_deck_maker_deck_id')
    // デッキ詳細のモデルを初期化
    const deckRecipeInfo = new DeckRecipeInfo(categoryId, deckId, `https://storage.googleapis.com/ka-nabell-card-images/img/s/card/card100244663_1.jpg`)
    try {
      await deckRecipeInfo.updateDeckDetail()
      await deckRecipeInfo.loadComplete()
    } catch (err) {
      // pass
      // データ取得は正しくできても$ in not definedというエラーが起こっており、スルーすべき。
    }
    return deckRecipeInfo.deckCardData
  })
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
  page.context().close()
  // レスポンス
  res.json(deck)
})

export {
  router as apiRouter,
}

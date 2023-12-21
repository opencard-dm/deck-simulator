// node test/server/scraping.js

const chromium = require('playwright-chromium').chromium

// const url = 'https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=eb1afe80-4be0-4c7c-b004-5df9c21aed6e'
const url = 'https://gachi-matome.com/deckrecipe-detail-dm/?tcgrevo_deck_maker_deck_id=eb1afe80-4be0-4c7c-b004-5df9c21aed'

const groupByCardId = (cards) => {
  return cards.reduce((result, current) => {
    const element = result.find((p) => p.imageUrl === current.imageUrl);
    if (element) {
      element.time++;
    } else {
      result.push({
        ...current,
        time: 1,
      });
    }
    return result;
  }, []);
}

const main = async () => {

  const browser = await chromium.launch();
  // ページ遷移
  const page = await browser.newPage();
  const pageRes = await page.goto(url);
  if (![200].includes(pageRes.status())) {
    throw new Error('invalid_url');
    //
  }

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
      //
    }
    return deckRecipeInfo.deckCardData
  })
  if (!deckData) {
    throw new Error('failed_fetch_data');
    // デッキデータ取得に失敗した場合の処理。
  }
  // console.log(deckData)

  const deck = {
    name: deckData.name,
    dmDeckId: deckData.dm_deck_id,
  }
  deck.chojigenCards = deckData.hyper_spatial_cards
  deck.cards = groupByCardId(deckData.main_cards.map((c) => {
    return {
      imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
      mainCardId: c.main_card_id,
    }
  }))
  deck.chojigenCards = groupByCardId(deckData.hyper_spatial_cards.map((c) => {
    return {
      imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
      mainCardId: c.main_card_id,
    }
  }))
  console.log(deck)
  await browser.close();
}
main()

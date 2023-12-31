import { DeckRecipeInfo } from "./DeckRecipeInfo.js";
import { deckList } from '../../src/helpers/data.js'
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export async function getDeckData(deckId) {
  // 開発環境では通信の節約
  if (process.env.NODE_ENV === 'development') {
    for (const deck of deckList) {
      if (deck.deck_id === deckId) {
        console.log('deck is found in local')
        return deck
      }
    }
  }

  const APP_NAME = 'gm'
  const firebaseConfig = JSON.parse(atob(process.env.DM_KEY));
  const app = firebase.initializeApp(firebaseConfig, APP_NAME)
  const db = firebase.firestore(app)

  // https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
  const defalutCardUrl =
    "https://storage.googleapis.com/ka-nabell-card-images/img/s/card/card100244663_1.jpg";
  // 2: 'dm'
  const deckRecipeInfo = new DeckRecipeInfo(
    2,
    deckId,
    defalutCardUrl,
    db
  );

  await deckRecipeInfo.updateDeckDetail();
  firebase.app(APP_NAME).delete(); // これを書かない場合、実行の終了に時間がかかった
  return deckRecipeInfo.deckCardData;
}

/**
 * 2023/12/10 まではplaywrightのpage.evaluate利用して、スクレイピングのようにデータを取得していた。
 * しかし時間がかかるため、firebaseを直接呼び出す方法に切り替えた。
 *
 * @returns
 */
async function getDeckDataOld() {
  // カテゴリーIDを取得
  const categoryId = getCategoryId(`dm`);
  // デッキIDを取得
  const params = new URLSearchParams(window.location.search);
  const deckId = params.get("tcgrevo_deck_maker_deck_id");
  // デッキ詳細のモデルを初期化
  const deckRecipeInfo = new DeckRecipeInfo(
    categoryId,
    deckId,
    `https://storage.googleapis.com/ka-nabell-card-images/img/s/card/card100244663_1.jpg`
  );
  try {
    await deckRecipeInfo.updateDeckDetail();
    await deckRecipeInfo.loadComplete();
  } catch (err) {
    // pass
    // データ取得は正しくできても$ in not definedというエラーが起こっており、スルーすべき。
  }
  return deckRecipeInfo.deckCardData;
}

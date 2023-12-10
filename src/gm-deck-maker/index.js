import firebase from "firebase/app";
// import firebase from 'firebase/app';
import { DeckRecipeInfo } from "./DeckRecipeInfo.js";

export async function getDeckData(deckId) {
  // https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
  const firebaseConfig = {
    apiKey: "AIzaSyCKhH2S_r29U5olfQC6AsXaaHNhqmJMR40",
    authDomain: "prod-deckmaker-8345f.firebaseapp.com",
    databaseURL: "https://prod-deckmaker-8345f.firebaseio.com",
    projectId: "prod-deckmaker-8345f",
    storageBucket: "prod-deckmaker-8345f.appspot.com",
    messagingSenderId: "326486201589",
    appId: "1:326486201589:web:c72eb695996dea77",
  };
  const defalutCardUrl =
    "https://storage.googleapis.com/ka-nabell-card-images/img/s/card/card100244663_1.jpg";
  // 2: 'dm'
  const deckRecipeInfo = new DeckRecipeInfo(
    2,
    deckId,
    defalutCardUrl,
    firebaseConfig
  );

  await deckRecipeInfo.updateDeckDetail();
  firebase.app().delete(); // これを書かない場合、実行の終了に時間がかかった
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

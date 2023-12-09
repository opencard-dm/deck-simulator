const START_ID_A = 1;
const START_ID_B = 101;

import { useConfig } from '../plugins/useConfig.js'
import axios from 'axios';

export class Deck {
  /**
   *
   * @param {Array} cards
   * @returns {Object}
   */
  static async fetchCardsData(cards) {
    // nodejsサーバー側で使用する。
    const mainCardIds = [...new Set(cards.map((c) => c.mainCardId))].filter(id => !!id)
    if (mainCardIds.length === 0) {
      return {}
    }
    const res = await axios.get(`${useConfig().API_HOST}/api/cards?cardIds=${mainCardIds.join(',')}`)
    return res.data
  }

  /**
   * ゲーム内で一意になるようなカードIDをカードに付与する
   * @param {Object} deck
   * @param {Boolean} playerA
   * @returns
   */
  static async prepareDeckForGame(deck, playerA = false) {
    const mainCards = [];
    const chojigenCards = [];
    const startId = playerA ? START_ID_A : START_ID_B;
    const imageHost = useConfig().IMAGE_HOST;
    let count = startId;
    deck.cards.forEach(c => {
      // デッキメーカーから取り込んだデータにはtimeがないことによる対応。
      const times = c.time || 1
      for (let i = 0; i < times; i++) {
        mainCards.push({
          ...c,
          imageUrl: c.imageUrl || `${imageHost}/${c.imageId}`,
          backImageUrl: c.backImageUrl || '/images/card-back.jpg',
          mainCardId: c.mainCardId,
        });
      }
    })
    deck.cards = Deck.shuffle(mainCards).map(c => {
      return {
        ...c,
        id: count++,
      }
    })
    //
    // 超次元ゾーン
    if (deck.chojigenCards && deck.chojigenCards.length > 0) {
      deck.chojigenCards.forEach(c => {
        const times = c.time || 1
        for (let i = 0; i < times; i++) {
          chojigenCards.push({
            ...c,
            imageUrl: c.imageUrl || `${imageHost}/${c.imageId}`,
            backImageUrl: c.backImageUrl || '/images/card-back.jpg',
            mainCardId: c.mainCardId,
          });
        }
      })
      // 超次元のカードはシャッフル不要
      deck.chojigenCards = chojigenCards.map(c => {
        return {
          ...c,
          id: count++,
          isChojigen: true,
        }
      })
      deck.hasChojigen = true
    } else {
      deck.chojigenCards = chojigenCards;
    }
    //
    // カードにテキストを追加
    const cardMap = await Deck.fetchCardsData([
      ...deck.cards,
      ...deck.chojigenCards,
    ]);
    deck.cards.forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(cardMap, c.mainCardId)) {
        c.text = c.text || cardMap[c.mainCardId].card_text;
      }
    });
    deck.chojigenCards.forEach((c) => {
      if (Object.prototype.hasOwnProperty.call(cardMap, c.mainCardId)) {
        c.text = c.text || cardMap[c.mainCardId].card_text;
      }
    });
    console.log("card data", cardMap);
    return deck
  }

  static formatData(deckD) {
    const deck = Object.assign({}, deckD);
    const imageHost = useConfig().IMAGE_HOST

    deck.cards.forEach(c => {
      // c.time = c.time || 1;
      c.imageUrl = c.imageUrl || `${imageHost}/${c.imageId}`;
    })
    // timeのないデータだった場合、集計する。
    if (!deck.cards[0].time && deck.cards[0].time !== 0) {
      deck.cards = deck.cards.reduce((result, current) => {
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
    // 並べ替える
    deck.cards.sort((a, b) => {
      return b.time - a.time;
    })
    return deck;
  }

  static shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var r = Math.floor(Math.random() * (i + 1));
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }

  static groupByCardId(cards) {
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
}

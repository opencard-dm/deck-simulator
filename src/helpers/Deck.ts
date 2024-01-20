const START_ID_A = 1;
const START_ID_B = 101;

import { useConfig } from '../plugins/useConfig.js'
import axios from 'axios';
import { Deck as DeckType, GmDeckData } from '@/entities/Deck';
import decks from '../decks.json' assert { type: "json" }
import { useStore } from 'vuex';

export class Deck {

  static getFromId(id: string) {
    const localDeck = decks.find(d => d.dmDeckId === id) as DeckType|undefined
    if (localDeck) return localDeck
    const store = useStore()
    if (id.includes('-')) {
      const [decksSourceIndex, ...deckNameElems] = id.split('-')
      const deckName = deckNameElems.join('-')
      const userDeck = store.state.decks.data[decksSourceIndex].decks
        .find(d => d.name === deckName) as DeckType|undefined
      if (userDeck) return userDeck
    }
    return null
  }

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
    const res = await axios.get(`/api/cards?cardIds=${mainCardIds.join(',')}`)
    return res.data
  }

  /**
   * ゲーム内で一意になるようなカードIDをカードに付与する
   * @param {Object} deck
   * @param {Boolean} playerA
   * @returns
   */
  static async prepareDeckForGame(deck, playerA = false, withoutApi = false): Promise<DeckType> {
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
          backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
          mainCardId: c.mainCardId || '',
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
            backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
            mainCardId: c.mainCardId,
            isChojigen: true,
          });
        }
      });
      // 超次元のカードはシャッフル不要
      deck.chojigenCards = chojigenCards.map(c => {
        return {
          ...c,
          id: count++,
        }
      })
      deck.hasChojigen = true
    } else {
      deck.chojigenCards = chojigenCards;
    }
    // grゾーン
    if (deck.grCards && deck.grCards.length > 0) {
      deck.grCards.forEach(c => {
        const times = c.time || 1
        for (let i = 0; i < times; i++) {
          deck.chojigenCards.push({
            ...c,
            imageUrl: c.imageUrl || `${imageHost}/${c.imageId}`,
            backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
            mainCardId: c.mainCardId,
            isGr: true,
          });
        }
      })
    }
    if (withoutApi === false) {
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
          if (cardMap[c.mainCardId].image_paths 
            && cardMap[c.mainCardId].image_paths.length >= 2) {
            c.backImageUrl = `https://storage.googleapis.com/ka-nabell-card-images/img/card/${cardMap[c.mainCardId].image_paths[1]}`
          }
        }
      });
    }
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

  public static convertGmFormat(deckData: GmDeckData) {
    const deck: DeckType = {
      name: deckData.name,
      dmDeckId: deckData.dm_deck_id,
      cards: Deck.groupByCardId(deckData.main_cards.map((c) => {
        return {
          imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
          mainCardId: c.main_card_id,
        }
      })),
      chojigenCards: Deck.groupByCardId((deckData.hyper_spatial_cards || []).map((c) => {
        return {
          imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
          mainCardId: c.main_card_id,
        }
      })),
      grCards: Deck.groupByCardId((deckData.gr_cards || []).map((c) => {
        return {
          imageUrl: `https://storage.googleapis.com/ka-nabell-card-images/img/card/${c.large_image_url}`,
          mainCardId: c.main_card_id,
        }
      }))
    }
    return deck
  }
}

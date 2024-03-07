const START_ID_A = 1;
const START_ID_B = 101;

import { useConfig } from '../plugins/useConfig.js'
import axios from 'axios';
import { Deck as DeckType, GmDeckData, SourceCard, SourceDeck } from '@/entities/Deck';
import decks from '../decks.json' assert { type: "json" }
import { Card } from '@/entities/Card';
import { useDecksStore } from '../stores/decks';
import { useRoomStore } from '@/stores/room';

export class Deck {

  static getFromId(id: string): SourceDeck {
    const localDeck = decks.find(d => d.dmDeckId === id || d.name === id) as DeckType|undefined
    if (localDeck) return localDeck
    const decksStore = useDecksStore()
    // ユーザがGoogleスプレッドシートで作ったデッキの場合
    if (id.includes('-')) {
      const [decksSourceIndex, ...deckNameElems] = id.split('-')
      const deckName = deckNameElems.join('-')
      const userDeck = decksStore.data[parseInt(decksSourceIndex)].decks
        .find(d => d.name === deckName) as SourceDeck|undefined
      // fix: デッキのカードが増殖するバグの応急処置
      if (userDeck) {
        const copiedDeck: SourceDeck = JSON.parse(JSON.stringify(userDeck))
        const cardDetails: {[key:string]: any} = {}
        let cardDetailCount = 0
        copiedDeck.cards.forEach(c => {
          cardDetailCount += 1
          c.cd = String(cardDetailCount)
          cardDetails[c.cd] = c
        })
        copiedDeck.chojigenCards.forEach(c => {
          cardDetailCount += 1
          c.cd = String(cardDetailCount)
          cardDetails[c.cd] = c
        })
        copiedDeck.grCards.forEach(c => {
          cardDetailCount += 1
          c.cd = String(cardDetailCount)
          cardDetails[c.cd] = c
        })
        copiedDeck.cardDetails = cardDetails
        return copiedDeck  
      }
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
  static async prepareDeckForGame(deck: SourceDeck, playerA = false, withoutApi = false): Promise<DeckType> {
    const mainCards = [];
    const chojigenCards = [];
    const startId = playerA ? START_ID_A : START_ID_B;
    const imageHost = useConfig().IMAGE_HOST;
    let count = startId;
    deck.cards.forEach(c => {
      // デッキメーカーから取り込んだデータにはtimeがないことによる対応。
      const times = c.times || 1
      delete c.times
      for (let i = 0; i < times; i++) {
        const card: Card = {
          ...c,
          imageUrl: '',
          backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
        }
        if (!card.cd) {
          card.cd = card.name
        } else {
          // v1.9.0以降はcdがairtableのid
          delete card.mainCardId
          delete card.name
          delete card.imageUrl
          delete card.backImageUrl
        }
        if (c.imageUrl || c.imageId) {
          card.imageUrl = c.imageUrl || `${imageHost}/${c.imageId}`
        }
        mainCards.push(card);
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
        const times = c.times || 1
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
        const times = c.times || 1
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

  static formatData(deckD: SourceDeck) {
    const deck = Object.assign({}, deckD);
    const imageHost = useConfig().IMAGE_HOST

    deck.cards.forEach(c => {
      if (c.imageUrl || c.imageId) {
        c.imageUrl = c.imageUrl || `${imageHost}/${c.imageId}`;
      }
      if (!c.cd) {
        if (c.name) {
          c.cd = c.name
        }
      }
    })
    // timeのないデータだった場合、集計する。
    if (!deck.cards[0].times && deck.cards[0].times !== 0) {
      deck.cards = deck.cards.reduce((result, current) => {
        const element = result.find((p) => p.imageUrl === current.imageUrl);
        if (element) {
          element.times++;
        } else {
          result.push({
            ...current,
            times: 1,
          });
        }
        return result;
      }, []);
    }
    // 並べ替える
    deck.cards.sort((a, b) => {
      return b.times - a.times;
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
        element.times++;
      } else {
        result.push({
          ...current,
          times: 1,
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

export async function fetchDeck(deckId: string, store: ReturnType<typeof useRoomStore>) {
  const localDeck = Deck.getFromId(deckId)
  if (localDeck) {
    if (localDeck.cardDetails) {
      store.addCardDetails(localDeck.cardDetails)
    }
    if (localDeck.source === 'airtable') {
      const cardIds: string[] = []
      localDeck.cards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      localDeck.chojigenCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      localDeck.grCards.forEach(c => cardIds.includes(c.cd) || cardIds.push(c.cd))
      const { data: cards } = await axios.get('/api/cards', {
        params: {
          cardIds: cardIds.join(',')
        }
      })
      store.addCardDetails(cards)
    }
    return localDeck;
  }
  throw Error('デッキの取得に失敗しました. deckId=' + deckId)
}

export async function fetchCardDetails(deck: SourceDeck, store: ReturnType<typeof useRoomStore>) {
  const cards: SourceCard[] = []
  deck.cards.forEach(c => {
    cards.push(c)
  })
  deck.chojigenCards.forEach(c => {
    cards.push(c)
  })
  deck.grCards.forEach(c => {
    cards.push(c)
  })
  const cardIds = cards.map(c => c.cd)
  const res = await axios.get(`/api/cards?cardIds=${cardIds.join(',')}`)
  store.addCardDetails(res.data)
}
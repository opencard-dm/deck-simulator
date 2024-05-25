const START_ID_A = 1;
const START_ID_B = 101;

import { useConfig } from '../plugins/useConfig.js'
import axios from 'axios';
import { Deck as DeckType, GmDeckData, SourceCard, SourceDeck } from '@@/core/entities/Deck';
import decks from '../decks.json' assert { type: "json" }
import { Card } from '@@/core/entities/card';
import { useDecksStore } from '../stores/decks';
import { useRoomStore } from '@/stores/room';
import { getUserDeck } from '@/components/builder/decks.js';
import { fetchCardDetails } from '@@/core/services/card.service.js';

export class Deck {

  static async getFromId(id: string): Promise<SourceDeck|null> {
    const localDeck = decks.find(d => d.dmDeckId === id || d.name === id) as DeckType|undefined
    if (localDeck) return JSON.parse(JSON.stringify(localDeck))
    const decksStore = useDecksStore()
    // firebaseのデッキの場合
    if (id.startsWith('firebase-')) {
      const firebaseId = id.split('-', 2)[1]
      return await getUserDeck(firebaseId)
    }
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
    const mainCards: Card[] = [];
    const chojigenCards: Card[] = [];
    const startId = playerA ? START_ID_A : START_ID_B;
    const copiedDeck: DeckType = JSON.parse(JSON.stringify(deck))
    let count = startId;
    copiedDeck.cards.forEach(c => {
      const times = c.times
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
        mainCards.push(card);
      }
    })
    copiedDeck.cards = Deck.shuffle(mainCards).map(c => {
      return {
        ...c,
        id: count++,
      }
    })
    //
    // 超次元ゾーン
    if (copiedDeck.chojigenCards && copiedDeck.chojigenCards.length > 0) {
      copiedDeck.chojigenCards.forEach(c => {
        const times = c.times || 1
        for (let i = 0; i < times; i++) {
          chojigenCards.push({
            ...c,
            backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
            isChojigen: true,
          });
        }
      });
      // 超次元のカードはシャッフル不要
      copiedDeck.chojigenCards = chojigenCards.map(c => {
        return {
          ...c,
          id: count++,
        }
      })
      copiedDeck.hasChojigen = true
    }
    // grゾーン
    if (copiedDeck.grCards && copiedDeck.grCards.length > 0) {
      copiedDeck.grCards.forEach(c => {
        const times = c.times || 1
        for (let i = 0; i < times; i++) {
          deck.chojigenCards.push({
            ...c,
            backImageUrl: c.backImageUrl || 'https://cdn.jsdelivr.net/npm/dmdeck-simulator@latest/dist/images/card-back.jpg',
            mainCardId: c.mainCardId,
            isGr: true,
          });
        }
      })
    }
    return copiedDeck
  }

  static formatData(deckD: SourceDeck) {
    const deck = Object.assign({}, deckD);

    deck.cards.forEach(c => {
      if (!c.cd) {
        if (c.name) {
          c.cd = c.name
        }
      }
    })
    // 並べ替える
    deck.cards.sort((a, b) => {
      return b.times - a.times;
    })
    return deck;
  }

  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = array[i];
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
  const localDeck = await Deck.getFromId(deckId)
  if (localDeck) {
    if (localDeck.source === 'builtin' || localDeck.source === 'firebase') {
      store.addCardDetails(await fetchCardDetails(localDeck))
      return localDeck
    }
    if (localDeck.source.startsWith('https://docs.google.com')) {
      const cardDetails: any = {}
      localDeck.cards.forEach(c => {
        c.cd = c.imageUrl as string
        cardDetails[c.cd] = {
          ...c,
          name: '',
        }
      })
      localDeck.chojigenCards.forEach(c => {
        c.cd = c.imageUrl as string
        cardDetails[c.cd] = {
          ...c,
          name: '',
        }
      })
      localDeck.grCards.forEach(c => {
        c.cd = c.imageUrl as string
        cardDetails[c.cd] = {
          ...c,
          name: '',
        }
      })
      store.addCardDetails(cardDetails)
    }
    return localDeck;
  }
  throw Error('デッキの取得に失敗しました. deckId=' + deckId)
}

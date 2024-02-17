import { zone, player, cardState, groupableZone, playerCards } from "@/entities";
import { Util } from "./Util";
import { Card, CardGroup } from "@/entities/Card";
import { Deck } from "@/entities/Deck";
import { GameLogger } from "./GameLogger";
import { RoomConfig, initialData } from "./room";

export interface moveCardsParams {
  from: zone
  to: zone
  cards: readonly Card[]
  player: player
  prepend?: boolean
  index?: number
}

export interface changeCardsStateParams {
  from: zone,
  cards: Card[],
  player: player,
  cardState?: cardState,
}

export interface groupCardParams {
  from: zone,
  to: groupableZone,
  fromCard: Card,
  toCard: Card,
  player: player,
}

function getCardGroup(cards: Card[], groupId: string): CardGroup {
  return {
    cards: cards.filter(c => c.groupId === groupId),
    id: groupId,
  }
}

export class CardActions {

  private gameLogger?: GameLogger
  /**
   * @param players reactive
   */
  constructor(
    public roomId: string,
    public players: ReturnType<typeof initialData>['players']
  ) {}

  setGameLogger(gameLogger: GameLogger) {
    this.gameLogger = gameLogger
  }

  static setupForPlayer(deck: Deck): playerCards {
    return {
      manaCards: [],
      battleCards: [],
      bochiCards: [],
      shieldCards: deck.cards.slice(0, 5).map(c => {
        c.faceDown = true
        return c
      }),
      tefudaCards: deck.cards.slice(5, 10),
      yamafudaCards: deck.cards.slice(10).map(c => {
        c.faceDown = true
        return c
      }),
      chojigenCards: deck.chojigenCards,
    }
  }

  moveCards({ from, to, cards, player, prepend, index }: moveCardsParams) {
    if (!cards || cards.length === 0) return;
    // カードにインデックスを付与する
    this.players[player].cards[from].forEach((card, index) => {
      card.index = index
    })
    const card = cards[0];
    if (card.groupId && cards.length === 1) {
      // 先頭のカードがグループに属していた場合、そのグループから抜ける。
      // NOTE: グループの中で一番最後のカードがベースとなる
      const toCard = this.players[player].cards[from].filter(c => c.groupId === card.groupId
        && c.id !== card.id).slice(-1)[0]
      const fromCard = {
        ...card,
        groupId: null,
        index: prepend ? 0 : this.players[player].cards[to].length,
      }
      this.gameLogger?.undoGroupCard({
        from: to as groupableZone,
        to: from as groupableZone,
        fromCard,
        toCard,
        player,
      })
      if (!RoomConfig.useFirebase) {
        this.undoGroupCard({
          from: to as groupableZone,
          to: from as groupableZone,
          fromCard,
          toCard,
          player,
        });
      }
      return
    }
    this.gameLogger?.moveCards({ from, to, cards: cards, player, prepend, index })
    if (!RoomConfig.useFirebase) {
      this.moveCardsWithoutHistory({ from, to, cards, player, prepend, index })
    }
  }

  selectDeck(player: player, deck: Deck) {
    deck.cards.forEach(c => c.faceDown = true)
    // fromのカードは存在しなくても良いため、仮にyamafudaCardsにしている。
    this.moveCards({
      from: 'yamafudaCards',
      to: 'yamafudaCards',
      cards: deck.cards,
      player,
    })
    this.moveCards({
      from: 'yamafudaCards',
      to: 'shieldCards',
      cards: deck.cards.slice(-5),
      player,
    })
    this.moveCards({
      from: 'yamafudaCards',
      to: 'tefudaCards',
      cards: deck.cards.slice(-10, -5).map(c => {
        c.faceDown = false
        return c
      }),
      player,
    })
    if (deck.chojigenCards.length > 0) {
      this.moveCards({
        from: 'chojigenCards',
        to: 'chojigenCards',
        cards: deck.chojigenCards,
        player,
      })
      this.players[player].hasChojigen = true
    }
  }

  moveCardsWithoutHistory({ from, to, cards, player, prepend, index }: moveCardsParams) {
    const cardsCopy = JSON.parse(JSON.stringify(cards)) as Card[]
    const card = cardsCopy[0];
    // 手札、マナ、墓地へ行く場合は表向きにする。
    if (
      ['tefudaCards', 'manaCards', 'bochiCards'].includes(to) &&
      to !== from
    ) {
      cardsCopy.forEach((c) => {
        c.faceDown = false
      })
    }
    // 山札へ行くときは裏向きにする。
    if (['yamafudaCards'].includes(to) && to !== from) {
      cardsCopy.forEach((c) => {
        c.faceDown = true
      })
    }
    // 違うゾーンへ移動するときはタップとマークを解除する。
    if (to !== from) {
      cardsCopy.forEach((c) => {
        c.markColor = ''
        c.tapped = false
      })
    }
    this.players[player]['cards'][from] = Util.arrayRemoveCards(
      this.players[player]['cards'][from],
      cardsCopy
    );
    if (index !== undefined && cardsCopy.length === 1) {
      if (index === 0) {
        this.players[player]['cards'][to].unshift(card)
      } else {
        this.players[player]['cards'][to].splice(index, 0, card)
      }
      return
    }
    if (prepend) {
      this.players[player]['cards'][to] = Util.arrayPrependCards(
        this.players[player]['cards'][to],
        cardsCopy
      )
    } else {
      this.players[player]['cards'][to] = Util.arrayAppendCards(
        this.players[player]['cards'][to],
        cardsCopy
      )
    }
  }
  
  undoMoveCards({ from, to, cards, player }: moveCardsParams) {
    const cardsCopy = JSON.parse(JSON.stringify(cards)) as Card[]
    if (cards.length === 1) {
      this.moveCardsWithoutHistory({ from: to, to: from, cards: cardsCopy, player, index: cards[0].index })
    } else {
      this.moveCardsWithoutHistory({ from: to, to: from, cards: cardsCopy, player, prepend: false })
    }
    this.undoCardsState({ from, cards: cardsCopy, player })
  }
  
  changeCardsState({ from, cards, player, cardState }: changeCardsStateParams) {
    this.gameLogger?.changeCardsState({ from, cards, player, cardState })
    if (!RoomConfig.useFirebase) {
      this.changeCardsStateWithoutHistory({ from, cards, player, cardState })
    }
  }

  changeCardsStateWithoutHistory({ from, cards, player, cardState }: changeCardsStateParams) {
    const cardIds = cards.map((c) => c.id);
    this.players[player]["cards"][from].forEach((c: Card) => {
      if (!cardIds.includes(c.id)) return;
      if (cardState?.tapped !== undefined) {
        c.tapped = cardState.tapped
      }
      if (cardState?.faceDown !== undefined) {
        c.faceDown = cardState.faceDown
      }
      if (cardState?.markColor !== undefined) {
        c.markColor = cardState.markColor
      }
    });
  }

  undoCardsState({ from, cards, player }: changeCardsStateParams) {
    const cardIds = cards.map((c) => c.id);
    this.players[player]["cards"][from].forEach((c: Card) => {
      if (!cardIds.includes(c.id)) return;
      for (const card of cards) {
        if (card.id === c.id) {
          c.tapped = card.tapped
          c.faceDown = card.faceDown
          c.markColor = card.markColor
          break
        }
      }
    });
  }

  groupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    // カードにインデックスを付与する
    this.players[player].cards[from].forEach((card, index) => {
      card.index = index
    })
    this.gameLogger?.groupCard({ from, to, fromCard, toCard, player })
    if (!RoomConfig.useFirebase) {
      this.groupCardWithoutHistory({ from, to, fromCard, toCard, player })
    }
  }

  groupCardWithoutHistory({ from, to, fromCard, toCard, player }: groupCardParams) {
    /**
     * fromCardが単独でもグループでも、上になるようにする
     */
    if (from !== to) {
      this.moveCardsWithoutHistory({ from, to, cards: [fromCard], player, prepend: false })
    }
    // NOTE: redoのときはポインタが外れているため対象のカードをIDで探す
    const toCards: Card[] = this.players[player]["cards"][to]
    const fromCards: Card[] = this.players[player]["cards"][from]
    const toCardRef = toCards.find(c => c.id === toCard.id) as Card
    const fromCardRef = toCards.find(c => c.id === fromCard.id) as Card

    // TODO: 両方がグループの場合はひとまずスルーする
    if (fromCardRef.groupId && toCardRef.groupId) return

    // グループを単独カードに重ねる場合、単独カードを下に
    if (fromCardRef.groupId && !toCardRef.groupId) {
      if (from === to && to === 'battleCards') {
        toCardRef.groupId = fromCardRef.groupId
        getCardGroup(fromCards, fromCardRef.groupId).cards.forEach(c => {
          Util.arrayInsertBefore(this.players[player]['cards'][to], toCardRef, c);
        })
      }
      return
    }
    // 単独カードをグループに重ねる場合、単独カードを上に
    if (toCardRef.groupId && !fromCardRef.groupId) {
      fromCardRef.groupId = toCardRef.groupId
      Util.arrayInsertBefore(this.players[player]['cards'][to], toCardRef, fromCardRef);
      // 状態を引き継ぐ
      fromCardRef.tapped = toCardRef.tapped
      return
    }
    // 両方単独カードの場合
    if (!toCardRef.groupId && !fromCardRef.groupId) {
      const groupId = `${fromCard.id}-${toCard.id}`;
      console.debug(`created group '${groupId}'`)
      fromCardRef.groupId = groupId
      toCardRef.groupId = groupId
      // 状態を引き継ぐ
      fromCardRef.tapped = toCardRef.tapped
      Util.arrayInsertBefore(toCards, toCardRef, fromCardRef);
      return;
    }
  }

  undoGroupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    let cardsInGroup = 0
    const cards: Card[] = this.players[player]["cards"][to]
    const groupId = cards.find(c => c.id === fromCard.id)?.groupId as string
    if (fromCard.groupId) {
      if (from === to && to === 'battleCards') {
        // TODO: 順番の変更を元に戻す関数に一本化する
        getCardGroup(cards, fromCard.groupId).cards.forEach(c => {
          if (c.id === toCard.id) return true
          this.undoMoveCards({ from, to, cards: [c], player })
        })
      }
    } else {
      this.undoMoveCards({ from, to, cards: [fromCard], player })
    }
    cards.forEach((c: Card) => {
      if (c.groupId === groupId) {
        cardsInGroup += 1
      }
      if (c.id === fromCard.id) {
        c.groupId = fromCard.groupId
      }
      if (c.id === toCard.id) {
        c.groupId = toCard.groupId
      }
    })
    // カードが一枚だけのグループは消す。
    if (cardsInGroup <= 2) {
      console.debug(`deleted group '${groupId}'`)
      cards.forEach(c => c.id === toCard.id ? c.groupId = null : null)
    }
  }

  ungroupCard({ card, player, zone }: {
    card: Card,
    player: player,
    zone: zone,
  }) {
    const cards: Card[] = this.players[player]["cards"][zone]
    const groupId = card.groupId
    card.groupId = ''
    const cardsInGroup = cards.filter(c => c.groupId === groupId).length
    // カードが一枚だけのグループは消す。
    if (cardsInGroup <= 2) {
      cards.map(c => c.groupId === groupId ? c.groupId = '' : null)
    }
  }
}
import { Card, CardGroup, cardState } from "@@/core/entities/card";
import { GroupableZoneType, ZoneType } from "@@/core/entities/zones";
import { PlayerType } from "@@/core/entities/player";
import { Deck } from "@@/core/entities/Deck";
import { GameLogger } from "./GameLogger";
import { RoomConfig } from "@/helpers/room";
import { cardData } from "@@/core/entities/CardData";
import { Game } from "../entities/game";
import { getCardAbility } from "../services/card.service";
import { startTurnParams } from "./TurnActions";

export type cardActionMethodParams = moveCardsParams | changeCardsStateParams | groupCardParams | putUnderCardParams | startTurnParams | startAttackingParams

export interface moveCardsParams {
  from: ZoneType
  to: ZoneType
  cards: readonly Card[]
  player: PlayerType
  prepend?: boolean
  index?: number
}

export interface changeCardsStateParams {
  from: ZoneType,
  cards: Card[],
  player: PlayerType,
  cardState?: cardState,
}

export interface startAttackingParams {
  card: Card,
  player: PlayerType,
}

export interface groupCardParams {
  from: ZoneType,
  to: GroupableZoneType,
  fromCard: Card,
  toCard: Card,
  player: PlayerType,
}

export interface putUnderCardParams {
  from: ZoneType,
  to: GroupableZoneType
  fromCard: Card,
  toCard: Card,
  player: PlayerType,
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
   * @param game reactive
   */
  constructor(
    public roomId: string,
    public game: Game
  ) {}

  setGameLogger(gameLogger: GameLogger) {
    this.gameLogger = gameLogger
  }

  static setupForPlayer(deck: Deck) {
    // TODO: 修正、使用されているのはテストのみ
    // return {
    //   manaCards: [],
    //   battleCards: [],
    //   bochiCards: [],
    //   shieldCards: deck.cards.slice(0, 5).map(c => {
    //     c.faceDown = true
    //     return c
    //   }),
    //   tefudaCards: deck.cards.slice(5, 10),
    //   yamafudaCards: deck.cards.slice(10).map(c => {
    //     c.faceDown = true
    //     return c
    //   }),
    //   chojigenCards: deck.chojigenCards,
    // }
  }

  moveCards({ from, to, cards, player, prepend, index }: moveCardsParams) {
    if (!cards || cards.length === 0) return;
    // カードにインデックスを付与する
    this.game.players[player].getZone(from).cards.forEach((card, index) => {
      card.index = index
    })
    const card = cards[0];
    if (card.groupId && cards.length === 1) {
      // 先頭のカードがグループに属していた場合、そのグループから抜ける。
      // NOTE: グループの中で一番最後のカードがベースとなる
      const toCard = this.game.players[player].getZone(from).cards.filter(c => c.groupId === card.groupId
        && c.id !== card.id).slice(-1)[0]
      const fromCard = {
        ...card,
        groupId: null,
        index: prepend ? 0 : this.game.players[player].getZone(to).cards.length,
      }
      this.gameLogger?.undoGroupCard({
        from: to as GroupableZoneType,
        to: from as GroupableZoneType,
        fromCard,
        toCard,
        player,
      })
      if (!RoomConfig.useFirebase) {
        this.undoGroupCard({
          from: to as GroupableZoneType,
          to: from as GroupableZoneType,
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

  /**
   * 攻撃中のカードの入れ替え（Jチェンジ、革命チェンジ）
   */
  changeAttackingCard({ from, card, player, attackingCard }: {
    from: ZoneType
    card: Card
    player: PlayerType
    attackingCard: Card
  }) {
    const attackingCardIndex = this.game.players[player].battleZone.cards.findIndex(c => c.id === attackingCard.id)
    const fromCardIndex = this.game.players[player].getZone(from).cards.findIndex(c => c.id === card.id)
    // 攻撃中のカードを先に移動させる。
    this.moveCards({
      from: 'battleZone',
      to: from,
      cards: [ attackingCard ],
      player,
      index: fromCardIndex
    })
    // this.game.players[player].attackingCard = card
    this.moveCards({
      from,
      to: 'battleZone',
      cards: [ card ],
      player,
      index: attackingCardIndex
    })
    this.startAttacking({
      card,
      player,
    })
  }

  selectDeck(player: PlayerType, deck: Deck) {
    deck.cards.forEach(c => c.faceDown = true)
    // fromのカードは存在しなくても良いため、仮にyamafudaCardsにしている。
    this.moveCards({
      from: 'yamafudaZone',
      to: 'yamafudaZone',
      cards: deck.cards,
      player,
    })
    this.moveCards({
      from: 'yamafudaZone',
      to: 'shieldZone',
      cards: deck.cards.slice(-5),
      player,
    })
    this.moveCards({
      from: 'yamafudaZone',
      to: 'tefudaZone',
      cards: deck.cards.slice(-10, -5).map(c => {
        c.faceDown = false
        return c
      }),
      player,
    })
    if (deck.chojigenCards.length > 0) {
      this.moveCards({
        from: 'chojigenZone',
        to: 'chojigenZone',
        cards: deck.chojigenCards,
        player,
      })
    }
  }

  moveCardsWithoutHistory({ from, to, cards, player, prepend, index }: moveCardsParams) {
    const cardsCopy = JSON.parse(JSON.stringify(cards)) as Card[]
    const card = cardsCopy[0];
    // 手札、マナ、墓地へ行く場合は表向きにする。
    if (
      ['tefudaZone', 'manaZone', 'bochiZone'].includes(to) &&
      to !== from
    ) {
      cardsCopy.forEach((c) => {
        c.faceDown = false
      })
    }
    // 山札へ行くときは裏向きにする。
    if (['yamafudaZone'].includes(to) && to !== from) {
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
    // 多色カードはタップしてマナに置く
    if (to === 'manaZone') {
      cardsCopy.forEach(c => {
        if (cardData(c).isRainbow()) {
          c.tapped = true
        }
      })
    }
    // カードごとの効果を適用
    cardsCopy.forEach(c => {
      if (!cardData(card) || !cardData(card).cardDetail) return;
      const ability = getCardAbility(cardData(card).cardDetail.name)
      if (ability) {
        if (to === 'battleZone') {
          if (ability.onMovingToBattleZone) {
            ability.onMovingToBattleZone({
              card: c,
              group: null,
              player: this.game.players[player],
              opponent: this.game.players[player === 'a' ? 'b' : 'a'],
            })
          }
        }
      }
    })
    // カードをゾーンから取り除く
    cards.forEach(c => {
      this.game.players[player].getZone(from).remove(c)
    })

    if (index !== undefined && cardsCopy.length === 1) {
      this.game.players[player].getZone(to).insertAt(card, index)
      return
    }
    if (prepend) {
      cardsCopy.reverse().forEach(c => {
        this.game.players[player].getZone(to).insertAt(c, 0)
      })
    } else {
      cardsCopy.forEach(c => {
        this.game.players[player].getZone(to).pushCard(c)
      })
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
    const zoneCards = this.game.players[player].getZone(from).cards;
    zoneCards.forEach((c: Card) => {
      if (!cardIds.includes(c.id)) return;
      if (cardState?.tapped !== undefined) {
        c.tapped = cardState.tapped
        // カードごとの効果を適用
        if (cardData(c) && cardData(c).cardDetail) {
          const ability = getCardAbility(cardData(c).cardDetail.name)
          if (ability) {
            if (ability.onTapStateChanging) {
              ability.onTapStateChanging({
                card: c,
                group: c.groupId ? getCardGroup(zoneCards, c.groupId) : null,
                player: this.game.players[player],
                opponent: this.game.players[player === 'a' ? 'b' : 'a'],
              })
            }
          }
        }
      }
      if (cardState?.faceDown !== undefined) {
        c.faceDown = cardState.faceDown
      }
      if (cardState?.markColor !== undefined) {
        c.markColor = cardState.markColor
      }
    });
  }

  startAttacking({ card, player }: startAttackingParams) {
    this.gameLogger?.startAttacking({ card, player })
    if (!RoomConfig.useFirebase) {
      this.startAttackingWithoutHistory({ card, player })
    }
  }

  startAttackingWithoutHistory({ card, player }: startAttackingParams) {
    const from: ZoneType = 'battleZone';
    const zoneCards = this.game.players[player].getZone(from).cards;
    zoneCards.forEach((c: Card) => {
      if (c.id !== card.id) return;
      c.tapped = true // カードをタップ
      this.game.players[player].attackingCard = c; // 攻撃中のカードを設定
      // カードごとの効果を適用
      if (cardData(c) && cardData(c).cardDetail) {
        const ability = getCardAbility(cardData(c).cardDetail.name)
        if (ability) {
          if (ability.onTapStateChanging) {
            ability.onTapStateChanging({
              card: c,
              group: c.groupId ? getCardGroup(zoneCards, c.groupId) : null,
              player: this.game.players[player],
              opponent: this.game.players[player === 'a' ? 'b' : 'a'],
            })
          }
          if (ability.onAttacking) {
            ability.onAttacking({
              card: c,
              group: c.groupId ? getCardGroup(zoneCards, c.groupId) : null,
              player: this.game.players[player],
              opponent: this.game.players[player === 'a' ? 'b' : 'a'],
            })
          }
        }
      }
    });
  }

  undoCardsState({ from, cards, player }: changeCardsStateParams) {
    const cardIds = cards.map((c) => c.id);
    this.game.players[player].getZone(from).cards.forEach((c: Card) => {
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

  undoStartAttacking({ card, player }: startAttackingParams) {
    // 前の攻撃中のカードにではなく、nullにすることで何か不具合があるかも
    this.game.players[player].attackingCard = null;
    this.undoCardsState({
      from: 'battleZone',
      cards: [ card ],
      player,
    })
  }

  groupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    // カードにインデックスを付与する
    this.game.players[player].getZone(from).cards.forEach((card, index) => {
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
    const toCards: Card[] = this.game.players[player].getZone(to).cards
    const fromCards: Card[] = this.game.players[player].getZone(from).cards
    const toCardRef = toCards.find(c => c.id === toCard.id) as Card
    const fromCardRef = toCards.find(c => c.id === fromCard.id) as Card

    // TODO: 両方がグループの場合はひとまずスルーする
    if (fromCardRef.groupId && toCardRef.groupId) return

    // グループを単独カードに重ねる場合、単独カードを下に
    if (fromCardRef.groupId && !toCardRef.groupId) {
      if (from === to && to === 'battleZone') {
        getCardGroup(fromCards, fromCardRef.groupId).cards.forEach(c => {
          this.game.players[player].getZone(to).insertBefore(c, toCardRef)
        })
        toCardRef.groupId = fromCardRef.groupId
      }
      return
    }
    // 単独カードをグループに重ねる場合、単独カードを上に
    if (toCardRef.groupId && !fromCardRef.groupId) {
      fromCardRef.groupId = toCardRef.groupId
      this.game.players[player].getZone(to).insertBefore(fromCardRef, toCardRef)
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
      if (fromCardRef.tapped !== toCardRef.tapped) {
        this.changeCardsStateWithoutHistory({
          from: to,
          cards: toCards,
          player,
          cardState: {
            tapped: toCardRef.tapped,
          }
        })
      }
      this.game.players[player].getZone(to).insertBefore(fromCardRef, toCardRef)
      return;
    }
  }

  undoGroupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    let cardsInGroup = 0
    const cards: Card[] = this.game.players[player].getZone(to).cards
    const groupId = cards.find(c => c.id === fromCard.id)?.groupId as string
    if (fromCard.groupId) {
      if (from === to && to === 'battleZone') {
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
    player: PlayerType,
    zone: ZoneType,
  }) {
    const cards: Card[] = this.game.players[player].getZone(zone).cards
    const groupId = card.groupId
    card.groupId = ''
    const cardsInGroup = cards.filter(c => c.groupId === groupId).length
    // カードが一枚だけのグループは消す。
    if (cardsInGroup <= 2) {
      cards.map(c => c.groupId === groupId ? c.groupId = '' : null)
    }
  }

  putUnderCard({ from, to, fromCard, toCard, player }: putUnderCardParams) {
    // カードにインデックスを付与する
    this.game.players[player].getZone(from).cards.forEach((card, index) => {
      card.index = index
    })
    this.gameLogger?.putUnderCard({ from, to, fromCard, toCard, player })
    if (!RoomConfig.useFirebase) {
      this.putUnderCardWithoutHistory({ from, to, fromCard, toCard, player })
    }
  }

  /**
   * カードをすでにあるカードの下に置く
   * 
   * @returns 
   */
  putUnderCardWithoutHistory({ from, to, fromCard, toCard, player }: putUnderCardParams) {
    // NOTE: redoのときはポインタが外れているため対象のカードをIDで探す
    const fromCards: Card[] = this.game.players[player].getZone(from).cards
    const toCards: Card[] = this.game.players[player].getZone(to).cards
    const toCardRef = toCards.find(c => c.id === toCard.id) as Card
    const fromCardRef = fromCards.find(c => c.id === fromCard.id) as Card

    // 移動するカードを削除する
    this.game.players[player].getZone(from).remove(fromCard)

    // 上になるカードがまだ単独のカードの場合
    if (!toCardRef.groupId) {
      const groupId = `${fromCard.id}-${toCard.id}`;
      console.debug(`created group '${groupId}'`)
      fromCardRef.groupId = groupId
      toCardRef.groupId = groupId
      this.game.players[player].getZone(to).insertAfter(fromCardRef, toCardRef)
      return;
    }

    // 上になるカードがすでにグループの場合
    if (toCardRef.groupId) {
      const lastCard = getCardGroup(toCards, toCardRef.groupId).cards.slice(-1)[0]
      this.game.players[player].getZone(to).insertAfter(fromCardRef, lastCard)
      fromCardRef.groupId = toCardRef.groupId
      return
    }
  }

  undoPutUnderCard({ from, to, fromCard, toCard, player }: putUnderCardParams) {
    this.undoMoveCards({ from, to, cards: [fromCard], player })
  }
}
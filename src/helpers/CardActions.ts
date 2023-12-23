import { zone, player, cardState, groupableZone } from "@/entities";
import { Util } from "./Util";
import { Card } from "@/entities/Card";

export interface moveCardsParams {
  from: zone
  to: zone
  cards: Card[]
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

export class CardActions {

  /**
   * @param players reactive
   */
  constructor(
    public players: any
  ) {}

  moveCards({ from, to, cards, player, prepend, index }: moveCardsParams) {
    if (!cards || cards.length === 0) return;
    // 先頭のカードがグループに属していた場合、そのグループから抜ける。
    const card = cards[0];
    if (card.groupId) {
      this.ungroupCard({
        zone: from,
        card,
        player,
      });
    }
    // 手札、マナ、墓地へ行く場合は表向きにする。
    if (
      ['tefudaCards', 'manaCards', 'bochiCards'].includes(to) &&
      to !== from
    ) {
      cards.forEach((card) => {
        card.faceDown = false;
      });
    }
    // 山札へ行くときは裏向きにする。
    if (['yamafudaCards'].includes(to) && to !== from) {
      cards.forEach((card) => {
        card.faceDown = true;
      });
    }
    // 違うゾーンへ移動するときはタップとマークを解除する。
    if (to !== from) {
      cards.forEach((card) => {
        card.markColor = '';
        card.tapped = false;
      });
    }
    this.players[player]['cards'][from] = Util.arrayRemoveCards(
      this.players[player]['cards'][from],
      cards
    );
    if (index !== undefined && cards.length === 1) {
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
        cards
      );
    } else {
      this.players[player]['cards'][to] = Util.arrayAppendCards(
        this.players[player]['cards'][to],
        cards
      );
    }
  }
  
  undoMoveCards({ from, to, cards, player }: moveCardsParams) {
    const cardsCopy = JSON.parse(JSON.stringify(cards)) as Card[]
    if (cards.length === 1) {
      console.log({ from, cardsCopy, player })
      this.moveCards({ from: to, to: from, cards, player, index: cards[0].index })
    } else {
      this.moveCards({ from: to, to: from, cards, player, prepend: false })
    }
    this.undoCardsState({ from, cards: cardsCopy, player })
  }

  changeCardsState({ from, cards, player, cardState }: changeCardsStateParams) {
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
    if (from !== to) {
      this.moveCards({ from, to, cards: [fromCard], player, prepend: false })
    }
    // NOTE: redoのときはポインタが外れているため対象のカードをIDで探す
    const toCards: Card[] = this.players[player]["cards"][to]
    const toCardRef = toCards.find(c => c.id === toCard.id) as Card
    const fromCards: Card[] = this.players[player]["cards"][to]
    const fromCardRef = fromCards.find(c => c.id === fromCard.id) as Card
    if (toCardRef.groupId) {
      fromCardRef.groupId = toCardRef.groupId
    } else {
      const groupId = `${toCard.id}-${fromCard.id}`;
      console.debug(`created group '${groupId}'`)
      fromCardRef.groupId = groupId
      toCardRef.groupId = groupId
    }
    // fromCardをtoCardの前に移す。
    Util.arrayInsertBefore(this.players[player]['cards'][to], toCard, fromCard);
  }

  undoGroupCard({ from, to, fromCard, toCard, player }: groupCardParams) {
    let cardsInGroup = 0
    const cards: Card[] = this.players[player]["cards"][to]
    const groupId = cards.find(c => c.id === fromCard.id)?.groupId as string
    cards.forEach((c: Card) => {
      if (c.groupId === groupId) {
        cardsInGroup += 1
      }
      if (c.id === fromCard.id) {
        c.groupId = fromCard.groupId
      }
    })
    // fromCardを見つけてもとの位置に戻す
    // カードが一枚だけのグループは消す。
    if (cardsInGroup <= 2) {
      cards.map(c => c.id === toCard.id ? c.groupId = toCard.groupId : null)
    }
    if (from !== to) {
      this.undoMoveCards({ from, to, cards: [fromCard], player })
    } else {
      // TODO: 順番をもとに戻す
    }
  }

  ungroupCard({ card, player, zone }: {
    card: Card,
    player: player,
    zone: zone,
  }) {
    let cardsInGroup = 0
    const cards: Card[] = this.players[player]["cards"][zone]
    const groupId = card.groupId
    cards.forEach((c: Card) => {
      if (c.groupId === groupId) {
        cardsInGroup += 1
      }
    })
    // カードが一枚だけのグループは消す。
    if (cardsInGroup <= 2) {
      cards.map(c => c.groupId === groupId ? c.groupId = '' : null)
    }
  }
}
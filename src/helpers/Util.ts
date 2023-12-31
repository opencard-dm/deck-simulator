import { Card } from "@/entities/Card";

export function isPc() {
  return window.innerWidth >= 800
}
export function isPhone() {
  return window.innerWidth < 800
}

export class Util {

  static arrayRemoveCards(array: readonly Card[], cards: readonly Card[]) {
    let result = array;
    for (let card of cards) {
      result = result.filter((elem) => {
        return elem.id !== card.id;
      })
    }
    return result as Card[];
  }

  static arrayAppendCards(array: readonly Card[], cards: readonly Card[]) {
    return array.concat(cards)
  }

  static arrayPrependCards(array: readonly Card[], cards: readonly Card[]) {
    return cards.concat(array)
  }

  static arrayInsertBefore(array: Card[], targetCard: Card, card: Card) {
    const targetIndex = array.findIndex(c => c.id === targetCard.id)
    // 削除してから挿入しないと一時的にidがかぶる状態ができてしまう。
    array.splice(
      array.findIndex(c => c.id === card.id),
      1
    )
    array.splice(
      targetIndex,
      0,
      card
    )
    return array
  }
}

export function getCloudRunCookie() {
  const cookie = document.cookie;
  let target = "";
  if (cookie) {
    cookie.split(";").forEach((seg) => {
      const trimed = seg.trim();
      if (trimed.startsWith("GAESA=")) {
        target = trimed;
      }
    });
  }
  return target;
}

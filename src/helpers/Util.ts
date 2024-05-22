import { Card } from "@@/core/entities/card";

export function isPc() {
  return window.innerWidth >= 800
}
export function isPhone() {
  return window.innerWidth < 800
}

export class Util {

  static arrayRemoveCards(array: readonly Card[], cards: readonly Card[]) {
    let result = array;
    for (const card of cards) {
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
    // 削除してから挿入しないと一時的にidがかぶる状態ができてしまう。
    array.splice(
      array.findIndex(c => c.id === card.id),
      1
    )
    const targetIndex = array.findIndex(c => c.id === targetCard.id)
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

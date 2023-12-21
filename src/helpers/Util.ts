
export function isPc() {
  return window.innerWidth >= 800
}
export function isPhone() {
  return window.innerWidth < 800
}

export class Util {

  static arrayRemoveCards(array, cards) {
    let result = array;
    for (let card of cards) {
      result = result.filter((elem) => {
        return elem.id !== card.id;
      })
    }
    return result;
  }

  static arrayAppendCards(array, cards) {
    let result = array;
    cards = cards.map((c) => {
      c.selected = false;
      return c;
    })
    return result.concat(cards);
  }

  static arrayPrependCards(array, cards) {
    cards = cards.map((c) => {
      c.selected = false;
      return c;
    })
    return cards.concat(array);
  }

  static arrayInsertBefore(array, targetCard, card) {
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

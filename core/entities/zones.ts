import { Card } from "@/entities/Card"

export type ZoneType = 'tefudaZone' 
  | 'shieldZone'
  | 'battleZone'
  | 'chojigenZone'
  | 'yamafudaZone'
  | 'manaZone'
  | 'bochiZone'

export class Zone {

  private constructor(
    public cards: Card[]
  ) {

  }

  static init() {
    return new Zone([])
  }

  static fromData(data: {
    cards: Card[]
  }) {
    const self = new Zone(data.cards)
    return self
  }

  remove(card: Card) {
    this.cards = this.cards.filter(c => c.id !== card.id)
  }

  insertAt(card: Card, index: number) {
    this.cards.splice(index, 0, card)
  }

  insertBefore(card: Card, before: Card) {
    this.remove(card)
    const index = this.cards.findIndex(c => c.id === before.id)
    this.cards.splice(index, 0, card)
  }

  insertAfter(card: Card, after: Card) {
    this.remove(card)
    const index = this.cards.findIndex(c => c.id === after.id) + 1
    this.cards.splice(index, 0, card)
  }

  pushCard(card: Card) {
    this.cards.push(card)
  }
}

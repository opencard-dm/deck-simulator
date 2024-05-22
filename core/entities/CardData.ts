import { Card } from "@@/core/entities/card";
import { CardDetail } from "@@/core/entities/Deck";
import { useRoomStore } from "@/stores/room";

const cardDataStore: {[key: string]: CardData} = {}

export function cardData(card: Card) {
  if (card.cd in cardDataStore) {
    return cardDataStore[card.cd]
  }
  const roomStore = useRoomStore()
  const cardDetail = roomStore.cardDetails[card.cd]
  return new CardData(cardDetail)
}

class CardData {

  cardDetail: CardDetail

  constructor(cardDetail: CardDetail) {
    this.cardDetail = cardDetail
  }
  
  get name() {
    return this.cardDetail.name
  }

  get types() {
    return this.cardDetail.types
  }

  get power() {
    return this.cardDetail.power
  }

  get power_int() {
    return this.cardDetail.power_int
  }

  get cost() {
    return this.cardDetail.cost
  }

  get civilizations() {
    return this.cardDetail.civilizations
  }

  get races() {
    return this.cardDetail.races
  }

  get card_text() {
    return this.cardDetail.card_text
  }

  get combined_card() {
    return this.cardDetail.combined_card
  }

  isRainbow() {
    const civilizations = [...this.civilizations]
    if (this.types.includes('ツインパクト') && this.combined_card) {
      this.combined_card.civilizations.forEach(c => {
        if (!civilizations.includes(c)) {
          civilizations.push(c)
        }
      })
    }
    if (civilizations.length >= 2) {
      return true
    }
    return false
  }

  hasMekuraidAbility(): boolean {
    if (this.card_text.includes('メクレイド')) {
      return true
    }
    if (this.types.includes('ツインパクト') && this.combined_card) {
      if (this.combined_card.card_text.includes('メクレイド')) {
        return true
      }
    }
    return false
  }
}
